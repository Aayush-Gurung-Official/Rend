import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">REND</h3>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted real estate partner in Nepal. Making property buying, selling, and renting simple and secure.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-5.373 12-12 12c0 5.996 5.372 12 12 12 5.996 4.788 11 11.437v1.047c0-6.097 4.557-11 11-11s-11 4.557-11 11c-2.617 0-4.99-1.09-6.717l-5.293 5.293c-1.727 1.09-4.1 1.09-6.717 0-2.997 1.09-4.1 1.09-6.717l-5.293-5.293z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3m12 0v-4h3m-9 0v4h3m-6-4h3v4"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/add-property" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Add Property
                </Link>
              </li>
              <li>
                <Link to="/manage-tenants" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Manage Tenants
                </Link>
              </li>
              <li>
                <Link to="/user-dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
                  My Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/#search" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Property Search
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
                  List Property
                </Link>
              </li>
              <li>
                <Link to="/user-dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Rent Payment
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Property Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01.502 1.21l1.498-4.493a1 1 0 01-.502-1.21A2 2 0 015 3H5a2 2 0 01-2 2v9a2 2 0 01-2 2h-1.28m0 0H5a2 2 0 01-2-2V5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01.502 1.21l1.498-4.493a1 1 0 01-.502-1.21A2 2 0 015 3H5z" />
                </svg>
                +977-1-234567
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 2.2H21a2 2 0 002-2V8a2 2 0 00-2-2h-1.89L-7.89-5.26a2 2 0 00-2.22-2.2z" />
                </svg>
                info@rentnepal.com
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-1.414.586l-4.243-4.242a1.999 1.999 0 00-.586 1.414l-4.242 4.243a1 1 0 00-.586.586l4.242-4.242a1 1 0 001.414-.586l4.243-4.242a1 1 0 00.586-.586l-4.243 4.242zM12 4c-4.418 0-7.878 2.908-10.828 0 0-2.173 1.395-2.83 2.828-2.83 0-1.395-.566-2.628-2.83-2.828 0-1.395.566-2.629 2.83-2.828 1.395.566 2.629 2.83 2.828z" />
                </svg>
                Kathmandu, Nepal
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-base font-semibold mb-4">About REND</h4>
              <p className="text-gray-300 text-sm">
                REND is Nepal's premier real estate platform, connecting property owners, tenants, and buyers since 2024. 
                We make real estate transactions simple, secure, and transparent.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-4">Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-l-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 REND. All rights reserved. | 
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link> | 
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

