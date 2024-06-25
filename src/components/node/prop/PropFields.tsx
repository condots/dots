import React, { useMemo } from 'react';

import { getNode } from '@/store/flow';
import PropSelectField from '@/components/node/prop/PropSelectField';
import PropLabel from '@/components/node/prop/PropLabel';
import PropTextField from '@/components/node/prop/PropTextField';
import PropBoolField from '@/components/node/prop/PropBoolField';

const PropFields = ({ nodeId }: { nodeId: string }) => {
  const node = getNode(nodeId);
  const nodeProperties = node?.data.nodeProps;

  const fields = useMemo(
    () =>
      nodeProperties
        ? Object.entries(nodeProperties).map(([propertyId, nodeProperty]) => {
            const borderColor = `border-spdx-dark ${!nodeProperty.valid && 'border-red-400'}`;
            const datatype = nodeProperty.classProperty.datatype;
            if (datatype && datatype !== 'MediaType') {
              if (datatype === 'boolean') {
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
                    <PropBoolField nodeId={nodeId} propertyId={propertyId} />
                    <PropLabel nodeId={nodeId} propertyId={propertyId} />
                  </div>
                );
              } else {
                return (
                  <div
                    className={`flex-auto w-full ${borderColor}`}
                    key={propertyId}
                  >
                    <PropLabel nodeId={nodeId} propertyId={propertyId} />
                    <PropTextField nodeId={nodeId} propertyId={propertyId} />
                  </div>
                );
              }
            } else {
              return (
                <div
                  className={`flex-auto w-full ${borderColor}`}
                  key={propertyId}
                >
                  <PropLabel nodeId={nodeId} propertyId={propertyId} />
                  <PropSelectField nodeId={nodeId} propertyId={propertyId} />
                </div>
              );
            }
          })
        : [],
    [nodeId, nodeProperties]
  );

  return (
    <div className="my-4 mx-[15px] text-spdx-dark font-lato">
      <div className="grid gap-y-4">{fields}</div>
    </div>
  );
};

export default PropFields;
