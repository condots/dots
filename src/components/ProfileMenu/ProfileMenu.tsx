import React, { useMemo, useState } from "react";
import { tracked } from "@/store/global";
import { PanelMenu } from "primereact/panelmenu";
import { Tooltip } from "primereact/tooltip";
import ClassSearch from "@/components/ProfileMenu/ClassSearch";

const clsRenderer = (cls) => {
  const onDragStart = (event, iri) => {
    event.dataTransfer.setData("application/reactflow", iri);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      <Tooltip
        target=".p-menuitem-link"
        className="text-balance text-xs"
        position="right"
      />
      <a
        className="p-menuitem-link"
        onDragStart={(event) => onDragStart(event, cls.iri)}
        draggable
        data-pr-tooltip={cls.summary}
      >
        <span className="p-menuitem-text">{cls.label}</span>
      </a>
    </>
  );
};

const ProfileMenu = () => {
  const profilesModel = tracked().onto.model();
  const [selected, setSelected] = useState<object>();

  const profileItems = useMemo(() => {
    const items = [];
    for (const [profile, classes] of Object.entries(profilesModel).sort()) {
      const classItems = [];
      for (const [name, cls] of Object.entries(classes).sort()) {
        classItems.push({
          label: name,
          iri: cls.iri,
          summary: cls.summary,
          template: clsRenderer,
        });
      }

      if (selected) {
        if (selected.profile === profile) {
          items.push({
            label: profile,
            items: [classItems.find((cls) => cls.iri === selected.iri)],
            expanded: true,
          });
        }
      } else {
        items.push({
          label: profile,
          items: classItems,
        });
      }
    }
    return items;
  }, [profilesModel, selected]);

  return (
    <div className="card flex h-full w-full flex-col">
      <ClassSearch selected={selected} setSelected={setSelected} />
      <p className="text-center text-sm text-gray-300">{selected?.iri}</p>
      <PanelMenu model={profileItems} className="overflow-scroll" />
    </div>
  );
};

export default ProfileMenu;
