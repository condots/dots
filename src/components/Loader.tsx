import * as Dialog from '@radix-ui/react-dialog';

import { appStore } from '@/store/app';

import circleGrad from '@/assets/circle-grad.svg';
import sGrad from '@/assets/s-grad.svg';

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
                src={circleGrad}
                className="absolute loader-size animate-spin"
              />
              <img src={sGrad} className="absolute loader-size" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Loader;
