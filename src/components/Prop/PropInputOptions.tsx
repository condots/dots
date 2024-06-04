import React from 'react';

import { Dropdown } from 'primereact/dropdown';

import { getNodeProperty, setNodeProperty } from '@/store/flow';
import { PropLabel } from '@/components/Prop/PropLabel';

interface PropInput {
  nodeId: string;
  propertyId: string;
}

export default function PropInputOptions({ nodeId, propertyId }: PropInput) {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;

  const setValue = event => {
    const value = event.target.value;
    setNodeProperty(nodeId, propertyId, value);
  };

  const commonProps = {
    id: propertyId,
    invalid: !nodeProperty.valid,
    className: 'border-2 w-full',
    onChange: setValue,
  };

  return (
    <div className="flex-auto">
      <PropLabel nodeId={nodeId} propertyId={propertyId} />
      <Dropdown
        {...commonProps}
        value={nodeProperty.value as string}
        options={nodeProperty.classProperty.options}
        optionLabel="label"
        placeholder="Select..."
        showClear
        className="mb-[14px] w-full"
      />
    </div>
  );
}
