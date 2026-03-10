import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const helpItems = [
  {
    icon: "🔍",
    title: "How to find homes",
    description: "Use filters above to set your city, budget and property type for Nepal.",
    steps: ["Set your location", "Choose property type", "Set budget range", "Browse listings"]
  },
  {
    icon: "📅",
    title: "Booking a visit",
    description: "Shortlisted a home? Click 'View details' and contact owner or agent.",
    steps: ["Select property", "Contact owner", "Schedule visit", "Confirm appointment"]
  },
  {
    icon: "📝",
    title: "Listing your property",
    description: "Go to List Property page to share your house, flat or room with renters and buyers.",
    steps: ["Create account", "Add property details", "Upload photos", "Set price"]
  },
  {
    icon: "🇳🇵",
    title: "Support in Nepal",
    description: "Need help? Our team can guide you with local rental rules, deposits and agreements.",
    steps: ["Contact support", "Get legal guidance", "Document help", "Local expertise"]
  },
  {
    icon: "💳",
    title: "Online Rent Payment",
    description: "Pay rent securely online with multiple payment options and automatic reminders.",
    steps: ["Choose payment method", "Enter amount", "Confirm payment", "Get receipt"]
  },
  {
    icon: "📊",
    title: "Property Analytics",
    description: "Track property performance, occupancy rates, and financial returns in real-time.",
    steps: ["View dashboard", "Check reports", "Analyze trends", "Export data"]
  }
];

const HelpSection = () => {
  const navigate = useNavigate();

  const scrollToHelp = (helpTitle) => {
    // Navigate to home page and scroll to help section
    navigate('/');
    
    // Scroll to help section after navigation
    setTimeout(() => {
      const element = document.getElementById(`help-${helpTitle.toLowerCase().replace(/\s+/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // If specific help element doesn't exist, scroll to main help section
        const helpSection = document.getElementById('help-section');
        if (helpSection) {
          helpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  return (
    <section id="help-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using REND for real estate in Nepal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {helpItems.map((item, index) => (
            <div 
              key={index} 
              id={`help-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">{item.description}</p>
              
              <div className="space-y-3 mb-8">
                {item.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => scrollToHelp(item.title)}
                className="mt-4 w-full bg-gradient-to-r from-primary to-primary/90 text-white font-medium py-2 px-4 rounded-lg hover:from-primary/90 hover:to-primary transition-all duration-300 group-hover:shadow-md"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact Support */}
      <div className="mt-12 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need More Help?</h3>
          <p className="text-gray-600 mb-6">
            Our support team is available 24/7 to help you with all your real estate needs in Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors">
              📞 Call Support
            </button>
            <button className="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
              💬 Live Chat
            </button>
            <button className="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
              📧 Email Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;
