import React from "react";

const SearchBar = ({ filters, onChange, onSearch }) => {
  return (
    <div className="card-solid w-full p-4 md:p-5">
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onChange("mode", "rent")}
          aria-pressed={filters.mode === "rent"}
          className={`rounded-full px-3 py-1.5 transition ${
            filters.mode === "rent"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          Rent
        </button>
        <button
          onClick={() => onChange("mode", "buy")}
          aria-pressed={filters.mode === "buy"}
          className={`rounded-full px-3 py-1.5 transition ${
            filters.mode === "buy"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => onChange("mode", "list")}
          aria-pressed={filters.mode === "list"}
          className={`rounded-full px-3 py-1.5 transition ${
            filters.mode === "list"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          List property
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="label">Property type</label>
          <select
            className="input w-full"
            value={filters.type}
            onChange={(e) => onChange("type", e.target.value)}
          >
            <option value="all">Any type</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Room">Room</option>
            <option value="Studio">Studio</option>
            <option value="Villa">Villa</option>
            <option value="Land">Land</option>
          </select>
        </div>
        <div>
          <label className="label">Location</label>
          <input
            type="text"
            placeholder="e.g. Kathmandu, Pokhara"
            className="input w-full"
            value={filters.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Budget (NPR)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="input flex-1"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              className="input flex-1"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <button
            onClick={onSearch}
            className="btn btn-primary w-full"
          >
            {filters.mode === "list" ? "Go to listing form" : "Search homes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

