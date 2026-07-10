import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { FileText, Download, Eye, Calendar, ArrowLeft, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const reports = [];

const Reports = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', ...new Set(reports.map(r => r.type))];
  const filtered = selectedType === 'All' ? reports : reports.filter(r => r.type === selectedType);

  const handleDownload = async (url) => {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const contentType = res.headers.get('content-type');
      // If Vite returns index.html for a missing file, the content-type will be text/html
      if (res.ok && contentType && !contentType.includes('text/html')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop(); // Force download behavior with original filename
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
        title="Reports | ECASI Africa"
        description="Dive into our detailed annual reports, impact assessments, and project summaries."
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
                <FileText className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Reports
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Dive into our detailed annual reports, impact assessments, monitoring updates, and project summaries detailing our work across Africa.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type 
                    ? 'bg-ecasi-green text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-ecasi-green hover:text-ecasi-green'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item, index) => (
              <ScrollAnimation key={item.id} delay={0} animation="fade-up">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="h-44 overflow-hidden relative bg-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                      onError={e => e.target.style.display='none'}
                    />
                    <div className="absolute inset-0 bg-ecasi-navy/20 group-hover:bg-ecasi-navy/10 transition-colors"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-ecasi-navy">
                      {item.type}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-ecasi-navy/70 text-white text-xs px-2 py-0.5 rounded">
                      {item.pages}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                      <Calendar size={14} />
                      <span>{item.date}</span>
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
                        <span key={tag} className="inline-flex items-center gap-1 text-xs bg-ecasi-section text-ecasi-navy px-2.5 py-1 rounded-full font-medium">
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
                        {expandedId === item.id ? 'Close' : 'Overview'}
                      </button>
                      <button 
                        onClick={() => handleDownload(item.downloadUrl)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-ecasi-green text-white rounded-lg text-sm font-semibold hover:bg-ecasi-navy transition-colors"
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
              <FileText size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">These reports are not currently available. Please check back later.</p>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Reports;
