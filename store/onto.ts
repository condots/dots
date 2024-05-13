import { createStore } from "zustand-x";
import { Store } from "n3";
import {
  createModel,
  createGraph,
  getInheritedConstraints,
} from "@/utils/onto-utils";

export const ontoStore = createStore("onto")({
  source: <string | File>"https://spdx.org/rdf/3.0.0/spdx-model.ttl",
  graph: <Store | null>null,
  model: <object>{},
  iris: <object>{},
  middlewares: ["immer", "devtools", "persist"],
})
  .extendSelectors((state, get, api) => ({
    byIri: (iri: string) => get.iris()[iri],
    inheritedConstraints: (iri: string) =>
      getInheritedConstraints(get.iris(), get.iris()[iri].subClassOf),
  }))
  .extendActions((set, get, api) => ({
    updateOntology: () => {
      createGraph(get.source()).then((graph) => {
        const [model, iris] = createModel(graph);
        set.state((draft) => {
          draft.graph = graph;
          draft.model = model;
          draft.iris = iris;
        });
        console.log("updated ontology");
        // console.log(JSON.stringify(model));
      });
    },
  }));
