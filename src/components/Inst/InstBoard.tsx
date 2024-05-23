import { useCallback } from "react";
import { flowStore, addNode, NodeData } from "@/store/flow";
import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  DefaultEdgeOptions,
  EdgeTypes,
  MarkerType,
  NodeOrigin,
  NodeTypes,
  ReactFlow,
} from "reactflow";

import InstNode from "@/components/Inst/InstNode";
import InstEdge from "@/components/Inst/InstEdge";

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
  // #528cc1
  return (
    <div className="bg-[#3a5b87] h-full w-full">
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
        fitViewOptions={{ padding: 1 }}
        connectionMode={connectionMode}
      >
        {/* <DevTools /> */}
        <Background />
        <Controls position="bottom-right">
          <ControlButton
            onClick={() => flowStore.getState().reset()}
            title="clear"
            aria-label="clear"
            className="text-black"
          >
            <div className="pi pi-eraser" />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
}
