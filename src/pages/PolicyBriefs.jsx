import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { FileBadge, Download, Eye, Calendar, ArrowLeft, Tag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const briefs = [];

const PolicyBriefs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = briefs.filter(b => {
    return b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleDownload = async (url) => {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && !contentType.includes('text/html')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      } else {
        alert("This document is currently being updated and will be available for download shortly. Please check back later.");
      }
    } catch (err) {
      alert("We are unable to process your download request at this time. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Policy Briefs | ECASI Africa"
        description="Concise summaries and recommendations for policymakers and stakeholders."
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
                <FileBadge className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Policy Briefs
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Concise summaries, expert analyses, and actionable recommendations tailored for policymakers, stakeholders, and industry leaders.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">

          {/* Search */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-12 max-w-xl mx-auto">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search policy briefs by topic or keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-grow focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((item, index) => (
              <ScrollAnimation key={item.id} delay={index * 80} animation="fade-up">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full border-l-4 border-l-ecasi-green">
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => e.target.style.display='none'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-ecasi-navy/80 to-ecasi-navy/20"></div>
                    <div className="absolute top-4 left-4 bg-ecasi-green text-white px-3 py-1 rounded-full text-xs font-bold">
                      {item.issue}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center text-gray-500 gap-1.5">
                        <Calendar size={13} />
                        <span>{item.date}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{item.pages}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-ecasi-navy mb-3 group-hover:text-ecasi-green transition-colors leading-snug">
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
                        {expandedId === item.id ? 'Close' : 'Read Brief'}
                      </button>
                      <button 
                        onClick={() => handleDownload(item.downloadUrl)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-ecasi-green text-white rounded-lg text-sm font-semibold hover:bg-ecasi-navy transition-colors"
                        aria-label={`Download ${item.title}`}
                      >
                        <Download size={14} />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <FileBadge size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">These policy briefs are not currently available. Please check back later.</p>
              <button onClick={() => setSearchTerm('')} className="mt-4 text-ecasi-green font-semibold hover:underline">
                Clear search
              </button>
            </div>
          )}


        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PolicyBriefs;
