import DOMPurify from 'dompurify';
import { parse } from 'marked';
import Papa from 'papaparse';
import { isIri } from '@hyperjump/uri';
import moment from 'moment';
import semver from 'semver';
import {
  ClassProperty,
  IRI,
  InputProperties,
  NodeProperty,
  PropertyOption,
} from '@/types';

export const advisoryText = (text: string | undefined) => {
  if (!text) return '';
  DOMPurify.addHook('afterSanitizeElements', function (node) {
    if (node.tagName && node.tagName.toLowerCase() === 'a') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  const parsed = parse(text) as string;
  const clean = DOMPurify.sanitize(parsed);
  DOMPurify.removeHook('afterSanitizeElements');
  return parse(clean) as string;
};

export const inputProperties: InputProperties = new Map([
  [
    'anyURI',
    {
      icon: 'link',
      inputKind: 'string',
      helpText: 'Enter a valid IRI',
      validator: (v: string) =>
        typeof v === 'string' && v.length > 0 && isIri(v),
    },
  ],
  [
    'boolean',
    {
      icon: 'toggle_off',
      inputKind: 'boolean',
      helpText: '',
      validator: (v: boolean) => typeof v === 'boolean',
    },
  ],
  [
    'dateTimeStamp',
    {
      icon: 'schedule',
      inputKind: 'string',
      helpText: 'Enter date-time in UTC using ISO-8601',
      validator: (v: string) =>
        moment(v, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid(),
      mask: '9999-99-99T99:99:99Z',
      slotChar: 'YYYY-MM-DDTHH:mm:ssZ',
    },
  ],
  [
    'decimal',
    {
      icon: 'numbers',
      inputKind: 'number',
      helpText: 'Enter a number',
      validator: (v: number) => typeof v === 'number',
    },
  ],
  [
    'nonNegativeInteger',
    {
      icon: 'numbers',
      inputKind: 'number',
      helpText: 'Enter a positive integer',
      validator: (v: number) => Number.isInteger(v) && v >= 0,
      min: 0,
    },
  ],
  [
    'positiveInteger',
    {
      icon: 'numbers',
      inputKind: 'number',
      helpText: 'Enter zero or a positive integer',
      validator: (v: number) => Number.isInteger(v) && v > 0,
      min: 1,
    },
  ],
  [
    'string',
    {
      icon: 'text_fields',
      inputKind: 'string',
      helpText: 'Enter a string',
      validator: (v: string) => typeof v === 'string' && v.length > 0,
    },
  ],
  [
    'SemVer',
    {
      icon: 'pin',
      inputKind: 'string',
      helpText: 'Enter version using SemVer 2.0.0',
      validator: (v: string) => Boolean(semver.valid(v)),
    },
  ],
  [
    'MediaType',
    {
      icon: 'text_fields',
      inputKind: 'string',
      helpText: 'Enter an RFC 2046 media type',
      validator: (v: string) =>
        typeof v === 'string' && /^[^/]+\/[^/]+$/.test(v),
    },
  ],
]);

export const isNodePropertyValid = (nodeProperty: NodeProperty) => {
  if (nodeProperty.value === undefined) return false;
  const cp = nodeProperty.classProperty;
  return cp.nodeKind === 'Literal'
    ? inputProperties.get(cp.datatype)!.validator(nodeProperty.value)
    : Boolean(nodeProperty.value);
};

export const getClassPropertyIcon = (classProperty: ClassProperty) => {
  if (classProperty.options) {
    return 'list';
  } else if (classProperty.nodeKind === 'Literal') {
    return inputProperties.get(classProperty.datatype)!.icon;
  }
};

export async function getMediaTypes() {
  // Using local copy of "Media Types" to avoid CORS issues with:
  // "https://www.iana.org/assignments/media-types/application.csv"
  const url = 'media-csv';
  const csv = (await (await fetch(url)).text()) ?? '';
  const mediaTypes: PropertyOption[] = await new Promise(resolve =>
    Papa.parse(csv, {
      complete: function (res) {
        resolve(
          res.data.slice(1).map(row => {
            const [label, value] = row as [string, string];
            return { label, value };
          })
        );
      },
    })
  );
  return mediaTypes;
}

export function parseIRI(iri: IRI) {
  const [name, profile] = iri.split('/').reverse();
  return { name, profile };
}
