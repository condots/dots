import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, GitHubLogoIcon } from '@radix-ui/react-icons';

import { appStore } from '@/store/app';

const version = import.meta.env.PACKAGE_VERSION?.replace('1', 'I');

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
          "
        >
          <a
            className="text-sky-800 no-underline"
            href="https://github.com/condots/dots"
            target="_blank"
            rel="noreferrer"
          >
            <div className="mt-2 mb-1 mx-1 p-1 rounded-md hover:bg-gray-50">
              <Dialog.Title className="px-5">
                <img src="/dots-no-bg.svg" className="px-6" />
                {/* <span className="flex ml-2 w-full text-center justify-center text-sky-800 font-varela font-normal text-6xl leading-4">
                  Connecting the dots
                </span> */}
              </Dialog.Title>
              <Dialog.Description className="" asChild>
                <p className="flex w-full text-center justify-center font-varela font-bold text-5xl tracking-widest gap-3">
                  <span>V</span>
                  <span>{version}</span>
                  <GitHubLogoIcon className="w-auto h-[38px]" />
                </p>
              </Dialog.Description>
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
