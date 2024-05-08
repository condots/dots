import fs from "node:fs";
import { Parser, Store } from "n3";
import { ns } from "@/utils/onto-utils";

// const spdxNs = getSpdxNs(graph);
// const model = createModel(graph, spdxNs);

function getGraph() {
  const text = fs.readFileSync("./public/spdx-model.ttl").toString();
  const parser = new Parser();
  const quads = parser.parse(text);
  return new Store(quads);
}

function graphClasses() {
  const graph = getGraph();
  return graph.getSubjects(ns.rdf.type, ns.owl.Class).map((s) => s.value);
}

function graphVocabs() {
  const graph = getGraph();
  return graph
    .getSubjects(ns.rdf.type, ns.owl.Class)
    .filter((s) => !graph.countQuads(null, ns.rdf.type, s))
    .map((s) => s.value);
}

function graphDatatypeProperty() {
  const graph = getGraph();
  return graph
    .getSubjects(ns.rdf.type, ns.owl.DatatypeProperty)
    .map((s) => s.value);
}

function graphObjectProperty() {
  const graph = getGraph();
  return graph
    .getSubjects(ns.rdf.type, ns.owl.ObjectProperty)
    .map((s) => s.value);
}

function graphIndividuals() {
  const graph = getGraph();
  return graph
    .getSubjects(ns.rdf.type, ns.owl.NamedIndividual)
    .filter((s) => graph.countQuads(s, ns.rdfs.range, null))
    .map((s) => s.value);
}

const getNamespaces = JSON.parse(
  fs.readFileSync("./public/model.json"),
).namespaces;

function spdxClasses() {
  const namespaces = getNamespaces();
  return namespaces
    .map((ns) => Object.values(ns.classes).map((mdCls) => mdCls.iri))
    .flat();
}

// function spdxProperties() {
//   const namespaces = getNamespaces();
//   return namespaces
//     .map((ns) => Object.values(ns.classes).map((mdCls) => mdCls.iri))
//     .flat();
// }

// const items = graphClasses();
// const items = graphVocabs();
// const items = spdxClasses();
// const items = graphProperties();
// const items = graphObjectProperty();
const items = graphIndividuals();

items.sort().forEach((cls) => console.log(cls));

// const namespaces = JSON.parse(
//   fs.readFileSync("./public/model.json"),
// ).namespaces;

// const classes = [];
// namespaces.forEach((ns) => {
// const profile = model[ns.name];
// profile.summary = ns.summary;
// profile.description = ns.description;
// profile.iri = ns.iri;
// Object.values(ns.classes).forEach((mdCls) => {
//   const iri = mdCls.iri;
//   classes.push(iri);
// const cls = profile.classes[mdCls.name];
// cls.description = mdCls.description;
// cls.concrete = mdCls.metadata.Instantiability === "Concrete";
// const name = `${ns.prefix}:${cls.iri}`;
// const modelCls = model[ns.prefix][cls.name];
// modelCls.summary = cls.summary;
// modelCls.examples = cls.examples;
//   });
// });

// for (const cls of classes.sort()) {
//   console.log(cls);
// }

// const query = `
// PREFIX spdx: <${spdxNs}>

// SELECT ?s ?p ?o WHERE {
//   ?s ?p ?o
// } LIMIT 100
// `;
// const bindings = await sparql(graph, query);
// for (const binding of bindings) {
//   console.log("s.value:", binding.get("s").value);
//   console.log("s.termType:", binding.get("s").termType);
//   console.log("p.value:", binding.get("p").value);
//   console.log("p.termType:", binding.get("p").termType);
//   console.log("o.value:", binding.get("o").value);
//   console.log("-".repeat(100));
// }

// const query = `
// PREFIX spdx: <${spdxNs}>

// SELECT ?s WHERE {
//   ?s a owl:Class
// } LIMIT 100
// `;

// const bindings = await sparql(graph, query);
// for (const binding of bindings) {
//   console.log("s.value:", binding.get("s").value);
//   console.log("s.termType:", binding.get("s").termType);
//   console.log("-".repeat(100));
// }
