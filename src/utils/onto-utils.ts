import { Parser, Store, OTerm } from "n3";
import jsonld from "jsonld";
import { QueryEngine } from "@comunica/query-sparql-rdfjs";
import rdfext from "rdf-ext";

const comunicaEngine = new QueryEngine();

export const ns = {
  rdf: rdfext.namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  rdfs: rdfext.namespace("http://www.w3.org/2000/01/rdf-schema#"),
  owl: rdfext.namespace("http://www.w3.org/2002/07/owl#"),
  sh: rdfext.namespace("http://www.w3.org/ns/shacl#"),
  xsd: rdfext.namespace("http://www.w3.org/2001/XMLSchema#"),
};

export function getSpdxNs(model: Store) {
  return model?.getSubjects(ns.rdf.type, ns.owl.Ontology)[0]?.id;
}

export async function loadOntology(source: string | File) {
  const url = source.name ?? source;
  const ext = url.split(".").pop() || "";
  let text: string;
  if (typeof source === "string") {
    text = await (await fetch(source)).text();
  } else if (source instanceof File) {
    text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(source);
    });
  } else {
    throw new Error("Unsupported source type");
  }

  let quads = [];
  if (ext === "ttl") {
    const parser = new Parser();
    quads = parser.parse(text);
  } else if (["jsonld", "json-ld"].includes(ext)) {
    const json = await JSON.parse(text);
    quads = await jsonld.toRDF(json);
  } else {
    throw new Error("Unsupported file extension");
  }
  return new Store(quads);
}

export function getProfiles(model: Store, spdxNs: string) {
  if (!model || !spdxNs) {
    return {};
  }
  const classes = model.getSubjects(ns.rdf.type, ns.owl.Class);
  const iris = {};
  const profiles =
    classes?.reduce((acc, subject) => {
      const iri = subject.value;
      if (!iri.startsWith(spdxNs)) {
        console.warn("not an spdx iri: ", iri);
        return acc;
      }
      const fqname = iri.slice(spdxNs.length - 1);
      const [profile, name] = fqname.slice(1).split("/", 2);
      const subClassOf = model.getObjects(iri, ns.rdfs.subClassOf)[0]?.value;
      const constraints = extractNodeShape(model, iri);
      const summary = model.getObjects(subject, ns.rdfs.comment)[0]?.value;
      const options = model.getSubjects(ns.rdf.type, iri).map((o) => ({
        name: o.value.slice(iri.length + 1),
        iri: o.value,
        summary: model.getObjects(o.value, ns.rdfs.comment)[0]?.value,
        label: model.getObjects(o.value, ns.rdfs.label)[0]?.value,
      }));

      const cls = {
        iri,
        profile,
        name,
        ...(subClassOf && { subClassOf }),
        constraints,
        summary,
        options: options.length ? options : undefined,
      };
      iris[iri] = cls;
      (acc[profile] ??= {})[name] = cls;
      return acc;
    }, {}) || {};

  for (const iri in iris) {
    const cls = iris[iri];
    if (cls.subClassOf) {
      cls.subClassOf = iris[cls.subClassOf];
    }
  }

  return profiles;
}

export async function sparql(model: Store, query: string) {
  const bindingsStream = await comunicaEngine.queryBindings(query, {
    sources: [model],
  });
  return await bindingsStream.toArray();
}

function shInToList(model: Store, node: OTerm) {
  const list: string[] = [];
  model.getObjects(node, ns.rdf.first).forEach((first) => {
    list.push(first.id);
    model
      .getObjects(node, ns.rdf.rest)
      .forEach((n) => list.push(...shInToList(model, n)));
  });
  return list;
}

function extractNodeShape(model: Store, node: OTerm) {
  const len = ns.sh().value.length;
  const constraints = [];
  const propertyShapes = model.getObjects(node, ns.sh.property);
  for (const pshape of propertyShapes) {
    const constraint = {};
    for (const c of model.getQuads(pshape)) {
      const k = c.predicate.value.slice(len);
      if (c.object.termType === "BlankNode") {
        constraint[k] = shInToList(model, c.object);
      } else {
        constraint[k] = c.object.value;
      }
    }
    constraints.push(constraint);
  }
  return constraints;
}
