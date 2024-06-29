import React, { useCallback, useMemo, useRef } from 'react';

import {
  useStore,
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useEdges,
} from 'reactflow';

import type { EdgeProps } from 'reactflow';

import { getEdgeParams } from '@/scripts/flow-utils.js';

const connectionStartHandleSelector = state => state.connectionStartHandle;
const connectionEndHandleSelector = state => state.connectionEndHandle;

const EdgeInst = ({
  id,
  source,
  target: edgeTarget,
  targetX,
  targetY,
  markerEnd,
  style,
  label,
  selected,
}: EdgeProps) => {
  const connectionSource = useStore(connectionStartHandleSelector)?.nodeId;
  const connectionTarget = useStore(connectionEndHandleSelector)?.nodeId;
  const target = edgeTarget ?? connectionTarget;
  const labelRef = useRef<HTMLDivElement>(null);
  const edges = useEdges();
  const siblingEdges = edges.filter(
    edge => edge.source === source && edge.target === target
  );

  const sourceNode = useStore(
    useCallback(store => store.nodeInternals.get(source), [source])
  )!;
  const targetNode = useStore(
    useCallback(store => store.nodeInternals.get(target), [target])
  )!;

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode ?? {
      width: 5,
      height: 5,
      positionAbsolute: { x: targetX, y: targetY },
    }
  );

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const labelHeight = 27;

  const marginTop = useMemo(() => {
    if (!target) {
      return -labelHeight / 2;
    }
    const pendingConnection =
      source === connectionSource && target === connectionTarget;
    const combinedHeight =
      labelHeight * (siblingEdges.length + Number(pendingConnection));
    const labelIndex =
      id === 'connection'
        ? siblingEdges.length
        : siblingEdges.map(edge => edge.id).indexOf(id);
    return labelIndex * labelHeight - combinedHeight / 2;
  }, [id, connectionSource, connectionTarget, siblingEdges, source, target]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        interactionWidth={0}
      />
      <EdgeLabelRenderer>
        <div
          ref={labelRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, 0) translate(${labelX}px, ${labelY}px)`,
            height: labelHeight,
            marginTop: marginTop,
          }}
          className={`nopan flex items-center pointer-events-auto cursor-pointer
            font-medium text-xs text-spdx-dark border-spdx-dark
          `}
        >
          <div
            className={`flex px-2 py-0.5 border-1 bg-white border-1 border-spdx-dark rounded-md 
              ${selected && 'border-2'}
            `}
          >
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default EdgeInst;
