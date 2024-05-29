import types from "@/types";
import { useRef } from "react";
import { appStore } from "@/store/app";
import { addNodeProperty, getNode } from "@/store/flow";
import { inputProperties } from "@/scripts/app-utils";
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
  const menu = useRef<TieredMenu>(null);

  const classPropertyIcon = (classProperty: types.ClassProperty) => {
    if (classProperty.options) {
      return "list";
    } else {
      return inputProperties.get(classProperty.datatype)!.icon;
    }
  };

  const reachedMaxCount = (path: types.IRI, maxCount: number) => {
    if (maxCount === undefined) return false;
    const propertyCount = node
      ? Object.values(node.data.properties).filter(
          (p) => p.classProperty.path === path
        ).length
      : 0;
    return propertyCount >= maxCount;
  };

  const items = () => {
    const recursiveClassProperties = getRecursiveClassProperties(
      node?.data.cls.iri
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
    return items;
  };

  const itemRenderer = (item: MenuItem) => {
    const classProperty = item.data as types.ClassProperty;
    const property = getItem(classProperty.path) as types.Property;
    const propertyIcon = classPropertyIcon(classProperty);
    const itemIcon = (
      <span className="material-icons-outlined mr-2 flex justify-end">
        {propertyIcon}
      </span>
    );

    return (
      <Button
        text
        className="p-menuitem-link w-full text-left"
        tooltip={property.summary}
        tooltipOptions={{ showDelay: 1000 }}
        icon={itemIcon}
        badge={badge(classProperty.minCount, classProperty.maxCount)}
        disabled={reachedMaxCount(classProperty.path, classProperty.maxCount)}
        badgeClassName="p-badge-secondary"
        label={item.label}
        onClick={() => addNodeProperty(nodeId!, classProperty)}
      />
    );
  };

  return (
    <>
      <TieredMenu model={items()} ref={menu} className="w-fit" popup />
      <Button
        label="Add property"
        icon="pi pi-plus"
        onClick={(e) => menu.current && menu.current.toggle(e)}
      />
    </>
  );
}
