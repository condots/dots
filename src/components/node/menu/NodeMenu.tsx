import { useMemo, useCallback } from 'react';

import sanitize from 'sanitize-filename';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useNodeId } from 'reactflow';

import { appStore } from '@/store/app';
import { contentClass, itemClass } from '@/scripts/app-utils';
import {
  deleteNode,
  useNodeShallow,
  hasUnmetNodeClsProps,
  selectNode,
  selectEdge,
  getNodeTree,
  unhideTreeNodes,
  hideTreeNodes,
  flowStore,
} from '@/store/flow';
import NodeMenuClass from '@/components/node/menu/NodeMenuClass';
import NodeMenuProp from '@/components/node/menu/NodeMenuProp';
import { exportSpdxJsonLd, generateSpdxJsonLd } from '@/scripts/fs-utils';
import NodeSpdxId from '@/components/node/menu/NodeSpdxId';

const NodeMenu = () => {
  const nodeId = useNodeId()!;
  const node = useNodeShallow(nodeId);
  const edges = flowStore.use.edges();
  const unmetNodeClsProps = hasUnmetNodeClsProps(node, edges);

  const invalidProps = useMemo(() => {
    return node?.data.nodeProps
      ? Object.entries(node.data.nodeProps).filter(p => !p[1].valid)
      : [];
  }, [node?.data.nodeProps]);

  const Save = useMemo(() => {
    if (!node) return null;
    const name = (Object.values(node.data.nodeProps).find(
      p => p.classProperty.name === 'name'
    )?.value ?? `spdx-doc-${~~(Date.now() / 1000)}`) as string;
    const filename = `${sanitize(name)}.json`;

    return (
      <DropdownMenu.Item
        className={itemClass}
        onSelect={() => exportSpdxJsonLd(filename, getNodeTree(node))}
      >
        {`Save...`}
      </DropdownMenu.Item>
    );
  }, [node]);

  const GetInfo = useMemo(
    () => (
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
    ),
    [node?.data.cls.iri]
  );

  const Preview = useMemo(
    () => (
      <DropdownMenu.Item
        className={itemClass}
        onSelect={async () => {
          const nodes = getNodeTree(node!);
          const data = await generateSpdxJsonLd(nodes);
          if (
            data &&
            data.compacted &&
            Array.isArray(data.compacted['@graph'])
          ) {
            const graph = data.compacted['@graph'];
            const n = node!.data.isElement
              ? graph.find(g => g['spdxId'] === nodeId)
              : graph.find(g => g['@id'] === data.subjects.get(nodeId)?.id);
            const v = JSON.stringify(n || {}, null, 2);
            appStore.setState(state => {
              state.previewData = {
                title: node!.data.cls.name,
                description: v,
              };
            });
          }
        }}
      >
        Preview
      </DropdownMenu.Item>
    ),
    [node, nodeId]
  );

  const Delete = useMemo(
    () => (
      <DropdownMenu.Item
        className={itemClass}
        onSelect={() => deleteNode(nodeId)}
      >
        Delete
        <span className="material-symbols-outlined text-sm">backspace</span>
      </DropdownMenu.Item>
    ),
    [nodeId]
  );

  const HideTree = useMemo(
    () => (
      <DropdownMenu.Item
        className={itemClass}
        onSelect={() => hideTreeNodes(nodeId)}
      >
        Collapse
      </DropdownMenu.Item>
    ),
    [nodeId]
  );

  const UnhideTree = useMemo(
    () => (
      <DropdownMenu.Item
        className={itemClass}
        onSelect={() => unhideTreeNodes(nodeId)}
      >
        Expand
      </DropdownMenu.Item>
    ),
    [nodeId]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        selectEdge();
        selectNode(nodeId);
      }
    },
    [nodeId]
  );

  const TriggerButton = useMemo(
    () => (
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
    ),
    [invalidProps.length, unmetNodeClsProps]
  );

  const MenuContent = useMemo(
    () => (
      <DropdownMenu.Content className={contentClass + ' p-1'} align="start">
        <NodeMenuProp />
        <NodeMenuClass />
        <NodeSpdxId />
        {node?.data.hiddenNodes.length == 0 ? HideTree : UnhideTree}
        {GetInfo}
        {Preview}
        {Delete}
        {Save}
      </DropdownMenu.Content>
    ),
    [
      node?.data.hiddenNodes.length,
      HideTree,
      UnhideTree,
      GetInfo,
      Preview,
      Delete,
      Save,
    ]
  );

  return (
    <DropdownMenu.Root onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>{TriggerButton}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>{MenuContent}</DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default NodeMenu;
