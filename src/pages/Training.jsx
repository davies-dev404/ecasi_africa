import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Training = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Training - ECASI AFRICA"
        description="ECASI Training"
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-6 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold uppercase tracking-wide"
          >
            Training
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-sm text-gray-200"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Training</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="flex-grow py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Content will be added later as requested by the user */}
          <div className="clear"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Training;
