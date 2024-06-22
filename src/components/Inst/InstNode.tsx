import React, { useEffect, useRef, useState } from 'react';
import type { NodeProps } from 'reactflow';
import { Position, Handle } from 'reactflow';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';

import InstMenu from '@/components/Inst/InstMenu';
import ClassNameTooltip from '@/components/Shared/ClassNameTooltip';
import { NodeData } from '@/types';
import { Separator } from '@radix-ui/react-separator';
import InstPropFields from '@/components/Inst/InstPropFields';

function InstNode({ id: nodeId, data, selected }: NodeProps<NodeData>) {
  const [open, setOpen] = useState(false);
  const [tooltipDisabled, setTooltipDisabled] = useState(false);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (textRef.current) {
      const truncated =
        textRef.current.scrollWidth > textRef.current.clientWidth;
      setTooltipDisabled(selected || !truncated);
    }
  }, [data.cls.name, selected]);

  if (!data.cls) {
    return null;
  }
  return (
    <div>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
        className={`
          cursor-move m-1 rounded w-64 bg-white shadow-2 outline outline-spdx-dark outline-1
          ${selected && 'outline-2'} 
          ${data.active && 'shadow-4 translate-y-[-1.5px] translate-x-[0.8px]'}
        `}
      >
        <div className="flex items-center justify-between p-2 gap-[5px]">
          <div className="nodrag nopan flex">
            <InstMenu nodeId={nodeId} />
          </div>
          <ClassNameTooltip content={data.cls.name} disabled={tooltipDisabled}>
            <span
              ref={textRef}
              className="text-spdx-dark text-md font-medium w-full text-center truncate"
            >
              {data.cls.name}
            </span>
          </ClassNameTooltip>
          <Collapsible.Trigger asChild>
            <button className="nodrag nopan selectable p-1 rounded text-spdx-dark hover:bg-spdx-dark/5 data-[state=open]:rotate-180">
              <ChevronDownIcon />
            </button>
          </Collapsible.Trigger>
        </div>
        <Collapsible.Content className="nodrag nopan cursor-auto overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
          <Separator className="bg-spdx-dark h-[1px]" decorative />
          <div
            className="
            text-spdx-dark 
            max-h-64 
            overflow-y-scroll 
            scroll-smooth 
            h-full
          "
          >
            <InstPropFields nodeId={nodeId} />
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
      {data.isNode && (
        <div>
          <Handle type="target" position={Position.Left} className="hidden" />
          <Handle type="source" position={Position.Right} className="hidden" />
        </div>
      )}
    </div>
  );
}

export default InstNode;
