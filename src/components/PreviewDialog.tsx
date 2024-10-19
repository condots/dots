import { useMemo, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { appStore } from '@/store/app';
import JsonHighlight from '@/components/JsonHighlight';

const PreviewDialog = () => {
  const previewData = appStore.use.previewData();

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      appStore.setState(state => {
        state.previewData = undefined;
        return state;
      });
    }
  }, []);

  const description = useMemo(
    () => previewData?.description || '',
    [previewData]
  );

  return (
    <Dialog.Root open={!!previewData} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA7 fixed inset-0 data-[state=open]:animate-overlayShow DialogOverlay" />
        <Dialog.Content
          className="
            fixed top-[50%] left-[50%] max-h-[85vh] max-w-[90vw] 
            translate-x-[-50%] translate-y-[-50%] rounded-lg bg-[#fcfcfc] 
            p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] 
            focus:outline-none overflow-auto pt-5 pb-3 
            data-[state=open]:animate-contentShow"
        >
          <VisuallyHidden>
            <Dialog.Title>Preview dialog</Dialog.Title>
            <Dialog.Description />
          </VisuallyHidden>
          <Dialog.Description asChild>
            <JsonHighlight value={description} />
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 items-center justify-center rounded text-spdx-dark hover:bg-spdx-dark/5">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PreviewDialog;
