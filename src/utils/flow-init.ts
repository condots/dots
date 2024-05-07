import ElementNode from "@/components/SbomEditor/ElementNode";
import ElementEdge from "@/components/SbomEditor/ElementEdge";
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
  element: ElementNode,
} satisfies NodeTypes;

export const edgeTypes = {
  element: ElementEdge,
} satisfies EdgeTypes;

export const defaultEdgeOptions = {
  type: "element",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    strokeWidth: 2,
    width: 30,
    height: 30,
  },
  data: {},
} satisfies DefaultEdgeOptions;
