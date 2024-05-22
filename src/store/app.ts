import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/scripts/createSelectors";

type AppState = {
  selectedNodeId: string | null;
  selectedInfoIri: string | null;
  reset: () => void;
};

const initialState = {
  selectedNodeId: null,
  selectedInfoIri: null,
};

const appStoreBase = create<AppState>()(
  immer(
    devtools(
      persist(
        (set) => ({
          ...initialState,
          reset: () => {
            set(initialState);
          },
        }),
        {
          name: "app",
        },
      ),
    ),
  ),
);

export const appStore = createSelectors(appStoreBase);
