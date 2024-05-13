import { createStore } from "zustand-x";

export const infoStore = createStore("info")({
  visible: false,
  name: "",
  summary: "",
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({}))
  .extendActions((set, get, api) => ({}));
