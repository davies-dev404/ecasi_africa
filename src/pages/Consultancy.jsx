import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeroBanner from '@/components/PageHeroBanner';

import researchData from '@/data/researchData.json';

const cleanContent = (htmlContent) => {
  if (!htmlContent) return '';
  return htmlContent.replace(/\s+srcset="[^"]*"/gi, '').replace(/\s+sizes="[^"]*"/gi, '');
};

const Consultancy = () => {
  const data = researchData['consulting'];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Consultancy Services & Business Advisory"
        description="ECAS Institute Consultancy Services - Expert advice on policy, climate change, and sustainability."
      />
      <Header />

      {/* Hero Section */}
      <PageHeroBanner
        title="Consultancy Services"
        subtitle="Expert Business Advisory & Technical Assistance for Sustainable Development"
        image="/images/research/consultancy.jpg"
        icon={Building2}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Consultancy Services' },
        ]}
      />

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none prose-headings:text-ecasi-navy prose-a:text-ecasi-green hover:prose-a:text-ecasi-blue prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: cleanContent(data ? data.content : '') }}
          />
        </div>
      </section>

      {/* Call to action */}
      <section className="relative py-16 text-center text-white overflow-hidden bg-[#032e42]">
        <img
          src="/images/research/policy_advisory_meeting.jpg"
          alt="Consultancy Advisory Team"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(125deg, rgba(3, 46, 66, 0.85) 0%, rgba(0, 77, 30, 0.82) 100%)',
          }}
        />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="!text-white text-3xl font-serif font-bold mb-4">Need Expert Advisory?</h2>
          <p className="text-white/95 mb-8 text-lg text-center">Contact our consultancy team today to discuss your organizational needs.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-[#008000] hover:bg-white text-white hover:text-[#032e42] font-bold px-8 py-3 rounded-xl transition-colors shadow-lg">
            Get in Touch <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Consultancy;
