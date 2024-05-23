import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import moment from "moment";
import { isIri } from "@hyperjump/uri";
import createSelectors from "@/scripts/createSelectors";
import { getItem } from "@/store/onto";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionLineType,
  ConnectionMode,
} from "reactflow";
import type {
  NodeTypes,
  EdgeTypes,
  DefaultEdgeOptions,
  OnNodesDelete,
  OnEdgesDelete,
  ReactFlowInstance,
  OnInit,
} from "reactflow";
import { Property } from "@/scripts/onto-utils";

export type PropertyData = {
  id: string;
  iri: string;
  name: string;
  datatype: string;
  value: string | boolean | number;
  valid: boolean;
};

export type NodeData = {
  iri: string;
  isNode: boolean;
  properties: Record<string, PropertyData>;
};

export interface Datatype {
  icon: string;
  kind: string;
  validator: (v) => boolean;
  mask?: string;
  slotChar?: string;
}

export const datatypes = new Map<string, Datatype>();
datatypes.set("string", {
  icon: "text_fields",
  kind: "text",
  validator: (v: string) => typeof v === "string" && v.length > 0,
});
datatypes.set("anyURI", {
  icon: "link",
  kind: "text",
  validator: (v: string) => isIri(v),
});
datatypes.set("dateTimeStamp", {
  icon: "schedule",
  kind: "text",
  validator: (v: string) => moment(v, "YYYY-MM-DDTHH:mm:ssZ", true).isValid(),
  mask: "9999-99-99T99:99:99Z",
  slotChar: "YYYY-MM-DDTHH:mm:ssZ",
});
datatypes.set("decimal", {
  icon: "numbers",
  kind: "number",
  validator: (v: number) => typeof v === "number",
});
datatypes.set("positiveInteger", {
  icon: "numbers",
  kind: "number",
  validator: (v: number) => Number.isInteger(v) && v > 0,
});
datatypes.set("nonNegativeInteger", {
  icon: "numbers",
  kind: "number",
  validator: (v: number) => Number.isInteger(v) && v >= 0,
});
datatypes.set("boolean", {
  icon: "toggle_off",
  kind: "boolean",
  validator: (v: number) => typeof v === "boolean",
});
datatypes.set("default", {
  icon: "web_asset",
  kind: "text",
  validator: () => false,
});

type DevtoolsActive = {
  nodeInspector: boolean;
  changeLogger: boolean;
  viewportLogger: boolean;
};

type RFState = {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  devtoolsActive: DevtoolsActive;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodesDelete: OnNodesDelete;
  onEdgesDelete: OnEdgesDelete;
  onConnect: OnConnect;
  onInit: OnInit;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setDevtoolsActive: (name: keyof DevtoolsActive) => void;
  reset: () => void;
};

const initialState = {
  nodes: [],
  edges: [],
  reactFlowInstance: null,
  devtoolsActive: {
    nodeInspector: false,
    changeLogger: false,
    viewportLogger: false,
  },
};

const flowStoreBase = create<RFState>()(
  immer(
    devtools(
      persist(
        (set, get) => ({
          ...initialState,
          onNodesChange: (changes: NodeChange[]) => {
            set({
              nodes: applyNodeChanges(changes, get().nodes),
            });
          },
          onEdgesChange: (changes: EdgeChange[]) => {
            set({
              edges: applyEdgeChanges(changes, get().edges),
            });
          },
          onNodesDelete: (nodes: Node[]) => {},
          onEdgesDelete: (edges: Edge[]) => {},
          onConnect: (connection: Connection) => {
            set({
              edges: addEdge(connection, get().edges),
            });
          },
          onInit: (reactFlowInstance: ReactFlowInstance) => {
            set({ reactFlowInstance });
          },
          setNodes: (nodes: Node[]) => {
            set({ nodes });
          },
          setEdges: (edges: Edge[]) => {
            set({ edges });
          },
          setDevtoolsActive: (name: keyof DevtoolsActive) =>
            set((state) => {
              state.devtoolsActive[name] = !state.devtoolsActive[name];
            }),
          reset: () => set({ nodes: [], edges: [] }),
        }),
        {
          name: "flow",
        },
      ),
    ),
  ),
);

export const flowStore = createSelectors(flowStoreBase);

export const getNode = (nodeId: string | null): Node | undefined => {
  return flowStore.use.nodes().find((n) => n.id === nodeId);
};

export const getProperties = (
  nodeId: string | null,
): Record<string, PropertyData> | undefined => {
  return getNode(nodeId)?.data.properties;
};

export const getProperty = (
  nodeId: string,
  propertyId: string,
): PropertyData | undefined => {
  const properties = getProperties(nodeId);
  return properties && properties[propertyId];
};

export const addNode = (type: string, x: number, y: number, data: object) => {
  const nodeId = nanoid();
  const flowInst = flowStore.getState().reactFlowInstance;
  const position = flowInst!.screenToFlowPosition({ x, y });
  const node: Node = { id: nodeId, position, data, type };
  flowStore.setState((state) => {
    state.nodes.push(node);
  });
  return nodeId;
};

export const addProperty = (nodeId: string, propertyIRI: string) => {
  const propertyId = nanoid();
  const propertyComponent = getItem(propertyIRI);
  const isBool = propertyComponent!.datatype === "boolean";
  const propertyData: PropertyData = {
    id: propertyId,
    iri: propertyIRI,
    name: propertyComponent.name,
    datatype: propertyComponent.datatype,
    value: isBool ? false : "",
    valid: isBool,
  };
  updateProperty(nodeId, propertyData);
  return propertyId;
};

export const updateProperty = (nodeId: string, propertyData: PropertyData) => {
  flowStore.setState((state) => {
    const node = state.nodes.find((n) => n.id === nodeId);
    const propertyId = propertyData.id;
    node.data.properties[propertyId] = propertyData;
  });
};

export const removeProperty = (nodeId: string, propertyId: string) => {
  flowStore.setState((state) => {
    const node = state.nodes.find((n) => n.id === nodeId);
    delete node.data.properties[propertyId];
  });
};

export const datatypeIcon = (property: Property) => {
  if (property.datatype) {
    return datatypes.get(property.datatype)?.icon ?? "web_asset";
  } else {
    return datatypes.get("default").icon;
  }
};

export const validProperty = (nodeId: string, propertyId: string) => {
  const propertyData = getProperty(nodeId, propertyId);
  const value = propertyData!.value;
  const validator = datatypes.get(propertyData!.datatype)?.validator;
  return validator ? validator(value) : false;
};
