import React, { useState } from "react";
import { tracked, actions, getters } from "@/store/global";
import { Dialog } from "primereact/dialog";
import InstProps from "./InstProps";
import ClassPropsMenu from "./ClassPropsMenu";

export default function InstDialog() {
  const nodeId = tracked().app.instDialog().nodeId;
  const node = tracked().flow.getNode(nodeId);
  const cls = tracked().onto.byIri(node?.data.iri);

  // const getProp = (iri: string) => instProps.find((prop) => prop.iri === iri);

  return (
    <div className="card justify-content-center flex">
      <Dialog
        visible={nodeId !== null}
        header={cls?.name}
        className="w-1/2 h-2/3"
        onHide={() =>
          actions.app.state((state) => {
            state.instDialog.nodeId = null;
          })
        }
      >
        <ClassPropsMenu />
        {/* {instProps.map(NodeProperties)} */}
        {/* <InstProps /> */}
      </Dialog>
    </div>
  );
}
