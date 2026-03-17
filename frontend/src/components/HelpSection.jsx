import React from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    title: "Search",
    description: "Choose Rent or Buy, then filter by location and budget.",
  },
  {
    title: "Compare",
    description: "Open details to review type, price, and basic amenities.",
  },
  {
    title: "Take action",
    description: "List a property or request a visit (demo placeholder).",
  },
];

const HelpSection = () => {
  const navigate = useNavigate();

  return (
    <section id="help-section" className="scroll-mt-24">
      <div className="card-solid p-6 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Help
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              New to rentals? Follow these steps — no jargon.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/auth")}
            >
              Create account
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/auth")}
            >
              List property
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {step.title}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-primary/5 p-5 ring-1 ring-primary/15">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Quick tip
          </div>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
            If you don’t see any listings, open the dashboard and add a property
            — this demo stores properties in your browser.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;
