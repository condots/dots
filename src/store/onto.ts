import { create } from 'zustand';
import {
  persist,
  PersistStorage,
  devtools,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import superjson from 'superjson';
import createSelectors from '@/store/createSelectors';
import { Store } from 'n3';

import { Class, EnrichedProfiles, IRI, Item, Name, RecClsProps } from '@/types';
import {
  createGraph,
  createModel,
  enrichModelFromMarkdown,
  getAllRecClsProps,
  mapIRIs,
} from '@/scripts/onto-utils';

type OntoState = {
  source: string | File | undefined;
  graph: Store | undefined;
  profiles: EnrichedProfiles | undefined;
  iris: Record<IRI, Item> | undefined;
  allRecClsProps: Record<Name, RecClsProps> | undefined;
};

const initialState = {
  source: undefined,
  graph: undefined,
  profiles: undefined,
  iris: undefined,
  allRecClsProps: undefined,
};

const storage: PersistStorage<OntoState> = {
  getItem: name => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return superjson.parse(str);
  },
  setItem: (name, value) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: name => localStorage.removeItem(name),
};

const ontoStoreBase = create<OntoState>()(
  subscribeWithSelector(
    immer(
      devtools(
        persist(
          set => ({
            ...initialState,
            reset: () => {
              set(initialState);
            },
          }),
          {
            name: 'onto',
            storage,
          }
        )
      )
    )
  )
);

export const ontoStore = createSelectors(ontoStoreBase);

export async function updateOntology(source: string | File, model: string) {
  // if (ontoStore.getState().source === source) return;
  const graph = await createGraph(source);
  const graphProfiles = createModel(graph);
  const profiles = await enrichModelFromMarkdown(graphProfiles, model);
  const iris = mapIRIs(profiles);
  const allRecClsProps = getAllRecClsProps(profiles, iris);
  ontoStore.setState({ source, graph, profiles, iris, allRecClsProps });
  console.log('updated ontology');
}

export const getItem = (iri: IRI | undefined) => {
  const iris = ontoStore.getState().iris;
  if (iri && iris) return iris[iri];
};

export const getClassProperty = (classIRI: IRI, propertyName: string) => {
  const cls = getItem(classIRI) as Class | undefined;
  return cls?.properties[propertyName];
};
