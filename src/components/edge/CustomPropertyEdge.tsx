import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useStore,
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useEdges,
  useOnSelectionChange,
  useInternalNode,
} from '@xyflow/react';

import type { Node, Edge, EdgeProps } from '@xyflow/react';

import { getEdgeParams } from '@/scripts/edge-utils.js';
import { parseIRI } from '@/scripts/app-utils';
import { InternalClassNode, PropertyEdge } from '@/types';

const connectionStartHandleSelector = state => state.connectionStartHandle;
const connectionEndHandleSelector = state => state.connectionEndHandle;

const CustomPropertyEdge = ({
  id,
  source,
  target: edgeTarget,
  targetX,
  targetY,
  markerEnd,
  style,
  label,
  selected,
}: EdgeProps<PropertyEdge>) => {
  const connectionSource = useStore(connectionStartHandleSelector)?.nodeId;
  const connectionTarget = useStore(connectionEndHandleSelector)?.nodeId;
  const target = edgeTarget ?? connectionTarget;
  const labelRef = useRef<HTMLDivElement>(null);
  const edges = useEdges();
  const siblingEdges = edges.filter(
    edge => edge.source === source && edge.target === target
  );

  const sourceNode = useInternalNode(source) as InternalClassNode;
  const targetNode = useInternalNode(target) as InternalClassNode;

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode ?? {
      measured: {
        width: 5,
        height: 5,
      },
      internals: { positionAbsolute: { x: targetX, y: targetY } },
    }
  );

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
    borderRadius: 20,
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

  const isRelationshipEdge = useMemo(
    () =>
      sourceNode.data.inheritanceList.findIndex(
        (v: string) => parseIRI(v).name === 'Relationship'
      ) !== -1,
    [sourceNode]
  );

  const relationshipStyle = isRelationshipEdge && {
    strokeDasharray: 5,
    animation: 'dashdraw 0.5s linear infinite',
    animationDirection: label === 'from' ? 'reverse' : 'normal',
  };

  const edgeRef = useRef(null);
  const [edgeZIndex, setEdgeZIndex] = useState(null);

  useEffect(() => {
    const getZIndexOfSvg = () => {
      if (edgeRef.current) {
        let currentElement = edgeRef.current;
        while (
          currentElement &&
          currentElement.tagName.toLowerCase() !== 'svg'
        ) {
          currentElement = currentElement.parentElement;
        }
        if (currentElement) {
          const computedStyles = window.getComputedStyle(currentElement);
          const zIndex = computedStyles.getPropertyValue('z-index');
          setEdgeZIndex(zIndex);
        }
      }
    };
    getZIndexOfSvg();
    const observer = new MutationObserver(getZIndexOfSvg);
    if (edgeRef.current) {
      let svgElement = edgeRef.current;
      while (svgElement && svgElement.tagName.toLowerCase() !== 'svg') {
        svgElement = svgElement.parentElement;
      }
      if (svgElement) {
        observer.observe(svgElement, {
          attributes: true,
          attributeFilter: ['style'],
        });
      }
    }
    return () => observer.disconnect();
  }, []);

  const [dimEdge, setDimEdge] = useState(false);

  const onChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      const dim =
        nodes.length > 0 &&
        !!nodes.find(node => node.id !== source && node.id !== target);
      setDimEdge(dim);
    },
    [source, target]
  );

  useOnSelectionChange({ onChange });

  const isTargetCreationInfo = targetNode
    ? targetNode.data.inheritanceList.findIndex(
        (v: string) => parseIRI(v).name === 'CreationInfo'
      ) !== -1
    : false;

  const creationInfoHidden =
    label === 'creationInfo' &&
    isTargetCreationInfo &&
    id !== 'connection' &&
    !selected;

  const pathStyle = {
    ...style,
    ...relationshipStyle,
    visibility: creationInfoHidden ? 'hidden' : 'visible',
    stroke: dimEdge ? '#d1d5db' : style.stroke,
    opacity: dimEdge ? 0.1 : 1,
  };

  const labelStyle = {
    position: 'absolute',
    transform: `translate(-50%, 0) translate(${labelX}px, ${labelY}px)`,
    height: labelHeight,
    marginTop: marginTop,
    zIndex: (edgeZIndex ?? 0) + 1000,
    visibility: creationInfoHidden ? 'hidden' : 'visible',
    opacity: dimEdge ? 0.1 : 1,
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={isRelationshipEdge ? undefined : markerEnd}
        style={pathStyle}
        interactionWidth={0}
      />
      <EdgeLabelRenderer>
        <div
          ref={labelRef}
          style={labelStyle}
          className={`nodrag nopan flex items-center cursor-pointer pointer-events-auto
            font-medium text-xs text-spdx-dark border-spdx-dark
          `}
        >
          <div
            className={`flex px-1.5 py-0.5 border-1 bg-white border-1 border-spdx-dark rounded-md font-medium
              ${(selected || id === 'connection') && 'border-3'}
            `}
          >
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomPropertyEdge;