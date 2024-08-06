import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

import { appStore } from '@/store/app';
import dotsNoBg from '@/assets/dots-no-bg.svg';

const AboutDialog = () => {
  const showAboutDialog = appStore.use.showAboutDialog();

  const handleOpenChange = (open: boolean) => {
    appStore.setState(state => {
      state.showAboutDialog = open;
    });
  };

  return (
    <Dialog.Root open={showAboutDialog} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA7 data-[state=open]:animate-overlayShow fixed inset-0 DialogOverlay" />
        <Dialog.Content
          className="
          data-[state=open]:animate-contentShow 
          fixed 
          top-[50%] 
          left-[50%] 
          max-w-[750px] 
          translate-x-[-50%] 
          translate-y-[-50%] 
          rounded-lg 
          bg-[#fcfcfc] p-[25px] 
          shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] 
          focus:outline-none
          "
        >
          <a
            className="text-[#6D5FDB] no-underline"
            href="https://github.com/condots/dots"
            target="_blank"
            rel="noreferrer"
          >
            <div className="rounded-lg hover:bg-gray-50">
              <Dialog.Title className="px-6 py-5">
                <img src={dotsNoBg} className="" />
              </Dialog.Title>
            </div>
          </a>
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

export default AboutDialog;
