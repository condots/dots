import { InfoDialog } from "@/components/Onto/InfoDialog";
import PropDialog from "@/components/Prop/PropDialog";
import ClassMenu from "@/components/Onto/ClassMenu";
import InstBoard from "@/components/Inst/InstBoard";

import { Splitter, SplitterPanel } from "primereact/splitter";
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // flex

export default function App() {
  return (
    <>
      <InfoDialog />
      <PropDialog />
      <Splitter className="h-screen w-screen">
        <SplitterPanel size={20} minSize={10}>
          <ClassMenu />
        </SplitterPanel>
        <SplitterPanel className="h-full w-full" size={80}>
          <InstBoard />
        </SplitterPanel>
      </Splitter>
    </>
  );
}
