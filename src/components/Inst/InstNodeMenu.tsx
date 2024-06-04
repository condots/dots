import React, { useCallback, useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import { useReactFlow } from 'reactflow';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon, ChevronRightIcon } from '@radix-ui/react-icons';

import { ClassProperty, IRI } from '@/types';
import { addNode, getNode } from '@/store/flow';
import { getRecursiveClassProperties } from '@/scripts/onto-utils';
import { getItem } from '@/store/onto';

const InstNodeMenu = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);
  const [items, setItems] = useState<JSX.Element[]>([]);
  const { addEdges } = useReactFlow();
  const [open, setOpen] = useState(false);

  const reachedMaxCount = useCallback(
    (path: IRI, maxCount: number | undefined) => {
      if (maxCount === undefined) return false;
      const propertyCount = node
        ? Object.values(node.data.dataProperties).filter(
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
      setOpen(false);
    },
    [addEdges, nodeId]
  );

  const itemClass = `text-sm text-blue12 rounded flex
    items-center h-6 relative p-2 select-none outline-none
    data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none 
    data-[highlighted]:bg-blue12 data-[highlighted]:text-mauve1`;

  const contentClass = `p-1 bg-mauve1 rounded border border-mauve6
    shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]
    will-change-[opacity,transform] 
    data-[side=top]:animate-slideDownAndFade 
    data-[side=right]:animate-slideLeftAndFade 
    data-[side=bottom]:animate-slideUpAndFade 
    data-[side=left]:animate-slideRightAndFade`;

  useEffect(() => {
    if (node) {
      const recursiveClassProperties = getRecursiveClassProperties(
        node.data.cls.iri
      );
      const classItems = [];
      for (const [
        propertyClassName,
        classProperties,
      ] of recursiveClassProperties || []) {
        const propertyItems = [];
        for (const [propertyName, classProperty] of Object.entries(
          classProperties
        ).sort()) {
          if (
            classProperty.nodeKind === 'BlankNodeOrIRI' &&
            !getItem(classProperty.targetClass)!.abstract
          ) {
            propertyItems.push(
              <DropdownMenu.Item
                key={classProperty.path}
                onMouseDown={e => handleMouseDown(e, classProperty)}
                disabled={reachedMaxCount(
                  classProperty.path,
                  classProperty.maxCount
                )}
                className={itemClass}
              >
                {propertyName}
              </DropdownMenu.Item>
            );
          }
        }
        if (propertyItems.length > 0) {
          classItems.push(
            <DropdownMenu.Sub key={propertyClassName}>
              <DropdownMenu.SubTrigger className={itemClass}>
                <span className="p-1">{propertyClassName}</span>
                <ChevronRightIcon />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent
                className={contentClass}
                sideOffset={-1}
                alignOffset={-5}
              >
                {propertyItems}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          );
        }
      }
      setItems(classItems);
    }
  }, [node, handleMouseDown, reachedMaxCount, itemClass, contentClass]);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="nodrag nopan outline-none p-1 rounded text-blue12 hover:bg-blue12/5 data-[state=open]:rotate-180">
          <HamburgerMenuIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={contentClass} align="start">
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={itemClass}>
              <span className="p-1">Add Connection</span>
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
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default InstNodeMenu;
