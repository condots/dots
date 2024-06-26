import React from 'react';

import type { ConnectionLineComponentProps, Node } from 'reactflow';
import { getSmoothStepPath } from 'reactflow';

import { getEdgeParams } from '@/scripts/flow-utils';

function ConnectionLine({
  fromNode: sourceNode,
  toX,
  toY,
  connectionLineStyle,
}: ConnectionLineComponentProps) {
  const targetNode = {
    width: 5,
    height: 5,
    positionAbsolute: { x: toX, y: toY },
  };

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode!,
    targetNode as Node
  );

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <g>
        <path
          style={connectionLineStyle}
          fill="none"
          d={edgePath}
          markerEnd="url('#1__color=#00416b&amp;height=20&amp;strokeWidth=1&amp;type=arrowclosed&amp;width=20')"
        />
        <circle
          cx={toX}
          cy={toY}
          fill="black"
          r={3}
          stroke="black"
          strokeWidth={1.5}
        />
      </g>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          fontSize: 16,
        }}
        className="nodrag nopan font-lato font-semibold surface-card px-2 py-1 text-xs text-spdx-dark border border-spdx-dark rounded-md"
      >
        {/* {data.classProperty.name} */}
        label
      </div>
    </>
  );
}

export default ConnectionLine;
