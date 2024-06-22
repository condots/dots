import React from 'react';

import * as Select from '@radix-ui/react-select';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';

import { inputProperties } from '@/scripts/app-utils';
import { getNodeProperty, setNodeProperty } from '@/store/flow';

const SelectItem = React.forwardRef(({ children, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={`
        leading-none 
        rounded-[3px] 
        flex items-center 
        h-[25px] 
        pr-[35px] 
        pl-[25px] 
        relative 
        select-none 
        text-sm 
        text-spdx-dark 
        data-[disabled]:text-mauve8 
        data-[disabled]:pointer-events-none 
        data-[highlighted]:outline-none 
        data-[highlighted]:bg-spdx-dark 
        data-[highlighted]:text-violet1
      `}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

SelectItem.displayName = 'SelectItem';

const PropSelectField = ({
  nodeId,
  propertyId,
}: {
  nodeId: string;
  propertyId: string;
}) => {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;
  const p = inputProperties.get(nodeProperty.classProperty.datatype)!;

  const setValue = (value: string) => {
    setNodeProperty(nodeId, propertyId, value);
  };

  return (
    <Select.Root value={nodeProperty.value as string} onValueChange={setValue}>
      <Select.Trigger
        className={`
          inline-flex 
          items-center 
          justify-between 
          rounded-sm 
          border-2 
          border-inherit 
          w-full 
          px-1 
          outline-none 
          text-sm 
          leading-none 
          h-7 
          hover:bg-spdx-dark/5 
        `}
      >
        <Select.Value placeholder="Select..." />
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
          <Select.ScrollUpButton className="flex items-center justify-center h-6 cursor-default">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="px-1 py-2">
            {nodeProperty.classProperty.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-6 cursor-default">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
          <Select.Arrow />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default PropSelectField;
