import React, { type ReactNode } from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsNameTooltipClass } from '@/scripts/app-utils';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delay?: number;
  disabled?: boolean;
}

function ClassNameTooltip({
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
              className={clsNameTooltipClass}
              side="top"
              sideOffset={5}
              {...props}
            >
              {content}
              <TooltipPrimitive.Arrow
                width={11}
                height={5}
                className="fill-mauve1"
              />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      )}
    </>
  );
}

export default ClassNameTooltip;
