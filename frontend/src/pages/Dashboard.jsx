import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { updateProfile } from "../services/authService.js";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [active, setActive] = useState("home"); // home | chat | profile | settings
  const [settingsActiveTab, setSettingsActiveTab] = useState("Account");
  const [isPublic, setIsPublic] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'Property Agent', text: 'Hello! How can I help you find your perfect home today?', type: 'incoming', time: '10:00 AM' },
    { id: 2, sender: 'You', text: 'I am looking for a 2BHK apartment in Kathmandu', type: 'outgoing', time: '10:05 AM' },
    { id: 3, sender: 'Property Agent', text: 'Great! I have several options available. What is your budget range?', type: 'incoming', time: '10:06 AM' },
  ]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [propertyUpdates, setPropertyUpdates] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [propertyImages, setPropertyImages] = useState([]);
  const [listings, setListings] = useState([]);
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: 'Raj Kumar',
      property: 'Modern Thamel Apartment',
      unit: 'Unit 3B',
      rent: 'NPR 35,000',
      dueDate: '2024-03-15',
      status: 'Paid',
      contact: '9841234567',
      email: 'raj.kumar@email.com'
    },
    {
      id: 2,
      name: 'Sita Sharma',
      property: 'Cozy Boudha House',
      unit: 'Unit 1A',
      rent: 'NPR 45,000',
      dueDate: '2024-03-10',
      status: 'Pending',
      contact: '9849876543',
      email: 'sita.sharma@email.com'
    }
  ]);

  // Initialize listings from localStorage
  useEffect(() => {
    const storedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    setListings(storedProperties);
  }, []);
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    listingType: 'For Rent', // For Rent, For Sale, For Both
    propertyType: 'Apartment',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    monthlyRent: '',
    securityDeposit: '',
    salePrice: '',
    description: '',
    leaseTerms: ['12 Months'],
    utilities: [],
    amenities: [],
    furnished: 'Unfurnished',
    parking: 'None',
    floorNumber: '',
    totalFloors: '',
    yearBuilt: '',
    facingDirection: '',
    nearbyPlaces: ''
  });
  const [profileForm, setProfileForm] = useState({ 
    username: "", 
    profileImage: "",
    fullName: "",
    email: "",
    bio: ""
  });
  const [saving, setSaving] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const propertyImageInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = window.localStorage.getItem("rendUser");
    const storedUserType = window.localStorage.getItem("userType");
    
    if (!stored) {
      navigate("/auth", { replace: true });
      return;
    }
    
    if (!storedUserType) {
      navigate("/user-type", { replace: true });
      return;
    }
    
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setUserType(storedUserType);
    setProfileForm({
      username: parsed.username || "",
      profileImage: parsed.profileImage || "",
      fullName: parsed.fullName || "",
      email: parsed.email || "",
      bio: parsed.bio || ""
    });
    setProfileImagePreview(parsed.profileImage || null);
  }, [navigate]);

  const handleLogout = () => {
    window.localStorage.removeItem("rendUser");
    window.localStorage.removeItem("userType");
    navigate("/");
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProfileImagePreview(imageUrl);
        setProfileForm(prev => ({ ...prev, profileImage: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'You',
      text: message,
      type: 'outgoing',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory([...chatHistory, newMessage]);
    setMessage('');
  };

  const handlePropertyImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setPropertyImages(prev => [...prev, ...newImages]);
  };

  const handlePropertyFormChange = (field, value) => {
    setPropertyForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePropertySubmit = (e) => {
    e.preventDefault();
    
    // Store the property data
    const newProperty = {
      ...propertyForm,
      images: propertyImages,
      id: Date.now(),
      ownerId: user.id,
      ownerName: user.username,
      createdAt: new Date().toISOString(),
      status: 'Active',
      featured: false,
      views: 0,
      inquiries: 0
    };
    
    // Get existing properties or create empty array
    const existingProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    existingProperties.push(newProperty);
    localStorage.setItem('properties', JSON.stringify(existingProperties));
    
    // Update listings state
    setListings(existingProperties);
    
    // Reset form and close
    setPropertyForm({
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
      leaseTerms: ['12 Months'],
      utilities: [],
      amenities: [],
      furnished: 'Unfurnished',
      parking: 'None',
      floorNumber: '',
      totalFloors: '',
      yearBuilt: '',
      facingDirection: '',
      nearbyPlaces: ''
    });
    setPropertyImages([]);
    setShowAddProperty(false);
    
    alert('Property added successfully!');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      const updated = await updateProfile({
        id: user.id,
        username: profileForm.username,
        profileImage: profileForm.profileImage || null,
        fullName: profileForm.fullName,
        email: profileForm.email,
        bio: profileForm.bio,
      });
      setUser(updated);
      window.localStorage.setItem("rendUser", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const avatarLetter = user.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <section className="flex min-h-[70vh] flex-col gap-4 md:flex-row">
      <aside className="w-full rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 md:w-60">
        <div className="mb-4 flex items-center gap-3">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {avatarLetter}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user.username || "Your profile"}
            </p>
            <p className="text-xs text-slate-500">{user.phone}</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {userType === "owner" ? 
            // Owner navigation - includes property management
            ["home", "add-property", "manage-tenants", "view-listings", "financial-reports", "chat", "profile", "settings"].map((key) => (
              <button
                key={key}
                onClick={() => {
                  // Set active state for all quick actions instead of navigation
                  setActive(key);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left capitalize ${
                  active === key
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>
                  {key === "home" ? "Dashboard home" : 
                   key === "add-property" ? "Add Property" :
                   key === "manage-tenants" ? "Manage Tenants" :
                   key === "view-listings" ? "View Listings" :
                   key === "financial-reports" ? "Financial Reports" :
                   key === "chat" ? "Chat" :
                   key === "profile" ? "Profile" :
                   key === "settings" ? "Settings" : key}
                </span>
              </button>
            ))
          :
            // User navigation - only tenant-relevant items
            ["home", "pay-rent", "maintenance", "lease", "contact", "chat", "profile", "settings"].map((key) => (
              <button
                key={key}
                onClick={() => {
                  // Set active state for all quick actions instead of navigation
                  setActive(key);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left capitalize ${
                  active === key
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>
                  {key === "home" ? "Dashboard home" : 
                   key === "pay-rent" ? "Pay Rent" :
                   key === "maintenance" ? "Request Maintenance" :
                   key === "lease" ? "Lease Agreement" :
                   key === "contact" ? "Contact Landlord" :
                   key === "chat" ? "Chat" :
                   key === "profile" ? "Profile" :
                   key === "settings" ? "Settings" : key}
                </span>
              </button>
            ))
          }
        </nav>
      </aside>

      <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200">
        {active === "home" && (
          <div className="space-y-3">
            {userType === "owner" ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Welcome back, {user.username || "owner"} 👋
                  </h1>
                  <p className="text-sm text-slate-600">
                    Manage your property listings and track your rental business.
                  </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Total Properties</p>
                        <p className="text-2xl font-bold text-slate-900">12</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Active Rentals</p>
                        <p className="text-2xl font-bold text-slate-900">8</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">NPR 2.4L</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Pending Requests</p>
                        <p className="text-2xl font-bold text-slate-900">3</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner Specific Sections */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Properties</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Modern Apartment</p>
                          <p className="text-xs text-gray-600">Thamel, Kathmandu</p>
                          <p className="text-sm font-bold text-green-600">NPR 25,000/month</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Cozy Studio</p>
                          <p className="text-xs text-gray-600">Patan, Lalitpur</p>
                          <p className="text-sm font-bold text-green-600">NPR 15,000/month</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Applications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Rajesh Kumar</p>
                          <p className="text-xs text-gray-600">Applied for Unit A-101</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">Approve</button>
                          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">Reject</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Sita Sharma</p>
                          <p className="text-xs text-gray-600">Applied for Unit B-205</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // User Dashboard - Tenant View
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Welcome back, {user.username || "tenant"} 👋
                  </h1>
                  <p className="text-sm text-slate-600">
                    Manage your rented properties and payments.
                  </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Current Rent</p>
                        <p className="text-2xl font-bold text-slate-900">NPR 25,000</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Next Due Date</p>
                        <p className="text-2xl font-bold text-slate-900">Mar 15</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Payment Status</p>
                        <p className="text-2xl font-bold text-slate-900">Paid</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Specific Sections */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">My Rented Properties</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Modern Apartment</p>
                          <p className="text-xs text-gray-600">Thamel, Kathmandu • Unit A-101</p>
                          <p className="text-sm font-bold text-blue-600">NPR 25,000/month</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Studio Room</p>
                          <p className="text-xs text-gray-600">Patan, Lalitpur • Unit B-205</p>
                          <p className="text-sm font-bold text-blue-600">NPR 18,000/month</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">March 2024</p>
                          <p className="text-xs text-gray-600">Paid on March 1, 2024</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">NPR 25,000</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">February 2024</p>
                          <p className="text-xs text-gray-600">Paid on February 1, 2024</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">NPR 25,000</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">January 2024</p>
                          <p className="text-xs text-gray-600">Paid on January 1, 2024</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">NPR 25,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {active === "pay-rent" && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay Rent</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Month</h3>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">March 2024 Rent</span>
                      <span className="text-2xl font-bold text-blue-600">NPR 25,000</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Due Date</span>
                      <span className="text-lg font-semibold text-orange-600">March 15, 2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Late Fee</span>
                      <span className="text-lg font-semibold text-red-600">NPR 500/day</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" name="payment" className="text-primary" />
                        <span className="font-medium">Credit/Debit Card</span>
                      </label>
                    </div>
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" name="payment" className="text-primary" />
                        <span className="font-medium">Bank Transfer</span>
                      </label>
                    </div>
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" name="payment" className="text-primary" />
                        <span className="font-medium">Digital Wallet</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold">
                  Pay NPR 25,000
                </button>
              </div>
            </div>
          </div>
        )}

        {active === "maintenance" && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Maintenance</h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    <option>Modern Apartment - Unit A-101</option>
                    <option>Studio Room - Unit B-205</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>HVAC</option>
                    <option>Appliance</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    <option>Emergency</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    rows="4" 
                    placeholder="Please describe the maintenance issue in detail..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setActive('home')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {active === "lease" && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lease Agreement</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Property Name</p>
                      <p className="font-medium">Modern Apartment</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unit</p>
                      <p className="font-medium">A-101</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">Thamel, Kathmandu</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Rent</p>
                      <p className="font-medium text-blue-600">NPR 25,000</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Lease Terms</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lease Start Date</span>
                      <span className="font-medium">January 1, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lease End Date</span>
                      <span className="font-medium">December 31, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit</span>
                      <span className="font-medium text-green-600">NPR 50,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Notice Period</span>
                      <span className="font-medium">30 days</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                  <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                    Download PDF
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === "contact" && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Landlord</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Landlord Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div>
                        <p className="font-medium text-lg">Rajesh Kumar</p>
                        <p className="text-sm text-gray-600">Property Owner</p>
                        <p className="text-sm text-green-600">● Online</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8a7 7 0 00-7 7h14a7 7 0 007 7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">+977-987654321</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8a7 7 0 00-7 7h14a7 7 0 007 7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">rajesh.kumar@rent.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input 
                        type="text" 
                        placeholder="Enter subject..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea 
                        rows="4" 
                        placeholder="Type your message here..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-4">
                      <button 
                        type="button"
                        onClick={() => setActive('home')}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === "profile" && (
          <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>

            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                {/* Profile Image Container */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-gray-100 flex items-center justify-center">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>

                {/* Camera Button Overlay */}
                <button
                  onClick={handleCameraClick}
                  className="absolute bottom-1 right-1 bg-primary p-2 rounded-full text-white hover:bg-primary/90 transition-colors shadow-lg"
                  title="Upload Photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Click camera to update photo</p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Sarah J. Miller"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setActive('home')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 shadow-md transition disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {active === "settings" && (
          <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* --- Sidebar --- */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
              <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">R</div>
                <span className="font-bold text-gray-800 tracking-tight text-xl">REND</span>
              </div>
              
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Settings</p>
                {[
                  { name: 'Account', icon: '👤' },
                  { name: 'Security', icon: '🔒' },
                  { name: 'Notifications', icon: '🔔' },
                  { name: 'Billing', icon: '💳' },
                  { name: 'Integrations', icon: '⚙️' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSettingsActiveTab(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settingsActiveTab === item.name 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </nav>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

                {/* Section: Account */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                      <input 
                        type="text" 
                        value={profileForm.username}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="username" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Email</label>
                      <input 
                        type="email" 
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="email@example.com" 
                      />
                    </div>
                  </div>
                </section>

                {/* Section: Personal Info */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h3 className="text-md font-bold text-gray-800 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={profileForm.fullName?.split(' ')[0] || ''}
                        onChange={(e) => {
                          const lastName = profileForm.fullName?.split(' ').slice(1).join(' ') || '';
                          setProfileForm(prev => ({ ...prev, fullName: `${e.target.value} ${lastName}`.trim() }));
                        }}
                        className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={profileForm.fullName?.split(' ').slice(1).join(' ') || ''}
                        onChange={(e) => {
                          const firstName = profileForm.fullName?.split(' ')[0] || '';
                          setProfileForm(prev => ({ ...prev, fullName: `${firstName} ${e.target.value}`.trim() }));
                        }}
                        className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Location</label>
                      <input 
                        type="text" 
                        placeholder="City, Country"
                        className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </div>
                  </div>
                </section>

                {/* Section: Visibility (Toggle) */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-bold text-gray-800">Profile Visibility</h3>
                    <p className="text-sm text-gray-500">Manage who can see your profile and activity</p>
                  </div>
                  <button 
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isPublic ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </section>

                {/* Additional Settings Sections based on active tab */}
                {settingsActiveTab === 'Security' && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-md font-bold text-gray-800 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <button 
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                          className={`px-4 py-2 rounded-lg text-sm ${twoFactorEnabled ? 'bg-red-500 text-white' : 'bg-primary text-white'}`}
                        >
                          {twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Change Password</p>
                          <p className="text-sm text-gray-500">Update your password regularly</p>
                        </div>
                        <button 
                          onClick={() => alert('Password change feature coming soon!')}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {settingsActiveTab === 'Notifications' && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-md font-bold text-gray-800 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive property updates and alerts via email</p>
                        </div>
                        <button 
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${emailNotifications ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Property Updates</p>
                          <p className="text-sm text-gray-500">Get notified about new matching properties</p>
                        </div>
                        <button 
                          onClick={() => setPropertyUpdates(!propertyUpdates)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${propertyUpdates ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${propertyUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Payment Reminders</p>
                          <p className="text-sm text-gray-500">Receive rent payment due date reminders</p>
                        </div>
                        <button 
                          onClick={() => setPropertyUpdates(!propertyUpdates)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${propertyUpdates ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${propertyUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Marketing Communications</p>
                          <p className="text-sm text-gray-500">Receive promotional offers and newsletters</p>
                        </div>
                        <button className="w-12 h-6 rounded-full p-1 bg-gray-300 transition-colors duration-300">
                          <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {settingsActiveTab === 'Account' && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-md font-bold text-gray-800 mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                          <select className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50">
                            <option>Property Owner</option>
                            <option>Tenant</option>
                            <option>Agent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                          <input type="text" value="March 2024" readOnly className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input type="tel" placeholder="+977-98xxxxxxxx" className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                          <input type="date" className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea rows="3" placeholder="Your complete address" className="w-full p-2 border border-gray-300 rounded-lg"></textarea>
                      </div>
                    </div>
                  </section>
                )}

                {settingsActiveTab === 'Privacy' && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-md font-bold text-gray-800 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Profile Visibility</p>
                          <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                        </div>
                        <button className="w-12 h-6 rounded-full p-1 bg-primary transition-colors duration-300">
                          <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Show Contact Information</p>
                          <p className="text-sm text-gray-500">Display your email and phone to property owners</p>
                        </div>
                        <button className="w-12 h-6 rounded-full p-1 bg-gray-300 transition-colors duration-300">
                          <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Data Sharing</p>
                          <p className="text-sm text-gray-500">Share anonymous usage data to improve our services</p>
                        </div>
                        <button className="w-12 h-6 rounded-full p-1 bg-gray-300 transition-colors duration-300">
                          <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {settingsActiveTab === 'Billing' && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-md font-bold text-gray-800 mb-4">Billing & Subscription</h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-800">Current Plan: Free</h4>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Active</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">List up to 3 properties, basic features included</p>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                          Upgrade to Premium
                        </button>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Payment Methods</h4>
                        <div className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">VISA</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                              <p className="text-xs text-gray-500">Expires 12/25</p>
                            </div>
                          </div>
                          <button className="text-red-600 text-sm hover:text-red-700">Remove</button>
                        </div>
                        <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          + Add Payment Method
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* Footer Actions */}
                <div className="flex justify-between items-center mt-10">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 text-sm font-bold text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Logout
                  </button>
                  <div className="flex gap-4">
                    <button className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                    <button 
                      onClick={handleProfileSave}
                      disabled={saving}
                      className="px-8 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}

        {/* User Dashboard for Tenants */}
        {userType === 'user' && active === "home" && (
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            
            {/* Rent Payment Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">💳 Rent Payment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Current Rent</p>
                  <p className="text-2xl font-bold">NPR 25,000</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Due Date</p>
                  <p className="text-2xl font-bold">March 15</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Status</p>
                  <p className="text-2xl font-bold">Paid</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button 
                  onClick={() => navigate('/user-dashboard')}
                  className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Pay Rent Now
                </button>
                <button 
                  onClick={() => navigate('/user-dashboard')}
                  className="bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Payment History
                </button>
              </div>
            </div>

            {/* My Properties */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Rented Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <h3 className="font-semibold text-gray-900">Modern Apartment</h3>
                  <p className="text-sm text-gray-600">Thamel, Kathmandu</p>
                  <p className="text-sm text-gray-500">2 beds • 1 bath • 800 sqft</p>
                  <p className="text-lg font-bold text-primary mt-2">NPR 25,000/month</p>
                </div>
              </div>
            </div>

            {/* Maintenance Requests */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Maintenance Requests</h2>
              <button 
                onClick={() => navigate('/user-dashboard')}
                className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
              >
                + New Request
              </button>
            </div>
          </div>
        )}

        {active === "chat" && (
          <div className="flex h-screen bg-gray-100 font-sans">
            {/* --- Left Sidebar: Conversation List --- */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Conversations</h2>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {/* Active Conversation */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">PA</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 truncate">Property Agent</span>
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>
                    <p className="text-sm text-blue-600 truncate font-medium">active</p>
                  </div>
                </div>

                {/* Other Conversations */}
                {[
                  { name: 'Support Team', status: 'online', initial: 'ST' },
                  { name: 'Owner: Rajesh K.', status: 'away', initial: 'RK' },
                  { name: 'Listing Manager', status: 'offline', initial: 'LM' }
                ].map((conv, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      conv.status === 'online' ? 'bg-green-500' : 
                      conv.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}>
                      {conv.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{conv.name}</p>
                      <p className="text-sm text-gray-500 truncate">{conv.status === 'online' ? 'active' : 'last seen 5m ago'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* --- Main Content: Active Chat --- */}
            <main className="flex-1 flex flex-col bg-white">
              {/* Header */}
              <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">PA</div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">Property Agent</h3>
                    <p className="text-xs text-green-500 font-semibold uppercase tracking-wider">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-gray-500">
                  <button className="hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </header>

              {/* Message Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-3 ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'incoming' && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm mb-1">PA</div>
                    )}
                    <div className={`max-w-[70%] group relative`}>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${
                        msg.type === 'outgoing' 
                          ? 'bg-[#1e3a8a] text-white rounded-br-none' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Footer */}
              <footer className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <button type="button" className="p-2 text-gray-400 hover:text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700"
                  />
                  <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-primary">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button type="button" className="p-2 text-gray-400 hover:text-primary">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button type="button" className="p-2 text-gray-400 hover:text-primary">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    className="bg-[#1e3a8a] text-white p-2.5 rounded-full hover:bg-blue-900 transition-transform active:scale-90 shadow-md flex items-center justify-center ml-2"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </footer>
            </main>
          </div>
        )}
        
        {active === "add-property" && (
          <div className="flex h-screen bg-gray-100 font-sans">
            {/* Add Property Form takes full right side */}
            <main className="flex-1 flex flex-col bg-white">
              {/* Header */}
              <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Add New Property</h1>
                  <p className="text-sm text-gray-600">Create a detailed listing for your property</p>
                </div>
                <button 
                  onClick={() => setActive('home')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AddPropertyForm />
              </div>
            </main>
          </div>
        )}
        
        {active === "manage-tenants" && (
          <div className="flex h-screen bg-gray-100 font-sans">
            {/* Manage Tenants Form takes full right side */}
            <main className="flex-1 flex flex-col bg-white">
              <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Manage Tenants</h1>
                  <p className="text-sm text-gray-600">Handle tenant information and applications</p>
                </div>
                <button 
                  onClick={() => setActive('home')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Tenants</p>
                          <p className="text-3xl font-bold">24</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Active Leases</p>
                          <p className="text-3xl font-bold">18</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm">Pending</p>
                          <p className="text-3xl font-bold">6</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Occupancy Rate</p>
                          <p className="text-3xl font-bold">92%</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Tenants */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                      <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Active Tenants
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {[
                        { name: 'Rajesh Kumar', unit: 'Unit A-101', rent: '25,000', lease: 'Dec 2024', status: 'active', payment: 'paid' },
                        { name: 'Sita Sharma', unit: 'Unit B-205', rent: '18,000', lease: 'Jun 2024', status: 'active', payment: 'paid' },
                        { name: 'Amit Singh', unit: 'Unit C-301', rent: '22,000', lease: 'Sep 2024', status: 'active', payment: 'pending' }
                      ].map((tenant, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {tenant.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
                                <p className="text-sm text-gray-600">{tenant.unit} • NPR {tenant.rent}/month</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500">Lease ends: {tenant.lease}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    tenant.payment === 'paid' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {tenant.payment === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                Contact
                              </button>
                              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Applications */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-yellow-200">
                      <h3 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Pending Applications
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {[
                        { name: 'Amit Singh', unit: 'Unit C-301', applied: '2 days ago', requested: '22,000', score: '85' },
                        { name: 'Priya Patel', unit: 'Unit D-402', applied: '5 days ago', requested: '20,000', score: '92' }
                      ].map((application, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                                {application.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{application.name}</h4>
                                <p className="text-sm text-gray-600">{application.unit} • Applied {application.applied}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500">Requesting: NPR {application.requested}/month</span>
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    Score: {application.score}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                Approve
                              </button>
                              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                                Reject
                              </button>
                              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                Review
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
        
        {active === "view-listings" && (
          <div className="flex h-screen bg-gray-100 font-sans">
            {/* View Listings takes full right side */}
            <main className="flex-1 flex flex-col bg-white">
              <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">View All Listings</h1>
                  <p className="text-sm text-gray-600">Browse and manage your property listings</p>
                </div>
                <button 
                  onClick={() => setActive('home')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Total Listings</p>
                          <p className="text-3xl font-bold">12</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Published</p>
                          <p className="text-3xl font-bold">8</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm">Drafts</p>
                          <p className="text-3xl font-bold">3</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Views Today</p>
                          <p className="text-3xl font-bold">247</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Published Listings */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                      <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Published Listings
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {[
                        { title: 'Modern 2BHK Apartment', location: 'Thamel, Kathmandu', sqft: '800', price: '25,000', beds: '2', baths: '1', furnished: 'Furnished', image: 'apartment' },
                        { title: 'Cozy Studio Room', location: 'Patan, Lalitpur', sqft: '400', price: '15,000', beds: 'Studio', baths: '1', furnished: 'Unfurnished', image: 'studio' },
                        { title: 'Luxury Villa', location: 'Baluwatar, Kathmandu', sqft: '2500', price: '80,000', beds: '4', baths: '3', furnished: 'Fully Furnished', image: 'villa' }
                      ].map((property, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">{property.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{property.location} • {property.sqft} sqft</p>
                            <p className="text-2xl font-bold text-green-600 mb-3">NPR {property.price}/month</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{property.beds} Beds</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{property.baths} Baths</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{property.furnished}</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                Edit
                              </button>
                              <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Draft Listings */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-yellow-200">
                      <h3 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Draft Listings
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: 'Penthouse Suite', location: 'Jawalakhel, Patan', sqft: '1200', price: '45,000', beds: '3', baths: '2', furnished: 'Semi-Furnished' }
                        ].map((property, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-75">
                            <h4 className="font-semibold text-lg text-gray-700 mb-2">{property.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{property.location} • {property.sqft} sqft</p>
                            <p className="text-xl font-bold text-gray-600 mb-3">NPR {property.price}/month</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{property.beds} Beds</span>
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{property.baths} Baths</span>
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{property.furnished}</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                                Continue Editing
                              </button>
                              <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add New Listing Button */}
                  <button className="w-full bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 rounded-xl hover:from-primary-dark hover:to-primary font-semibold text-lg shadow-lg transition-all transform hover:scale-[1.02]">
                    + Add New Listing
                  </button>
                </div>
              </div>
            </main>
          </div>
        )}
        
        {active === "financial-reports" && (
          <div className="flex h-screen bg-gray-100 font-sans">
            {/* Financial Reports takes full right side */}
            <main className="flex-1 flex flex-col bg-white">
              <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Financial Reports</h1>
                  <p className="text-sm text-gray-600">View detailed financial analytics and reports</p>
                </div>
                <button 
                  onClick={() => setActive('home')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Total Income</p>
                          <p className="text-3xl font-bold">NPR 43K</p>
                          <p className="text-green-100 text-xs">↑ 12% from last month</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm">Total Expenses</p>
                          <p className="text-3xl font-bold">NPR 8.5K</p>
                          <p className="text-red-100 text-xs">↑ 5% from last month</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Net Profit</p>
                          <p className="text-3xl font-bold">NPR 34.5K</p>
                          <p className="text-blue-100 text-xs">↑ 15% from last month</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Occupancy Rate</p>
                          <p className="text-3xl font-bold">85%</p>
                          <p className="text-purple-100 text-xs">17 out of 20 units</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Revenue Overview</h3>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                        <option>All Time</option>
                      </select>
                    </div>
                    <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500">Revenue Chart Visualization</p>
                        <p className="text-sm text-gray-400">Interactive chart showing monthly trends</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Payment Status */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                        <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Recent Payments
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {[
                          { name: 'Rajesh Kumar', unit: 'Unit A-101', amount: '25,000', status: 'paid', date: 'March 1, 2024' },
                          { name: 'Sita Sharma', unit: 'Unit B-205', amount: '18,000', status: 'pending', date: 'Due: March 15, 2024' },
                          { name: 'Prem Bahadur', unit: 'Unit D-102', amount: '22,000', status: 'overdue', date: '15 days overdue' },
                          { name: 'Amit Singh', unit: 'Unit C-301', amount: '20,000', status: 'paid', date: 'March 2, 2024' }
                        ].map((payment, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                  payment.status === 'paid' ? 'bg-green-500' :
                                  payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                  {payment.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{payment.name}</h4>
                                  <p className="text-sm text-gray-600">{payment.unit}</p>
                                  <p className="text-xs text-gray-500">{payment.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">NPR {payment.amount}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {payment.status === 'paid' ? 'Paid' : 
                                   payment.status === 'pending' ? 'Pending' : 'Overdue'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
                        <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Expense Breakdown
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {[
                            { category: 'Maintenance', amount: '2,500', percentage: '29%' },
                            { category: 'Utilities', amount: '1,800', percentage: '21%' },
                            { category: 'Insurance', amount: '1,200', percentage: '14%' },
                            { category: 'Property Tax', amount: '1,500', percentage: '18%' },
                            { category: 'Other', amount: '1,500', percentage: '18%' }
                          ].map((expense, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
                                <span className="font-medium text-gray-900">{expense.category}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">{expense.percentage}</span>
                                <span className="font-bold text-gray-900">NPR {expense.amount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Expenses</span>
                            <span className="text-xl font-bold text-red-600">NPR 8,500</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 font-semibold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Full Report
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v8m5-4h.01" />
                      </svg>
                      Export to Excel
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
           </div>
    </section>
  );
};

// Add Property Form Component
const AddPropertyForm = () => {
  const [active, setActive] = useState('basic-info');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

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
    utilities: [],
    amenities: [],
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePropertySubmit = (e) => {
    e.preventDefault();
    // Store property in localStorage
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const newProperty = {
      id: Date.now(),
      ...propertyForm,
      images: images,
      createdAt: new Date().toISOString()
    };
    properties.push(newProperty);
    localStorage.setItem('properties', JSON.stringify(properties));
    
    alert('Property added successfully!');
    // Reset form
    setPropertyForm({
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
      utilities: [],
      amenities: [],
      furnished: 'Unfurnished',
      parking: 'None',
      floorNumber: '',
      totalFloors: '',
      yearBuilt: '',
      facingDirection: 'North',
      nearbyPlaces: ''
    });
    setImages([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-tight">Add New Property</h1>
          <p className="text-gray-500 mt-1">Create a detailed listing for your rental unit.</p>
        </div>

        <form onSubmit={handlePropertySubmit} className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left & Middle Column: Form Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Top Section: Name and Map Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Property Name</label>
                  <input 
                    type="text" 
                    value={propertyForm.name}
                    onChange={(e) => handlePropertyFormChange('name', e.target.value)}
                    placeholder="The Willow Apartments - Unit 3B" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={propertyForm.address}
                      onChange={(e) => handlePropertyFormChange('address', e.target.value)}
                      placeholder="123 Main St, Springfield" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-emerald-500 outline-none" 
                      required
                    />
                    <svg className="absolute right-3 top-2.5 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    value={propertyForm.city}
                    onChange={(e) => handlePropertyFormChange('city', e.target.value)}
                    placeholder="City" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                  />
                  <input 
                    type="text" 
                    value={propertyForm.state}
                    onChange={(e) => handlePropertyFormChange('state', e.target.value)}
                    placeholder="State" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                  />
                  <input 
                    type="text" 
                    value={propertyForm.zipCode}
                    onChange={(e) => handlePropertyFormChange('zipCode', e.target.value)}
                    placeholder="Zip Code" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="h-full min-h-[150px] bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-white p-2 border-b flex items-center gap-2">
                   <svg width="14" height="14" className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                   <span className="text-xs text-gray-400">Search Map...</span>
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-400 italic text-sm">
                   <svg width="24" height="24" className="mb-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   Google Maps Integration
                </div>
              </div>
            </div>

            {/* Middle Section: Specs */}
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 border-b pb-2">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Listing Type</label>
                  <select 
                    value={propertyForm.listingType}
                    onChange={(e) => handlePropertyFormChange('listingType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option>For Rent</option>
                    <option>For Sale</option>
                    <option>For Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Property Type</label>
                  <select 
                    value={propertyForm.propertyType}
                    onChange={(e) => handlePropertyFormChange('propertyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Studio</option>
                    {propertyForm.listingType !== 'For Sale' && <option>Room</option>}
                    <option>Villa</option>
                    <option>Land</option>
                  </select>
                </div>
                {propertyForm.listingType !== 'For Sale' && propertyForm.propertyType !== 'Land' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bedrooms</label>
                    <input 
                      type="number" 
                      value={propertyForm.bedrooms}
                      onChange={(e) => handlePropertyFormChange('bedrooms', e.target.value)}
                      placeholder="2" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                )}
                {propertyForm.listingType !== 'For Sale' && propertyForm.propertyType !== 'Land' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bathrooms</label>
                    <input 
                      type="number" 
                      value={propertyForm.bathrooms}
                      onChange={(e) => handlePropertyFormChange('bathrooms', e.target.value)}
                      placeholder="1.5" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Square Footage</label>
                  <input 
                    type="number" 
                    value={propertyForm.squareFootage}
                    onChange={(e) => handlePropertyFormChange('squareFootage', e.target.value)}
                    placeholder="1100" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                  />
                </div>
                {(propertyForm.listingType === 'For Rent' || propertyForm.listingType === 'For Both') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Monthly Rent (NPR)</label>
                    <input 
                      type="number" 
                      value={propertyForm.monthlyRent}
                      onChange={(e) => handlePropertyFormChange('monthlyRent', e.target.value)}
                      placeholder="1850" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                )}
                {(propertyForm.listingType === 'For Rent' || propertyForm.listingType === 'For Both') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Security Deposit (NPR)</label>
                    <input 
                      type="number" 
                      value={propertyForm.securityDeposit}
                      onChange={(e) => handlePropertyFormChange('securityDeposit', e.target.value)}
                      placeholder="2000" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                )}
                {(propertyForm.listingType === 'For Sale' || propertyForm.listingType === 'For Both') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sale Price (NPR)</label>
                    <input 
                      type="number" 
                      value={propertyForm.salePrice}
                      onChange={(e) => handlePropertyFormChange('salePrice', e.target.value)}
                      placeholder="5000000" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                  <textarea 
                    rows="4" 
                    value={propertyForm.description}
                    onChange={(e) => handlePropertyFormChange('description', e.target.value)}
                    placeholder="Enter your description here..." 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
                <div className="space-y-4">
                  {(propertyForm.listingType === 'For Rent' || propertyForm.listingType === 'For Both') && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lease Terms</label>
                      <div className="flex gap-2">
                         <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 cursor-pointer">
                           {propertyForm.leaseTerms}
                         </span>
                         <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">
                           Pet Friendly
                         </span>
                      </div>
                    </div>
                  )}
                  {(propertyForm.listingType === 'For Rent' || propertyForm.listingType === 'For Both') && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Utilities Included</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Water', 'Trash', 'Gas', 'Electric'].map(utility => (
                          <label key={utility} className="flex items-center gap-2 text-sm text-gray-600">
                            <input 
                              type="checkbox" 
                              checked={propertyForm.utilities.includes(utility)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handlePropertyFormChange('utilities', [...propertyForm.utilities, utility]);
                                } else {
                                  handlePropertyFormChange('utilities', propertyForm.utilities.filter(u => u !== utility));
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500" 
                            /> {utility}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {(propertyForm.listingType === 'For Sale' || propertyForm.listingType === 'For Both') && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sale Information</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input 
                            type="checkbox" 
                            checked={propertyForm.furnished === 'Fully Furnished'}
                            onChange={(e) => handlePropertyFormChange('furnished', e.target.checked ? 'Fully Furnished' : 'Unfurnished')}
                            className="rounded text-emerald-600 focus:ring-emerald-500" 
                          /> Fully Furnished
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input 
                            type="checkbox" 
                            defaultChecked={propertyForm.parking !== 'None'}
                            onChange={(e) => handlePropertyFormChange('parking', e.target.checked ? '1 Car' : 'None')}
                            className="rounded text-emerald-600 focus:ring-emerald-500" 
                          /> Parking Available
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Uploads & Amenities */}
          <div className="space-y-8">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-800 uppercase tracking-widest text-sm mb-4">Upload Photos</h3>
              <div className="flex gap-4 mb-4 text-gray-400">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 mb-6">Drag & drop photos or click to upload</p>
              
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-md"
              >
                Add Photos
              </button>
              
              {/* Preview Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                 {images.map((src, i) => (
                   <div key={i} className="aspect-square rounded-md overflow-hidden bg-gray-200 relative group">
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                      </button>
                   </div>
                 ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 text-sm uppercase mb-4">Property Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {['Pool', 'Gym', 'Parking', 'WiFi', 'Laundry', 'Balcony'].map(amenity => (
                  <span 
                    key={amenity}
                    className={`px-3 py-1 border rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      propertyForm.amenities.includes(amenity)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500'
                    }`}
                    onClick={() => {
                      if (propertyForm.amenities.includes(amenity)) {
                        handlePropertyFormChange('amenities', propertyForm.amenities.filter(a => a !== amenity));
                      } else {
                        handlePropertyFormChange('amenities', [...propertyForm.amenities, amenity]);
                      }
                    }}
                  >
                    {amenity}
                  </span>
                ))}
                <input 
                  type="text" 
                  placeholder="+ Add Tag" 
                  className="px-3 py-1 bg-transparent border-b border-gray-300 text-xs outline-none w-20" 
                />
              </div>
            </div>

            <div className="pt-10 flex flex-col gap-3">
               <button 
                 type="submit"
                 className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98]"
               >
                 ADD PROPERTY
               </button>
               <button 
                 type="button"
                 onClick={() => setActive('home')}
                 className="w-full bg-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-300 transition-all"
               >
                 CANCEL
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Placeholder components for other quick actions
const ManageTenantsForm = () => (
  <div className="flex h-screen bg-gray-100 font-sans">
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Manage Tenants</h2>
        <p className="text-sm text-gray-600 mt-1">Handle tenant information</p>
      </div>
    </aside>
    <main className="flex-1 flex flex-col bg-white">
      <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tenants</h1>
          <p className="text-sm text-gray-600">Handle tenant information</p>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600">Tenant management form will be displayed here.</p>
        </div>
      </div>
    </main>
  </div>
);

const ViewListingsForm = () => (
  <div className="flex h-screen bg-gray-100 font-sans">
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">View Listings</h2>
        <p className="text-sm text-gray-600 mt-1">Browse all property listings</p>
      </div>
    </aside>
    <main className="flex-1 flex flex-col bg-white">
      <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View All Listings</h1>
          <p className="text-sm text-gray-600">Browse all property listings</p>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600">Property listings will be displayed here.</p>
        </div>
      </div>
    </main>
  </div>
);

const FinancialReportsForm = () => (
  <div className="flex h-screen bg-gray-100 font-sans">
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Financial Reports</h2>
        <p className="text-sm text-gray-600 mt-1">View financial analytics</p>
      </div>
    </aside>
    <main className="flex-1 flex flex-col bg-white">
      <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-600">View financial analytics</p>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600">Financial reports will be displayed here.</p>
        </div>
      </div>
    </main>
  </div>
);

export default Dashboard;
