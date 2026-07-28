import React from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
      <section className="bg-primary pt-24 pb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">Organisation Profiles</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center leading-relaxed font-medium">
              Explore our core capabilities and track record across different programmatic areas.
            </p>
          </motion.div>
        </div>
      </section>

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
