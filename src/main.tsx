import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { WorkIndex } from "./pages/WorkIndex";
import { WorkDetail } from "./pages/WorkDetail";
import { Enquire } from "./pages/Enquire";
import { NotFound } from "./pages/NotFound";
import "./tokens/index.css";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/work", element: <WorkIndex /> },
      { path: "/work/:slug", element: <WorkDetail /> },
      { path: "/enquire", element: <Enquire /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const root = document.getElementById("root");
if (!root) throw new Error("main: #root is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
