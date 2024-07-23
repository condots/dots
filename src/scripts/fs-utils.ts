import { Store, DataFactory, Quad_Subject, Quad } from 'n3';
const { namedNode, literal, quad } = DataFactory;
import SerializerJsonld from '@rdfjs/serializer-jsonld';
import jsonld, { JsonLdDocument } from 'jsonld';
import { saveAs } from 'file-saver';
import { XYPosition } from 'reactflow';

import { ClassProperty, FlowNode, NodeProperty, Property } from '@/types';
import { appStore } from '@/store/app';
import { getItem, ontoStore } from '@/store/onto';
import {
  addNode,
  addNodeProperty,
  flowStore,
  getNode,
  getNodeOutEdges,
  hideTreeNodes,
  selectNode,
  setNodeProperty,
} from '@/store/flow';
import { NS } from '@/scripts/onto-utils';
import { snapGrid } from '@/scripts/canvas-defaults';
import { generateURN } from '@/scripts/app-utils';

type SubjectMap = Map<string, Quad_Subject>;
type NamedPositions = Record<string, XYPosition>;

interface ImportedProperty {
  id: string;
  path: string;
  value: string | number | boolean;
}
type ImportedProperties = ImportedProperty[];

interface ImportedNode {
  id: string;
  classIRI: string;
  position: XYPosition;
}
type ImportedNodes = Record<string, ImportedNode>;

function genNodeQuad(store: Store, subjects: SubjectMap, node: FlowNode) {
  const subject = node.data.inheritanceList.includes(
    'https://spdx.org/rdf/3.0.0/terms/Core/Element'
  )
    ? namedNode(node.id)
    : store.createBlankNode();
  const q = quad(subject, NS.rdf.type, namedNode(node.data.cls.iri));
  store.add(q);
  genPropQuads(store, subject, node);
  subjects.set(node.id, subject);
}

function genPropQuads(store: Store, subject: Quad_Subject, node: FlowNode) {
  for (const nodeProp of Object.values(node.data.nodeProps)) {
    if (!nodeProp.valid) throw new Error('propQuad is null');

    const predicate = namedNode(nodeProp.classProperty.path);
    let object = nodeProp.value!;
    const clsProp = nodeProp.classProperty;
    if (clsProp.nodeKind === 'Literal') {
      const dt = (getItem(nodeProp.classProperty.path) as Property).datatype!;
      // @ts-expect-error:2769
      object = literal(object, namedNode(dt)) as keyof NodeProperty['value'];
    }
    // @ts-expect-error:2769
    const q = quad(subject, predicate, object);
    store.add(q);
  }
}

function genEdgeQuads(store: Store, subjects: SubjectMap, node: FlowNode) {
  const sourceSubject = subjects.get(node.id)!;
  for (const edge of getNodeOutEdges(node.id)) {
    if (subjects.has(edge.target)) {
      const q = quad(
        sourceSubject,
        namedNode(edge.data.classProperty.path),
        subjects.get(edge.target)!
      );
      store.add(q);
    }
  }
}

function genSpdxGraph(nodes: FlowNode[]) {
  const store = new Store();
  const subjects: SubjectMap = new Map();
  nodes.forEach(node => genNodeQuad(store, subjects, node));
  nodes.forEach(node => genEdgeQuads(store, subjects, node));
  return { store, subjects };
}

function canvasToRelativePosition(refPos: XYPosition, nodePos: XYPosition) {
  const x = (nodePos.x - refPos.x) / snapGrid[0];
  const y = (nodePos.y - refPos.y) / snapGrid[1];
  return { x, y };
}

function getRelativePositions(nodes: FlowNode[], subjects: SubjectMap) {
  const id = subjects.get(nodes[0].id)!.id;
  const positions: NamedPositions = {
    [id]: { x: 0, y: 0 },
  };
  for (const node of nodes.slice(1)) {
    const id = subjects.get(node.id)!.id;
    positions[id] = canvasToRelativePosition(nodes[0].position, node.position);
  }
  return positions;
}

function checkInvalidProp(nodes: FlowNode[]) {
  for (const node of nodes) {
    for (const nodeProp of Object.values(node.data.nodeProps)) {
      if (!nodeProp.valid) {
        return { node, nodeProp };
      }
    }
  }
}

export async function exportSpdxJsonLd(filename: string, nodes?: FlowNode[]) {
  if (!nodes) {
    nodes = flowStore.getState().nodes;
  }

  const invalidProp = checkInvalidProp(nodes);
  if (invalidProp) {
    appStore.setState(state => {
      state.alertMessage = {
        title: 'Invalid property',
        description: `"${invalidProp.node.data.cls.name}" has an invalid "${invalidProp.nodeProp.classProperty.name}" value.`,
      };
    });
    return;
  }

  const { store, subjects } = genSpdxGraph(nodes);

  const doc: JsonLdDocument = await new Promise((resolve, reject) => {
    new SerializerJsonld()
      .import(store.match(null, null, null, null))
      .on('error', reject)
      .on('data', resolve);
  });
  const ctx = ontoStore.getState().jsonLdContext!;
  const compacted = await jsonld.compact(doc, ctx);

  compacted['@context'] = ontoStore.getState().jsonLdContextUrl;
  const positions = getRelativePositions(nodes, subjects);
  compacted.dots = JSON.parse(JSON.stringify(positions));

  const blob = new Blob([JSON.stringify(compacted, null, 2)], {
    type: 'application/ld+json;charset=utf-8',
  });
  saveAs(blob, filename);
}

function relativeToCanvasPosition(refPos: XYPosition, relPos: XYPosition) {
  const x = relPos.x * snapGrid[0] + refPos.x;
  const y = relPos.y * snapGrid[1] + refPos.y;
  return { x, y };
}

function getCanvasPositions(relPositions: NamedPositions, refPos: XYPosition) {
  const positions: NamedPositions = {};
  for (const [nodeId, relPos] of Object.entries(relPositions)) {
    positions[nodeId] = relativeToCanvasPosition(refPos, relPos);
  }
  return positions;
}

function checkDuplicatedNodeIds(store: Store) {
  const existingIds = flowStore.getState().nodes.map(n => n.id);
  const subjectIds = store.getSubjects(null, null, null).map(s => s.id);
  for (const sid of subjectIds) {
    if (existingIds.includes(sid)) {
      return sid;
    }
  }
}

export async function importSpdxJsonLd(
  source: string | File,
  refPos: XYPosition,
  collapsed: boolean = true
) {
  let data: string;
  if (typeof source === 'string') {
    data = await (await fetch(source)).text();
  } else {
    data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(source);
    });
  }

  const doc = JSON.parse(data);
  const expectedContext = ontoStore.getState().jsonLdContextUrl;
  if (doc['@context'] !== expectedContext) {
    appStore.setState(state => {
      state.alertMessage = {
        title: 'Context mismatch',
        description: `The URL of the context in the imported document has to match "${expectedContext}"`,
      };
    });
    return;
  }

  const ctx = ontoStore.getState().jsonLdContext!;
  const expanded = await jsonld.flatten(doc, ctx);
  const quads = (await jsonld.toRDF(expanded)) as Quad[];
  const store = new Store(quads);

  const sid = checkDuplicatedNodeIds(store);
  if (sid) {
    appStore.setState(state => {
      state.alertMessage = {
        title: 'Existing node ID',
        description: `A node with ID "${sid}" already exists. Please remove bofore importing.`,
      };
    });
    return;
  }

  const positions: NamedPositions = doc.dots
    ? getCanvasPositions(doc.dots, refPos)
    : {};

  const impProps: ImportedProperties = [];
  const impNodes: ImportedNodes = {};
  for (const s of store.getSubjects(null, null, null)) {
    let classIRI: string;
    for (const q of store.getQuads(s, null, null, null)) {
      const path = q.predicate.value;
      const value = q.object.value;
      if (path === NS.rdf.type.value) {
        classIRI = value;
      } else {
        impProps.push({ id: s.value, path, value });
      }
    }
    const impNode: ImportedNode = {
      id: s.value.startsWith('_:') ? generateURN() : s.value,
      classIRI: classIRI!,
      position: positions[s.value] ?? refPos,
    };
    addNode('inst', impNode.id, impNode.classIRI, impNode.position);
    impNodes[s.value] = impNode;
  }

  for (const p of impProps) {
    const source = impNodes[p.id].id;
    const data = getNode(source)!.data;
    const recClsProps = data.recClsProps;
    let clsProp: ClassProperty;
    for (const clsProps of recClsProps.values()) {
      for (const cp of Object.values(clsProps)) {
        if (cp.path === p.path) {
          clsProp = cp;
          break;
        }
      }
    }
    if (clsProp!.nodeKind === 'Literal' || clsProp!.options) {
      const existingProp = Object.entries(data.nodeProps).find(
        np =>
          np[1].classProperty === clsProp! &&
          (!np[1].valid || np[1].value === p.value)
      );
      if (existingProp) {
        setNodeProperty(source, existingProp[0], p.value);
      } else {
        addNodeProperty(source, clsProp!, p.value);
      }
    } else {
      const target = impNodes[p.value as string].id;
      const newEdge = {
        id: generateURN(),
        source,
        target,
        data: { classProperty: clsProp! },
        label: clsProp!.name,
        selected: false,
      };
      flowStore.setState(state => {
        state.edges = [...state.edges, newEdge];
      });
    }
  }

  const collapsedNode =
    Object.values(impNodes).find(n => n.classIRI.endsWith('/SpdxDocument')) ??
    impNodes[0];

  if (collapsed) {
    hideTreeNodes(collapsedNode.id);
    selectNode(collapsedNode.id);
  }
}
