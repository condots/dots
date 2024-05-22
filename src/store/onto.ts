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
  console.log("updating ontology");

  // if (ontoStore.getState().source === source) return;
  const graph = await createGraph(source);
  const profiles = createModel(graph);
  const enriched = await enrichModelFromMarkdown(profiles, "model.json");
  const iris = getIRIs(profiles);
  ontoStore.setState({ source, graph, profiles: enriched, iris: iris });
  console.log("updated ontology");
};

export const byIRI = (iri: string) => {
  return iri && ontoStore.getState().iris?.get(iri);
};

export const getRecursiveClassProperties = (iri: string | undefined) => {
  const recursiveClassProperties: Map<string, ClassProperties> = new Map();
  while (iri) {
    const cls = byIRI(iri) as Class;
    recursiveClassProperties.set(cls.name, cls.properties);
    iri = cls.subClassOf;
  }
  return recursiveClassProperties;
};

// export const classProperties = (
//   iri: string,
//   datatypeOnly?: boolean,
//   requiredOnly?: boolean,
// ) => {
//   const properties = new Map();
//   while (iri) {
//     const c = byIRI(iri);
//     const props = new Map();
//     for (const [propertyName, data] of Object.entries(c.properties)) {
//       const p = byIRI(data.path);
//       if (requiredOnly || data.minCount > 0) continue;
//       if (datatypeOnly || !p.datatype) continue;
//       const r = byIRI(p.range);
//       // if (r?.abstract) continue;
//       // if (r && !r.entries) continue;
//       props.set(propertyName, data);
//     }
//     if (props.size) {
//       properties.set(c.name, props);
//     }
//     iri = c.subClassOf;
//   }
//   return properties;
// };
