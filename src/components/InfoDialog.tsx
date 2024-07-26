import { useEffect } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

import { advisoryText } from '@/scripts/app-utils';
import { appStore } from '@/store/app';
import { getItem } from '@/store/onto';
import { Class } from '@/types';

const InfoDialog = () => {
  const showInfoDialog = appStore.use.showInfoDialog();
  const iri = appStore.use.selectedInfoIri();
  const item = getItem(iri);

  useEffect(() => {
    if (showInfoDialog && !item) {
      appStore.setState(state => {
        state.showInfoDialog = false;
      });
    }
  }, [showInfoDialog, item]);

  const handleOpenChange = (open: boolean) => {
    appStore.setState(state => {
      state.showInfoDialog = open;
    });
  };

  return item ? (
    <Dialog.Root open={showInfoDialog} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA7 data-[state=open]:animate-overlayShow fixed inset-0 DialogOverlay" />
        <Dialog.Content
          className="
          data-[state=open]:animate-contentShow 
          fixed 
          top-[50%] 
          left-[50%] 
          max-h-[85vh] 
          w-[90vw] 
          max-w-[750px] 
          translate-x-[-50%] 
          translate-y-[-50%] 
          rounded-lg 
          bg-[#fcfcfc] p-[25px] 
          shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] 
          focus:outline-none
          prose
          overflow-auto
          pt-5 pb-3"
        >
          <Dialog.Title className="font-roboto text-spdx-dark text-3xl">
            <span>{item.name}</span>
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="flex flex-col">
              <div>
                <div className="font-bold font-roboto text-spdx-dark text-2xl">
                  Summary
                </div>
                <div className="font-lato">{advisoryText(item.summary)}</div>
              </div>
              <div>
                <div className="font-bold font-roboto text-spdx-dark text-2xl">
                  Description
                </div>
                <div className="font-lato">
                  {advisoryText(item.description)}
                </div>
              </div>
              <div>
                <div className="font-bold font-roboto text-spdx-dark prose-2xl">
                  Metadata
                </div>
                <div className="font-mono text-spdx-dark">
                  <p className="text-xs border my-4 px-1 py-0.5 flex w-fit">
                    {item.iri}
                  </p>
                </div>
                <div>
                  <table className="table-auto w-fit">
                    <tbody className="font-lato bg-[#f3f6f6]">
                      {(item as Class).abstract !== undefined && (
                        <tr className="font-lato bg-[#f3f6f6]">
                          <td className="px-3 border">Instantiability</td>
                          <td className="px-3 border">
                            {(item as Class).abstract ? 'Abstract' : 'Concrete'}
                          </td>
                        </tr>
                      )}
                      {(item as Class).subClassOf && (
                        <tr className="font-lato bg-[#f3f6f6]">
                          <td className="px-3 border">SubclassOf</td>
                          <td className="px-3 border">
                            <button
                              className="text-spdx-dark underline outline-none"
                              onClick={() =>
                                appStore.setState(state => {
                                  state.selectedInfoIri = (
                                    item as Class
                                  ).subClassOf;
                                  state.showInfoDialog = true;
                                })
                              }
                            >
                              {(item as Class).subClassOf!.split('/').pop()}
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 items-center justify-center rounded text-spdx-dark hover:bg-spdx-dark/5">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ) : null;
};

export default InfoDialog;
