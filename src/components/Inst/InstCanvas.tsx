import React, { useCallback } from 'react';
import { flowStore, addNode, isValidConnection } from '@/store/flow';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ControlButton,
  Controls,
  DefaultEdgeOptions,
  EdgeTypes,
  MarkerType,
  NodeTypes,
  Panel,
  ReactFlow,
} from 'reactflow';

import InstNode from '@/components/Inst/InstNode';
import InstEdge from '@/components/Inst/InstEdge';
import { appStore } from '@/store/app';

const nodeTypes = {
  inst: InstNode,
} satisfies NodeTypes;

const edgeTypes = {
  inst: InstEdge,
} satisfies EdgeTypes;

const defaultEdgeOptions = {
  type: 'inst',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    strokeWidth: 1,
    width: 20,
    height: 20,
    color: '#00416b',
  },
  style: { stroke: '#00416b' },
  data: {},
} satisfies DefaultEdgeOptions;

export default function InstCanvas() {
  const nodes = flowStore.use.nodes();
  const edges = flowStore.use.edges();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    console.log('drop');

    event.preventDefault();
    const iri = event.dataTransfer.getData('application/reactflow');
    if (typeof iri === 'undefined' || !iri) {
      return;
    }
    addNode('inst', event.clientX - 128, event.clientY - 28, iri);
  }, []);

  return (
    <ReactFlow
      proOptions={{ hideAttribution: true }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      edges={edges}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodesChange={flowStore.getState().onNodesChange}
      connectionMode={ConnectionMode.Loose}
      onEdgesChange={flowStore.getState().onEdgesChange}
      onNodeDragStart={flowStore.getState().onNodeDragStart}
      onNodeDragStop={flowStore.getState().onNodeDragStop}
      onConnect={flowStore.getState().onConnect}
      onInit={flowStore.getState().onInit}
      isValidConnection={isValidConnection}
      fitViewOptions={{ padding: 2 }}
      // fitView
      onDrop={onDrop}
      onDragOver={onDragOver}
      zoomOnScroll={false}
      disableKeyboardA11y
    >
      {/* <DevTools /> */}
      <Background color="#00416b" variant={BackgroundVariant.Dots} />
      <Controls position="bottom-left" showZoom={true} showInteractive={false}>
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
          {' '}
          <span className="material-icons-outlined text-black">menu</span>
        </button>
      </Panel>
    </ReactFlow>
  );
}
