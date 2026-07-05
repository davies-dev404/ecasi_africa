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

const Oceans = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Oceans & Marine Programme"
        description="This development program aims to achieve sustainable management of ocean resources, balancing economic development with conservation efforts."
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
            Oceans & Marine Programme
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-white/80 font-medium"
          >
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Oceans & Marine Programme</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-4xl mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">

        {/* Centered Italic Introductory Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-sm md:text-base text-center italic mb-10 leading-relaxed"
        >
          This development program aims to achieve sustainable management of ocean resources, balancing economic development with conservation efforts. It focuses on developing and implementing Sustainable Ocean Plans (SOPs), promoting science-based decision-making, and fostering cross-sectoral cooperation. The goal is to achieve 100% sustainable ocean planning, ensuring the long-term health and resilience of marine ecosystems.
        </motion.p>

        {/* Centered Main Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <img
            src="/images/programmes/ocean_sustainable.png"
            alt="Beautiful wide shot of a pristine ocean"
            className="w-full max-w-[500px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </motion.div>

        {/* Key Aspects Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6">
            Key aspects of such a program often include:
          </h2>

          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Sustainable Ocean Planning (SOP):</u></strong> This involves creating comprehensive plans for managing ocean areas, considering local and global dimensions. SOPs are characterized by inclusive development, integration across sectors, iterative adaptation, place-based approaches, ecosystem-based management, knowledge-based decision-making, political endorsement, and long-term financing.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Science-Based Decision-Making:</u></strong> Programs rely on the best available scientific knowledge, including local and indigenous knowledge, to guide decision-making and ensure effective management.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Cross-Sectoral Cooperation:</u></strong> Collaboration between government agencies, ocean sectors, and other stakeholders is crucial for successful implementation.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Blue Economy Development:</u></strong>Programs promote sustainable development of marine-based economic activities, such as fisheries, tourism, and energy production, while ensuring the protection of marine biodiversity.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Capacity Building:</u></strong> Supporting nations, particularly least developed countries and Small Island Developing States, with the tools and knowledge needed to develop and implement SOPs.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>International Cooperation:</u></strong> Programs often involve international collaboration and partnerships to address global challenges and share best practices.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Alignment with Global Frameworks:</u></strong> Integrating initiatives with global frameworks like the Sustainable Development Goals (SDGs), the Paris Agreement, and the Convention on Biological Diversity (CBD) is essential.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Monitoring and Evaluation:</u></strong> Regular monitoring and evaluation of program activities are crucial to assess progress and make adjustments as needed.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Financing:</u></strong>Ensuring sustainable long-term financing for ocean management and conservation is essential.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Education and Awareness:</u></strong> Raising public awareness about the importance of healthy oceans and promoting ocean literacy is vital for long-term sustainability.
            </motion.li>
          </ul>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Oceans;
