import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageTenantsPage = () => {
  const navigate = useNavigate();
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

  const stats = {
    totalTenants: tenants.length,
    paidTenants: tenants.filter(t => t.status === 'Paid').length,
    pendingTenants: tenants.filter(t => t.status === 'Pending').length,
    totalRevenue: tenants.reduce((sum, t) => sum + parseInt(t.rent.replace(/[^0-9]/g, '')), 0)
  };

  const handleSendReminder = (tenantId) => {
    alert(`Reminder sent to tenant ${tenantId}`);
  };

  const handleRecordPayment = (tenantId) => {
    alert(`Recording payment for tenant ${tenantId}`);
  };

  const handleViewDetails = (tenantId) => {
    alert(`Viewing details for tenant ${tenantId}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Tenants</h1>
          <p className="text-gray-600">Manage your rental properties and tenant relationships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.paidTenants}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingTenants}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">NPR {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Tenant List</h2>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Add New Tenant
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.email}</div>
                        <div className="text-sm text-gray-500">{tenant.contact}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.property}</div>
                        <div className="text-sm text-gray-500">{tenant.unit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.rent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tenant.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSendReminder(tenant.id)}
                          className="text-primary hover:text-primary/80"
                        >
                          Send Reminder
                        </button>
                        <button 
                          onClick={() => handleViewDetails(tenant.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleRecordPayment(tenant.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          💳 Record Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTenantsPage;
