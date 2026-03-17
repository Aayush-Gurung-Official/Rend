import React from "react";
import { useNavigate } from "react-router-dom";

const ListingsGrid = ({ listings, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
        Loading homes in Nepal…
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="card mt-6">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          No results yet
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Try expanding your location or budget. If this is your first time,
          add a property in the dashboard to see listings here.
        </p>
      </div>
    );
  }

  const getPriceDisplay = (property) => {
    if (property.listingType === "For Sale") {
      return `NPR ${parseInt(property.salePrice || 0, 10).toLocaleString()}`;
    }
    if (property.listingType === "For Rent") {
      return `NPR ${parseInt(property.monthlyRent || 0, 10).toLocaleString()}/month`;
    }
    return `NPR ${parseInt(property.monthlyRent || 0, 10).toLocaleString()}/month`;
  };

  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) return property.images[0];
    return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&h=600&q=80";
  };

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((property) => (
        <article
          key={property.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/40 dark:ring-slate-800"
        >
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={getPropertyImage(property)}
              alt={property.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            {property.featured && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Featured
              </span>
            )}
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:bg-slate-950/60 dark:text-slate-200 dark:ring-slate-800">
              {property.listingType}
            </span>
          </div>

          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="min-w-0 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {property.name}
              </h3>
              <span className="badge shrink-0">{property.propertyType}</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold">📍</span> {property.address},{" "}
              {property.city}
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {property.bedrooms ? `${property.bedrooms} beds • ` : ""}
              {property.bathrooms ? `${property.bathrooms} baths • ` : ""}
              {property.squareFootage ? `${property.squareFootage} sqft` : ""}
            </p>

            {property.furnished && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">🛋️</span> {property.furnished}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm font-bold text-primary">
                {getPriceDisplay(property)}
              </div>
              <button
                type="button"
                className="btn btn-outline rounded-full px-3 py-1.5 text-xs"
                onClick={() => navigate(`/listing/${property.id}`)}
              >
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
