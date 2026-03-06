import React from "react";
import { useNavigate } from "react-router-dom";

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    // Store user type in localStorage
    localStorage.setItem('userType', userType);
    navigate('/dashboard');
  };

  return (
    <section className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Select Your Account Type
          </h1>
          <p className="text-sm text-slate-600">
            Choose how you want to use Rend Nepal
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleUserTypeSelect('user')}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">User</h3>
                <p className="text-sm text-slate-600">Browse and search for properties</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleUserTypeSelect('owner')}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Property Owner</h3>
                <p className="text-sm text-slate-600">List and manage your properties</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Back to Website
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserTypeSelection;
