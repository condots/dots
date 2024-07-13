import React from 'react';

import type { ConnectionLineComponentProps } from '@xyflow/react';

import { appStore } from '@/store/app';
import CustomPropertyEdge from '@/components/edge/CustomPropertyEdge';

function ConnectionLine({
  fromNode: sourceNode,
  toX,
  toY,
  connectionLineStyle: style,
}: ConnectionLineComponentProps) {
  return (
    <CustomPropertyEdge
      id={'connection'}
      source={sourceNode!.id}
      targetX={toX}
      targetY={toY}
      style={style}
      label={appStore.getState().draggedPropData?.classProperty.name}
      selected={false}
    />
  );
}

export default ConnectionLine;
