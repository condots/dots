import {
  useCallback,
  useRef,
  ChangeEvent,
  DragEvent,
  useMemo,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';

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
} from '@xyflow/react';

import { appStore } from '@/store/app';
import { getItem } from '@/store/onto';
import {
  addNode,
  deselectAll,
  flowStore,
  RFState,
  screenToCanvas,
} from '@/store/flow';
import { generateURN, importExample } from '@/scripts/app-utils';
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
import sLogo from '@/assets/s.svg';
import SBOM3DVisualization from './SBOM3DVisualization';

const Canvas = () => {
  const { nodes, edges } = flowStore(
    useShallow((state: RFState) => ({ nodes: state.nodes, edges: state.edges }))
  );
  const { setViewport, addEdges } = useReactFlow();
  const importJsonLdRef = useRef<HTMLInputElement>(null);

  const handleTransform = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
  }, [setViewport]);

  const onConnectEnd = useCallback<OnConnectEnd>(
    (event: MouseEvent | TouchEvent) => {
      const e = event as MouseEvent;
      const data = appStore.getState().draggedPropData;
      if (
        data &&
        !(getItem(data.classProperty.targetClass) as Class).abstract
      ) {
        const targetNodeId = addNode(
          generateURN(),
          data.classProperty.targetClass,
          screenToCanvas(e.clientX - 128, e.clientY - 40.5)
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
      appStore.setState(state => {
        state.draggedPropData = undefined;
        return state;
      });
    },
    [addEdges]
  );

  const handleImport = useCallback(
    (file: File | undefined, refPos: XYPosition = { x: 0, y: 0 }) => {
      if (file) {
        importSpdxJsonLd(file, refPos);
      }
    },
    []
  );

  const handleImportFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const refPos = screenToCanvas(
        window.innerWidth / 2 - 128,
        window.innerHeight / 2 - 40.5
      );
      handleImport(file, refPos);
      e.target.value = '';
    },
    [handleImport]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      const refPos = screenToCanvas(e.clientX - 128, e.clientY - 40.5);
      handleImport(file, refPos);
    },
    [handleImport]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const memoizedReactFlowProps = useMemo(
    () => ({
      proOptions: { hideAttribution: true },
      nodeTypes,
      edgeTypes,
      nodes,
      edges,
      defaultEdgeOptions,
      connectionLineComponent: ConnectionLine,
      connectionLineStyle,
      onNodesChange: flowStore.getState().onNodesChange,
      connectionMode: ConnectionMode.Loose,
      onEdgesChange: flowStore.getState().onEdgesChange,
      onNodeDragStart: flowStore.getState().onNodeDragStart,
      onNodeDragStop: flowStore.getState().onNodeDragStop,
      onConnect: flowStore.getState().onConnect,
      onInit: flowStore.getState().onInit,
      zoomOnPinch: false,
      zoomOnDoubleClick: false,
      zoomActivationKeyCode: null,
      onSelectionChange: flowStore.getState().onSelectionChange,
      elevateEdgesOnSelect: true,
      snapToGrid: true,
      snapGrid,
      onNodesDelete: flowStore.getState().onNodesDelete,
      minZoom: 0.05,
    }),
    [nodes, edges]
  );

  const MemoizedControls = useMemo(
    () => (
      <Controls
        position="top-left"
        showZoom={false}
        showInteractive={false}
        fitViewOptions={{ duration: 200 }}
      >
        <ControlButton
          onClick={handleTransform}
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
          onClick={() => {
            appStore.setState(state => {
              state.showHelpDialog = true;
              return state;
            });
          }}
          title="help"
          className="text-black"
        >
          <span className="material-symbols-outlined text-lg">help</span>
        </ControlButton>
        <ControlButton
          onClick={() => importExample()}
          title="load example"
          className="text-black"
        >
          <span className="material-symbols-outlined text-xl">
            receipt_long
          </span>
        </ControlButton>
        <ControlButton
          onClick={() => {
            appStore.setState(state => {
              state.showAboutDialog = true;
              return state;
            });
          }}
          title="about dots"
        >
          <img src={sLogo} alt="SPDX Logo" />
        </ControlButton>
      </Controls>
    ),
    [handleTransform]
  );

  const MemoizedPanel = useMemo(
    () => (
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
    ),
    []
  );

  const [use3D, setUse3D] = useState(false);

  return (
    <>
      <button onClick={() => setUse3D(!use3D)}>
        Toggle {use3D ? '2D' : '3D'} View
      </button>
      {use3D ? (
        <SBOM3DVisualization nodes={nodes} edges={edges} />
      ) : (
        <ReactFlow
          {...memoizedReactFlowProps}
          onConnectEnd={onConnectEnd}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Background color="#00416b" variant={BackgroundVariant.Dots} />
          {MemoizedControls}
          {MemoizedPanel}
          <DraggedClass />
          <input
            ref={importJsonLdRef}
            type="file"
            accept=".jsonld,.json-ld,.json"
            onChange={handleImportFile}
            hidden
          />
        </ReactFlow>
      )}
    </>
  );
};

export default Canvas;
