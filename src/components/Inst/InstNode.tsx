import { memo } from "react";
import types from "@/types";
import type { NodeProps } from "reactflow";
import { Position, Handle } from "reactflow";
import { appStore } from "@/store/app";
import { deleteNode } from "@/store/flow";

type CustomHandleProps = {
  id: string;
  position: Position;
};

const CustomHandle = ({ id, position }: CustomHandleProps) => {
  return (
    <Handle
      id={id}
      position={position}
      type="source"
      className="
        border-none 
        ring-1 
        ring-slate-100/70 
      "
    />
  );
};

const InstNode = ({ id, data }: NodeProps<types.NodeData>) => {
  const menuButton = (
    <button
      className="absolute left-0 top-0 m-1.5 flex hover:text-[#b3dbff] nodrag"
      onClick={() =>
        appStore.setState({ selectedNodeId: id, showPropDialog: true })
      }
    >
      <span className="material-icons-outlined text-sm">menu</span>
    </button>
  );

  const deleteButton = (
    <button
      className="absolute right-0 top-0 m-1.5 flex hover:text-[#b3dbff] nodrag"
      onClick={() => deleteNode(id)}
    >
      <span className="material-icons-outlined text-sm">
        remove_circle_outline
      </span>
    </button>
  );

  if (!data.cls) {
    return null;
  }
  return (
    <>
      <div
        className={`
          rounded-md
          transition-all 
          delay-0 
          duration-0 
          ease-out 
          shadow-black/55 
          ${
            data.active
              ? "translate-y-[-3px] translate-x-[1.5px] shadow-lg"
              : "shadow-md"
          }
        `}
      >
        <div
          className={`
            p-3 w-64 h-22 
            font-lato rounded-md
            text-center truncate
            cursor-move 
          bg-spdx-dark 
          text-slate-100 
        `}
        >
          {data.cls.name}
          {menuButton}
          {deleteButton}
        </div>
        {data.isNode && (
          <div>
            <CustomHandle id="a" position={Position.Top} />
            <CustomHandle id="b" position={Position.Right} />
            <CustomHandle id="c" position={Position.Bottom} />
            <CustomHandle id="d" position={Position.Left} />
          </div>
        )}
      </div>
    </>
  );
};

export default memo(InstNode);
