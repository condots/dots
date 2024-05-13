import { create } from "zustand";
import { persist, devtools, combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/utils/createSelectors";

export const appStoreBase = create(
  immer(
    devtools(
      persist(
        combine(
          {
            selectedNode: "",
          },
          () => ({}),
        ),
        {
          name: "info",
        },
      ),
    ),
  ),
);

export const appStore = createSelectors(appStoreBase);
