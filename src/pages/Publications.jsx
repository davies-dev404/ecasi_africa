import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { BookOpen, Download, Eye, Calendar, ArrowLeft, Search, FileText, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const publications = [
  {
    id: 1,
    title: "Impact of Climate Change on African Agriculture: Policy Perspectives",
    date: "March 2024",
    type: "Research Paper",
    authors: "ECASI Research Team",
    pages: "42 pages",
    image: "/images/research/1710846398420-1-1-1024x683.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/01/Climate-Change-African-Agriculture.pdf",
    abstract: "This paper examines the multifaceted impacts of climate change on agricultural systems across Sub-Saharan Africa, providing policy recommendations for food security and sustainable farming transitions.",
    tags: ["Climate Change", "Agriculture", "Food Security"],
  },
  {
    id: 2,
    title: "Renewable Energy Adoption Trends in East Africa 2023",
    date: "December 2023",
    type: "Whitepaper",
    authors: "Dr. Jane Mwangi & Team",
    pages: "58 pages",
    image: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/01/Renewable-Energy-East-Africa.pdf",
    abstract: "A comprehensive analysis of renewable energy adoption trends in Kenya, Uganda, Tanzania, Rwanda, and Ethiopia, identifying key drivers and barriers to the clean energy transition.",
    tags: ["Renewable Energy", "East Africa", "Green Economy"],
  },
  {
    id: 3,
    title: "UNEA-6 Briefing: African Delegations Positions & Outcomes",
    date: "February 2024",
    type: "Conference Report",
    authors: "ECASI Policy Team",
    pages: "30 pages",
    image: "/images/research/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/01/UNEA6-Briefing-Outcomes.pdf",
    abstract: "A comprehensive briefing on the United Nations Environment Assembly 6th session, covering African delegations' positions, key negotiation outcomes, and follow-up action points.",
    tags: ["UN Environment", "UNEA", "Policy"],
  },
  {
    id: 4,
    title: "Biodiversity Conservation Strategies for Sub-Saharan Africa 2030",
    date: "November 2023",
    type: "Strategy Paper",
    authors: "Multi-disciplinary ECASI Authors",
    pages: "65 pages",
    image: "/images/programmes/migration-community.png",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/11/Biodiversity-Conservation-2030.pdf",
    abstract: "Evidence-based strategies for biodiversity conservation aligned with the Kunming-Montreal Global Biodiversity Framework, with a focus on community-led conservation models.",
    tags: ["Biodiversity", "Conservation", "Strategy"],
  },
  {
    id: 5,
    title: "Carbon Markets in Africa: Opportunities and Challenges",
    date: "September 2023",
    type: "Research Paper",
    authors: "ECASI Carbon Markets Working Group",
    pages: "48 pages",
    image: "/images/courses/IMGM1984-1024x683.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/09/Carbon-Markets-Africa.pdf",
    abstract: "An assessment of Africa's participation in voluntary and compliance carbon markets, identifying entry points for countries to monetize their climate mitigation contributions.",
    tags: ["Carbon Markets", "Climate Finance", "Africa"],
  },
  {
    id: 6,
    title: "Sustainable Urban Transport in African Cities",
    date: "July 2023",
    type: "Policy Brief",
    authors: "ECASI Urban Mobility Team",
    pages: "24 pages",
    image: "/images/programmes/contact-hero.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/07/Sustainable-Urban-Transport.pdf",
    abstract: "Analyzing pathways to decarbonize urban transport in African cities through e-mobility, public transit investment, and integrated land-use planning.",
    tags: ["Transport", "Urban", "E-Mobility"],
  },
];

const Publications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const types = ['All', ...new Set(publications.map(p => p.type))];

  const filtered = publications.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDownload = (url, title) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Publications | ECASI Africa"
        description="Read our latest research papers, journals, and articles on sustainable development."
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
                <BookOpen className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Publications
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Explore our extensive collection of research papers, peer-reviewed journals, and analytical articles addressing pressing environmental challenges.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative flex-grow w-full md:max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search publications, topics..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecasi-green focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type 
                      ? 'bg-ecasi-green text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  <div className="h-44 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={e => e.target.style.display='none'}
                    />
                    <div className="absolute inset-0 bg-ecasi-navy/40 group-hover:bg-ecasi-navy/20 transition-colors"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-ecasi-navy">
                      {item.type}
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80 text-xs">
                      <FileText size={12} />
                      <span>{item.pages}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                      <Calendar size={14} />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-ecasi-navy mb-2 group-hover:text-ecasi-green transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">By {item.authors}</p>
                    
                    {expandedId === item.id && (
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {item.abstract}
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
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="flex items-center text-sm font-semibold text-ecasi-green hover:text-ecasi-navy transition-colors"
                      >
                        <Eye size={15} className="mr-1.5" />
                        {expandedId === item.id ? 'Hide' : 'Abstract'}
                      </button>
                      <button 
                        onClick={() => handleDownload(item.downloadUrl, item.title)}
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
              <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No publications found matching your search.</p>
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

export default Publications;
