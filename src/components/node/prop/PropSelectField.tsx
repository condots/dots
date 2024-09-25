import { useMemo } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { useNodeId } from 'reactflow';

import { contentClass } from '@/scripts/app-utils';
import { useNodeProperty, setNodeProperty } from '@/store/flow';
import { appStore } from '@/store/app';
import { orderBy } from 'lodash-es';

const PropSelectField = ({ propertyId }: { propertyId: string }) => {
  const nodeId = useNodeId()!;
  const nodeProperty = useNodeProperty(nodeId, propertyId)!;
  const mediaTypes = appStore.use.mediaTypes();

  const setValue = (value: string) => {
    setNodeProperty(nodeId, propertyId, value);
  };

  const options = useMemo(() => {
    const ops =
      nodeProperty.classProperty.datatype === 'MediaType'
        ? mediaTypes
        : nodeProperty.classProperty.options;
    return orderBy(ops, [o => o.label.toLowerCase()], ['asc']);
  }, [
    nodeProperty.classProperty.datatype,
    mediaTypes,
    nodeProperty.classProperty.options,
  ]);

  const dropdownIcon = (
    <span className="material-symbols-outlined text-base flex items-center justify-between">
      keyboard_arrow_down
    </span>
  );

  const itemSize = 25;
  const listHeight = options!.length * itemSize + 2;
  const scrollHeight = listHeight < 300 ? `${listHeight}px` : '300px';

  const borderColor = `border-spdx-dark ${!nodeProperty.valid && 'border-red-400'}`;
  const inputColor = nodeProperty.valid
    ? 'text-spdx-dark'
    : 'italic text-slate-400';

  return (
    <Dropdown
      value={nodeProperty.value as string}
      onChange={(e: DropdownChangeEvent) => setValue(e.value)}
      options={options}
      placeholder="Select an option..."
      dropdownIcon={dropdownIcon}
      className={`
          items-center
          justify-between
          rounded-sm
          border-2
          ${borderColor}
          w-full
          px-1
          outline-none
          text-sm
          font-lato
          h-7
          hover:bg-spdx-dark/5
          truncate
          ring-inherit
          shadow-none
        `}
      panelClassName={
        contentClass +
        ` p-1 max-h-[${scrollHeight}px] max-w-[240px] overflow-auto font-lato`
      }
      pt={{
        input: {
          className: `truncate font-lato text-sm group rounded flex justify-between items-center h-6 relative p-0 ${inputColor}`,
        },
        item: {
          className: `truncate text-sm group rounded flex justify-between items-center h-6 relative p-1`,
        },
      }}
    />
  );
};

export default PropSelectField;
