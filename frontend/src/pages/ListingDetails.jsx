import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const view = useMemo(() => {
    if (!listing) return null;

    const title = listing.title || listing.name || "Listing";
    const city = listing.city || "";
    const area = listing.area || listing.address || "";
    const type = listing.type || listing.propertyType || "";
    const beds = listing.beds ?? listing.bedrooms ?? null;
    const baths = listing.baths ?? listing.bathrooms ?? null;
    const price = listing.price ?? listing.monthlyRent ?? listing.salePrice ?? null;
    const image =
      listing.imageUrl ||
      (listing.images && listing.images.length > 0 ? listing.images[0] : null) ||
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&h=800&q=80";

    return { title, city, area, type, beds, baths, price, image };
  }, [listing]);

  if (loading) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Loading listing…</p>;
  }

  if (!listing || !view) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">Listing not found.</p>
        <button type="button" className="btn btn-primary rounded-full" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <button type="button" className="btn btn-ghost px-0 py-0 text-sm" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
        <div className="card-solid p-4 md:p-5">
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
            <img
              src={view.image}
              alt={view.title}
              className="h-72 w-full object-cover md:h-80"
              loading="lazy"
            />
          </div>

          <div className="mt-4 space-y-2">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">
              {view.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">📍</span>{" "}
              {[view.area, view.city].filter(Boolean).join(", ")}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {view.type ? <span className="badge mr-2 align-middle">{view.type}</span> : null}
              {view.beds != null ? `${view.beds} beds` : null}
              {view.baths != null ? `${view.beds != null ? " • " : ""}${view.baths} baths` : null}
            </p>
          </div>
        </div>

        <aside className="card-solid p-4 md:sticky md:top-24 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Price
              </p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {view.price != null ? `NPR ${Number(view.price).toLocaleString()}` : "Contact for price"}
              </p>
            </div>
            <span className="badge">Demo</span>
          </div>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Contact details and booking flow can be connected here later.
          </p>

          <div className="mt-4 grid gap-2">
            <button type="button" className="btn btn-primary w-full">
              Request visit
            </button>
            <button type="button" className="btn btn-outline w-full" onClick={() => navigate(-1)}>
              Back to listings
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ListingDetails;
