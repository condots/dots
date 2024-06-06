import React, { memo, useEffect, useRef, useState } from 'react';
import type { NodeProps } from 'reactflow';
import { Position, Handle } from 'reactflow';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Separator from '@radix-ui/react-separator';

import InstMenu from '@/components/Inst/InstMenu';
import Tooltip from '@/components/Shared/Tooltip';
import { NodeData } from '@/types';

const InstNode = memo(function InstNode({
  id,
  data,
  selected,
}: NodeProps<NodeData>) {
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
    <>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
        className={`
          cursor-move m-1 p-1 rounded w-64 bg-white shadow-2 outline outline-blue12 outline-1
          ${selected && 'outline-2'} 
          ${data.active && 'shadow-4 translate-y-[-1.5px] translate-x-[0.8px]'}
        `}
      >
        <div className="flex items-center justify-between px-1 py-1 gap-[5px]">
          <div className="nodrag nopan flex">
            <InstMenu nodeId={id} />
          </div>
          <Tooltip content={data.cls.name} disabled={tooltipDisabled}>
            <span
              ref={textRef}
              className="text-blue12 text-md font-medium w-full text-center truncate"
            >
              {data.cls.name}
            </span>
          </Tooltip>
          <Collapsible.Trigger asChild>
            <button className="nodrag nopan p-1 rounded text-blue12 hover:bg-blue12/5 data-[state=open]:rotate-180">
              <ChevronDownIcon />
            </button>
          </Collapsible.Trigger>
        </div>

        <Collapsible.Content className="nodrag nopan cursor-auto data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
          <Separator.Root className="bg-blue12 h-[1px]" decorative />
          <div className="p-2">
            <span className="text-blue12 text-sm">Item 1</span>
          </div>
          <div className="p-2">
            <span className="text-blue12 text-sm">Item 2</span>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
      {data.isNode && (
        <div>
          <Handle type="target" position={Position.Left} className="hidden" />
          <Handle type="source" position={Position.Right} className="hidden" />
        </div>
      )}
    </>
  );
});

export default InstNode;
