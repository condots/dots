import { createStore } from "zustand-x";

export const appStore = createStore("app")({
  instDialog: {
    nodeId: <string | null>null,
  },
  datatypes: {
    string: {
      icon: "text_fields",
      pattern: /^.*$/,
    },
    anyURI: {
      icon: "link",
      pattern: /^[a-zA-Z][a-zA-Z0-9+.-]*:(\/\/[^\s/]+)?[^\s]*$/,
    },
    dateTimeStamp: {
      icon: "schedule",
      pattern:
        /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?(Z|(\+|-)[0-9][0-9]:[0-9][0-9])$/,
    },
    decimal: {
      icon: "numbers",
      pattern: /^(\+|-)?([0-9]+(\.[0-9]*)?|\.[0-9]+)$/,
    },
    positiveInteger: {
      icon: "numbers",
      pattern: /^[1-9][0-9]*$/,
    },
    nonNegativeInteger: {
      icon: "numbers",
      pattern: /^[0-9]+$/,
    },
    boolean: {
      icon: "toggle_off",
    },
    default: {
      icon: "web_asset",
    },
  },
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({
    datatypeIcon: (t: string) => {
      const types = get.datatypes();
      return types[t]?.icon ?? types.default.icon;
    },
  }))
  .extendActions((set, get, api) => ({}));
