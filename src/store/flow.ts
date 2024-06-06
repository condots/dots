import { create } from 'zustand';
import {
  persist,
  PersistStorage,
  devtools,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import superjson from 'superjson';
import { nanoid } from 'nanoid';
import createSelectors from '@/store/createSelectors';

import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeDragHandler,
  applyNodeChanges,
  applyEdgeChanges,
  getOutgoers,
} from 'reactflow';
import type { ReactFlowInstance, OnInit } from 'reactflow';

import {
  Class,
  ClassProperty,
  FlowNode,
  IRI,
  NodeData,
  NodeProperty,
} from '@/types';
import { getItem, ontoStore } from '@/store/onto';
import {
  initNodeProps,
  generateNodeProperty,
  isNodePropertyValid,
} from '@/scripts/app-utils';

type DevtoolsActive = {
  nodeInspector: boolean;
  changeLogger: boolean;
  viewportLogger: boolean;
};

type RFState = {
  nodes: FlowNode[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | undefined;
  devtoolsActive: DevtoolsActive;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeDragStart: NodeDragHandler;
  onNodeDragStop: NodeDragHandler;
  onInit: OnInit;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setDevtoolsActive: (name: keyof DevtoolsActive) => void;
  reset: () => void;
};

const initialState = {
  nodes: [],
  edges: [],
  reactFlowInstance: undefined,
  devtoolsActive: {
    nodeInspector: false,
    changeLogger: false,
    viewportLogger: false,
  },
};

const storage: PersistStorage<RFState> = {
  getItem: name => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return superjson.parse(str);
  },
  setItem: (name, value) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: name => localStorage.removeItem(name),
};

const flowStoreBase = create<RFState>()(
  subscribeWithSelector(
    immer(
      devtools(
        persist(
          (set, get) => ({
            ...initialState,
            onNodesChange: (changes: NodeChange[]) => {
              set({
                nodes: applyNodeChanges(changes, get().nodes),
              });
            },
            onEdgesChange: (changes: EdgeChange[]) => {
              set({
                edges: applyEdgeChanges(changes, get().edges),
              });
            },
            onConnect: (connection: Connection) => {
              set({
                edges: addEdge(connection, get().edges),
              });
            },
            onNodeDragStart: (event, node) => {
              set(state => {
                state.nodes.find(n => n.id === node.id)!.data.active = true;
              });
            },
            onNodeDragStop: (event, node) => {
              set(state => {
                state.nodes.find(n => n.id === node.id)!.data.active = false;
              });
            },
            onInit: (reactFlowInstance: ReactFlowInstance) => {
              set({ reactFlowInstance });
            },
            setNodes: (nodes: Node[]) => {
              set({ nodes });
            },
            setEdges: (edges: Edge[]) => {
              set({ edges });
            },
            setDevtoolsActive: (name: keyof DevtoolsActive) =>
              set(state => {
                state.devtoolsActive[name] = !state.devtoolsActive[name];
              }),
            reset: () => set({ nodes: [], edges: [] }),
          }),
          {
            name: 'flow',
            storage,
          }
        )
      )
    )
  )
);

export const flowStore = createSelectors(flowStoreBase);

export function getNode(nodeId: string | undefined) {
  return flowStore.use.nodes().find(n => n.id === nodeId);
}

export function getNodeProperties(nodeId: string | undefined) {
  if (nodeId) return getNode(nodeId)?.data.nodeProps;
}

export function getNodeProperty(
  nodeId: string | undefined,
  propertyId: string | undefined
) {
  const nodeProperties = getNodeProperties(nodeId);
  if (propertyId) return nodeProperties?.[propertyId];
}

export function addNode(
  type: string,
  x: number,
  y: number,
  classIRI: IRI,
  startAsDragged: boolean = false
) {
  const nodeId = nanoid();
  const position = flowStore
    .getState()
    .reactFlowInstance!.screenToFlowPosition({ x, y });
  const recClsProps = ontoStore.getState().allRecClsProps![classIRI];
  const data: NodeData = {
    startAsDragged,
    isNode: true,
    active: false,
    menuOpen: false,
    expanded: false,
    cls: getItem(classIRI) as Class,
    nodeProps: initNodeProps(recClsProps),
  };

  const node: FlowNode = { id: nodeId, position, data, type, selected: true };
  flowStore.setState(state => {
    // Only select the new node
    state.nodes.forEach(n => {
      n.selected = false;
    });
    state.nodes.push(node);
  });
  return nodeId;
}

export function deleteNode(nodeId: string) {
  const state = flowStore.getState();
  const node = state.nodes.find(n => n.id === nodeId);
  state.reactFlowInstance!.deleteElements({ nodes: [node!], edges: [] });
}

export function addNodeProperty(
  nodeId: string,
  classProperty: ClassProperty,
  value: NodeProperty['value'] = undefined
) {
  const nodeProperty = generateNodeProperty(classProperty, value);
  flowStore.setState(state => {
    const data = state.nodes.find(n => n.id === nodeId)!.data;
    data.nodeProps[nodeProperty.id] = nodeProperty;
  });
  return nodeProperty.id;
}

export function setNodeProperty(
  nodeId: string,
  propertyId: string,
  value: NodeProperty['value'] = undefined
) {
  flowStore.setState(state => {
    const nodeProperty = state.nodes.find(n => n.id === nodeId)!.data.nodeProps[
      propertyId
    ];
    if (!nodeProperty) throw new Error('Node property not found');
    nodeProperty.value = value;
    nodeProperty.valid = isNodePropertyValid(nodeProperty);
  });
}

export function deleteNodeProperty(nodeId: string, propertyId: string) {
  flowStore.setState(state => {
    const nodeProperties = state.nodes.find(n => n.id === nodeId)!.data
      .nodeProps;
    delete nodeProperties[propertyId];
  });
}

export const isValidConnection = (connection: Connection) => {
  const state = flowStore.getState();
  const nodes = state.nodes;
  const edges = state.edges;
  const target = nodes.find(node => node.id === connection.target);
  const hasCycle = (node: Node, visited = new Set()) => {
    if (visited.has(node.id)) return false;
    visited.add(node.id);
    for (const outgoer of getOutgoers(node, nodes, edges)) {
      if (outgoer.id === connection.source) return true;
      if (hasCycle(outgoer, visited)) return true;
    }
  };
  if (target!.id === connection.source) return false;
  return !hasCycle(target!);
};

export function setNodeMenuState(nodeId: string, open: boolean) {
  flowStore.setState(state => {
    state.nodes.find(n => n.id === nodeId)!.data.menuOpen = open;
  });
}
