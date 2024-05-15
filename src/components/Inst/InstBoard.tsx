import { useCallback, useEffect } from "react";
import { flowStore, addNode, PropertyData, NodeData } from "@/store/flow";
import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  DefaultEdgeOptions,
  EdgeTypes,
  MarkerType,
  NodeOrigin,
  NodeTypes,
  Panel,
  ReactFlow,
} from "reactflow";

import InstNode from "@/components/Inst/InstNode";
import InstEdge from "@/components/Inst/InstEdge";
import { Button } from "primereact/button";

const nodeTypes = {
  inst: InstNode,
} satisfies NodeTypes;

const edgeTypes = {
  inst: InstEdge,
} satisfies EdgeTypes;

const defaultEdgeOptions = {
  type: "inst",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    strokeWidth: 2,
    width: 30,
    height: 30,
  },
  data: {},
} satisfies DefaultEdgeOptions;

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineType = ConnectionLineType.SmoothStep;
const connectionMode = ConnectionMode.Loose;

export default function InstBoard() {
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const iri = event.dataTransfer.getData("application/reactflow");
    if (typeof iri === "undefined" || !iri) {
      return;
    }
    const data: NodeData = {
      iri: iri,
      isNode: true,
      properties: {},
    };
    addNode("inst", event.clientX, event.clientY, data);
  }, []);

  return (
    <div className="bg-primary-800 h-full w-full">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodeOrigin={nodeOrigin}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={flowStore.use.nodes()}
        edges={flowStore.use.edges()}
        onNodesChange={flowStore.use.onNodesChange()}
        onEdgesChange={flowStore.use.onEdgesChange()}
        onNodesDelete={flowStore.use.onNodesDelete()}
        onEdgesDelete={flowStore.use.onEdgesDelete()}
        onConnect={flowStore.use.onConnect()}
        fitView
        onInit={flowStore.use.onInit()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineType={connectionLineType}
        defaultEdgeOptions={defaultEdgeOptions}
        // connectionLineComponent={FloatingConnectionLine}
        fitViewOptions={{ padding: 1 }}
        connectionMode={connectionMode}
      >
        {/* <DevTools /> */}
        <Panel className="space-x-4" position="top-right">
          <Button
            className="px-2 py-1 shadow"
            onClick={() => flowStore.getState().reset()}
          >
            Clear
          </Button>
        </Panel>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
