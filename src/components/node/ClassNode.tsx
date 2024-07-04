import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { NodeProps } from 'reactflow';
import {
  Position,
  Handle,
  useStore,
  useOnSelectionChange,
  Edge,
  Node,
} from 'reactflow';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Separator } from '@radix-ui/react-separator';

import type { NodeData } from '@/types';
import { appStore } from '@/store/app';
import {
  getNodeIncomers,
  getNodeOutgoers,
  setNodeExpanded,
} from '@/store/flow';
import NodeMenu from '@/components/node/menu/NodeMenu';
import Tooltip from '@/components/Tooltip';
import PropFields from '@/components/node/prop/PropFields';
import { parseIRI, preferredLabels } from '@/scripts/app-utils';

const connectionStartHandleSelector = state => state.connectionStartHandle;
const connectionEndHandleSelector = state => state.connectionEndHandle;

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

  const isTargetHandleConnectable =
    nodeId !== connectionSource &&
    (draggedPropData?.classProperty.targetClass === data.cls.iri ||
      data.inheritanceList.includes(
        draggedPropData?.classProperty.targetClass
      ));

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
      labels = preferredLabels[data.inheritanceList[c]] || [];
      if (labels.length > 0) {
        break;
      }
    }
    labels.push('name');
    const values = Object.values(data.nodeProps);
    for (const l of labels) {
      subtitle = values
        .filter(v => v.classProperty.name === l && v.value != null)
        .map(v =>
          v.classProperty.options ? parseIRI(v.value as string).name : v.value
        )
        .join(' | ');
      if (subtitle) {
        break;
      }
    }
    if (subtitle == null) {
      subtitle = values[0].value;
    }
    setSubtitle(subtitle as string);
  }, [data.nodeProps, data.cls.iri, data.inheritanceList]);

  const [dimNode, setDimNode] = useState(false);

  const onChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      const nodeIds = nodes.map(n => n.id);
      const outgoersIds = getNodeOutgoers(nodeId!).map(node => node.id);
      const incomersIds = getNodeIncomers(nodeId).map(node => node.id);
      const dim =
        !selected &&
        nodeIds.length > 0 &&
        nodeIds.every(n => !outgoersIds.includes(n)) &&
        nodeIds.every(n => !incomersIds.includes(n));
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
      className={`relative p-1 rounded font-lato ${dimNode && !isTargetHandleConnectable && !isPotentialConnection ? 'opacity-10' : ''}`}
    >
      <Collapsible.Root
        open={data.expanded}
        onOpenChange={open => setNodeExpanded(nodeId, open)}
        className={`
          cursor-move rounded w-64 min-h-20 bg-white shadow-2 outline outline-spdx-dark outline-1 p-2
          ${selected && 'outline-[3px]'} 
          ${dragging && 'shadow-4 translate-y-[-1.5px] translate-x-[0.8px]'}
          ${
            isTargetHandleConnectable &&
            (isPotentialConnection
              ? 'outline outline-4 outline-spdx-dark'
              : 'outline-dashed outline-4 outline-spdx-dark')
          }
        `}
      >
        <div className="px-0.5 flex flex-col gap-y-2">
          <div className={`flex gap-x-1`}>
            {menuButton}
            <Tooltip
              content={data.cls.name}
              disabled={tooltipDisabled}
              delayDuration={1000}
              sideOffset={10}
              className="text-sm"
            >
              <div className="flex flex-col gap-0.5 text-spdx-dark w-full text-center truncate px-[2px] font-lato font-semibold">
                <span ref={textRef} className={`w-full truncate`}>
                  {data.cls.name}
                </span>
              </div>
            </Tooltip>
            {expandButton}
          </div>
          <Separator className="bg-spdx-dark/50 mx-6 h-px" />
          {subtitle && (
            <div className="flex flex-col text-spdx-dark w-full text-center truncate px-[2px] font-lato font-normal">
              <span ref={textRef} className={`w-full truncate`}>
                {subtitle}
              </span>
            </div>
          )}
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
