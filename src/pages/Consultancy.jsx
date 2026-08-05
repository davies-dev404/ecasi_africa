import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
      <section className="bg-ecasi-navy pt-28 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-white mb-6">
              <Building2 size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">Consultancy Services</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center leading-relaxed font-medium">
              Expert Business Advisory & Technical Assistance for Sustainable Development
            </p>
          </motion.div>
        </div>
      </section>

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
      <section className="bg-ecasi-green py-16 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-4">Need Expert Advisory?</h2>
          <p className="text-white/90 mb-8 text-lg">Contact our consultancy team today to discuss your organizational needs.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-white text-ecasi-green font-bold px-8 py-3 rounded-xl hover:bg-slate-100 transition-colors">
            Get in Touch <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Consultancy;
