import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';

import { appStore } from '@/store/app';

const AlertDialog = () => {
  const alertMessage = appStore.use.alertMessage();

  return (
    <RadixAlertDialog.Root open={alertMessage !== undefined}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <RadixAlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <RadixAlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
            {alertMessage?.title}
          </RadixAlertDialog.Title>
          <RadixAlertDialog.Description asChild>
            <p className="text-mauve11 mt-4 mb-5 text-[15px] prose">
              {alertMessage?.description}
            </p>
          </RadixAlertDialog.Description>
          <div className="flex justify-end gap-[25px]">
            <RadixAlertDialog.Cancel asChild>
              <button
                className="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]"
                onClick={() =>
                  appStore.setState(state => (state.alertMessage = undefined))
                }
              >
                Close
              </button>
            </RadixAlertDialog.Cancel>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
};

export default AlertDialog;
