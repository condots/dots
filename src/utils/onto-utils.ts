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

export function createModel(graph: Store, spdxNs: string) {
  if (!graph || !spdxNs) {
    return {};
  }
  const classes = addClasses(graph, spdxNs);
  const datatypeProperties = addDatatypeProperties(graph, spdxNs);
  const objectProperties = addObjectProperties(graph, spdxNs);
  const vocabularies = addVocabularies(graph, spdxNs);
  const individuals = addIndividuals(graph, spdxNs);
  const datatypes = addDatatypes(graph, spdxNs);

  const model = {};
  return model;
}

const sharedFields = (s: OTerm, graph: Store, spdxNs: string) => ({
  iri: s.value,
  name: fqname.slice(1).split("/", 2)[1],
  profile: fqname.slice(1).split("/", 2)[0],
  fqname: s.value.slice(spdxNs.length - 1),
  summary: graph.getObjects(s, ns.rdfs.comment)[0]?.value,
});

const addClasses = (graph: Store, spdxNs: string) =>
  graph
    .getSubjects(ns.rdf.type, ns.owl.Class)
    .filter((s) => !graph.countQuads(null, ns.rdf.type, s))
    .map((s) => ({
      ...sharedFields(s, graph, spdxNs),
      subClassOf: graph.getObjects(s.value, ns.rdfs.subClassOf)[0]?.value,
      properties: extractNodeShape(graph, s.value),
    }));

const addVocabularies = (graph: Store, spdxNs: string) =>
  graph
    .getSubjects(ns.rdf.type, ns.owl.Class)
    .filter((s) => graph.countQuads(null, ns.rdf.type, s))
    .map((s) => ({
      ...sharedFields(s, graph, spdxNs),
      entries: graph.getSubjects(ns.rdf.type, iri).map((o) => ({
        iri: o.value,
        name: o.value.slice(iri.length + 1),
        summary: graph.getObjects(o.value, ns.rdfs.comment)[0]?.value,
      })),
    }));

const addDatatypeProperties = (graph: Store, spdxNs: string) =>
  graph.getSubjects(ns.rdf.type, ns.owl.DatatypeProperty).map((s) => ({
    ...sharedFields(s, graph, spdxNs),
    kind: "DatatypeProperty",
    range: graph.getObjects(s.value, ns.rdfs.range)[0]?.value,
  }));

const addObjectProperties = (graph: Store, spdxNs: string) =>
  graph.getSubjects(ns.rdf.type, ns.owl.ObjectProperty).map((s) => ({
    ...sharedFields(s, graph, spdxNs),
    kind: "ObjectProperty",
    range: graph.getObjects(s.value, ns.rdfs.range)[0]?.value,
  }));

const addIndividuals = (graph: Store, spdxNs: string) =>
  graph
    .getSubjects(ns.rdf.type, ns.owl.NamedIndividual)
    .filter((s) => graph.countQuads(s, ns.rdfs.range, null))
    .map((s) => ({
      ...sharedFields(s, graph, spdxNs),
      range: graph.getObjects(s.value, ns.rdfs.range)[0]?.value,
    }));

// export function irisFromSpdxMarkdown() {
//   const iris = {};
//   fetch("/model.json")
//   .then((res) => res.json())
//   .then((markdown) => markdown.namespaces.forEach((ns) => {
//     iris[ns.iri] = {
//       name: ns.name,
//       summary: ns.summary,
//       description: ns.description,
//       iri: ns.iri,
//     }
//     Object.values(ns.classes).forEach((cls) => {
//       const cls = profile.classes[mdCls.name];
//       cls.description = mdCls.description;
//       cls.concrete = mdCls.metadata.Instantiability === "Concrete";
//       const name = `${ns.prefix}:${cls.iri}`;
//       const modelCls = model[ns.prefix][cls.name];
//       modelCls.summary = cls.summary;
//       modelCls.examples = cls.examples;
//     });
//   });
// }

export async function sparql(graph: Store, query: string) {
  const bindingsStream = await comunicaEngine.queryBindings(query, {
    sources: [graph],
  });
  return await bindingsStream.toArray();
}

function shInToList(graph: Store, node: OTerm) {
  const list: string[] = [];
  graph.getObjects(node, ns.rdf.first).forEach((first) => {
    list.push(first.id);
    graph
      .getObjects(node, ns.rdf.rest)
      .forEach((n) => list.push(...shInToList(graph, n)));
  });
  return list;
}

function extractNodeShape(graph: Store, node: OTerm) {
  const len = ns.sh().value.length;
  const constraints = [];
  const propertyShapes = graph.getObjects(node, ns.sh.property);
  for (const pshape of propertyShapes) {
    const constraint = {};
    for (const c of graph.getQuads(pshape)) {
      const k = c.predicate.value.slice(len);
      if (c.object.termType === "BlankNode") {
        constraint[k] = shInToList(graph, c.object);
      } else {
        constraint[k] = c.object.value;
      }
    }
    constraints.push(constraint);
  }
  return constraints;
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
