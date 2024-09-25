import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Node,
  useStore,
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useEdges,
  useOnSelectionChange,
  ReactFlowState,
} from 'reactflow';

import type { Edge, EdgeProps } from 'reactflow';

import { getEdgeParams } from '@/scripts/flow-utils.js';
import { parseIRI } from '@/scripts/app-utils';
import { appStore } from '@/store/app';

const connectionStartHandleSelector = (state: ReactFlowState) =>
  state.connectionStartHandle;
const connectionEndHandleSelector = (state: ReactFlowState) =>
  state.connectionEndHandle;

const PropertyEdge = ({
  id,
  source,
  target: edgeTarget,
  targetX,
  targetY,
  markerEnd,
  style,
  label,
  selected,
  data,
}: EdgeProps) => {
  const connectionSource = useStore(connectionStartHandleSelector)?.nodeId;
  const connectionTarget = useStore(connectionEndHandleSelector)?.nodeId;
  const target = edgeTarget ? edgeTarget : connectionTarget!;
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

  const edgeRef = useRef<HTMLElement | null>(null);
  const [edgeZIndex, setEdgeZIndex] = useState<string | null>(null);

  useEffect(() => {
    const getZIndexOfSvg = () => {
      if (edgeRef.current) {
        let currentElement = edgeRef.current;
        while (
          currentElement &&
          currentElement.tagName.toLowerCase() !== 'svg'
        ) {
          currentElement = currentElement.parentElement!;
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
        svgElement = svgElement.parentElement!;
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
    ({ nodes }: { nodes: Node[]; edges: Edge[] }) => {
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

  const pathStyle: CSSProperties = {
    ...style,
    ...relationshipStyle,
    visibility: creationInfoHidden ? 'hidden' : 'visible',
    stroke: dimEdge ? '#d1d5db' : style!.stroke,
    opacity: dimEdge ? 0.1 : 1,
  };

  const labelStyle: CSSProperties = {
    position: 'absolute',
    transform: `translate(-50%, 0) translate(${labelX}px, ${labelY}px)`,
    height: labelHeight,
    marginTop: marginTop,
    pointerEvents: 'all',
    zIndex: Number(edgeZIndex ?? 0) + 1000,
    visibility: creationInfoHidden ? 'hidden' : 'visible',
    opacity: dimEdge ? 0.1 : 1,
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={isRelationshipEdge ? '' : markerEnd}
        style={pathStyle}
        interactionWidth={0}
      />
      <EdgeLabelRenderer>
        <div
          ref={labelRef}
          style={labelStyle}
          className={`nodrag nopan flex items-center cursor-pointer
            font-medium text-xs text-spdx-dark border-spdx-dark
          `}
        >
          <div
            className={`flex px-1.5 py-0.5 border-1 bg-white border-1 border-spdx-dark rounded-md font-medium
              ${(selected || id === 'connection') && 'border-3'}
            `}
            onDoubleClick={() =>
              appStore.setState({
                selectedInfoIri: data?.classProperty.path,
                showInfoDialog: true,
              })
            }
          >
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default PropertyEdge;
