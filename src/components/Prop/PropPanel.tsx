import React from 'react';

import { Sidebar } from 'primereact/sidebar';

import { appStore } from '@/store/app';
import { inputProperties } from '@/scripts/app-utils';
import { getNode } from '@/store/flow';
// import PropMenu from '@/components/Prop/PropMenu';
import PropInputString from '@/components/Prop/PropInputString';
import PropInputNumber from '@/components/Prop/PropInputNumber';
import PropInputBoolean from '@/components/Prop/PropInputBoolean';
import PropInputOptions from '@/components/Prop/PropInputOptions';

export default function PropPanel() {
  const showPropDialog = appStore.use.showPropDialog();
  const nodeId = appStore.use.selectedNodeId();
  const node = getNode(nodeId);
  const cls = node?.data.cls;
  const nodeProperties = node?.data.nodeProps;

  const propertyFields = nodeProperties
    ? Object.entries(nodeProperties).map(([propertyId, nodeProperty]) => {
        if (
          nodeProperty.classProperty.datatype &&
          inputProperties.has(nodeProperty.classProperty.datatype)
        ) {
          const inputType = inputProperties.get(
            nodeProperty.classProperty.datatype
          )!.inputType;
          if (inputType === 'string') {
            return (
              <PropInputString
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          } else if (inputType === 'number') {
            return (
              <PropInputNumber
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          } else if (inputType === 'boolean') {
            return (
              <PropInputBoolean
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          }
        } else if (nodeProperty.classProperty.options) {
          return (
            <PropInputOptions
              key={propertyId}
              nodeId={nodeId!}
              propertyId={propertyId}
            />
          );
        }
      })
    : [];

  if (!cls) return;
  return (
    <div>
      <Sidebar
        visible={showPropDialog}
        position="right"
        className="w-full md:w-30rem"
        header={
          <span className="font-lato font-semibold text-lg truncate">
            {cls?.name}
          </span>
        }
        icons={
          <button
            className="flex p-1 rounded text-spdx-dark hover:bg-spdx-dark/15"
            onClick={() =>
              appStore.setState({
                selectedInfoIri: cls?.iri,
                showInfoDialog: true,
              })
            }
          >
            <span className="material-icons-outlined text-base">
              question_mark
            </span>
          </button>
        }
        closeIcon={
          <span className="flex p-1 rounded text-spdx-dark hover:bg-spdx-dark/15 pi pi-times" />
        }
        onHide={() => appStore.setState({ showPropDialog: false })}
      >
        {/* <PropMenu /> */}
        <div className="card my-3 mx-2">
          <div className="grid grid-cols-4 gap-4">{propertyFields}</div>
        </div>
      </Sidebar>
    </div>
  );
}
