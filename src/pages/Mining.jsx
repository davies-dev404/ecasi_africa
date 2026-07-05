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

const Mining = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Sustainable Mining & Extractives"
        description="This programme generally refers to initiatives aimed at promoting environmentally, socially, and economically responsible mining practices and resource extraction."
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
            Sustainable Mining & Extractives
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
            <span className="text-white font-semibold">Sustainable Mining & Extractives</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-4xl mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        
        {/* Centered Top Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/image-11.png"
            alt="Mining landscape and extractives site"
            className="w-full max-w-[700px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </motion.div>

        {/* Introductory Highlight Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-base md:text-lg text-justify text-[#032e42] font-medium mb-10 leading-relaxed border-l-4 border-ecasi-green pl-4"
        >
          This programme generally refers to initiatives aimed at promoting environmentally, socially, and economically responsible mining practices and resource extraction. The programme focuses on reducing the negative impacts of mining on the environment, supporting local communities, and ensuring fair and transparent resource governance.
        </motion.p>

        {/* Key Aspects of such Programmes */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6">
            Key aspects of such programmes typically include:
          </h2>
          
          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Environmental Sustainability:</strong> Focusing on minimizing environmental damage through the use of sustainable technologies, responsible waste management, and biodiversity conservation.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Social Responsibility:</strong> Prioritizing the well-being of local communities, ensuring fair compensation for land and resource rights, and promoting local employment and skill development. We ensure fair labor practices, respecting indigenous rights, and engaging with local communities.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Economic Viability:</strong> Ensuring that mining operations are economically viable and contribute to long-term economic development, including tax revenues and local business opportunities.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Good Governance:</strong> Promoting transparency, accountability, and participation in resource management, including the fair allocation of royalties and the development of strong legal frameworks.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Environmental Impact Assessment:</strong> Evaluating and mitigating the environmental consequences of mining operations, including air and water pollution, habitat destruction, and land reclamation.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Resource Management:</strong> Optimizing resource extraction, reducing waste, and promoting the use of renewable energy sources.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Transparency and Accountability:</strong> Promoting transparency in financial transactions and ensuring accountability for environmental and social performance.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Policy and Governance:</strong> Understanding the regulatory framework and policy landscape for mining and advocating for responsible resource governance.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Technological Innovation:</strong> Exploring and implementing new technologies to improve efficiency, reduce environmental impact, and enhance resource recovery.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Circular Economy:</strong> Implementing circular economy principles to minimize waste and maximize resource utilization.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Global Challenges:</strong> Addressing global challenges such as climate change, biodiversity loss, and resource scarcity, with a focus on how the extractive sector contributes to or can mitigate these problems.
            </motion.li>
          </ul>
        </motion.section>

        {/* Ending Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm md:text-base text-justify bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8"
        >
          We also aim to develop professionals with the knowledge and skills to implement environmentally responsible and socially equitable practices in the extractive industries. This includes understanding challenges, developing solutions, and applying state-of-the-art sustainability concepts to mineral extraction.
        </motion.p>

      </main>

      <Footer />
    </div>
  );
};

export default Mining;
