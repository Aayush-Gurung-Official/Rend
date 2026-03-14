import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { updateProfile } from "../services/authService.js";

const STORAGE_KEYS = {
  maintenanceRequests: "rendMaintenanceRequests",
  contactMessages: "rendContactMessages",
  tenantProperties: "rendTenantProperties",
  rentAccounts: "rendRentAccounts",
};

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const loadArray = (key) => safeJsonParse(window.localStorage.getItem(key), []);
const saveArray = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));

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
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [marketingCommunications, setMarketingCommunications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [propertyImages, setPropertyImages] = useState([]);
  const [listings, setListings] = useState([]);
  
  // Property search state
  const [listingType, setListingType] = useState('For Rent');
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    propertyType: 'All Types',
    priceRange: 'Any Price',
    bedrooms: 'Any'
  });
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Agreement management state
  const [agreements, setAgreements] = useState([]);
  const [agreementType, setAgreementType] = useState('lease'); // lease, purchase, maintenance, etc.
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [agreementForm, setAgreementForm] = useState({
    title: '',
    type: 'lease', // lease, purchase, maintenance, termination
    propertyId: '',
    parties: {
      landlord: '',
      tenant: '',
      witnesses: []
    },
    terms: {
      duration: '',
      rentAmount: '',
      securityDeposit: '',
      purchasePrice: '',
      paymentSchedule: '',
      maintenanceResponsibilities: '',
      utilities: [],
      restrictions: []
    },
    dates: {
      startDate: '',
      endDate: '',
      signingDate: ''
    },
    status: 'draft', // draft, active, expired, terminated
    documents: []
  });
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

  const [tenantRentalProperties, setTenantRentalProperties] = useState([]);

  // Tenant maintenance requests (UI-only sample data)
  const [tenantMaintenanceRequests, setTenantMaintenanceRequests] = useState([
    {
      id: 1,
      title: "Leaking kitchen faucet",
      propertyLabel: "Studio Room - Unit B-205",
      landlordName: "Suman Shrestha",
      ownerUsername: "suman",
      category: "Plumbing",
      priority: "Medium",
      status: "Open",
      date: "2024-03-10",
      description: "Water is leaking under the sink and pooling inside the cabinet."
    },
    {
      id: 2,
      title: "Light flickering in bedroom",
      propertyLabel: "Modern Apartment - Unit A-101",
      landlordName: "Rajesh Kumar",
      ownerUsername: "rajesh",
      category: "Electrical",
      priority: "Low",
      status: "Completed",
      date: "2024-03-05",
      description: "Bedroom ceiling light flickers sometimes. Please check the switch/wiring."
    }
  ]);
  const [selectedTenantMaintenanceId, setSelectedTenantMaintenanceId] = useState(
    tenantMaintenanceRequests[0]?.id ?? null
  );
  const [tenantMaintenanceDraft, setTenantMaintenanceDraft] = useState({
    propertyLabel: "Studio Room - Unit B-205",
    category: "Plumbing",
    priority: "Emergency",
    title: "",
    description: "",
    preferredDateTime: "",
  });
  const [tenantMaintenanceErrors, setTenantMaintenanceErrors] = useState({});
  const [tenantMaintenanceSuccess, setTenantMaintenanceSuccess] = useState("");

  const [selectedContactPropertyId, setSelectedContactPropertyId] = useState(
    null
  );
  const [contactDraft, setContactDraft] = useState({ subject: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState("");

  const [rentAccounts, setRentAccounts] = useState([]);
  const [selectedRentAccountId, setSelectedRentAccountId] = useState(null);
  const [rentDraft, setRentDraft] = useState({
    propertyId: "",
    propertyLabel: "",
    ownerUsername: "",
    landlordName: "",
    monthlyRent: "",
    dueDay: "15",
  });
  const [rentSuccess, setRentSuccess] = useState("");

  const [ownerMaintenanceItems, setOwnerMaintenanceItems] = useState([]);
  const [selectedOwnerThreadKey, setSelectedOwnerThreadKey] = useState(null);
  const [ownerReplyDraft, setOwnerReplyDraft] = useState("");

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
  const tenantMaintenanceFormRef = useRef(null);

  const navigate = useNavigate();

  const openNewTenantMaintenanceRequest = () => {
    setTenantMaintenanceSuccess("");
    setTenantMaintenanceErrors({});
    setSelectedTenantMaintenanceId(null);
    setTenantMaintenanceDraft({
      propertyLabel: tenantRentalProperties[0]?.label ?? "",
      category: "Plumbing",
      priority: "Emergency",
      title: "",
      description: "",
      preferredDateTime: "",
    });

    requestAnimationFrame(() => {
      tenantMaintenanceFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const submitTenantMaintenanceRequest = (e) => {
    e.preventDefault();
    setTenantMaintenanceSuccess("");

    const nextErrors = {};
    if (!tenantMaintenanceDraft.propertyLabel) nextErrors.propertyLabel = "Please select a property.";
    if (!tenantMaintenanceDraft.title.trim()) nextErrors.title = "Please enter a short title.";
    if (!tenantMaintenanceDraft.description.trim()) nextErrors.description = "Please describe the issue.";
    setTenantMaintenanceErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const selectedProperty =
      tenantRentalProperties.find((p) => p.label === tenantMaintenanceDraft.propertyLabel) ??
      tenantRentalProperties[0] ??
      null;

    const landlordName = selectedProperty?.landlord?.name || "Landlord";
    const ownerUsername = selectedProperty?.landlord?.username || "";
    const propertyId = selectedProperty?.id || "";

    const newRequest = {
      id: Date.now(),
      title: tenantMaintenanceDraft.title.trim(),
      propertyLabel: tenantMaintenanceDraft.propertyLabel,
      landlordName,
      ownerUsername,
      category: tenantMaintenanceDraft.category,
      priority: tenantMaintenanceDraft.priority,
      status: "Open",
      date: `${yyyy}-${mm}-${dd}`,
      description: tenantMaintenanceDraft.description.trim(),
    };

    setTenantMaintenanceRequests((prev) => [newRequest, ...prev]);
    setSelectedTenantMaintenanceId(newRequest.id);
    setTenantMaintenanceSuccess("Request submitted. Your landlord will be notified.");
    setTenantMaintenanceDraft((prev) => ({ ...prev, title: "", description: "" }));

    const stored = safeJsonParse(
      window.localStorage.getItem(STORAGE_KEYS.maintenanceRequests),
      []
    );
    const storedItem = {
      ...newRequest,
      propertyId,
      tenantUsername: user?.username || "Tenant",
      tenantId: user?.id || null,
      createdAt: new Date().toISOString(),
      type: "request",
    };
    window.localStorage.setItem(
      STORAGE_KEYS.maintenanceRequests,
      JSON.stringify([storedItem, ...stored])
    );
  };

  const tenantMaintenanceStatusStyles = (status) => {
    if (status === "Completed") return "bg-green-100 text-green-800 border border-green-200";
    if (status === "In Progress") return "bg-blue-100 text-blue-800 border border-blue-200";
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  };

  const tenantMaintenanceInputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const upsertTenantProperty = (property) => {
    if (!user?.username) return;
    const all = loadArray(STORAGE_KEYS.tenantProperties);
    const mine = all.filter((p) => p.tenantUsername === user.username);

    const existsIndex = mine.findIndex((p) => p.id === property.id);
    const nextMine =
      existsIndex >= 0
        ? mine.map((p) => (p.id === property.id ? property : p))
        : [property, ...mine];

    const nextAll = [...all.filter((p) => p.tenantUsername !== user.username), ...nextMine];
    saveArray(STORAGE_KEYS.tenantProperties, nextAll);
    setTenantRentalProperties(nextMine);

    if (!selectedContactPropertyId) setSelectedContactPropertyId(nextMine[0]?.id ?? null);
  };

  const createRentAccount = (e) => {
    e.preventDefault();
    setRentSuccess("");
    if (!user?.username) return;
    if (!rentDraft.propertyLabel.trim()) return;
    if (!rentDraft.monthlyRent || Number.isNaN(Number(rentDraft.monthlyRent))) return;

    const propertyId = rentDraft.propertyId || `prop_${Date.now()}`;
    const landlordName = rentDraft.landlordName.trim() || "Landlord";
    const ownerUsername = rentDraft.ownerUsername.trim() || "owner";

    const property = {
      id: propertyId,
      tenantUsername: user.username,
      label: rentDraft.propertyLabel.trim(),
      landlord: {
        username: ownerUsername,
        name: landlordName,
        phone: "",
        email: "",
      },
    };
    upsertTenantProperty(property);

    const allAccounts = loadArray(STORAGE_KEYS.rentAccounts);
    const newAccount = {
      id: `rent_${Date.now()}`,
      tenantUsername: user.username,
      propertyId,
      propertyLabel: property.label,
      ownerUsername,
      landlordName,
      monthlyRent: Number(rentDraft.monthlyRent),
      dueDay: String(rentDraft.dueDay || "15"),
      status: "Unpaid",
      history: [],
      createdAt: new Date().toISOString(),
    };

    const nextAll = [newAccount, ...allAccounts];
    saveArray(STORAGE_KEYS.rentAccounts, nextAll);
    const mine = nextAll.filter((a) => a.tenantUsername === user.username);
    setRentAccounts(mine);
    setSelectedRentAccountId(newAccount.id);
    setRentDraft((prev) => ({
      ...prev,
      propertyId: "",
      propertyLabel: "",
      landlordName: "",
      ownerUsername: "",
      monthlyRent: "",
    }));
    setRentSuccess("Rent item created.");
  };

  const payRentNow = (accountId) => {
    setRentSuccess("");
    if (!user?.username) return;

    const allAccounts = loadArray(STORAGE_KEYS.rentAccounts);
    const account = allAccounts.find((a) => a.id === accountId);
    if (!account) return;

    const payment = {
      id: `pay_${Date.now()}`,
      accountId,
      amount: account.monthlyRent,
      paidAt: new Date().toISOString(),
      method: "Digital Wallet",
    };

    const nextAll = allAccounts.map((a) =>
      a.id === accountId
        ? { ...a, status: "Paid", lastPaidAt: payment.paidAt, history: [payment, ...(a.history || [])] }
        : a
    );
    saveArray(STORAGE_KEYS.rentAccounts, nextAll);
    setRentAccounts(nextAll.filter((a) => a.tenantUsername === user.username));
    setRentSuccess("Payment recorded as Paid.");
  };

  const submitContactMessage = (e) => {
    e.preventDefault();
    setContactSuccess("");

    if (!selectedContactPropertyId) return;
    if (!contactDraft.message.trim()) return;

    const selectedProperty =
      tenantRentalProperties.find((p) => p.id === selectedContactPropertyId) ??
      tenantRentalProperties[0] ??
      null;

    const stored = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.contactMessages), []);
    const newMessage = {
      id: Date.now(),
      propertyId: selectedProperty?.id || "",
      propertyLabel: selectedProperty?.label || "",
      ownerUsername: selectedProperty?.landlord?.username || "",
      ownerName: selectedProperty?.landlord?.name || "Landlord",
      tenantUsername: user?.username || "Tenant",
      subject: contactDraft.subject.trim(),
      message: contactDraft.message.trim(),
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEYS.contactMessages, JSON.stringify([newMessage, ...stored]));
    setContactDraft({ subject: "", message: "" });
    setContactSuccess("Message sent.");
  };

  const getMaintenanceThreadKey = (item) =>
    `${item.ownerUsername || ""}::${item.tenantUsername || ""}::${item.propertyId || item.propertyLabel || ""}`;

  const reloadOwnerMaintenance = () => {
    const stored = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.maintenanceRequests), []);
    const mine =
      userType === "owner" && user?.username
        ? stored.filter((r) => r.ownerUsername === user.username)
        : [];
    setOwnerMaintenanceItems(mine);

    if (!selectedOwnerThreadKey && mine.length > 0) {
      setSelectedOwnerThreadKey(getMaintenanceThreadKey(mine[0]));
    }
  };

  const updateMaintenanceStatus = (requestId, nextStatus) => {
    const stored = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.maintenanceRequests), []);
    const nextStored = stored.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r));
    window.localStorage.setItem(STORAGE_KEYS.maintenanceRequests, JSON.stringify(nextStored));
    reloadOwnerMaintenance();
  };

  const sendOwnerReply = (e) => {
    e.preventDefault();
    if (!selectedOwnerThreadKey) return;
    if (!ownerReplyDraft.trim()) return;

    const stored = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.maintenanceRequests), []);
    const newMsg = {
      id: Date.now(),
      type: "owner_message",
      ownerUsername: user?.username || "",
      tenantUsername: selectedOwnerThreadKey.split("::")[1] || "",
      propertyId: selectedOwnerThreadKey.split("::")[2] || "",
      propertyLabel: "",
      message: ownerReplyDraft.trim(),
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEYS.maintenanceRequests, JSON.stringify([newMsg, ...stored]));
    setOwnerReplyDraft("");
    reloadOwnerMaintenance();
  };

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

  useEffect(() => {
    if (!userType || !user?.username) return;

    const storedMaintenance = loadArray(STORAGE_KEYS.maintenanceRequests);
    const storedPropsAll = loadArray(STORAGE_KEYS.tenantProperties);
    const storedAccountsAll = loadArray(STORAGE_KEYS.rentAccounts);

    // Seed tenant properties for new users (demo data)
    const seedTenantProps = () => [
      {
        id: "a101",
        tenantUsername: user.username,
        label: "Modern Apartment - Unit A-101",
        landlord: {
          username: "rajesh",
          name: "Rajesh Kumar",
          phone: "+977-987654321",
          email: "rajesh.kumar@rent.com",
        },
      },
      {
        id: "b205",
        tenantUsername: user.username,
        label: "Studio Room - Unit B-205",
        landlord: {
          username: "suman",
          name: "Suman Shrestha",
          phone: "+977-981112223",
          email: "suman.shrestha@rent.com",
        },
      },
    ];

    if (userType === "user") {
      let mineProps = storedPropsAll.filter((p) => p.tenantUsername === user.username);
      if (mineProps.length === 0) {
        mineProps = seedTenantProps();
        saveArray(STORAGE_KEYS.tenantProperties, [...storedPropsAll, ...mineProps]);
      }
      setTenantRentalProperties(mineProps);
      if (!selectedContactPropertyId) setSelectedContactPropertyId(mineProps[0]?.id ?? null);

      const mineMaintenance = storedMaintenance.filter(
        (r) => r.tenantUsername === user.username && (r.type === "request" || !r.type)
      );
      if (mineMaintenance.length) {
        setTenantMaintenanceRequests(mineMaintenance);
        setSelectedTenantMaintenanceId(mineMaintenance[0]?.id ?? null);
      }

      let mineAccounts = storedAccountsAll.filter((a) => a.tenantUsername === user.username);
      if (mineAccounts.length === 0) {
        const seed = mineProps.map((p, idx) => ({
          id: `rent_seed_${p.id}`,
          tenantUsername: user.username,
          propertyId: p.id,
          propertyLabel: p.label,
          ownerUsername: p.landlord.username,
          landlordName: p.landlord.name,
          monthlyRent: idx === 0 ? 25000 : 15000,
          dueDay: "15",
          status: "Unpaid",
          history: [],
          createdAt: new Date().toISOString(),
        }));
        saveArray(STORAGE_KEYS.rentAccounts, [...storedAccountsAll, ...seed]);
        mineAccounts = seed;
      }
      setRentAccounts(mineAccounts);
      if (!selectedRentAccountId) setSelectedRentAccountId(mineAccounts[0]?.id ?? null);

      setTenantMaintenanceDraft((prev) => ({
        ...prev,
        propertyLabel: prev.propertyLabel || mineProps[0]?.label || "",
      }));
    }

    if (userType === "owner" && user?.username) {
      reloadOwnerMaintenance();
    }
  }, [userType, user?.username]);

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

  // Property search API functions
  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/properties/featured');
      const data = await response.json();
      // Ensure data is an array
      setFeaturedProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch featured properties');
      console.error('Error fetching featured properties:', err);
      setFeaturedProperties([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Add listing type filter
      if (listingType) {
        queryParams.append('listingType', listingType);
      }
      
      // Add other filters
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.propertyType && filters.propertyType !== 'All Types') {
        queryParams.append('propertyType', filters.propertyType);
      }
      if (filters.priceRange && filters.priceRange !== 'Any Price') {
        queryParams.append('priceRange', filters.priceRange);
      }
      if (filters.bedrooms && filters.bedrooms !== 'Any') {
        queryParams.append('bedrooms', filters.bedrooms);
      }
      
      const response = await fetch(`http://localhost:5000/api/properties?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        // Ensure properties is an array
        setProperties(Array.isArray(data.properties) ? data.properties : []);
      } else {
        setError(data.message || 'Failed to fetch properties');
        setProperties([]); // Set to empty array on error
      }
    } catch (err) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
      setProperties([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProperties = () => {
    fetchProperties(searchFilters);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      location: '',
      propertyType: 'All Types',
      priceRange: 'Any Price',
      bedrooms: 'Any'
    });
    fetchProperties({});
  };

  // Load featured properties when component mounts
  useEffect(() => {
    if (active === "view-listings" && userType === "user") {
      fetchFeaturedProperties();
      fetchProperties({});
    }
  }, [active, userType, listingType]);

  // Agreement API functions
  const fetchUserAgreements = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 'demo-user-id'; // Fallback for demo
      const response = await fetch(`http://localhost:5000/api/agreements/user/${userId}`);
      const data = await response.json();
      setAgreements(Array.isArray(data.agreements) ? data.agreements : []);
    } catch (err) {
      console.error('Error fetching agreements:', err);
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadAgreement = async (agreementId, agreementTitle) => {
    try {
      // Create a proper PDF content for download
      const agreement = agreements.find(a => a._id === agreementId) || window.currentViewingAgreement;
      if (!agreement) {
        alert('Agreement not found');
        return;
      }
      
      // Generate PDF content
      const pdfContent = generatePDFContent(agreement);
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agreement.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Downloaded agreement:', agreement.title);
    } catch (err) {
      console.error('Error downloading agreement:', err);
      alert('Failed to download agreement');
    }
  };

  const generatePDFContent = (agreement) => {
    // Generate a simple PDF-like content (in production, use a proper PDF library)
    let content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${1000}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${agreement.title}) Tj
0 -14 Td
(Status: ${agreement.status}) Tj
0 -14 Td
(Created: ${new Date(agreement.createdAt).toLocaleDateString()}) Tj
0 -28 Td
(Property: ${agreement.property?.name || 'Not specified'}) Tj
0 -14 Td
(Address: ${agreement.property?.address || 'Not specified'}) Tj
0 -28 Td
(Parties:) Tj
0 -14 Td
${agreement.type === 'lease' ? `(Landlord: ${agreement.parties?.landlord?.fullName || 'Not specified'}) Tj
0 -14 Td
(Tenant: ${agreement.parties?.tenant?.fullName || 'Not specified'}) Tj` : ''}
${agreement.type === 'purchase' ? `(Buyer: ${agreement.parties?.buyer?.fullName || 'Not specified'}) Tj
0 -14 Td
(Seller: ${agreement.parties?.seller?.fullName || 'Not specified'}) Tj` : ''}
${agreement.type === 'maintenance' ? `(Service Provider: ${agreement.parties?.service_provider?.fullName || 'Not specified'}) Tj` : ''}
0 -28 Td
(Terms & Conditions:) Tj
0 -14 Td
${agreement.type === 'lease' ? `(Monthly Rent: NPR ${agreement.terms?.rentAmount?.toLocaleString() || 'N/A'}) Tj
0 -14 Td
(Security Deposit: NPR ${agreement.terms?.securityDeposit?.toLocaleString() || 'N/A'}) Tj
0 -14 Td
(Duration: ${agreement.terms?.duration || 'N/A'}) Tj
0 -14 Td
(Start Date: ${agreement.dates?.startDate ? new Date(agreement.dates.startDate).toLocaleDateString() : 'N/A'}) Tj` : ''}
${agreement.type === 'purchase' ? `(Purchase Price: NPR ${agreement.terms?.purchasePrice?.toLocaleString() || 'N/A'}) Tj
0 -14 Td
(Payment Method: ${agreement.terms?.paymentMethod || 'N/A'}) Tj
0 -14 Td
(Signing Date: ${agreement.dates?.signingDate ? new Date(agreement.dates.signingDate).toLocaleDateString() : 'N/A'}) Tj` : ''}
${agreement.terms?.specialTerms ? `0 -14 Td
(Special Terms: ${agreement.terms.specialTerms}) Tj` : ''}
0 -42 Td
(Legal Terms:) Tj
0 -14 Td
(This agreement is legally binding and constitutes the entire understanding) Tj
0 -14 Td
(between the parties involved. All obligations and responsibilities) Tj
0 -14 Td
(outlined in this agreement must be fulfilled according to the) Tj
0 -14 Td
(specified terms and conditions. Any violations may result in) Tj
0 -14 Td
(legal consequences as applicable under Nepalese law.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000300 00000 n 
0000000500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
600
%%EOF`;
    
    return content;
  };

  const printAgreement = (agreementId, agreementTitle) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${agreementTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .agreement-content { margin: 20px 0; }
            .terms-section { margin: 15px 0; }
            .signature-section { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; }
            @media print { body { margin: 0; font-size: 12px; } }
          </style>
        </head>
        <body>
          <h1>${agreementTitle}</h1>
          <div class="agreement-content">
            <p><strong>Agreement ID:</strong> ${agreementId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> Active</p>
            
            <div class="terms-section">
              <h3>Terms and Conditions</h3>
              <p>This agreement is legally binding and constitutes the entire understanding between the parties.</p>
              <p>All obligations and responsibilities outlined in this agreement must be fulfilled according to the specified terms.</p>
              <p>Any violations of this agreement may result in legal consequences as applicable under Nepalese law.</p>
            </div>
            
            <div class="signature-section">
              <p><strong>Authorized Signature:</strong> _________________________</p>
              <p><strong>Date:</strong> _________________________</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const viewFullAgreement = (agreement) => {
    // Create a detailed view modal for the agreement
    const modalHtml = `
      <div style="padding: 32px; max-width: 800px; margin: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 28px; font-weight: 700;">${agreement.title}</h2>
          <div style="display: flex; justify-content: center; gap: 16px; margin-top: 12px;">
            <span style="
              background: ${agreement.status === 'active' ? '#10b981' : agreement.status === 'pending' ? '#f59e0b' : '#6b7280'};
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            ">${agreement.status.toUpperCase()}</span>
            <span style="color: #6b7280; font-size: 14px;">Created: ${new Date(agreement.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Property Details</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Property Name</p>
              <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.property?.name || 'Not specified'}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Address</p>
              <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.property?.address || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Parties Involved</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${agreement.type === 'lease' ? `
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Landlord</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.parties?.landlord?.fullName || 'Not specified'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Tenant</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.parties?.tenant?.fullName || 'Not specified'}</p>
              </div>
            ` : ''}
            ${agreement.type === 'purchase' ? `
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Buyer</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.parties?.buyer?.fullName || 'Not specified'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Seller</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.parties?.seller?.fullName || 'Not specified'}</p>
              </div>
            ` : ''}
            ${agreement.type === 'maintenance' ? `
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Service Provider</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.parties?.service_provider?.fullName || 'Not specified'}</p>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Terms & Conditions</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${agreement.type === 'lease' ? `
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Monthly Rent</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">NPR ${agreement.terms?.rentAmount?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Security Deposit</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">NPR ${agreement.terms?.securityDeposit?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Duration</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.terms?.duration || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Start Date</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.dates?.startDate ? new Date(agreement.dates.startDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            ` : ''}
            ${agreement.type === 'purchase' ? `
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Purchase Price</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">NPR ${agreement.terms?.purchasePrice?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Payment Method</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.terms?.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Signing Date</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.dates?.signingDate ? new Date(agreement.dates.signingDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Completion Date</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.dates?.endDate ? new Date(agreement.dates.endDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            ` : ''}
            ${agreement.type === 'maintenance' ? `
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Service Type</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.terms?.serviceDetails?.serviceType || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Monthly Cost</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">NPR ${agreement.terms?.serviceDetails?.cost?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Frequency</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.terms?.serviceDetails?.frequency || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Next Service</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.terms?.serviceDetails?.nextServiceDate ? new Date(agreement.terms.serviceDetails.nextServiceDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            ` : ''}
            ${agreement.type === 'termination' ? `
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Reason</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.terms?.terminationReason || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Notice Period</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.terms?.noticePeriod || 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Notice Date</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.dates?.noticeDate ? new Date(agreement.dates.noticeDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Effective Date</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${agreement.dates?.effectiveDate ? new Date(agreement.dates.effectiveDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            ` : ''}
          </div>
          ${agreement.terms?.specialTerms ? `
            <div style="margin-top: 16px;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Special Terms</p>
              <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.5;">${agreement.terms.specialTerms}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Legal Terms & Conditions</h3>
          <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 12px 0;">This agreement is legally binding and constitutes the entire understanding between the parties involved.</p>
            <p style="margin: 0 0 12px 0;">All obligations and responsibilities outlined in this agreement must be fulfilled according to the specified terms and conditions.</p>
            <p style="margin: 0 0 12px 0;">Any violations of this agreement may result in legal consequences as applicable under Nepalese law.</p>
            <p style="margin: 0;">This agreement is effective from the signing date and remains valid until terminated according to the terms specified herein.</p>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 32px;">
          <button onclick="window.parent.downloadCurrentAgreement()" style="
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          ">Download PDF</button>
          <button onclick="window.parent.printCurrentAgreement()" style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          ">Print Agreement</button>
          <button onclick="window.parent.closeAgreementForm()" style="
            background: #f3f4f6;
            color: #374151;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s ease;
          ">Close</button>
        </div>
      </div>
    `;
    
    // Store current agreement for download/print
    window.currentViewingAgreement = agreement;
    
    openAgreementModal('Agreement Details', modalHtml);
  };

  const terminateAgreement = async (agreementId) => {
    const confirmed = window.confirm('Are you sure you want to terminate this agreement? This action cannot be undone.');
    if (confirmed) {
      try {
        // In a real implementation, this would call the termination API
        console.log('Terminating agreement:', agreementId);
        alert('Agreement termination request submitted. You will receive a confirmation shortly.');
        fetchUserAgreements(); // Refresh list
      } catch (err) {
        console.error('Error terminating agreement:', err);
        alert('Failed to terminate agreement');
      }
    }
  };

  const signAgreement = async (agreementId) => {
    const confirmed = window.confirm('Do you want to sign this agreement electronically?');
    if (confirmed) {
      try {
        // In a real implementation, this would call the signing API
        console.log('Signing agreement:', agreementId);
        alert('Agreement signed successfully! A copy has been sent to your email.');
        fetchUserAgreements(); // Refresh list
      } catch (err) {
        console.error('Error signing agreement:', err);
        alert('Failed to sign agreement');
      }
    }
  };

  const scheduleService = async (agreement) => {
    const date = prompt('Enter preferred service date (YYYY-MM-DD):');
    if (date) {
      try {
        // In a real implementation, this would call the scheduling API
        console.log('Scheduling service for agreement:', agreement._id, 'on:', date);
        alert(`Service scheduled for ${new Date(date).toLocaleDateString()}. You will receive a confirmation.`);
      } catch (err) {
        console.error('Error scheduling service:', err);
        alert('Failed to schedule service');
      }
    }
  };

  const cancelAgreement = async (agreementId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      const confirmed = window.confirm('Are you sure you want to cancel this agreement?');
      if (confirmed) {
        try {
          // In a real implementation, this would call the cancellation API
          console.log('Cancelling agreement:', agreementId, 'Reason:', reason);
          alert('Agreement cancellation request submitted. You will receive a confirmation shortly.');
          fetchUserAgreements(); // Refresh list
        } catch (err) {
          console.error('Error cancelling agreement:', err);
          alert('Failed to cancel agreement');
        }
      }
    }
  };

  const autoGeneratePurchaseAgreement = async (propertyId, buyerId) => {
    try {
      const response = await fetch('http://localhost:5000/api/agreements/auto-generate-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
        },
        body: JSON.stringify({ propertyId, buyerId })
      });
      
      if (response.ok) {
        const agreement = await response.json();
        alert('Purchase agreement generated successfully! Check your agreements section.');
        fetchUserAgreements(); // Refresh agreements list
        return agreement;
      } else {
        alert('Failed to generate purchase agreement');
      }
    } catch (err) {
      console.error('Error generating purchase agreement:', err);
      alert('Failed to generate purchase agreement');
    }
  };

  const autoGenerateLeaseAgreement = async (propertyId, tenantId) => {
    try {
      const response = await fetch('http://localhost:5000/api/agreements/auto-generate-lease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
        },
        body: JSON.stringify({ propertyId, tenantId })
      });
      
      if (response.ok) {
        const agreement = await response.json();
        alert('Lease agreement generated successfully! Check your agreements section.');
        fetchUserAgreements(); // Refresh agreements list
        return agreement;
      } else {
        alert('Failed to generate lease agreement');
      }
    } catch (err) {
      console.error('Error generating lease agreement:', err);
      alert('Failed to generate lease agreement');
    }
  };

  // File upload handlers
  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Check file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      
      // Handle file upload
      uploadAgreementDocument(file);
    }
  };

  const uploadAgreementDocument = async (file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', 'agreement');
      
      // Show upload progress
      const progressMessage = `Uploading "${file.name}"...`;
      console.log(progressMessage);
      
      // Simulate upload progress
      setTimeout(() => {
        alert(`File "${file.name}" uploaded successfully! The agreement has been added to your list.`);
        fetchUserAgreements(); // Refresh agreements list
      }, 1500);
      
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file');
    }
  };

  const handleScanDocument = () => {
    // In a real implementation, this would integrate with device camera or scanning API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      alert('Camera access would be requested here to scan documents. For now, please use the file upload option.');
    } else {
      alert('Scanning feature is not supported on this device. Please use the file upload option.');
    }
  };

  const triggerPropertyPurchase = async (property) => {
    if (!user?.id) {
      alert('Please login to purchase property');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to purchase "${property.name}" for NPR ${property.salePrice?.toLocaleString()}?\n\nA purchase agreement will be automatically generated.`);
    if (confirmed) {
      await autoGeneratePurchaseAgreement(property._id, user.id);
    }
  };

  const triggerPropertyRental = async (property) => {
    if (!user?.id) {
      alert('Please login to rent property');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to rent "${property.name}" for NPR ${property.monthlyRent?.toLocaleString()}/month?\n\nA lease agreement will be automatically generated.`);
    if (confirmed) {
      await autoGenerateLeaseAgreement(property._id, user.id);
    }
  };

  const createNewAgreement = () => {
    // Show professional agreement type selection modal
    showAgreementTypeSelection();
  };

  const showAgreementTypeSelection = () => {
    const modalHtml = `
      <div style="padding: 32px; max-width: 700px; margin: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Create New Agreement</h2>
          <p style="margin: 0; color: #6b7280; font-size: 16px;">Choose the type of agreement you want to create</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="agreement-type-card" data-type="lease" style="
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">🏠</div>
            <h3 style="margin: 0 0 8px 0; color: white; font-size: 18px; font-weight: 600;">Lease Agreement</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">Create rental agreements for properties</p>
          </div>
          
          <div class="agreement-type-card" data-type="purchase" style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
            <h3 style="margin: 0 0 8px 0; color: white; font-size: 18px; font-weight: 600;">Purchase Agreement</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">Create property purchase contracts</p>
          </div>
          
          <div class="agreement-type-card" data-type="maintenance" style="
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
            <h3 style="margin: 0 0 8px 0; color: white; font-size: 18px; font-weight: 600;">Maintenance Agreement</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">Create service and maintenance contracts</p>
          </div>
          
          <div class="agreement-type-card" data-type="termination" style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
            <h3 style="margin: 0 0 8px 0; color: white; font-size: 18px; font-weight: 600;">Termination Notice</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">Create termination notices</p>
          </div>
          
          <div class="agreement-type-card" data-type="upload" style="
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
            <h3 style="margin: 0 0 8px 0; color: white; font-size: 18px; font-weight: 600;">Upload Document</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">Upload existing signed documents</p>
          </div>
        </div>
        
        <div style="text-align: center;">
          <button onclick="window.parent.closeAgreementForm()" style="
            background: #f3f4f6;
            color: #374151;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s ease;
          ">Cancel</button>
        </div>
      </div>
    `;
    
    openAgreementModal('Select Agreement Type', modalHtml);
    
    // Add hover effects and click handlers
    setTimeout(() => {
      const cards = document.querySelectorAll('.agreement-type-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'none';
        });
        
        card.addEventListener('click', () => {
          const type = card.dataset.type;
          closeAgreementForm();
          
          switch(type) {
            case 'lease':
              showLeaseAgreementForm();
              break;
            case 'purchase':
              showPurchaseAgreementForm();
              break;
            case 'maintenance':
              showMaintenanceAgreementForm();
              break;
            case 'termination':
              showTerminationForm();
              break;
            case 'upload':
              showDocumentUploadForm();
              break;
          }
        });
      });
    }, 100);
  };

  const showLeaseAgreementForm = () => {
    const formHtml = `
      <div style="padding: 32px; max-width: 600px; margin: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Lease Agreement</h2>
          <p style="margin: 0; color: #6b7280; font-size: 16px;">Create a rental agreement for your property</p>
        </div>
        
        <form id="leaseForm" style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Property Name *</label>
              <input type="text" id="propertyName" required style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              " placeholder="e.g., Modern Thamel Apartment">
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Property Address</label>
              <input type="text" id="propertyAddress" style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              " placeholder="e.g., Thamel, Kathmandu">
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Landlord Name *</label>
              <input type="text" id="landlordName" required style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              " placeholder="Landlord full name">
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Tenant Name *</label>
              <input type="text" id="tenantName" required style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              " placeholder="Tenant full name">
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Monthly Rent (NPR) *</label>
              <input type="number" id="rentAmount" required min="0" style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              " placeholder="25000">
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Security Deposit (NPR)</label>
              <input type="number" id="depositAmount" min="0" style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              " placeholder="50000">
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Lease Duration *</label>
              <select id="duration" required style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
                background: white;
              ">
                <option value="">Select duration</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
                <option value="18 months">18 months</option>
                <option value="24 months">24 months</option>
                <option value="36 months">36 months</option>
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Start Date *</label>
              <input type="date" id="startDate" required style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              ">
            </div>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 6px; color: #374151; font-size: 14px; font-weight: 500;">Special Terms & Conditions</label>
            <textarea id="specialTerms" rows="4" style="
              width: 100%;
              padding: 12px 16px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              transition: border-color 0.2s ease;
              box-sizing: border-box;
              resize: vertical;
            " placeholder="Any special terms or conditions..."></textarea>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
            <button type="button" onclick="window.closeAgreementModal()" style="
              background: #f3f4f6;
              color: #374151;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s ease;
            ">Cancel</button>
            <button type="button" onclick="window.parent.createLeaseAgreement()" style="
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            ">Create Agreement</button>
          </div>
        </form>
      </div>
    `;
    
    openAgreementModal('Create Lease Agreement', formHtml);
    
    // Add input focus effects
    setTimeout(() => {
      const inputs = document.querySelectorAll('#leaseForm input, #leaseForm select, #leaseForm textarea');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          input.style.borderColor = '#3b82f6';
          input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        });
        
        input.addEventListener('blur', () => {
          input.style.borderColor = '#e5e7eb';
          input.style.boxShadow = 'none';
        });
      });
    }, 100);
  };

  const showPurchaseAgreementForm = () => {
    const formHtml = `
      <div style="padding: 20px; max-width: 600px; margin: auto;">
        <h3>Purchase Agreement Form</h3>
        <div style="margin: 15px 0;">
          <label>Property Name:</label>
          <input type="text" id="propertyName" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Buyer Name:</label>
          <input type="text" id="buyerName" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Seller Name:</label>
          <input type="text" id="sellerName" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Purchase Price (NPR):</label>
          <input type="number" id="purchasePrice" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Payment Method:</label>
          <select id="paymentMethod" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option>Bank Transfer</option>
            <option>Cash</option>
            <option>Installment</option>
            <option>Check</option>
          </select>
        </div>
        <div style="margin: 15px 0;">
          <label>Completion Date:</label>
          <input type="date" id="completionDate" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 20px 0;">
          <button onclick="window.parent.createPurchaseAgreement()" style="background: #10b981; color: white; padding: 10px 20px; border: none; margin-right: 10px;">Create Agreement</button>
          <button onclick="window.parent.closeAgreementForm()" style="background: #6b7280; color: white; padding: 10px 20px; border: none;">Cancel</button>
        </div>
      </div>
    `;
    
    openAgreementModal('Create Purchase Agreement', formHtml);
  };

  const showMaintenanceAgreementForm = () => {
    const formHtml = `
      <div style="padding: 20px; max-width: 600px; margin: auto;">
        <h3>Maintenance Agreement Form</h3>
        <div style="margin: 15px 0;">
          <label>Property Name:</label>
          <input type="text" id="propertyName" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Service Provider:</label>
          <input type="text" id="serviceProvider" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Service Type:</label>
          <input type="text" id="serviceType" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Monthly Cost (NPR):</label>
          <input type="number" id="monthlyCost" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Service Frequency:</label>
          <select id="frequency" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Annually</option>
          </select>
        </div>
        <div style="margin: 15px 0;">
          <label>Next Service Date:</label>
          <input type="date" id="nextServiceDate" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 20px 0;">
          <button onclick="window.parent.createMaintenanceAgreement()" style="background: #10b981; color: white; padding: 10px 20px; border: none; margin-right: 10px;">Create Agreement</button>
          <button onclick="window.parent.closeAgreementForm()" style="background: #6b7280; color: white; padding: 10px 20px; border: none;">Cancel</button>
        </div>
      </div>
    `;
    
    openAgreementModal('Create Maintenance Agreement', formHtml);
  };

  const showTerminationForm = () => {
    const formHtml = `
      <div style="padding: 20px; max-width: 600px; margin: auto;">
        <h3>Termination Notice Form</h3>
        <div style="margin: 15px 0;">
          <label>Property Name:</label>
          <input type="text" id="propertyName" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Termination Reason:</label>
          <textarea id="terminationReason" style="width: 100%; padding: 8px; margin: 5px 0; min-height: 80px;"></textarea>
        </div>
        <div style="margin: 15px 0;">
          <label>Notice Period:</label>
          <select id="noticePeriod" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option>15 days</option>
            <option>30 days</option>
            <option>60 days</option>
            <option>90 days</option>
          </select>
        </div>
        <div style="margin: 15px 0;">
          <label>Notice Date:</label>
          <input type="date" id="noticeDate" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Effective Date:</label>
          <input type="date" id="effectiveDate" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 20px 0;">
          <button onclick="window.parent.createTerminationNotice()" style="background: #10b981; color: white; padding: 10px 20px; border: none; margin-right: 10px;">Create Notice</button>
          <button onclick="window.parent.closeAgreementForm()" style="background: #6b7280; color: white; padding: 10px 20px; border: none;">Cancel</button>
        </div>
      </div>
    `;
    
    openAgreementModal('Create Termination Notice', formHtml);
  };

  const showDocumentUploadForm = () => {
    const formHtml = `
      <div style="padding: 20px; max-width: 600px; margin: auto;">
        <h3>Upload Agreement Document</h3>
        <div style="margin: 15px 0;">
          <label>Agreement Title:</label>
          <input type="text" id="documentTitle" placeholder="e.g., Rental Agreement - Modern Apartment" style="width: 100%; padding: 8px; margin: 5px 0;">
        </div>
        <div style="margin: 15px 0;">
          <label>Agreement Type:</label>
          <select id="agreementType" style="width: 100%; padding: 8px; margin: 5px 0;">
            <option value="lease">Lease Agreement</option>
            <option value="purchase">Purchase Agreement</option>
            <option value="maintenance">Maintenance Agreement</option>
            <option value="termination">Termination Notice</option>
            <option value="custom">Custom Agreement</option>
          </select>
        </div>
        <div style="margin: 15px 0;">
          <label>Choose File:</label>
          <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="width: 100%; padding: 8px; margin: 5px 0;">
          <small style="color: #6b7280;">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</small>
        </div>
        <div style="margin: 15px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0;">Or Scan Document</h4>
          <button type="button" onclick="window.parent.startDocumentScanning()" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px;">
            📷 Start Scanning
          </button>
          <small style="display: block; margin-top: 8px; color: #6b7280;">Use your device camera to scan documents</small>
        </div>
        <div style="margin: 20px 0;">
          <button onclick="window.parent.uploadDocument()" style="background: #10b981; color: white; padding: 10px 20px; border: none; margin-right: 10px;">Upload Document</button>
          <button onclick="window.parent.closeAgreementForm()" style="background: #6b7280; color: white; padding: 10px 20px; border: none;">Cancel</button>
        </div>
      </div>
    `;
    
    openAgreementModal('Upload Agreement Document', formHtml);
  };

  const openAgreementModal = (title, content) => {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;
    
    modalContent.innerHTML = content;
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Store reference for cleanup
    window.currentAgreementModal = modalOverlay;
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeAgreementForm();
      }
    });
  };

  const closeAgreementForm = () => {
    if (window.currentAgreementModal) {
      document.body.removeChild(window.currentAgreementModal);
      window.currentAgreementModal = null;
    }
  };

  // Global functions for modal buttons
  window.createLeaseAgreement = () => {
    const propertyName = document.getElementById('propertyName')?.value;
    const propertyAddress = document.getElementById('propertyAddress')?.value;
    const landlordName = document.getElementById('landlordName')?.value;
    const tenantName = document.getElementById('tenantName')?.value;
    const rentAmount = document.getElementById('rentAmount')?.value;
    const depositAmount = document.getElementById('depositAmount')?.value;
    const duration = document.getElementById('duration')?.value;
    const startDate = document.getElementById('startDate')?.value;
    const specialTerms = document.getElementById('specialTerms')?.value;
    
    if (!propertyName || !landlordName || !tenantName || !rentAmount || !duration || !startDate) {
      alert('Please fill in all required fields marked with *');
      return;
    }
    
    // Create lease agreement and add to agreements list
    const newAgreement = {
      _id: Date.now().toString(),
      type: 'lease',
      title: `Lease Agreement - ${propertyName}`,
      status: 'active',
      property: {
        name: propertyName,
        address: propertyAddress || 'Not specified'
      },
      parties: {
        landlord: {
          fullName: landlordName
        },
        tenant: {
          fullName: tenantName
        }
      },
      terms: {
        rentAmount: parseInt(rentAmount),
        securityDeposit: parseInt(depositAmount) || 0,
        duration: duration,
        specialTerms: specialTerms || ''
      },
      dates: {
        startDate: startDate,
        endDate: calculateEndDate(startDate, duration)
      },
      createdAt: new Date().toISOString()
    };
    
    // Add to agreements list
    setAgreements(prev => [...prev, newAgreement]);
    
    console.log('Creating lease agreement:', newAgreement);
    alert('Lease agreement created successfully!');
    closeAgreementForm();
  };

  window.createPurchaseAgreement = () => {
    const propertyName = document.getElementById('propertyName')?.value;
    const buyerName = document.getElementById('buyerName')?.value;
    const sellerName = document.getElementById('sellerName')?.value;
    const purchasePrice = document.getElementById('purchasePrice')?.value;
    const paymentMethod = document.getElementById('paymentMethod')?.value;
    const completionDate = document.getElementById('completionDate')?.value;
    
    if (!propertyName || !buyerName || !sellerName || !purchasePrice || !completionDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create purchase agreement
    const newAgreement = {
      _id: Date.now().toString(),
      type: 'purchase',
      title: `Purchase Agreement - ${propertyName}`,
      status: 'pending',
      property: {
        name: propertyName
      },
      parties: {
        buyer: {
          fullName: buyerName
        },
        seller: {
          fullName: sellerName
        }
      },
      terms: {
        purchasePrice: parseInt(purchasePrice),
        paymentMethod: paymentMethod
      },
      dates: {
        signingDate: new Date().toISOString().split('T')[0],
        endDate: completionDate
      },
      createdAt: new Date().toISOString()
    };
    
    setAgreements(prev => [...prev, newAgreement]);
    
    console.log('Creating purchase agreement:', newAgreement);
    alert('Purchase agreement created successfully!');
    closeAgreementForm();
  };

  window.createMaintenanceAgreement = () => {
    const propertyName = document.getElementById('propertyName')?.value;
    const serviceProvider = document.getElementById('serviceProvider')?.value;
    const serviceType = document.getElementById('serviceType')?.value;
    const monthlyCost = document.getElementById('monthlyCost')?.value;
    const frequency = document.getElementById('frequency')?.value;
    const nextServiceDate = document.getElementById('nextServiceDate')?.value;
    
    if (!propertyName || !serviceProvider || !serviceType || !monthlyCost) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create maintenance agreement
    const newAgreement = {
      _id: Date.now().toString(),
      type: 'maintenance',
      title: `Maintenance Agreement - ${serviceType}`,
      status: 'active',
      property: {
        name: propertyName
      },
      parties: {
        service_provider: {
          fullName: serviceProvider
        }
      },
      terms: {
        serviceDetails: {
          serviceType: serviceType,
          cost: parseInt(monthlyCost),
          frequency: frequency,
          nextServiceDate: nextServiceDate
        }
      },
      createdAt: new Date().toISOString()
    };
    
    setAgreements(prev => [...prev, newAgreement]);
    
    console.log('Creating maintenance agreement:', newAgreement);
    alert('Maintenance agreement created successfully!');
    closeAgreementForm();
  };

  window.createTerminationNotice = () => {
    const propertyName = document.getElementById('propertyName')?.value;
    const terminationReason = document.getElementById('terminationReason')?.value;
    const noticePeriod = document.getElementById('noticePeriod')?.value;
    const noticeDate = document.getElementById('noticeDate')?.value;
    const effectiveDate = document.getElementById('effectiveDate')?.value;
    
    if (!propertyName || !terminationReason || !noticeDate || !effectiveDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create termination notice
    const newAgreement = {
      _id: Date.now().toString(),
      type: 'termination',
      title: `Termination Notice - ${propertyName}`,
      status: 'pending',
      property: {
        name: propertyName
      },
      terms: {
        terminationReason: terminationReason,
        noticePeriod: noticePeriod
      },
      dates: {
        noticeDate: noticeDate,
        effectiveDate: effectiveDate
      },
      createdAt: new Date().toISOString()
    };
    
    setAgreements(prev => [...prev, newAgreement]);
    
    console.log('Creating termination notice:', newAgreement);
    alert('Termination notice created successfully!');
    closeAgreementForm();
  };

  window.uploadDocument = () => {
    const documentTitle = document.getElementById('documentTitle')?.value;
    const agreementType = document.getElementById('agreementType')?.value;
    const fileInput = document.getElementById('fileInput');
    
    if (!documentTitle || !fileInput.files.length) {
      alert('Please provide a title and select a file');
      return;
    }
    
    const file = fileInput.files[0];
    
    // Check file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit.');
      return;
    }
    
    // Create uploaded document agreement
    const newAgreement = {
      _id: Date.now().toString(),
      type: agreementType,
      title: documentTitle,
      status: 'active',
      document: {
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
    
    setAgreements(prev => [...prev, newAgreement]);
    
    console.log('Uploading document:', { documentTitle, agreementType, file: file.name });
    alert(`Document "${file.name}" uploaded successfully!`);
    closeAgreementForm();
  };

  // Helper function to calculate end date
  const calculateEndDate = (startDate, duration) => {
    const start = new Date(startDate);
    let months = 0;
    
    switch(duration) {
      case '6 months': months = 6; break;
      case '12 months': months = 12; break;
      case '18 months': months = 18; break;
      case '24 months': months = 24; break;
      case '36 months': months = 36; break;
      default: months = 12;
    }
    
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate.toISOString().split('T')[0];
  };

  window.startDocumentScanning = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      alert('Camera access would be requested here to scan documents. This feature would open your device camera to capture documents.');
    } else {
      alert('Scanning feature is not supported on this device. Please use the file upload option.');
    }
  };

  // Additional global functions for the agreement detail modal
  window.downloadCurrentAgreement = () => {
    if (window.currentViewingAgreement) {
      downloadAgreement(window.currentViewingAgreement._id, window.currentViewingAgreement.title);
    }
  };

  window.printCurrentAgreement = () => {
    if (window.currentViewingAgreement) {
      printAgreement(window.currentViewingAgreement._id, window.currentViewingAgreement.title);
    }
  };

  // Add global close modal function
  window.closeAgreementModal = () => {
    if (window.currentAgreementModal) {
      document.body.removeChild(window.currentAgreementModal);
      window.currentAgreementModal = null;
    }
  };

  // Load agreements when agreements tab is active
  useEffect(() => {
    if (active === "lease" && userType === "user") {
      fetchUserAgreements();
    }
  }, [active, userType]);

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
            ["home", "add-property", "manage-tenants", "requests", "view-listings", "financial-reports", "chat", "settings"].map((key) => (
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
                   key === "requests" ? "Maintenance Requests" :
                   key === "view-listings" ? "View Listings" :
                   key === "financial-reports" ? "Financial Reports" :
                   key === "chat" ? "Chat" :
                   key === "settings" ? "Settings" : key}
                </span>
              </button>
            ))
          :
            // User navigation - only tenant-relevant items
            ["home", "view-listings", "pay-rent", "maintenance", "lease", "contact", "chat", "settings"].map((key) => (
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
                   key === "view-listings" ? "Browse Properties" :
                   key === "pay-rent" ? "Pay Rent" :
                   key === "maintenance" ? "Request Maintenance" :
                   key === "lease" ? "Agreements" :
                   key === "contact" ? "Contact Landlord" :
                   key === "chat" ? "Chat" :
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
                  
                  <button
                    type="button"
                    onClick={() => setActive("requests")}
                    className="rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Maintenance Requests</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {ownerMaintenanceItems.filter((r) => r.type === "request" && r.status !== "Completed").length}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                  </button>
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

        {active === "pay-rent" && userType === "user" && (
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Rent Items</h2>
                    <p className="text-xs text-gray-500">Pay rent for multiple properties</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRentSuccess("");
                      const firstProp = tenantRentalProperties[0];
                      setRentDraft({
                        propertyId: firstProp?.id || "",
                        propertyLabel: firstProp?.label || "",
                        ownerUsername: firstProp?.landlord?.username || "",
                        landlordName: firstProp?.landlord?.name || "",
                        monthlyRent: "",
                        dueDay: "15",
                      });
                    }}
                    className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    + Create New
                  </button>
                </div>

                <div className="p-2 space-y-2 max-h-[720px] overflow-auto">
                  {rentAccounts.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600">No rent items yet.</div>
                  ) : (
                    rentAccounts.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedRentAccountId(a.id)}
                        className={`w-full text-left rounded-2xl border p-3 transition ${
                          selectedRentAccountId === a.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{a.propertyLabel}</p>
                            <p className="text-xs text-gray-500 truncate">{a.landlordName}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              a.status === "Paid"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                            NPR {Number(a.monthlyRent).toLocaleString()}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                            Due day {a.dueDay}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Pay Rent</h2>
                  <p className="text-xs text-gray-500">Select a rent item on the left or create a new one.</p>
                </div>

                <div className="p-5 space-y-5">
                  {rentSuccess ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      {rentSuccess}
                    </div>
                  ) : null}

                  {(() => {
                    const selected = rentAccounts.find((a) => a.id === selectedRentAccountId) ?? null;

                    if (!selected) {
                      return (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                          No rent item selected.
                        </div>
                      );
                    }

                    const lastPaid = selected.lastPaidAt ? new Date(selected.lastPaidAt).toLocaleString() : "Not paid yet";

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm font-semibold text-gray-900">{selected.propertyLabel}</p>
                          <p className="text-xs text-gray-500">{selected.landlordName}</p>
                          <div className="mt-3 space-y-1 text-sm text-gray-700">
                            <p>
                              <span className="text-gray-500">Monthly:</span> NPR{" "}
                              {Number(selected.monthlyRent).toLocaleString()}
                            </p>
                            <p>
                              <span className="text-gray-500">Due day:</span> {selected.dueDay}
                            </p>
                            <p>
                              <span className="text-gray-500">Last paid:</span> {lastPaid}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <p className="text-sm font-semibold text-gray-900">Payment</p>
                          <p className="mt-1 text-xs text-gray-500">This demo records payment as Paid.</p>
                          <button
                            type="button"
                            onClick={() => payRentNow(selected.id)}
                            className="mt-4 w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            Pay NPR {Number(selected.monthlyRent).toLocaleString()}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Create Rent Item</h3>
                    <form onSubmit={createRentAccount} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Use Existing Property</label>
                          <select
                            value={rentDraft.propertyId}
                            onChange={(e) => {
                              const prop = tenantRentalProperties.find((p) => p.id === e.target.value) ?? null;
                              setRentDraft((prev) => ({
                                ...prev,
                                propertyId: e.target.value,
                                propertyLabel: prop?.label || prev.propertyLabel,
                                ownerUsername: prop?.landlord?.username || prev.ownerUsername,
                                landlordName: prop?.landlord?.name || prev.landlordName,
                              }));
                            }}
                            className={tenantMaintenanceInputBase}
                          >
                            <option value="">Select property (optional)</option>
                            {tenantRentalProperties.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">Or type a new property below.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (NPR)</label>
                          <input
                            type="number"
                            value={rentDraft.monthlyRent}
                            onChange={(e) => setRentDraft((prev) => ({ ...prev, monthlyRent: e.target.value }))}
                            className={tenantMaintenanceInputBase}
                            placeholder="25000"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                          <input
                            type="text"
                            value={rentDraft.propertyLabel}
                            onChange={(e) => setRentDraft((prev) => ({ ...prev, propertyLabel: e.target.value }))}
                            className={tenantMaintenanceInputBase}
                            placeholder="Example: Room 1 - Unit C-301"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Due Day</label>
                          <select
                            value={rentDraft.dueDay}
                            onChange={(e) => setRentDraft((prev) => ({ ...prev, dueDay: e.target.value }))}
                            className={tenantMaintenanceInputBase}
                          >
                            {Array.from({ length: 28 }, (_, i) => String(i + 1)).map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name</label>
                          <input
                            type="text"
                            value={rentDraft.landlordName}
                            onChange={(e) => setRentDraft((prev) => ({ ...prev, landlordName: e.target.value }))}
                            className={tenantMaintenanceInputBase}
                            placeholder="Landlord"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Username</label>
                          <input
                            type="text"
                            value={rentDraft.ownerUsername}
                            onChange={(e) => setRentDraft((prev) => ({ ...prev, ownerUsername: e.target.value }))}
                            className={tenantMaintenanceInputBase}
                            placeholder="rajesh"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setRentDraft({ propertyId: "", propertyLabel: "", ownerUsername: "", landlordName: "", monthlyRent: "", dueDay: "15" })}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === "lease" && (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Agreements & Documents</h2>
                <button 
                  onClick={createNewAgreement}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H8m8 8l-4-4m4 4l-4 4" />
                  </svg>
                  Create New Agreement
                </button>
              </div>
              
              {/* Agreement Type Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {['lease', 'purchase', 'maintenance', 'termination'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAgreementType(type)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                        agreementType === type
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {type === 'lease' && 'Lease Agreements'}
                      {type === 'purchase' && 'Purchase Agreements'}
                      {type === 'maintenance' && 'Maintenance Agreements'}
                      {type === 'termination' && 'Termination Notices'}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Agreement Content Based on Type */}
              {agreementType === 'lease' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">My Lease Agreements</h3>
                    {loading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(Array.isArray(agreements) ? agreements.filter(a => a.type === 'lease') : []).map((agreement) => (
                          <div key={agreement._id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{agreement.title}</h4>
                                <p className="text-sm text-gray-600">{agreement.property?.name || 'Property Details'}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                agreement.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : agreement.status === 'expired'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {agreement.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Landlord</p>
                                <p className="font-medium">{agreement.parties?.landlord?.fullName || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Monthly Rent</p>
                                <p className="font-medium text-blue-600">NPR {agreement.terms?.rentAmount?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Security Deposit</p>
                                <p className="font-medium text-green-600">NPR {agreement.terms?.securityDeposit?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Duration</p>
                                <p className="font-medium">{agreement.terms?.duration || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                              <div>
                                <p className="text-gray-500">Start Date</p>
                                <p className="font-medium">{agreement.dates?.startDate ? new Date(agreement.dates.startDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">End Date</p>
                                <p className="font-medium">{agreement.dates?.endDate ? new Date(agreement.dates.endDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => viewFullAgreement(agreement)}
                                className="flex-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 font-medium text-sm"
                              >
                                View Full Agreement
                              </button>
                              <button 
                                onClick={() => downloadAgreement(agreement._id, agreement.title)}
                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Download PDF
                              </button>
                              <button 
                                onClick={() => printAgreement(agreement._id, agreement.title)}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Print
                              </button>
                              <button 
                                onClick={() => terminateAgreement(agreement._id)}
                                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm"
                              >
                                Terminate
                              </button>
                            </div>
                          </div>
                        ))}
                        {agreements.filter(a => a.type === 'lease').length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-600">No lease agreements found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {agreementType === 'purchase' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">My Purchase Agreements</h3>
                    {loading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(Array.isArray(agreements) ? agreements.filter(a => a.type === 'purchase') : []).map((agreement) => (
                          <div key={agreement._id} className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{agreement.title}</h4>
                                <p className="text-sm text-gray-600">{agreement.property?.name || 'Property Details'}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                agreement.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : agreement.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {agreement.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Buyer</p>
                                <p className="font-medium">{agreement.parties?.buyer?.fullName || 'You'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Seller</p>
                                <p className="font-medium">{agreement.parties?.seller?.fullName || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Purchase Price</p>
                                <p className="font-medium text-blue-600">NPR {agreement.terms?.purchasePrice?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Payment Method</p>
                                <p className="font-medium">{agreement.terms?.paymentMethod || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                              <div>
                                <p className="text-gray-500">Signing Date</p>
                                <p className="font-medium">{agreement.dates?.signingDate ? new Date(agreement.dates.signingDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Completion Date</p>
                                <p className="font-medium">{agreement.dates?.endDate ? new Date(agreement.dates.endDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => viewFullAgreement(agreement)}
                                className="flex-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 font-medium text-sm"
                              >
                                View Full Agreement
                              </button>
                              <button 
                                onClick={() => downloadAgreement(agreement._id, agreement.title)}
                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Download PDF
                              </button>
                              <button 
                                onClick={() => printAgreement(agreement._id, agreement.title)}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Print
                              </button>
                              <button 
                                onClick={() => signAgreement(agreement._id)}
                                className="px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm"
                              >
                                Sign
                              </button>
                            </div>
                          </div>
                        ))}
                        {agreements.filter(a => a.type === 'purchase').length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-600">No purchase agreements found</p>
                            <p className="text-sm text-gray-500 mt-2">Purchase agreements will appear here when you buy properties</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {agreementType === 'maintenance' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance Agreements</h3>
                    {loading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(Array.isArray(agreements) ? agreements.filter(a => a.type === 'maintenance') : []).map((agreement) => (
                          <div key={agreement._id} className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{agreement.title}</h4>
                                <p className="text-sm text-gray-600">{agreement.property?.name || 'Property Details'}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                agreement.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {agreement.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Service Provider</p>
                                <p className="font-medium">{agreement.parties?.service_provider?.fullName || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Cost</p>
                                <p className="font-medium text-blue-600">NPR {agreement.terms?.serviceDetails?.cost?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Frequency</p>
                                <p className="font-medium">{agreement.terms?.serviceDetails?.frequency || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Next Service</p>
                                <p className="font-medium">{agreement.terms?.serviceDetails?.nextServiceDate ? new Date(agreement.terms.serviceDetails.nextServiceDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => viewFullAgreement(agreement)}
                                className="flex-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 font-medium text-sm"
                              >
                                View Full Agreement
                              </button>
                              <button 
                                onClick={() => downloadAgreement(agreement._id, agreement.title)}
                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Download PDF
                              </button>
                              <button 
                                onClick={() => printAgreement(agreement._id, agreement.title)}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Print
                              </button>
                              <button 
                                onClick={() => scheduleService(agreement)}
                                className="px-3 py-2 border border-yellow-300 text-yellow-600 rounded-lg hover:bg-yellow-50 font-medium text-sm"
                              >
                                Schedule Service
                              </button>
                              <button 
                                onClick={() => cancelAgreement(agreement._id)}
                                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                        {agreements.filter(a => a.type === 'maintenance').length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-600">No maintenance agreements found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {agreementType === 'termination' && (
                <div className="space-y-6">
                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Termination Notices</h3>
                    {loading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(Array.isArray(agreements) ? agreements.filter(a => a.type === 'termination') : []).map((agreement) => (
                          <div key={agreement._id} className="bg-white rounded-lg p-4 border border-red-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{agreement.title}</h4>
                                <p className="text-sm text-gray-600">{agreement.property?.name || 'Property Details'}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                agreement.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : agreement.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {agreement.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Reason</p>
                                <p className="font-medium">{agreement.terms?.terminationReason || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Notice Date</p>
                                <p className="font-medium">{agreement.dates?.noticeDate ? new Date(agreement.dates.noticeDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Effective Date</p>
                                <p className="font-medium">{agreement.dates?.effectiveDate ? new Date(agreement.dates.effectiveDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Notice Period</p>
                                <p className="font-medium">{agreement.terms?.noticePeriod || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => viewFullAgreement(agreement)}
                                className="flex-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 font-medium text-sm"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => downloadAgreement(agreement._id, agreement.title)}
                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Download Notice
                              </button>
                              <button 
                                onClick={() => printAgreement(agreement._id, agreement.title)}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                              >
                                Print
                              </button>
                              {agreement.status === 'pending' && (
                                <button 
                                  onClick={() => cancelAgreement(agreement._id)}
                                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm"
                                >
                                  Withdraw
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {agreements.filter(a => a.type === 'termination').length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-600">No termination notices found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-Generation Info */}
              <div className="mt-6 bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Automatic Agreement Generation</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Purchase Properties</p>
                      <p className="text-sm text-gray-600">When you buy a property, purchase agreements are automatically generated and added here</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rent Properties</p>
                      <p className="text-sm text-gray-600">When you rent a property, lease agreements are automatically created</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Create New Agreements</p>
                      <p className="text-sm text-gray-600">Use the "Create New Agreement" button to generate custom agreements or upload existing documents</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === "maintenance" && userType === "user" && (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
              {/* Requests list */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Requests</h2>
                    <p className="text-xs text-gray-500">Maintenance tickets for your rental</p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewTenantMaintenanceRequest}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    + New
                  </button>
                </div>

                <div className="max-h-[520px] overflow-auto p-2">
                  {tenantMaintenanceRequests.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600">No maintenance requests yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {tenantMaintenanceRequests.map((request) => (
                        <button
                          key={request.id}
                          type="button"
                          onClick={() => setSelectedTenantMaintenanceId(request.id)}
                          className={`w-full text-left rounded-2xl border p-3 transition ${
                            selectedTenantMaintenanceId === request.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                          aria-current={selectedTenantMaintenanceId === request.id ? "true" : "false"}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{request.title}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {request.propertyLabel}{request.landlordName ? ` - ${request.landlordName}` : ""}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tenantMaintenanceStatusStyles(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                              {request.category}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                              {request.priority}
                            </span>
                            <span className="ml-auto text-gray-500">{request.date}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Request form */}
              <div ref={tenantMaintenanceFormRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Request Form</h2>
                  <p className="text-xs text-gray-500">Create a new ticket for maintenance help.</p>
                </div>

                <form onSubmit={submitTenantMaintenanceRequest} className="p-5 space-y-5">
                  {tenantMaintenanceSuccess ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      {tenantMaintenanceSuccess}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                      <select
                        value={tenantMaintenanceDraft.propertyLabel}
                        onChange={(e) =>
                          setTenantMaintenanceDraft((prev) => ({ ...prev, propertyLabel: e.target.value }))
                        }
                        className={tenantMaintenanceInputBase}
                      >
                        {tenantRentalProperties.map((p) => (
                          <option key={p.id} value={p.label}>
                            {p.label} (Landlord: {p.landlord.name})
                          </option>
                        ))}
                      </select>
                      {tenantMaintenanceErrors.propertyLabel ? (
                        <p className="mt-1 text-xs text-red-600">{tenantMaintenanceErrors.propertyLabel}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                      <select
                        value={tenantMaintenanceDraft.category}
                        onChange={(e) =>
                          setTenantMaintenanceDraft((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className={tenantMaintenanceInputBase}
                      >
                        {["Plumbing", "Electrical", "HVAC", "Appliance", "Other"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={tenantMaintenanceDraft.priority}
                        onChange={(e) =>
                          setTenantMaintenanceDraft((prev) => ({ ...prev, priority: e.target.value }))
                        }
                        className={tenantMaintenanceInputBase}
                      >
                        {["Emergency", "High", "Medium", "Low"].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                      <input
                        type="datetime-local"
                        value={tenantMaintenanceDraft.preferredDateTime}
                        onChange={(e) =>
                          setTenantMaintenanceDraft((prev) => ({ ...prev, preferredDateTime: e.target.value }))
                        }
                        className={tenantMaintenanceInputBase}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={tenantMaintenanceDraft.title}
                      onChange={(e) => setTenantMaintenanceDraft((prev) => ({ ...prev, title: e.target.value }))}
                      className={tenantMaintenanceInputBase}
                      placeholder="Short summary (e.g., Water leak under sink)"
                    />
                    {tenantMaintenanceErrors.title ? (
                      <p className="mt-1 text-xs text-red-600">{tenantMaintenanceErrors.title}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows="5"
                      value={tenantMaintenanceDraft.description}
                      onChange={(e) =>
                        setTenantMaintenanceDraft((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Please describe the maintenance issue in detail..."
                      className={`${tenantMaintenanceInputBase} min-h-[140px] resize-y`}
                    />
                    {tenantMaintenanceErrors.description ? (
                      <p className="mt-1 text-xs text-red-600">{tenantMaintenanceErrors.description}</p>
                    ) : null}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActive('home')}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Need to message your landlord? Open <span className="font-semibold">Contact Landlord</span> from the sidebar.
            </div>

            <div className="hidden">
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
                        <p className="text-sm text-green-600">• Online</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm">+977-987654321</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm">rajesh.kumar@rent.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        placeholder="Enter subject..."
                        className={tenantMaintenanceInputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        rows="4"
                        placeholder="Type your message here..."
                        className={`${tenantMaintenanceInputBase} resize-y`}
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActive('home')}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
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

        {active === "contact" && userType === "user" && (
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Landlords</h2>
                  <p className="text-xs text-gray-500">Pick a property to contact its landlord</p>
                </div>

                <div className="p-2 space-y-2">
                  {tenantRentalProperties.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedContactPropertyId(p.id);
                        setContactSuccess("");
                      }}
                      className={`w-full text-left rounded-2xl border p-3 transition ${
                        selectedContactPropertyId === p.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.label}</p>
                      <p className="text-xs text-gray-500 truncate">{p.landlord.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Contact Landlord</h2>
                  <p className="text-xs text-gray-500">Send a message to your landlord for the selected property.</p>
                </div>

                <div className="p-5 space-y-5">
                  {(() => {
                    const selected =
                      tenantRentalProperties.find((p) => p.id === selectedContactPropertyId) ??
                      tenantRentalProperties[0] ??
                      null;

                    if (!selected) {
                      return <p className="text-sm text-gray-600">No properties available.</p>;
                    }

                    return (
                      <>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm font-semibold text-gray-900">{selected.label}</p>
                          <div className="mt-2 text-sm text-gray-700 space-y-1">
                            <p>
                              <span className="text-gray-500">Landlord:</span> {selected.landlord.name}
                            </p>
                            <p>
                              <span className="text-gray-500">Phone:</span> {selected.landlord.phone}
                            </p>
                            <p>
                              <span className="text-gray-500">Email:</span> {selected.landlord.email}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={submitContactMessage} className="space-y-4">
                          {contactSuccess ? (
                            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                              {contactSuccess}
                            </div>
                          ) : null}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                              type="text"
                              value={contactDraft.subject}
                              onChange={(e) => setContactDraft((prev) => ({ ...prev, subject: e.target.value }))}
                              placeholder="Enter subject..."
                              className={tenantMaintenanceInputBase}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                              rows="5"
                              value={contactDraft.message}
                              onChange={(e) => setContactDraft((prev) => ({ ...prev, message: e.target.value }))}
                              placeholder="Type your message here..."
                              className={`${tenantMaintenanceInputBase} resize-y`}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              For maintenance problems, use <span className="font-semibold">Request Maintenance</span>.
                            </p>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setActive("home")}
                              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              Send Message
                            </button>
                          </div>
                        </form>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {active === "maintenance_legacy" && (
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

        {active === "view-listings" && userType === "user" && (
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Browse Properties</h1>
                    <p className="text-sm text-gray-600">Find your perfect rental property</p>
                  </div>
                  <button 
                    onClick={() => setActive('home')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Search Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Properties</h2>
                
                {/* Rent/Buy Toggle */}
                <div className="mb-6">
                  <div className="flex items-center justify-center">
                    <div className="bg-gray-100 rounded-lg p-1 flex">
                      <button 
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                          listingType === 'For Rent' 
                            ? 'bg-primary text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setListingType('For Rent')}
                      >
                        For Rent
                      </button>
                      <button 
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                          listingType === 'For Buy' 
                            ? 'bg-primary text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setListingType('For Buy')}
                      >
                        For Buy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input 
                      type="text" 
                      placeholder="Enter city or area"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select 
                      value={searchFilters.propertyType}
                      onChange={(e) => setSearchFilters({...searchFilters, propertyType: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option>All Types</option>
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Studio</option>
                      <option>Room</option>
                      <option>Villa</option>
                      <option>Land</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select 
                      value={searchFilters.priceRange}
                      onChange={(e) => setSearchFilters({...searchFilters, priceRange: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option>Any Price</option>
                      <option>Under 15,000</option>
                      <option>15,000 - 25,000</option>
                      <option>25,000 - 40,000</option>
                      <option>40,000 - 60,000</option>
                      <option>Above 60,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <select 
                      value={searchFilters.bedrooms}
                      onChange={(e) => setSearchFilters({...searchFilters, bedrooms: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option>Any</option>
                      <option>Studio</option>
                      <option>1 Bed</option>
                      <option>2 Beds</option>
                      <option>3 Beds</option>
                      <option>4+ Beds</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={handleSearchProperties}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors"
                  >
                    Search Properties
                  </button>
                  <button 
                    onClick={handleClearFilters}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Featured Properties */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Featured Properties
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchFeaturedProperties} className="mt-4 text-primary hover:underline">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Array.isArray(featuredProperties) ? featuredProperties.filter(property => 
                      listingType === 'For Rent' ? 
                        property.listingType === 'For Rent' || property.listingType === 'For Both' :
                        property.listingType === 'For Sale' || property.listingType === 'For Both'
                    ) : []).map((property) => (
                      <div key={property._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="relative">
                          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            {property.images && property.images.length > 0 ? (
                              <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            )}
                          </div>
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              FEATURED
                            </span>
                            {property.listingType === 'For Sale' || property.listingType === 'For Both' ? (
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                FOR SALE
                              </span>
                            ) : (
                              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                FOR RENT
                              </span>
                            )}
                          </div>
                          <div className="absolute top-4 right-4">
                            <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                          <p className="text-gray-600 mb-4 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {property.city}, {property.state}
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-2xl font-bold text-primary">
                              {property.listingType === 'For Sale' || property.listingType === 'For Both' ? 
                                `NPR ${property.salePrice?.toLocaleString()}` : 
                                `NPR ${property.monthlyRent?.toLocaleString()}/mo`
                              }
                            </p>
                            <span className="text-sm text-gray-500">{property.squareFootage} sqft</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {property.bedrooms && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{property.bedrooms} Beds</span>}
                            {property.bathrooms && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{property.bathrooms} Baths</span>}
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{property.furnished}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium transition-colors">
                              View Details
                            </button>
                            {property.listingType === 'For Sale' || property.listingType === 'For Both' ? (
                              <button 
                                onClick={() => triggerPropertyPurchase(property)}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                              >
                                Buy Property
                              </button>
                            ) : null}
                            {property.listingType === 'For Rent' || property.listingType === 'For Both' ? (
                              <button 
                                onClick={() => triggerPropertyRental(property)}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                              >
                                Rent Property
                              </button>
                            ) : null}
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Results */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Available Properties</h2>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <button onClick={() => fetchProperties(searchFilters)} className="mt-4 text-primary hover:underline">
                      Try Again
                    </button>
                  </div>
                ) : (!Array.isArray(properties) || properties.length === 0) ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-600">No properties found matching your criteria</p>
                    <button onClick={handleClearFilters} className="mt-4 text-primary hover:underline">
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Array.isArray(properties) ? properties : []).map((property) => (
                      <div key={property._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          {property.images && property.images.length > 0 ? (
                            <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{property.name}</h3>
                          <p className="text-gray-600 mb-3 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {property.city}, {property.state}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xl font-bold text-primary">
                              {property.listingType === 'For Sale' || property.listingType === 'For Both' ? 
                                `NPR ${property.salePrice?.toLocaleString()}` : 
                                `NPR ${property.monthlyRent?.toLocaleString()}/mo`
                              }
                            </p>
                            <span className="text-sm text-gray-500">{property.squareFootage} sqft</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {property.bedrooms && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{property.bedrooms} Beds</span>}
                            {property.bathrooms && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{property.bathrooms} Baths</span>}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property.listingType === 'For Sale' || property.listingType === 'For Both' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {property.listingType === 'For Sale' || property.listingType === 'For Both' ? 'FOR SALE' : 'FOR RENT'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 font-medium transition-colors text-sm">
                              View Details
                            </button>
                            {property.listingType === 'For Sale' || property.listingType === 'For Both' ? (
                              <button 
                                onClick={() => triggerPropertyPurchase(property)}
                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
                              >
                                Buy Property
                              </button>
                            ) : null}
                            {property.listingType === 'For Rent' || property.listingType === 'For Both' ? (
                              <button 
                                onClick={() => triggerPropertyRental(property)}
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                              >
                                Rent Property
                              </button>
                            ) : null}
                            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm">
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {active === "profile_legacy" && (
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
                  { name: 'Privacy', icon: '🛡️' },
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
                <h1 className="text-2xl font-bold text-gray-900 mb-8">{settingsActiveTab} Settings</h1>

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
                          onClick={() => setPaymentReminders(!paymentReminders)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${paymentReminders ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${paymentReminders ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Marketing Communications</p>
                          <p className="text-sm text-gray-500">Receive promotional offers and newsletters</p>
                        </div>
                        <button
                          onClick={() => setMarketingCommunications(!marketingCommunications)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${marketingCommunications ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${marketingCommunications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {settingsActiveTab === 'Account' && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-md font-bold text-gray-800 mb-4">Profile</h3>

                    <div className="flex flex-col items-center mb-8">
                      <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 bg-gray-100 flex items-center justify-center">
                          {profileImagePreview ? (
                            <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleCameraClick}
                          className="absolute bottom-0 right-0 bg-primary p-2 rounded-full text-white hover:bg-primary/90 transition-colors shadow-lg"
                          title="Upload Photo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Update profile photo</p>
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          rows="3"
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setActive("home")}
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
                        <button
                          onClick={() => setIsPublic(!isPublic)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isPublic ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Show Contact Information</p>
                          <p className="text-sm text-gray-500">Display your email and phone to property owners</p>
                        </div>
                        <button
                          onClick={() => setShowContactInfo(!showContactInfo)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${showContactInfo ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${showContactInfo ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Data Sharing</p>
                          <p className="text-sm text-gray-500">Share anonymous usage data to improve our services</p>
                        </div>
                        <button
                          onClick={() => setDataSharing(!dataSharing)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${dataSharing ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${dataSharing ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {settingsActiveTab === 'Integrations' && (
                  <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-md font-bold text-gray-800 mb-4">Integrations</h3>
                    <p className="text-sm text-gray-600">Connect payment gateways and service providers (coming soon).</p>
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
                  {settingsActiveTab === "Account" ? (
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 text-sm font-bold text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      Logout
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={() => setActive("home")}
                    className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
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
        
        {userType === "owner" && active === "requests" && (
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
                  <p className="text-sm text-gray-600">View requests from all tenants (chat-style)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    reloadOwnerMaintenance();
                    setActive("home");
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {ownerMaintenanceItems.filter((r) => r.type === "request").length}
                  </p>
                </div>
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
                  <p className="text-sm text-yellow-800">Pending Requests</p>
                  <p className="mt-1 text-2xl font-bold text-yellow-900">
                    {ownerMaintenanceItems.filter(
                      (r) => r.type === "request" && r.status !== "Completed"
                    ).length}
                  </p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
                  <p className="text-sm text-green-800">Done Requests</p>
                  <p className="mt-1 text-2xl font-bold text-green-900">
                    {ownerMaintenanceItems.filter(
                      (r) => r.type === "request" && r.status === "Completed"
                    ).length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Tenants</h2>
                      <p className="text-xs text-gray-500">Select a tenant to view requests</p>
                    </div>
                    <button
                      type="button"
                      onClick={reloadOwnerMaintenance}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Refresh
                    </button>
                  </div>

                  {(() => {
                    const threads = new Map();
                    for (const item of ownerMaintenanceItems) {
                      const key = getMaintenanceThreadKey(item);
                      const prev = threads.get(key);
                      if (!prev) {
                        threads.set(key, { key, latest: item });
                      } else {
                        const prevTime = new Date(prev.latest.createdAt || 0).getTime();
                        const nextTime = new Date(item.createdAt || 0).getTime();
                        if (nextTime > prevTime) threads.set(key, { key, latest: item });
                      }
                    }

                    const threadList = Array.from(threads.values()).sort((a, b) => {
                      const at = new Date(a.latest.createdAt || 0).getTime();
                      const bt = new Date(b.latest.createdAt || 0).getTime();
                      return bt - at;
                    });

                    if (threadList.length === 0) {
                      return <div className="p-4 text-sm text-gray-600">No requests yet.</div>;
                    }

                    return (
                      <div className="p-2 space-y-2 max-h-[640px] overflow-auto">
                        {threadList.map((t) => {
                          const tenantUsername = t.latest.tenantUsername || "Tenant";
                          const propertyLabel = t.latest.propertyLabel || "Property";
                          const isActive = selectedOwnerThreadKey === t.key;
                          return (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => setSelectedOwnerThreadKey(t.key)}
                              className={`w-full text-left rounded-2xl border p-3 transition ${
                                isActive
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-gray-200 bg-white hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{tenantUsername}</p>
                                  <p className="text-xs text-gray-500 truncate">{propertyLabel}</p>
                                </div>
                                <span className="text-[11px] font-semibold text-gray-500">
                                  {t.latest.date || ""}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-gray-600 truncate">
                                {t.latest.type === "owner_message" ? t.latest.message : t.latest.title || t.latest.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Conversation</h2>
                    <p className="text-xs text-gray-500">Requests and replies</p>
                  </div>

                  {(() => {
                    if (!selectedOwnerThreadKey) {
                      return <div className="p-5 text-sm text-gray-600">Select a tenant thread.</div>;
                    }

                    const messages = ownerMaintenanceItems
                      .filter((i) => getMaintenanceThreadKey(i) === selectedOwnerThreadKey)
                      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

                    if (messages.length === 0) {
                      return <div className="p-5 text-sm text-gray-600">No messages.</div>;
                    }

                    return (
                      <div className="flex flex-col h-[640px]">
                        <div className="flex-1 overflow-auto p-5 space-y-3 bg-gray-50">
                          {messages.map((m) => (
                            <div key={m.id} className="space-y-2">
                              {m.type === "owner_message" ? (
                                <div className="flex justify-end">
                                  <div className="max-w-[80%] rounded-2xl bg-primary text-white px-4 py-3 text-sm shadow-sm">
                                    <p className="whitespace-pre-wrap">{m.message}</p>
                                    <p className="mt-1 text-[11px] text-white/80">{new Date(m.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-start">
                                  <div className="max-w-[80%] rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                                        <p className="text-xs text-gray-500">{m.propertyLabel}</p>
                                      </div>
                                      <select
                                        value={m.status || "Open"}
                                        onChange={(e) => updateMaintenanceStatus(m.id, e.target.value)}
                                        className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1"
                                      >
                                        {["Open", "In Progress", "Completed"].map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                                      <span className="rounded-full bg-gray-100 px-2 py-0.5">{m.category}</span>
                                      <span className="rounded-full bg-gray-100 px-2 py-0.5">{m.priority}</span>
                                      <span className="ml-auto text-gray-500">{m.date}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{m.description}</p>
                                    <p className="mt-2 text-[11px] text-gray-500">{new Date(m.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 p-4 bg-white">
                          <form onSubmit={sendOwnerReply} className="flex gap-2">
                            <input
                              type="text"
                              value={ownerReplyDraft}
                              onChange={(e) => setOwnerReplyDraft(e.target.value)}
                              placeholder="Reply to tenant..."
                              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
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
