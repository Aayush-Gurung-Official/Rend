import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 pb-10 pt-6 md:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
