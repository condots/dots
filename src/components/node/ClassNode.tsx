import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { NodeProps } from 'reactflow';
import { Position, Handle, useStore } from 'reactflow';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Separator } from '@radix-ui/react-separator';

import type { NodeData } from '@/types';
import { appStore } from '@/store/app';
import { setNodeExpanded } from '@/store/flow';
import NodeMenu from '@/components/node/menu/NodeMenu';
import Tooltip from '@/components/Tooltip';
import PropFields from '@/components/node/prop/PropFields';
import { parseIRI } from '@/scripts/app-utils';

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

  const targetHandle = (
    <Handle
      type="target"
      position={Position.Left}
      className="targetHandle"
      isConnectable={isTargetHandleConnectable}
    ></Handle>
  );

  const menuButton = (
    <div className="min-w-[23px] h-[24px] flex items-center justify-center nodrag nopan">
      <NodeMenu />
    </div>
  );

  const expandButton = (
    <div className="min-w-[23px] h-[24px] flex items-center justify-center">
      {showExpandButton && (
        <Collapsible.Trigger asChild>
          <button
            className="nodrag nopan outline-none p-1 rounded text-spdx-dark 
                     hover:bg-spdx-dark/5 data-[state=open]:rotate-180 max-h-[23px]"
          >
            <ChevronDownIcon />
          </button>
        </Collapsible.Trigger>
      )}
    </div>
  );

  useEffect(() => {
    const relType = Object.values(data.nodeProps).find(
      v => v.classProperty.name === 'relationshipType'
    )?.value;
    if (relType) {
      setSubtitle(parseIRI(relType as string).name);
    }
  }, [data.nodeProps]);

  if (!data.cls) {
    return null;
  }
  return (
    <div className="relative p-1 rounded font-lato">
      <Collapsible.Root
        open={data.expanded}
        onOpenChange={open => setNodeExpanded(nodeId, open)}
        className={`
          cursor-move rounded w-64 bg-white shadow-2 outline outline-spdx-dark outline-1
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
        <div
          className={`flex items-center justify-between px-2 gap-[5px]
                      ${subtitle ? 'pt-1.5 pb-2.5' : 'py-2'}`}
        >
          {menuButton}
          <Tooltip
            content={data.cls.name}
            disabled={tooltipDisabled}
            delayDuration={1000}
            sideOffset={9}
            className="text-sm"
          >
            <div className="flex flex-col gap-0.5 text-spdx-dark w-full text-center truncate">
              <span ref={textRef} className={`w-full truncate`}>
                {data.cls.name}
              </span>
              {subtitle && (
                <span className="text-xs truncate">[ {subtitle} ]</span>
              )}
            </div>
          </Tooltip>
          {expandButton}
        </div>
        <Collapsible.Content
          className="nodrag nopan nowheel cursor-auto overflow-hidden 
                     data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
        >
          <Separator className="bg-spdx-dark pt-[1px] h-[1px]" decorative />
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
