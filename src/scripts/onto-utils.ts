import { Parser, Quad, Store, Term } from "n3";
import jsonld from "jsonld";
import { QueryEngine } from "@comunica/query-sparql-rdfjs";
import rdfext from "rdf-ext";
import { keyBy } from "lodash-es";

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
  abstract?: boolean;
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

export type ClassProperties = Record<string, ClassProperty>;
export type VocabularyEntries = Record<string, VocabularyEntry>;
export type VocabularyEntry = Omit<SharedFields, "description">;

export type Profiles = Record<string, Profile>;
export type Classes = Record<string, Class>;
export type Properties = Record<string, Property>;
export type Vocabularies = Record<string, Vocabulary>;
export type Individuals = Record<string, Individual>;

export type Section = Classes | Properties | Vocabularies | Individuals;
export type SectionNames =
  | "classes"
  | "properties"
  | "vocabularies"
  | "individuals";
export type Item = Class | Property | Vocabulary | Individual;
export type IRIs = Record<IRI, Item>;
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
  const profiles: Profiles = {};
  for (const name in classes) {
    profiles[name] = <Profile>{
      classes: classes[name] ?? {},
      properties: properties[name] ?? {},
      vocabularies: vocabularies[name] ?? {},
      individuals: individuals[name] ?? {},
    };
  }
  return profiles;
}

export function getIRIs(profiles: Profiles) {
  const iris: IRIs = {};
  for (const profile of Object.values(profiles)) {
    for (const section of Object.values(profile)) {
      for (const item of Object.values(section as Section)) {
        iris[item.iri] = item;
      }
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
  const enrichedProfiles: Profiles = {};
  for (const [profileName, profile] of Object.entries(profiles)) {
    const modelProfile = Object.values(modelProfiles).find(
      (v) => v.name === profileName,
    )!;
    for (const [sectionName, section] of Object.entries(profile) as [
      SectionNames,
      Section,
    ][]) {
      const modelSection = modelProfile[sectionName];
      for (const [itemName, item] of Object.entries(section)) {
        if (!(item instanceof Object)) continue;
        const modelItem = Object.values(modelSection).find(
          (v) => v.name === itemName,
        )!;
        item.description = modelItem.description;
        if (sectionName === "classes") {
          item.abstract = modelItem.metadata.Instantiability === "Abstract";
        }
        section[itemName] = item;
      }
      profile[sectionName] = section;
    }
    profile.iri = modelProfile.iri;
    profile.name = modelProfile.iri.split("/").pop();
    profile.summary = modelProfile.summary;
    profile.description = modelProfile.description;
    enrichedProfiles[profileName] = profile;
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

function groupByProfile(section: Section) {
  const profiles: Record<string, Section> = {};
  for (const [itemName, item] of Object.entries(section)) {
    profiles[item.profile] = profiles[item.profile] || {};
    profiles[item.profile][itemName] = item;
  }
  return profiles;
}

function getClasses(graph: Store) {
  const nodes = graph
    .getSubjects(NS.rdf.type, NS.owl.Class, null)
    .filter((o) => !graph.countQuads(null, NS.rdf.type, o, null));
  const items: Classes = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    items[shared.name] = {
      ...shared,
      subClassOf: graph.getObjects(node, NS.rdfs.subClassOf, null)[0]?.value,
      properties: extractNodeShape(graph, node),
    };
  }
  return groupByProfile(items);
}

function getProperties(graph: Store) {
  const datatypeProperties = getDatatypeProperties(graph);
  const objectProperties = getObjectProperties(graph);
  const items = { ...datatypeProperties, ...objectProperties };
  return groupByProfile(items);
}

function getDatatypeProperties(graph: Store) {
  const nodes = graph.getSubjects(NS.rdf.type, NS.owl.DatatypeProperty, null);
  const items: Properties = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const datatype = graph
      .getObjects(node.value, NS.rdfs.range, null)[0]
      .value.split("#")
      .pop();
    items[shared.name] = { ...shared, datatype };
  }
  return items;
}

function getObjectProperties(graph: Store) {
  const nodes = graph.getSubjects(NS.rdf.type, NS.owl.ObjectProperty, null);
  const items: Properties = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const range = graph.getObjects(node.value, NS.rdfs.range, null)[0].value;
    items[shared.name] = { ...shared, range };
  }
  return items;
}

function getVocabularies(graph: Store) {
  const nodes = graph
    .getSubjects(NS.rdf.type, NS.owl.Class, null)
    .filter((o) => graph.countQuads(null, NS.rdf.type, o, null));
  const items: Vocabularies = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const entries: VocabularyEntries = {};
    for (const o of graph.getSubjects(NS.rdf.type, node.value, null)) {
      const name = o.value.split("/").pop() as string;
      entries[name] = getSharedFields(o, graph);
    }
    items[shared.name] = {
      ...shared,
      entries: entries,
    };
  }
  return groupByProfile(items);
}

function getIndividuals(graph: Store) {
  const nodes = graph
    .getSubjects(NS.rdf.type, NS.owl.NamedIndividual, null)
    .filter((o) => graph.countQuads(o, NS.rdfs.range, null, null));
  const items: Individuals = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const range = graph.getObjects(node.value, NS.rdfs.range, null)[0].value;
    items[shared.name] = { ...shared, range };
  }
  return groupByProfile(items);
}

function extractNodeShape(graph: Store, node: Term) {
  const classProperties: ClassProperties = {};
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
    classProperties[property.name] = property;
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
