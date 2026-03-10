import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import ListProperty from "./pages/ListProperty.jsx";
import Auth from "./pages/Auth.jsx";
import UserTypeSelection from "./pages/UserTypeSelection.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddPropertyPage from "./pages/AddPropertyPage.jsx";
import ManageTenantsPage from "./pages/ManageTenantsPage.jsx";
import ViewListingsPage from "./pages/ViewListingsPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import FinancialReportsPage from "./pages/FinancialReportsPage.jsx";
import ListingDetails from "./pages/ListingDetails.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: React.createElement(App),
    children: [
      { index: true, element: React.createElement(Home) },
      { path: "list-property", element: React.createElement(ListProperty) },
      { path: "auth", element: React.createElement(Auth) },
      { path: "user-type", element: React.createElement(UserTypeSelection) },
      { path: "dashboard", element: React.createElement(Dashboard) },
      { path: "add-property", element: React.createElement(AddPropertyPage) },
      { path: "manage-tenants", element: React.createElement(ManageTenantsPage) },
      { path: "view-listings", element: React.createElement(ViewListingsPage) },
      { path: "user-dashboard", element: React.createElement(UserDashboard) },
      { path: "financial-reports", element: React.createElement(FinancialReportsPage) },
      { path: "listing/:id", element: React.createElement(ListingDetails) },
      { path: "*", element: React.createElement(NotFound) },
    ],
  },
]);

export default router;

