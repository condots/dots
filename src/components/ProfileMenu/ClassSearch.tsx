import React, { useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { tracked } from "@/store/global";
import _ from "lodash-es";

export default function ClassSearch({ selected, setSelected }) {
  const model = tracked().onto.model();

  const allClasses = useMemo(
    () =>
      _.sortBy(
        Object.values(model)
          .map((clss) => Object.values(clss).map((cls) => cls))
          .flat(),
        "name"
      ),
    [model]
  );

  return (
    <Dropdown
      optionLabel="name"
      value={selected}
      options={allClasses}
      onChange={(e) => setSelected(e.value)}
      placeholder="Select a class..."
      filterBy="name"
      filterMatchMode="startsWith"
      className="w-full sticky top-0 truncate py-2"
      autoFocus
      resetFilterOnHide
      filterInputAutoFocus
      showClear
      filter
    />
  );
}
