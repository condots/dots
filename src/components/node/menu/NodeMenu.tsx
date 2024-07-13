import React, { useCallback, useMemo } from 'react';

import sanitize from 'sanitize-filename';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useNodeId } from '@xyflow/react';

import { appStore } from '@/store/app';
import { contentClass, itemClass } from '@/scripts/app-utils';
import {
  deleteNode,
  useNode,
  hasUnmetNodeClsProps,
  selectNode,
  selectEdge,
  getNodeTree,
  unhideTreeNodes,
  hideTreeNodes,
} from '@/store/flow';
import NodeMenuClass from '@/components/node/menu/NodeMenuClass';
import NodeMenuProp from '@/components/node/menu/NodeMenuProp';
import { exportSpdxJsonLd } from '@/scripts/fs-utils';

const NodeMenu = () => {
  const nodeId = useNodeId()!;
  const node = useNode(nodeId);
  const invalidProps = node?.data.nodeProps
    ? Object.entries(node.data.nodeProps).filter(p => !p[1].valid)
    : [];
  const unmetNodeClsProps = hasUnmetNodeClsProps(node);

  const Save = useMemo(() => {
    if (node?.data.cls.name !== 'SpdxDocument') return null;
    const name = (Object.values(node.data.nodeProps).find(
      p => p.classProperty.name === 'name'
    )?.value ?? `spdx-doc-${~~(Date.now() / 1000)}`) as string;
    const filename = `${sanitize(name)}.json`;

    return (
      <DropdownMenu.Item
        className={itemClass}
        onSelect={() => exportSpdxJsonLd(filename, getNodeTree(node))}
      >
        {`Save as "${filename}"`}
      </DropdownMenu.Item>
    );
  }, [node]);

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

  const HideTree = (
    <DropdownMenu.Item
      className={itemClass}
      onSelect={() => {
        hideTreeNodes(nodeId);
      }}
    >
      Collapse
    </DropdownMenu.Item>
  );

  const UnhideTree = (
    <DropdownMenu.Item
      className={itemClass}
      onSelect={() => {
        unhideTreeNodes(nodeId);
      }}
    >
      Expand
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
            <div className="absolute inline-flex items-center justify-center bg-white rounded-full top-[-5px] left-[-3px]">
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
          {node?.data.hiddenNodes.length == 0 ? HideTree : UnhideTree}
          {GetInfo}
          {Delete}
          {Save}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default NodeMenu;
