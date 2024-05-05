import { useRef, useState, useCallback } from "react";
import { Background, Controls, ReactFlow } from "reactflow";
import DevTools from "@/components/DevTools";

import { tracked, actions } from "@/store/global";

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function SbomEditor() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const iri = event.dataTransfer.getData("application/reactflow");
      if (typeof iri === "undefined" || !iri) {
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const node = {
        id: getId(),
        type: "element",
        position,
        data: { label: iri, iri, flowElement: true },
      };

      actions.flow.addNode(node);
    },
    [reactFlowInstance]
  );

  return (
    <div ref={reactFlowWrapper} className="h-full bg-primary-800">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodes={tracked().flow.nodes()}
        nodeTypes={tracked().flow.nodeTypes()}
        onNodesChange={actions.flow.onNodesChange}
        nodeOrigin={[0.5, 0.5]}
        edges={tracked().flow.edges()}
        edgeTypes={tracked().flow.edgeTypes()}
        onEdgesChange={actions.flow.onEdgesChange}
        onConnect={actions.flow.onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineType={tracked().flow.connectionLineType()}
        defaultEdgeOptions={tracked().flow.defaultEdgeOptions()}
        // connectionLineComponent={FloatingConnectionLine}
        fitView
        fitViewOptions={{ padding: 1 }}
        connectionMode={tracked().flow.connectionMode()}
      >
        <Background />
        <Controls />
        <DevTools />
      </ReactFlow>
    </div>
  );
}
