import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const maintenanceFormRef = useRef(null);
  
  // Sample user data
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+977-9812345678',
    memberSince: 'March 2024'
  });

  const [rentData, setRentData] = useState({
    currentRent: 'NPR 25,000',
    dueDate: 'March 15, 2024',
    status: 'Paid',
    nextPayment: 'April 15, 2024',
    paymentHistory: [
      { date: '2024-02-15', amount: 'NPR 25,000', status: 'Paid', method: 'Online Banking' },
      { date: '2024-01-15', amount: 'NPR 25,000', status: 'Paid', method: 'Esewa' },
      { date: '2023-12-15', amount: 'NPR 25,000', status: 'Paid', method: 'Khalti' }
    ]
  });

  const [myProperties, setMyProperties] = useState([
    {
      id: 1,
      name: 'Modern Apartment',
      address: 'Thamel, Kathmandu',
      type: 'Apartment',
      beds: 2,
      baths: 1.5,
      sqft: 800,
      rent: 'NPR 25,000/month',
      status: 'Active'
    }
  ]);

  const [maintenanceRequests, setMaintenanceRequests] = useState([
    {
      id: 1,
      title: 'Leaking kitchen faucet',
      category: 'Plumbing',
      priority: 'Medium',
      status: 'Pending',
      date: '2024-03-10',
      description: 'Leaking kitchen faucet under the sink. Water is pooling in the cabinet.'
    },
    {
      id: 2,
      title: 'Light flickering in living room',
      category: 'Electrical',
      priority: 'Low',
      status: 'Completed',
      date: '2024-03-05',
      description: 'Living room ceiling light flickers intermittently. Please check wiring or switch.'
    }
  ]);

  const [selectedRequestId, setSelectedRequestId] = useState(maintenanceRequests[0]?.id ?? null);
  const [requestDraft, setRequestDraft] = useState({
    propertyId: String(myProperties[0]?.id ?? ''),
    title: '',
    category: 'Plumbing',
    priority: 'Medium',
    description: '',
    preferredDate: '',
    preferredTime: 'Anytime',
    canEnter: false,
    contactPhone: userProfile.phone || ''
  });
  const [requestErrors, setRequestErrors] = useState({});
  const [requestSuccess, setRequestSuccess] = useState('');

  const handlePayRent = () => {
    alert('Redirecting to payment gateway...');
  };

  const handleNewRequest = () => {
    setRequestSuccess('');
    setRequestErrors({});
    setSelectedRequestId(null);
    setRequestDraft({
      propertyId: String(myProperties[0]?.id ?? ''),
      title: '',
      category: 'Plumbing',
      priority: 'Medium',
      description: '',
      preferredDate: '',
      preferredTime: 'Anytime',
      canEnter: false,
      contactPhone: userProfile.phone || ''
    });

    requestAnimationFrame(() => {
      maintenanceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSubmitMaintenance = (e) => {
    e.preventDefault();
    setRequestSuccess('');

    const nextErrors = {};
    if (!requestDraft.propertyId) nextErrors.propertyId = 'Please select a property.';
    if (!requestDraft.title.trim()) nextErrors.title = 'Please enter a short title.';
    if (!requestDraft.description.trim()) nextErrors.description = 'Please describe the issue.';
    if (!requestDraft.contactPhone.trim()) nextErrors.contactPhone = 'Please add a phone number.';

    setRequestErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const newRequest = {
      id: Date.now(),
      title: requestDraft.title.trim(),
      category: requestDraft.category,
      priority: requestDraft.priority,
      status: 'Pending',
      date: `${yyyy}-${mm}-${dd}`,
      description: requestDraft.description.trim(),
      propertyId: Number(requestDraft.propertyId)
    };

    setMaintenanceRequests((prev) => [newRequest, ...prev]);
    setSelectedRequestId(newRequest.id);
    setRequestSuccess('Request submitted. Our team will contact you shortly.');
    setRequestDraft((prev) => ({ ...prev, title: '', description: '' }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Rent Payment Card */}
      <div className="card-solid border-l-4 border-primary p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Rent payment
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              A quick summary of your current rent and due date.
            </p>
          </div>
          <span className="badge w-fit">Status: {rentData.status}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Current rent
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {rentData.currentRent}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Due date
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {rentData.dueDate}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Next payment
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {rentData.nextPayment}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={handlePayRent} className="btn btn-primary">
            Pay rent
          </button>
          <button type="button" className="btn btn-outline">
            View history
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-solid p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Active lease</h3>
          <p className="text-2xl font-bold text-primary">1</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Property</p>
        </div>
        <div className="card-solid p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Next payment</h3>
          <p className="text-lg font-bold text-primary">{rentData.nextPayment}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Reminder available</p>
        </div>
        <div className="card-solid p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Maintenance</h3>
          <p className="text-2xl font-bold text-primary">{maintenanceRequests.filter(r => r.status !== 'Completed').length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Open requests</p>
        </div>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Rented Properties</h2>

      {(() => {
        const toNumber = (value) => Number(String(value || "").replace(/[^\d]/g, "")) || 0;
        const history = Array.isArray(rentData.paymentHistory) ? rentData.paymentHistory : [];
        const totalPaid = history.reduce((sum, p) => sum + toNumber(p.amount), 0);
        const lastPayment = history[0] ?? null;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Paid</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">NPR {totalPaid.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-600">{history.length} payments recorded</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Next Due</p>
              <p className="mt-2 text-2xl font-bold text-orange-600">{rentData.nextPayment}</p>
              <p className="mt-1 text-sm text-gray-600">Due date from your rent schedule</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Payment</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{lastPayment?.date || "—"}</p>
              <p className="mt-1 text-sm text-gray-600">{lastPayment?.method ? `Method: ${lastPayment.method}` : "—"}</p>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-900">{property.name}</h3>
            <p className="text-sm text-gray-600">{property.address}</p>
            <p className="text-sm text-gray-500">{property.beds} beds - {property.baths} baths - {property.sqft} sqft</p>
            <p className="text-lg font-bold text-primary">{property.rent}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {property.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaintenance = () => {
    const selectedRequest = selectedRequestId
      ? maintenanceRequests.find((r) => r.id === selectedRequestId)
      : null;

    const statusStyles = (status) => {
      if (status === 'Completed') return 'bg-green-100 text-green-800 border border-green-200';
      if (status === 'In Progress') return 'bg-blue-100 text-blue-800 border border-blue-200';
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    };

    const inputBase =
      'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Requests</h2>
              <p className="text-xs text-gray-500">Track your maintenance tickets</p>
            </div>
            <button
              onClick={handleNewRequest}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              + New
            </button>
          </div>

          <div className="max-h-[520px] overflow-auto p-2">
            {maintenanceRequests.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No maintenance requests yet.</div>
            ) : (
              <div className="space-y-2">
                {maintenanceRequests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedRequestId(request.id)}
                    className={`w-full text-left rounded-2xl border p-3 transition ${
                      selectedRequestId === request.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    aria-current={selectedRequestId === request.id ? 'true' : 'false'}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{request.title}</p>
                        <p className="text-xs text-gray-500 truncate">{request.description}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles(
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

        <div ref={maintenanceFormRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Request Form</h2>
              <p className="text-xs text-gray-500">
                Submit a new maintenance request. Select a request on the left to view details.
              </p>
            </div>
            {selectedRequest ? (
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500">Selected</p>
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">{selectedRequest.title}</p>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmitMaintenance} className="p-5 space-y-5">
            {requestSuccess ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {requestSuccess}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select
                  value={requestDraft.propertyId}
                  onChange={(e) =>
                    setRequestDraft((prev) => ({ ...prev, propertyId: e.target.value }))
                  }
                  className={inputBase}
                >
                  {myProperties.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name} - {p.address}
                    </option>
                  ))}
                </select>
                {requestErrors.propertyId ? (
                  <p className="mt-1 text-xs text-red-600">{requestErrors.propertyId}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={requestDraft.category}
                  onChange={(e) => setRequestDraft((prev) => ({ ...prev, category: e.target.value }))}
                  className={inputBase}
                >
                  {[
                    'Plumbing',
                    'Electrical',
                    'HVAC',
                    'Appliance',
                    'Pest Control',
                    'Structural',
                    'Landscaping',
                    'Security',
                    'Cleaning',
                    'Other'
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={requestDraft.priority}
                  onChange={(e) => setRequestDraft((prev) => ({ ...prev, priority: e.target.value }))}
                  className={inputBase}
                >
                  {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={requestDraft.contactPhone}
                  onChange={(e) =>
                    setRequestDraft((prev) => ({ ...prev, contactPhone: e.target.value }))
                  }
                  className={inputBase}
                  placeholder="+977-98XXXXXXXX"
                />
                {requestErrors.contactPhone ? (
                  <p className="mt-1 text-xs text-red-600">{requestErrors.contactPhone}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={requestDraft.title}
                onChange={(e) => setRequestDraft((prev) => ({ ...prev, title: e.target.value }))}
                className={inputBase}
                placeholder="Short summary (e.g., Water leak under sink)"
              />
              {requestErrors.title ? <p className="mt-1 text-xs text-red-600">{requestErrors.title}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={requestDraft.description}
                onChange={(e) =>
                  setRequestDraft((prev) => ({ ...prev, description: e.target.value }))
                }
                className={`${inputBase} min-h-[140px] resize-y`}
                placeholder="Describe what happened, where, and when it started..."
              />
              {requestErrors.description ? (
                <p className="mt-1 text-xs text-red-600">{requestErrors.description}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={requestDraft.preferredDate}
                  onChange={(e) =>
                    setRequestDraft((prev) => ({ ...prev, preferredDate: e.target.value }))
                  }
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  value={requestDraft.preferredTime}
                  onChange={(e) =>
                    setRequestDraft((prev) => ({ ...prev, preferredTime: e.target.value }))
                  }
                  className={inputBase}
                >
                  {['Anytime', 'Morning (9-12)', 'Afternoon (12-4)', 'Evening (4-7)'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="canEnter"
                type="checkbox"
                checked={requestDraft.canEnter}
                onChange={(e) =>
                  setRequestDraft((prev) => ({ ...prev, canEnter: e.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="canEnter" className="text-sm text-gray-700">
                Maintenance staff can enter the unit if I am not home (optional).
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleNewRequest}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reset
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
    );
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input 
              type="tel" 
              value={userProfile.phone}
              onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
            <input 
              type="text" 
              value={userProfile.memberSince}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950/20">
      <div className="rend-container">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost mb-4 px-0 py-0 text-sm text-primary hover:text-primary-dark"
          >
            &larr; Back to Home
          </button>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">My Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage your rental experience and payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Dashboard Nav */}
          <aside className="card-solid p-0 overflow-hidden h-fit lg:sticky lg:top-24">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {userProfile.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{userProfile.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile.email}</p>
                </div>
              </div>
            </div>

            <nav className="p-2">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'properties', label: 'My Properties' },
                { key: 'maintenance', label: 'Request Maintenance' },
                { key: 'profile', label: 'Profile' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    activeTab === item.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="card-solid p-0">
            <div className="p-6">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'properties' && renderProperties()}
              {activeTab === 'maintenance' && renderMaintenance()}
              {activeTab === 'profile' && renderProfile()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
