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

import { DraggedCls, PropertyOption } from '@/types';
import { getMediaTypes } from '@/scripts/app-utils';

type AppState = {
  showClassesMenu: boolean;
  showInfoDialog: boolean;
  selectedNodeId: string | undefined;
  selectedInfoIri: string | undefined;
  draggedCls: DraggedCls | undefined;
  mouseOverNodeId: string | undefined;
  mediaTypes: PropertyOption[] | undefined;
  reset: () => void;
};

const initialState = {
  showClassesMenu: false,
  showInfoDialog: false,
  selectedNodeId: undefined,
  selectedInfoIri: undefined,
  draggedCls: undefined,
  mouseOverNodeId: undefined,
  mediaTypes: undefined,
};

const storage: PersistStorage<{
  [k: string]:
    | string
    | boolean
    | DraggedCls
    | PropertyOption[]
    | (() => void)
    | undefined;
}> = {
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
            partialize: state =>
              Object.fromEntries(
                Object.entries(state).filter(
                  ([key]) =>
                    ![
                      'showClassesMenu',
                      'showInfoDialog',
                      'selectedInfoIri',
                      'draggedCls',
                      'mouseOverNodeId',
                    ].includes(key)
                )
              ),
          }
        )
      )
    )
  )
);

export const appStore = createSelectors(appStoreBase);

export async function updateMediaTypes() {
  // if (appStore.getState().mediaTypes) return;
  const mediaTypes = await getMediaTypes();
  appStore.setState({ mediaTypes });
  console.log('updated MediaTypes');
}
