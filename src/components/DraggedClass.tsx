import React, { useState, useRef, useEffect } from 'react';

import { appStore } from '@/store/app';
import { parseIRI } from '@/scripts/app-utils';
import { addNode } from '@/store/flow';
import { nanoid } from 'nanoid';
import { useReactFlow } from 'reactflow';

const DraggedClass = () => {
  const data = appStore.use.draggedCls();
  const { addEdges } = useReactFlow();

  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({});
  const [offset, setOffset] = useState({});
  const draggableRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = e => {
      if (dragging) {
        setPosition({
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        });
      }
    };

    const handleMouseUp = e => {
      if (dragging) {
        const targetNodeId = addNode(
          'inst',
          e.clientX - 128,
          e.clientY - 26,
          data!.targetClass
        );

        if (data?.sourceNodeId) {
          const newEdge = [
            {
              id: nanoid(),
              source: data.sourceNodeId,
              target: targetNodeId,
              data: { classProperty: data.classProperty },
            },
          ];
          addEdges(newEdge);
        }
      }
      setDragging(false);
      setOffset({});
      setPosition({});
      setDragging(false);
      appStore.setState(state => (state.draggedCls = undefined));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, data, offset, position, addEdges]);

  useEffect(() => {
    if (draggableRef.current && data) {
      const rect = draggableRef.current.getBoundingClientRect();
      setOffset({ x: rect.width / 2, y: rect.height / 2 });
      setPosition({
        x: data.clientX - rect.width / 2,
        y: data.clientY - rect.height / 2,
      });
      setDragging(true);
    }
  }, [data]);

  return (
    data && (
      <div
        ref={draggableRef}
        className="rounded shadow-2 py-2 px-3 flex items-center justify-center 
                 outline outline-spdx-dark outline-2
                 text-spdx-dark bg-white text-center font-medium text-sm"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        {parseIRI(data!.targetClass).name}
      </div>
    )
  );
};

export default DraggedClass;
