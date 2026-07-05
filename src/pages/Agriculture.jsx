import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const Agriculture = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Agriculture and Food Systems"
        description="This development program on sustainable agriculture and food systems aims to improve food security and nutrition while protecting the environment and ensuring long-term sustainability."
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
            Agriculture and Food Systems
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-white/80 font-medium"
          >
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Agriculture and Food Systems</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-5xl mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        
        {/* Introductory Highlight Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-base md:text-lg text-justify text-[#0088cc] font-medium mb-10 leading-relaxed"
        >
          This development program on sustainable agriculture and food systems aims to improve food security and nutrition while protecting the environment and ensuring long-term sustainability. It focuses on promoting sustainable agricultural practices, strengthening food systems from production to consumption, and addressing issues like climate change and resource management.
        </motion.p>

        {/* Key Aspects of this Program */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-[#032e42] mb-6">
            Key aspects of this program include:
          </h2>
          
          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Promoting sustainable agricultural practices:</strong> This involves adopting practices like agroecology, conservation agriculture, and organic farming to improve soil health, water conservation, and reduce chemical input use.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Strengthening food systems:</strong> This encompasses addressing issues at each stage of the food chain, from production to consumption, to enhance resilience, efficiency, and inclusiveness.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Addressing climate change:</strong> Implementing climate-smart agriculture techniques and reducing greenhouse gas emissions from agriculture.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Improving food security and nutrition:</strong> Ensuring access to safe, nutritious, and culturally appropriate food for all.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Empowering smallholder farmers and local communities:</strong> Supporting their livelihoods and engaging them in the development process.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Promoting fair markets and value chains:</strong> Ensuring fair prices for producers and enabling access to markets for their produce.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Integrating social and economic dimensions:</strong> Addressing the root causes of unsustainable food systems and promoting inclusive growth.
            </motion.li>
          </ul>
        </motion.section>

        {/* Side-by-Side Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 border-t pt-10"
        >
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <img
              src="https://ecasiafrica.org/wp-content/uploads/2024/05/hd-768x576.jpg"
              alt="People and livestock at water source"
              className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
              }}
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <img
              src="https://ecasiafrica.org/wp-content/uploads/2024/05/IMG-20201212-WA0046-768x576.jpg"
              alt="Farmers walking in farm"
              className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-2.jpg";
              }}
            />
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
};

export default Agriculture;
