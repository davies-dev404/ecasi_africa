import React from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeroBanner from '@/components/PageHeroBanner';
import { FileText, Download } from 'lucide-react';

const profiles = [
  {
    title: "ECAS Institute Corporate Profile",
    description: "An overview of our mission, vision, key impact areas, and structural framework across the African continent.",
    url: "/pdfs/ECAS_Corporate_Profile.pdf",
    icon: FileText,
  },
  {
    title: "Capacity Building & Training Profile",
    description: "Details on our executive courses, mentorship programmes, and capacity-building tracks for professionals and governments.",
    url: "/pdfs/ECASI_Training_Profile.pdf",
    icon: FileText,
  },
  {
    title: "Research & Advisory Services",
    description: "Our portfolio of consultancy services, policy assessments, and specialized advisory for stakeholders.",
    url: "/pdfs/ECASI_Research_Profile_2025.pdf",
    icon: FileText,
  }
];

const OrganisationProfiles = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Organisation Profiles"
        description="Download and explore ECAS Institute's organisational profiles outlining our expertise in training, research, and advisory services."
      />
      <Header />

      {/* Hero Section */}
      <PageHeroBanner
        title="Organisation Profiles"
        subtitle="Explore our core capabilities and track record across different programmatic areas."
        image="/images/Gallery/1715195551211.jpg"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'About Us', path: '/about' },
          { label: 'Organisation Profiles' },
        ]}
      />

      {/* Profiles Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.map((profile, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
                  <profile.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-3 leading-snug">
                  {profile.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                  {profile.description}
                </p>
                <a
                  href={profile.url}
                  download
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold px-4 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-sm w-full"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrganisationProfiles;
