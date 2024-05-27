import types from "@/types";
import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import createSelectors from "@/scripts/createSelectors";
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
} from "reactflow";
import type {
  OnNodesDelete,
  OnEdgesDelete,
  ReactFlowInstance,
  OnInit,
} from "reactflow";
import { isNodePropertyValid } from "@/scripts/app-utils";
import { getItem } from "@/store/onto";
import { getRecursiveClassProperties } from "@/scripts/onto-utils";

type DevtoolsActive = {
  nodeInspector: boolean;
  changeLogger: boolean;
  viewportLogger: boolean;
};

type RFState = {
  nodes: types.FlowNode[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | undefined;
  devtoolsActive: DevtoolsActive;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodesDelete: OnNodesDelete;
  onEdgesDelete: OnEdgesDelete;
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
            onNodesDelete: (nodes: Node[]) => {},
            onEdgesDelete: (edges: Edge[]) => {},
            onConnect: (connection: Connection) => {
              set({
                edges: addEdge(connection, get().edges),
              });
            },
            onNodeDragStart: (event, node) => {
              set((state) => {
                state.nodes.find((n) => n.id === node.id)!.data.active = true;
              });
            },
            onNodeDragStop: (event, node) => {
              set((state) => {
                state.nodes.find((n) => n.id === node.id)!.data.active = false;
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
              set((state) => {
                state.devtoolsActive[name] = !state.devtoolsActive[name];
              }),
            reset: () => set({ nodes: [], edges: [] }),
          }),
          {
            name: "flow",
          }
        )
      )
    )
  )
);

export const flowStore = createSelectors(flowStoreBase);

export const getNode = (nodeId: string | undefined) => {
  return flowStore.use.nodes().find((n) => n.id === nodeId);
};

export const getNodeProperties = (nodeId: string | undefined) => {
  if (nodeId) return getNode(nodeId)?.data.properties;
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
  classiri: types.IRI
) => {
  const nodeId = nanoid();
  const position = flowStore
    .getState()
    .reactFlowInstance!.screenToFlowPosition({ x, y });
  const cls = getItem(classiri) as types.Class;
  const data: types.NodeData = {
    isNode: true,
    active: false,
    cls,
    properties: {},
  };

  const node: types.FlowNode = { id: nodeId, position, data, type };
  flowStore.setState((state) => {
    state.nodes.push(node);
  });
  return nodeId;
};

export const deleteNode = (nodeId: string) => {
  flowStore.setState((state) => {
    const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex > -1) {
      state.nodes.splice(nodeIndex, 1);
    }
  });
};

export const addNodeProperty = (
  nodeId: string,
  classProperty: types.ClassProperty,
  value: types.NodeProperty["value"] = undefined
) => {
  const propertyId = nanoid();
  flowStore.setState((state) => {
    const nodeProperty: types.NodeProperty = {
      id: propertyId,
      classProperty,
      value,
      valid: false,
    };
    if (classProperty.datatype === "boolean") {
      nodeProperty.value = Boolean(value);
    }
    nodeProperty.valid = isNodePropertyValid(nodeProperty);
    const data = state.nodes.find((n) => n.id === nodeId)!.data;
    data.properties[propertyId] = nodeProperty;
  });
  return propertyId;
};

export const setNodeProperty = (
  nodeId: string,
  propertyId: string,
  value: types.NodeProperty["value"] = undefined
) => {
  flowStore.setState((state) => {
    const nodeProperty = state.nodes.find((n) => n.id === nodeId)!.data
      .properties[propertyId];
    if (!nodeProperty) throw new Error("Node property not found");
    nodeProperty.value = value;
    nodeProperty.valid = isNodePropertyValid(nodeProperty);
  });
};

export const deleteNodeProperty = (nodeId: string, propertyId: string) => {
  flowStore.setState((state) => {
    const nodeProperties = state.nodes.find((n) => n.id === nodeId)!.data
      .properties;
    delete nodeProperties[propertyId];
  });
};
