import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/image/logo.png";

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
      setTimeout(() => scrollToSection(sectionId), 100);
    } else {
      scrollToSection(sectionId);
    }
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={Logo}
            alt="Rend logo"
            className="-ml-2 h-9 w-auto object-contain md:h-10"
          />
          <div className="hidden leading-tight sm:block">
            <div className="text-base font-semibold text-slate-900 md:text-lg">Rend</div>
            <div className="text-[11px] text-slate-500 md:text-xs">
              Homes in Nepal
            </div>
          </div>
        </Link>
        {location.pathname !== '/dashboard' && (
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
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
        )}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            disabled
            className="hidden text-sm font-medium text-slate-400 cursor-not-allowed md:inline"
          >
            Login
          </button>
          <Link
            to="/dashboard"
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark md:px-4 md:py-2 md:text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

