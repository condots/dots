import { Parser, Store, Term } from "n3";
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

export function createModel(graph: Store) {
  if (!graph) {
    return {};
  }
  const classes = getClasses(graph);
  const datatypeProperties = getDatatypeProperties(graph);
  const objectProperties = getObjectProperties(graph);
  const vocabularies = getVocabularies(graph);
  const individuals = getIndividuals(graph);

  const model = {};
  addToModel(model, classes, "classes");
  addToModel(model, datatypeProperties, "properties");
  addToModel(model, objectProperties, "properties");
  addToModel(model, vocabularies, "vocabularies");
  addToModel(model, individuals, "individuals");

  return model;
}

function getFqname(iri: string, graph: Store) {
  return iri.slice(getSpdxNs(graph).length - 1);
}

function addToModel(model, items: [], type: string) {
  items.forEach((item: object) => {
    model[item.profile] = model[item.profile] || {};
    model[item.profile][type] = model[item.profile][type] || {};
    model[item.profile][type][item.fqname] = item;
  });
}

const sharedFields = (s: Term, graph: Store) => {
  const fqname = getFqname(s.value, graph);
  const [profile, name] = fqname.slice(1).split("/", 2);
  return {
    iri: s.value,
    fqname,
    profile,
    name,
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
      entries: graph.getSubjects(ns.rdf.type, s.value).map((o) => ({
        iri: o.value,
        name: o.value.slice(o.value.length + 1),
        summary: graph.getObjects(o.value, ns.rdfs.comment)[0]?.value,
      })),
    }));

const getDatatypeProperties = (graph: Store) =>
  graph.getSubjects(ns.rdf.type, ns.owl.DatatypeProperty).map((s) => ({
    ...sharedFields(s, graph),
    datatype: graph.getObjects(s.value, ns.rdfs.range)[0]?.value.split("#")[1],
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

export async function sparql(graph: Store, query: string) {
  const bindingsStream = await comunicaEngine.queryBindings(query, {
    sources: [graph],
  });
  return await bindingsStream.toArray();
}

function shInToList(graph: Store, node: Term) {
  const list: string[] = [];
  graph.getObjects(node, ns.rdf.first).forEach((first) => {
    list.push(first.id);
    graph
      .getObjects(node, ns.rdf.rest)
      .forEach((n) => list.push(...shInToList(graph, n)));
  });
  return list;
}

function extractNodeShape(graph: Store, node: Term) {
  const len = ns.sh().value.length;
  const properties = {};
  const propertyShapes = graph.getObjects(node, ns.sh.property);
  for (const pshape of propertyShapes) {
    const constraint = {};
    for (const c of graph.getQuads(pshape)) {
      const k = c.predicate.value.slice(len);
      if (c.object.termType === "BlankNode") {
        constraint[k] = shInToList(graph, c.object);
      } else {
        if (k === "path") {
          constraint.fqname = getFqname(c.object.value, graph);
          constraint.name = constraint.fqname.slice(1).split("/", 2)[1];
        } else if (k === "datatype") {
          const dt = c.object.value.split("#")[1];
          constraint.keyfilter = dt;
        }
        constraint[k] = c.object.value;
      }
    }
    properties[constraint.name] = constraint;
  }
  return properties;
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

// if (
//   ![
//     "string",
//     "anyURI",
//     "dateTimeStamp",
//     "nonNegativeInteger",
//     "boolean",
//     "decimal",
//     "positiveInteger",
//   ].includes(dt)
// ) {
//   console.log("Datatype: ", dt);
// }
