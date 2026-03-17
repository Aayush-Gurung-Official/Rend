import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const App = () => {
  const location = useLocation();

  const isFullBleed = [
    "/dashboard",
    "/add-property",
    "/manage-tenants",
    "/view-listings",
    "/user-dashboard",
    "/financial-reports",
  ].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  return (
    <div className="min-h-screen flex flex-col w-full bg-transparent">
      <Navbar />
      <ScrollToTop />
      <main id="main-content" className="flex-1 w-full">
        {isFullBleed ? (
          <div key={location.pathname} className="animate-fade-up">
            <Outlet />
          </div>
        ) : (
          <div key={location.pathname} className="rend-container rend-page animate-fade-up">
            <Outlet />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
