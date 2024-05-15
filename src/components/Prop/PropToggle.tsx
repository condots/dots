import { getProperty, updateProperty } from "@/store/flow";
import { ToggleButton } from "primereact/togglebutton";
import { PropLabel } from "@/components/Prop/PropLabel";

interface PropToggle {
  nodeId: string;
  propertyId: string;
}

export default function InstPropertyToggle({ nodeId, propertyId }: PropToggle) {
  const propertyData = getProperty(nodeId, propertyId)!;

  const setValue = (event) => {
    const value = event.target.value;
    updateProperty(nodeId, { ...propertyData, value });
  };

  return (
    <div className="flex-auto">
      <PropLabel nodeId={nodeId} propertyId={propertyId} />
      <ToggleButton
        id={propertyId}
        checked={propertyData.value as boolean}
        onChange={setValue}
        className="w-full"
      />
    </div>
  );
}
