import React from 'react';

import { useNodeId } from 'reactflow';

import { useNodeProperty, setNodeProperty } from '@/store/flow';

const PropBoolField = ({ propertyId }: { propertyId: string }) => {
  const nodeId = useNodeId()!;
  const nodeProperty = useNodeProperty(nodeId, propertyId)!;
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
        className="flex items-center justify-center outline-none pt-2"
        onClick={() => setNodeProperty(nodeId, propertyId, !checked)}
      >
        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>
          {checkboxIcon}
        </span>
      </button>
    </>
  );
};

export default PropBoolField;
