import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Scale, Download, Eye, Calendar, ArrowLeft, Tag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const policies = [
  {
    id: 1,
    title: "National Climate Change Framework Policy — Kenya 2022",
    date: "2022",
    type: "National Policy",
    country: "Kenya",
    pages: "96 pages",
    image: "/images/research/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1.jpg",
    tags: ["Climate Policy", "Kenya", "Framework"],
    summary: "Kenya's overarching national policy guiding climate change action, establishing coordination mechanisms, and outlining low-carbon and climate-resilient development pathways.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2022/12/Kenya-Climate-Change-Framework-Policy.pdf",
  },
  {
    id: 2,
    title: "East African Community Climate Change Policy 2021",
    date: "2021",
    type: "Regional Policy",
    country: "EAC Region",
    pages: "72 pages",
    image: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    tags: ["EAC", "Regional", "Climate Change"],
    summary: "The regional policy framework for the East African Community member states on coordinated climate change response, adaptation, and mitigation actions.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2021/08/EAC-Climate-Change-Policy.pdf",
  },
  {
    id: 3,
    title: "Environmental Management and Coordination Act (EMCA) — Kenya",
    date: "2015 (Revised)",
    type: "Legislation",
    country: "Kenya",
    pages: "120 pages",
    image: "/images/research/1710846398420-1-1-1024x683.jpg",
    tags: ["Legislation", "Environmental Law", "Kenya"],
    summary: "The principal framework for environmental management in Kenya, establishing the National Environment Management Authority and outlining enforcement mechanisms.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2022/01/EMCA-Kenya-Revised.pdf",
  },
  {
    id: 4,
    title: "Nationally Determined Contribution — Kenya (Enhanced NDC 2030)",
    date: "2023",
    type: "International Commitment",
    country: "Kenya",
    pages: "84 pages",
    image: "/images/courses/IMGM1984-1024x683.jpg",
    tags: ["NDC", "Paris Agreement", "Kenya"],
    summary: "Kenya's enhanced Nationally Determined Contribution under the Paris Agreement, outlining updated targets for reducing greenhouse gas emissions and building climate resilience.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/09/Kenya-Enhanced-NDC-2030.pdf",
  },
  {
    id: 5,
    title: "African Union Climate Change and Resilient Development Strategy 2022–2032",
    date: "2022",
    type: "Continental Strategy",
    country: "Africa (AU)",
    pages: "56 pages",
    image: "/images/research/57213763_2128957177158658_1134502275364945920_n.jpg",
    tags: ["African Union", "Strategy", "Continental"],
    summary: "The African Union's 10-year strategy for addressing climate change, promoting sustainable development, and building resilience across the continent.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2022/10/AU-Climate-Change-Strategy.pdf",
  },
  {
    id: 6,
    title: "Forest Conservation and Management Act — Kenya 2016",
    date: "2016",
    type: "Legislation",
    country: "Kenya",
    pages: "68 pages",
    image: "/images/programmes/migration-community.png",
    tags: ["Forests", "Conservation", "Legislation"],
    summary: "Kenya's principal legislation for the conservation, protection, and management of all forest resources, including community forest associations.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2022/01/Forest-Conservation-Management-Act-Kenya.pdf",
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

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
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
                  <div className="h-40 overflow-hidden relative bg-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={e => e.target.style.display='none'}
                    />
                    <div className="absolute inset-0 bg-ecasi-navy/30 group-hover:bg-ecasi-navy/10 transition-colors"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-ecasi-navy">
                      {item.type}
                    </div>
                    <div className="absolute top-4 right-4 bg-ecasi-green text-white px-2 py-0.5 rounded text-xs">
                      {item.country}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
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
              <Scale size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No documents found matching your criteria.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedType('All'); }} className="mt-4 text-ecasi-green font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-16 text-center">
            <a 
              href="https://ecasiafrica.org/policies-and-laws/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-ecasi-green text-ecasi-green rounded-lg font-semibold hover:bg-ecasi-green hover:text-white transition-colors"
            >
              View All Policies on ECASI Website
            </a>
          </div>

        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PoliciesLaws;
