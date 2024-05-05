import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { tracked, actions } from "@/store/global";

export default function InstanceDrawer() {
  const visible = tracked().info.visible();
  const name = tracked().info.name();
  const summary = tracked().info.summary();

  const customHeader = (
    <div className="flex align-items-center gap-2">
      <span className="font-bold">{name}</span>
    </div>
  );

  return (
    <div className="card flex justify-content-center">
      <Sidebar
        header={customHeader}
        position="right"
        visible={visible}
        onHide={() => actions.info.visible(false)}
      >
        <p>{summary}</p>
      </Sidebar>
    </div>
  );
}
