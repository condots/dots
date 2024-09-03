import { Node, XYPosition } from 'reactflow';

export interface SharedFields {
  iri: IRI;
  name: Name;
  profileName: Name;
  summary: string;
  description?: string;
}

export interface EnrichedProfile
  extends Profile,
    Omit<SharedFields, 'profile'> {}

export interface ModelProfile
  extends EnrichedProfile,
    Omit<SharedFields, 'profileName'> {}

export interface Profile {
  classes: Classes;
  properties: Properties;
  vocabularies: Vocabularies;
  individuals: Individuals;
}

export type LiteralPropertyTypes =
  | 'anyURI'
  | 'boolean'
  | 'dateTimeStamp'
  | 'decimal'
  | 'nonNegativeInteger'
  | 'positiveInteger'
  | 'string'
  | 'SemVer'
  | 'MediaType';

export type nodeKindTypes = 'Literal' | 'IRI' | 'BlankNodeOrIRI';
export interface ClassProperty {
  parentClass: Name;
  path: IRI;
  name: Name;
  minCount?: number;
  maxCount?: number;
  nodeKind: nodeKindTypes;
  datatype: this['nodeKind'] extends 'Literal' ? LiteralPropertyTypes : never;
  targetClass: this['nodeKind'] extends 'BlankNodeOrIRI' ? IRI : never;
  options: this['nodeKind'] extends 'IRI' ? PropertyOption[] : never;
  pattern?: string;
}

export interface Class extends SharedFields {
  abstract?: boolean;
  subClassOf?: IRI;
  nodeKind?: nodeKindTypes;
  properties: ClassProperties;
}

export interface Property extends SharedFields {
  datatype?: LiteralPropertyTypes;
  range?: IRI;
}

export interface Vocabulary extends SharedFields {
  entries: VocabularyEntries;
}

export interface Individual extends SharedFields {
  range: IRI;
}

export interface PropertyOption {
  label: string;
  value: string;
}

export type ClassProperties = Record<string, ClassProperty>;
export type VocabularyEntries = Record<Name, VocabularyEntry>;
export type VocabularyEntry = Omit<SharedFields, 'description'>;

export type EnrichedProfiles = Record<Name, EnrichedProfile>;
export type Profiles = Record<Name, Profile>;
export type Classes = Record<Name, Class>;
export type Properties = Record<Name, Property>;
export type Vocabularies = Record<Name, Vocabulary>;
export type Individuals = Record<Name, Individual>;

export type Section = Classes | Properties | Vocabularies | Individuals;
export type Item = Class | Property | Vocabulary | Individual;
export type IRI = string;
export type Name = string;

export type NodeProperty = {
  id: string;
  classProperty: ClassProperty;
  value: string | number | boolean | undefined;
  valid: boolean;
  required: boolean;
};

export type NodeData = {
  active: boolean;
  expanded: boolean;
  isElement: boolean;
  cls: Class;
  inheritanceList: string[];
  nodeProps: Record<string, NodeProperty>;
  recClsProps: Map<string, ClassProperties>;
  hiddenNodes: string[];
  initialHidePosition?: XYPosition;
};

export type ClsPropMin = Record<string, number>;

export type FlowNode = Node<NodeData>;

export type InputProperties = Map<LiteralPropertyTypes, InputProperty>;

export interface InputProperty {
  icon: string;
  helpText?: string;
  validator?: (v: string) => boolean;
  inputType?: 'text' | 'number' | 'url' | 'datetime-local';
  mask?: string;
  slotChar?: string;
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface DraggedClassData {
  clientX: number;
  clientY: number;
  targetClass: IRI;
  sourceNodeId?: string;
  classProperty?: ClassProperty;
}

export interface DraggedPropData {
  classProperty: ClassProperty;
  sourceNodeId: string;
}

export type OntologyMetadata = Record<string, string>;
// export interface OntologyMetadata {
//   [x: string]: string;
// }

export interface AlertMessage {
  title: string;
  description?: string;
}

export type DevtoolsActive = {
  nodeInspector: boolean;
  changeLogger: boolean;
  viewportLogger: boolean;
};
