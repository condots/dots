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

import {
  Class,
  EnrichedProfiles,
  IRI,
  Item,
  Name,
  NodeData,
  OntologyMetadata,
} from '@/types';
import {
  createGraph,
  createModel,
  enrichModelFromMarkdown,
  getAllRecClsProps,
  getJsonLdContext,
  getOntologyMetadata,
  mapIRIs,
} from '@/scripts/onto-utils';
import { ContextDefinition } from 'jsonld';

type OntoState = {
  source: string | File | undefined;
  graph: Store | undefined;
  ontologyMetadata: OntologyMetadata | undefined;
  profiles: EnrichedProfiles | undefined;
  iris: Record<IRI, Item> | undefined;
  allRecClsProps: Record<Name, NodeData['recClsProps']> | undefined;
  jsonLdContextSource: string | undefined;
  jsonLdContextUrl: string | undefined;
  jsonLdContext: ContextDefinition | undefined;
};

const initialState = {
  source: undefined,
  graph: undefined,
  ontologyMetadata: undefined,
  profiles: undefined,
  iris: undefined,
  allRecClsProps: undefined,
  jsonLdContextSource: undefined,
  jsonLdContextUrl: undefined,
  jsonLdContext: undefined,
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

const myPersist: typeof persist = !import.meta.env.PROD
  ? persist
  : (fn: any) => fn;

const ontoStoreBase = create<OntoState>()(
  immer(
    devtools(
      subscribeWithSelector(
        myPersist(
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
      ),
      { enabled: !import.meta.env.PROD }
    )
  )
);

export const ontoStore = createSelectors(ontoStoreBase);

export async function updateOntology(
  source: string | File,
  jsonLdContextSource: string,
  jsonLdContextUrl: string,
  model: string
) {
  // if (ontoStore.getState().source === source) return;
  const graph = await createGraph(source);
  const ontologyMetadata = getOntologyMetadata(graph);
  const graphProfiles = createModel(graph);
  const profiles = await enrichModelFromMarkdown(graphProfiles, model);
  const iris = mapIRIs(profiles);
  const allRecClsProps = getAllRecClsProps(profiles, iris);
  const jsonLdContext = await getJsonLdContext(jsonLdContextSource);
  ontoStore.setState({
    source,
    graph,
    ontologyMetadata,
    profiles,
    iris,
    allRecClsProps,
    jsonLdContextSource,
    jsonLdContextUrl,
    jsonLdContext,
  });
  console.log(`loaded SPDX ${ontologyMetadata?.specVersion}`);
}

export const getItem = (iri: IRI | undefined) => {
  const iris = ontoStore.getState().iris;
  if (iri && iris) return iris[iri];
};

export const getClassProperty = (classIRI: IRI, propertyName: string) => {
  const cls = getItem(classIRI) as Class | undefined;
  return cls?.properties[propertyName];
};
