import React, { useEffect, useState } from "react";
import { ontoStore, updateOntology } from "@/store/onto";
import { Tree, TreeNodeTemplateOptions } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Button } from "primereact/button";

const ClassMenu = () => {
  const profiles = ontoStore.use.profiles();
  const [expandedKeys, setExpandedKeys] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    const source = "https://spdx.org/rdf/3.0.0/spdx-model.ttl";
    updateOntology(source);
  }, []);

  useEffect(() => {
    const items = [];
    if (profiles === null) return;
    try {
      for (const [profileName, profile] of profiles) {
        const subitems = [];
        for (const [className, cls] of profile.classes) {
          subitems.push({
            key: className,
            label: className,
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
          key: profileName,
          label: profileName,
          draggable: false,
          droppable: false,
          className: "select-none",
          data: {
            iri: profile.iri,
            summary: profile.summary,
          },
          children: subitems,
        });
      }
    } catch (error) {
      console.log(profiles);

      console.error(error);
    }
    setItems(items);
  }, [profiles]);

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
      value={items}
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
