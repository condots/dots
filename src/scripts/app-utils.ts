import types from "@/types";
import DOMPurify from "dompurify";
import { parse } from "marked";
import Papa from "papaparse";
import { isIri } from "@hyperjump/uri";
import moment from "moment";
import semver from "semver";

export const advisoryText = (text: string | undefined) => {
  if (!text) return "";
  DOMPurify.addHook("afterSanitizeElements", function (node) {
    if (node.tagName && node.tagName.toLowerCase() === "a") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  const parsed = parse(text) as string;
  const clean = DOMPurify.sanitize(parsed);
  DOMPurify.removeHook("afterSanitizeElements");
  return parse(clean) as string;
};

export const inputProperties: types.InputProperties = new Map([
  [
    "anyURI",
    {
      icon: "link",
      inputKind: "string",
      validator: (v: string) =>
        typeof v === "string" && v.length > 0 && isIri(v),
      helpText: "Enter a valid IRI",
    },
  ],
  [
    "boolean",
    {
      icon: "toggle_off",
      inputKind: "boolean",
      validator: (v: boolean) => typeof v === "boolean",
    },
  ],
  [
    "dateTimeStamp",
    {
      icon: "schedule",
      inputKind: "string",
      validator: (v: string) =>
        moment(v, "YYYY-MM-DDTHH:mm:ssZ", true).isValid(),
      mask: "9999-99-99T99:99:99Z",
      slotChar: "YYYY-MM-DDTHH:mm:ssZ",
      helpText: "Enter date-time in UTC using ISO-8601",
    },
  ],
  [
    "decimal",
    {
      icon: "numbers",
      inputKind: "number",
      validator: (v: number) => typeof v === "number",
      helpText: "Enter a number",
    },
  ],
  [
    "nonNegativeInteger",
    {
      icon: "numbers",
      inputKind: "number",
      validator: (v: number) => Number.isInteger(v) && v >= 0,
      helpText: "Enter a positive integer",
    },
  ],
  [
    "positiveInteger",
    {
      icon: "numbers",
      inputKind: "number",
      validator: (v: number) => Number.isInteger(v) && v > 0,
      helpText: "Enter zero or a positive integer",
    },
  ],
  [
    "string",
    {
      icon: "text_fields",
      inputKind: "string",
      validator: (v: string) => typeof v === "string" && v.length > 0,
      helpText: "Enter a string",
    },
  ],
  [
    "SemVer",
    {
      icon: "pin",
      inputKind: "string",
      validator: (v: string) => Boolean(semver.valid(v)),
      helpText: "Enter a version using SemVer 2.0.0",
    },
  ],
  [
    "MediaType",
    {
      icon: "text_fields",
      inputKind: "string",
      validator: (v: string) =>
        typeof v === "string" && /^[^/]+\/[^/]+$/.test(v),
      helpText: "Enter a media type using RFC 2046",
    },
  ],
]);

export const isNodePropertyValid = (nodeProperty: types.NodeProperty) => {
  if (nodeProperty.value === undefined) return false;
  const cp = nodeProperty.classProperty;
  return cp.nodeKind === "Literal"
    ? inputProperties.get(cp.datatype)!.validator(nodeProperty.value)
    : Boolean(nodeProperty.value);
};

export async function getMediaTypes() {
  // Using local copy of "Media Types" to avoid CORS issues with:
  // "https://www.iana.org/assignments/media-types/application.csv"
  const url = "media-types.csv";
  const csv = (await (await fetch(url)).text()) ?? "";
  const mediaTypes: types.PropertyOption[] = await new Promise((resolve) =>
    Papa.parse(csv, {
      complete: function (res) {
        resolve(
          res.data.slice(1).map((row) => {
            const [label, value] = row as [string, string];
            return { label, value };
          })
        );
      },
    })
  );
  return mediaTypes;
}

export function parseIRI(iri: types.IRI) {
  const [name, profile] = iri.split("/").reverse();
  return { name, profile };
}
