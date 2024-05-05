import { createStore } from "zustand-x";

interface State {}

const initialState = <State>{};

export const appStore = createStore("app")({
  ...initialState,
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({}))
  .extendActions((set, get, api) => ({}));
