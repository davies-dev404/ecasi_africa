import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Scale, Download, Eye, Calendar, ArrowLeft, Tag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const policies = [
  {
    id: 7,
    title: "Constitution of Environmental Capacity and Sustainability Institute",
    date: "2025",
    type: "Governance",
    country: "ECAS Institute",
    pages: "Internal",
    tags: ["Governance", "Constitution"],
    summary: "The founding constitutional document outlining the establishment, mandates, governance structures, and legal framework of ECAS Institute.",
    url: "/pdfs/CONSTITUTION-OF-ENVIRONMENTAL-CAPACITY-AND-SUSTAINABILITY-INSTITUTE.pdf",
  },
  {
    id: 8,
    title: "ECAS Institute Anti-bribery and Anti-corruption Policy",
    date: "2025",
    type: "Ethics & Compliance",
    country: "ECAS Institute",
    pages: "Internal",
    tags: ["Ethics", "Compliance"],
    summary: "Our zero-tolerance framework against bribery and corrupt practices, ensuring transparency, integrity, and ethical conduct across all operations.",
    url: "/pdfs/ECAS-Institute-Antibribery-and-anticorruption-policy.pdf",
  },
  {
    id: 9,
    title: "Whistleblower Policy",
    date: "2025",
    type: "Ethics & Compliance",
    country: "ECAS Institute",
    pages: "Internal",
    tags: ["Ethics", "Compliance"],
    summary: "A safe, anonymous channel for employees and partners to report unethical behavior, financial impropriety, or violations of code of conduct.",
    url: "/pdfs/Whistleblower-Policy.pdf",
  },
  {
    id: 10,
    title: "Risk Register - ECAS Institute",
    date: "2025",
    type: "Governance",
    country: "ECAS Institute",
    pages: "Internal",
    tags: ["Governance", "Risk Management"],
    summary: "Strategic registry outlining potential institutional risks, mitigation actions, impact analysis, and responsible focal departments.",
    url: "/pdfs/RISK-REGISTER-ECAS-INSTITUTE.pdf",
  },
  {
    id: 11,
    title: "ECAS Institute Travel Expense Policy",
    date: "2025",
    type: "Operations",
    country: "ECAS Institute",
    pages: "Internal",
    tags: ["Operations", "Travel"],
    summary: "Regulatory procedures for travel allowances, reimbursements, booking guidelines, and expense management for official engagements.",
    url: "/pdfs/ECAS-iNSTITUTE-Travel-Expense-Policy-1.docx",
  },
  {
    id: 12,
    title: "ECAS Institute Green Procurement Policy",
    date: "2025",
    type: "Operations",
    country: "ECAS Institute",
    pages: "Internal",
    tags: ["Operations", "Procurement"],
    summary: "Procurement guidelines focused on sustainability, prioritizing eco-friendly vendors, energy-efficient goods, and minimal footprint services.",
    url: "/pdfs/ECAS-Institute-_Green-Procurement-Policy.docx",
  },
  {
    id: 13,
    title: "Financial Policy and Procedures",
    date: "2025",
    type: "Financial",
    country: "ECAS Institute",
    pages: "Internal",
    tags: ["Financial", "Procedures"],
    summary: "Guidelines and standardized procedures governing financial transactions, budgeting, audits, and monetary controls at ECAS Institute.",
    url: "/pdfs/Financial-Policy-and-Procedures.pdf",
  },
];

const PoliciesLaws = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const types = ['All', ...new Set(policies.map(p => p.type))];

  const filtered = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || p.type === selectedType;
    return matchesSearch && matchesType;
  });


  const handleView = async (url) => {
    try {
      // Check if file exists locally or accessible remotely
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert("This document is currently being updated and will be available for viewing shortly. Please check back later.");
      }
    } catch (err) {
      alert("We are unable to process your request at this time. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Policies and Laws | ECASI Africa"
        description="Access comprehensive frameworks, policies, and legal documents related to our focus areas."
      />
      <Header />

      <section className="bg-ecasi-navy pt-24 pb-16 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <Link to="/resources" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Resources
          </Link>
          <ScrollAnimation animation="fade-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Scale className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Policies & Laws
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Access comprehensive frameworks, policies, and legal documents relevant to environmental conservation, climate action, and sustainable development.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-grow">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, country or keyword..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ecasi-green bg-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedType === type 
                      ? 'bg-ecasi-green text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-ecasi-green hover:text-ecasi-green'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item, index) => (
              <ScrollAnimation key={item.id} delay={index * 80} animation="fade-up">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-slate-100 text-ecasi-navy px-3 py-1 rounded-full text-xs font-semibold">
                        {item.type}
                      </span>
                      <span className="bg-ecasi-green/10 text-ecasi-green px-2 py-1 rounded text-xs font-semibold">
                        {item.country}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                      <Calendar size={14} />
                      <span>{item.date}</span>
                      <span className="text-gray-300">|</span>
                      <span>{item.pages}</span>
                    </div>
                    <h3 className="text-lg font-bold text-ecasi-navy mb-3 group-hover:text-ecasi-green transition-colors leading-snug">
                      {item.title}
                    </h3>
                    
                    {expandedId === item.id && (
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {item.summary}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs bg-ecasi-section text-ecasi-navy px-2 py-1 rounded-full font-medium">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="flex items-center text-sm font-semibold text-ecasi-green hover:text-ecasi-navy transition-colors"
                      >
                        <Eye size={15} className="mr-1.5" />
                        {expandedId === item.id ? 'Close' : 'View Details'}
                      </button>
                      <button 
                        onClick={() => handleView(item.url)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-ecasi-green text-white rounded-lg text-sm font-semibold hover:bg-ecasi-navy transition-colors"
                      >
                        <Eye size={14} />
                        View PDF
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Scale size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">These resources are not currently available. Please check back later.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedType('All'); }} className="mt-4 text-ecasi-green font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          )}


        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PoliciesLaws;
