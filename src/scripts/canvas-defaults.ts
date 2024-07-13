import {
  DefaultEdgeOptions,
  EdgeTypes,
  MarkerType,
  NodeTypes,
} from '@xyflow/react';

import CustomClassNode from '@/components/node/CustomClassNode';
import Origin from '@/components/Origin';
import CustomPropertyEdge from '@/components/edge/CustomPropertyEdge';

export const nodeTypes = {
  inst: CustomClassNode,
  origin: Origin,
} satisfies NodeTypes;

export const edgeTypes = {
  inst: CustomPropertyEdge,
} satisfies EdgeTypes;

export const connectionLineStyle = {
  strokeWidth: 4,
  stroke: '#00416b',
  strokeDasharray: 7,
};

export const defaultEdgeOptions = {
  type: 'inst',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    strokeWidth: 2,
    width: 20,
    height: 20,
    color: connectionLineStyle.stroke,
  },
  style: { stroke: connectionLineStyle.stroke },
  data: {},
} satisfies DefaultEdgeOptions;

export const snapGrid: [number, number] = [260, 82];
