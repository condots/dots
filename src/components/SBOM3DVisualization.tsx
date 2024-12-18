import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas as ThreeCanvas, useThree } from '@react-three/fiber';
import {
  Instance,
  Instances,
  OrbitControls,
  Text3D,
  Center,
  RoundedBox,
} from '@react-three/drei';
import * as THREE from 'three';
import { Edge } from '@xyflow/react';
import { FlowNode } from '@/types';

interface SBOM3DVisualizationProps {
  nodes: FlowNode[];
  edges: Edge[];
}

const TextLabel3D: React.FC<{
  position: [number, number, number];
  text: string;
  scale: number;
}> = ({ position, text, scale }) => {
  const textRef = useRef<THREE.Mesh>(null);

  return (
    <Center position={position} scale={[scale, scale, scale]}>
      <Text3D
        ref={textRef}
        font="/Lato_Regular.json"
        size={1.5}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.01}
        bevelOffset={0}
        bevelSegments={5}
      >
        {text}
        <meshStandardMaterial color="white" />
      </Text3D>
    </Center>
  );
};

const Edge3D: React.FC<{
  edge: Edge;
  nodes: FlowNode[];
  scaleFactor: number;
}> = ({ edge, nodes, scaleFactor }) => {
  const start = nodes.find(n => n.id === edge.source)?.position;
  const end = nodes.find(n => n.id === edge.target)?.position;

  if (!start || !end) return null;

  const points = useMemo(
    () => [
      new THREE.Vector3(start.x / 10, -start.y / 10, 0),
      new THREE.Vector3(end.x / 10, -end.y / 10, 0),
    ],
    [start, end]
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="black" linewidth={scaleFactor / 5} />
    </line>
  );
};

const FitView = ({ nodes }: { nodes: FlowNode[] }) => {
  const { camera, controls, size } = useThree();

  useEffect(() => {
    if (
      !controls ||
      nodes.length === 0 ||
      !(camera instanceof THREE.OrthographicCamera)
    )
      return;

    const box = new THREE.Box3();
    nodes.forEach(node => {
      box.expandByPoint(
        new THREE.Vector3(node.position.x / 10, -node.position.y / 10, 0)
      );
    });

    const center = box.getCenter(new THREE.Vector3());
    const boxSize = box.getSize(new THREE.Vector3());

    console.log('Bounding box:', { center, size: boxSize });

    const padding = 1.2;
    const aspect = size.width / size.height;

    let frustumSize;
    if (boxSize.x / boxSize.y > aspect) {
      // Graph is wider than the screen aspect ratio
      frustumSize = (boxSize.x * padding) / aspect;
    } else {
      // Graph is taller than the screen aspect ratio
      frustumSize = boxSize.y * padding;
    }

    camera.left = (-frustumSize * aspect) / 2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;

    camera.position.set(center.x, center.y, 1000);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.update();

    console.log('Camera settings:', {
      position: camera.position,
      left: camera.left,
      right: camera.right,
      top: camera.top,
      bottom: camera.bottom,
      aspect,
      frustumSize,
    });
  }, [nodes, camera, controls, size]);

  return null;
};

const SBOM3DVisualization: React.FC<SBOM3DVisualizationProps> = ({
  nodes,
  edges,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px' }}>
      <ThreeCanvas
        orthographic
        camera={{
          zoom: 1,
          position: [0, 0, 1000],
          near: 0.1,
          far: 2000,
          up: [0, 0, 1],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene nodes={nodes} edges={edges} />
      </ThreeCanvas>
    </div>
  );
};

const Scene: React.FC<SBOM3DVisualizationProps> = ({ nodes, edges }) => {
  const nodeScaleFactor = 8;
  const textScaleFactor = 1;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <directionalLight position={[0, 0, 5]} intensity={0.5} />
      {nodes.map(node => (
        <RoundedBox
          key={node.id}
          args={[
            3.2 * nodeScaleFactor,
            1 * nodeScaleFactor,
            1 * nodeScaleFactor,
          ]}
          radius={0.05 * nodeScaleFactor}
          smoothness={4}
          position={[node.position.x / 10, -node.position.y / 10, 0]}
          onClick={event => {
            event.stopPropagation();
            console.log('Clicked node:', node.data.cls.name);
          }}
          onPointerOver={event => {
            event.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={event => {
            document.body.style.cursor = 'auto';
          }}
        >
          <meshStandardMaterial color="royalblue" />
        </RoundedBox>
      ))}
      {nodes.map(node => (
        <TextLabel3D
          key={node.id}
          position={[
            node.position.x / 10,
            -node.position.y / 10,
            0.5 * nodeScaleFactor,
          ]}
          text={node.data.cls.name}
          scale={textScaleFactor}
        />
      ))}
      {edges.map(edge => (
        <Edge3D
          key={`${edge.source}-${edge.target}`}
          edge={edge}
          nodes={nodes}
          scaleFactor={nodeScaleFactor}
        />
      ))}
      <OrbitControls makeDefault />
      <FitView nodes={nodes} />
    </>
  );
};

export default SBOM3DVisualization;
