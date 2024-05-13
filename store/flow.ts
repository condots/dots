import { createStore } from "zustand-x";
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
  ConnectionMode,
  ConnectionLineType,
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
  middlewares: string[];
};

type RFActions = {
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  setDevtoolsActive: (name: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
};

export const flowStore = createStore("flow")(<RFState>{
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
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({
    getNode: (nodeId: string) => get.nodes().find((n) => n.id === nodeId),
  }))
  .extendActions(
    (set, get, api) =>
      <RFActions>{
        onNodesChange: (changes: NodeChange[]) => {
          set.nodes(applyNodeChanges(changes, get.nodes()));
        },
        onEdgesChange: (changes: EdgeChange[]) => {
          set.edges(applyEdgeChanges(changes, get.edges()));
        },
        onConnect: (connection: Connection) => {
          set.edges(addEdge(connection, get.edges()));
        },
        setNodes: (nodes: Node[]) => {
          set.nodes(nodes);
        },
        setEdges: (edges: Edge[]) => {
          set.edges(edges);
        },
        addNode: (node: Node) => {
          set.nodes(get.nodes().concat(node));
        },
        // updateNodeColor: (nodeId: string, color: string) => {
        //   const node = get.getNode(nodeId);
        //   set.nodes(
        //     get.nodes().map((node) => {
        //       if (node.id === nodeId) {
        //         const n = { ...node, data: { ...node.data, color } };
        //         return n;
        //       }
        //       return node;
        //     }),
        //   );
        // },
        setDevtoolsActive: (name: string) => {
          set.devtoolsActive({
            ...get.devtoolsActive(),
            [name]: !get.devtoolsActive()[name],
          });
        },
      },
  );
