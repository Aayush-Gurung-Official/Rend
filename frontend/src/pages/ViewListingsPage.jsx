import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    propertyType: "All",
    listingType: "All",
    city: "All",
  });

  useEffect(() => {
    const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
    setListings(storedProperties);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const filtered = useMemo(() => {
    let next = listings;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      next = next.filter((property) => {
        const name = String(property.name || "").toLowerCase();
        const address = String(property.address || "").toLowerCase();
        return name.includes(q) || address.includes(q);
      });
    }

    if (filters.propertyType !== "All") {
      next = next.filter((property) => property.propertyType === filters.propertyType);
    }

    if (filters.listingType !== "All") {
      next = next.filter((property) => property.listingType === filters.listingType);
    }

    if (filters.city !== "All") {
      next = next.filter((property) => String(property.city || "") === filters.city);
    }

    return next;
  }, [filters, listings]);

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

  const uniqueCities = useMemo(() => {
    const set = new Set(listings.map((p) => String(p.city || "")).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [listings]);

  const handleDeleteProperty = (propertyId) => {
    if (!window.confirm("Delete this property?")) return;
    const updated = listings.filter((p) => p.id !== propertyId);
    localStorage.setItem("properties", JSON.stringify(updated));
    setListings(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950/20">
      <div className="rend-container space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-ghost px-0 py-0 text-sm text-primary hover:text-primary-dark"
            >
              ← Back to dashboard
            </button>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
              View listings
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Manage your properties saved in this demo.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/add-property")}
          >
            + Add property
          </button>
        </header>

        <section className="card-solid p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Filters
            </h2>
            <button
              type="button"
              className="btn btn-ghost px-2 py-1 text-xs"
              onClick={() =>
              setFilters({
                search: "",
                propertyType: "All",
                listingType: "All",
                city: "All",
              })
            }
          >
              Reset
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div>
              <label className="label" htmlFor="listings-search">
                Search
              </label>
              <input
                id="listings-search"
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Name or address"
                className="input w-full"
              />
            </div>

            <div>
              <label className="label" htmlFor="listings-type">
                Property type
              </label>
              <select
                id="listings-type"
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="input w-full"
              >
                <option>All</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Studio</option>
                <option>Room</option>
                <option>Villa</option>
                <option>Land</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="listings-listingtype">
                Listing type
              </label>
              <select
                id="listings-listingtype"
                value={filters.listingType}
                onChange={(e) => handleFilterChange("listingType", e.target.value)}
                className="input w-full"
              >
                <option>All</option>
                <option>For Rent</option>
                <option>For Sale</option>
                <option>For Both</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="listings-city">
                City
              </label>
              <select
                id="listings-city"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="input w-full"
              >
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="card-solid p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Your properties <span className="text-slate-400">({filtered.length})</span>
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Tip: Click a card to preview.
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              No properties found. Try clearing filters or add a new property.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property) => (
                <article
                  key={property.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/40 dark:ring-slate-800"
                >
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => navigate(`/listing/${property.id}`)}
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={getPropertyImage(property)}
                        alt={property.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
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

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm font-bold text-primary">
                          {getPriceDisplay(property)}
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                    <button
                      type="button"
                      className="btn btn-outline rounded-full px-3 py-1.5 text-xs"
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline rounded-full px-3 py-1.5 text-xs text-red-600 hover:border-red-300 hover:text-red-700 dark:text-red-300 dark:hover:border-red-700/50"
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ViewListingsPage;
