import fs from "node:fs";
import { Parser, Store } from "n3";
import {
  createModel,
  getIRIs,
  Profiles,
  SectionNames,
  Section,
} from "@/scripts/onto-utils";

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
  const enrichedProfiles: Profiles = {};
  for (const [profileName, profile] of Object.entries(profiles)) {
    const modelProfile = Object.values(modelProfiles).find(
      (v) => v.name === profileName,
    )!;
    for (const [sectionName, section] of Object.entries(profile) as [
      SectionNames,
      Section,
    ][]) {
      const modelSection = modelProfile[sectionName];
      for (const [itemName, item] of Object.entries(section)) {
        if (!(item instanceof Object)) continue;
        const modelItem = Object.values(modelSection).find(
          (v) => v.name === itemName,
        )!;
        item.description = modelItem.description;
        if (sectionName === "classes") {
          item.abstract = modelItem.metadata.Instantiability === "Abstract";
        }
        section[itemName] = item;
      }
      profile[sectionName] = section;
    }
    profile.iri = modelProfile.iri;
    profile.name = modelProfile.iri.split("/").pop();
    profile.summary = modelProfile.summary;
    profile.description = modelProfile.description;
    enrichedProfiles[profileName] = profile;
  }
  return enrichedProfiles;
}

function updateOntology() {
  const graph = createGraph();
  const profiles = createModel(graph);
  const enriched = enrichModelFromMarkdown(profiles);
  const iris = getIRIs(profiles);
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
    JSON.stringify(profiles, replacer, 2),
  );
}

const profiles = updateOntology().profiles;
// console.log(JSON.stringify(profiles, replacer, 2));
saveProfiles(profiles);
