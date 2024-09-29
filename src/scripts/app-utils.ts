import DOMPurify from 'dompurify';
import { parse } from 'marked';
import HTMLReactParser from 'html-react-parser';
import Papa from 'papaparse';
import { isIri } from '@hyperjump/uri';
import dayjs from 'dayjs';
import semver from 'semver';
import { nanoid } from 'nanoid';

import {
  ClassProperty,
  IRI,
  InputProperties,
  NodeData,
  NodeProperty,
  PropertyOption,
} from '@/types';
import { ontoStore } from '@/store/onto';
import { screenToCanvas } from '@/store/flow';
import { importSpdxJsonLd } from '@/scripts/fs-utils';

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
    },
  ],
  [
    'dateTimeStamp',
    {
      icon: 'calendar_today',
      inputType: 'datetime-local',
      validator: (v: string) =>
        dayjs(v, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid(),
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
      validator: (v: string) => {
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

export const preferredLabels: Record<string, string[]> = {
  'https://spdx.org/rdf/3.0.0/terms/Core/Relationship': ['relationshipType'],
  'https://spdx.org/rdf/3.0.0/terms/Core/ExternalIdentifier': ['identifier'],
  'https://spdx.org/rdf/3.0.0/terms/Core/SpdxDocument': ['profileConformance'],
  'https://spdx.org/rdf/3.0.0/terms/Core/Bom': ['profileConformance'],
  'https://spdx.org/rdf/3.0.0/terms/Core/CreationInfo': ['specVersion'],
};

export const isNodePropertyValid = (nodeProperty: NodeProperty) => {
  if (nodeProperty.value === undefined) return false;
  const cp = nodeProperty.classProperty;
  if (typeof nodeProperty.value === 'boolean') {
    return true;
  } else {
    return cp.nodeKind === 'Literal'
      ? inputProperties.get(cp.datatype)!.validator!(
          nodeProperty.value.toString()
        )
      : !!nodeProperty.value;
  }
};

export const getClassPropertyIcon = (classProperty: ClassProperty) => {
  if (classProperty.options) {
    return 'list';
  } else if (classProperty.nodeKind === 'Literal') {
    return inputProperties.get(classProperty.datatype)!.icon;
  }
};

const mediaTypeFiles = [
  'application.csv',
  'audio.csv',
  'font.csv',
  'haptics.csv',
  'image.csv',
  'message.csv',
  'model.csv',
  'multipart.csv',
  'text.csv',
  'video.csv',
];

export async function getMediaTypes() {
  const csvFiles = await Promise.all(
    mediaTypeFiles.map(async file => {
      const response = await fetch(file);
      return response.text();
    })
  );
  const allMediaTypes: PropertyOption[] = [];
  for (const csv of csvFiles) {
    await new Promise<void>(resolve => {
      Papa.parse(csv, {
        skipEmptyLines: true,
        complete: function (res) {
          const mediaTypes = res.data.slice(1).map(row => {
            const [label, value] = row as [string, string];
            return { label, value };
          });
          allMediaTypes.push(...mediaTypes);
          resolve();
        },
      });
    });
  }
  return allMediaTypes;
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

export const getRequiredClsDataProps = (
  recClsProps: NodeData['recClsProps']
) => {
  const reqProps: Map<string, ClassProperty[]> = new Map();
  for (const [clsName, clsProps] of recClsProps.entries()) {
    const props: ClassProperty[] = [];
    for (const clsProp of Object.values(clsProps)) {
      if (!clsProp.targetClass && clsProp.minCount) {
        props.push(clsProp);
      }
    }
    if (props.length) reqProps.set(clsName, props);
  }
  return reqProps;
};

export function initNodeProps(recClsProps: NodeData['recClsProps']) {
  const requiredProps = getRequiredClsDataProps(recClsProps);
  const nodeProperties = {} as NodeData['nodeProps'];
  for (const [clsName, clsProps] of requiredProps.entries()) {
    for (const clsProp of clsProps) {
      let value;
      if (clsName.endsWith('/CreationInfo')) {
        if (clsProp.name === 'specVersion') {
          value = ontoStore.getState().ontologyMetadata?.specVersion;
          // } else if (clsProp.name === 'created') {
          //   value = dayjs.utc().format();
        }
      }
      const nodeProp = generateNodeProperty(clsProp, value);
      nodeProp.required = true;
      nodeProperties[nodeProp.id] = nodeProp;
    }
  }
  return nodeProperties;
}

export async function importExample() {
  const refPos = screenToCanvas(
    window.innerWidth / 2 - 128,
    window.innerHeight / 2 - 26
  );
  await importSpdxJsonLd('spdx-doc-example-13.json', refPos, false);
}

export function generateURN(): string {
  return `urn:nanoid:${nanoid()}`;
}

export const itemClass = `
  group
  text-sm text-spdx-dark rounded flex justify-between
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
