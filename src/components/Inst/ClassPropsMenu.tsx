import React, { useEffect, useRef, useState } from "react";
import { tracked, actions, getters } from "@/store/global";
import { TieredMenu } from "primereact/tieredmenu";
import { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";
import { Node } from "reactflow";

export default function ClassPropsMenu() {
  const nodeId = tracked().app.instDialog().nodeId;
  const [classProperties, setClassProperties] = useState<object[]>();
  const menu = useRef(null);

  useEffect(() => {
    if (!nodeId) return;
    const node = getters.flow.getNode(nodeId);
    setClassProperties(() => getClassProperties(node));
  }, [nodeId]);

  const getClassProperties = (node: Node) => {
    let iri = node?.data.iri;
    const items: MenuItem[] = [];
    while (iri) {
      const c = getters.onto.byIri(iri);
      const subitems: MenuItem[] = [];
      Object.entries(c.properties).forEach(([k, v]) => {
        if (getters.onto.byIri(v.path).datatype) {
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
    const property = getters.onto.byIri(item.data.path);
    return (
      <Button
        unstyled
        className="p-menuitem-link w-full"
        tooltip={property.summary}
        tooltipOptions={{ showDelay: 1000 }}
        icon={itemIcon(property.datatype)}
        onClick={() => addProperty(item.data.path)}
      >
        {item.label}
      </Button>
    );
  };

  const itemIcon = (datatype: string) => (
    <span className="material-icons-outlined mr-2 flex justify-end">
      {getters.app.datatypeIcon(datatype)}
    </span>
  );

  const addProperty = (path: string) => {
    const property = getters.onto.byIri(path);
    const isBool = property.datatype === "boolean";
    actions.flow.Nodes((draft: Node[]) => {
      const node = draft.find((n: Node) => n.id === nodeId);
      node.data.properties[path] = {
        path,
        value: isBool ? false : "",
        valid: isBool,
      };
    });
  };

  return (
    <>
      <Button
        icon="pi pi-bars"
        outlined
        severity="secondary"
        onClick={(e) => menu.current.toggle(e)}
      />
      <TieredMenu model={classProperties} ref={menu} popup />
    </>
  );
}
