import React, { useState } from "react";
import type { NodeProps } from "reactflow";
import { Position, Handle } from "reactflow";
import { tracked, actions } from "@/store/global";
import { Button } from "primereact/button";

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
      className="p-1 bg-gray-200 hover:bg-gray-400 rounded"
    />
  );
};

const ElementNode = ({ data }: NodeProps<NodeData>) => {
  const cls = tracked().onto.cls(data.iri);
  const [selected, setSelected] = useState(null);

  if (!cls) {
    return null;
  }
  return (
    <>
      <Card className="w-24rem flex justify-center justify-content-center text-balance">
        <Button
          icon="pi pi-info-circle"
          rounded
          text
          onClick={() =>
            actions.info.state((draft) => {
              draft.visible = true;
              draft.name = cls.name;
              draft.summary = cls.summary;
            })
          }
          className="absolute top-0 right-0"
        />
        <div className="p-card-title my-0 flex justify-center w-20rem">
          <p className="truncate">{cls?.name}</p>
        </div>
        {cls.options && (
          <div className="card flex justify-content-center w-20rem mt-3">
            <Dropdown
              value={selected}
              onChange={(e) => setSelected(e.value)}
              options={cls.options}
              optionLabel="name"
              optionValue="iri"
              placeholder="Select..."
              className="w-full"
              checkmark={true}
              highlightOnSelect={false}
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
