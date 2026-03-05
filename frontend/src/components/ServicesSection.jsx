import React from "react";

const services = [
  {
    title: "Custom Home Search",
    description:
      "Tell us your budget and preferred area in Nepal. We help you shortlist verified homes.",
  },
  {
    title: "Sell with Rend",
    description:
      "List your house, flat or land with high quality photos and reach serious buyers.",
  },
  {
    title: "Rental Management",
    description:
      "End‑to‑end support for finding tenants, agreements and monthly rent tracking.",
  },
  {
    title: "Design & Renovation",
    description:
      "Connect with architects and contractors experienced with Nepali homes and bylaws.",
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="mt-10 grid gap-5 md:grid-cols-2"
    >
      {services.map((s) => (
        <div
          key={s.title}
          className="group rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-primary/40"
        >
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            {s.title}
          </h3>
          <p className="text-xs text-slate-600">{s.description}</p>
          <button className="mt-3 text-xs font-semibold text-primary hover:text-primary-dark">
            Learn more
          </button>
        </div>
      ))}
    </section>
  );
};

export default ServicesSection;

