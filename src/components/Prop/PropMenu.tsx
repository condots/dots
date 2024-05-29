import types from "@/types";
import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "primereact/hooks";
import { appStore } from "@/store/app";
import { addNodeProperty, getNode } from "@/store/flow";
import { getClassPropertyIcon } from "@/scripts/app-utils";
import { TieredMenu } from "primereact/tieredmenu";
import { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";
import { getItem } from "@/store/onto";
import { getRecursiveClassProperties } from "@/scripts/onto-utils";

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

  const reachedMaxCount = (path: types.IRI, maxCount: number | undefined) => {
    if (maxCount === undefined) return false;
    const propertyCount = node
      ? Object.values(node.data.properties).filter(
          (p) => p.classProperty.path === path
        ).length
      : 0;
    return propertyCount >= maxCount;
  };

  useEffect(() => {
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
          if (classProperty.nodeKind !== "BlankNodeOrIRI") {
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
  }, [node]);

  const itemRenderer = (item: MenuItem) => {
    const classProperty = item.data as types.ClassProperty;
    const property = getItem(classProperty.path) as types.Property;
    const propertyIcon = getClassPropertyIcon(classProperty);
    const itemIcon = (
      <span className="material-icons-outlined mr-2 flex justify-end">
        {propertyIcon}
      </span>
    );

    item.disabled = reachedMaxCount(classProperty.path, classProperty.maxCount);

    return (
      <Button
        text
        className="p-menuitem-link w-full text-left"
        tooltip={property.summary}
        tooltipOptions={{ showDelay: 1000 }}
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
          className="absolute w-fit scalein origin-top"
          hidden={!visible}
        />
      </div>
    </div>
  );
}
