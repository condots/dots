import * as Dialog from '@radix-ui/react-dialog';

import { appStore } from '@/store/app';

import O from '@/assets/o-only.svg';
import S from '@/assets/s-only.svg';

const Loader = () => {
  const showLoader = appStore.use.showLoader();

  return (
    <Dialog.Root open={showLoader}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 DialogOverlay" />
        <Dialog.Content className="loader">
          <div className="relative">
            <div className="loader absolute loader-size">
              <img src={O} className="absolute loader-size animate-spin" />
              <img src={S} className="absolute loader-size" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Loader;
