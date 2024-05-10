import fs from "node:fs";
import { Parser, Store } from "n3";
import { ns, getSpdxNs, createModel } from "@/utils/onto-utils";
import _ from "lodash-es";

const replacer = (key, value) =>
  value instanceof Object && !(value instanceof Array)
    ? Object.keys(value)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {})
    : value;

function saveSpdxExplorerModel() {
  function getGraph() {
    const text = fs.readFileSync("./public/spdx-model.ttl").toString();
    const parser = new Parser();
    const quads = parser.parse(text);
    return new Store(quads);
  }

  const graph = getGraph();
  const spdxNs = getSpdxNs(graph);
  const [model, iris] = createModel(graph, spdxNs);
  fs.writeFileSync(
    "./public/spdx-explorer-model.json",
    JSON.stringify(model, replacer, 2),
  );
  console.log("iris:", _.keys(iris).length);
}

function saveSortedModel() {
  const markdown = JSON.parse(
    fs.readFileSync("./public/model.json").toString(),
  );
  const model = {};
  for (const namespace of markdown.namespaces) {
    const profile = {};
    for (const [k, v] of _.entries(namespace)) {
      if (
        _.isEmpty(v) ||
        !["classes", "properties", "vocabularies", "individuals"].includes(k)
      )
        continue;
      profile[k] = v;
    }
    if (!_.isEmpty(profile)) {
      model[namespace.name] = profile;
    }
  }
  fs.writeFileSync(
    "./public/model-sorted.json",
    JSON.stringify(model, replacer, 2),
  );
}

function saveEnrichedModel() {
  const model = JSON.parse(
    fs.readFileSync("./public/spdx-explorer-model.json").toString(),
  );
  const namespaces = JSON.parse(
    fs.readFileSync("./public/model.json").toString(),
  ).namespaces;
  for (const namespace of namespaces) {
    const profile = namespace.name;
    if (!model[profile]) continue;
    model[profile].iri = namespace.iri;
    model[profile].summary = namespace.summary;
    model[profile].description = namespace.description;
    for (const section of [
      "classes",
      "properties",
      "vocabularies",
      "individuals",
    ]) {
      for (const [k, v] of _.entries(namespace[section])) {
        if (v.name === "spdxId") continue;
        model[profile][section][v.name].description = v.description;
        if (section === "classes") {
          model[profile][section][v.name].abstract =
            v.metadata.Instantiability === "Abstract";
        }
      }
    }
  }
  fs.writeFileSync(
    "./public/spdx-explorer-model-enriched.json",
    JSON.stringify(model, replacer, 2),
  );
}

// saveSpdxExplorerModel();
// saveSortedModel();
saveEnrichedModel();
