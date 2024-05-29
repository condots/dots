import types from "@/types";
import { forwardRef, useEffect, useState } from "react";
import { addNode, getNode } from "@/store/flow";
import { getClassPropertyIcon } from "@/scripts/app-utils";
import { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";
import { getItem } from "@/store/onto";
import { getRecursiveClassProperties } from "@/scripts/onto-utils";
import { ContextMenu } from "primereact/contextmenu";
import { useReactFlow } from "reactflow";
import { nanoid } from "nanoid";

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

const InstMenu = forwardRef(({ nodeId }: { nodeId: string }, cmRef) => {
  const node = getNode(nodeId);
  const [items, setItems] = useState<MenuItem[]>([]);
  const { addEdges } = useReactFlow();

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
          if (
            classProperty.nodeKind === "BlankNodeOrIRI" &&
            !getItem(classProperty.targetClass).abstract
          ) {
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
        className="p-menuitem-link w-full text-left py-1.5"
        tooltip={property.summary}
        tooltipOptions={{ showDelay: 1000 }}
        icon={itemIcon}
        badge={badge(classProperty.minCount, classProperty.maxCount)}
        badgeClassName="p-badge-secondary"
        label={item.label}
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          // cmRef.current!.hide();
          const targetNodeId = addNode(
            "inst",
            event.clientX,
            event.clientY,
            classProperty.targetClass
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
        }}
      />
    );
  };

  return (
    <ContextMenu
      model={items}
      ref={cmRef}
      className="absolute w-fit scalein origin-top"
    />
  );
});

export default InstMenu;
