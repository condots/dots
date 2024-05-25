import { InfoDialog } from "@/components/Onto/InfoDialog";
import PropDialog from "@/components/Prop/PropDialog";
import ClassMenu from "@/components/Onto/ClassMenu";
import InstBoard from "@/components/Inst/InstBoard";

import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // flex

export default function App() {
  return (
    <>
      <InfoDialog />
      <PropDialog />
      <ClassMenu />
      <InstBoard />
    </>
  );
}
