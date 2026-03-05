import React from "react";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-4 text-xs text-slate-500 md:flex-row">
        <p>© {new Date().getFullYear()} Rend. Built for homes across Nepal.</p>
        <p className="text-[11px]">
          Popular locations: Kathmandu • Lalitpur • Bhaktapur • Pokhara • Butwal
        </p>
      </div>
    </footer>
  );
};

export default Footer;

