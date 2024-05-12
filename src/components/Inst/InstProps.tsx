import React from "react";
import { tracked, actions, getters } from "@/store/global";
import { InputText } from "primereact/inputtext";

export interface Prop {
  iri: string;
  value: string | boolean | number;
  valid: boolean;
}

export default function InstProps() {
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

  const advisoryText = (text: string) => {
    DOMPurify.addHook("afterSanitizeElements", function (node) {
      if (node.tagName && node.tagName.toLowerCase() === "a") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    const clean = DOMPurify.sanitize(marked.parse(text));
    DOMPurify.removeHook("afterSanitizeElements");
    return <div className="htmlContent">{parse(clean)}</div>;
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
    <div className="card">
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-auto">
          <label htmlFor="integer" className="font-bold block mb-2">
            Integer
          </label>
          <InputText id="integer" keyfilter="int" className="w-full" />
        </div>
        <div className="flex-auto">
          <label htmlFor="number" className="font-bold block mb-2">
            Number
          </label>
          <InputText id="number" keyfilter="num" className="w-full" />
        </div>
        <div className="flex-auto">
          <label htmlFor="money" className="font-bold block mb-2">
            Money
          </label>
          <InputText id="money" keyfilter="money" className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-auto">
          <label htmlFor="hex" className="font-bold block mb-2">
            Hex
          </label>
          <InputText id="hex" keyfilter="hex" className="w-full" />
        </div>
        <div className="flex-auto">
          <label htmlFor="alphabetic" className="font-bold block mb-2">
            Alphabetic
          </label>
          <InputText id="alphabetic" keyfilter="alpha" className="w-full" />
        </div>
        <div className="flex-auto">
          <label htmlFor="alphanumeric" className="font-bold block mb-2">
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
          <label htmlFor="pint" className="font-bold block mb-2">
            Positive Integer
          </label>
          <InputText id="pint" keyfilter="pint" className="w-full" />
        </div>
        <div className="flex-auto">
          <label htmlFor="pnum" className="font-bold block mb-2">
            Positive Number
          </label>
          <InputText id="pnum" keyfilter="pnum" className="w-full" />
        </div>
        <div className="flex-auto">
          <label htmlFor="email" className="font-bold block mb-2">
            Email
          </label>
          <InputText id="email" keyfilter="email" className="w-full" />
        </div>
      </div>
    </div>
  );
}
