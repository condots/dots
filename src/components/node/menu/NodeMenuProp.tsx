import React, { useMemo } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useNodeId } from '@xyflow/react';

import { ClassProperty, IRI } from '@/types';
import { addNodeProperty, useNode, setNodeExpanded } from '@/store/flow';
import {
  contentClass,
  getClassPropertyIcon,
  itemClass,
  parseIRI,
} from '@/scripts/app-utils';
import { ontoStore } from '@/store/onto';

const NodeMenuProp = () => {
  const nodeId = useNodeId()!;
  const node = useNode(nodeId);

  const items = useMemo(() => {
    if (!node) return [];

    const reachedMaxCount = (
      path: IRI,
      maxCount: number | undefined | null
    ) => {
      if (maxCount == null) return false;
      const propertyCount = Object.values(node.data.nodeProps).filter(
        p => p.classProperty.path === path
      ).length;
      return propertyCount >= maxCount;
    };

    const onSelect = (
      event: React.MouseEvent,
      classProperty: ClassProperty
    ) => {
      if (event.metaKey) event.preventDefault();
      addNodeProperty(node.id, classProperty);
      setNodeExpanded(node.id, true);
    };

    const recClsProps = ontoStore.getState().allRecClsProps![node.data.cls.iri];
    const classItems = [];
    for (const [propClsIRI, clsProps] of recClsProps) {
      const propClsName = parseIRI(propClsIRI).name;
      const propItems = [];
      for (const [propName, clsProp] of Object.entries(clsProps).sort()) {
        if (!clsProp.targetClass) {
          propItems.push(
            <DropdownMenu.Item
              key={clsProp.path}
              disabled={reachedMaxCount(clsProp.path, clsProp.maxCount)}
              className={itemClass}
              onClick={e => onSelect(e, clsProp)}
            >
              <span className="pr-2">{propName}</span>
              <span className="material-symbols-outlined text-sm">
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
              <span className="pr-2">{propClsName}</span>
              <ChevronRightIcon />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent
              className={contentClass + ' p-1'}
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
        <span className="pr-2">Add Property</span>
        <ChevronRightIcon />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className={contentClass + ' p-1'}
          sideOffset={-1}
          alignOffset={-5}
        >
          {items}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  ) : null;
};

export default NodeMenuProp;
