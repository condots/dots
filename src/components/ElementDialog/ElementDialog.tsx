import React, { useState } from "react";
import { tracked, actions } from "@/store/global";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";

export default function ElementDialog() {
  const nodeId = tracked().app.elementDialog().nodeId;
  const cls = tracked().flow.getNode(nodeId)?.data.cls;
  const [values, setValues] = useState({});

  const dataTypes = cls?.inheritedConstraints.map((h) =>
    h.constraints.map((c) => {
      if (c.datatype) {
        return (
          <div key={c.path} className="card justify-content-start flex">
            <div
              className="p-inputgroup card justify-content-start flex flex-1"
              key={c.path}
            >
              {/* <span className="p-inputgroup-addon">
              <i className="pi pi-user"></i>
            </span> */}
              <FloatLabel>
                <label htmlFor="property">{c.path.split("/").pop()}</label>
                <InputText
                  id="property"
                  aria-describedby="property-help"
                  value={values[c.path] ?? ""}
                  onChange={(e) =>
                    setValues((vals) => ({ ...vals, [c.path]: e.target.value }))
                  }
                />
              </FloatLabel>
            </div>
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
        {/* <div className="mt-4 flex flex-col space-y-8">{dataTypes}</div> */}
        <Divider />

        <div className="card">
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="flex-auto">
              <label htmlFor="integer" className="mb-2 block font-bold">
                Integer
              </label>
              <InputText id="integer" keyfilter="int" className="w-full" />
            </div>
            <div className="flex-auto">
              <label htmlFor="number" className="mb-2 block font-bold">
                Number
              </label>
              <InputText id="number" keyfilter="num" className="w-full" />
            </div>
            <div className="flex-auto">
              <label htmlFor="money" className="mb-2 block font-bold">
                Money
              </label>
              <InputText id="money" keyfilter="money" className="w-full" />
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="flex-auto">
              <label htmlFor="hex" className="mb-2 block font-bold">
                Hex
              </label>
              <InputText id="hex" keyfilter="hex" className="w-full" />
            </div>
            <div className="flex-auto">
              <label htmlFor="alphabetic" className="mb-2 block font-bold">
                Alphabetic
              </label>
              <InputText id="alphabetic" keyfilter="alpha" className="w-full" />
            </div>
            <div className="flex-auto">
              <label htmlFor="alphanumeric" className="mb-2 block font-bold">
                Alphanumeric
              </label>
              <InputText
                id="alphanumeric"
                keyfilter="alphanum"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-auto">
              <label htmlFor="pint" className="mb-2 block font-bold">
                Positive Integer
              </label>
              <InputText id="pint" keyfilter="pint" className="w-full" />
            </div>
            <div className="flex-auto">
              <label htmlFor="pnum" className="mb-2 block font-bold">
                Positive Number
              </label>
              <InputText id="pnum" keyfilter="pnum" className="w-full" />
            </div>
            <div className="flex-auto">
              <label htmlFor="email" className="mb-2 block font-bold">
                Email
              </label>
              <InputText id="email" keyfilter="email" className="w-full" />
            </div>
          </div>
        </div>
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
