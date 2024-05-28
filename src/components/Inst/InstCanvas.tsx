import { useCallback } from "react";
import { flowStore, addNode, isValidConnection } from "@/store/flow";
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
  data: {},
} satisfies DefaultEdgeOptions;

export default function InstCanvas() {
  const nodes = flowStore.use.nodes();
  const edges = flowStore.use.edges();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const iri = event.dataTransfer.getData("application/reactflow");
    if (typeof iri === "undefined" || !iri) {
      return;
    }
    addNode("inst", event.clientX, event.clientY, iri);
  }, []);

  return (
    <ReactFlow
      proOptions={{ hideAttribution: true }}
      nodeOrigin={[0.5, 0.5]}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={flowStore.getState().onNodesChange}
      onEdgesChange={flowStore.getState().onEdgesChange}
      onNodeDragStart={flowStore.getState().onNodeDragStart}
      onNodeDragStop={flowStore.getState().onNodeDragStop}
      onConnect={flowStore.getState().onConnect}
      onInit={flowStore.getState().onInit}
      isValidConnection={isValidConnection}
      fitView
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
      <Controls position="bottom-left" showZoom={false} showInteractive={false}>
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
  );
}
