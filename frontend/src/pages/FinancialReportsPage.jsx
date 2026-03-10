import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FinancialReportsPage = () => {
  const navigate = useNavigate();
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const storedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    const storedTenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    
    setProperties(storedProperties);
    
    // Generate sample transactions
    const sampleTransactions = [
      { id: 1, date: '2024-03-01', type: 'Rent Payment', amount: 75000, property: 'Modern Thamel Apartment', tenant: 'Raj Kumar', status: 'Completed' },
      { id: 2, date: '2024-03-01', type: 'Rent Payment', amount: 45000, property: 'Cozy Boudha House', tenant: 'Sita Sharma', status: 'Completed' },
      { id: 3, date: '2024-02-28', type: 'Maintenance', amount: -5000, property: 'Modern Thamel Apartment', description: 'Plumbing repair', status: 'Completed' },
      { id: 4, date: '2024-02-15', type: 'Service Fee', amount: -2000, property: 'Cozy Boudha House', description: 'Property management', status: 'Completed' }
    ];
    
    setTransactions(sampleTransactions);
  }, []);

  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'Rent Payment' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => (t.type === 'Maintenance' || t.type === 'Service Fee') && t.status === 'Completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const calculateNetIncome = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const calculateOccupancyRate = () => {
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(p => p.status === 'Rented').length;
    return totalProperties > 0 ? ((occupiedProperties / totalProperties) * 100).toFixed(1) : 0;
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    const now = new Date();
    const startDate = new Date();
    
    if (reportPeriod === 'monthly') {
      startDate.setMonth(now.getMonth());
      startDate.setDate(1);
    } else if (reportPeriod === 'quarterly') {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate.setMonth(quarterStart);
      startDate.setDate(1);
    } else if (reportPeriod === 'yearly') {
      startDate.setMonth(0);
      startDate.setDate(1);
    }
    
    filtered = filtered.filter(t => new Date(t.date) >= startDate);
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
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
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Track your property income, expenses, and overall performance</p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Report Period</h2>
            <div className="flex gap-2">
              {['monthly', 'quarterly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setReportPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reportPeriod === period
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">NPR {calculateTotalIncome().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">NPR {calculateTotalExpenses().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">💸</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-primary">NPR {calculateNetIncome().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-xl">📊</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-blue-600">{calculateOccupancyRate()}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">🏠</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
              <div className="flex gap-2">
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Export Report
                </button>
                <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredTransactions().map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'Rent Payment' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'Maintenance' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.property}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.tenant || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        NPR {Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
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

export default FinancialReportsPage;
