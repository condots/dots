import React, { useCallback } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronRightIcon } from '@radix-ui/react-icons';

import { ClassProperty, IRI } from '@/types';
import { addNodeProperty, getNode, setNodeMenuState } from '@/store/flow';
import {
  contentClass,
  getClassPropertyIcon,
  itemClass,
} from '@/scripts/app-utils';
import { ontoStore } from '@/store/onto';

const NodeMenuProp = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);

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
      addNodeProperty(node.id, classProperty);
      setNodeMenuState(node.id, event.metaKey);
    };

    const recClsProps =
      ontoStore.getState().allRecClsProps![node?.data.cls.iri];
    const classItems = [];
    for (const [propClsName, clsProps] of recClsProps) {
      const propItems = [];
      for (const [propName, clsProp] of Object.entries(clsProps).sort()) {
        if (!clsProp.targetClass) {
          propItems.push(
            <DropdownMenu.Item
              key={clsProp.path}
              onMouseDown={e => handleMouseDown(e, clsProp)}
              disabled={reachedMaxCount(clsProp.path, clsProp.maxCount)}
              className={itemClass}
            >
              <span className="mr-2">{propName}</span>
              <span className="material-symbols-outlined text-sm ml-auto">
                {getClassPropertyIcon(clsProp)}
              </span>
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
  }, [node]);

  return items().length > 0 ? (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={itemClass}>
        <span className="p-1">Add Property</span>
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
  ) : null;
};

export default NodeMenuProp;
