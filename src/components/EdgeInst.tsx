import React, { useCallback } from 'react';

import {
  useStore,
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from 'reactflow';

import type { EdgeProps } from 'reactflow';

import { getEdgeParams } from '@/scripts/flow-utils.js';

const EdgeInst = ({
  id,
  source,
  target,
  markerEnd,
  style,
  data,
}: EdgeProps) => {
  const sourceNode = useStore(
    useCallback(store => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback(store => store.nodeInternals.get(target), [target])
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
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
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 16,
          }}
          className="nodrag nopan font-lato font-semibold surface-card px-2 py-1 text-xs text-spdx-dark border border-spdx-dark rounded-md"
        >
          {data.classProperty && data.classProperty.name}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default EdgeInst;
