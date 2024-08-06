import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useNodeId } from 'reactflow';

import { appStore } from '@/store/app';
import { useNode } from '@/store/flow';
import { itemClass, targetClsTooltipClass } from '@/scripts/app-utils';

const NodeSpdxId = () => {
  const nodeId = useNodeId()!;
  const node = useNode(nodeId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nodeId);
      appStore.setState(state => {
        state.alertToast = 'Copied!';
      });
    } catch (error) {
      console.error('Unable to copy to clipboard:', error);
    }
  };

  return node?.data.isElement ? (
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
              <div
                className={`mx-2 bg-spdx-dark text-white rounded px-1 box-border`}
              >
                {nodeId}
              </div>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </DropdownMenu.Sub>
  ) : null;
};

export default NodeSpdxId;
