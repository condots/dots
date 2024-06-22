import React, { memo, useState } from 'react';

import { getNodeProperty, setNodeProperty } from '@/store/flow';

const InstPropBoolField = ({
  nodeId,
  propertyId,
}: {
  nodeId: string;
  propertyId: string;
}) => {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;
  const checked = nodeProperty.value;

  const checkboxIcon =
    checked === undefined
      ? 'indeterminate_check_box'
      : checked
        ? 'check_box'
        : 'check_box_outline_blank';

  const iconColor = `${!nodeProperty.valid && 'text-red-400'}`;

  return (
    <>
      <button
        className="flex items-center justify-center outline-none"
        onClick={() => setNodeProperty(nodeId, propertyId, !checked)}
      >
        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>
          {checkboxIcon}
        </span>
      </button>
    </>
  );
};

export default InstPropBoolField;
