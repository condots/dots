import React from 'react';

import type { ConnectionLineComponentProps } from 'reactflow';

import { appStore } from '@/store/app';
import EdgeInst from './EdgeInst';

function ConnectionLine({
  fromNode: sourceNode,
  toX,
  toY,
  connectionLineStyle: style,
}: ConnectionLineComponentProps) {
  return (
    <EdgeInst
      id={'connection'}
      source={sourceNode!.id}
      targetX={toX}
      targetY={toY}
      markerEnd="url('#1__color=#00416b&amp;height=20&amp;strokeWidth=1&amp;type=arrowclosed&amp;width=20')"
      style={style}
      label={appStore.getState().draggedPropData?.classProperty.name}
      selected={false}
    />
  );
}

export default ConnectionLine;
