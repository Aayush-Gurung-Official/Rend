import React from "react";

const helpItems = [
  {
    title: "How to find homes",
    description:
      "Use the filters above to set your city, budget and property type for Nepal.",
  },
  {
    title: "Booking a visit",
    description:
      "Shortlisted a home? Click “View details” and contact the owner or agent.",
  },
  {
    title: "Listing your property",
    description:
      "Go to the List Property page to share your house, flat or room with renters and buyers.",
  },
  {
    title: "Support in Nepal",
    description:
      "Need help? Our team can guide you with local rental rules, deposits and agreements.",
  },
];

const HelpSection = () => {
  return (
    <section
      id="help"
      className="mt-10 grid gap-5 md:grid-cols-2"
    >
      {helpItems.map((item) => (
        <div
          key={item.title}
          className="group rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-sm shadow-slate-900/20 ring-1 ring-slate-700 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/60"
        >
          <h3 className="mb-2 text-sm font-semibold">{item.title}</h3>
          <p className="text-xs text-slate-200/80">{item.description}</p>
        </div>
      ))}
    </section>
  );
};

export default HelpSection;

