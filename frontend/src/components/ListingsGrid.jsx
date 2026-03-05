import React from "react";

const ListingsGrid = ({ listings, loading }) => {
  if (loading) {
    return (
      <div className="mt-6 text-sm text-slate-500">Loading homes in Nepal…</div>
    );
  }

  if (!listings.length) {
    return (
      <div className="mt-6 text-sm text-slate-500">
        No properties found for this filter. Try expanding your location or
        budget.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((home) => (
        <article
          key={home.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-200"
        >
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={home.imageUrl}
              alt={home.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {home.isFeatured && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Featured
              </span>
            )}
          </div>
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {home.title}
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {home.city}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {home.area}, {home.city}
            </p>
            <p className="text-xs text-slate-500">
              {home.beds ? `${home.beds} beds • ` : ""} {home.baths} baths •{" "}
              {home.type}
            </p>
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm font-bold text-primary">
                NPR {home.price.toLocaleString()}
              </div>
              <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary">
                View details
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ListingsGrid;

