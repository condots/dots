import fs from "node:fs";
import { Parser, Store } from "n3";
import {
  createModel,
  getIRIs,
  Profiles,
  Profile,
  SharedFields,
} from "@/scripts/onto-utils";

function createGraph(source: string) {
  const text = fs.readFileSync(source).toString();
  const parser = new Parser();
  const quads = parser.parse(text);
  return new Store(quads);
}

function enrichModelFromMarkdown(profiles: Profiles, source: string) {
  const res = fs.readFileSync(source);
  const markdown = JSON.parse(res.toString());
  const modelProfiles = markdown.namespaces;
  const enrichedProfiles: Profiles = new Map();
  for (const [profileName, profile] of profiles) {
    const modelProfile = Object.values(modelProfiles).find(
      (v) => v.name === profileName,
    )!;
    for (const [sectionName, section] of Object.entries(profile) as [
      keyof Profile,
      Map<string, SharedFields>,
    ][]) {
      const modelSection = modelProfile[sectionName];
      for (const [itemName, item] of section) {
        const modelItem = Object.values(modelSection).find(
          (v) => v.name === itemName,
        )!;
        item.description = modelItem.description;
        section.set(itemName, item);
      }
      profile[sectionName] = section as any;
    }
    profile.iri = modelProfile.iri;
    profile.name = modelProfile.iri.split("/").pop();
    profile.summary = modelProfile.summary;
    profile.description = modelProfile.description;
    enrichedProfiles.set(profileName, profile);
  }
  return enrichedProfiles;
}

function updateOntology(source: string) {
  const graph = createGraph(source);
  const profiles = createModel(graph);
  const iris = getIRIs(profiles);
  enrichModelFromMarkdown(profiles, "./public/model.json");
  return { graph, profiles, iris };
}

const source = "./public/spdx-model.ttl";
const res = updateOntology(source);
const profiles = transformProfile(res.profiles);
console.log(JSON.stringify(profiles, null, 2));

// const obj = transformProfile(map);
// console.log(JSON.stringify(obj, null, 2));

function transformProfile(profiles: Profiles): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [profileName, profileData] of profiles.entries()) {
    result[profileName] = transformData(profileData);
  }

  return result;
}

function transformData(data: any): any {
  if (data instanceof Map) {
    return Object.fromEntries(
      Array.from(data.entries(), ([key, value]) => [key, transformData(value)]),
    );
  } else if (Array.isArray(data)) {
    return data.map(transformData);
  } else if (typeof data === "object" && data !== null) {
    const result: Record<string, any> = {};
    for (const key in data) {
      result[key] = transformData(data[key]);
    }
    return result;
  } else {
    return data;
  }
}
