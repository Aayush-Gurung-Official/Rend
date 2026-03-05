import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      // give the router a moment to render before scrolling
      setTimeout(() => scrollToSection(sectionId), 50);
    } else {
      scrollToSection(sectionId);
    }
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
            <span className="text-lg font-bold">R</span>
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold text-slate-900">Rend</div>
            <div className="text-xs text-slate-500">Homes in Nepal</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-primary" : "hover:text-primary"
            }
          >
            Find Homes
          </NavLink>
          <NavLink
            to="/list-property"
            className={({ isActive }) =>
              isActive ? "text-primary" : "hover:text-primary"
            }
          >
            List Property
          </NavLink>
          <button
            onClick={() => handleSectionClick("services")}
            className="transition hover:text-primary"
          >
            Services
          </button>
          <button
            onClick={() => handleSectionClick("help")}
            className="transition hover:text-primary"
          >
            Help
          </button>
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden text-sm font-medium text-slate-600 hover:text-primary md:inline">
            Login
          </button>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

