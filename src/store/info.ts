import { createStore } from "zustand-x";

interface State {
  visible: boolean;
  name: string;
  summary: string;
}

const initialState = <State>{
  visible: false,
  name: "",
  summary: "",
};

export const infoStore = createStore("info")({
  ...initialState,
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({}))
  .extendActions((set, get, api) => ({}));
