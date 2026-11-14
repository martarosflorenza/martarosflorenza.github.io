import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { IS_PREVIEW_BUILD } from "./lib/paths";
import { HashSync, initialPreviewPath } from "./lib/HashSync";
import "./styles/global.css";
import { App } from "./App";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {IS_PREVIEW_BUILD ? (
      // The preview page cannot use real URLs, so routes live in memory and mirror to a plain #hash.
      <MemoryRouter initialEntries={[initialPreviewPath()]}>
        <HashSync />
        <App />
      </MemoryRouter>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>,
);
