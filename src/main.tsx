import React from 'react';
import ReactDOM from 'react-dom/client';

import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
