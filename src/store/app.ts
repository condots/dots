import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import createSelectors from '@/scripts/createSelectors';

import { PropertyOption } from '@/types';
import { getMediaTypes } from '@/scripts/app-utils';

type AppState = {
  showClassesMenu: boolean;
  showPropDialog: boolean;
  showInfoDialog: boolean;
  selectedNodeId: string | undefined;
  selectedInfoIri: string | undefined;
  mediaTypes: PropertyOption[] | undefined;
  reset: () => void;
};

const initialState = {
  showClassesMenu: true,
  showPropDialog: false,
  showInfoDialog: false,
  selectedNodeId: undefined,
  selectedInfoIri: undefined,
  mediaTypes: undefined,
};

const appStoreBase = create<AppState>()(
  subscribeWithSelector(
    immer(
      devtools(
        persist(
          set => ({
            ...initialState,
            reset: () => {
              set(initialState);
            },
          }),
          {
            name: 'app',
          }
        )
      )
    )
  )
);

export const appStore = createSelectors(appStoreBase);

export async function updateMediaTypes() {
  const mediaTypes = await getMediaTypes();
  appStore.setState({ mediaTypes });
}
