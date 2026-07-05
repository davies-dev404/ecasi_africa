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

const Water = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Fresh Water Programme"
        description="This programme on freshwater focuses on ensuring access to safe and sustainable water resources for human and ecological needs."
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
            Fresh Water Programme
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-white/80 font-medium"
          >
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Fresh Water Programme</span>
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
          This programme on freshwater focuses on ensuring access to safe and sustainable water resources for human and ecological needs. It aims to address challenges like water scarcity, pollution, and unsustainable water management practices, ultimately contributing to environmental sustainability and socio-economic development.
        </motion.p>

        {/* Centered Main Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <img
            src="/images/programmes/tana_river.png"
            alt="Aerial view of Tana River and forests"
            className="w-full max-w-[500px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-2.jpg";
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
            Key aspects of a freshwater development program include:
          </h2>

          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Water Resource Management:</u></strong>Implementing integrated water resource management (IWRM) strategies to efficiently manage water resources, including surface water and groundwater, in a sustainable manner.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Water Quality Improvement:</u></strong> Addressing water pollution through wastewater treatment, industrial discharge controls, and agricultural practices that minimize runoff and fertilizer use.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Ecosystem Protection and Restoration:</u></strong>Protecting and restoring freshwater ecosystems like rivers, lakes, and wetlands, recognizing their vital role in biodiversity, water purification, and flood control.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Water Security:</u></strong>Addressing water scarcity through water conservation measures, efficient irrigation systems, and alternative water sources like desalination and rainwater harvesting.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Community Involvement:</u></strong>Engaging local communities in water management decisions and promoting participatory approaches to water resource planning and implementation.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Capacity Building:</u></strong>Training and empowering individuals, organizations, and government agencies to effectively manage water resources and address water-related challenges.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Technological Innovation:</u></strong>Exploring and adopting new technologies for water treatment, irrigation, and water harvesting to improve efficiency and sustainability.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Policy and Regulatory Frameworks:</u></strong>Developing and strengthening policy frameworks and regulatory mechanisms to ensure responsible water management practices and enforce environmental regulations.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Monitoring and Evaluation:</u></strong>Establishing monitoring systems to track water quality, water levels, and the effectiveness of water management interventions.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Financing and Investment:</u></strong>Securing financial resources for water infrastructure development, research, and implementation of water management programs.
            </motion.li>
          </ul>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Water;
