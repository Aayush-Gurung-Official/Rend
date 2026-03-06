import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchListings } from "../services/listingService.js";

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchListings({});
        const match = all.find((l) => String(l.id) === String(id));
        setListing(match || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading listing…</p>;
  }

  if (!listing) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Listing not found.</p>
        <button
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-[3fr,2fr]">
      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200">
        <div className="h-60 w-full overflow-hidden rounded-xl">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{listing.title}</h1>
          <p className="text-sm text-slate-600">
            {listing.area}, {listing.city}
          </p>
        </div>
        <p className="text-sm text-slate-600">
          {listing.beds ? `${listing.beds} beds • ` : ""}
          {listing.baths} baths • {listing.type}
        </p>
      </div>

      <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Monthly rent
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Kathmandu area
          </span>
        </div>
        <p className="text-2xl font-bold text-primary">
          NPR {listing.price.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500">
          Contact details and booking flow can be connected here later.
        </p>
        <button className="mt-2 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Request visit
        </button>
        <button
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
          onClick={() => navigate(-1)}
        >
          Back to listings
        </button>
      </aside>
    </section>
  );
};

export default ListingDetails;

