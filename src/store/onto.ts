import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import createSelectors from '@/scripts/createSelectors';
import { Store } from 'n3';

import { Class, EnrichedProfiles, IRI, Item } from '@/types';
import {
  createGraph,
  createModel,
  enrichModelFromMarkdown,
  mapIRIs,
} from '@/scripts/onto-utils';

type OntoState = {
  source: string | File | undefined;
  graph: Store | undefined;
  profiles: EnrichedProfiles | undefined;
  iris: Record<IRI, Item> | undefined;
};

const initialState = {
  source: undefined,
  graph: undefined,
  profiles: undefined,
  iris: undefined,
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
          }
        )
      )
    )
  )
);

export const ontoStore = createSelectors(ontoStoreBase);

export async function updateOntology(source: string | File) {
  // if (ontoStore.getState().source === source) return;
  const graph = await createGraph(source);
  const profiles = createModel(graph);
  const enriched = await enrichModelFromMarkdown(profiles, 'model.json');
  const iris = mapIRIs(profiles);
  ontoStore.setState({ source, graph, profiles: enriched, iris: iris });
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
