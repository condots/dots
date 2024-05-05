import { useEffect } from "react";
import SbomEditor from "@/components/SbomEditor";
import ProfileMenu from "@/components/ProfileMenu";
import InstanceDrawer from "@/components/InstanceDrawer";
import { tracked, actions } from "@/store/global";
import { Splitter, SplitterPanel } from "primereact/splitter";

import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // flex

export default function App() {
  const source = tracked().onto.source();

  useEffect(() => {
    actions.onto.updateOntology();
  }, [source]);

  return (
    <>
      <InstanceDrawer />
      <Splitter className="h-screen w-screen">
        <SplitterPanel size={20} minSize={10}>
          <ProfileMenu />
        </SplitterPanel>
        <SplitterPanel className="h-full w-full" size={80}>
          <SbomEditor />
        </SplitterPanel>
      </Splitter>
    </>
  );
}
