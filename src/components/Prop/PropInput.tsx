import {
  getProperty,
  updateProperty,
  validProperty,
  datatypes,
} from "@/store/flow";
import { InputNumber } from "primereact/inputnumber";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { PropLabel } from "@/components/Prop/PropLabel";

interface PropInput {
  nodeId: string;
  propertyId: string;
}

export default function InstPropertyInput({ nodeId, propertyId }: PropInput) {
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
      <PropLabel nodeId={nodeId} propertyId={propertyId} />
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
