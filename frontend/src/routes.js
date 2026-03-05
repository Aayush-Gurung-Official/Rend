import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import ListProperty from "./pages/ListProperty.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "list-property", element: <ListProperty /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;

