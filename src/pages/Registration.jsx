import React from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Registration = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Course Registration"
        description="Register for ECAS Institute courses and training programmes."
      />
      <Header />

      {/* Hero Section */}
      <section className="bg-ecasi-blue pt-24 pb-8 text-center relative overflow-hidden">
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">Course Registration</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center leading-relaxed font-medium">
              Enroll in our professional development and executive training programs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" id="firstName" required className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ecasi-green focus:ring-ecasi-green" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" id="lastName" required className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ecasi-green focus:ring-ecasi-green" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" id="email" required className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ecasi-green focus:ring-ecasi-green" />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" id="phone" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ecasi-green focus:ring-ecasi-green" />
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Select Course *</label>
                <select id="course" required className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ecasi-green focus:ring-ecasi-green">
                  <option value="">-- Please Select --</option>
                  <option value="air-quality">Air Quality and Pollution Control</option>
                  <option value="climate-finance">Climate Finance</option>
                  <option value="esg-reporting">ESG Reporting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                <textarea id="message" rows="4" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ecasi-green focus:ring-ecasi-green"></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-ecasi-green text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md">
                  Submit Registration
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Registration;
