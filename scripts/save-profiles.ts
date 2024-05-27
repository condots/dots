import fs from "node:fs";
import { Parser, Store } from "n3";
import { createModel, mapIRIs, Profiles } from "@/scripts/onto-utils";
import { parseIRI } from "@/scripts/app-utils";
import types from "@/types";

function createGraph() {
  const source = "./public/spdx-model.ttl";
  const text = fs.readFileSync(source).toString();
  const parser = new Parser();
  const quads = parser.parse(text);
  return new Store(quads);
}

function enrichModelFromMarkdown(profiles: Profiles) {
  const source = "./public/model.json";
  const text = fs.readFileSync(source).toString();
  const markdown: Record<string, object> = JSON.parse(text);
  const modelProfiles = markdown.namespaces;

  const enrichedProfiles: types.EnrichedProfiles = {};
  for (const [profileName, profile] of Object.entries(profiles) as [
    types.Name,
    types.Profile,
  ][]) {
    const enrichedProfile = profile as types.EnrichedProfile;
    const modelProfile = Object.values(modelProfiles).find(
      (v) => v.name === profileName
    )!;
    for (const [sectionName, section] of Object.entries(profile) as [
      keyof types.Profile,
      types.Section,
    ][]) {
      const modelSection = modelProfile[sectionName];
      for (const [itemName, item] of Object.entries(section)) {
        if (!(item instanceof Object)) continue;
        const modelItem = Object.values(modelSection).find(
          (v) => v.name === itemName
        )!;
        item.description = modelItem.description;
        if (sectionName === "classes") {
          item.abstract = modelItem.metadata.Instantiability === "Abstract";
        }
        section[itemName] = item;
      }
      enrichedProfile[sectionName] = section;
    }
    enrichedProfile.iri = modelProfile.iri;
    enrichedProfile.name = parseIRI(profile.iri!).name;
    enrichedProfile.summary = modelProfile.summary;
    enrichedProfile.description = modelProfile.description;
    enrichedProfiles[profileName] = enrichedProfile;
  }
  return enrichedProfiles;
}

function updateOntology() {
  const graph = createGraph();
  const profiles = createModel(graph);
  const enriched = enrichModelFromMarkdown(profiles);
  const iris = mapIRIs(profiles);
  return { graph, profiles: enriched, iris };
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

function saveProfiles(profiles: Profiles) {
  fs.writeFileSync(
    "./public/profiles.json",
    JSON.stringify(profiles, replacer, 2)
  );
}

const profiles = updateOntology().profiles;
// console.log(JSON.stringify(profiles, replacer, 2));
saveProfiles(profiles);
