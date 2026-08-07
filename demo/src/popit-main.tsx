import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/celebrate.css";
import { PopItStandaloneApp } from "./examples/PopItStandaloneApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PopItStandaloneApp />
  </StrictMode>
);
