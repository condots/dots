import React, { useCallback } from 'react';

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
  useReactFlow,
} from 'reactflow';

import { appStore } from '@/store/app';
import { flowStore, addNode, isValidConnection } from '@/store/flow';
import InstNode from '@/components/InstNode';
import InstEdge from '@/components/InstEdge';

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

const Canvas = () => {
  const nodes = flowStore.use.nodes();
  const edges = flowStore.use.edges();
  const { setViewport } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const iri = event.dataTransfer.getData('application/reactflow');
    if (!iri) {
      return;
    }
    addNode('inst', event.clientX - 128, event.clientY - 28, iri);

    appStore.setState({ showClassesMenu: false });
  }, []);

  const handleTransform = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
  }, [setViewport]);

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
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      zoomActivationKeyCode={null}
      disableKeyboardA11y
      preventScrolling={false}
    >
      {/* <DevTools /> */}
      <Background color="#00416b" variant={BackgroundVariant.Dots} />
      <Controls position="bottom-left" showZoom={true} showInteractive={false}>
        <ControlButton
          onClick={() => handleTransform()}
          title="recenter"
          className="text-black"
        >
          <span className="material-symbols-outlined text-base">recenter</span>
        </ControlButton>
        <ControlButton
          onClick={() => flowStore.getState().reset()}
          title="clear"
          className="text-black"
        >
          <span className="material-symbols-outlined text-base">
            ink_eraser
          </span>
        </ControlButton>
      </Controls>
      <Panel position="top-left" className="shadow-sm shadow-gray-300">
        <ControlButton
          onClick={() => appStore.setState({ showClassesMenu: true })}
          title="menu"
          className="text-black rounded-xs"
        >
          <div className="pi pi-bars" />
        </ControlButton>
      </Panel>
    </ReactFlow>
  );
};

export default Canvas;
