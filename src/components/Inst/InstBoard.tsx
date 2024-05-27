import { useCallback } from "react";
import { flowStore, addNode, NodeData } from "@/store/flow";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  DefaultEdgeOptions,
  EdgeTypes,
  MarkerType,
  NodeTypes,
  Panel,
  ReactFlow,
} from "reactflow";

import InstNode from "@/components/Inst/InstNode";
import InstEdge from "@/components/Inst/InstEdge";
import { appStore } from "@/store/app";
import { Class } from "@/scripts/onto-utils";
import { getItem } from "@/store/onto";

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
    strokeWidth: 1,
    width: 20,
    height: 20,
    color: "#00416b",
  },
  style: { stroke: "#00416b", strokeWidth: 1, boxShadow: "0 0 5px #00416b" },
  data: {},
} satisfies DefaultEdgeOptions;

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
    addNode("inst", event.clientX, event.clientY, iri);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#fafafa]">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodeOrigin={[0.5, 0.5]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={flowStore.use.nodes()}
        edges={flowStore.use.edges()}
        onNodesChange={flowStore.use.onNodesChange()}
        onEdgesChange={flowStore.use.onEdgesChange()}
        onNodesDelete={flowStore.use.onNodesDelete()}
        onEdgesDelete={flowStore.use.onEdgesDelete()}
        onNodeDragStart={flowStore.use.onNodeDragStart()}
        onNodeDragStop={flowStore.use.onNodeDragStop()}
        onConnect={flowStore.use.onConnect()}
        fitView
        onInit={flowStore.use.onInit()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionRadius={40}
        defaultEdgeOptions={defaultEdgeOptions}
        fitViewOptions={{ padding: 2 }}
        connectionMode={ConnectionMode.Loose}
      >
        {/* <DevTools /> */}
        <Background color="#00416b" variant={BackgroundVariant.Dots} />
        <Controls
          position="bottom-left"
          showZoom={false}
          showInteractive={false}
        >
          <ControlButton
            onClick={() => flowStore.getState().reset()}
            title="clear"
            aria-label="clear"
            className="text-black"
          >
            <div className="pi pi-eraser" />
          </ControlButton>
        </Controls>
        <Panel position="top-left">
          <button onClick={() => appStore.setState({ showClassesMenu: true })}>
            {" "}
            <span className="material-icons-outlined text-black">menu</span>
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
