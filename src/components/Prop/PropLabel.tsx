import { getProperty, removeProperty } from "@/store/flow";
import { Button } from "primereact/button";

interface PropLabel {
  nodeId: string;
  propertyId: string;
}

export function PropLabel({ nodeId, propertyId }: PropLabel) {
  const propertyData = getProperty(nodeId, propertyId)!;

  return (
    <div className="flex items-center justify-between my-1">
      <label className="font-bold">
        {propertyData.name} ({propertyData.datatype})
      </label>
      <Button
        icon="pi pi-minus-circle"
        severity="secondary"
        unstyled
        className="p-button-icon-only p-button-rounded flex justify-center items-center text-primary hover:text-gray-600"
        onClick={() => removeProperty(nodeId, propertyId)}
      ></Button>
    </div>
  );
}
