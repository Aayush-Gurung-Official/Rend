import React from "react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: "🏠",
    title: "Home search",
    description: "Filter by city and budget to find a place that fits.",
    bullets: ["City + area search", "Budget range", "Quick comparisons"],
  },
  {
    icon: "📸",
    title: "List property",
    description: "Add photos, details, and pricing for renters or buyers.",
    bullets: ["Photo upload", "Rent / sale pricing", "Instant preview"],
  },
  {
    icon: "🧾",
    title: "Agreements",
    description: "Track lease details, payments, and simple records.",
    bullets: ["Rent tracking", "Receipts (future)", "Renewal reminders (future)"],
  },
  {
    icon: "💬",
    title: "Support",
    description: "Get help understanding the process and next steps.",
    bullets: ["Beginner guidance", "Local context", "Clear steps"],
  },
  {
    icon: "🔒",
    title: "Safety checks",
    description: "Keep listings consistent and easy to verify.",
    bullets: ["Basic validation", "Structured fields", "Clean presentation"],
  },
  {
    icon: "📊",
    title: "Insights",
    description: "Lightweight analytics for owners (demo-ready).",
    bullets: ["Simple reports", "Trends (future)", "Export (future)"],
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="services-section" className="scroll-mt-24">
      <div className="card-solid p-6 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Services
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Everything you need to search, list, and manage homes in Nepal.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/auth")}
          >
            Open dashboard
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm dark:bg-slate-950/40 dark:ring-slate-800 dark:hover:bg-slate-950/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-lg">
                    {service.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {service.title}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {service.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
