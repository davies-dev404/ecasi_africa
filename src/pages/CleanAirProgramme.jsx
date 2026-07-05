import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Wind, FlaskConical, BookOpen, Users, Shield } from 'lucide-react';
import { specialtiesData } from '@/data/specialtiesData';

const CleanAirProgramme = () => {
  const data = specialtiesData.find(s => s.id === 'clean-air-programme');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO title="Air Quality Programme - ECASI AFRICA" description={data.shortDescription} />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-ecasi-green pt-28 pb-8 text-white text-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm mb-4">
            <Wind size={28} className="text-white" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            {data.title}
          </motion.h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow py-12 md:py-16 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
            <div 
              className="prose prose-lg prose-green max-w-none text-gray-700
                prose-headings:text-ecasi-navy prose-headings:font-bold
                prose-a:text-ecasi-green prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md
                prose-li:marker:text-ecasi-green
                prose-strong:text-ecasi-navy"
              dangerouslySetInnerHTML={{ __html: data.fullDescription }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CleanAirProgramme;
