import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import ListProperty from "./pages/ListProperty.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: React.createElement(App),
    children: [
      { index: true, element: React.createElement(Home) },
      { path: "list-property", element: React.createElement(ListProperty) },
      { path: "*", element: React.createElement(NotFound) },
    ],
  },
]);

export default router;


