import { getNodeProperty, setNodeProperty } from "@/store/flow";
import { InputNumber } from "primereact/inputnumber";
import { PropLabel } from "@/components/Prop/PropLabel";
import { inputProperties } from "@/scripts/app-utils";

interface PropInput {
  nodeId: string;
  propertyId: string;
}

export default function PropInputNumber({ nodeId, propertyId }: PropInput) {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;
  const inputProperty = inputProperties.get(
    nodeProperty.classProperty.datatype
  )!;

  const setValue = (event) => {
    const value = event.target.value;
    setNodeProperty(nodeId, propertyId, value);
  };

  return (
    <div className="flex-auto">
      <PropLabel nodeId={nodeId} propertyId={propertyId} />
      <InputNumber
        id={propertyId}
        invalid={!nodeProperty.valid}
        className="border-2 w-full"
        onValueChange={(e) => setValue(e)}
        value={nodeProperty.value as number}
        min={inputProperty.min}
      />
      <small className="font-lato">{inputProperty.helpText ?? ""}</small>
    </div>
  );
}
