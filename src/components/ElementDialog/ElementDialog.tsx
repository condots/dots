import React, { useEffect, useRef, useState } from "react";
import { tracked, actions, getters } from "@/store/global";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { Tree } from "primereact/tree";
import { MegaMenu, MenuItem } from "primereact/megamenu";
import { TieredMenu } from "primereact/tieredmenu";
import { Button } from "primereact/button";

const getTreeProperties = (iri: string) => {
  const items: MenuItem[] = [];
  let i = 0;
  while (iri) {
    const c = getters.onto.byIri(iri);
    const item = {
      key: `${i++}`,
      label: c.name,
      children: Object.entries(c.properties).map(([k, v], j) => ({
        key: `${i}-${j}`,
        label: k,
        data: v,
      })),
    };
    items.push(item);
    iri = c.subClassOf;
  }
  return items;
};

const getTieredMenuProperties = (iri: string) => {
  const items: MenuItem[] = [];
  while (iri) {
    const c = getters.onto.byIri(iri);
    const item = {
      label: c.name,
      items: Object.entries(c.properties).map(([k, v]) => ({
        label: k,
        data: v,
      })),
    };
    items.push(item);
    iri = c.subClassOf;
  }
  return items;
};

const getMenuProperties = (iri: string) => {
  const items: MenuItem[] = [];
  while (iri) {
    const c = getters.onto.byIri(iri);
    const item = [
      {
        label: c.name,
        items: Object.entries(c.properties).map(([k, v]) => ({
          label: k,
          // data: v,
        })),
      },
    ];
    items.push(item);
    iri = c.subClassOf;
  }
  const properties = [{ label: "Add", items }];
  // console.log("properties:", properties);

  return properties;
};

const items: MenuItem[] = [
  {
    label: "Add",
    items: [
      [
        {
          label: "Build",
          items: [
            { label: "buildType" },
            { label: "buildId" },
            { label: "buildStartTime" },
            { label: "buildEndTime" },
          ],
        },
      ],
      [
        {
          label: "Element",
          items: [
            { label: "verifiedUsing" },
            { label: "name" },
            { label: "extension" },
            { label: "summary" },
            { label: "comment" },
            { label: "description" },
            { label: "creationInfo" },
            { label: "externalRef" },
            { label: "externalIdentifier" },
          ],
        },
      ],
    ],
  },
];

export default function ElementDialog() {
  const nodeId = tracked().app.elementDialog().nodeId;
  const node = tracked().flow.getNode(nodeId);
  const cls = tracked().onto.byIri(node?.data.iri);
  const [properties, setProperties] = useState<object[]>();
  const [values, setValues] = useState({});
  const menu = useRef(null);

  useEffect(() => {
    setProperties(() => getTieredMenuProperties(node?.data.iri));
  }, [node]);

  return (
    <div className="card justify-content-center flex">
      <Dialog
        header={nodeId}
        visible={cls}
        className="w-1/2 h-2/3"
        // content={<MegaMenu model={properties} />}
        // style={{ width: "50vw" }}
        // breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        onHide={() =>
          actions.app.state((state) => {
            state.elementDialog.nodeId = null;
          })
        }
      >
        {/* <MegaMenu model={properties} /> */}
        <TieredMenu model={properties} ref={menu} popup />
        <Button label="Show" onClick={(e) => menu.current.toggle(e)} />

        {/* <Divider /> */}
        {/* <div className="h-1"> */}
        {/* <MegaMenu
          className="content"
          // model={items}
          model={properties}
          // scrollHeight="100px"
          // breakpoint="100px"
          // className="w-full h-full overflow-scroll"
          pt={{
            panel: {
              className: "card justify-content-center flex",
            },
          }}
        /> */}
        {/* </div> */}

        {/* <Tree
          value={properties}
          filter
          filterMode="strict"
          filterPlaceholder="Search..."
          className="h-full w-full overflow-scroll"
        /> */}

        {/* <div className="card">
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
        </div> */}
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
