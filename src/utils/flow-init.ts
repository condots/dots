import InstNode from "@/components/InstEditor/InstNode";
import InstEdge from "@/components/InstEditor/InstEdge";
import {
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  DefaultEdgeOptions,
  MarkerType,
} from "reactflow";

export const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      iri: "https://spdx.org/rdf/3.0.0/terms/Software/File",
      inst: true,
    },
    type: "inst",
  },
  {
    id: "2",
    position: { x: 200, y: 350 },
    data: {
      iri: "https://spdx.org/rdf/3.0.0/terms/AI/SafetyRiskAssessmentType",
      inst: true,
    },
    type: "inst",
  },
] satisfies Node[];

export const initialEdges = [
  {
    id: "1-2",
    source: "1",
    target: "2",
    data: {
      property: "edge label",
    },
  },
] satisfies Edge[];

export const nodeTypes = {
  inst: InstNode,
} satisfies NodeTypes;

export const edgeTypes = {
  inst: InstEdge,
} satisfies EdgeTypes;

export const defaultEdgeOptions = {
  type: "inst",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    strokeWidth: 2,
    width: 30,
    height: 30,
  },
  data: {},
} satisfies DefaultEdgeOptions;
