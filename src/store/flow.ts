import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import createSelectors from '@/scripts/createSelectors';

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
import { getItem } from '@/store/onto';
import { isNodePropertyValid } from '@/scripts/app-utils';
import { getRecursiveClassProperties } from '@/scripts/onto-utils';

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
          }
        )
      )
    )
  )
);

export const flowStore = createSelectors(flowStoreBase);

export const getNode = (nodeId: string | undefined) => {
  return flowStore.use.nodes().find(n => n.id === nodeId);
};

export const getNodeProperties = (nodeId: string | undefined) => {
  if (nodeId) return getNode(nodeId)?.data.dataProperties;
};

export const getNodeProperty = (
  nodeId: string | undefined,
  propertyId: string | undefined
) => {
  const nodeProperties = getNodeProperties(nodeId);
  if (propertyId) return nodeProperties?.[propertyId];
};

export const addNode = (
  type: string,
  x: number,
  y: number,
  classiri: IRI,
  startAsDragged: boolean = false
) => {
  const nodeId = nanoid();
  const position = flowStore
    .getState()
    .reactFlowInstance!.screenToFlowPosition({ x, y });
  const cls = getItem(classiri) as Class;
  const recursiveClassProperties = getRecursiveClassProperties(classiri);
  const dataProperties = {} as NodeData['dataProperties'];
  for (const classProperties of recursiveClassProperties.values()) {
    for (const classProperty of Object.values(classProperties)) {
      if (
        classProperty.required &&
        classProperty.nodeKind !== 'BlankNodeOrIRI'
      ) {
        const nodeProperty = generateNodeProperty(classProperty);
        dataProperties[nodeProperty.id] = nodeProperty;
      }
    }
  }
  const data: NodeData = {
    startAsDragged,
    isNode: true,
    active: false,
    cls,
    recursiveClassProperties,
    dataProperties,
  };

  const node: FlowNode = { id: nodeId, position, data, type };
  flowStore.setState(state => {
    state.nodes.push(node);
  });
  return nodeId;
};

export const deleteNode = (nodeId: string) => {
  const state = flowStore.getState();
  const node = state.nodes.find(n => n.id === nodeId);
  state.reactFlowInstance!.deleteElements({ nodes: [node!], edges: [] });
};

export const generateNodeProperty = (
  classProperty: ClassProperty,
  value: NodeProperty['value'] = undefined
) => {
  const nodeProperty: NodeProperty = {
    id: nanoid(),
    classProperty,
    value,
    valid: false,
  };
  if (classProperty.datatype === 'boolean') {
    nodeProperty.value = Boolean(value);
    nodeProperty.valid = true;
  } else {
    nodeProperty.valid = isNodePropertyValid(nodeProperty);
  }
  return nodeProperty;
};

export const addNodeProperty = (
  nodeId: string,
  classProperty: ClassProperty,
  value: NodeProperty['value'] = undefined
) => {
  const nodeProperty = generateNodeProperty(classProperty, value);
  flowStore.setState(state => {
    const data = state.nodes.find(n => n.id === nodeId)!.data;
    data.dataProperties[nodeProperty.id] = nodeProperty;
  });
  return nodeProperty.id;
};

export const setNodeProperty = (
  nodeId: string,
  propertyId: string,
  value: NodeProperty['value'] = undefined
) => {
  flowStore.setState(state => {
    const nodeProperty = state.nodes.find(n => n.id === nodeId)!.data
      .dataProperties[propertyId];
    if (!nodeProperty) throw new Error('Node property not found');
    nodeProperty.value = value;
    nodeProperty.valid = isNodePropertyValid(nodeProperty);
  });
};

export const deleteNodeProperty = (nodeId: string, propertyId: string) => {
  flowStore.setState(state => {
    const nodeProperties = state.nodes.find(n => n.id === nodeId)!.data
      .dataProperties;
    delete nodeProperties[propertyId];
  });
};

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
