import React from 'react';

import type { ConnectionLineComponentProps, Node } from 'reactflow';
import { EdgeLabelRenderer, getSmoothStepPath, useStore } from 'reactflow';

import { getEdgeParams } from '@/scripts/flow-utils';
import { appStore } from '@/store/app';

const connectionEndHandleSelector = state => state.connectionEndHandle;
const nodeInternalsSelector = state => state.nodeInternals;

function ConnectionLine({
  fromNode: sourceNode,
  toX,
  toY,
  connectionLineStyle: style,
}: ConnectionLineComponentProps) {
  const label = appStore.getState().draggedPropData?.classProperty.name;
  const targetNodeId = useStore(connectionEndHandleSelector)?.nodeId;
  const nodeInternals = useStore(nodeInternalsSelector);

  const targetNode = targetNodeId
    ? nodeInternals.get(targetNodeId)
    : {
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
      <path
        style={style}
        fill="none"
        d={edgePath}
        markerEnd="url('#1__color=#00416b&amp;height=20&amp;strokeWidth=1&amp;type=arrowclosed&amp;width=20')"
      ></path>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 16,
          }}
          className="nodrag nopan font-lato font-semibold surface-card px-2 py-1 text-xs text-spdx-dark border border-spdx-dark rounded-md"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default ConnectionLine;
