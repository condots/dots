import { Node } from "reactflow";

namespace types {
  export interface SharedFields {
    iri: IRI;
    name: Name;
    profileName: Name;
    summary: string;
    description?: string;
  }

  export interface EnrichedProfile
    extends Profile,
      Omit<SharedFields, "profile"> {}

  export interface Profile {
    classes: Classes;
    properties: Properties;
    vocabularies: Vocabularies;
    individuals: Individuals;
  }

  export type LiteralPropertyTypes =
    | "anyURI"
    | "boolean"
    | "dateTimeStamp"
    | "decimal"
    | "nonNegativeInteger"
    | "positiveInteger"
    | "string"
    | "SemVer"
    | "MediaType";

  export type nodeKindTypes = "Literal" | "IRI" | "BlankNodeOrIRI";
  export interface ClassProperty {
    parentClass: Name;
    path: IRI;
    name: Name;
    required: boolean;
    minCount?: number;
    maxCount?: number;
    nodeKind: nodeKindTypes;
    datatype: this["nodeKind"] extends "Literal" ? LiteralPropertyTypes : never;
    targetClass: this["nodeKind"] extends "BlankNodeOrIRI" ? IRI : never;
    options: this["nodeKind"] extends "IRI" ? PropertyOption[] : never;
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
  export type VocabularyEntry = Omit<SharedFields, "description">;

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
    isNode: boolean;
    active: boolean;
    cls: Class;
    properties: Record<string, NodeProperty>;
  };

  export type FlowNode = Node<NodeData>;

  export type NodeProperties = Record<string, NodeProperty>;

  export type InputProperties = Map<LiteralPropertyTypes, InputProperty>;

  export type RecursiveClassProperties = Map<string, ClassProperties>;

  export type RecursiveNodeProperties = Map<string, ClassProperties>;

  export interface InputProperty {
    icon: string;
    inputKind: "string" | "number" | "boolean";
    validator: (v) => boolean;
    mask?: string;
    slotChar?: string;
  }
}

export default types;
