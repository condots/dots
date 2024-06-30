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
      inputType: 'url',
      helpText: 'Enter a valid IRI...',
      validator: (v: string) =>
        typeof v === 'string' && v.length > 0 && isIri(v),
    },
  ],
  [
    'boolean',
    {
      icon: 'toggle_off',
      validator: (v: boolean) => typeof v === 'boolean',
    },
  ],
  [
    'dateTimeStamp',
    {
      icon: 'calendar_today',
      inputType: 'datetime-local',
      validator: (v: string) =>
        moment(v, 'YYYY-MM-DDTHH:mm:ss', true).isValid(),
      step: 1,
    },
  ],
  [
    'decimal',
    {
      icon: 'numbers',
      inputType: 'number',
      helpText: 'Enter a number...',
      validator: (v: string) => {
        const num = Number(v);
        return !isNaN(num) && num.toString() === v.trim();
      },
    },
  ],
  [
    'nonNegativeInteger',
    {
      icon: 'numbers',
      inputType: 'number',
      helpText: 'Enter zero or a positive integer...',
      validator: (v: string) => {
        const num = Number(v);
        return Number.isInteger(num) && num >= 0 && num.toString() === v.trim();
      },
      min: 0,
      step: 1,
    },
  ],
  [
    'positiveInteger',
    {
      icon: 'numbers',
      inputType: 'number',
      helpText: 'Enter a positive integer...',
      validator: (v: number) => {
        const num = Number(v);
        return Number.isInteger(num) && num > 0 && num.toString() === v.trim();
      },
      min: 1,
      step: 1,
    },
  ],
  [
    'string',
    {
      icon: 'drive_file_rename_outline',
      inputType: 'text',
      helpText: 'Enter text...',
      validator: (v: string) => typeof v === 'string' && v.length > 0,
    },
  ],
  [
    'SemVer',
    {
      icon: 'commit',
      inputType: 'text',
      helpText: 'Enter version using SemVer...',
      validator: (v: string) => !!semver.valid(v),
    },
  ],
  [
    'MediaType',
    {
      icon: 'drive_file_rename_outline',
      inputType: 'text',
      helpText: 'Enter media type using RFC 2046',
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
    : !!nodeProperty.value;
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
  const url = 'media-types.csv';
  const csv = (await (await fetch(url)).text()) ?? '';
  const mediaTypes: PropertyOption[] = await new Promise(resolve =>
    Papa.parse(csv, {
      config: {
        skipEmptyLines: true,
      },
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
    id: generateURN(),
    classProperty,
    value,
    valid: false,
    required: false,
  };
  nodeProperty.valid = isNodePropertyValid(nodeProperty);
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

export function initNodeProps(recClsProps: RecClsProps) {
  const required = getClsDataProps(recClsProps, true);
  const nodeProperties = {} as NodeData['nodeProps'];
  for (const clsProp of required) {
    const nodeProp = generateNodeProperty(clsProp);
    nodeProp.required = true;
    nodeProperties[nodeProp.id] = nodeProp;
  }
  return nodeProperties;
}

export function getClsPropMins(recClsProps: RecClsProps) {
  const clsPropMins: Record<string, number> = {};
  for (const clsProps of recClsProps.values()) {
    for (const clsProp of Object.values(clsProps)) {
      if (clsProp.targetClass && clsProp.minCount) {
        clsPropMins[clsProp.path] = clsProp.minCount;
      }
    }
  }
  return clsPropMins;
}

export function generateURN(): string {
  return `urn:nanoid:${nanoid()}`;
}

export const itemClass = `
  text-sm text-spdx-dark rounded flex justify-between space-x-2
  items-center h-6 relative p-2 select-none outline-none
  data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none 
  data-[highlighted]:bg-spdx-dark data-[highlighted]:text-mauve1
`;

export const contentClass = `
  bg-mauve1 rounded border border-mauve6 select-none 
  shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]
  will-change-[opacity,transform] 
  data-[side=top]:animate-slideDownAndFade 
  data-[side=right]:animate-slideLeftAndFade 
  data-[side=bottom]:animate-slideUpAndFade 
  data-[side=left]:animate-slideRightAndFade
`;

export const targetClsTooltipClass = `
  text-sm text-mauve1 rounded flex bg-spdx-dark space-x-2
  items-center h-6 relative select-none outline-none
  shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]
  will-change-[opacity,transform]
  data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade 
  data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade 
  data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade 
  data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade 
`;

export const tooltipClass = `
  rounded select-none p-2 
  bg-gray-500 text-mauve1 shadow shadow-blackA4 
  will-change-[opacity,transform]
  data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade 
  data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade 
  data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade 
  data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade
`;
