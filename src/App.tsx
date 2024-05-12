import { useEffect } from "react";
import InstEditor from "@/components/InstEditor/InstEditor";
import InstDialog from "@/components/InstEditor/InstDialog";
import {
  initialNodes,
  initialEdges,
  nodeTypes,
  edgeTypes,
  defaultEdgeOptions,
} from "@/utils/flow-init";

import { tracked, actions } from "@/store/global";
import { Splitter, SplitterPanel } from "primereact/splitter";

import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // flex
import ClassMenu from "./components/ClassMenu/ClassMenu";

export default function App() {
  const source = tracked().onto.source();

  useEffect(() => {
    // actions.flow.nodes(initialNodes);
    // actions.flow.edges(initialEdges);
    actions.flow.nodeTypes(nodeTypes);
    actions.flow.edgeTypes(edgeTypes);
    actions.flow.defaultEdgeOptions(defaultEdgeOptions);
  }, []);

  useEffect(() => {
    actions.onto.updateOntology();
  }, [source]);

  return (
    <>
      <InstDialog />
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
