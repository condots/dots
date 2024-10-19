import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useCallback, useMemo } from 'react';

import { appStore } from '@/store/app';
import { deselectAll } from '@/store/flow';

const AlertDialog = () => {
  const alertMessage = appStore.use.alertMessage();

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      deselectAll();
      appStore.setState(state => {
        state.alertMessage = undefined;
        return state;
      });
    }
  }, []);

  const dialogContent = useMemo(
    () => (
      <Dialog.Content
        className="
      data-[state=open]:animate-contentShow 
      fixed 
      top-[50%] 
      left-[50%] 
      max-h-[85vh] 
      max-w-[90vw] 
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
        <Dialog.Title>{alertMessage?.title}</Dialog.Title>
        <Dialog.Description>
          {alertMessage?.description || ''}
        </Dialog.Description>
        <Dialog.Close asChild>
          <button className="absolute top-4 right-4 items-center justify-center rounded text-spdx-dark hover:bg-spdx-dark/5">
            <Cross2Icon />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    ),
    [alertMessage]
  );

  return (
    <Dialog.Root open={!!alertMessage} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA7 data-[state=open]:animate-overlayShow fixed inset-0 DialogOverlay" />
        {dialogContent}
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AlertDialog;
