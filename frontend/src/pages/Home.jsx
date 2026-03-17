import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingsGrid from "../components/ListingsGrid.jsx";
import ServicesSection from "../components/ServicesSection.jsx";
import HelpSection from "../components/HelpSection.jsx";
import house1 from "../assets/image/house1.png";
import house2 from "../assets/image/house2.png";
import room1 from "../assets/image/room1.png";
import room2 from "../assets/image/r00m2.png";

const Home = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    mode: "rent",
    type: "all",
    city: "",
    minPrice: "",
    maxPrice: "",
  });
  const [listings, setListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = useMemo(() => [house1, house2, room1, room2], []);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Get properties from localStorage
      const storedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      
      // Apply filters
      let filteredProperties = storedProperties;
      if (filters.mode === 'rent') {
        filteredProperties = filteredProperties.filter(p => p.listingType === 'For Rent' || p.listingType === 'For Both');
      } else if (filters.mode === 'buy') {
        filteredProperties = filteredProperties.filter(p => p.listingType === 'For Sale' || p.listingType === 'For Both');
      }

      if (filters.type && filters.type !== "all") {
        filteredProperties = filteredProperties.filter(
          (p) => String(p.propertyType || "").toLowerCase() === String(filters.type).toLowerCase()
        );
      }
      
      if (filters.city) {
        filteredProperties = filteredProperties.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
      }
      
      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter(p => {
          const price = filters.mode === 'rent' ? p.monthlyRent : p.salePrice;
          return price && parseInt(price) >= parseInt(filters.minPrice);
        });
      }
      
      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter(p => {
          const price = filters.mode === 'rent' ? p.monthlyRent : p.salePrice;
          return price && parseInt(price) <= parseInt(filters.maxPrice);
        });
      }
      
      setListings(filteredProperties);
      
      // Set featured listings (latest 6 properties)
      const latestProperties = storedProperties
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6);
      setFeaturedListings(latestProperties);
      
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

  // Listen for storage changes (e.g., another tab updates listings)
  useEffect(() => {
    const handleStorageChange = () => {
      fetchListings();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="badge">Beginner-friendly</span>
            <span className="badge">Nepal rentals</span>
            <span className="badge">Dark mode</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
              Find your next home in Nepal
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
              Search by city and budget, compare listings, and save time. Start
              simple: choose Rent or Buy, then press Search.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/auth")}
            >
              Start searching
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/auth")}
            >
              List a property
            </button>
          </div>
        </div>

        <div className="card p-3 md:p-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <img
              src={images[currentImageIndex]}
              alt={`Featured property ${currentImageIndex + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4">
              <p className="text-sm font-semibold text-white">Explore homes</p>
              <p className="text-xs text-white/80">
                New listings show up here as you add properties.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Homes matching your search
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Login to use search and filters.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost justify-start px-0 py-0 text-sm font-semibold text-primary hover:text-primary-dark sm:justify-center"
            onClick={() => navigate("/auth")}
          >
            See all
          </button>
        </div>
        <ListingsGrid listings={listings} loading={loading} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recently added
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Latest 6 properties you created in this demo.
          </p>
        </div>
        <ListingsGrid listings={featuredListings} loading={loading} />
      </section>

      <ServicesSection />
      <HelpSection />
    </div>
  );
};

export default Home;

