import { create } from "zustand";
import { persist, devtools, combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/scripts/createSelectors";

const initialState = {
  selectedNodeId: <string | null>null,
};

export const appStoreBase = create(
  immer(
    devtools(
      persist(
        combine({ ...initialState }, (set) => ({
          reset: () => {
            set(initialState);
          },
        })),
        {
          name: "app",
        },
      ),
    ),
  ),
);

export const appStore = createSelectors(appStoreBase);
