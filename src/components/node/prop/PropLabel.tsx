import React, { useState, useCallback, useMemo } from 'react';
import { useNodeId } from '@xyflow/react';
import { Property } from '@/types';
import { appStore } from '@/store/app';
import { useNodeProperty, deleteNodeProperty } from '@/store/flow';
import { getItem } from '@/store/onto';

const PropLabel = React.memo(({ propertyId }: { propertyId: string }) => {
  const nodeId = useNodeId()!;
  const propertyData = useNodeProperty(nodeId, propertyId)!;
  const property = useMemo(
    () => getItem(propertyData.classProperty.path) as Property,
    [propertyData.classProperty.path]
  );
  const [infoHovered, setInfoHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const buttonClasses = 'flex outline-none rounded-full mt-0.5';

  const handleDeleteClick = useCallback(() => {
    deleteNodeProperty(nodeId, propertyId);
  }, [nodeId, propertyId]);

  const handleInfoClick = useCallback(() => {
    appStore.setState({
      selectedInfoIri: property.iri,
      showInfoDialog: true,
    });
  }, [property.iri]);

  const deleteButton = (
    <button
      className={buttonClasses}
      onClick={handleDeleteClick}
      onMouseEnter={() => setDeleteHovered(true)}
      onMouseLeave={() => setDeleteHovered(false)}
    >
      <span
        className="material-symbols-outlined text-base"
        style={{
          fontVariationSettings: `"FILL" ${deleteHovered ? 1 : 0}`,
        }}
      >
        delete
      </span>
    </button>
  );

  const infoButton = (
    <button
      className={buttonClasses}
      onClick={handleInfoClick}
      onMouseEnter={() => setInfoHovered(true)}
      onMouseLeave={() => setInfoHovered(false)}
    >
      <span
        className="material-symbols-outlined text-sm"
        style={{
          fontVariationSettings: `"FILL" ${infoHovered ? 1 : 0}`,
        }}
      >
        help
      </span>
    </button>
  );

  return (
    <div className="flex w-full items-center justify-between px-[5px] my-0.5">
      <div className="flex items-center gap-x-0.5">
        <label
          className="text-sm prop-label font-semibold"
          data-pr-tooltip={property.summary}
        >
          {property.name}
          {propertyData.required && '*'}
        </label>
        {infoButton}
      </div>
      {!propertyData.required && (
        <div className="flex items-center gap-x-0.5">{deleteButton}</div>
      )}
    </div>
  );
});

PropLabel.displayName = 'PropLabel';

export default PropLabel;
