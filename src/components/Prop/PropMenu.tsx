import { useRef } from "react";
import { appStore } from "@/store/app";
import { addProperty, datatypeIcon, getNode } from "@/store/flow";
import { getItem, getRecClassProperties } from "@/store/onto";
import { TieredMenu } from "primereact/tieredmenu";
import { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";
import { Property } from "@/scripts/onto-utils";

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
  // const cls = byIRI(node?.data.iri) as Class;
  const recClassProperties = getRecClassProperties(node?.data.iri);
  // const properties = classProperties(node?.data.iri, true, true);
  const menu = useRef(null);

  const items = () => {
    const items: MenuItem[] = [];
    // Map.groupBy(classProperties, (v) => v[0].split("/").pop();
    for (const [clsName, properties] of recClassProperties) {
      const subitems: MenuItem[] = [];
      for (const [propertyName, property] of Object.entries(
        properties,
      ).sort()) {
        subitems.push({
          label: propertyName,
          data: property,
          template: itemRenderer,
        });
      }
      if (subitems.length > 0) {
        items.push({ label: clsName, items: subitems });
      }
    }
    return items;
  };

  const itemRenderer = (item: MenuItem) => {
    const property = getItem(item.data.path) as Property;

    return (
      <Button
        text
        className="p-menuitem-link w-full text-left"
        tooltip={property.summary}
        tooltipOptions={{ showDelay: 1000 }}
        icon={itemIcon(property)}
        badge={badge(item.data.minCount, item.data.maxCount)}
        badgeClassName="p-badge-secondary"
        label={item.label}
        onClick={() => addProperty(nodeId!, item.data.path)}
      />
    );
  };

  const itemIcon = (property: Property) => (
    <span className="material-icons-outlined mr-2 flex justify-end">
      {datatypeIcon(property)}
    </span>
  );

  return (
    <>
      <TieredMenu model={items()} ref={menu} className="w-fit" popup />
      <Button
        label="Add property"
        icon="pi pi-plus"
        onClick={(e) => menu.current.toggle(e)}
      />
    </>
  );
}
