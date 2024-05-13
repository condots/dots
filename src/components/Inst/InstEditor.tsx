import { useRef, useState, useCallback } from "react";
import { flowStore, addNode } from "@/zustand/flow";
import { Background, Controls, ReactFlow } from "reactflow";
import DevTools from "@/components/Flow/DevTools";

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function InstEditor() {
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
        type: "inst",
        position,
        data: { label: iri, iri, inst: true, properties: {} },
      };
      addNode(node);
    },
    [reactFlowInstance],
  );

  return (
    <div ref={reactFlowWrapper} className="bg-primary-800 h-full">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodes={flowStore.use.nodes()}
        nodeTypes={flowStore.use.nodeTypes()}
        onNodesChange={flowStore.use.onNodesChange()}
        nodeOrigin={[0.5, 0.5]}
        edges={flowStore.use.edges()}
        edgeTypes={flowStore.use.edgeTypes()}
        onEdgesChange={flowStore.use.onEdgesChange()}
        onConnect={flowStore.use.onConnect()}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineType={flowStore.use.connectionLineType()}
        defaultEdgeOptions={flowStore.use.defaultEdgeOptions()}
        // connectionLineComponent={FloatingConnectionLine}
        fitView
        fitViewOptions={{ padding: 1 }}
        connectionMode={flowStore.use.connectionMode()}
      >
        <DevTools />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
