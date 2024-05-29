import { memo, useRef } from "react";
import types from "@/types";
import type { NodeProps } from "reactflow";
import { Position, Handle, useOnSelectionChange } from "reactflow";
import { appStore } from "@/store/app";
import { deleteNode } from "@/store/flow";
import InstMenu from "./InstMenu";

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

const InstNode = ({ id, data, selected }: NodeProps<types.NodeData>) => {
  const cmRef = useRef(null);

  const menuButton = (
    <button
      className="absolute left-0 top-0 m-1 flex hover:text-[#b3dbff] nodrag"
      onClick={() =>
        appStore.setState({ selectedNodeId: id, showPropDialog: true })
      }
    >
      <span className="material-icons-outlined text-sm">menu</span>
    </button>
  );

  const deleteButton = (
    <button
      className="absolute right-0 top-0 m-1 flex hover:text-[#b3dbff] nodrag"
      onClick={() => deleteNode(id)}
    >
      <span className="material-icons-outlined text-sm">
        remove_circle_outline
      </span>
    </button>
  );

  // useOnSelectionChange({
  //   onChange: ({ nodes, edges }) => {
  //     console.log("selected nodes", nodes);

  //     // setSelectedNodes(nodes.map((node) => node.id));
  //     // setSelectedEdges(edges.map((edge) => edge.id));
  //   },
  // });

  if (!data.cls) {
    return null;
  }
  return (
    <>
      <InstMenu nodeId={id} ref={cmRef} />
      <div
        onContextMenu={(e) => cmRef.current!.show(e)}
        className={`
          rounded-md
          transition-all 
          delay-0 
          duration-0 
          ease-out 
          shadow-black/55 
          ${
            data.active
              ? "translate-y-[-2px] translate-x-[1px] shadow-lg"
              : "shadow-md"
          }
        `}
      >
        <div
          className={`
          ${selected && "ring-2 ring-sky-400"}
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
