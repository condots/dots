import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import type { NodeProps, ConnectionState } from '@xyflow/react';
import {
  Position,
  Handle,
  useOnSelectionChange,
  Edge,
  Node,
  useConnection,
} from '@xyflow/react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Separator } from '@radix-ui/react-separator';

import type { FlowNode } from '@/types';
import { appStore } from '@/store/app';
import {
  getNodeIncomers,
  getNodeOutgoers,
  hideTreeNodes,
  setNodeExpanded,
  unhideTreeNodes,
} from '@/store/flow';
import NodeMenu from '@/components/node/menu/NodeMenu';
import Tooltip from '@/components/Tooltip';
import PropFields from '@/components/node/prop/PropFields';
import { parseIRI, preferredLabels } from '@/scripts/app-utils';

import '@/components/node/ClassNode.css';

const connectionSelector = (connection: ConnectionState) => ({
  inProgress: connection.inProgress,
  sourceNode: connection.fromNode?.id,
  targetNode: connection.toNode?.id,
});

const ClassNode = ({
  id: nodeId,
  data,
  selected,
  dragging,
}: NodeProps<FlowNode>) => {
  const [tooltipDisabled, setTooltipDisabled] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const textRef = useRef<HTMLSpanElement | null>(null);
  const showExpandButton = Object.entries(data.nodeProps).length > 0;
  const { inProgress, sourceNode, targetNode } =
    useConnection(connectionSelector);
  const isSource = inProgress && sourceNode === nodeId;
  const isTarget = targetNode === nodeId;
  const draggedPropData = appStore.use.draggedPropData();
  const targetClass = draggedPropData?.classProperty.targetClass ?? '';

  const isTargetHandleConnectable = useMemo(
    () =>
      !isSource &&
      (targetClass === data.cls.iri ||
        data.inheritanceList.includes(targetClass)),
    [nodeId, targetClass, data.cls.iri, data.inheritanceList]
  );

  const targetHandle = useMemo(
    () => (
      <Handle
        type="target"
        position={Position.Left}
        className="targetHandle"
        isConnectable={isTargetHandleConnectable}
      />
    ),
    [isTargetHandleConnectable]
  );

  const menuButton = useMemo(
    () => (
      <div className="min-w-[23px] h-[24px] flex items-center justify-center">
        <NodeMenu />
      </div>
    ),
    []
  );

  const expandButton = useMemo(
    () => (
      <div className="min-w-[23px] h-[24px] flex items-center justify-center">
        {showExpandButton && (
          <Collapsible.Trigger asChild>
            <button
              className="nopan outline-none p-1 rounded text-spdx-dark
                       hover:bg-spdx-dark/5 data-[state=open]:rotate-180 max-h-[23px]"
            >
              <ChevronDownIcon />
            </button>
          </Collapsible.Trigger>
        )}
      </div>
    ),
    [showExpandButton]
  );

  useEffect(() => {
    if (textRef.current) {
      const truncated =
        textRef.current.scrollWidth > textRef.current.clientWidth;
      setTooltipDisabled(selected || !truncated);
    }
  }, [data.cls.name, selected]);

  useEffect(() => {
    if (!showExpandButton && data.expanded) {
      setNodeExpanded(nodeId, false);
    }
  }, [showExpandButton, data.expanded, nodeId]);

  useEffect(() => {
    if (!data.nodeProps) return;
    let subtitle;
    let labels: string[] = [];
    for (const c in data.inheritanceList) {
      const { name, profile } = parseIRI(data.inheritanceList[c]);
      labels = preferredLabels[`${profile}/${name}`] || [];
      if (labels.length > 0) {
        break;
      }
    }
    labels.push('comment');
    labels.push('name');
    const values = Object.values(data.nodeProps);
    for (const p of Object.values(data.nodeProps).filter(p => p.required)) {
      labels.push(p.classProperty.name);
    }
    for (const l of labels) {
      subtitle = values
        .filter(v => v.classProperty.name === l && v.valid)
        .map(v =>
          v.classProperty.options ? parseIRI(v.value as string).name : v.value
        )
        .join(' | ');
      if (subtitle) {
        break;
      }
    }
    setSubtitle(subtitle ?? '');
  }, [data.nodeProps, data.cls.iri, data.inheritanceList]);

  const [dimNode, setDimNode] = useState(false);

  const onChange = useCallback(
    ({ nodes }: { nodes: Node[]; edges: Edge[] }) => {
      const nodeIds = nodes.map(n => n.id);
      const outgoersIds = getNodeOutgoers(nodeId).map(node => node.id);
      const incomersIds = getNodeIncomers(nodeId).map(node => node.id);
      const dim =
        nodeIds.length > 0 &&
        nodeIds.every(
          n => !outgoersIds.includes(n) && !incomersIds.includes(n)
        );
      setDimNode(dim);
    },
    [nodeId]
  );

  useOnSelectionChange({ onChange });

  const collapsibleContent = useMemo(
    () => (
      <Collapsible.Root
        open={data.expanded}
        onOpenChange={open => setNodeExpanded(nodeId, open)}
        className={`
          cursor-move rounded w-64 min-h-20 bg-white shadow-2 outline outline-spdx-dark outline-1 p-2
          ${selected && 'outline-[3px]'}
          ${dragging && 'shadow-4'}
          ${
            isTarget
              ? 'outline outline-4 outline-spdx-dark'
              : isTargetHandleConnectable &&
                'outline-dashed outline-4 outline-spdx-dark'
          }
        `}
      >
        <div className="px-0.5 flex flex-col gap-y-2">
          <div className={`flex gap-x-1 h-6`}>
            {menuButton}
            <Tooltip
              content={data.cls.name}
              disabled={tooltipDisabled}
              delayDuration={1000}
              sideOffset={10}
              className="text-sm"
            >
              <span
                ref={textRef}
                className="text-spdx-dark w-full text-center truncate px-[2px] font-lato font-semibold"
              >
                {data.cls.name}
              </span>
            </Tooltip>
            {expandButton}
          </div>
          <Separator className="bg-spdx-dark/50 mx-6 h-px" />
          <span className="text-spdx-dark w-full text-center truncate px-[2px] font-lato font-normal h-6">
            {subtitle}
          </span>
        </div>
        <Collapsible.Content
          className="nodrag nopan nowheel cursor-auto overflow-hidden 
                     data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
        >
          <div className="text-spdx-dark max-h-64 overflow-y-scroll scroll-smooth h-full">
            <PropFields />
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    ),
    [
      data.expanded,
      nodeId,
      selected,
      dragging,
      isTargetHandleConnectable,
      isTarget,
      menuButton,
      data.cls.name,
      tooltipDisabled,
      expandButton,
      subtitle,
    ]
  );

  if (!data.cls) {
    return null;
  }

  return (
    <div
      className={`
        relative p-1 font-lato rounded
        ${
          dimNode && !selected && !isTargetHandleConnectable && !isTarget
            ? 'opacity-10 transition-none'
            : 'transition-opacity'
        }
        ${data.hiddenNodes.length ? 'stock-effect' : ''}
        ${selected ? 'stock-effect-selected' : ''}
      `}
      onDoubleClick={() =>
        data.hiddenNodes.length
          ? unhideTreeNodes(nodeId)
          : hideTreeNodes(nodeId)
      }
    >
      {collapsibleContent}
      <Handle type="source" position={Position.Right} hidden />
      {targetHandle}
    </div>
  );
};

export default ClassNode;
