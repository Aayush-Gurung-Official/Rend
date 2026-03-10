import React from "react";
import { useNavigate } from "react-router-dom";

const ListingsGrid = ({ listings, loading }) => {
  const navigate = useNavigate();
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

  const getPriceDisplay = (property) => {
    if (property.listingType === 'For Sale') {
      return `NPR ${parseInt(property.salePrice || 0).toLocaleString()}`;
    } else if (property.listingType === 'For Rent') {
      return `NPR ${parseInt(property.monthlyRent || 0).toLocaleString()}/month`;
    } else {
      // For Both
      return `NPR ${parseInt(property.monthlyRent || 0).toLocaleString()}/month`;
    }
  };

  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    // Fallback to placeholder images
    return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80';
  };

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((property) => (
        <article
          key={property.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 transition-all hover:shadow-lg hover:-translate-y-1"
        >
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={getPropertyImage(property)}
              alt={property.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {property.featured && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Featured
              </span>
            )}
            <span className="absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-xs font-medium text-slate-700">
              {property.listingType}
            </span>
          </div>
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {property.name}
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {property.propertyType}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              📍 {property.address}, {property.city}
            </p>
            <p className="text-xs text-slate-500">
              {property.bedrooms ? `${property.bedrooms} beds • ` : ""} 
              {property.bathrooms ? `${property.bathrooms} baths • ` : ""}
              {property.squareFootage ? `${property.squareFootage} sqft` : ""}
            </p>
            {property.furnished && (
              <p className="text-xs text-slate-500">
                🏠 {property.furnished}
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm font-bold text-primary">
                {getPriceDisplay(property)}
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
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

