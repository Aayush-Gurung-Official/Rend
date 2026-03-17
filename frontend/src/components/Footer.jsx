import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="rend-container py-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="space-y-3 md:col-span-5">
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Rend
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              A simple, beginner-friendly way to find homes and rentals across
              Nepal.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:col-span-7 md:grid-cols-3">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Explore
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    className="text-slate-600 transition hover:text-primary dark:text-slate-300"
                    to="/"
                  >
                    Find homes
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-slate-600 transition hover:text-primary dark:text-slate-300"
                    to="/auth"
                  >
                    List property
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-slate-600 transition hover:text-primary dark:text-slate-300"
                    to="/auth"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Dashboard
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    className="text-slate-600 transition hover:text-primary dark:text-slate-300"
                    to="/dashboard"
                  >
                    Owner dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-slate-600 transition hover:text-primary dark:text-slate-300"
                    to="/user-dashboard"
                  >
                    Tenant dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-slate-600 transition hover:text-primary dark:text-slate-300"
                    to="/view-listings"
                  >
                    View listings
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Newsletter
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Get updates about new listings and features.
              </p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  className="input flex-1"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="btn btn-primary whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Rend. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="hidden sm:inline">Built for Nepal rentals.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
