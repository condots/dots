import { useRef } from "react";
import { appStore } from "@/store/app";
import { addProperty, datatypeIcon, getNode } from "@/store/flow";
import { byIri } from "@/store/onto";
import { TieredMenu } from "primereact/tieredmenu";
import { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";

export default function PropMenu() {
  const nodeId = appStore.use.selectedNodeId();
  const node = getNode(nodeId);
  const menu = useRef(null);

  const classProperties = (iri: string) => {
    const items: MenuItem[] = [];
    while (iri) {
      const c = byIri(iri);
      const subitems: MenuItem[] = [];
      Object.entries(c.properties).forEach(([k, v]) => {
        if (byIri(v.path).datatype) {
          subitems.push({ label: k, data: v, template: itemRenderer });
        }
      });
      if (subitems.length > 0) {
        items.push({ label: c.name, items: subitems });
      }
      iri = c.subClassOf;
    }
    return items;
  };

  const itemRenderer = (item: MenuItem) => {
    const propertyIri = item.data.path;
    const propertyComponent = byIri(propertyIri);
    const min = item.data.minCount;
    const max = item.data.maxCount;

    let badge = "";
    if (min && max) {
      if (min === max) {
        badge = `${min}`;
      } else {
        badge = `${min}:${max}`;
      }
    } else if (min) {
      badge = `${min}+`;
    } else if (max) {
      badge = `0:${max}`;
    } else {
      badge = `0+`;
    }

    return (
      <Button
        text
        className="p-menuitem-link w-full text-left"
        tooltip={propertyComponent.summary}
        tooltipOptions={{ showDelay: 1000 }}
        icon={itemIcon(propertyComponent.datatype)}
        badge={badge}
        badgeClassName="p-badge-secondary"
        label={item.label}
        onClick={() => addProperty(nodeId!, propertyIri)}
      />
    );
  };

  const itemIcon = (datatype: string) => (
    <span className="material-icons-outlined mr-2 flex justify-end">
      {datatypeIcon(datatype)}
    </span>
  );

  return (
    <>
      <TieredMenu model={classProperties(node?.data.iri)} ref={menu} popup />
      <Button
        label="Add property"
        icon="pi pi-plus"
        onClick={(e) => menu.current.toggle(e)}
      />
    </>
  );
}
