import React, { useState } from "react";
import type { NodeProps } from "reactflow";
import { Position, Handle } from "reactflow";
import { tracked, actions } from "@/store/global";

import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";

import "@/components/SbomEditor/SbomEditor.css";

type NodeData = {
  iri: string;
  flowElement?: boolean;
};

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
      className="rounded bg-gray-200 p-1 hover:bg-gray-400"
    />
  );
};

const ElementNode = ({ id, data }: NodeProps<NodeData>) => {
  const cls = tracked().onto.cls(data.iri);
  const [selected, setSelected] = useState(null);

  const style = {
    "--scale-start": 0.8,
    "--animation-duration": `${0.2}s`,
  };

  if (!cls) {
    return null;
  }
  return (
    <>
      <Card
        className="
          font-lato 
          card-appear 
          rounded-md 
          w-24rem 
          flex 
          justify-content-center 
          justify-center 
          text-balance 
          border 
          bg-gray-50/90
          hover:bg-gray-100
          border-slate-600 
          shadow-lg
          shadow-slate-900/40 
          hover:shadow-xl
          "
        style={style}
      >
        <button
          className="pi pi-info-circle absolute right-0 top-0 m-2 rounded-full hover:text-primary hover:backdrop-brightness-110 transition"
          onClick={() =>
            actions.app.state((state) => {
              state.elementDialog.nodeId = id;
            })
          }
        />

        <div className="font-lato p-card-title w-20rem my-0 flex justify-center text-2xl">
          <p className="truncate">{cls?.name}</p>
        </div>
        {cls.options && (
          <div className="card justify-content-center w-20rem mt-5 flex">
            <Dropdown
              value={selected}
              onChange={(e) => setSelected(e.value)}
              options={cls.options}
              optionLabel="name"
              optionValue="iri"
              className="w-full"
              checkmark={true}
              highlightOnSelect={false}
              placeholder="Select a type..."
              panelClassName="font-lato text-[1.2rem]"
              pt={{
                input: {
                  className: "font-lato text-[1.2rem] font-medium",
                },
              }}
            />
          </div>
        )}
      </Card>
      {data.flowElement && (
        <>
          <CustomHandle id="a" position={Position.Top} />
          <CustomHandle id="b" position={Position.Right} />
          <CustomHandle id="c" position={Position.Bottom} />
          <CustomHandle id="d" position={Position.Left} />
        </>
      )}
    </>
  );
};

export default ElementNode;
