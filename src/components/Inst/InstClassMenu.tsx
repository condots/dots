import React, { useCallback } from 'react';

import { nanoid } from 'nanoid';
import { useReactFlow } from 'reactflow';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowRightIcon, ChevronRightIcon } from '@radix-ui/react-icons';

import { ClassProperty, IRI } from '@/types';
import { addNode, getNode } from '@/store/flow';
import {
  contentClass,
  itemClass,
  parseIRI,
  targetClsTooltipClass,
} from '@/scripts/app-utils';
import { getItem, ontoStore } from '@/store/onto';

const InstClassMenu = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);
  const { addEdges } = useReactFlow();

  const items = useCallback(() => {
    if (!node) return [];

    const reachedMaxCount = (path: IRI, maxCount: number | undefined) => {
      if (maxCount === undefined) return false;
      const propertyCount = Object.values(node.data.nodeProps).filter(
        p => p.classProperty.path === path
      ).length;
      return propertyCount >= maxCount;
    };

    const handleMouseDown = (
      event: MouseEvent,
      classProperty: ClassProperty
    ) => {
      if (event.button !== 0) return;
      const targetNodeId = addNode(
        'inst',
        node.position.x + 250 + Math.floor(Math.random() * 100),
        node.position.y + 150 + Math.floor(Math.random() * 100),
        classProperty.targetClass,
        true
      );
      const newEdge = [
        {
          id: nanoid(),
          source: node.id,
          target: targetNodeId,
          data: { classProperty },
        },
      ];
      addEdges(newEdge);
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
              alignOffset={-1}
            >
              {propItems}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        );
      }
    }
    return classItems;
  }, [node, addEdges]);

  return items().length > 0 ? (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={itemClass}>
        <span>Add Class</span>
        <ChevronRightIcon />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className={contentClass}
          sideOffset={-1}
          alignOffset={-1}
        >
          {items()}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  ) : null;
};

export default InstClassMenu;
