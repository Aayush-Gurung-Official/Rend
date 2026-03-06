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
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [propertyImages, setPropertyImages] = useState([]);
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'Apartment',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    monthlyRent: '',
    securityDeposit: '',
    description: '',
    leaseTerms: ['12 Months'],
    utilities: [],
    amenities: []
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
      createdAt: new Date().toISOString()
    };
    
    // Get existing properties or create empty array
    const existingProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    existingProperties.push(newProperty);
    localStorage.setItem('properties', JSON.stringify(existingProperties));
    
    // Reset form and close
    setPropertyForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      type: 'Apartment',
      bedrooms: '',
      bathrooms: '',
      squareFootage: '',
      monthlyRent: '',
      securityDeposit: '',
      description: '',
      leaseTerms: ['12 Months'],
      utilities: [],
      amenities: []
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
          {["home", "chat", "profile", "settings"].map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left capitalize ${
                active === key
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{key === "home" ? "Dashboard home" : key}</span>
            </button>
          ))}
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
                        <p className="text-2xl font-bold text-slate-900">₹2.4L</p>
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

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <button 
                      onClick={() => setShowAddProperty(true)}
                      className="flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
                    >
                      Add New Property
                    </button>
                    <button className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300">
                      View All Listings
                    </button>
                    <button className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300">
                      Manage Tenants
                    </button>
                    <button className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300">
                      Financial Reports
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group space-y-4 rounded-3xl bg-white/80 p-4 shadow-sm shadow-slate-900/5 ring-1 ring-transparent transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:ring-primary/30 md:p-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Find your perfect home in <span className="text-primary">Nepal</span>
                </h1>
                <p className="text-sm text-slate-600 md:text-base">
                  Browse verified houses, apartments and rooms to <span className="font-semibold">buy</span> or <span className="font-semibold">rent</span> across Kathmandu, Pokhara and growing cities in Nepal.
                </p>
                <div className="w-full rounded-2xl bg-white/95 p-4 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200">
                  <div className="mb-3 flex gap-2 text-xs font-semibold text-slate-500">
                    <button className="rounded-full px-3 py-1 bg-primary text-white">Rent</button>
                    <button className="rounded-full px-3 py-1 bg-slate-100 text-slate-600">Buy</button>
                    <button className="rounded-full px-3 py-1 bg-slate-100 text-slate-600">List property</button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Type</label>
                      <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                        <option value="all">All</option>
                        <option value="rent">Rent</option>
                        <option value="buy">Buy</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Location (City / Area)</label>
                      <input type="text" placeholder="e.g. Kathmandu, Pokhara" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value="" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Budget (NPR)</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Min" className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value="" />
                        <input type="number" placeholder="Max" className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value="" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <button className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">Search Homes</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {active === "profile" && (
          <div className="max-w-2xl mx-auto">
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
                          <p className="text-sm text-gray-500">Receive updates via email</p>
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
                          <p className="text-sm text-gray-500">Get notified about new properties</p>
                        </div>
                        <button 
                          onClick={() => setPropertyUpdates(!propertyUpdates)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${propertyUpdates ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${propertyUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
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

        {/* Add Property Modal */}
        {showAddProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-tight">Add New Property</h1>
                    <p className="text-gray-500 mt-1">Create a detailed listing for your rental unit.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddProperty(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" 
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-primary outline-none" 
                          />
                          <svg className="absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
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
                         <svg className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                         </svg>
                         <span className="text-xs text-gray-400">Search Map...</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center text-gray-400 italic text-sm">
                         <svg className="mb-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
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
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Property Type</label>
                        <select 
                          value={propertyForm.type}
                          onChange={(e) => handlePropertyFormChange('type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                        >
                          <option>Apartment</option>
                          <option>House</option>
                          <option>Studio</option>
                        </select>
                      </div>
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
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Monthly Rent (NPR)</label>
                        <input 
                          type="number" 
                          value={propertyForm.monthlyRent}
                          onChange={(e) => handlePropertyFormChange('monthlyRent', e.target.value)}
                          placeholder="25000" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Security Deposit (NPR)</label>
                        <input 
                          type="number" 
                          value={propertyForm.securityDeposit}
                          onChange={(e) => handlePropertyFormChange('securityDeposit', e.target.value)}
                          placeholder="50000" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                        <textarea 
                          rows="4" 
                          value={propertyForm.description}
                          onChange={(e) => handlePropertyFormChange('description', e.target.value)}
                          placeholder="Enter your description here..." 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" 
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lease Terms</label>
                          <div className="flex gap-2">
                             <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 cursor-pointer">12 Months</span>
                             <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">Pet Friendly</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Utilities Included</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Water', 'Trash', 'Gas', 'Electric'].map(u => (
                              <label key={u} className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" className="rounded text-primary focus:ring-primary" /> {u}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Uploads & Amenities */}
                <div className="space-y-8">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center text-center">
                    <h3 className="font-bold text-gray-800 uppercase tracking-widest text-sm mb-4">Upload Photos</h3>
                    <div className="flex gap-4 mb-4 text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mb-6">Drag & drop photos or click to upload</p>
                    
                    <input type="file" multiple className="hidden" ref={propertyImageInputRef} onChange={handlePropertyImageChange} />
                    <button 
                      type="button"
                      onClick={() => propertyImageInputRef.current.click()}
                      className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-md"
                    >
                      Add Photos
                    </button>
                    
                    {/* Preview Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                       {propertyImages.map((src, i) => (
                         <div key={i} className="aspect-square rounded-md overflow-hidden bg-gray-200 relative group">
                            <img src={src} className="w-full h-full object-cover" alt="" />
                            <button 
                              type="button"
                              onClick={() => setPropertyImages(prev => prev.filter((_, index) => index !== i))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      {['Pool', 'Gym', 'Parking', 'WiFi', 'Laundry', 'Balcony'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:border-primary cursor-pointer transition-colors">
                          {tag}
                        </span>
                      ))}
                      <input type="text" placeholder="+ Add Tag" className="px-3 py-1 bg-transparent border-b border-gray-300 text-xs outline-none w-20" />
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col gap-3">
                     <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98]">
                       ADD PROPERTY
                     </button>
                     <button 
                       type="button"
                       onClick={() => setShowAddProperty(false)}
                       className="w-full bg-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-300 transition-all"
                     >
                       CANCEL
                     </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;

