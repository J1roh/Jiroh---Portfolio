import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Home } from "./pages/Home";
import "./tokens/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("main: #root is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
