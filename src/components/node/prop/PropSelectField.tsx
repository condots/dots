import React from 'react';

import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { useNodeId } from '@xyflow/react';

import { contentClass, itemClass } from '@/scripts/app-utils';
import { useNodeProperty, setNodeProperty } from '@/store/flow';
import { appStore } from '@/store/app';

const PropSelectField = ({ propertyId }: { propertyId: string }) => {
  const nodeId = useNodeId()!;
  const nodeProperty = useNodeProperty(nodeId, propertyId)!;
  const mediaTypes = appStore.use.mediaTypes();

  const setValue = (value: string) => {
    setNodeProperty(nodeId, propertyId, value);
  };

  const options =
    nodeProperty.classProperty.datatype === 'MediaType'
      ? mediaTypes
      : nodeProperty.classProperty.options;

  const dropdownIcon = (
    <span className="material-symbols-outlined text-base flex items-center justify-between">
      keyboard_arrow_down
    </span>
  );

  const itemSize = 25;
  const listHeight = options!.length * itemSize + 2;
  const scrollHeight = listHeight < 300 ? `${listHeight}px` : '300px';

  const borderColor = `border-spdx-dark ${!nodeProperty.valid && 'border-red-400'}`;
  const inputColor = `text-spdx-dark ${!nodeProperty.valid && 'italic text-slate-400'}`;

  return (
    <Dropdown
      value={nodeProperty.value as string}
      onChange={(e: DropdownChangeEvent) => setValue(e.value)}
      options={options}
      virtualScrollerOptions={{
        itemSize: 25,
        scrollHeight: scrollHeight,
      }}
      placeholder="Select..."
      dropdownIcon={dropdownIcon}
      unstyled
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
          h-7
          hover:bg-spdx-dark/5
          p-dropdown
          truncate
        `}
      panelClassName={contentClass + ' p-1'}
      pt={{
        input: {
          className: `truncate ${inputColor}`,
        },
        item: {
          className: `
              ${itemClass}
              hover:bg-spdx-dark
              hover:text-mauve1
              truncate
            `,
        },
      }}
    />
  );
};

export default PropSelectField;
