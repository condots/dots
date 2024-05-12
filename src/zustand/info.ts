import create from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const infoStore = create(
  persist(
    devtools(
      immer((set) => ({
        visible: false,
        name: "",
        summary: "",
      })),
    ),
    {
      name: "info", // Unique name for persistence
    },
  ),
);
