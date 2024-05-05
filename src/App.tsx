import { useEffect } from "react";
import SbomEditor from "@/components/SbomEditor/SbomEditor";
import ElementDialog from "@/components/ElementDialog/ElementDialog";
import { tracked, actions } from "@/store/global";
import { Splitter, SplitterPanel } from "primereact/splitter";

import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // flex
import ClassMenu from "./components/ClassMenu/ClassMenu";

export default function App() {
  const source = tracked().onto.source();

  useEffect(() => {
    actions.onto.updateOntology();
  }, [source]);

  return (
    <>
      <ElementDialog />
      <Splitter className="h-screen w-screen">
        <SplitterPanel size={20} minSize={10}>
          <ClassMenu />
        </SplitterPanel>
        <SplitterPanel className="h-full w-full" size={80}>
          <SbomEditor />
        </SplitterPanel>
      </Splitter>
    </>
  );
}
