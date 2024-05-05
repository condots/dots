import React, { useState } from "react";
import type { NodeProps } from "reactflow";
import { Position, Handle } from "reactflow";
import { tracked, actions } from "@/store/global";
import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";

import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";

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

  if (!cls) {
    return null;
  }
  return (
    <>
      <Card className="w-24rem justify-content-center flex justify-center text-balance">
        <Button
          icon="pi pi-info-circle"
          rounded
          text
          onClick={() =>
            actions.app.state((state) => {
              state.elementDialog.nodeId = id;
            })
          }
          className="absolute right-0 top-0"
        />
        <div className="p-card-title w-20rem my-0 flex justify-center">
          <p className="truncate">{cls?.name}</p>
        </div>
        {cls.options && (
          <div className="card justify-content-center w-20rem mt-5 flex">
            <FloatLabel className="w-full">
              <Dropdown
                value={selected}
                onChange={(e) => setSelected(e.value)}
                options={cls.options}
                optionLabel="name"
                optionValue="iri"
                className="w-full"
                checkmark={true}
                highlightOnSelect={false}
                inputId="dd-select"
                panelClassName="text-[1.2rem]"
                pt={{
                  input: {
                    className: "text-[1.2rem]",
                  },
                }}
              />
              <label htmlFor="dd-select">Select a type</label>
            </FloatLabel>
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
