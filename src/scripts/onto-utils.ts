import { Parser, Quad, Store, Term, DataFactory } from 'n3';
const { namedNode } = DataFactory;
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
  NodeData,
  Profile,
  Profiles,
  Properties,
  PropertyOption,
  Section,
  SharedFields,
  Vocabularies,
  VocabularyEntries,
  nodeKindTypes,
  OntologyMetadata,
  ModelProfile,
} from '@/types';
import { parseIRI } from '@/scripts/app-utils';

const NS: { [key: string]: string } = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  sh: 'http://www.w3.org/ns/shacl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
};

export function getNamedNode(ns: IRI, name: string) {
  if (Object.keys(NS).includes(ns)) {
    return namedNode(NS[ns] + name);
  } else {
    throw new Error('Unknown namespace');
  }
}

const shaclLists: Map<IRI, IRI[]> = new Map();

const isNodeJs =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const getJsonLdContext = async (source: string) =>
  (await (await fetch(source)).json())['@context'];

export async function createGraph(source: string | File) {
  const url = source instanceof File ? source.name : source;
  const ext = url.split('.').pop() || '';
  let text: string;
  if (typeof source === 'string') {
    if (isNodeJs) {
      const { promises: fs } = await import('fs');
      text = await fs.readFile(source, 'utf8');
    } else {
      text = await (await fetch(source)).text();
    }
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

export function getOntologyMetadata(graph: Store) {
  const iri = graph.getSubjects(
    getNamedNode('rdf', 'type'),
    getNamedNode('owl', 'Ontology'),
    null
  )[0];
  const metadata: OntologyMetadata = {};
  graph.getQuads(iri, null, null, null).forEach(o => {
    const k = o.predicate.value.split('#').pop()!.split('/').pop()!;
    if (k === 'type') return;
    metadata[k] = o.object.value;
  });
  metadata.specVersion = metadata.versionIRI.split('/').reverse()[2];
  return metadata;
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
  model: string
) {
  let markdown: Record<string, object>;
  if (isNodeJs) {
    const { promises: fs } = await import('fs');
    markdown = JSON.parse(await fs.readFile(model, 'utf8'));
  } else {
    markdown = await (await fetch(model)).json();
  }
  const modelProfiles = markdown.namespaces as ModelProfile[];
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
        if (sectionName === 'classes' && item.abstract === undefined) {
          item.abstract = modelItem.metadata.Instantiability === 'Abstract';
        }
        section[itemName] = item;
      }

      if (sectionName === 'classes') {
        enrichedProfile.classes = section as Classes;
      } else if (sectionName === 'properties') {
        enrichedProfile.properties = section as Properties;
      } else if (sectionName === 'vocabularies') {
        enrichedProfile.vocabularies = section as Vocabularies;
      } else if (sectionName === 'individuals') {
        enrichedProfile.individuals = section as Individuals;
      } else {
        throw new Error('Unknown section name');
      }
    }
    enrichedProfile.iri = modelProfile.iri;
    enrichedProfile.name = parseIRI(modelProfile.iri).name;
    enrichedProfile.summary = modelProfile.summary;
    enrichedProfile.description = modelProfile.description;
    enrichedProfiles[profileName] = enrichedProfile;
  }
  return enrichedProfiles;
}

export function getAllRecClsProps(profiles: Profiles, iris: Record<IRI, Item>) {
  const allRecClsProps: Record<Name, NodeData['recClsProps']> = {};
  for (const profile of Object.values(profiles)) {
    for (const cls of Object.values(profile.classes)) {
      allRecClsProps[cls.iri] = getRecClsProps(iris, cls.iri);
    }
  }
  return allRecClsProps;
}

function getRecClsProps(iris: Record<IRI, Item>, iri: IRI | undefined) {
  const recClsProps: NodeData['recClsProps'] = new Map();
  while (iri) {
    const cls = iris[iri] as Class;
    const classProperties: ClassProperties = {};
    for (const [propertyName, classProperty] of Object.entries(
      cls.properties
    )) {
      classProperties[propertyName] = classProperty;
    }
    recClsProps.set(cls.iri, classProperties);
    iri = cls.subClassOf;
  }
  return recClsProps;
}

function getSharedFields(node: Term, graph: Store) {
  const iri = node.value;
  const shared: SharedFields = {
    iri,
    name: parseIRI(iri).name,
    profileName: parseIRI(iri).profile,
    summary: graph.getObjects(node, getNamedNode('rdfs', 'comment'), null)[0]
      ?.value,
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
  // classes that don't have labeled NamedIndividuals
  const nodes = graph
    .getSubjects(
      getNamedNode('rdf', 'type'),
      getNamedNode('owl', 'Class'),
      null
    )
    .filter(
      o =>
        !graph
          .getSubjects(getNamedNode('rdf', 'type'), o, null)
          .filter(s =>
            graph.countQuads(s, getNamedNode('rdfs', 'label'), null, null)
          ).length
    )
    .filter(o => !o.value.endsWith('AbstractClass')); //workaround for invalid AbstractClass
  const items: Classes = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    items[shared.name] = {
      ...shared,
      subClassOf: graph.getObjects(
        node,
        getNamedNode('rdfs', 'subClassOf'),
        null
      )[0]?.value,
      // nodeKind: graph
      //   .getObjects(node, NS.sh.nodeKind, null)[0]
      //   .value.split('#')
      //   .pop() as nodeKindTypes,
      // abstract: graph.has(
      //   DataFactory.quad(
      //     node,
      //     NS.rdf.type,
      //     DataFactory.namedNode('http://spdx.invalid./AbstractClass')
      //   )
      // ),
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
  const nodes = graph.getSubjects(
    getNamedNode('rdf', 'type'),
    getNamedNode('owl', 'DatatypeProperty'),
    null
  );
  const items: Properties = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const datatype = graph.getObjects(
      node.value,
      getNamedNode('rdfs', 'range'),
      null
    )[0].value;
    items[shared.name] = {
      ...shared,
      datatype: datatype as LiteralPropertyTypes,
    };
  }
  return items;
}

function getObjectProperties(graph: Store) {
  const nodes = graph.getSubjects(
    getNamedNode('rdf', 'type'),
    getNamedNode('owl', 'ObjectProperty'),
    null
  );
  const items: Properties = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const range = graph.getObjects(
      node.value,
      getNamedNode('rdfs', 'range'),
      null
    )[0].value;
    items[shared.name] = { ...shared, range };
  }
  return items;
}

function getVocabularies(graph: Store) {
  // classes that have labeled NamedIndividuals
  const nodes = graph
    .getSubjects(
      getNamedNode('rdf', 'type'),
      getNamedNode('owl', 'Class'),
      null
    )
    .filter(
      o =>
        graph
          .getSubjects(getNamedNode('rdf', 'type'), o, null)
          .filter(s =>
            graph.countQuads(s, getNamedNode('rdfs', 'label'), null, null)
          ).length
    )
    .filter(o => !o.value.endsWith('AbstractClass')); //workaround for invalid AbstractClass
  const items: Vocabularies = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const entries: VocabularyEntries = {};
    for (const o of graph.getSubjects(
      getNamedNode('rdf', 'type'),
      node.value,
      null
    )) {
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
    .getSubjects(
      getNamedNode('rdf', 'type'),
      getNamedNode('owl', 'NamedIndividual'),
      null
    )
    .filter(o =>
      graph.countQuads(o, getNamedNode('rdfs', 'range'), null, null)
    );
  const items: Individuals = {};
  for (const node of nodes) {
    const shared = getSharedFields(node, graph);
    const range = graph.getObjects(
      node.value,
      getNamedNode('rdfs', 'range'),
      null
    )[0].value;
    items[shared.name] = { ...shared, range };
  }
  return groupByProfile(items);
}

function extractNodeShape(graph: Store, node: Term) {
  const classProperties: ClassProperties = {};
  const propertyShapes = graph.getObjects(
    node,
    getNamedNode('sh', 'property'),
    null
  );
  for (const pshape of propertyShapes) {
    let path: IRI;
    let name: Name;
    let nodeKind: nodeKindTypes;
    let minCount: number | undefined;
    let maxCount: number | undefined;
    let datatype: string | undefined;
    let classIRI: IRI | undefined;
    let options: PropertyOption[] | undefined;
    let pattern: string | undefined;
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
          pattern = o.object.value;
          break;
        case 'class':
          classIRI = o.object.value;
          break;

        default:
          console.log('Unknown field', field, o.object.value);
          break;
      }
    }

    if (pattern) {
      switch (pattern) {
        case '^[^\\/]+\\/[^\\/]+$':
          datatype = 'MediaType';
          break;
        case '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*' +
          '[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?' +
          '(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$':
          datatype = 'SemVer';
          break;
        case '^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\dZ$':
          break;

        default:
          throw new Error('Unknown pattern: ' + pattern);
      }
    }

    const classProperty: ClassProperty = {
      parentClass: node.value,
      path: path!,
      name: name!,
      minCount,
      maxCount,
      nodeKind: nodeKind!,
      datatype:
        nodeKind! === 'Literal'
          ? (datatype as LiteralPropertyTypes)
          : undefined,
      targetClass: nodeKind! === 'BlankNodeOrIRI' ? classIRI : undefined,
      options: nodeKind! === 'IRI' ? options : undefined,
      pattern: pattern,
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
