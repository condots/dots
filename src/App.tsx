import { useEffect } from "react";
import { updateOntology } from "@/store/onto";
import { updateMediaTypes } from "@/store/app";
import { InfoDialog } from "@/components/Onto/InfoDialog";
import PropPanel from "@/components/Prop/PropPanel";
import ClassMenu from "@/components/Onto/ClassMenu";
import InstBoard from "@/components/Inst/InstBoard";

import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // flex

export default function App() {
  useEffect(() => {
    const source = "https://spdx.org/rdf/3.0.0/spdx-model.ttl";
    updateOntology(source);
    updateMediaTypes();
  }, []);

  return (
    <>
      <InfoDialog />
      <PropPanel />
      <ClassMenu />
      <InstBoard />
    </>
  );
}
