import React from 'react';

import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';

import { getNodeProperty, setNodeProperty } from '@/store/flow';
import { inputProperties } from '@/scripts/app-utils';
import { PropLabel } from '@/components/Prop/PropLabel';

interface PropInput {
  nodeId: string;
  propertyId: string;
}

export default function PropInputString({ nodeId, propertyId }: PropInput) {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;
  const inputProperty = inputProperties.get(
    nodeProperty.classProperty.datatype
  )!;

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
      {inputProperty.mask ? (
        <InputMask
          {...commonProps}
          value={nodeProperty.value as string}
          mask={inputProperty.mask}
          slotChar={inputProperty.slotChar}
        />
      ) : (
        <InputText {...commonProps} />
      )}
      <small className="font-lato">{inputProperty.helpText}</small>
    </div>
  );
}
