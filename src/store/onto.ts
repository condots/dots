import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import createSelectors from "@/scripts/createSelectors";
import { Store } from "n3";
import {
  createGraph,
  createModel,
  enrichModelFromMarkdown,
  getIRIs,
  Profiles,
  IRIs,
  Class,
  ClassProperties,
} from "@/scripts/onto-utils";

type OntoState = {
  source: string | File | null;
  graph: Store | null;
  profiles: Profiles | null;
  iris: IRIs | null;
};

const initialState = {
  source: null,
  graph: null,
  profiles: null,
  iris: null,
};

const ontoStoreBase = create<OntoState>()(
  immer(
    subscribeWithSelector(
      devtools(
        persist(
          (set) => ({
            ...initialState,
            reset: () => {
              set(initialState);
            },
          }),
          {
            name: "onto",
          },
        ),
      ),
    ),
  ),
);

export const ontoStore = createSelectors(ontoStoreBase);

export const updateOntology = async (source: string | File) => {
  if (ontoStore.getState().source === source) return;
  const graph = await createGraph(source);
  const profiles = createModel(graph);
  const enriched = await enrichModelFromMarkdown(profiles, "model.json");
  const iris = getIRIs(profiles);
  ontoStore.setState({ source, graph, profiles: enriched, iris: iris });
  console.log("updated ontology");
};

export const getItem = (iri: string | null) => {
  const iris = ontoStore.getState().iris;
  return iri && iris && iris[iri];
};

export const getRecClassProperties = (iri: string | undefined) => {
  const recClassProperties: Map<string, ClassProperties> = new Map();
  while (iri) {
    const cls = getItem(iri) as Class;
    recClassProperties.set(cls.name, cls.properties);
    iri = cls.subClassOf;
  }
  return recClassProperties;
};
