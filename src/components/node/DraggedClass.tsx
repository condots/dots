import React, { useState, useRef, useEffect } from 'react';

import { appStore } from '@/store/app';
import { parseIRI } from '@/scripts/app-utils';
import { addNode } from '@/store/flow';
import { ChevronDownIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';

const DraggedClass = () => {
  const data = appStore.use.draggedClassData();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({});
  const [offset, setOffset] = useState({});
  const draggableRef = useRef(null);

  useEffect(() => {
    if (!data) return;

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
        addNode('inst', e.clientX - 128, e.clientY - 26, data!.targetClass);
      }
      setDragging(false);
      setOffset({});
      setPosition({});
      appStore.setState(state => (state.draggedClassData = undefined));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, data, offset, position]);

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

  // return (
  //   data && (
  //     <div
  //       ref={draggableRef}
  //       className="rounded shadow-2 py-2 px-3 flex items-center justify-center
  //                outline outline-spdx-dark outline-2
  //                text-spdx-dark bg-white text-center font-medium text-sm"
  //       style={{
  //         position: 'absolute',
  //         left: `${position.x}px`,
  //         top: `${position.y}px`,
  //         cursor: dragging ? 'grabbing' : 'grab',
  //         userSelect: 'none',
  //       }}
  //     >
  //       {parseIRI(data!.targetClass).name}
  //     </div>
  //   )
  // );

  return (
    data && (
      <div
        ref={draggableRef}
        className="p-1 rounded"
        style={{
          position: 'absolute',
          left: `${position.x + 4}px`,
          top: `${position.y - 2}px`,
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div
          className="
          cursor-move rounded w-64 bg-white shadow-2 outline outline-spdx-dark outline-2 
          shadow-4 translate-y-[-1.5px] translate-x-[0.8px]
        "
        >
          <div className="flex items-center justify-between p-2 gap-[5px]">
            <div className="nodrag nopan outline-none p-1 rounded text-spdx-dark hover:bg-spdx-dark/5">
              <HamburgerMenuIcon />
            </div>
            <span className="text-spdx-dark text-md font-medium w-full text-center truncate">
              {parseIRI(data!.targetClass).name}
            </span>
            <div className="min-w-[23px] h-[24px] flex items-center justify-center">
              {/* <ChevronDownIcon /> */}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default DraggedClass;
