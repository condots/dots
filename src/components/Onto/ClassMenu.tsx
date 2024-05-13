import React, { useEffect, useState } from "react";
// import { tracked } from "@/store/global";
import { ontoStore } from "@/zustand/onto";
import { Tree, TreeNodeTemplateOptions } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Button } from "primereact/button";

const ClassMenu = () => {
  const model = ontoStore.use.model();
  const [expandedKeys, setExpandedKeys] = useState({});
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const items = [];
    for (const [i, [profile, sections]] of Object.entries(model)
      .sort()
      .entries()) {
      const children = [];
      for (const [j, [name, cls]] of Object.entries(sections.classes)
        .sort()
        .entries()) {
        children.push({
          key: `${i}-${j}`,
          label: name,
          draggable: true,
          droppable: false,
          className: "m-0 p-0",
          data: {
            iri: cls.iri,
            summary: cls.summary,
          },
        });
      }

      items.push({
        key: `${i}`,
        label: profile,
        draggable: false,
        droppable: false,
        className: "select-none",
        data: {
          iri: sections.iri,
          summary: sections.summary,
        },
        children,
      });
    }
    setClasses(items);
  }, [model]);

  const onDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    node: TreeNode,
  ) => {
    event.dataTransfer.setData("application/reactflow", node.data.iri);
    event.dataTransfer.effectAllowed = "move";
  };

  const nodeTemplate = (node: TreeNode, options: TreeNodeTemplateOptions) => {
    if (node.draggable) {
      return (
        <Button
          label={node.label}
          text
          severity="secondary"
          className={`${options.className} m-0 px-2 py-1 font-normal`}
          tooltip={node.data?.summary}
          tooltipOptions={{
            position: "right",
            className: "text-xs",
            showDelay: 2000,
            at: "right+2 center",
          }}
          onDragStart={(event) => onDragStart(event, node)}
          draggable={node.draggable}
        />
      );
    } else {
      return <div>{node.label}</div>;
    }
  };

  return (
    <Tree
      value={classes}
      filter
      filterMode="strict"
      filterPlaceholder="Search..."
      className="h-full w-full overflow-scroll"
      nodeTemplate={nodeTemplate}
      dragdropScope="reactflow"
      pt={{ droppoint: { className: "h-0" } }}
      // to allow only single expansion
      expandedKeys={expandedKeys}
      onToggle={() => {}}
      onExpand={(e) => setExpandedKeys(() => ({ [e.node.key]: true }))}
      onCollapse={() => setExpandedKeys(() => ({}))}
    />
  );
};

export default ClassMenu;
