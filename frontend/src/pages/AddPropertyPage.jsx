import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('basic-info');
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    listingType: 'For Rent',
    propertyType: 'Apartment',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    monthlyRent: '',
    securityDeposit: '',
    salePrice: '',
    description: '',
    leaseTerms: '12 Months',
    utilities: '',
    amenities: '',
    furnished: 'Unfurnished',
    parking: 'None',
    floorNumber: '',
    totalFloors: '',
    yearBuilt: '',
    facingDirection: 'North',
    nearbyPlaces: ''
  });

  const handlePropertyFormChange = (field, value) => {
    setPropertyForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePropertySubmit = (e) => {
    e.preventDefault();
    // Store property in localStorage
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const newProperty = {
      id: Date.now(),
      ...propertyForm,
      createdAt: new Date().toISOString()
    };
    properties.push(newProperty);
    localStorage.setItem('properties', JSON.stringify(properties));
    
    alert('Property added successfully!');
    navigate('/dashboard');
  };

  const user = {
    username: 'owner',
    phone: '+977-1234567'
  };

  const avatarLetter = user.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <section className="flex min-h-[70vh] flex-col gap-4 md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 md:w-60">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {avatarLetter}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user.username || "Your profile"}
            </p>
            <p className="text-xs text-slate-500">{user.phone}</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {["basic-info", "pricing", "details", "media"].map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left capitalize ${
                active === key
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>
                {key === "basic-info" ? "Basic Information" : 
                 key === "pricing" ? "Pricing Details" :
                 key === "details" ? "Additional Details" :
                 key === "media" ? "Photos & Media" : key}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content Area - Single Form */}
      <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600">Create a detailed listing for your property</p>
        </div>

        <form onSubmit={handlePropertySubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className={`space-y-6 ${active !== "basic-info" ? "opacity-50 pointer-events-none" : ""}`}>
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Property Name</label>
                  <input 
                    type="text" 
                    value={propertyForm.name}
                    onChange={(e) => handlePropertyFormChange('name', e.target.value)}
                    placeholder="The Willow Apartments - Unit 3B" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <input 
                    type="text" 
                    value={propertyForm.address}
                    onChange={(e) => handlePropertyFormChange('address', e.target.value)}
                    placeholder="123 Main St, Springfield" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    value={propertyForm.city}
                    onChange={(e) => handlePropertyFormChange('city', e.target.value)}
                    placeholder="City" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    required
                  />
                  <input 
                    type="text" 
                    value={propertyForm.state}
                    onChange={(e) => handlePropertyFormChange('state', e.target.value)}
                    placeholder="State" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    required
                  />
                  <input 
                    type="text" 
                    value={propertyForm.zipCode}
                    onChange={(e) => handlePropertyFormChange('zipCode', e.target.value)}
                    placeholder="Zip Code" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Listing Type</label>
                  <select 
                    value={propertyForm.listingType}
                    onChange={(e) => handlePropertyFormChange('listingType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option>For Rent</option>
                    <option>For Sale</option>
                    <option>For Both</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Property Type</label>
                  <select 
                    value={propertyForm.propertyType}
                    onChange={(e) => handlePropertyFormChange('propertyType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Studio</option>
                    <option>Room</option>
                    <option>Villa</option>
                    <option>Land</option>
                  </select>
                </div>

                {/* Show bedrooms/bathrooms for residential properties */}
                {propertyForm.propertyType !== 'Land' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bedrooms</label>
                        <input 
                          type="number" 
                          value={propertyForm.bedrooms}
                          onChange={(e) => handlePropertyFormChange('bedrooms', e.target.value)}
                          placeholder="2" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bathrooms</label>
                        <input 
                          type="number" 
                          value={propertyForm.bathrooms}
                          onChange={(e) => handlePropertyFormChange('bathrooms', e.target.value)}
                          placeholder="1.5" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                        />
                      </div>
                    </div>
                    
                    {/* Show square footage for all except land */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Square Footage</label>
                      <input 
                        type="number" 
                        value={propertyForm.squareFootage}
                        onChange={(e) => handlePropertyFormChange('squareFootage', e.target.value)}
                        placeholder="1100" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                      />
                    </div>
                  </>
                )}
                
                {/* Show floor number only for apartments */}
                {propertyForm.propertyType === 'Apartment' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Floor Number</label>
                    <input 
                      type="text" 
                      value={propertyForm.floorNumber}
                      onChange={(e) => handlePropertyFormChange('floorNumber', e.target.value)}
                      placeholder="3" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                )}
                
                {/* Show total floors only for houses and apartments */}
                {(propertyForm.propertyType === 'House' || propertyForm.propertyType === 'Apartment') && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Floors</label>
                    <input 
                      type="number" 
                      value={propertyForm.totalFloors}
                      onChange={(e) => handlePropertyFormChange('totalFloors', e.target.value)}
                      placeholder="5" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className={`space-y-6 ${active !== "pricing" ? "opacity-50 pointer-events-none" : ""}`}>
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Pricing Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pricing based on listing type */}
              {(propertyForm.listingType === 'For Rent' || propertyForm.listingType === 'For Both') && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent (NPR)</label>
                    <input 
                      type="number" 
                      value={propertyForm.monthlyRent}
                      onChange={(e) => handlePropertyFormChange('monthlyRent', e.target.value)}
                      placeholder="25000" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Security Deposit (NPR)</label>
                    <input 
                      type="number" 
                      value={propertyForm.securityDeposit}
                      onChange={(e) => handlePropertyFormChange('securityDeposit', e.target.value)}
                      placeholder="50000" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>
              )}

              {(propertyForm.listingType === 'For Sale' || propertyForm.listingType === 'For Both') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sale Price (NPR)</label>
                  <input 
                    type="number" 
                    value={propertyForm.salePrice}
                    onChange={(e) => handlePropertyFormChange('salePrice', e.target.value)}
                    placeholder="5000000" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className={`space-y-6 ${active !== "details" ? "opacity-50 pointer-events-none" : ""}`}>
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Additional Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Additional details for residential properties */}
                {propertyForm.propertyType !== 'Land' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Furnished</label>
                      <select 
                        value={propertyForm.furnished}
                        onChange={(e) => handlePropertyFormChange('furnished', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option>Unfurnished</option>
                        <option>Semi-Furnished</option>
                        <option>Fully Furnished</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Parking</label>
                      <select 
                        value={propertyForm.parking}
                        onChange={(e) => handlePropertyFormChange('parking', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option>None</option>
                        <option>1 Bike</option>
                        <option>2 Bikes</option>
                        <option>1 Car</option>
                        <option>2 Cars</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Year Built</label>
                      <input 
                        type="number" 
                        value={propertyForm.yearBuilt}
                        onChange={(e) => handlePropertyFormChange('yearBuilt', e.target.value)}
                        placeholder="2020" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                  </>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Facing Direction</label>
                    <select 
                      value={propertyForm.facingDirection}
                      onChange={(e) => handlePropertyFormChange('facingDirection', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option>North</option>
                      <option>South</option>
                      <option>East</option>
                      <option>West</option>
                      <option>North-East</option>
                      <option>North-West</option>
                      <option>South-East</option>
                      <option>South-West</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nearby Places</label>
                    <input 
                      type="text" 
                      value={propertyForm.nearbyPlaces}
                      onChange={(e) => handlePropertyFormChange('nearbyPlaces', e.target.value)}
                      placeholder="School, Hospital, Market, etc." 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea 
                    rows="4" 
                    value={propertyForm.description}
                    onChange={(e) => handlePropertyFormChange('description', e.target.value)}
                    placeholder="Enter your description here..." 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>

                {/* Show lease terms only for rental properties */}
                {(propertyForm.listingType === 'For Rent' || propertyForm.listingType === 'For Both') && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lease Terms</label>
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 cursor-pointer">12 Months</span>
                       <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">6 Months</span>
                       <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">Month-to-Month</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className={`space-y-8 ${active !== "media" ? "opacity-50 pointer-events-none" : ""}`}>
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Photos & Media</h2>
            <div className="space-y-8">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📷</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Upload Property Photos</h3>
                <p className="text-gray-500 mb-6">Add high-quality photos to attract more buyers and renters</p>
                <button 
                  type="button"
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Choose Files
                </button>
                <p className="text-sm text-gray-400 mt-4">PNG, JPG up to 10MB each</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Parking', 'WiFi', 'Air Conditioning', 'Furnished', 'Security', 'Elevator'].map(amenity => (
                    <label key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
            >
              Save Property
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddPropertyPage;
