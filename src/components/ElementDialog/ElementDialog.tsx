import React, { useState } from "react";
import { tracked, actions } from "@/store/global";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";

export default function ElementDialog() {
  const nodeId = tracked().app.elementDialog().nodeId;
  const cls = tracked().flow.getNode(nodeId)?.data.cls;
  const [values, setValues] = useState({});

  const dataTypes = cls?.inheritedConstraints.map((h) =>
    h.constraints.map((c) => {
      if (c.datatype) {
        return (
          <div key={c.path} className="card justify-content-start flex">
            <FloatLabel>
              {/* <div className="flex-column flex"> */}
              <label htmlFor="property">{c.path.split("/").pop()}</label>
              <InputText
                id="property"
                aria-describedby="property-help"
                value={values[c.path] ?? ""}
                onChange={(e) =>
                  setValues((vals) => ({ ...vals, [c.path]: e.target.value }))
                }
              />
              <small id="property-help">{values[c.path] ?? ""}</small>
              {/* </div> */}
            </FloatLabel>
          </div>
        );
      }
    }),
  );

  return (
    <div className="card justify-content-center flex">
      <Dialog
        header={cls?.name}
        visible={cls}
        style={{ width: "50vw" }}
        onHide={() =>
          actions.app.state((state) => {
            state.elementDialog.nodeId = null;
          })
        }
      >
        <div className="mt-4 flex flex-col space-y-8">{dataTypes}</div>
      </Dialog>
    </div>
  );
}

{
  /* <p className="m-0">
  {JSON.stringify(cls?.inheritedConstraints, null, 2) ?? ""}
</p>
{cls?.inheritedConstraints?.map((c) => (
  <p key={c.iri} className="m-0">
    {c.name}
  </p>
))} */
}
{
  /* <FloatLabel>
<Dropdown
  inputId="label"
  value={values[c.path]}
  onChange={(e) => setValues(e.value)}
  options={cities}
  optionLabel="name"
  className="w-full"
/>
<label htmlFor="label">{c.path.split("/")[-1]}</label>
</FloatLabel> */
}
