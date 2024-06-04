import React from 'react';

import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';

import { getNodeProperty, setNodeProperty } from '@/store/flow';
import { inputProperties } from '@/scripts/app-utils';
import { PropLabel } from '@/components/Prop/PropLabel';

interface PropInput {
  nodeId: string;
  propertyId: string;
}

export default function PropInputNumber({ nodeId, propertyId }: PropInput) {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;
  const inputProperty = inputProperties.get(
    nodeProperty.classProperty.datatype
  )!;

  const setValue = (event: InputNumberValueChangeEvent) => {
    const value = event.target.value as number;
    setNodeProperty(nodeId, propertyId, value);
  };

  return (
    <div className="flex-auto">
      <PropLabel nodeId={nodeId} propertyId={propertyId} />
      <InputNumber
        id={propertyId}
        invalid={!nodeProperty.valid}
        className="border-2 w-full"
        onValueChange={e => setValue(e)}
        value={nodeProperty.value as number}
        min={inputProperty.min}
      />
      <small className="font-lato">{inputProperty.helpText ?? ''}</small>
    </div>
  );
}
