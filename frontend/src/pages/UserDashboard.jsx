import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
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
    { id: 1, type: 'Plumbing', status: 'Pending', date: '2024-03-10', description: 'Leaking kitchen faucet' },
    { id: 2, type: 'Electrical', status: 'Completed', date: '2024-03-05', description: 'Light bulb replacement' }
  ]);

  const handlePayRent = () => {
    alert('Redirecting to payment gateway...');
  };

  const handleNewRequest = () => {
    alert('Opening maintenance request form...');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Rent Payment Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">💳 Rent Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Current Rent</p>
            <p className="text-2xl font-bold">{rentData.currentRent}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Due Date</p>
            <p className="text-2xl font-bold">{rentData.dueDate}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Status</p>
            <p className="text-2xl font-bold">{rentData.status}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button 
            onClick={handlePayRent}
            className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Pay Rent Now
          </button>
          <button className="bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors">
            Payment History
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Active Lease</h3>
          <p className="text-2xl font-bold text-primary">1</p>
          <p className="text-sm text-gray-500">Property</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Next Payment</h3>
          <p className="text-lg font-bold text-orange-600">{rentData.nextPayment}</p>
          <p className="text-sm text-gray-500">30 days remaining</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Maintenance</h3>
          <p className="text-2xl font-bold text-yellow-600">{maintenanceRequests.filter(r => r.status === 'Pending').length}</p>
          <p className="text-sm text-gray-500">Pending requests</p>
        </div>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Rented Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-900">{property.name}</h3>
            <p className="text-sm text-gray-600">{property.address}</p>
            <p className="text-sm text-gray-500">{property.beds} beds • {property.baths} baths • {property.sqft} sqft</p>
            <p className="text-lg font-bold text-primary">{property.rent}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {property.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Maintenance Requests</h2>
        <button 
          onClick={handleNewRequest}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New Request
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {maintenanceRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {request.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{request.description}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{request.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-primary hover:text-primary/80 font-medium"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600">Manage your rental experience and payments</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'properties', 'maintenance', 'profile'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'properties' && renderProperties()}
            {activeTab === 'maintenance' && renderMaintenance()}
            {activeTab === 'profile' && renderProfile()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
