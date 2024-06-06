import DOMPurify from 'dompurify';
import { parse } from 'marked';
import HTMLReactParser from 'html-react-parser';
import Papa from 'papaparse';
import { isIri } from '@hyperjump/uri';
import moment from 'moment';
import semver from 'semver';
import { nanoid } from 'nanoid';

import {
  ClassProperty,
  IRI,
  InputProperties,
  NodeData,
  NodeProperty,
  PropertyOption,
  RecClsProps,
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
  const clean = DOMPurify.sanitize(parsed, { ADD_ATTR: ['target'] });
  DOMPurify.removeHook('afterSanitizeElements');
  return HTMLReactParser(clean);
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
      icon: 'drive_file_rename_outline',
      inputKind: 'string',
      helpText: 'Enter a string',
      validator: (v: string) => typeof v === 'string' && v.length > 0,
    },
  ],
  [
    'SemVer',
    {
      icon: 'commit',
      inputKind: 'string',
      helpText: 'Enter version using SemVer 2.0.0',
      validator: (v: string) => Boolean(semver.valid(v)),
    },
  ],
  [
    'MediaType',
    {
      icon: 'drive_file_rename_outline',
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

export function generateNodeProperty(
  classProperty: ClassProperty,
  value: NodeProperty['value'] = undefined
) {
  const nodeProperty: NodeProperty = {
    id: nanoid(),
    classProperty,
    value,
    valid: false,
  };
  if (classProperty.datatype === 'boolean') {
    nodeProperty.value = Boolean(value);
    nodeProperty.valid = true;
  } else {
    nodeProperty.valid = isNodePropertyValid(nodeProperty);
  }
  return nodeProperty;
}

export const getClsDataProps = (recClsProps: RecClsProps, required = false) => {
  const props: ClassProperty[] = [];
  for (const clsProps of recClsProps.values()) {
    for (const clsProp of Object.values(clsProps)) {
      if (!clsProp.targetClass && (!required || clsProp.minCount)) {
        props.push(clsProp);
      }
    }
  }
  return props;
};

export function initNodeProps(recursive: RecClsProps) {
  const required = getClsDataProps(recursive, true);
  const nodeProperties = {} as NodeData['nodeProps'];
  for (const clsProp of required) {
    const nodeProp = generateNodeProperty(clsProp);
    nodeProperties[nodeProp.id] = nodeProp;
  }
  return nodeProperties;
}

export const itemClass = `
  text-sm text-blue12 rounded flex
  items-center h-6 relative p-2 select-none outline-none
  data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none 
  data-[highlighted]:bg-blue12 data-[highlighted]:text-mauve1
`;

export const contentClass = `
  p-1 bg-mauve1 rounded border border-mauve6 select-none
  shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]
  will-change-[opacity,transform] 
  data-[side=top]:animate-slideDownAndFade 
  data-[side=right]:animate-slideLeftAndFade 
  data-[side=bottom]:animate-slideUpAndFade 
  data-[side=left]:animate-slideRightAndFade
`;

export const targetClsTooltipClass = `
  text-sm text-mauve1 rounded flex
  items-center h-6 relative p-2 select-none outline-none
  p-1 bg-blue12 
  shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]
  will-change-[opacity,transform]
  data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade 
  data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade 
  data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade 
  data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade 
`;

// items-center h-6 relative p-2 select-none outline-none
// p-1 bg-mauve1
export const clsNameTooltipClass = `
  p-2 bg-mauve2 text-sm text-blue12 rounded border border-mauve6 select-none max-w-[250px] prose 
  shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]
  will-change-[opacity,transform]
  data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade 
  data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade 
  data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade 
  data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade 
`;
