import { createStore } from "zustand-x";
import { ontoStore } from "@/store/onto";
import { Store } from "n3";

export interface Constraint {
  constraint: object;
}

export interface Instance {
  iri: string;
  constraint: Constraint[];
  propertires: Record<string, any>;
}

interface State {
  instances: Record<string, Instance>;
}

const initialState = <State>{
  instances: {},
};

export const sbomStore = createStore("sbom")({
  ...initialState,
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({}))
  .extendActions((set, get, api) => ({}));
