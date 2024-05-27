import { appStore } from "@/store/app";
import { getNodeProperty, deleteNodeProperty } from "@/store/flow";
import { getItem } from "@/store/onto";
import types from "@/types";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";

interface PropLabel {
  nodeId: string;
  propertyId: string;
}

export function PropLabel({ nodeId, propertyId }: PropLabel) {
  const propertyData = getNodeProperty(nodeId, propertyId)!;
  const property = getItem(propertyData.classProperty.path) as types.Property;

  return (
    <div className="flex items-center justify-between my-1">
      <Tooltip target=".prop-label" showDelay={1000} position="top" />
      <label
        className="font-bold prop-label"
        data-pr-tooltip={property.summary}
      >
        {property.name} ({property.datatype})
      </label>
      <div className="flex gap-2">
        <Button
          icon="pi pi-question-circle"
          severity="secondary"
          unstyled
          className="p-button-icon-only p-button-rounded flex justify-center items-center text-primary hover:text-gray-600"
          onClick={() =>
            appStore.setState({
              selectedInfoIri: property.iri,
              showInfoDialog: true,
            })
          }
        ></Button>
        <Button
          icon="pi pi-minus-circle"
          severity="secondary"
          unstyled
          className="p-button-icon-only p-button-rounded flex justify-center items-center text-primary hover:text-gray-600"
          onClick={() => deleteNodeProperty(nodeId, propertyId)}
        ></Button>
      </div>
    </div>
  );
}
