import { Position, type ConnectionLineComponentProps } from 'reactflow';

import { appStore } from '@/store/app';
import PropertyEdge from '@/components/edge/PropertyEdge';

function ConnectionLine({
  fromNode: sourceNode,
  toX,
  toY,
  connectionLineStyle: style,
}: ConnectionLineComponentProps) {
  return (
    <PropertyEdge
      id={'connection'}
      source={sourceNode!.id}
      targetX={toX}
      targetY={toY}
      style={style}
      label={appStore.getState().draggedPropData?.classProperty.name}
      selected={false}
      // below dummy props are required by reactflow
      target=""
      sourceX={0}
      sourceY={0}
      sourcePosition={Position.Top}
      targetPosition={Position.Top}
    />
  );
}

export default ConnectionLine;
