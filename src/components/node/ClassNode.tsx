import { useCallback, useEffect, useRef, useState } from 'react';

import type { NodeProps } from 'reactflow';
import {
  Position,
  Handle,
  useStore,
  useOnSelectionChange,
  Edge,
  Node,
  ReactFlowState,
} from 'reactflow';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Separator } from '@radix-ui/react-separator';

import type { NodeData } from '@/types';
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

const connectionStartHandleSelector = (state: ReactFlowState) =>
  state.connectionStartHandle;
const connectionEndHandleSelector = (state: ReactFlowState) =>
  state.connectionEndHandle;

const ClassNode = ({
  id: nodeId,
  data,
  selected,
  dragging,
}: NodeProps<NodeData>) => {
  const [tooltipDisabled, setTooltipDisabled] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const textRef = useRef<HTMLSpanElement | null>(null);
  const showExpandButton = Object.entries(data.nodeProps).length > 0;
  const connectionSource = useStore(connectionStartHandleSelector)?.nodeId;
  const connectionEndHandle = useStore(connectionEndHandleSelector);
  const isPotentialConnection = connectionEndHandle?.nodeId === nodeId;
  const draggedPropData = appStore.use.draggedPropData();
  const targetClass = draggedPropData?.classProperty.targetClass ?? '';

  const isTargetHandleConnectable =
    nodeId !== connectionSource &&
    (targetClass === data.cls.iri ||
      data.inheritanceList.includes(targetClass));

  const targetHandle = (
    <Handle
      type="target"
      position={Position.Left}
      className="targetHandle"
      isConnectable={isTargetHandleConnectable}
    ></Handle>
  );

  const menuButton = (
    <div className="min-w-[23px] h-[24px] flex items-center justify-center">
      <NodeMenu />
    </div>
  );

  const expandButton = (
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
      const outgoersIds = getNodeOutgoers(nodeId!).map(node => node.id);
      const incomersIds = getNodeIncomers(nodeId).map(node => node.id);
      const dim =
        !selected &&
        nodeIds.length > 0 &&
        nodeIds.every(
          n => !outgoersIds.includes(n) && !incomersIds.includes(n)
        );
      setDimNode(dim);
    },
    [nodeId, selected]
  );

  useOnSelectionChange({ onChange });

  if (!data.cls) {
    return null;
  }
  return (
    <div
      className={`
        relative p-1 font-lato rounded
        ${dimNode && !isTargetHandleConnectable && !isPotentialConnection ? 'opacity-10 transition-none' : 'transition-opacity'}
        ${data.hiddenNodes.length ? 'stock-effect' : ''}
        ${selected ? 'stock-effect-selected' : ''}
      `}
      onDoubleClick={() =>
        data.hiddenNodes.length
          ? unhideTreeNodes(nodeId)
          : hideTreeNodes(nodeId)
      }
    >
      <Collapsible.Root
        open={data.expanded}
        onOpenChange={open => setNodeExpanded(nodeId, open)}
        className={`
          cursor-move rounded w-64 min-h-20 bg-white shadow-2 outline outline-spdx-dark outline-1 p-2
          ${selected && 'outline-[3px]'}
          ${dragging && 'shadow-4'}
          ${
            isTargetHandleConnectable &&
            (isPotentialConnection
              ? 'outline outline-4 outline-spdx-dark'
              : 'outline-dashed outline-4 outline-spdx-dark')
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
          {/* <Separator className="bg-spdx-dark pt-[1px] h-[1px]" decorative /> */}
          <div className="text-spdx-dark max-h-64 overflow-y-scroll scroll-smooth h-full">
            <PropFields />
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
      <Handle type="source" position={Position.Right} hidden />
      {targetHandle}
    </div>
  );
};

export default ClassNode;
