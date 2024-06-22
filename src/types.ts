import { Node } from 'reactflow';

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
}

export interface Class extends SharedFields {
  abstract?: boolean;
  subClassOf?: IRI;
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
};

export type NodeData = {
  startAsDragged: boolean;
  isNode: boolean;
  active: boolean;
  menuOpen: boolean;
  expanded: boolean;
  cls: Class;
  nodeProps: Record<string, NodeProperty>;
};

export type FlowNode = Node<NodeData>;

export type InputProperties = Map<LiteralPropertyTypes, InputProperty>;

export type RecClsProps = Map<string, ClassProperties>;

export interface InputProperty {
  icon: string;
  helpText?: string;
  validator?: (v) => boolean;
  inputType?: 'text' | 'number';
  mask?: string;
  slotChar?: string;
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}
