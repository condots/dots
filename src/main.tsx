// import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { PrimeReactProvider } from 'primereact/api';

import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { enableMapSet } from 'immer';
enableMapSet();

import '@/index.css';
import App from '@/App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <PrimeReactProvider>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </PrimeReactProvider>
  // </StrictMode>
);
