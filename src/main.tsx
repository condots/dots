import ReactDOM from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import { ReactFlowProvider } from "reactflow";
// import "reactflow/dist/base.css";
import "reactflow/dist/style.css";
import "./index.css";
import App from "./App.tsx";

import { enableMapSet } from "immer";
enableMapSet();

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <PrimeReactProvider>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </PrimeReactProvider>
  // </React.StrictMode>
);
