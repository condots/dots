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
  MarkerType,
  ConnectionLineType,
} from "reactflow";
import type { NodeTypes, EdgeTypes, DefaultEdgeOptions } from "reactflow";
import ElementNode from "@/components/SbomEditor/ElementNode";
import ElementEdge from "@/components/SbomEditor/ElementEdge";

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
  nodes: [
    {
      id: "1",
      position: { x: 0, y: 0 },
      data: {
        iri: "https://spdx.org/rdf/3.0.0/terms/Software/File",
        flowElement: true,
      },
      type: "element",
    },
    {
      id: "2",
      position: { x: 200, y: 350 },
      data: {
        iri: "https://spdx.org/rdf/3.0.0/terms/AI/SafetyRiskAssessmentType",
        flowElement: true,
      },
      type: "element",
    },
  ] satisfies Node[],
  edges: [
    {
      id: "1-2",
      source: "1",
      target: "2",
      data: {
        property: "edge label",
      },
    },
  ] satisfies Edge[],
  nodeTypes: {
    element: ElementNode,
  } satisfies NodeTypes,
  edgeTypes: {
    element: ElementEdge,
  } satisfies EdgeTypes,
  defaultEdgeOptions: {
    type: "element",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      strokeWidth: 2,
      width: 30,
      height: 30,
    },
    data: {},
  } satisfies DefaultEdgeOptions,
  connectionLineType: ConnectionLineType.SmoothStep,
  connectionMode: ConnectionMode.Loose,
  devtoolsActive: {
    nodeInspector: false,
    changeLogger: false,
    viewportLogger: false,
  },
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({}))
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
        updateNodeColor: (nodeId: string, color: string) => {
          set.nodes(
            get.nodes().map((node) => {
              if (node.id === nodeId) {
                const n = { ...node, data: { ...node.data, color } };
                return n;
              }
              return node;
            }),
          );
        },
        setDevtoolsActive: (name: string) => {
          set.devtoolsActive({
            ...get.devtoolsActive(),
            [name]: !get.devtoolsActive()[name],
          });
        },
      },
  );
