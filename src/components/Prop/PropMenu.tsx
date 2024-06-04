import React, { useEffect, useRef, useState } from 'react';

import { useClickOutside } from 'primereact/hooks';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';
import { Button } from 'primereact/button';

import { ClassProperty, IRI, Property } from '@/types';
import { appStore } from '@/store/app';
import { getClassPropertyIcon } from '@/scripts/app-utils';
import { getItem } from '@/store/onto';
import { getRecursiveClassProperties } from '@/scripts/onto-utils';
import { addNodeProperty, getNode } from '@/store/flow';

const badge = (min: number | undefined, max: number | undefined) => {
  if (min && max) {
    return `${min}..${max}`;
  } else if (min) {
    return `${min}...`;
  } else if (max) {
    return `0..${max}`;
  } else {
    return `0...`;
  }
};

export default function PropMenu() {
  const nodeId = appStore.use.selectedNodeId();
  const node = getNode(nodeId);
  const divRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const reachedMaxCount = (path: IRI, maxCount: number | undefined) => {
      if (maxCount === undefined) return false;
      const propertyCount = node
        ? Object.values(node.data.dataProperties).filter(
            p => p.classProperty.path === path
          ).length
        : 0;
      return propertyCount >= maxCount;
    };

    const itemRenderer = (item: MenuItem) => {
      const classProperty = item.data as ClassProperty;
      const property = getItem(classProperty.path) as Property;
      const propertyIcon = getClassPropertyIcon(classProperty);
      const itemIcon = (
        <span className="material-icons-outlined mr-2 flex justify-end">
          {propertyIcon}
        </span>
      );

      item.disabled = reachedMaxCount(
        classProperty.path,
        classProperty.maxCount
      );

      return (
        <Button
          text
          className="p-menuitem-link w-full text-left py-1.5"
          tooltip={property.summary}
          tooltipOptions={{
            showDelay: 1000,
            className: 'text-md text-balance',
          }}
          icon={itemIcon}
          badge={badge(classProperty.minCount, classProperty.maxCount)}
          badgeClassName="p-badge-secondary"
          label={item.label}
          onClick={() => {
            addNodeProperty(nodeId!, classProperty);
            setVisible(false);
          }}
        />
      );
    };

    if (node) {
      const recursiveClassProperties = getRecursiveClassProperties(
        node.data.cls.iri
      );
      const items: MenuItem[] = [];
      for (const [
        propertyClassName,
        classProperties,
      ] of recursiveClassProperties || []) {
        const subitems: MenuItem[] = [];
        for (const [propertyName, classProperty] of Object.entries(
          classProperties
        ).sort()) {
          if (classProperty.nodeKind !== 'BlankNodeOrIRI') {
            subitems.push({
              label: propertyName,
              data: classProperty,
              template: itemRenderer,
            });
          }
        }
        if (subitems.length > 0) {
          items.push({ label: propertyClassName, items: subitems });
        }
      }
      setItems(items);
    }
  }, [node, nodeId]);

  useClickOutside(divRef, () => {
    setVisible(false);
  });

  return (
    <div>
      <Button
        onClick={() => setVisible(!visible)}
        label="Add property"
        icon="pi pi-plus"
      />
      <div ref={divRef}>
        <TieredMenu
          model={items}
          className="absolute w-fit scalein origin-top z-50"
          hidden={!visible}
        />
      </div>
    </div>
  );
}
