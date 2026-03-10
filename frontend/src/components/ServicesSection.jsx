import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: "🏠",
    title: "Custom Home Search",
    description: "Tell us your budget and preferred area in Nepal. We help you shortlist verified homes.",
    features: ["AI-powered matching", "Virtual tours", "Price alerts"]
  },
  {
    icon: "💰",
    title: "Sell with Rend",
    description: "List your house, flat or land with high quality photos and reach serious buyers.",
    features: ["Free listing", "Professional photos", "Marketing support"]
  },
  {
    icon: "🔑",
    title: "Rental Management",
    description: "End‑to‑end support for finding tenants, agreements and monthly rent tracking.",
    features: ["Tenant screening", "Legal agreements", "Rent collection"]
  },
  {
    icon: "🎨",
    title: "Design & Renovation",
    description: "Connect with architects and contractors experienced with Nepali homes and bylaws.",
    features: ["Expert consultation", "Project management", "Quality assurance"]
  },
  {
    icon: "💳",
    title: "Rent Payment System",
    description: "Secure online rent payment system with automated reminders and receipts.",
    features: ["Online payments", "Auto reminders", "Digital receipts"]
  },
  {
    icon: "📊",
    title: "Property Analytics",
    description: "Track property performance, market trends, and investment insights.",
    features: ["Market analysis", "ROI tracking", "Investment reports"]
  }
];

const ServicesSection = () => {
  const navigate = useNavigate();

  const scrollToService = (serviceTitle) => {
    // Navigate to home page and scroll to service section
    navigate('/');
    
    // Scroll to service section after navigation
    setTimeout(() => {
      const element = document.getElementById(`service-${serviceTitle.toLowerCase().replace(/\s+/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // If specific service element doesn't exist, scroll to main services section
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  return (
    <section id="services-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Professional Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete real estate solutions for buying, selling, renting, and managing properties in Nepal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              id={`service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">{service.description}</p>
              
              <ul className="space-y-3 mb-8">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => scrollToService(service.title)}
                className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-300 group-hover:shadow-lg"
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

