import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import ListingsGrid from "../components/ListingsGrid.jsx";
import ServicesSection from "../components/ServicesSection.jsx";
import HelpSection from "../components/HelpSection.jsx";
import { fetchListings as fetchListingsApi } from "../services/listingService.js";

const Home = () => {
  const [filters, setFilters] = useState({
    mode: "rent",
    type: "all",
    city: "",
    minPrice: "",
    maxPrice: "",
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await fetchListingsApi(filters);
      setListings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="grid gap-6 md:grid-cols-[3fr,2fr] md:items-center">
        <div className="group space-y-4 rounded-3xl bg-white/80 p-4 shadow-sm shadow-slate-900/5 ring-1 ring-transparent transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:ring-primary/30 md:p-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Find your perfect home in <span className="text-primary">Nepal</span>
          </h1>
          <p className="text-sm text-slate-600 md:text-base">
            Browse verified houses, apartments and rooms to{" "}
            <span className="font-semibold">buy</span> or{" "}
            <span className="font-semibold">rent</span> across Kathmandu,
            Pokhara and growing cities in Nepal.
          </p>
          <SearchBar
            filters={filters}
            onChange={handleChange}
            onSearch={fetchListings}
          />
        </div>
        <div className="hidden h-full rounded-[32px] bg-slate-900/90 p-4 shadow-2xl md:block">
          <div className="relative h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">Rend Nepal</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px]">
                Live preview
              </span>
            </div>
            <div className="h-[260px] overflow-hidden rounded-xl border border-slate-700 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                <span>Kathmandu Rentals</span>
                <span>Lazimpat • Bhaisepati • Koteshwor</span>
              </div>
              <div className="grid h-full grid-cols-2 gap-2 p-3">
                <div className="space-y-2">
                  <div className="h-20 w-full rounded-lg bg-slate-200" />
                  <div className="h-20 w-full rounded-lg bg-slate-200" />
                  <div className="h-10 w-3/4 rounded-lg bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-full rounded-lg bg-slate-100" />
                  <div className="h-10 w-11/12 rounded-lg bg-slate-100" />
                  <div className="h-10 w-9/12 rounded-lg bg-slate-100" />
                  <div className="h-10 w-10/12 rounded-lg bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Featured homes in Nepal
          </h2>
          <button className="text-xs font-semibold text-primary hover:text-primary-dark">
            See all
          </button>
        </div>
        <ListingsGrid listings={listings} loading={loading} />
      </section>

      <ServicesSection />
      <HelpSection />
    </>
  );
};

export default Home;

