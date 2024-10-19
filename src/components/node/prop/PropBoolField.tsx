import React, { useCallback, useMemo } from 'react';
import { useNodeId } from '@xyflow/react';
import { useNodeProperty, setNodeProperty } from '@/store/flow';

const PropBoolField = React.memo(({ propertyId }: { propertyId: string }) => {
  const nodeId = useNodeId()!;
  const nodeProperty = useNodeProperty(nodeId, propertyId)!;
  const checked = nodeProperty.value;

  const checkboxIcon = useMemo(() => {
    if (checked === undefined) return 'indeterminate_check_box';
    return checked ? 'check_box' : 'check_box_outline_blank';
  }, [checked]);

  const iconColor = useMemo(
    () => (!nodeProperty.valid ? 'text-red-400' : ''),
    [nodeProperty.valid]
  );

  const handleClick = useCallback(() => {
    setNodeProperty(nodeId, propertyId, !checked);
  }, [nodeId, propertyId, checked]);

  return (
    <button
      className="flex items-center justify-center outline-none pt-2"
      onClick={handleClick}
    >
      <span className={`material-symbols-outlined text-2xl ${iconColor}`}>
        {checkboxIcon}
      </span>
    </button>
  );
});

PropBoolField.displayName = 'PropBoolField';

export default PropBoolField;
