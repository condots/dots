import React from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useNodeId } from 'reactflow';

import { appStore } from '@/store/app';
import { contentClass, itemClass } from '@/scripts/app-utils';
import { deleteNode, getNode, setNodeMenuState } from '@/store/flow';
import NodeMenuClass from '@/components/node/menu/NodeMenuClass';
import NodeMenuProp from '@/components/node/menu/NodeMenuProp';

const NodeMenu = () => {
  const nodeId = useNodeId()!;
  const node = getNode(nodeId);

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
      open={node?.data.menuOpen}
      onOpenChange={open => setNodeMenuState(nodeId, open)}
    >
      <DropdownMenu.Trigger asChild>
        <button className="nodrag nopan outline-none p-1 rounded text-spdx-dark hover:bg-spdx-dark/5">
          <HamburgerMenuIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={contentClass} align="start">
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
