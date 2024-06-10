import fs from 'node:fs';
import {
  createGraph,
  createModel,
  enrichModelFromMarkdown,
  Profiles,
} from '@/scripts/onto-utils';

export async function updateOntology(source: string | File, model: string) {
  const graph = await createGraph(source);
  const graphProfiles = createModel(graph);
  const profiles = await enrichModelFromMarkdown(graphProfiles, model);
  return profiles;
}

const replacer = (key, value) =>
  value instanceof Object && !(value instanceof Array)
    ? Object.keys(value)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {})
    : value;

function saveProfiles(profiles: Profiles, target: string) {
  fs.writeFileSync(target, JSON.stringify(profiles, replacer, 2));
}
const source = './public/spdx-model.ttl';
const model = './public/model.json';
const target = './public/profiles.json';
const profiles = await updateOntology(source, model);
// console.log(JSON.stringify(profiles, replacer, 2));
saveProfiles(profiles, target);
