import { type ReactNode, HTMLAttributes } from "react";
import { Panel } from "reactflow";
// import { tracked, actions } from "@/store/global";
import { flowStore } from "@/zustand/flow";

import "@/components/Flow/devtools.css";

import NodeInspector from "@/components/Flow/NodeInspector";
import ChangeLogger from "@/components/Flow/ChangeLogger";
import ViewportLogger from "@/components/Flow/ViewportLogger";

export default function DevTools() {
  // const dtActive = tracked().flow.devtoolsActive();
  const active = flowStore.use.devtoolsActive();

  return (
    <div className="react-flow__devtools">
      <Panel position="top-left">
        <DevToolButton name="nodeInspector" title="Toggle Node Inspector">
          Node Inspector
        </DevToolButton>
        <DevToolButton name="changeLogger" title="Toggle Change Logger">
          Change Logger
        </DevToolButton>
        <DevToolButton name="viewportLogger" title="Toggle Viewport Logger">
          Viewport Logger
        </DevToolButton>
      </Panel>
      {active.changeLogger && <ChangeLogger />}
      {active.nodeInspector && <NodeInspector />}
      {active.viewportLogger && <ViewportLogger />}
    </div>
  );
}

function DevToolButton({
  name,
  children,
  ...rest
}: {
  name: string;
  children: ReactNode;
} & HTMLAttributes<HTMLButtonElement>) {
  // const dtActive = tracked().flow.devtoolsActive();
  const active = flowStore.use.devtoolsActive();
  const setDevtoolsActive = flowStore.use.setDevtoolsActive();

  return (
    <button
      onClick={() => setDevtoolsActive(name)}
      className={active[name] ? "active" : ""}
      {...rest}
    >
      {children}
    </button>
  );
}
