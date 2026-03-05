import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-md text-sm text-slate-600">
        The page you are looking for does not exist. Use the navigation above
        or go back to the Nepal home search.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Back to home
      </Link>
    </section>
  );
};

export default NotFound;

