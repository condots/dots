import { useCallback, useRef, ChangeEvent, DragEvent } from 'react';

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ControlButton,
  Controls,
  OnConnectEnd,
  Panel,
  ReactFlow,
  XYPosition,
  useReactFlow,
} from 'reactflow';

import { appStore } from '@/store/app';
import { getItem } from '@/store/onto';
import { addNode, deselectAll, flowStore, screenToCanvas } from '@/store/flow';
import { generateURN } from '@/scripts/app-utils';
import DraggedClass from '@/components/node/DraggedClass';
import ConnectionLine from '@/components/edge/ConnectionLine';

import {
  nodeTypes,
  edgeTypes,
  connectionLineStyle,
  defaultEdgeOptions,
  snapGrid,
} from '@/scripts/canvas-defaults';
import { importSpdxJsonLd } from '@/scripts/fs-utils';
import { Class } from '@/types';

const Canvas = () => {
  const nodes = flowStore.use.nodes();
  const edges = flowStore.use.edges();
  const { setViewport, addEdges } = useReactFlow();
  const importJsonLdRef = useRef<HTMLInputElement>(null);

  const handleTransform = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
  }, [setViewport]);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const e = event as MouseEvent;
      const data = appStore.getState().draggedPropData;
      if (
        data &&
        !(getItem(data.classProperty.targetClass) as Class).abstract
      ) {
        const targetNodeId = addNode(
          'inst',
          generateURN(),
          data.classProperty.targetClass,
          screenToCanvas(e.clientX - 128, e.clientY - 26)
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

  const handleImport = (
    file: File | undefined,
    refPos: XYPosition = { x: 0, y: 0 }
  ) => {
    if (file) {
      importSpdxJsonLd(file, refPos);
    }
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const refPos = screenToCanvas(
      window.innerWidth / 2 - 128,
      window.innerHeight / 2 - 26
    );
    handleImport(file, refPos);
    e.target.value = '';
  };

  const handleImportExample = () => {
    const refPos = screenToCanvas(
      window.innerWidth / 2 - 128,
      window.innerHeight / 2 - 26
    );
    importSpdxJsonLd('spdx-doc-example-13.json', refPos, false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    const refPos = screenToCanvas(e.clientX - 128, e.clientY - 26);
    handleImport(file, refPos);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleShowHelp = () => {
    appStore.setState(state => {
      state.showHelpDialog = true;
    });
  };

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
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      zoomActivationKeyCode={null}
      onSelectionChange={flowStore.getState().onSelectionChange}
      elevateEdgesOnSelect={true}
      snapToGrid={true}
      snapGrid={snapGrid}
      onNodesDelete={flowStore.getState().onNodesDelete}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* <DevTools /> */}
      <Background color="#00416b" variant={BackgroundVariant.Dots} />
      <Controls
        position="top-left"
        showZoom={false}
        showInteractive={false}
        fitViewOptions={{ duration: 200 }}
      >
        <ControlButton
          onClick={() => handleTransform()}
          title="recenter"
          className="text-black"
        >
          <span className="material-symbols-outlined text-base">recenter</span>
        </ControlButton>
        <ControlButton
          onClick={() => flowStore.getState().reset()}
          title="clear canvas"
          className="text-black"
        >
          <span className="material-symbols-outlined text-base">
            ink_eraser
          </span>
        </ControlButton>
        <ControlButton
          onClick={() => importJsonLdRef.current?.click()}
          title="upload spdx document"
          className="text-black"
        >
          <span className="material-symbols-outlined text-xl">upload</span>
        </ControlButton>
        <ControlButton
          onClick={() => handleImportExample()}
          title="load example"
          className="text-black"
        >
          <span className="material-symbols-outlined text-xl">
            receipt_long
          </span>
        </ControlButton>
        <ControlButton
          onClick={() => handleShowHelp()}
          title="help"
          className="text-black"
        >
          <span className="material-symbols-outlined text-lg">help</span>
        </ControlButton>
      </Controls>
      <Panel position="top-right" className="drop-shadow">
        <ControlButton
          onClick={() => {
            deselectAll();
            appStore.setState({ showClassesMenu: true });
          }}
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
      <input
        ref={importJsonLdRef}
        type="file"
        accept="application/ld+json, application/json"
        onChange={handleImportFile}
        hidden
      />
    </ReactFlow>
  );
};

export default Canvas;
