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
      className="rounded bg-gray-200 p-1 hover:bg-gray-400"
    />
  );
};

const InstNode = ({ id, data }: NodeProps<NodeData>) => {
  const cls = getItem(data.iri);
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
          bg-[#88b9e6]
          hover:bg-[#94c7f7]
          border-slate-600 
          shadow-lg
          shadow-slate-900/40 
          hover:shadow-xl
          "
        style={style}
      >
        <Button
          icon={
            <span className="material-icons-outlined text-lg">settings</span>
          }
          severity="secondary"
          unstyled
          className="absolute right-0 top-0 m-2 p-button-icon-only p-button-rounded flex justify-center items-center text-primary hover:text-gray-600"
          onClick={() =>
            appStore.setState({ selectedNodeId: id, showPropDialog: true })
          }
        ></Button>
        <div className="font-lato p-card-title w-20rem my-0 flex justify-center text-2xl">
          <p className="truncate">{cls.name}</p>
        </div>
        {cls.entries && (
          <div className="card justify-content-center w-20rem mt-5 flex">
            <Dropdown
              value={selected}
              onChange={(e) => setSelected(e.value)}
              options={cls.entries}
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
      {data.isNode && (
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

export default InstNode;
