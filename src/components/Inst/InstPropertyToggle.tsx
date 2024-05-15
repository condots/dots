import { advisoryText } from "@/scripts/inst-utils";
import {
  flowStore,
  getProperty,
  removeProperty,
  updateProperty,
  validProperty,
} from "@/store/flow";
import { byIri } from "@/store/onto";
import { Button } from "primereact/button";
import { ToggleButton } from "primereact/togglebutton";

interface InstPropertyToggleProps {
  nodeId: string;
  propertyId: string;
}

export default function InstPropertyToggle({
  nodeId,
  propertyId,
}: InstPropertyToggleProps) {
  const propertyData = getProperty(nodeId, propertyId)!;

  const setValue = (event) => {
    const value = event.target.value;
    updateProperty(nodeId, { ...propertyData, value });
  };

  return (
    <div className="flex-auto">
      <div className="flex gap-2 align-items-center">
        <label className="font-bold block">{propertyData.name}</label>
        <Button
          icon={
            <span className="material-icons-outlined flex justify-end">
              delete_forever
            </span>
          }
          severity="secondary"
          text
          onClick={() => removeProperty(nodeId, propertyId)}
        ></Button>
      </div>
      <ToggleButton
        id={propertyId}
        checked={propertyData.value as boolean}
        onChange={setValue}
        className="w-10rem"
      />
    </div>
  );
}
