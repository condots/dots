import { mapValuesKey } from "zustand-x";
import { appStore } from "@/store/app";
import { ontoStore } from "@/store/onto";
import { flowStore } from "@/store/flow";

export const globalStore = {
  app: appStore,
  onto: ontoStore,
  flow: flowStore,
};

// Global hook selectors
export const selectors = () => mapValuesKey("use", globalStore);

// Global tracked hook selectors
export const tracked = () => mapValuesKey("useTracked", globalStore);

// Global getter selectors
export const getters = mapValuesKey("get", globalStore);

// Global actions
export const actions = mapValuesKey("set", globalStore);
