import React, { useMemo, useCallback, ChangeEvent, MouseEvent } from 'react';
import { useNodeId } from '@xyflow/react';
import { inputProperties } from '@/scripts/app-utils';
import { useNodeProperty, setNodeProperty } from '@/store/flow';

const PropTextField = React.memo(({ propertyId }: { propertyId: string }) => {
  const nodeId = useNodeId()!;
  const nodeProperty = useNodeProperty(nodeId, propertyId)!;
  const p = inputProperties.get(nodeProperty.classProperty.datatype)!;

  const handleOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (nodeProperty.classProperty.datatype === 'dateTimeStamp' && !!v) {
        if (v.length === 16) {
          v = `${v}:00`;
        }
        v = `${v}Z`;
      }
      setNodeProperty(nodeId, propertyId, v);
    },
    [nodeId, propertyId, nodeProperty.classProperty.datatype]
  );

  const value = useMemo(() => {
    let v = nodeProperty.value;
    if (
      nodeProperty.classProperty.datatype === 'dateTimeStamp' &&
      nodeProperty.valid
    ) {
      v = (v as string).slice(0, -1);
    }
    return v ?? '';
  }, [
    nodeProperty.value,
    nodeProperty.valid,
    nodeProperty.classProperty.datatype,
  ]);

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
      value={value as string}
      className={`
        h-7 pl-1 pr-0.5 rounded-sm border-2 w-full outline-none bg-white border-inherit
        text-sm placeholder:italic placeholder:text-slate-400 overflow-ellipsis
        ${!nodeProperty.valid && 'border-red-400'}
      `}
      onChange={handleOnChange}
      onClick={(e: MouseEvent<HTMLInputElement>) =>
        p.inputType === 'datetime-local' &&
        (e.target as HTMLInputElement).showPicker()
      }
    />
  );
});

PropTextField.displayName = 'PropTextField';

export default PropTextField;
