import { memo } from "react";
import { useCallback } from "react";
import { useStore, getSmoothStepPath, EdgeLabelRenderer } from "reactflow";
import type { EdgeProps } from "reactflow";

import { getEdgeParams } from "@/scripts/flow-utils.js";

function InstEdge({ id, source, target, markerEnd, data }: EdgeProps) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
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
      <path
        id={id}
        className="react-flow__edge-interaction"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
        strokeWidth="1"
        stroke="#00416b"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 16,
          }}
          className="font-lato font-bold surface-card px-2 py-1 text-xs text-spdx-dark border border-spdx-dark rounded-md"
        >
          {data.classProperty?.name}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(InstEdge);
