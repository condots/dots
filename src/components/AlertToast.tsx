import * as Toast from '@radix-ui/react-toast';

import { appStore } from '@/store/app';

const AlertToast = () => {
  const alertToast = appStore.use.alertToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      console.log('alertToast:', alertToast);
      console.log('handleOpenChange:', open);

      appStore.setState(state => {
        state.alertToast = undefined;
      });
    }
  };

  return (
    <Toast.Provider>
      <Toast.Root
        className="text-spdx-dark bg-white rounded-sm shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] py-1 px-2 grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
        open={!!alertToast}
        onOpenChange={handleOpenChange}
        duration={1200}
      >
        <Toast.Description asChild>
          <span className="font-medium">{alertToast}</span>
        </Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="fixed top-5 left-[50%] translate-x-[-50%] flex flex-col p-1 max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
    </Toast.Provider>
  );
};

export default AlertToast;
