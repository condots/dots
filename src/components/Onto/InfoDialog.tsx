import React from 'react';
import parse from 'html-react-parser';
import { advisoryText } from '@/scripts/app-utils';
import { appStore } from '@/store/app';
import { getItem } from '@/store/onto';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';

export function InfoDialog() {
  const showInfoDialog = appStore.use.showInfoDialog();
  const iri = appStore.use.selectedInfoIri();
  const cmp = getItem(iri);

  return (
    <Dialog
      maximized
      visible={showInfoDialog}
      onHide={() => appStore.setState({ showInfoDialog: false })}
      headerClassName="pb-0 bg-[#fcfcfc]"
      contentClassName="flex justify-center bg-[#fcfcfc]"
    >
      {cmp && (
        <Card
          title={cmp.name}
          className="shadow-none max-w-prose bg-[#fcfcfc]"
          pt={{
            title: {
              className: 'font-roboto text-[#00416b] text-3xl my-0',
            },
            content: {
              className: 'p-0 m-0',
            },
          }}
        >
          <Divider />
          <div className="flex flex-col gap-3 py-3">
            <div>
              <p className="p-card-title font-roboto text-[#00416b]">Summary</p>
              <div className="p-card-content font-lato text-[#404040] flex flex-col gap-3">
                {parse(advisoryText(cmp.summary))}
              </div>
            </div>
            <div>
              <p className="p-card-title font-roboto text-[#00416b]">
                Description
              </p>
              <div className="p-card-content font-lato text-[#404040] flex flex-col gap-3">
                {parse(advisoryText(cmp.description))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </Dialog>
  );
}
