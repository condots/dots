import { getNodeProperty, setNodeProperty } from "@/store/flow";
import { Dropdown } from "primereact/dropdown";
import { PropLabel } from "@/components/Prop/PropLabel";

interface PropToggle {
  nodeId: string;
  propertyId: string;
}

export default function InstPropertyToggle({ nodeId, propertyId }: PropToggle) {
  const propertyData = getNodeProperty(nodeId, propertyId)!;
  const propertyData = getPropertyOptions(nodeId, propertyId)!;

  const setValue = (event) => {
    const value = event.target.value;
    setNodeProperty(nodeId, { ...propertyData, value });
  };

  return (
    <div className="flex-auto">
      <PropLabel nodeId={nodeId} propertyId={propertyId} />
      <Dropdown
        id={propertyId}
        invalid={!propertyData.value}
        value={propertyData.value}
        onChange={setValue}
        options={options}
        optionLabel="name"
        placeholder="Select..."
        className="w-full"
      />
    </div>
  );
}
