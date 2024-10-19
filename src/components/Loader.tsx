import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { appStore } from '@/store/app';

import S from '@/assets/s-only.svg';
import O from '@/assets/grad-spin.svg';

const Loader = () => {
  const showLoader = appStore.use.showLoader();

  return (
    <Dialog.Root open={showLoader}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 DialogOverlay" />
        <Dialog.Content className="loader">
          <VisuallyHidden>
            <Dialog.Title>Loading...</Dialog.Title>
            <Dialog.Description />
          </VisuallyHidden>
          <div className="relative">
            <div className="loader absolute grad-spin">
              <img src={O} />
            </div>
            <div className="loader absolute loader-size">
              <img src={S} className="absolute loader-size" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Loader;
