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

type FieldProps = {
  iri: string;
  value: string;
  valid: boolean;
};

export default function InstDialog() {
  const nodeId = tracked().app.instDialog().nodeId;
  const node = tracked().flow.getNode(nodeId);
  const cls = tracked().onto.byIri(node?.data.iri);
  const [classProperties, setClassProperties] = useState<object[]>();
  const [instProp, setInstProp] = useImmer<FieldProps[]>([]);
  const menu = useRef(null);

  useEffect(() => {
    setClassProperties(() => getClassProperties(node?.data.iri));
  }, [node]);

  const fieldIcon = (datatype: string) => {
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
        icon={fieldIcon(property.datatype)}
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
    setInstProp((draft) => {
      draft.push({ iri: iri, value: "", valid: false });
    });
  };

  const validateInput = (event, validatePattern) => {
    setInstProp((draft) => {
      const field = draft.find((field) => field.iri === event.target.id);
      field.value = event.target.value;
      field.valid = validatePattern;
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

  const NodeProperties = (field: FieldProps) => {
    const item = getters.onto.byIri(field.iri);
    const patterns = {
      anyURI: /^[a-zA-Z][a-zA-Z0-9+.-]*:(\/\/[^\s/]+)?[^\s]*$/,
      // anyURI:
      //   /^(?:[a-z][a-z0-9+.-]*):(?:\/\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*)?(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*)?)$/i,
      // anyURI:
      //   /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/,
      boolean: /^(true|false|1|0)$/,
      // "dateTimeStamp": /.*(Z|(\+|-)[0-9][0-9]:[0-9][0-9])/,
      dateTimeStamp:
        /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?(Z|(\+|-)[0-9][0-9]:[0-9][0-9])$/,
      decimal: /^(\+|-)?([0-9]+(\.[0-9]*)?|\.[0-9]+)$/,
      "https://spdx.org/rdf/3.0.0/terms/Core/PositiveIntegerRange": null,
      "https://spdx.org/rdf/3.0.0/terms/Software/ContentIdentifier": null,
      nonNegativeInteger: /^[0-9]+$/,
      positiveInteger: /^[1-9][0-9]*$/,
      string: /^.*$/,
    };
    if (item.datatype) {
      return (
        <div key={item.iri} className="flex flex-column gap-2 my-3">
          <label htmlFor={item.iri}>{item.name}</label>
          <InputText
            id={item.iri}
            value={field.value}
            keyfilter={patterns[item.datatype]}
            validateOnly
            onInput={validateInput}
            invalid={!field.valid}
            className="border-2"
          />
          <small className="text-balance">{advisoryText(item.summary)}</small>
          <small>{item.datatype}</small>
        </div>
      );
    }
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
        {instProp.map(NodeProperties)}
      </Dialog>
    </div>
  );
}
