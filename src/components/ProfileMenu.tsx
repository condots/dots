import React, { useCallback, useMemo, useState } from 'react';

import { Tree, TreeNodeTemplateOptions } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';

import { ontoStore } from '@/store/onto';
import { appStore } from '@/store/app';

const ProfileMenu = () => {
  const showClassesMenu = appStore.use.showClassesMenu();
  const profiles = ontoStore.use.profiles();
  const [expandedKeys, setExpandedKeys] = useState({});

  const items = useMemo(() => {
    const items = [];
    if (!profiles) return;
    for (const [profileName, profile] of Object.entries(profiles).sort()) {
      const subitems = [];
      for (const [className, cls] of Object.entries(profile.classes).sort()) {
        if (cls.abstract) continue;
        subitems.push({
          key: className,
          label: className,
          className: 'm-0 p-0 rounded-md',
          data: {
            iri: cls.iri,
            summary: cls.summary,
            type: 'class',
          },
        });
      }
      if (subitems.length > 0) {
        items.push({
          key: profileName,
          label: profileName,
          className: 'select-none',
          data: {
            iri: profile.iri,
            summary: profile.summary,
            type: 'profile',
          },
          children: subitems,
        });
      }
    }
    return items;
  }, [profiles]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, targetClass: string) => {
      appStore.setState(state => {
        state.draggedClassData = {
          clientX: event.clientX,
          clientY: event.clientY,
          targetClass: targetClass,
        };
      });
      appStore.setState({ showClassesMenu: false });
    },
    []
  );

  const nodeTemplate = (node: TreeNode, options: TreeNodeTemplateOptions) => {
    if (node.data.type === 'class') {
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
            position: 'right',
            className: 'text-xs',
            showDelay: 2000,
            at: 'right+2 center',
          }}
          onMouseDown={e => handleMouseDown(e, node.data.iri)}
        />
      );
    } else {
      return <div>{node.label}</div>;
    }
  };

  const TreeMenu = () => (
    <Tree
      value={items}
      filter
      filterMode="strict"
      filterPlaceholder="Search..."
      className="h-full w-full overflow-scroll bg-[#e6e5e6] font-lato border-none rounded-none"
      nodeTemplate={nodeTemplate}
      pt={{ droppoint: { className: 'h-0' } }}
      expandIcon={
        <span className="material-symbols-outlined text-sm text-gray-500">
          add_box
        </span>
      }
      collapseIcon={
        <span className="material-symbols-outlined text-sm text-gray-500">
          indeterminate_check_box
        </span>
      }
      expandedKeys={expandedKeys}
      onToggle={() => {}}
      onExpand={e => setExpandedKeys(() => ({ [e.node.key as string]: true }))}
      onCollapse={() => setExpandedKeys(() => ({}))}
    />
  );

  return (
    <div>
      <Sidebar
        position="right"
        visible={showClassesMenu}
        modal={false}
        className="bg-transparent"
        onHide={() => appStore.setState({ showClassesMenu: false })}
        content={() => <TreeMenu />}
      />
    </div>
  );
};

export default ProfileMenu;
