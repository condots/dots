import { advisoryText } from "@/scripts/inst-utils";
import {
  flowStore,
  getProperty,
  updateProperty,
  removeProperty,
  validProperty,
  datatypes,
} from "@/store/flow";
import { byIri } from "@/store/onto";
import { InputNumber } from "primereact/inputnumber";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface InstPropertyInputProps {
  nodeId: string;
  propertyId: string;
}

export default function InstPropertyInput({
  nodeId,
  propertyId,
}: InstPropertyInputProps) {
  const propertyData = getProperty(nodeId, propertyId)!;
  const isValid = validProperty(nodeId!, propertyId);
  const dt = datatypes.get(propertyData.datatype);

  const setValue = (value) => {
    updateProperty(nodeId, { ...propertyData, value });
  };

  const commonProps = {
    id: propertyId,
    invalid: !isValid,
    className: "border-2 w-full",
  };

  return (
    <div className="flex-auto">
      <div className="flex gap-2 align-items-center">
        <label className="font-bold block">
          {propertyData.name} ({propertyData.datatype})
        </label>
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
      {dt?.kind === "number" ? (
        <InputNumber
          {...commonProps}
          value={propertyData.value as number}
          onChange={(e) => setValue(e.value)}
        />
      ) : dt?.mask ? (
        <InputMask
          {...commonProps}
          value={propertyData.value as string}
          mask={dt.mask}
          slotChar={dt.slotChar}
        />
      ) : (
        <InputText
          {...commonProps}
          value={propertyData.value as string}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </div>
  );
}
