import { appStore } from "@/store/app";
import { getProperty, removeProperty } from "@/store/flow";
import { byIRI } from "@/store/onto";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";

interface PropLabel {
  nodeId: string;
  propertyId: string;
}

export function PropLabel({ nodeId, propertyId }: PropLabel) {
  const propertyData = getProperty(nodeId, propertyId)!;
  const propertyComponent = byIRI(propertyData.iri);

  return (
    <div className="flex items-center justify-between my-1">
      <Tooltip target=".prop-label" showDelay={1000} position="top" />
      <label
        className="font-bold prop-label"
        data-pr-tooltip={propertyComponent.summary}
      >
        {propertyData.name} ({propertyData.datatype})
      </label>
      <div className="flex gap-1">
        <Button
          icon="pi pi-minus-circle"
          severity="secondary"
          unstyled
          className="p-button-icon-only p-button-rounded flex justify-center items-center text-primary hover:text-gray-600"
          onClick={() => removeProperty(nodeId, propertyId)}
        ></Button>
        <Button
          icon="pi pi-question-circle"
          severity="secondary"
          unstyled
          className="p-button-icon-only p-button-rounded flex justify-center items-center text-primary hover:text-gray-600"
          onClick={() =>
            appStore.setState({ selectedInfoIri: propertyData.iri })
          }
        ></Button>
      </div>
    </div>
  );
}
