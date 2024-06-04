import React from "react";
import ReactDOM from "react-dom/client";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { App } from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Routes>
          <Route
            path="/"
            element={<App />}
          />
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  </React.StrictMode>
);
