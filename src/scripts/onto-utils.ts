import { Parser, Quad, Store, Term } from "n3";
import jsonld from "jsonld";
import { QueryEngine } from "@comunica/query-sparql-rdfjs";
import rdfext from "rdf-ext";

export interface SharedFields {
  iri: IRI;
  name: string;
  profile: string;
  summary: string;
  description?: string;
}

export interface Profile extends Partial<Omit<SharedFields, "profile">> {
  classes: Classes;
  properties: Properties;
  vocabularies: Vocabularies;
  individuals: Individuals;
}

export interface ClassProperty {
  path: IRI;
  name: string;
  nodeKind: "Literal" | "IRI" | "BlankNodeOrIRI";
  required: boolean;
  minCount?: number;
  maxCount?: number;
  datatype?: string;
  pattern?: string;
  class?: IRI;
  in?: IRI[];
}

export interface Class extends SharedFields {
  abstract: boolean;
  subClassOf?: string;
  properties: ClassProperties;
}

export interface Property extends SharedFields {
  datatype?: string;
  range?: IRI;
}

export interface Vocabulary extends SharedFields {
  entries: VocabularyEntries;
}

export interface Individual extends SharedFields {
  range: IRI;
}

export type ClassProperties = Map<string, ClassProperty>;
export type VocabularyEntries = Map<string, VocabularyEntry>;
export type VocabularyEntry = Omit<SharedFields, "description">;

export type Profiles = Map<string, Profile>;
export type Classes = Map<string, Class>;
export type Properties = Map<string, Property>;
export type Vocabularies = Map<string, Vocabulary>;
export type Individuals = Map<string, Individual>;

export type IRIs = Map<IRI, Class | Property | Vocabulary | Individual>;
export type IRI = string;

const NS = {
  rdf: rdfext.namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  rdfs: rdfext.namespace("http://www.w3.org/2000/01/rdf-schema#"),
  owl: rdfext.namespace("http://www.w3.org/2002/07/owl#"),
  sh: rdfext.namespace("http://www.w3.org/ns/shacl#"),
  xsd: rdfext.namespace("http://www.w3.org/2001/XMLSchema#"),
};

const shaclLists: Map<IRI, IRI[]> = new Map();

export async function createGraph(source: string | File) {
  const url = source instanceof File ? source.name : source;
  const ext = url.split(".").pop() || "";
  let text: string;
  if (typeof source === "string") {
    text = await (await fetch(source)).text();
  } else if (source instanceof File) {
    text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(source);
    });
  } else {
    throw new Error("Unsupported source type");
  }

  let quads: Quad[] = [];
  if (ext === "ttl") {
    const parser = new Parser();
    quads = parser.parse(text);
  } else if (["jsonld", "json-ld"].includes(ext)) {
    const json = await JSON.parse(text);
    quads = (await jsonld.toRDF(json)) as Quad[];
  } else {
    throw new Error("Unsupported file extension");
  }
  return new Store(quads);
}

export function createModel(graph: Store) {
  setShaclLists(graph);
  const classes = getClasses(graph);
  const properties = getProperties(graph);
  const vocabularies = getVocabularies(graph);
  const individuals = getIndividuals(graph);
  const profiles: Profiles = new Map();
  for (const name of classes.keys()) {
    profiles.set(name, {
      classes: new Map(classes.get(name)),
      properties: new Map(properties.get(name)),
      vocabularies: new Map(vocabularies.get(name)),
      individuals: new Map(individuals.get(name)),
    });
  }
  return profiles;
}

export function getIRIs(profiles: Profiles) {
  const iris: IRIs = new Map();
  for (const profile of profiles.values()) {
    for (const v of Object.values(profile)) {
      iris.set(v.iri, v);
    }
  }
  return iris;
}

export async function enrichModelFromMarkdown(
  profiles: Profiles,
  source: string,
) {
  const res = await fetch(source);
  const markdown: Record<string, object> = await res.json();
  const modelProfiles = markdown.namespaces;
  const enrichedProfiles: Profiles = new Map();
  for (const [profileName, profile] of profiles) {
    const modelProfile = Object.values(modelProfiles).find(
      (v) => v.name === profileName,
    )!;
    for (const [sectionName, section] of Object.entries(profile) as [
      keyof Profile,
      Map<string, SharedFields>,
    ][]) {
      const modelSection = modelProfile[sectionName];
      for (const [itemName, item] of section) {
        const modelItem = Object.values(modelSection).find(
          (v) => v.name === itemName,
        )!;
        item.description = modelItem.description;
        section.set(itemName, item);
      }
      profile[sectionName] = section as any;
    }
    profile.iri = modelProfile.iri;
    profile.name = modelProfile.iri.split("/").pop();
    profile.summary = modelProfile.summary;
    profile.description = modelProfile.description;
    enrichedProfiles.set(profileName, profile);
  }
  return enrichedProfiles;
}

function getSharedFields(node: Term, graph: Store) {
  const parts = node.value.split("/");
  const shared: SharedFields = {
    iri: node.value,
    name: parts.pop()!,
    profile: parts.pop()!,
    summary: graph.getObjects(node, NS.rdfs.comment, null)[0]?.value,
  };
  return shared;
}

function getClasses(graph: Store) {
  const nodes = graph
    .getSubjects(NS.rdf.type, NS.owl.Class, null)
    .filter((o) => !graph.countQuads(null, NS.rdf.type, o, null));
  const classes: Classes = new Map();
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    classes.set(shared.name, <Class>{
      ...shared,
      subClassOf: graph.getObjects(node, NS.rdfs.subClassOf, null)[0]?.value,
      properties: extractNodeShape(graph, node),
    });
  }
  const sorted = new Map([...classes.entries()].sort());
  return Map.groupBy(sorted, (c) => c[1].profile);
}

function getProperties(graph: Store) {
  const datatypeProperties = getDatatypeProperties(graph);
  const objectProperties = getObjectProperties(graph);
  const properties = new Map([...datatypeProperties, ...objectProperties]);
  const sorted = new Map([...properties.entries()].sort());
  return Map.groupBy(sorted, (c) => c[1].profile);
}

function getDatatypeProperties(graph: Store) {
  const nodes = graph.getSubjects(NS.rdf.type, NS.owl.DatatypeProperty, null);
  const properties: Properties = new Map();
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const datatype = graph
      .getObjects(node.value, NS.rdfs.range, null)[0]
      .value.split("#")
      .pop();
    properties.set(shared.name, <Property>{ ...shared, datatype });
  }
  return properties;
}

function getObjectProperties(graph: Store) {
  const nodes = graph.getSubjects(NS.rdf.type, NS.owl.ObjectProperty, null);
  const properties: Properties = new Map();
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const range = graph.getObjects(node.value, NS.rdfs.range, null)[0].value;
    properties.set(shared.name, <Property>{ ...shared, range });
  }
  return properties;
}

function getVocabularies(graph: Store) {
  const nodes = graph
    .getSubjects(NS.rdf.type, NS.owl.Class, null)
    .filter((o) => graph.countQuads(null, NS.rdf.type, o, null));
  const vocabularies: Vocabularies = new Map();
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const entries: VocabularyEntries = new Map();
    for (const o of graph.getSubjects(NS.rdf.type, node.value, null)) {
      const name = o.value.split("/").pop() as string;
      entries.set(name, getSharedFields(o, graph));
    }
    vocabularies.set(shared.name, <Vocabulary>{
      ...shared,
      entries: entries,
    });
  }
  const sorted = new Map([...vocabularies.entries()].sort());
  return Map.groupBy(sorted, (c) => c[1].profile);
}

function getIndividuals(graph: Store) {
  const nodes = graph
    .getSubjects(NS.rdf.type, NS.owl.NamedIndividual, null)
    .filter((o) => graph.countQuads(o, NS.rdfs.range, null, null));
  const individuals: Individuals = new Map();
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const range = graph.getObjects(node.value, NS.rdfs.range, null)[0].value;
    individuals.set(shared.name, <Individual>{ ...shared, range });
  }
  const sorted = new Map([...individuals.entries()].sort());
  return Map.groupBy(sorted, (c) => c[1].profile);
}

function extractNodeShape(graph: Store, node: Term): ClassProperties {
  const classProperties: ClassProperties = new Map();
  const propertyShapes = graph.getObjects(node, NS.sh.property, null);
  for (const pshape of propertyShapes) {
    const property = <ClassProperty>{};
    for (const o of graph.getQuads(pshape, null, null, null)) {
      const field = o.predicate.value.split("#").pop()!;
      switch (field) {
        case "path":
          property.path = o.object.value;
          property.name = property.path.split("/").pop()!;
          break;
        case "minCount":
        case "maxCount":
          property[field] = parseInt(o.object.value);
          break;
        case "in":
          property.in = shaclLists.get(o.object.value);
          break;
        case "nodeKind":
          property.nodeKind = o.object.value
            .split("#")
            .pop() as typeof property.nodeKind;
          break;
        case "class":
        case "datatype":
        case "pattern":
          property[field] = o.object.value;
          break;

        default:
          console.log("Unknown field", field, o.object.value);
          break;
      }
      property.required = Boolean(property.minCount);
    }
    classProperties.set(property.name, property);
  }
  return classProperties;
}

function setShaclLists(graph: Store) {
  shaclLists.clear();
  for (const [k, v] of Object.entries(graph.extractLists())) {
    const list = v.map((v) => v.value);
    shaclLists.set(k, list);
  }
}

const comunicaEngine = new QueryEngine();
export async function sparql(graph: Store, query: string) {
  const bindingsStream = await comunicaEngine.queryBindings(query, {
    sources: [graph],
  });
  return await bindingsStream.toArray();
}
