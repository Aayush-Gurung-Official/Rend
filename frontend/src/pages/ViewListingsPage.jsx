import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'All',
    listingType: 'All',
    priceRange: 'All',
    city: 'All'
  });

  useEffect(() => {
    // Load listings from localStorage
    const storedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    setListings(storedProperties);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const getFilteredProperties = () => {
    let filtered = listings;
    
    if (filters.search) {
      filtered = filtered.filter(property => 
        property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.propertyType !== 'All') {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }
    
    if (filters.listingType !== 'All') {
      filtered = filtered.filter(property => property.listingType === filters.listingType);
    }
    
    return filtered;
  };

  const handleEditProperty = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const updatedListings = listings.filter(p => p.id !== propertyId);
      localStorage.setItem('properties', JSON.stringify(updatedListings));
      setListings(updatedListings);
      alert('Property deleted successfully!');
    }
  };

  const getPriceDisplay = (property) => {
    if (property.listingType === 'For Sale') {
      return `NPR ${parseInt(property.salePrice || 0).toLocaleString()}`;
    } else if (property.listingType === 'For Rent') {
      return `NPR ${parseInt(property.monthlyRent || 0).toLocaleString()}/month`;
    } else {
      return `NPR ${parseInt(property.monthlyRent || 0).toLocaleString()}/month`;
    }
  };

  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return 'https://images.unsplash.com/photo-1512917770757-5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-primary hover:text-primary/80 font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">View All Listings</h1>
          <p className="text-gray-600">Manage and view all your property listings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search properties..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option>All</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Studio</option>
                <option>Room</option>
                <option>Villa</option>
                <option>Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange('listingType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option>All</option>
                <option>For Rent</option>
                <option>For Sale</option>
                <option>For Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option>All</option>
                <option>Under 50,000</option>
                <option>50,000 - 100,000</option>
                <option>100,000 - 200,000</option>
                <option>Above 200,000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Your Properties ({getFilteredProperties().length})
            </h2>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              + Add New Property
            </button>
          </div>
          
          {getFilteredProperties().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">🏠</div>
              <p className="text-gray-500 mt-2">No properties found matching your filters.</p>
              <p className="text-gray-400">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredProperties().map((property) => (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={getPropertyImage(property)}
                      alt={property.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {property.featured && (
                      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        Featured
                      </span>
                    )}
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-xs font-medium">
                      {property.listingType}
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {property.name}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {property.propertyType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      📍 {property.address}, {property.city}
                    </p>
                    <p className="text-xs text-slate-500">
                      {property.bedrooms ? `${property.bedrooms} beds • ` : ""} 
                      {property.bathrooms ? `${property.bathrooms} baths • ` : ""}
                      {property.squareFootage ? `${property.squareFootage} sqft` : ""}
                    </p>
                    {property.furnished && (
                      <p className="text-xs text-slate-500">
                        🏠 {property.furnished}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm font-bold text-primary">
                        {getPriceDisplay(property)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProperty(property.id)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewListingsPage;
