import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { FileText, Download, Eye, Calendar, ArrowLeft, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const reports = [
  {
    id: 1,
    title: "ECAS Institute Annual Impact Report 2023",
    date: "January 2024",
    type: "Annual Report",
    pages: "88 pages",
    image: "/images/courses/IMGM1984-1024x683.jpg",
    tags: ["Annual Report", "Impact", "2023"],
    summary: "A comprehensive overview of ECAS Institute's activities, partnerships, trainings delivered, and sustainability impact across Africa in 2023.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/01/ECASI-Annual-Impact-Report-2023.pdf",
  },
  {
    id: 2,
    title: "Kenya National Climate Change Action Plan — Review Report",
    date: "October 2023",
    type: "Assessment Report",
    pages: "62 pages",
    image: "/images/research/1710846398420-1-1-1024x683.jpg",
    tags: ["Kenya", "Climate Policy", "Assessment"],
    summary: "A systematic review and assessment of Kenya's third National Climate Change Action Plan (NCCAP), evaluating implementation gaps and providing remedial recommendations.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/10/Kenya-NCCAP-Review.pdf",
  },
  {
    id: 3,
    title: "Regional Workshop Report: Climate Change and Food Systems Transformation",
    date: "June 2024",
    type: "Workshop Report",
    pages: "36 pages",
    image: "/images/courses/20241003_133952069-1-1024x683.jpg",
    tags: ["Food Systems", "Workshop", "Regional"],
    summary: "Report from the regional workshop bringing together food system experts, farmers, and policymakers to chart pathways for climate-resilient food systems in East Africa.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2024/06/Food-Systems-Workshop-Report.pdf",
  },
  {
    id: 4,
    title: "Quarterly Climate Finance Tracker: Q3 2023",
    date: "September 2023",
    type: "Quarterly Report",
    pages: "28 pages",
    image: "/images/research/57213763_2128957177158658_1134502275364945920_n.jpg",
    tags: ["Climate Finance", "Tracker", "Q3 2023"],
    summary: "Tracks climate finance flows to African countries in Q3 2023, providing data on major pledges, disbursements, and effectiveness of green bonds and adaptation funds.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/09/Climate-Finance-Q3-2023.pdf",
  },
  {
    id: 5,
    title: "Baseline Study: Air Quality in Nairobi Metropolitan Area",
    date: "August 2023",
    type: "Baseline Study",
    pages: "74 pages",
    image: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    tags: ["Air Quality", "Baseline Study", "Nairobi"],
    summary: "A comprehensive baseline assessment of air quality in the Nairobi Metropolitan Area, documenting pollutant levels, emission sources, and public health impacts.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/08/Nairobi-Air-Quality-Baseline.pdf",
  },
  {
    id: 6,
    title: "Scoping Study: E-Waste Management Framework for East Africa",
    date: "July 2023",
    type: "Scoping Study",
    pages: "50 pages",
    image: "/images/programmes/migration-community.png",
    tags: ["E-Waste", "Scoping Study", "East Africa"],
    summary: "Scoping study examining the legislative, institutional, and technical landscape for e-waste management across East African Community member states.",
    downloadUrl: "https://ecasiafrica.org/wp-content/uploads/2023/07/E-Waste-EAC-Scoping.pdf",
  },
];

const Reports = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', ...new Set(reports.map(r => r.type))];
  const filtered = selectedType === 'All' ? reports : reports.filter(r => r.type === selectedType);

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



        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Reports;
