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
  OnConnectEnd,
  Panel,
  ReactFlow,
  useReactFlow,
} from 'reactflow';
import { nanoid } from 'nanoid';

import { appStore } from '@/store/app';
import { getItem } from '@/store/onto';
import { addNode, flowStore, isValidConnection } from '@/store/flow';
import ClassNode from '@/components/node/ClassNode';
import PropertyEdge from '@/components/edge/PropertyEdge';
import DraggedClass from '@/components/node/DraggedClass';
import ConnectionLine from '@/components/edge/ConnectionLine';

const nodeTypes = {
  inst: ClassNode,
} satisfies NodeTypes;

const edgeTypes = {
  inst: PropertyEdge,
} satisfies EdgeTypes;

const connectionLineStyle = {
  strokeWidth: 4,
  stroke: '#00416b',
  strokeDasharray: 7,
};

const defaultEdgeOptions = {
  type: 'inst',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    strokeWidth: connectionLineStyle.strokeWidth,
    width: 20,
    height: 20,
    color: connectionLineStyle.stroke,
  },
  style: { stroke: connectionLineStyle.stroke },
  data: {},
} satisfies DefaultEdgeOptions;

const Canvas = () => {
  const nodes = flowStore.use.nodes();
  const edges = flowStore.use.edges();
  const { setViewport, addEdges } = useReactFlow();

  const handleTransform = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
  }, [setViewport]);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const e = event as MouseEvent;
      const data = appStore.getState().draggedPropData;
      if (data && !getItem(data.classProperty.targetClass)!.abstract) {
        const targetNodeId = addNode(
          'inst',
          e.clientX - 128,
          e.clientY - 26,
          data.classProperty.targetClass
        );
        addEdges([
          {
            id: nanoid(),
            source: data.sourceNodeId,
            target: targetNodeId,
            data: { classProperty: data.classProperty },
            label: data?.classProperty.name,
            // animated: true,
          },
        ]);
      }
      appStore.setState(state => (state.draggedPropData = undefined));
    },
    [addEdges]
  );

  return (
    <ReactFlow
      proOptions={{ hideAttribution: true }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      edges={edges}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineComponent={ConnectionLine}
      connectionLineStyle={connectionLineStyle}
      onNodesChange={flowStore.getState().onNodesChange}
      connectionMode={ConnectionMode.Loose}
      onEdgesChange={flowStore.getState().onEdgesChange}
      onNodeDragStart={flowStore.getState().onNodeDragStart}
      onNodeDragStop={flowStore.getState().onNodeDragStop}
      onConnect={flowStore.getState().onConnect}
      onInit={flowStore.getState().onInit}
      isValidConnection={isValidConnection}
      fitViewOptions={{ padding: 2 }}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      zoomActivationKeyCode={null}
      disableKeyboardA11y
      onConnectEnd={onConnectEnd}
    >
      {/* <DevTools /> */}
      <Background color="#00416b" variant={BackgroundVariant.Dots} />
      <Controls position="bottom-left" showZoom={false} showInteractive={false}>
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
      <DraggedClass />
    </ReactFlow>
  );
};

export default Canvas;
