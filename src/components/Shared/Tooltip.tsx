import React, { type ReactNode } from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delay?: number;
  disabled?: boolean;
}

function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  delay,
  disabled,
  ...props
}: TooltipProps) {
  return (
    <>
      {disabled ? (
        children
      ) : (
        <TooltipPrimitive.Provider>
          <TooltipPrimitive.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            delayDuration={delay}
          >
            <TooltipPrimitive.Trigger asChild>
              {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content
              className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade select-none rounded-[4px] bg-slate-500 text-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
              sideOffset={10}
              {...props}
            >
              {content}
              <TooltipPrimitive.Arrow
                width={11}
                height={5}
                className="fill-slate-500"
              />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      )}
    </>
  );
}

export default Tooltip;
