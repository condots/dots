import React, { type ReactNode } from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { tooltipClass } from '@/scripts/app-utils';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  disabled?: boolean;
  sideOffset?: number;
  className?: string;
}

function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disabled,
  sideOffset,
  className,
  ...props
}: TooltipProps) {
  const consentClassName = `${tooltipClass} ${className ? className : ''}`;

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
            delayDuration={delayDuration}
          >
            <TooltipPrimitive.Trigger asChild>
              {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                className={consentClassName}
                side="top"
                sideOffset={sideOffset ?? 5}
                collisionPadding={20}
                {...props}
              >
                {content}
                <TooltipPrimitive.Arrow
                  width={11}
                  height={5}
                  className="fill-gray-600"
                />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      )}
    </>
  );
}

export default Tooltip;
