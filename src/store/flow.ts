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
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  OnSelectionChangeFunc,
  OnNodesDelete,
  OnBeforeDelete,
  applyNodeChanges,
  applyEdgeChanges,
  getOutgoers,
  getIncomers,
} from '@xyflow/react';
import type {
  ReactFlowInstance,
  OnInit,
  XYPosition,
  OnNodeDrag,
} from '@xyflow/react';

import {
  Class,
  ClassProperties,
  ClassProperty,
  ClassNode,
  IRI,
  NodeData,
  NodeProperty,
  PropertyEdge,
} from '@/types';
import { getItem, ontoStore } from '@/store/onto';
import {
  initNodeProps,
  generateNodeProperty,
  isNodePropertyValid,
  generateURN,
} from '@/scripts/app-utils';
import { appStore } from '@/store/app';

type DevtoolsActive = {
  nodeInspector: boolean;
  changeLogger: boolean;
  viewportLogger: boolean;
};

type RFState = {
  nodes: ClassNode[];
  edges: PropertyEdge[];
  reactFlowInstance: ReactFlowInstance<ClassNode, PropertyEdge> | undefined;
  devtoolsActive: DevtoolsActive;
  nodesToDelete: string[];
  onNodesChange: OnNodesChange<ClassNode>;
  onEdgesChange: OnEdgesChange<PropertyEdge>;
  onConnect: OnConnect;
  onSelectionChange: OnSelectionChangeFunc;
  onNodeDragStart: OnNodeDrag<ClassNode>;
  onNodeDragStop: OnNodeDrag<ClassNode>;
  onInit: OnInit<ClassNode, PropertyEdge>;
  onNodesDelete: OnNodesDelete<ClassNode>;
  onBeforeDelete: OnBeforeDelete<ClassNode, PropertyEdge>;
  setNodes: (nodes: ClassNode[]) => void;
  setEdges: (edges: PropertyEdge[]) => void;
  setDevtoolsActive: (name: keyof DevtoolsActive) => void;
  reset: () => void;
};

const initialState = {
  nodes: [],
  edges: [],
  nodesToDelete: [],
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

export const flowStoreBase = create<RFState>()(
  immer(
    devtools(
      subscribeWithSelector(
        persist(
          (set, get) => ({
            ...initialState,
            onNodesChange: changes => {
              set(state => {
                state.nodes = applyNodeChanges(changes, state.nodes);
              });
            },
            onEdgesChange: changes => {
              set({
                edges: applyEdgeChanges(changes, get().edges),
              });
            },
            onConnect: connection => {
              const newEdge: PropertyEdge = {
                ...connection,
                id: generateURN(),
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
            onSelectionChange: params => {
              const selectedNodes = params.nodes.map(param => param.id);
              set(state => {
                state.nodes.forEach(n => {
                  if (!selectedNodes.includes(n.id)) {
                    n.data.showPropFields = false;
                  }
                });
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
            onInit: reactFlowInstance => {
              set({ reactFlowInstance });
            },
            onNodesDelete: nodes => {
              const toDelete: ClassNode[] = [];
              for (const nid of get().nodesToDelete) {
                const nn = get().nodes.find(n => n.id === nid);
                nn && toDelete.push(nn);
              }
              set(state => {
                state.nodesToDelete = [];
              });
              toDelete.length &&
                get().reactFlowInstance!.deleteElements({
                  nodes: toDelete,
                });
            },
            onBeforeDelete: async ({ nodes, edges }) => {
              const toDelete = new Set<string>();
              for (const node of nodes) {
                if (node.data.collapsed) {
                  const tree = getNodeTree(node).slice(1);
                  if (tree.length) {
                    tree.map(n => n.id).forEach(toDelete.add, toDelete);
                  }
                }
              }
              toDelete.size &&
                set(state => {
                  state.nodesToDelete = [...toDelete];
                });
              return true;
            },
            setNodes: nodes => {
              set({ nodes: [...nodes] });
            },
            setEdges: edges => {
              set({ edges });
            },
            setDevtoolsActive: name =>
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
      )
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
  const node = useNode(nodeId);
  if (node) return node.data.nodeProps;
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

export function addNode(id: string, classIRI: IRI, position: XYPosition) {
  const recClsProps = ontoStore.getState().allRecClsProps![classIRI];
  const data: NodeData = {
    active: false,
    showPropFields: false,
    cls: getItem(classIRI) as Class,
    inheritanceList: [...recClsProps.keys()],
    nodeProps: initNodeProps(recClsProps),
    recClsProps: recClsProps,
    collapsed: false,
    collapsedNodes: [],
  };

  const node: ClassNode = { id, position, data, type: 'inst' };
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
  const hasCycle = (node: ClassNode, visited = new Set()) => {
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

export function getNodeOutgoers(nodeId: string) {
  const state = flowStore.getState();
  const nodes = state.nodes;
  const edges = state.edges;
  const node = nodes.find(node => node.id === nodeId);
  return node ? getOutgoers(node, nodes, edges) : [];
}

export function getNodeIncomers(
  nodeId: string,
  onlyFromRelationship: boolean = false
) {
  const state = flowStore.getState();
  const nodes = state.nodes;
  const edges = state.edges.filter(
    e => !onlyFromRelationship || e.data?.classProperty.name === 'from'
  );
  const node = nodes.find(node => node.id === nodeId);
  return node ? getIncomers(node, nodes, edges) : [];
}

export function getNodeOutEdges(nodeId: string) {
  return flowStore.getState().edges.filter(edge => edge.source === nodeId);
}

export function getNodeTree(node: ClassNode, stopAtCollapsed = true) {
  const queue: ClassNode[] = [node];
  const visited = new Set<ClassNode>();
  const result: ClassNode[] = [];

  let isRoot = true;
  while (queue.length) {
    const n = queue.shift()!;

    if (!visited.has(n)) {
      visited.add(n);
      result.push(n);

      if (!isRoot && stopAtCollapsed && n.data.collapsed) continue;
      isRoot = false;

      const outgoers = getNodeOutgoers(n.id);
      const incomers = getNodeIncomers(n.id, true);

      for (const nn of [...outgoers, ...incomers]) {
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
      edge => edge.data?.classProperty.path === path && edge.source === nodeId
    );
  return edges?.length || 0;
}

export function isUnmetClsProp(
  node: ClassNode | undefined,
  clsProp: ClassProperty
) {
  return node && clsProp.targetClass && clsProp.minCount
    ? outEdgeCount(node.id, clsProp.path) < clsProp.minCount
    : false;
}

export function hasUnmetProfileClsProps(
  node: ClassNode | undefined,
  clsProps: ClassProperties
) {
  for (const clsProp of Object.values(clsProps) || []) {
    if (isUnmetClsProp(node, clsProp)) return true;
  }
  return false;
}

export function hasUnmetNodeClsProps(node: ClassNode | undefined) {
  for (const clsProps of node?.data.recClsProps.values() || []) {
    if (hasUnmetProfileClsProps(node, clsProps)) return true;
  }
  return false;
}

export function collapseNode(nodeId: string) {
  flowStore.setState(state => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node || node.data.collapsed) return;
    const tree = getNodeTree(node)
      .slice(1)
      .filter(n => n.id !== node.id)
      .map(n => n.id);
    if (tree.length === 0) return;
    for (const hn of tree) {
      state.nodes.find(n => n.id === hn)!.hidden = true;
    }
    node.data.collapsedPosition = node.position;
    node.data.collapsed = true;
  });
}

export function expandNode(nodeId: string) {
  flowStore.setState(state => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node || !node.data.collapsed) return;
    node.data.collapsed = false;
    const tree = getNodeTree(node)
      .slice(1)
      .map(n => n.id);
    const { x, y } = node.data.collapsedPosition!;
    const offset = {
      x: node.position.x - x,
      y: node.position.y - y,
    };
    for (const hn of tree) {
      const nd = state.nodes.find(n => n.id === hn)!;
      nd.hidden = false;
      nd.position = {
        x: nd.position.x + offset.x,
        y: nd.position.y + offset.y,
      };
    }
    node.data.collapsedPosition = undefined;
  });
}

// export function expandNode(nodeId: string) {
//   flowStore.setState(state => {
//     const node = state.nodes.find(n => n.id === nodeId);
//     if (!node || node.data.hiddenNodes.length === 0) return;
//     const offset = {
//       x: node.position.x - node.data.initialCollapsedPosition!.x,
//       y: node.position.y - node.data.initialCollapsedPosition!.y,
//     };
//     for (const hn of node.data.hiddenNodes) {
//       const nd = state.nodes.find(n => n.id === hn)!;
//       nd.hidden = false;
//       nd.position = {
//         x: nd.position.x + offset.x,
//         y: nd.position.y + offset.y,
//       };
//     }
//     node.data.hiddenNodes = [];
//     node.selected = false;
//   });
// }

// const unsCollapsedNodes = flowStore.subscribe(
//   state => new Set(state.nodes.filter(n => n.data.collapsed).map(n => n.id)),
//   (collapsed, prevCollapsed) => {
//     if (!isEqual(collapsed, prevCollapsed)) {
//       // console.log('Collapsed added:', collapsed.difference(prevCollapsed));
//       // console.log('Collapsed removed:', prevCollapsed.difference(collapsed));
//       for (const nodeId of collapsed.difference(prevCollapsed)) {
//         const node = getNode(nodeId)!;
//         const tree = getNodeTree(node)
//           .slice(1)
//           .map(n => n.id);
//         flowStore.setState(state => {
//           const nodes = [...state.nodes];
//           nodes.forEach(n => {
//             if (tree.includes(n.id)) {
//               n.hidden = true;
//             }
//           });
//           state.nodes = nodes;
//         });
//       }
//       for (const nodeId of prevCollapsed.difference(collapsed)) {
//         const node = getNode(nodeId)!;
//         const tree = getNodeTree(node)
//           .slice(1)
//           .map(n => n.id);
//         flowStore.setState(state => {
//           const nodes = [...state.nodes];
//           nodes.forEach(n => {
//             if (tree.includes(n.id)) {
//               n.hidden = false;
//             }
//           });
//           state.nodes = nodes;
//         });
//       }
//     }
//   }
// );
