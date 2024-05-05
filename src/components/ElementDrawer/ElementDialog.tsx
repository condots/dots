import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { tracked, actions } from "@/store/global";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

export default function ElementDialog() {
  const nodeId = tracked().app.elementDialog().nodeId;

  return (
    <div className="card justify-content-center flex">
      <Dialog
        header="Header"
        visible={nodeId !== null}
        style={{ width: "50vw" }}
        onHide={() =>
          actions.app.state((state) => {
            state.elementDialog.nodeId = null;
          })
        }
      >
        <p className="m-0">{nodeId}</p>
      </Dialog>
    </div>
  );
}
