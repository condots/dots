import { create } from "zustand";
import { persist, devtools, combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/scripts/createSelectors";
import { Store } from "n3";
import {
  createGraph,
  createModel,
  enrichModelFromMarkdown,
  getIris,
} from "@/scripts/onto-utils";

const initialState = {
  source: <string | File | null>null,
  graph: <Store | null>null,
  model: {},
  iris: <Record<string, object>>{},
};

export const ontoStoreBase = create(
  immer(
    devtools(
      persist(
        combine({ ...initialState }, (set, get) => ({
          reset: () => {
            set(initialState);
          },
        })),
        {
          name: "onto",
        },
      ),
    ),
  ),
);

export const ontoStore = createSelectors(ontoStoreBase);

export const updateOntology = async (source: string | File) => {
  if (
    ontoStore.getState().source !== source &&
    ontoStore.getState().graph === null
  ) {
    const graph = await createGraph(source);
    const model = createModel(graph);
    await enrichModelFromMarkdown(model, "model.json");
    const iris = getIris(model);
    ontoStore.setState({ source, graph, model, iris });
    console.log("updated ontology");
  }
};

export const byIri = (iri: string) => {
  return ontoStore.getState().iris[iri];
};
