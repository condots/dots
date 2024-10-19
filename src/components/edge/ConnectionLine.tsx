import React, { useMemo } from 'react';
import { Position, type ConnectionLineComponentProps } from '@xyflow/react';
import { appStore } from '@/store/app';
import PropertyEdge from '@/components/edge/PropertyEdge';

const ConnectionLine = React.memo(function ConnectionLine({
  fromNode: sourceNode,
  toX,
  toY,
  connectionLineStyle: style,
}: ConnectionLineComponentProps) {
  const label = useMemo(
    () => appStore.getState().draggedPropData?.classProperty.name,
    []
  );

  return (
    <PropertyEdge
      id="connection"
      source={sourceNode!.id}
      targetX={toX}
      targetY={toY}
      style={style}
      label={label}
      selected={false}
      target=""
      sourceX={0}
      sourceY={0}
      sourcePosition={Position.Top}
      targetPosition={Position.Top}
    />
  );
});

export default ConnectionLine;
