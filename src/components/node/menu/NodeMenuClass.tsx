import React, { useCallback, useMemo } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowRightIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Handle, Position, useNodeId } from 'reactflow';

import { ClassProperty, IRI } from '@/types';
import { outEdgeCount, getNode, setNodeMenuState } from '@/store/flow';
import {
  contentClass,
  itemClass,
  parseIRI,
  targetClsTooltipClass,
} from '@/scripts/app-utils';
import { getItem, ontoStore } from '@/store/onto';
import { appStore } from '@/store/app';

const NodeMenuClass = () => {
  const nodeId = useNodeId()!;
  const node = getNode(nodeId);

  const reachedMaxCount = useCallback(
    (path: IRI, maxCount: number | undefined | null) =>
      maxCount == null ? false : outEdgeCount(nodeId, path) >= maxCount,
    [nodeId]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, classProperty: ClassProperty) => {
      if (event.button !== 0) return;
      appStore.setState(state => {
        state.draggedPropData = { classProperty, sourceNodeId: nodeId };
      });
      setNodeMenuState(nodeId, false);
    },
    [nodeId]
  );

  const items = useMemo(() => {
    if (!node) return [];
    const recClsProps =
      ontoStore.getState().allRecClsProps![node?.data.cls.iri];
    const classItems = [];
    for (const [propClsIRI, clsProps] of recClsProps) {
      const propClsName = parseIRI(propClsIRI).name;
      const propItems = [];
      for (const [propName, clsProp] of Object.entries(clsProps).sort()) {
        if (clsProp.targetClass) {
          propItems.push(
            <div key={clsProp.path} className="class-menu-item">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <DropdownMenu.Item
                      onMouseDown={e => handleMouseDown(e, clsProp)}
                      disabled={reachedMaxCount(clsProp.path, clsProp.maxCount)}
                      asChild
                    >
                      <Handle
                        type="source"
                        position={Position.Left}
                        className={`
                          text-sm text-spdx-dark px-2 flex justify-between items-center 
                          data-[highlighted]:text-mauve1 data-[highlighted]:cursor-pointer
                          data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none 
                        `}
                      >
                        {propName}
                      </Handle>
                    </DropdownMenu.Item>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className={targetClsTooltipClass}
                      sideOffset={-5}
                      side="right"
                    >
                      <ArrowRightIcon />
                      <div
                        className={`mr-2
                        ${getItem(clsProp.targetClass)!.abstract ? 'text-spdx-dark bg-white rounded px-1 box-border' : ''}
                      `}
                      >
                        {parseIRI(clsProp.targetClass).name}
                      </div>
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          );
        }
      }
      if (propItems.length > 0) {
        classItems.push(
          <DropdownMenu.Sub key={propClsName}>
            <DropdownMenu.SubTrigger className={itemClass}>
              <span className="p-1">{propClsName}</span>
              <ChevronRightIcon />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent
              className={contentClass}
              sideOffset={-1}
              alignOffset={-5}
            >
              {propItems}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        );
      }
    }
    return classItems;
  }, [node, handleMouseDown, reachedMaxCount]);

  return items.length > 0 ? (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={itemClass}>
        <span>Add Class</span>
        <ChevronRightIcon />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className={contentClass}
          sideOffset={-1}
          alignOffset={-5}
        >
          {items}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  ) : null;
};

export default NodeMenuClass;
