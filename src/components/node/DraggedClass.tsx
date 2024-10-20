import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { appStore } from '@/store/app';
import { generateURN, parseIRI } from '@/scripts/app-utils';
import { addNode, screenToCanvas } from '@/store/flow';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Separator } from '@radix-ui/react-separator';
import { XYPosition } from '@xyflow/react';

const DraggedClass = () => {
  const data = appStore.use.draggedClassData();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState<XYPosition>();
  const [offset, setOffset] = useState<XYPosition>();
  const draggableRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging && offset) {
        setPosition({
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        });
      }
    },
    [dragging, offset]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (dragging && data) {
        addNode(
          generateURN(),
          data.targetClass,
          screenToCanvas(e.clientX - 128, e.clientY - 40.5)
        );
      }
      setDragging(false);
      setOffset(undefined);
      setPosition(undefined);
      appStore.setState(state => {
        state.draggedClassData = undefined;
        return state;
      });
    },
    [dragging, data]
  );

  useEffect(() => {
    if (!data) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [data, handleMouseMove, handleMouseUp]);

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

  const draggedContent = useMemo(() => {
    if (!data) return null;

    return (
      <div
        ref={draggableRef}
        className="p-1 rounded font-lato opacity-50 z-[2000]"
        style={{
          position: 'absolute',
          left: position && `${position.x + 4}px`,
          top: position && `${position.y - 2}px`,
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div className="cursor-move rounded w-64 min-h-20 bg-white outline-spdx-dark outline shadow-4">
          <div className="px-0.5 flex flex-col gap-y-2">
            <div className={`flex gap-x-1`}>
              <div className="nodrag nopan outline-none p-1 rounded text-spdx-dark hover:bg-spdx-dark/5">
                <HamburgerMenuIcon />
              </div>
              <span className="text-spdx-dark w-full text-center truncate px-[2px] font-lato font-semibold">
                {parseIRI(data.targetClass).name}
              </span>
              <div className="min-w-[23px] h-[24px] flex items-center justify-center" />
            </div>
            <Separator className="bg-spdx-dark/50 mx-6 h-px" />
          </div>
        </div>
      </div>
    );
  }, [data, position, dragging]);

  return draggedContent;
};

export default DraggedClass;
