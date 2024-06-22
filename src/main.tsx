import React from 'react';
import ReactDOM from 'react-dom/client';

import { PrimeReactProvider } from 'primereact/api';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import { enableMapSet } from 'immer';
enableMapSet();

import '@/index.css';
import App from '@/App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <PrimeReactProvider>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </PrimeReactProvider>
  // </React.StrictMode>
);
