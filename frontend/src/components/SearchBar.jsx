import React from "react";

const SearchBar = ({ filters, onChange, onSearch }) => {
  return (
    <div className="w-full rounded-2xl bg-white/95 p-4 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200">
      <div className="mb-3 flex gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => onChange("mode", "rent")}
          className={`rounded-full px-3 py-1 ${
            filters.mode === "rent"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          Rent
        </button>
        <button
          onClick={() => onChange("mode", "buy")}
          className={`rounded-full px-3 py-1 ${
            filters.mode === "buy"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => onChange("mode", "list")}
          className={`rounded-full px-3 py-1 ${
            filters.mode === "list"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          List property
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Type
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            value={filters.type}
            onChange={(e) => onChange("type", e.target.value)}
          >
            <option value="all">All</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Location (City / Area)
          </label>
          <input
            type="text"
            placeholder="e.g. Kathmandu, Pokhara"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            value={filters.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Budget (NPR)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <button
            onClick={onSearch}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
          >
            Search Homes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

