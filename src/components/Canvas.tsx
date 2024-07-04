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

import { appStore } from '@/store/app';
import { getItem } from '@/store/onto';
import { addNode, flowStore } from '@/store/flow';
import ClassNode from '@/components/node/ClassNode';
import Origin from '@/components/Origin';
import PropertyEdge from '@/components/edge/PropertyEdge';
import DraggedClass from '@/components/node/DraggedClass';
import ConnectionLine from '@/components/edge/ConnectionLine';
import { generateURN } from '@/scripts/app-utils';

const nodeTypes = {
  inst: ClassNode,
  origin: Origin,
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
    strokeWidth: 2,
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
            id: generateURN(),
            source: data.sourceNodeId,
            target: targetNodeId,
            data: { classProperty: data.classProperty },
            label: data?.classProperty.name,
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
      onConnectEnd={onConnectEnd}
      onInit={flowStore.getState().onInit}
      fitViewOptions={{ padding: 2 }}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      zoomActivationKeyCode={null}
      onSelectionChange={flowStore.getState().onSelectionChange}
      elevateEdgesOnSelect={true}
      snapToGrid={true}
      snapGrid={[260, 82]}
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
      <Panel position="top-left" className="drop-shadow">
        <ControlButton
          onClick={() => appStore.setState({ showClassesMenu: true })}
          title="menu"
          className="bg-transparent"
        >
          <span
            className="material-symbols-outlined rounded-sm bg-spdx-dark hover:bg-[#005a96] text-white"
            style={{
              fontVariationSettings: `
              'FILL' 0,
              'wght' 300,
              'GRAD' 0,
              'opsz' 24
              `,
            }}
          >
            menu
          </span>
        </ControlButton>
      </Panel>
      <Panel position="top-right" className="drop-shadow">
        <ControlButton
          onClick={() => appStore.setState({ showClassesMenu: true })}
          title="profiles"
          className="bg-transparent"
        >
          <span
            className="material-symbols-outlined rounded-sm bg-spdx-dark hover:bg-[#005a96] text-white"
            style={{
              fontVariationSettings: `
              'FILL' 0,
              'wght' 400,
              'GRAD' 0,
              'opsz' 24
              `,
            }}
          >
            keyboard_arrow_left
          </span>
        </ControlButton>
      </Panel>
      <DraggedClass />
    </ReactFlow>
  );
};

export default Canvas;
