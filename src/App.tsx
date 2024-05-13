import { useEffect } from "react";
import {
  initialNodes,
  initialEdges,
  nodeTypes,
  edgeTypes,
  defaultEdgeOptions,
} from "@/utils/flow-init";

// import { tracked, actions } from "@/store/global";
import InstEditor from "@/components/Inst/InstEditor";
// import InstDialog from "@/components/Inst/InstDialog";
import ClassMenu from "@/components/Onto/ClassMenu";

import { Splitter, SplitterPanel } from "primereact/splitter";
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // flex

import { updateOntology } from "@/zustand/onto";
import { flowStore } from "@/zustand/flow";

export default function App() {
  useEffect(() => {
    flowStore.setState((draft) => {
      // draft.nodes = initialNodes;
      // draft.edges = initialEdges;
      draft.nodeTypes = nodeTypes;
      draft.edgeTypes = edgeTypes;
      draft.defaultEdgeOptions = defaultEdgeOptions;
    });
  }, []);

  useEffect(() => {
    updateOntology();
  }, []);

  return (
    <>
      {/* {mode && <div>{JSON.stringify(mode)}</div>} */}
      {/* <InstDialog /> */}
      <Splitter className="h-screen w-screen">
        <SplitterPanel size={20} minSize={10}>
          <ClassMenu />
        </SplitterPanel>
        <SplitterPanel className="h-full w-full" size={80}>
          <InstEditor />
        </SplitterPanel>
      </Splitter>
    </>
  );
}
