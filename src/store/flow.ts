import { create } from 'zustand';
import {
  persist,
  PersistStorage,
  devtools,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import superjson from 'superjson';
import createSelectors from '@/store/createSelectors';

import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  OnSelectionChangeFunc,
  OnNodesDelete,
  NodeDragHandler,
  applyNodeChanges,
  applyEdgeChanges,
  getOutgoers,
  getIncomers,
} from 'reactflow';
import type {
  ReactFlowInstance,
  OnInit,
  OnSelectionChangeParams,
  XYPosition,
} from 'reactflow';

import {
  Class,
  ClassProperties,
  ClassProperty,
  DevtoolsActive,
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
  generateURN,
} from '@/scripts/app-utils';
import { appStore } from './app';

type RFState = {
  nodes: FlowNode[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | undefined;
  devtoolsActive: DevtoolsActive;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onSelectionChange: OnSelectionChangeFunc;
  onNodeDragStart: NodeDragHandler;
  onNodeDragStop: NodeDragHandler;
  onInit: OnInit;
  onNodesDelete: OnNodesDelete;
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

const myPersist: typeof persist = !import.meta.env.PROD
  ? persist
  : (fn: any) => fn;

export const flowStoreBase = create<RFState>()(
  immer(
    devtools(
      subscribeWithSelector(
        myPersist(
          (set, get) => ({
            ...initialState,
            onNodesChange: (changes: NodeChange[]) => {
              set(state => {
                state.nodes = applyNodeChanges(changes, state.nodes);
              });
            },
            onEdgesChange: (changes: EdgeChange[]) => {
              set({
                edges: applyEdgeChanges(changes, get().edges),
              });
            },
            onConnect: (connection: Connection) => {
              const newEdge = {
                ...connection,
                id: generateURN(),
                type: 'inst',
                source: connection.source!,
                target: connection.target!,
                label: appStore.getState().draggedPropData?.classProperty.name,
                data: appStore.getState().draggedPropData,
              };
              appStore.setState(state => {
                state.draggedPropData = undefined;
              });
              set(state => {
                state.edges = [...state.edges, newEdge];
              });
            },
            onSelectionChange: (params: OnSelectionChangeParams) => {
              const selectedNodes = params.nodes.map(param => param.id);
              set(state => {
                state.nodes.forEach(n => {
                  if (!selectedNodes.includes(n.id)) {
                    n.data.expanded = false;
                  }
                });
              });
            },
            onNodeDragStart: (_, node) => {
              set(state => {
                state.nodes.find(n => n.id === node.id)!.data.active = true;
              });
            },
            onNodeDragStop: (_, node) => {
              set(state => {
                state.nodes.find(n => n.id === node.id)!.data.active = false;
              });
            },
            onInit: (reactFlowInstance: ReactFlowInstance) => {
              set({ reactFlowInstance });
            },
            onNodesDelete: (nodes: Node[]) => {
              const nodesToDelete: Node[] = [];
              for (const node of nodes) {
                const collapsedNodes = get().nodes.filter(n =>
                  node.data.hiddenNodes.includes(n.id)
                );
                nodesToDelete.push(...collapsedNodes);
              }
              get().reactFlowInstance!.deleteElements({ nodes: nodesToDelete });
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
            reset: () =>
              set({ nodes: initialState.nodes, edges: initialState.edges }),
          }),
          {
            name: 'flow',
            storage,
          }
        )
      ),
      { enabled: !import.meta.env.PROD }
    )
  )
);

export const flowStore = createSelectors(flowStoreBase);

export function useNode(nodeId: string | undefined) {
  return flowStore.use.nodes().find(n => n.id === nodeId);
}

export function getNode(nodeId: string | undefined) {
  return flowStore.getState().nodes.find(n => n.id === nodeId);
}

export function useNodeProperties(nodeId: string | undefined) {
  if (nodeId) return useNode(nodeId)?.data.nodeProps;
}

export function useNodeProperty(
  nodeId: string | undefined,
  propertyId: string | undefined
) {
  const nodeProperties = useNodeProperties(nodeId);
  if (propertyId) return nodeProperties?.[propertyId];
}

export function selectNode(nodeId?: string) {
  flowStore.setState(state => {
    state.nodes.forEach(n => {
      n.selected = n.id === nodeId;
    });
  });
}

export function selectEdge(edgeId?: string) {
  flowStore.setState(state => {
    state.edges.forEach(e => {
      e.selected = e.id === edgeId;
    });
  });
}

export const screenToCanvas = (x: number, y: number) =>
  flowStore.getState().reactFlowInstance!.screenToFlowPosition({ x, y });

export function addNode(
  type: string,
  id: string,
  classIRI: IRI,
  position: XYPosition
) {
  const recClsProps = ontoStore.getState().allRecClsProps![classIRI];
  const inheritanceList = [...recClsProps.keys()];
  const isElement = !!inheritanceList.find(c => c.endsWith('/Core/Element'));
  const data: NodeData = {
    active: false,
    expanded: false,
    isElement: isElement,
    cls: getItem(classIRI) as Class,
    inheritanceList: inheritanceList,
    nodeProps: initNodeProps(recClsProps),
    recClsProps: recClsProps,
    hiddenNodes: [],
  };

  const node: FlowNode = { id, position, data, type };
  flowStore.setState(state => {
    state.nodes.push(node);
  });
  return id;
}

export function deselectAll() {
  selectNode();
  selectEdge();
}

export function deleteNode(nodeId: string) {
  const state = flowStore.getState();
  const node = state.nodes.find(n => n.id === nodeId)!;
  state.reactFlowInstance!.deleteElements({ nodes: [node], edges: [] });
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

export function isValidConnection(connection: Connection) {
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
}

export function setNodeExpanded(nodeId: string, open: boolean) {
  flowStore.setState(state => {
    state.nodes.find(n => n.id === nodeId)!.data.expanded = open;
  });
}

export function getNodeOutgoers(nodeId: string) {
  const state = flowStore.getState();
  const nodes = state.nodes;
  const edges = state.edges;
  const node = nodes.find(node => node.id === nodeId);
  return node ? getOutgoers(node, nodes, edges) : [];
}

export function getNodeIncomers(nodeId: string) {
  const state = flowStore.getState();
  const nodes = state.nodes;
  const edges = state.edges;
  const node = nodes.find(node => node.id === nodeId);
  return node ? getIncomers(node, nodes, edges) : [];
}

export function getNodeOutEdges(nodeId: string) {
  return flowStore.getState().edges.filter(edge => edge.source === nodeId);
}

export function getNodeTree(node: FlowNode) {
  const queue: FlowNode[] = [node];
  const visited = new Set<FlowNode>();
  const result: FlowNode[] = [];

  while (queue.length) {
    const n = queue.shift()!;

    if (!visited.has(n)) {
      visited.add(n);
      result.push(n);

      for (const nn of [...getNodeOutgoers(n.id), ...getNodeIncomers(n.id)]) {
        queue.push(nn);
      }
    }
  }
  return result;
}

export function outEdgeCount(nodeId: string, path: IRI) {
  const edges = flowStore
    .getState()
    .edges.filter(
      edge => edge.data.classProperty.path === path && edge.source === nodeId
    );
  return edges?.length || 0;
}

export function isUnmetClsProp(
  node: FlowNode | undefined,
  clsProp: ClassProperty
) {
  return node && clsProp.targetClass && clsProp.minCount
    ? outEdgeCount(node.id, clsProp.path) < clsProp.minCount
    : false;
}

export function hasUnmetProfileClsProps(
  node: FlowNode | undefined,
  clsProps: ClassProperties
) {
  for (const clsProp of Object.values(clsProps) || []) {
    if (isUnmetClsProp(node, clsProp)) return true;
  }
  return false;
}

export function hasUnmetNodeClsProps(node: FlowNode | undefined) {
  for (const clsProps of node?.data.recClsProps.values() || []) {
    if (hasUnmetProfileClsProps(node, clsProps)) return true;
  }
  return false;
}

export function hideTreeNodes(nodeId: string) {
  flowStore.setState(state => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node || node.data.hiddenNodes.length > 0) return;
    node.data.hiddenNodes = getNodeTree(node)
      .filter(n => n.id !== node.id)
      .map(n => n.id);
    for (const hn of node.data.hiddenNodes) {
      state.nodes.find(n => n.id === hn)!.hidden = true;
    }
    node.data.initialHidePosition = node.position;
  });
}

export function unhideTreeNodes(nodeId: string) {
  flowStore.setState(state => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node || node.data.hiddenNodes.length === 0) return;
    const offset = {
      x: node.position.x - node.data.initialHidePosition!.x,
      y: node.position.y - node.data.initialHidePosition!.y,
    };
    for (const hn of node.data.hiddenNodes) {
      const nd = state.nodes.find(n => n.id === hn)!;
      nd.hidden = false;
      nd.position = {
        x: nd.position.x + offset.x,
        y: nd.position.y + offset.y,
      };
    }
    node.data.hiddenNodes = [];
    node.selected = false;
  });
}
