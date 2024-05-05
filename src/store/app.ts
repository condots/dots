import { createStore } from "zustand-x";

export const appStore = createStore("app")({
  elementDialog: {
    nodeId: <string | null>null,
  },
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({}))
  .extendActions((set, get, api) => ({}));
