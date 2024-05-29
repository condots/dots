import { appStore } from "@/store/app";
import { getNodeProperty, deleteNodeProperty } from "@/store/flow";
import { getItem } from "@/store/onto";
import types from "@/types";
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
        {property.name}
      </label>
      <div className="flex">
        <button
          className="flex p-1 rounded text-spdx-dark hover:bg-spdx-dark/15"
          onClick={() =>
            appStore.setState({
              selectedInfoIri: property.iri,
              showInfoDialog: true,
            })
          }
        >
          <span className="material-icons-outlined text-base">
            help_outline
          </span>
        </button>
        <button
          className="flex p-1 rounded text-spdx-dark hover:bg-spdx-dark/15"
          onClick={() => deleteNodeProperty(nodeId, propertyId)}
        >
          <span className="material-icons-outlined text-base">
            remove_circle_outline
          </span>
        </button>
      </div>
    </div>
  );
}
