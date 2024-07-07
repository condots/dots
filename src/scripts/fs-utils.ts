import { Store, DataFactory, Quad_Subject } from 'n3';
const { namedNode, literal, quad } = DataFactory;
import { NS } from '@/scripts/onto-utils';
import { JsonLdSerializer } from 'jsonld-streaming-serializer';
import jsonld from 'jsonld';
import { saveAs } from 'file-saver';
import { flowStore, getNodeOutEdges } from '@/store/flow';
import { FlowNode, Property } from '@/types';
import { getItem, ontoStore } from '@/store/onto';
import { XYPosition } from 'reactflow';

type SubjectMap = Map<string, Quad_Subject>;

function genNodeQuad(store: Store, subjects: SubjectMap, node: FlowNode) {
  const subject = node.data.inheritanceList.includes(
    'https://spdx.org/rdf/3.0.0/terms/Core/Element'
  )
    ? namedNode(node.id)
    : store.createBlankNode(node.id);
  const q = quad(subject, NS.rdf.type, namedNode(node.data.cls.iri));
  store.add(q);
  genPropQuads(store, subject, node);
  subjects.set(node.id, subject);
}

function genPropQuads(store: Store, subject: Quad_Subject, node: FlowNode) {
  for (const nodeProp of Object.values(node.data.nodeProps)) {
    if (!nodeProp.valid) throw new Error('propQuad is null');

    const predicate = namedNode(nodeProp.classProperty.path);
    let object = nodeProp.value;
    const clsProp = nodeProp.classProperty;
    if (clsProp.nodeKind === 'Literal') {
      if (nodeProp.classProperty.datatype === 'dateTimeStamp') {
        object = `${object}Z`;
      }
      const dt = (getItem(nodeProp.classProperty.path) as Property).datatype!;
      object = literal(object, namedNode(dt));
    }
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
  return store;
}

export async function exportSpdxJsonLd(
  nodes?: FlowNode[],
  name: string = 'sbom'
) {
  if (!nodes) {
    nodes = flowStore.getState().nodes;
  }
  const store = genSpdxGraph(nodes);
  const data: string[] = await new Promise((resolve, reject) => {
    const data: string[] = [];
    new JsonLdSerializer()
      .import(store.match(null, null, null, null))
      .on('data', d => data.push(d))
      .on('error', reject)
      .on('end', () => resolve(data));
  });
  const doc = JSON.parse(data.join(' '));
  const ctx = ontoStore.getState().jsonLdContext!;
  const compacted = await jsonld.compact(doc, ctx);
  compacted['@context'] = 'https://spdx.org/rdf/3.0.0/spdx-context.jsonld';

  const dots: Record<string, XYPosition> = {};
  for (const node of nodes) {
    dots[node.id] = node.position;
  }
  compacted.dots = dots;

  const blob = new Blob([JSON.stringify(compacted, null, 2)], {
    type: 'application/ld+json;charset=utf-8',
  });
  saveAs(blob, `${name}.json`);
}
