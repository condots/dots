import { create } from "zustand";
import { persist, devtools, combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/utils/createSelectors";
import { Store } from "n3";
import { createModel, createGraph } from "@/utils/onto-utils";

const ontoStoreBase = create(
  immer(
    devtools(
      persist(
        combine(
          {
            source: <string | File>"https://spdx.org/rdf/3.0.0/spdx-model.ttl",
            graph: <Store | null>null,
            model: {},
            iris: <Record<string, object>>{},
          },
          (set, get) => ({
            byIri: (iri: string) => get().iris[iri],
          }),
        ),
        {
          name: "onto",
        },
      ),
    ),
  ),
);

export const ontoStore = createSelectors(ontoStoreBase);

export const updateOntology = async () => {
  const source = ontoStore.getState().source;
  const graph = await createGraph(source);
  const [model, iris] = await createModel(graph);
  ontoStore.setState({ graph, model, iris });
  console.log("updated ontology");
};
