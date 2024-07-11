import React, { useEffect } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

import { appStore } from '@/store/app';

const HelpDialog = () => {
  const showHelpDialog = appStore.use.showHelpDialog();

  const handleOpenChange = (open: boolean) => {
    appStore.setState(state => {
      state.showHelpDialog = open;
    });
  };

  return (
    <Dialog.Root open={showHelpDialog} onOpenChange={handleOpenChange}>
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
          rounded-md 
          bg-[#fcfcfc] p-[25px] 
          shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] 
          focus:outline-none
          prose
          overflow-auto
          pt-5 pb-3"
        >
          <Dialog.Title className="font-roboto text-spdx-dark text-3xl"></Dialog.Title>
          <Dialog.Description></Dialog.Description>
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

export default HelpDialog;
