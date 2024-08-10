import * as Dialog from '@radix-ui/react-dialog';

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
          <div className="relative">
            <div className="loader absolute loader-size">
              <img
                src={S}
                className="absolute"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div
              className="loader absolute"
              style={{ width: '201px', paddingRight: '3px' }}
            >
              <img src={O} />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Loader;
