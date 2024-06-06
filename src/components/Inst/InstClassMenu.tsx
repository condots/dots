import React, { useCallback } from 'react';

import { nanoid } from 'nanoid';
import { useReactFlow } from 'reactflow';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronRightIcon } from '@radix-ui/react-icons';

import { ClassProperty, IRI } from '@/types';
import { addNode, getNode } from '@/store/flow';
import { contentClass, itemClass } from '@/scripts/app-utils';
import { getItem, ontoStore } from '@/store/onto';

const InstClassMenu = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);
  const { addEdges } = useReactFlow();

  const reachedMaxCount = useCallback(
    (path: IRI, maxCount: number | undefined) => {
      if (maxCount === undefined) return false;
      const propertyCount = node
        ? Object.values(node.data.nodeProps).filter(
            p => p.classProperty.path === path
          ).length
        : 0;
      return propertyCount >= maxCount;
    },
    [node]
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent, classProperty: ClassProperty) => {
      if (event.button !== 0) return;
      const targetNodeId = addNode(
        'inst',
        event.clientX,
        event.clientY,
        classProperty.targetClass,
        true
      );
      const newEdge = [
        {
          id: nanoid(),
          source: nodeId,
          target: targetNodeId,
          data: { classProperty },
        },
      ];
      addEdges(newEdge);
    },
    [addEdges, nodeId]
  );

  const items = useCallback(() => {
    if (!node) return [];
    const recClsProps =
      ontoStore.getState().allRecClsProps![node?.data.cls.iri];
    const classItems = [];
    for (const [propClsName, clsProps] of recClsProps) {
      const propItems = [];
      for (const [propName, clsProp] of Object.entries(clsProps).sort()) {
        if (clsProp.targetClass && !getItem(clsProp.targetClass)!.abstract) {
          propItems.push(
            <DropdownMenu.Item
              key={clsProp.path}
              onMouseDown={e => handleMouseDown(e, clsProp)}
              disabled={reachedMaxCount(clsProp.path, clsProp.maxCount)}
              className={itemClass}
            >
              {propName}
            </DropdownMenu.Item>
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

  return (
    items().length > 0 && (
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
            {items()}
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
    )
  );
};

export default InstClassMenu;
