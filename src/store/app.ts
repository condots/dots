import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/scripts/createSelectors";

type AppState = {
  showClassesMenu: boolean;
  showPropDialog: boolean;
  showInfoDialog: boolean;
  selectedNodeId: string | null;
  selectedInfoIri: string | null;
  reset: () => void;
};

const initialState = {
  showClassesMenu: true,
  showPropDialog: false,
  showInfoDialog: false,
  selectedNodeId: null,
  selectedInfoIri: null,
};

const appStoreBase = create<AppState>()(
  immer(
    devtools(
      // persist(
      (set) => ({
        ...initialState,
        reset: () => {
          set(initialState);
        },
      }),
      //   {
      //     name: "app",
      //   },
      // ),
    ),
  ),
);

export const appStore = createSelectors(appStoreBase);
