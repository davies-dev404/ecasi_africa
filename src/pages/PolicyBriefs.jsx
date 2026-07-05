import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { FileBadge, Download, Eye, Calendar, ArrowLeft, Tag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const briefs = [
  {
    id: 1,
    issue: "Issue 48",
    title: "Integrating Gender Equity in National Climate Action Plans (NAPs)",
    date: "June 2024",
    pages: "8 pages",
    tags: ["Gender", "Climate Policy", "NAPs"],
    summary: "Provides guidance on mainstreaming gender-responsive approaches into Nationally Determined Contributions and National Adaptation Plans for more equitable climate outcomes.",
    image: "/images/courses/IMGM1984-1024x683.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/06/Gender-Climate-NAPs-Brief.pdf",
  },
  {
    id: 2,
    issue: "Issue 47",
    title: "Policy Recommendations for Just E-Mobility Transition in African Cities",
    date: "May 2024",
    pages: "10 pages",
    tags: ["E-Mobility", "Transport", "Urban Policy"],
    summary: "Outlines targeted policy interventions to accelerate the uptake of electric vehicles and public transport decarbonization in rapidly growing African cities.",
    image: "/images/programmes/contact-hero.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/05/EMobility-African-Cities-Brief.pdf",
  },
  {
    id: 3,
    issue: "Issue 46",
    title: "Unlocking Carbon Finance for Smallholder Farmers in East Africa",
    date: "March 2024",
    pages: "12 pages",
    tags: ["Carbon Finance", "Agriculture", "Smallholders"],
    summary: "Analysis of existing and emerging carbon finance mechanisms accessible to smallholder farmers and rural communities, with implementation recommendations.",
    image: "/images/research/1710846398420-1-1-1024x683.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/03/Carbon-Finance-Smallholder-Brief.pdf",
  },
  {
    id: 4,
    issue: "Issue 45",
    title: "Scaling Nature-Based Solutions for Flood Resilience in Urban Africa",
    date: "January 2024",
    pages: "9 pages",
    tags: ["Nature-Based Solutions", "Urban Resilience", "Floods"],
    summary: "Explores the potential of nature-based solutions such as urban forests, wetland restoration, and green infrastructure to reduce urban flood risk across African cities.",
    image: "/images/programmes/migration-community.png",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/01/NBS-Flood-Resilience-Brief.pdf",
  },
  {
    id: 5,
    issue: "Issue 44",
    title: "Strengthening Environmental Law Enforcement in Sub-Saharan Africa",
    date: "November 2023",
    pages: "11 pages",
    tags: ["Environmental Law", "Governance", "Enforcement"],
    summary: "Identifies capacity gaps in environmental law enforcement and proposes institutional reforms and regional cooperation mechanisms to improve compliance.",
    image: "/images/research/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/11/Environmental-Law-Enforcement-Brief.pdf",
  },
  {
    id: 6,
    issue: "Issue 43",
    title: "Transforming Waste Management: The Circular Economy Opportunity",
    date: "October 2023",
    pages: "8 pages",
    tags: ["Waste Management", "Circular Economy", "Africa"],
    summary: "Examines how circular economy principles can be applied to waste management in African countries to generate economic opportunities while reducing pollution.",
    image: "/images/courses/62262333_1035153403346851_5273722628304011264_n-1024x681.jpg",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/10/Circular-Economy-Waste-Brief.pdf",
  },
];

const PolicyBriefs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = briefs.filter(b => {
    return b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
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
              <p className="text-lg">No policy briefs found matching your search.</p>
              <button onClick={() => setSearchTerm('')} className="mt-4 text-ecasi-green font-semibold hover:underline">
                Clear search
              </button>
            </div>
          )}

          <div className="mt-16 text-center">
            <a 
              href="https://ecasiafrica.org/policy-briefs/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-ecasi-green text-ecasi-green rounded-lg font-semibold hover:bg-ecasi-green hover:text-white transition-colors"
            >
              View All Policy Briefs on ECASI Website
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PolicyBriefs;
