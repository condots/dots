import React, { type ReactNode, HTMLAttributes } from 'react';
import { Panel } from '@xyflow/react';
import { flowStore } from '@/store/flow';

import '@/components/flow/devtools.css';

import NodeInspector from '@/components/flow/NodeInspector';
import ChangeLogger from '@/components/flow/ChangeLogger';
import ViewportLogger from '@/components/flow/ViewportLogger';

export default function DevTools() {
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
  const active = flowStore.use.devtoolsActive();
  const setDevtoolsActive = flowStore.use.setDevtoolsActive();

  return (
    <button
      onClick={() => setDevtoolsActive(name)}
      className={active[name] ? 'active' : ''}
      {...rest}
    >
      {children}
    </button>
  );
}
