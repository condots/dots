import { getNodeProperty, setNodeProperty } from "@/store/flow";
import { InputNumber } from "primereact/inputnumber";
import { PropLabel } from "@/components/Prop/PropLabel";

interface PropInput {
  nodeId: string;
  propertyId: string;
}

export default function PropInputNumber({ nodeId, propertyId }: PropInput) {
  const nodeProperty = getNodeProperty(nodeId, propertyId)!;

  const setValue = (event) => {
    const value = event.target.value;
    setNodeProperty(nodeId, propertyId, value);
  };

  const commonProps = {
    id: propertyId,
    invalid: !nodeProperty.valid,
    className: "border-2 w-full",
    onChange: setValue,
  };

  return (
    <div className="flex-auto">
      <PropLabel nodeId={nodeId} propertyId={propertyId} />
      <InputNumber {...commonProps} value={nodeProperty.value as number} />
    </div>
  );
}
