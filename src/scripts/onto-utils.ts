import rdfext from 'rdf-ext';
import { Parser, Quad, Store, Term } from 'n3';
import { QueryEngine } from '@comunica/query-sparql-rdfjs';
import jsonld from 'jsonld';

import {
  Class,
  ClassProperties,
  ClassProperty,
  Classes,
  EnrichedProfile,
  EnrichedProfiles,
  IRI,
  Individuals,
  Item,
  LiteralPropertyTypes,
  Name,
  Profile,
  Profiles,
  Properties,
  PropertyOption,
  RecursiveClassProperties,
  Section,
  SharedFields,
  Vocabularies,
  VocabularyEntries,
  nodeKindTypes,
} from '@/types';
import { getItem } from '@/store/onto';
import { parseIRI } from '@/scripts/app-utils';

const NS = {
  rdf: rdfext.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  rdfs: rdfext.namespace('http://www.w3.org/2000/01/rdf-schema#'),
  owl: rdfext.namespace('http://www.w3.org/2002/07/owl#'),
  sh: rdfext.namespace('http://www.w3.org/ns/shacl#'),
  xsd: rdfext.namespace('http://www.w3.org/2001/XMLSchema#'),
};

const shaclLists: Map<IRI, IRI[]> = new Map();

export async function createGraph(source: string | File) {
  const url = source instanceof File ? source.name : source;
  const ext = url.split('.').pop() || '';
  let text: string;
  if (typeof source === 'string') {
    text = await (await fetch(source)).text();
  } else if (source instanceof File) {
    text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(source);
    });
  } else {
    throw new Error('Unsupported source type');
  }

  let quads: Quad[] = [];
  if (ext === 'ttl') {
    const parser = new Parser();
    quads = parser.parse(text);
  } else if (['jsonld', 'json-ld'].includes(ext)) {
    const json = await JSON.parse(text);
    quads = (await jsonld.toRDF(json)) as Quad[];
  } else {
    throw new Error('Unsupported file extension');
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
  for (const profileName in classes) {
    profiles[profileName] = <Profile>{
      classes: classes[profileName] ?? {},
      properties: properties[profileName] ?? {},
      vocabularies: vocabularies[profileName] ?? {},
      individuals: individuals[profileName] ?? {},
    };
  }
  return profiles;
}

export function mapIRIs(profiles: Profiles) {
  const iris: Record<IRI, Item> = {};
  for (const profile of Object.values(profiles) as Profile[]) {
    for (const section of Object.values(profile) as Section[]) {
      for (const item of Object.values(section) as Item[]) {
        iris[item.iri] = item;
      }
    }
  }
  return iris;
}

export async function enrichModelFromMarkdown(
  profiles: Profiles,
  source: string
) {
  const res = await fetch(source);
  const markdown: Record<string, object> = await res.json();
  const modelProfiles = markdown.namespaces;
  const enrichedProfiles: EnrichedProfiles = {};
  for (const [profileName, profile] of Object.entries(profiles) as [
    Name,
    Profile,
  ][]) {
    const enrichedProfile = profile as EnrichedProfile;
    const modelProfile = Object.values(modelProfiles).find(
      v => v.name === profileName
    )!;
    for (const [sectionName, section] of Object.entries(profile) as [
      keyof Profile,
      Section,
    ][]) {
      const modelSection = modelProfile[sectionName];
      for (const [itemName, item] of Object.entries(section)) {
        if (!(item instanceof Object)) continue;
        const modelItem = Object.values(modelSection).find(
          v => v.name === itemName
        )!;
        item.description = modelItem.description;
        if (sectionName === 'classes') {
          item.abstract = modelItem.metadata.Instantiability === 'Abstract';
        }
        section[itemName] = item;
      }
      enrichedProfile[sectionName] = section;
    }
    enrichedProfile.iri = modelProfile.iri;
    enrichedProfile.name = parseIRI(modelProfile.iri).name;
    enrichedProfile.summary = modelProfile.summary;
    enrichedProfile.description = modelProfile.description;
    enrichedProfiles[profileName] = enrichedProfile;
  }
  return enrichedProfiles;
}

export const getRecursiveClassProperties = (iri: IRI | undefined) => {
  const recursiveClassProperties: RecursiveClassProperties = new Map();
  while (iri) {
    const cls = getItem(iri) as Class;
    recursiveClassProperties.set(cls.name, cls.properties);
    iri = cls.subClassOf;
  }
  return recursiveClassProperties;
};

function getSharedFields(node: Term, graph: Store) {
  const iri = node.value;
  const shared: SharedFields = {
    iri,
    name: parseIRI(iri).name,
    profileName: parseIRI(iri).profile,
    summary: graph.getObjects(node, NS.rdfs.comment, null)[0]?.value,
  };
  return shared;
}

function groupByProfile(section: Section) {
  const profiles: Record<string, Section> = {};
  for (const [itemName, item] of Object.entries(section) as [
    Name,
    SharedFields,
  ][]) {
    profiles[item.profileName] = profiles[item.profileName] || {};
    profiles[item.profileName][itemName] = item;
  }
  return profiles;
}

function getClasses(graph: Store) {
  const nodes = graph
    .getSubjects(NS.rdf.type, NS.owl.Class, null)
    .filter(o => !graph.countQuads(null, NS.rdf.type, o, null));
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
      .value.split('#')
      .pop() as LiteralPropertyTypes;
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
    .filter(o => graph.countQuads(null, NS.rdf.type, o, null));
  const items: Vocabularies = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const entries: VocabularyEntries = {};
    for (const o of graph.getSubjects(NS.rdf.type, node.value, null)) {
      entries[o.value] = getSharedFields(o, graph);
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
    .filter(o => graph.countQuads(o, NS.rdfs.range, null, null));
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
    let path: IRI;
    let name: Name;
    let nodeKind: nodeKindTypes;
    let minCount: number | undefined;
    let maxCount: number | undefined;
    let datatype: LiteralPropertyTypes | undefined;
    let spdxDatatype: string | undefined;
    let classIRI: IRI | undefined;
    let options: PropertyOption[] | undefined;
    for (const o of graph.getQuads(pshape, null, null, null)) {
      const field = o.predicate.value.split('#').pop()!;
      switch (field) {
        case 'path':
          path = o.object.value;
          name = parseIRI(o.object.value).name;
          break;
        case 'minCount':
          minCount = parseInt(o.object.value);
          break;
        case 'maxCount':
          maxCount = parseInt(o.object.value);
          break;
        case 'in':
          options = shaclLists.get(o.object.value)?.map((value: IRI) => {
            return { label: parseIRI(value).name, value };
          });
          break;
        case 'nodeKind':
          nodeKind = o.object.value.split('#').pop() as nodeKindTypes;
          break;
        case 'datatype':
          datatype = o.object.value.split('#').pop() as
            | LiteralPropertyTypes
            | undefined;
          break;
        case 'pattern':
          switch (o.object.value) {
            case '^[^\\/]+\\/[^\\/]+$':
              spdxDatatype = 'MediaType';
              break;
            case '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*' +
              '[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?' +
              '(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$':
              spdxDatatype = 'SemVer';
              break;
            case '^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\dZ$':
              break;

            default:
              throw new Error('Unknown pattern: ' + o.object.value);
          }
          break;
        case 'class':
          classIRI = o.object.value;
          break;

        default:
          console.log('Unknown field', field, o.object.value);
          break;
      }
    }
    const required = Boolean(minCount);
    if (spdxDatatype === 'SemVer' || spdxDatatype === 'MediaType') {
      datatype = spdxDatatype;
    }

    const classProperty: ClassProperty = {
      parentClass: node.value,
      path: path!,
      name: name!,
      required,
      minCount,
      maxCount,
      nodeKind: nodeKind!,
      datatype:
        nodeKind! === 'Literal'
          ? (datatype as LiteralPropertyTypes)
          : undefined,
      targetClass: nodeKind! === 'BlankNodeOrIRI' ? classIRI : undefined,
      options: nodeKind! === 'IRI' ? options : undefined,
    } as ClassProperty;

    classProperties[classProperty.name] = classProperty;
  }
  return classProperties;
}

function setShaclLists(graph: Store) {
  shaclLists.clear();
  for (const [k, v] of Object.entries(graph.extractLists())) {
    const list = v.map(v => v.value);
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
