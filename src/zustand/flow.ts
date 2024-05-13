import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/utils/createSelectors";
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
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionLineType,
  ConnectionMode,
} from "reactflow";
import type { NodeTypes, EdgeTypes, DefaultEdgeOptions } from "reactflow";

type DevtoolsActive = {
  nodeInspector: boolean;
  changeLogger: boolean;
  viewportLogger: boolean;
};

type RFState = {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  defaultEdgeOptions: DefaultEdgeOptions;
  connectionLineType: ConnectionLineType;
  connectionMode: ConnectionMode;
  devtoolsActive: DevtoolsActive;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setDevtoolsActive: (name: keyof DevtoolsActive) => void;
  getNode: (nodeId: string) => Node | undefined;
};

const flowStoreBase = create<RFState>()(
  immer(
    devtools(
      persist(
        (set, get) => ({
          nodes: [],
          edges: [],
          nodeTypes: {},
          edgeTypes: {},
          defaultEdgeOptions: {},
          connectionLineType: ConnectionLineType.SmoothStep,
          connectionMode: ConnectionMode.Loose,
          devtoolsActive: {
            nodeInspector: false,
            changeLogger: false,
            viewportLogger: false,
          },
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
          getNode: (nodeId: string) => get().nodes.find((n) => n.id === nodeId),
        }),
        {
          name: "flow",
        },
      ),
    ),
  ),
);

export const flowStore = createSelectors(flowStoreBase);

export const addNode = (node: Node) => {
  flowStore.setState((state) => {
    state.nodes.push(node);
  });
};
