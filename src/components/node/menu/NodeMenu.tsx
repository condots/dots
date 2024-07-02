import React from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useNodeId } from 'reactflow';

import { appStore } from '@/store/app';
import { contentClass, itemClass } from '@/scripts/app-utils';
import {
  deleteNode,
  useNode,
  hasUnmetNodeClsProps,
  selectNode,
  selectEdge,
} from '@/store/flow';
import NodeMenuClass from '@/components/node/menu/NodeMenuClass';
import NodeMenuProp from '@/components/node/menu/NodeMenuProp';

const NodeMenu = () => {
  const nodeId = useNodeId()!;
  const node = useNode(nodeId);
  const invalidProps = node?.data.nodeProps
    ? Object.entries(node.data.nodeProps).filter(p => !p[1].valid)
    : [];
  const unmetNodeClsProps = hasUnmetNodeClsProps(node);

  const GetInfo = (
    <DropdownMenu.Item
      className={itemClass}
      onSelect={() => {
        appStore.setState(state => {
          state.selectedInfoIri = node?.data.cls.iri;
          state.showInfoDialog = true;
        });
      }}
    >
      Get Info
    </DropdownMenu.Item>
  );

  const Delete = (
    <DropdownMenu.Item
      className={itemClass}
      onSelect={() => deleteNode(nodeId)}
    >
      Delete
    </DropdownMenu.Item>
  );

  return (
    <DropdownMenu.Root
      onOpenChange={open => {
        if (open) {
          selectEdge();
          selectNode(nodeId);
        }
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button className="outline-none p-1 rounded text-spdx-dark hover:bg-spdx-dark/5 flex relative">
          <HamburgerMenuIcon />
          {(invalidProps.length > 0 || unmetNodeClsProps) && (
            <div className="absolute inline-flex items-center justify-center bg-white rounded-full top-[-3px] right-[-6px]">
              <span
                className="material-symbols-outlined text-base text-rose-600"
                style={{
                  fontVariationSettings: `"FILL" 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                }}
              >
                error
              </span>
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={contentClass + ' p-1'} align="start">
          <NodeMenuProp />
          <NodeMenuClass />
          {GetInfo}
          {Delete}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default NodeMenu;
