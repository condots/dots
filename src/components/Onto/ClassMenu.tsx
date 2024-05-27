import React, { useEffect, useState } from "react";
import { ontoStore } from "@/store/onto";
import { Tree, TreeNodeTemplateOptions } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { appStore } from "@/store/app";

const ClassMenu = () => {
  const showClassesMenu = appStore.use.showClassesMenu();
  const profiles = ontoStore.use.profiles();
  const [expandedKeys, setExpandedKeys] = useState({});
  const [items, setItems] = useState<TreeNode[]>([]);

  useEffect(() => {
    const items = [];
    if (profiles === null) return;
    for (const [profileName, profile] of Object.entries(profiles)) {
      const subitems = [];
      for (const [className, cls] of Object.entries(profile.classes)) {
        if (cls.abstract) continue;
        subitems.push({
          key: className,
          label: className,
          draggable: true,
          droppable: false,
          className: "m-0 p-0 rounded-md",
          data: {
            iri: cls.iri,
            summary: cls.summary,
          },
        });
      }
      if (subitems.length > 0) {
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
    }
    setItems(items);
  }, [profiles]);

  const onDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    node: TreeNode
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
          unstyled
          className={`${options.className} m-0 px-2 py-1 font-lato w-full rounded-md
            text-left hover:bg-[#00416b] text-secondary hover:text-white truncate`}
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

  // #d5d5d5

  const TreeMenu = () => (
    <Tree
      value={items}
      filter
      filterMode="strict"
      filterPlaceholder="Search..."
      className="h-full w-full overflow-scroll bg-[#e6e5e6] font-lato border-none rounded-none"
      nodeTemplate={nodeTemplate}
      dragdropScope="reactflow"
      pt={{ droppoint: { className: "h-0" } }}
      expandIcon={
        <span className="material-icons-outlined text-sm text-gray-500">
          add_box
        </span>
      }
      collapseIcon={
        <span className="material-icons-outlined text-sm text-gray-500">
          indeterminate_check_box
        </span>
      }
      expandedKeys={expandedKeys}
      onToggle={() => {}}
      onExpand={(e) => setExpandedKeys(() => ({ [e.node.key]: true }))}
      onCollapse={() => setExpandedKeys(() => ({}))}
    />
  );

  return (
    <div>
      <Sidebar
        visible={showClassesMenu}
        modal={false}
        className="bg-transparent"
        onHide={() => appStore.setState({ showClassesMenu: false })}
        content={() => <TreeMenu />}
      />
    </div>
  );
};

export default ClassMenu;
