import React, { useEffect, useRef, useState } from "react";
import { tracked, actions, getters } from "@/store/global";
import { Dialog } from "primereact/dialog";
import { TieredMenu } from "primereact/tieredmenu";
import { Button } from "primereact/button";

export default function ElementDialog() {
  const nodeId = tracked().app.elementDialog().nodeId;
  const node = tracked().flow.getNode(nodeId);
  const cls = tracked().onto.byIri(node?.data.iri);
  const [properties, setProperties] = useState<object[]>();
  const [values, setValues] = useState({});
  const menu = useRef(null);

  useEffect(() => {
    setProperties(() => getTieredMenuProperties(node?.data.iri));
  }, [node]);

  const itemRenderer = (item) => {
    const summary = getters.onto.byIri(item.data.path).description;
    return (
      <Button unstyled className="p-menuitem-link w-full" tooltip={summary}>
        {item.label}
      </Button>
    );
  };

  const getTieredMenuProperties = (iri: string) => {
    const items = [];
    while (iri) {
      const c = getters.onto.byIri(iri);
      const item = {
        label: c.name,
        items: Object.entries(c.properties).map(([k, v]) => ({
          label: k,
          data: v,
          template: itemRenderer,
        })),
      };
      items.push(item);
      iri = c.subClassOf;
    }
    return items;
  };

  return (
    <div className="card justify-content-center flex">
      <Dialog
        header={cls?.name}
        visible={cls}
        className="w-1/2 h-2/3"
        onHide={() =>
          actions.app.state((state) => {
            state.elementDialog.nodeId = null;
          })
        }
      >
        <Button
          icon="pi pi-bars"
          outlined
          severity="secondary"
          onClick={(e) => menu.current.toggle(e)}
        />
        <TieredMenu model={properties} ref={menu} popup />
      </Dialog>
    </div>
  );
}
