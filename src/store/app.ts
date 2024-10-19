import { create } from 'zustand';
import {
  persist,
  PersistStorage,
  devtools,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import superjson from 'superjson';
import createSelectors from '@/store/createSelectors';

import {
  AlertMessage,
  DraggedClassData,
  DraggedPropData,
  PreviewData,
  PropertyOption,
} from '@/types';
import { getMediaTypes } from '@/scripts/app-utils';

export type AppState = {
  showLoader: boolean;
  showClassesMenu: boolean;
  showInfoDialog: boolean;
  showHelpDialog: boolean;
  showAboutDialog: boolean;
  alertToast: string | undefined;
  alertMessage: AlertMessage | undefined;
  previewData: PreviewData | undefined;
  selectedInfoIri: string | undefined;
  draggedClassData: DraggedClassData | undefined;
  draggedPropData: DraggedPropData | undefined;
  mediaTypes: PropertyOption[] | undefined;
  reset: () => void;
};

const initialState = {
  showLoader: false,
  showClassesMenu: false,
  showInfoDialog: false,
  showHelpDialog: false,
  showAboutDialog: false,
  alertToast: undefined,
  alertMessage: undefined,
  previewData: undefined,
  selectedInfoIri: undefined,
  draggedClassData: undefined,
  draggedPropData: undefined,
  mediaTypes: undefined,
};

const storage: PersistStorage<{ [k: string]: unknown }> = {
  getItem: name => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return superjson.parse(str);
  },
  setItem: (name, value) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: name => localStorage.removeItem(name),
};

const myPersist: typeof persist = !import.meta.env.PROD
  ? persist
  : (fn: any) => fn;

const appStoreBase = create<AppState>()(
  immer(
    subscribeWithSelector(
      devtools(
        myPersist(
          set => ({
            ...initialState,
            reset: () => {
              set(initialState);
            },
          }),
          {
            name: 'app',
            storage,
            partialize: state =>
              Object.fromEntries(
                Object.entries(state as { [key: string]: unknown }).filter(
                  ([key]) =>
                    ![
                      'showLoader',
                      'showClassesMenu',
                      'showInfoDialog',
                      'showHelpDialog',
                      'showAboutDialog',
                      'alertToast',
                      'alertMessage',
                      'previewData',
                      'selectedInfoIri',
                      'draggedClassData',
                      'draggedPropData',
                    ].includes(key)
                )
              ),
          }
        ),
        { enabled: !import.meta.env.PROD }
      )
    )
  )
);

export const appStore = createSelectors(appStoreBase);

export async function updateMediaTypes() {
  const mediaTypes = await getMediaTypes();
  appStore.setState({ mediaTypes });
  if (!import.meta.env.PROD) {
    console.log(`loaded MediaTypes`);
  }
}
