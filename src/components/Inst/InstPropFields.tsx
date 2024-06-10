import React from 'react';

import { getNode } from '@/store/flow';
import { inputProperties } from '@/scripts/app-utils';
import PropInputString from '@/components/Prop/PropInputString';
import PropInputNumber from '@/components/Prop/PropInputNumber';
import PropInputBoolean from '@/components/Prop/PropInputBoolean';
import PropInputOptions from '@/components/Prop/PropInputOptions';

const InstPropFields = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);
  const nodeProperties = node?.data.nodeProps;

  const propertyFields = nodeProperties
    ? Object.entries(nodeProperties).map(([propertyId, nodeProperty]) => {
        if (
          nodeProperty.classProperty.datatype &&
          inputProperties.has(nodeProperty.classProperty.datatype)
        ) {
          const p = inputProperties.get(nodeProperty.classProperty.datatype)!;
          if (p.inputType === 'string') {
            return (
              <PropInputString
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          } else if (p.inputType === 'number') {
            return (
              <PropInputNumber
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          } else if (p.inputType === 'boolean') {
            return (
              <PropInputBoolean
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          }
        } else if (nodeProperty.classProperty.options) {
          return (
            <PropInputOptions
              key={propertyId}
              nodeId={nodeId!}
              propertyId={propertyId}
            />
          );
        }
      })
    : [];

  return <div className="">{propertyFields}</div>;
};

export default InstPropFields;
