import { createStore } from "zustand-x";
import { Store } from "n3";
import rdfext from "rdf-ext";
import { getSpdxNs, getProfiles, loadOntology } from "@/utils/onto-utils";

interface State {
  source: string | File;
  graph: Store | null;
  spdxNs: string | null;
  model: object;
}

const initialState = <State>{
  source: "https://spdx.org/rdf/3.0.0/spdx-model.ttl",
  graph: null,
  spdxNs: null,
  model: {},
};

export const ontoStore = createStore("onto")({
  ...initialState,
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({
    profileNs: (profile: string) => {
      const spdxNs = get.spdxNs();
      return spdxNs && rdfext.namespace(`${spdxNs}/${profile}/`);
    },
    iris: () => {
      const profiles = get.model();
      const iris = {};
      for (const profile in profiles) {
        for (const name in profiles[profile]) {
          const cls = profiles[profile][name];
          iris[cls.iri] = cls;
        }
      }
      return iris;
    },
  }))
  .extendSelectors((state, get, api) => ({
    cls: (iri: string) => get.iris()[iri],
  }))
  .extendActions((set, get, api) => ({
    updateOntology: () => {
      loadOntology(get.source()).then((model) => {
        const spdxNs = getSpdxNs(model);
        const profiles = getProfiles(model, spdxNs);
        set.state((draft) => {
          draft.graph = model;
          draft.spdxNs = spdxNs;
          draft.model = profiles;
        });
        console.log("updated ontology");
      });
    },
  }));
