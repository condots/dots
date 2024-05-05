import { createStore } from "zustand-x";
import { Store } from "n3";
import rdfext from "rdf-ext";
import { getSpdxNs, getProfiles, loadOntology } from "@/utils/onto-utils";

export const ontoStore = createStore("onto")({
  source: <string | File>"https://spdx.org/rdf/3.0.0/spdx-model.ttl",
  graph: <Store | null>null,
  spdxNs: <string | null>null,
  model: <object>{},
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
      loadOntology(get.source()).then((graph) => {
        const spdxNs = getSpdxNs(graph);
        const model = getProfiles(graph, spdxNs);
        set.state((draft) => {
          draft.graph = graph;
          draft.spdxNs = spdxNs;
          draft.model = model;
        });
        console.log("updated ontology");
      });
    },
  }));
