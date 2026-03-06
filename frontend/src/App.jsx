import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      <Navbar />
      <main className="flex-1 w-full px-4 pb-10 pt-6 md:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
