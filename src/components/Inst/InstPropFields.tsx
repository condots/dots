import React from 'react';

import { getNode } from '@/store/flow';
import { inputProperties } from '@/scripts/app-utils';
import InstPropSelectField from '@/components/Inst/InstPropSelectField';
import InstPropLabel from '@/components/Inst/InstPropLabel';
import InstPropTextField from '@/components/Inst/InstPropTextField';
import InstPropBoolField from '@/components/Inst/InstPropBoolField';

const InstPropFields = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);
  const nodeProperties = node?.data.nodeProps;

  const propertyFields = nodeProperties
    ? Object.entries(nodeProperties).map(([propertyId, nodeProperty]) => {
        const borderColor = `border-spdx-dark ${!nodeProperty.valid && 'border-red-400'}`;
        if (
          nodeProperty.classProperty.datatype &&
          inputProperties.has(nodeProperty.classProperty.datatype)
        ) {
          const p = inputProperties.get(nodeProperty.classProperty.datatype)!;
          if (p.inputType) {
            return (
              <div
                className={`flex-auto w-full ${borderColor}`}
                key={propertyId}
              >
                <InstPropLabel nodeId={nodeId} propertyId={propertyId} />
                <InstPropTextField nodeId={nodeId} propertyId={propertyId} />
              </div>
            );
          } else if (nodeProperty.classProperty.datatype === 'boolean') {
            return (
              <div
                className={`
                  flex 
                  w-full 
                  items-center 
                  justify-between 
                  ${borderColor}
                `}
                key={propertyId}
              >
                <InstPropBoolField nodeId={nodeId} propertyId={propertyId} />
                <InstPropLabel nodeId={nodeId} propertyId={propertyId} />
              </div>
            );
          }
        } else if (nodeProperty.classProperty.options) {
          return (
            <div className={`flex-auto w-full ${borderColor}`} key={propertyId}>
              <InstPropLabel nodeId={nodeId} propertyId={propertyId} />
              <InstPropSelectField nodeId={nodeId} propertyId={propertyId} />
            </div>
          );
        }
      })
    : [];

  return (
    <div className="my-4 mx-[15px] text-spdx-dark font-lato">
      <div className="grid gap-y-4">{propertyFields}</div>
    </div>
  );
};

export default InstPropFields;
