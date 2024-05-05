import { type ReactNode, HTMLAttributes } from "react";
import { Panel } from "reactflow";
import { tracked, actions } from "@/store/global";

import "@/components/devtools.css";

import NodeInspector from "@/components/NodeInspector";
import ChangeLogger from "@/components/ChangeLogger";
import ViewportLogger from "@/components/ViewportLogger";

export default function DevTools() {
  const dtActive = tracked().flow.devtoolsActive();

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
      {dtActive.changeLogger && <ChangeLogger />}
      {dtActive.nodeInspector && <NodeInspector />}
      {dtActive.viewportLogger && <ViewportLogger />}
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
  const dtActive = tracked().flow.devtoolsActive();
  return (
    <button
      onClick={() => actions.flow.setDevtoolsActive(name)}
      className={dtActive[name] ? "active" : ""}
      {...rest}
    >
      {children}
    </button>
  );
}
