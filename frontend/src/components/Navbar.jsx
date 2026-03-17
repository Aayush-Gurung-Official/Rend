import React, { useMemo, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = location.pathname === "/dashboard";

  const navItems = useMemo(
    () => [
      { type: "link", label: "Find Homes", to: "/" },
      { type: "section", label: "Services", sectionId: "services-section" },
      { type: "section", label: "Help", sectionId: "help-section" },
    ],
    []
  );

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:ring-1 focus:ring-slate-200"
      >
        Skip to content
      </a>
      <div
        className={`flex w-full items-center justify-between gap-3 py-3 md:py-4 ${
          isDashboard ? "pl-4 pr-4 md:pr-8" : "rend-container"
        }`}
      >
        {isDashboard ? (
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="Rend logo"
              className="h-9 w-auto object-contain md:h-10"
            />
            <div className="hidden leading-tight sm:block">
              <div className="text-base font-semibold text-slate-900 md:text-lg">Rend</div>
              <div className="text-[11px] text-slate-500 md:text-xs">Homes in Nepal</div>
            </div>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <img
              src={Logo}
              alt="Rend logo"
              className="h-9 w-auto object-contain md:h-10"
            />
            <div className="hidden leading-tight sm:block">
              <div className="text-base font-semibold text-slate-900 md:text-lg">Rend</div>
              <div className="text-[11px] text-slate-500 md:text-xs">
                Homes in Nepal
              </div>
            </div>
          </Link>
        )}
        {!isDashboard && (
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-slate-900"
                  : "transition hover:text-primary"
              }
            >
              Find Homes
            </NavLink>
            <button
              type="button"
              onClick={() => handleSectionClick("services-section")}
              className="transition hover:text-primary"
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => handleSectionClick("help-section")}
              className="transition hover:text-primary"
            >
              Help
            </button>
          </nav>
        )}
        <div className="flex items-center gap-2 md:gap-3">
          {!isDashboard && (
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="btn btn-outline p-2 md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="rend-mobile-nav"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
          {isDashboard ? (
            <Link
              to="/"
              className="btn btn-outline px-3 py-2 text-xs md:px-4 md:text-sm"
            >
              Back to Website
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden text-sm font-semibold text-slate-600 transition hover:text-primary md:inline"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="btn btn-primary rounded-full px-3 py-2 text-xs md:px-4 md:text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            </>
          )}
        </div>
      </div>

      {!isDashboard && mobileOpen && (
        <div className="border-t border-slate-200 bg-white/90 backdrop-blur md:hidden">
          <div id="rend-mobile-nav" className="rend-container py-3">
            <nav className="grid gap-1 text-sm font-semibold text-slate-700">
              {navItems.map((item) => {
                if (item.type === "link") {
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `rounded-xl px-3 py-2 transition ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "hover:bg-slate-50"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSectionClick(item.sectionId);
                    }}
                    className="rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                  >
                    {item.label}
                  </button>
                );
              })}
              <div className="mt-1 grid gap-2 px-1 pt-2">
                <Link to="/auth" className="btn btn-outline" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

