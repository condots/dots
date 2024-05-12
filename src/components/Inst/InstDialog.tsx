import React, { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { tracked, actions, getters } from "@/store/global";
import { Dialog } from "primereact/dialog";
import { TieredMenu } from "primereact/tieredmenu";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ReactHtmlParser from "react-html-parser";
import { Checkbox } from "primereact/checkbox";
import { ToggleButton } from "primereact/togglebutton";

type Prop = {
  iri: string;
  value: string | boolean | number;
  valid: boolean;
};

const patterns = {
  anyURI: /^[a-zA-Z][a-zA-Z0-9+.-]*:(\/\/[^\s/]+)?[^\s]*$/,
  dateTimeStamp:
    /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?(Z|(\+|-)[0-9][0-9]:[0-9][0-9])$/,
  decimal: /^(\+|-)?([0-9]+(\.[0-9]*)?|\.[0-9]+)$/,
  "https://spdx.org/rdf/3.0.0/terms/Core/PositiveIntegerRange": null,
  "https://spdx.org/rdf/3.0.0/terms/Software/ContentIdentifier": null,
  nonNegativeInteger: /^[0-9]+$/,
  positiveInteger: /^[1-9][0-9]*$/,
  string: /^.*$/,
};

export default function InstDialog() {
  const nodeId = tracked().app.instDialog().nodeId;
  const node = tracked().flow.getNode(nodeId);
  const cls = tracked().onto.byIri(node?.data.iri);
  const [classProperties, setClassProperties] = useState<object[]>();
  const [instProps, setInstProps] = useImmer<Prop[]>([]);
  const menu = useRef(null);

  useEffect(() => {
    setClassProperties(() => getClassProperties(node?.data.iri));
  }, [node]);

  const propIcon = (datatype: string) => {
    const icon = {
      string: "text_fields",
      anyURI: "link",
      boolean: "toggle_off",
      dateTimeStamp: "schedule",
      decimal: "numbers",
      nonNegativeInteger: "numbers",
      positiveInteger: "numbers",
    };
    return (
      <span className="material-icons-outlined mr-2 flex justify-end">
        {icon[datatype] ?? "web_asset"}
      </span>
    );
  };

  const itemRenderer = (item) => {
    const property = getters.onto.byIri(item.data.path);
    return (
      <Button
        unstyled
        className="p-menuitem-link w-full"
        tooltip={property.summary}
        tooltipOptions={{ showDelay: 1000 }}
        icon={propIcon(property.datatype)}
        onClick={() => addProperty(item.data.path)}
      >
        {item.label}
      </Button>
    );
  };

  const getClassProperties = (iri: string) => {
    const items = [];
    while (iri) {
      const c = getters.onto.byIri(iri);
      const subitems = [];
      Object.entries(c.properties).forEach(([k, v]) => {
        if (getters.onto.byIri(v.path).datatype) {
          subitems.push({ label: k, data: v, template: itemRenderer });
        }
      });
      if (subitems.length > 0) {
        items.push({ label: c.name, items: subitems });
      }
      iri = c.subClassOf;
    }
    return items;
  };

  const addProperty = (iri: string) => {
    const property = getters.onto.byIri(iri);
    const initProp: Prop = { iri, value: "", valid: false };
    if (property.datatype === "boolean") {
      initProp.value = false;
      initProp.valid = true;
    }
    setInstProps((draft) => {
      draft.push(initProp);
    });
  };

  const getProp = (iri: string) => instProps.find((prop) => prop.iri === iri);

  const validateInput = (event, validatePattern) => {
    setInstProps((draft) => {
      const p = draft.find((prop) => prop.iri === event.target.id);
      p.value = event.target.value;
      p.valid = validatePattern && event.target.value !== "";
    });
  };

  function externalLinks() {
    for (var c = document.getElementsByTagName("a"), a = 0; a < c.length; a++) {
      var b = c[a];
      b.getAttribute("href") &&
        b.hostname !== location.hostname &&
        (b.target = "_blank");
    }
  }
  externalLinks();

  const advisoryText = (text: string) => {
    DOMPurify.addHook("afterSanitizeElements", function (node) {
      if (node.tagName && node.tagName.toLowerCase() === "a") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    const clean = DOMPurify.sanitize(marked.parse(text));
    DOMPurify.removeHook("afterSanitizeElements");
    return <div className="htmlContent">{ReactHtmlParser(clean)}</div>;
  };

  const NodeProperties = (prop: Prop) => {
    const property = getters.onto.byIri(prop.iri);
    let el = null;
    if (property.datatype === "boolean") {
      el = (
        <>
          <ToggleButton
            checked={prop.value}
            onChange={(e) => {
              setInstProps((draft) => {
                const p = draft.find((p) => p.iri === property.iri);
                p.value = e.value;
              });
            }}
            className="w-8rem"
          />
          {/* <Checkbox
            value={property.name}
            onChange={() => {
              setInstProps((draft) => {
                const p = draft.find((p) => p.iri === property.iri);
                p.value = !p.value;
              });
            }}
            checked={prop.value}
          /> */}
        </>
      );
    } else {
      el = (
        <>
          <InputText
            id={property.iri}
            value={prop.value}
            keyfilter={patterns[property.datatype]}
            validateOnly
            onInput={validateInput}
            invalid={!prop.valid}
            className="border-2"
          />
          {/* <small className="text-balance">
            {advisoryText(property.summary)}
          </small> */}
        </>
      );
    }
    return (
      <div key={property.iri} className="flex flex-column gap-1 my-3">
        <label className="font-bold block">{property.name}</label>
        {el}
      </div>
    );
  };

  return (
    <div className="card justify-content-center flex">
      <Dialog
        header={cls?.name}
        visible={cls}
        className="w-1/2 h-2/3"
        onHide={() =>
          actions.app.state((state) => {
            state.instDialog.nodeId = null;
          })
        }
      >
        <Button
          icon="pi pi-bars"
          outlined
          severity="secondary"
          onClick={(e) => menu.current.toggle(e)}
        />
        <TieredMenu model={classProperties} ref={menu} popup />
        {instProps.map(NodeProperties)}
      </Dialog>
    </div>
  );
}
