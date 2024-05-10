import { Parser, Store, Term } from "n3";
import jsonld from "jsonld";
import { QueryEngine } from "@comunica/query-sparql-rdfjs";
import rdfext from "rdf-ext";
import { entries, isEmpty } from "lodash-es";

const comunicaEngine = new QueryEngine();
export async function sparql(graph: Store, query: string) {
  const bindingsStream = await comunicaEngine.queryBindings(query, {
    sources: [graph],
  });
  return await bindingsStream.toArray();
}

export const ns = {
  rdf: rdfext.namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  rdfs: rdfext.namespace("http://www.w3.org/2000/01/rdf-schema#"),
  owl: rdfext.namespace("http://www.w3.org/2002/07/owl#"),
  sh: rdfext.namespace("http://www.w3.org/ns/shacl#"),
  xsd: rdfext.namespace("http://www.w3.org/2001/XMLSchema#"),
};

export function getSpdxNs(graph: Store) {
  return graph?.getSubjects(ns.rdf.type, ns.owl.Ontology)[0]?.id;
}

export async function createGraph(source: string | File) {
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

export function createModel(graph: Store) {
  if (!graph) return {};
  const model = {};
  const iris = {
    ...addToModel(model, getClasses(graph), "classes"),
    ...addToModel(model, getDatatypeProperties(graph), "properties"),
    ...addToModel(model, getObjectProperties(graph), "properties"),
    ...addToModel(model, getVocabularies(graph), "vocabularies"),
    ...addToModel(model, getIndividuals(graph), "individuals"),
  };
  enrichModelFromMarkdown(model, "model.json");
  return [model, iris];
}

export function getInheritedConstraints(
  classes: object,
  iri: string,
): object[] {
  if (!iri) {
    return [];
  }
  const cls = classes[iri];
  const c = {
    iri: cls.iri,
    name: cls.name,
    constraints: cls.constraints,
  };
  return [c, ...getInheritedConstraints(classes, cls.subClassOf)];
}

function addToModel(model, items: [], section: string) {
  const iris = {};
  items.forEach((o: object) => {
    ((model[o.profile] ??= {})[section] ??= {})[o.name] = o;
    iris[o.iri] = o;
  });
  return iris;
}

const sharedFields = (s: Term, graph: Store) => {
  const a = s.value.split("/");
  return {
    iri: s.value,
    name: a.pop(),
    profile: a.pop(),
    summary: graph.getObjects(s, ns.rdfs.comment)[0]?.value,
  };
};

const getClasses = (graph: Store) =>
  graph
    .getSubjects(ns.rdf.type, ns.owl.Class)
    .filter((s) => !graph.countQuads(null, ns.rdf.type, s))
    .map((s) => ({
      ...sharedFields(s, graph),
      subClassOf: graph.getObjects(s.value, ns.rdfs.subClassOf)[0]?.value,
      properties: extractNodeShape(graph, s.value),
    }));

const getVocabularies = (graph: Store) =>
  graph
    .getSubjects(ns.rdf.type, ns.owl.Class)
    .filter((s) => graph.countQuads(null, ns.rdf.type, s))
    .map((s) => ({
      ...sharedFields(s, graph),
      entries: Object.assign(
        {},
        ...graph.getSubjects(ns.rdf.type, s.value).map((o) => {
          const name = o.value.split("/").pop();
          return {
            [name]: {
              iri: o.value,
              name,
              summary: graph.getObjects(o.value, ns.rdfs.comment)[0]?.value,
            },
          };
        }),
      ),
    }));

const getDatatypeProperties = (graph: Store) =>
  graph.getSubjects(ns.rdf.type, ns.owl.DatatypeProperty).map((s) => ({
    ...sharedFields(s, graph),
    datatype: graph
      .getObjects(s.value, ns.rdfs.range)[0]
      .value.split("#")
      .pop(),
  }));

const getObjectProperties = (graph: Store) =>
  graph.getSubjects(ns.rdf.type, ns.owl.ObjectProperty).map((s) => ({
    ...sharedFields(s, graph),
    range: graph.getObjects(s.value, ns.rdfs.range)[0]?.value,
  }));

const getIndividuals = (graph: Store) =>
  graph
    .getSubjects(ns.rdf.type, ns.owl.NamedIndividual)
    .filter((s) => graph.countQuads(s, ns.rdfs.range, null))
    .map((s) => ({
      ...sharedFields(s, graph),
      range: graph.getObjects(s.value, ns.rdfs.range)[0]?.value,
    }));

function extractNodeShape(graph: Store, node: Term) {
  const len = ns.sh().value.length;
  const properties = {};
  const propertyShapes = graph.getObjects(node, ns.sh.property);
  for (const pshape of propertyShapes) {
    const constraint = {};
    for (const c of graph.getQuads(pshape)) {
      const k = c.predicate.value.slice(len);
      if (k === "path" || k.endsWith("Count")) {
        constraint[k] = c.object.value;
      }
    }
    const name = constraint.path.split("/").pop();
    properties[name] = constraint;
  }
  return properties;
}

async function enrichModelFromMarkdown(model: object, source: string) {
  // const namespaces = await (await fetch(source)).json().namespaces;
  fetch(source)
    .then((response) => response.json())
    .then((namespaces) => {
      for (const namespace of namespaces) {
        const profile = namespace.name;
        if (!model[profile]) continue;
        model[profile].iri = namespace.iri;
        model[profile].summary = namespace.summary;
        model[profile].description = namespace.description;
        for (const section of [
          "classes",
          "properties",
          "vocabularies",
          "individuals",
        ]) {
          for (const [k, v] of _.entries(namespace[section])) {
            if (v.name === "spdxId") continue;
            model[profile][section][v.name].description = v.description;
            if (section === "classes") {
              model[profile][section][v.name].abstract =
                v.metadata.Instantiability === "Abstract";
            }
          }
        }
      }
    });
}
