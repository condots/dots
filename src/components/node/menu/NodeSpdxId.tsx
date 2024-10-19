import { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useNodeId } from '@xyflow/react';

import { appStore } from '@/store/app';
import { useNodeShallow } from '@/store/flow';
import { itemClass, targetClsTooltipClass } from '@/scripts/app-utils';

const NodeSpdxId = () => {
  const nodeId = useNodeId()!;
  const node = useNodeShallow(nodeId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nodeId);
      appStore.setState(state => {
        state.alertToast = 'Copied!';
        return state;
      });
    } catch (error) {
      console.error('Unable to copy to clipboard:', error);
      appStore.setState(state => {
        state.alertToast = 'Copy failed!';
        return state;
      });
    }
  };

  const isElement = useMemo(() => node?.data.isElement, [node]);

  if (!isElement) return null;

  return (
    <DropdownMenu.Sub>
      <Tooltip.Provider delayDuration={1000}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <DropdownMenu.Item className={itemClass} onClick={handleCopy}>
              <div className="flex justify-between">
                <span className="pr-2">Copy spdxId</span>
              </div>
            </DropdownMenu.Item>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className={targetClsTooltipClass}
              sideOffset={-5}
              side="right"
            >
              <div className="mx-2 bg-spdx-dark text-white rounded px-1 box-border">
                {nodeId}
              </div>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </DropdownMenu.Sub>
  );
};

export default NodeSpdxId;
