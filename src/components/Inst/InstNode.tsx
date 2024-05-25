import { useState } from "react";
import type { NodeProps } from "reactflow";
import { Position, Handle } from "reactflow";
import { getItem } from "@/store/onto";
import { appStore } from "@/store/app";
import { NodeData } from "@/store/flow";

import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

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

const InstNode = ({ id, data }: NodeProps<NodeData>) => {
  const cls = getItem(data.iri);
  const [selected, setSelected] = useState(null);

  if (!cls) {
    return null;
  }
  return (
    <>
      <div
        className={`
          rounded-md
          transition-all 
          delay-0 
          duration-75 
          ease-out 
          active:translate-y-[-3px] 
          active:translate-x-[1.5px] 
          shadow-md 
          active:shadow-lg
          shadow-black/55 
          active:shadow-black/55 
        `}
      >
        <div
          className={`
            px-3 py-3 w-64 
            font-lato rounded-md
            text-center truncate
            cursor-pointer 
          bg-[#00416b] 
          text-slate-100 
          border border-sky-900
        `}
        >
          {cls.name}
          <button
            className="absolute right-0 top-0 m-2 p-button-icon-only p-button-rounded flex justify-center items-center nodrag"
            onClick={() =>
              appStore.setState({ selectedNodeId: id, showPropDialog: true })
            }
          >
            <span className="material-icons-outlined text-sm">menu</span>
          </button>
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

export default InstNode;
