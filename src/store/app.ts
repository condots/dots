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

const storage: PersistStorage<AppState> = {
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
            storage,
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
