import React from 'react';

import { NodeProperty } from '@/types';
import { inputProperties } from '@/scripts/app-utils';
import { getNodeProperty, setNodeProperty } from '@/store/flow';

const InstPropTextField = ({
  nodeId,
  propertyId,
}: {
  nodeId: string;
  propertyId: string;
}) => {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;
  const p = inputProperties.get(nodeProperty.classProperty.datatype)!;

  return (
    <input
      id={propertyId}
      type={p.inputType}
      pattern={p.pattern}
      min={p.min}
      max={p.max}
      step={p.step}
      minLength={p.minLength}
      maxLength={p.maxLength}
      placeholder={p.helpText}
      formNoValidate={true}
      value={
        (nodeProperty.value as Exclude<NodeProperty['value'], boolean>) ?? ''
      }
      className={`
          h-7 pl-1 pr-0.5 rounded-sm border-2 w-full outline-none bg-white border-inherit
          text-sm placeholder:italic placeholder:text-slate-400 overflow-ellipsis
          ${!nodeProperty.valid && 'border-red-400'}
        `}
      onChange={e => setNodeProperty(nodeId, propertyId, e.target.value)}
      onClick={e => e.target.showPicker()}
    />
  );
};

export default InstPropTextField;
