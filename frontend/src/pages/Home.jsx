import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import ListingsGrid from "../components/ListingsGrid.jsx";
import ServicesSection from "../components/ServicesSection.jsx";
import HelpSection from "../components/HelpSection.jsx";
import { fetchListings as fetchListingsApi } from "../services/listingService.js";
import house1 from "../assets/image/house1.png";
import house2 from "../assets/image/house2.png";
import room1 from "../assets/image/room1.png";
import room2 from "../assets/image/r00m2.png";

const Home = () => {
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
  
  const images = [house1, house2, room1, room2];

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
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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

  // Listen for storage changes to update featured listings
  useEffect(() => {
    const handleStorageChange = () => {
      fetchListings();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every 5 seconds
    const interval = setInterval(() => {
      fetchListings();
    }, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [filters]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      <section className="grid gap-6 md:grid-cols-[3fr,2fr] md:items-center">
        <div className="group space-y-4 rounded-3xl bg-white/80 p-4 shadow-sm shadow-slate-900/5 ring-1 ring-transparent transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:ring-primary/30 md:p-6">
          <div className="relative h-96 w-full overflow-hidden rounded-lg">
            <img 
              src={images[currentImageIndex]} 
              alt={`Property ${currentImageIndex + 1}`} 
              className="h-full w-full object-cover transition-opacity duration-1000"
            />
          </div>
        </div>
        <div className="hidden h-full rounded-[32px] bg-slate-900/90 p-4 shadow-2xl md:block">
          <div className="relative h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">Rend Nepal</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px]">
                Live preview
              </span>
            </div>
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-slate-400">
                Property listings will appear here
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Featured homes in Nepal
          </h2>
          <button className="text-xs font-semibold text-primary hover:text-primary-dark">
            See all
          </button>
        </div>
        <ListingsGrid listings={featuredListings} loading={loading} />
      </section>

      <ServicesSection />
      <HelpSection />
    </>
  );
};

export default Home;

