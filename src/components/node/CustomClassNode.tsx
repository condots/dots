import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { NodeProps } from '@xyflow/react';
import {
  Position,
  Handle,
  useStore,
  useOnSelectionChange,
  Edge,
  Node,
  useReactFlow,
} from '@xyflow/react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Separator } from '@radix-ui/react-separator';

import type { ClassNode } from '@/types';
import { appStore } from '@/store/app';
import {
  collapseNode,
  expandNode,
  getNodeIncomers,
  getNodeOutgoers,
} from '@/store/flow';
import NodeMenu from '@/components/node/menu/NodeMenu';
import Tooltip from '@/components/Tooltip';
import PropFields from '@/components/node/prop/PropFields';
import { parseIRI, preferredLabels } from '@/scripts/app-utils';

import '@/components/node/CustomClassNode.css';

const connectionStartHandleSelector = state => state.connectionStartHandle;
const connectionEndHandleSelector = state => state.connectionEndHandle;

const CustomClassNode = ({
  id: nodeId,
  data,
  selected,
  dragging,
}: NodeProps<ClassNode>) => {
  const { updateNodeData } = useReactFlow();
  const [tooltipDisabled, setTooltipDisabled] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const textRef = useRef<HTMLSpanElement | null>(null);
  const displayPropFieldsToggle = !!Object.entries(data.nodeProps).length;
  const connectionSource = useStore(connectionStartHandleSelector)?.nodeId;
  const connectionEndHandle = useStore(connectionEndHandleSelector);
  const isPotentialConnection = connectionEndHandle?.nodeId === nodeId;
  const draggedPropData = appStore.use.draggedPropData();
  const isCollapsed = !!data.collapsedPosition;

  const isTargetHandleConnectable =
    nodeId !== connectionSource &&
    (draggedPropData?.classProperty.targetClass === data.cls.iri ||
      data.inheritanceList.includes(
        draggedPropData?.classProperty.targetClass
      ));

  const menuButton = (
    <div className="min-w-[23px] h-[24px] flex items-center justify-center">
      <NodeMenu />
    </div>
  );

  const expandButton = (
    <div className="min-w-[23px] h-[24px] flex items-center justify-center">
      {displayPropFieldsToggle && (
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
    if (!displayPropFieldsToggle && data.showPropFields) {
      updateNodeData(nodeId, { showPropFields: false });
    }
  }, [displayPropFieldsToggle, data.showPropFields, nodeId, updateNodeData]);

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
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      let dim = false;
      if (nodes.length > 0) {
        const outgoersIds = getNodeOutgoers(nodeId).map(n => n.id);
        const incomersIds = getNodeIncomers(nodeId).map(n => n.id);
        dim = nodes.every(
          n => ![nodeId, ...outgoersIds, ...incomersIds].includes(n.id)
        );
      }
      setDimNode(dim);
    },
    [nodeId]
  );

  useOnSelectionChange({ onChange });

  const toggleCollapsed = useCallback(() => {
    if (data.collapsed) expandNode(nodeId);
    else collapseNode(nodeId);
  }, [nodeId, data.collapsed]);

  if (!data.cls) {
    return null;
  }
  return (
    <div
      className={`
        relative p-1 font-lato rounded
        ${dimNode && !isTargetHandleConnectable && !isPotentialConnection ? 'opacity-10 transition-none' : 'transition-opacity'}
        ${isCollapsed ? 'stock-effect' : ''}
        ${selected ? 'stock-effect-selected' : ''}
      `}
      onDoubleClick={toggleCollapsed}
    >
      <Collapsible.Root
        open={data.showPropFields}
        onOpenChange={open => updateNodeData(nodeId, { showPropFields: open })}
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
      <Handle
        type="target"
        position={Position.Left}
        className="targetHandle"
        isConnectable={isTargetHandleConnectable}
      ></Handle>
    </div>
  );
};

export default CustomClassNode;
