import React, { useMemo } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowRightIcon, ChevronRightIcon } from '@radix-ui/react-icons';

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

const NodeMenuClass = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);

  const items = useMemo(() => {
    if (!node) return [];

    const handleMouseDown = (
      event: React.MouseEvent,
      classProperty: ClassProperty
    ) => {
      appStore.setState(state => {
        state.draggedCls = {
          clientX: event.clientX,
          clientY: event.clientY,
          targetClass: classProperty.targetClass,
          sourceNodeId: node.id,
          classProperty,
        };
      });
      setNodeMenuState(node.id, false);
    };

    const reachedMaxCount = (
      path: IRI,
      maxCount: number | undefined | null
    ) => {
      return maxCount == null ? false : outEdgeCount(node.id, path) >= maxCount;
    };

    const recClsProps =
      ontoStore.getState().allRecClsProps![node?.data.cls.iri];
    const classItems = [];
    for (const [propClsName, clsProps] of recClsProps) {
      const propItems = [];
      for (const [propName, clsProp] of Object.entries(clsProps).sort()) {
        if (clsProp.targetClass && !getItem(clsProp.targetClass)!.abstract) {
          propItems.push(
            <Tooltip.Provider key={clsProp.path}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <DropdownMenu.Item
                    onMouseDown={e => handleMouseDown(e, clsProp)}
                    disabled={reachedMaxCount(clsProp.path, clsProp.maxCount)}
                    className={itemClass}
                  >
                    {propName}
                  </DropdownMenu.Item>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className={targetClsTooltipClass}
                    sideOffset={-5}
                    side="right"
                  >
                    <ArrowRightIcon />
                    <div className="ml-2">
                      {parseIRI(clsProp.targetClass).name}
                    </div>
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
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
  }, [node]);

  return items.length > 0 ? (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={itemClass}>
        <span className="p-1">Add Class</span>
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
