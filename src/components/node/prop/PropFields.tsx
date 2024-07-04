import React, { useMemo } from 'react';

import { useNodeId } from 'reactflow';

import { useNode } from '@/store/flow';
import PropSelectField from '@/components/node/prop/PropSelectField';
import PropLabel from '@/components/node/prop/PropLabel';
import PropTextField from '@/components/node/prop/PropTextField';
import PropBoolField from '@/components/node/prop/PropBoolField';

const PropFields = () => {
  const nodeId = useNodeId()!;
  const node = useNode(nodeId);
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
                    <PropBoolField propertyId={propertyId} />
                    <PropLabel propertyId={propertyId} />
                  </div>
                );
              } else {
                return (
                  <div
                    className={`flex-auto w-full ${borderColor}`}
                    key={propertyId}
                  >
                    <PropLabel propertyId={propertyId} />
                    <PropTextField propertyId={propertyId} />
                  </div>
                );
              }
            } else {
              return (
                <div
                  className={`flex-auto w-full ${borderColor}`}
                  key={propertyId}
                >
                  <PropLabel propertyId={propertyId} />
                  <PropSelectField propertyId={propertyId} />
                </div>
              );
            }
          })
        : [],
    [nodeProperties]
  );

  return (
    <div className="my-3 px-2 text-spdx-dark font-lato">
      <div className="grid gap-y-2">{fields}</div>
    </div>
  );
};

export default PropFields;
