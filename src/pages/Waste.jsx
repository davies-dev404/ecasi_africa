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

const Waste = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Waste & Circular Economy"
        description="Our program on Sustainable Waste & Circular Economy focuses on implementing zero-waste strategies, promoting sustainable waste management, and fostering circular economy practices."
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
            Waste & Circular Economy
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
            <span className="text-white font-semibold">Waste & Circular Economy</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-4xl mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        
        {/* Introductory Highlight Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-base md:text-lg text-justify text-[#032e42] font-semibold mb-10 leading-relaxed text-center px-4"
        >
          Our program on Sustainable Waste & Circular Economy focuses on implementing zero-waste strategies, promoting sustainable waste management, and fostering circular economy practices. This involves developing policies, supporting innovative solutions, and engaging with various stakeholders to reduce waste and enhance resource efficiency.
        </motion.p>

        {/* Big Circular Economy Chart Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex justify-center"
        >
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/circulareconomyimage2chart-1024x1024.png"
            alt="Circular Economy Process Diagram"
            className="w-full max-w-[600px] h-auto"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </motion.div>

        {/* Detailed Breakdown Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t pt-8 mb-8"
        >
          <p className="text-sm italic text-gray-500 mb-6">
            Here’s a more detailed breakdown of the components:
          </p>
        </motion.div>

        <div className="space-y-10">
          {/* 1. Policy and Governance */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-xl font-bold text-[#032e42] mb-4">
              1. Policy and Governance:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Developing Zero-Waste Strategies:</strong> Create a comprehensive roadmap for reducing waste generation and improving waste management, including specific targets and indicators.
              </li>
              <li>
                <strong className="text-[#032e42]">Formulating Regulations and Standards:</strong> Establish legal frameworks for waste management, including Extended Producer Responsibility (EPR) and bans on single-use plastics.
              </li>
              <li>
                <strong className="text-[#032e42]">Supporting Governance Structures:</strong> Enhance the capacity of local governments and other relevant agencies to implement waste management policies and programs.
              </li>
            </ul>
          </motion.section>

          {/* 2. Sustainable Waste Management */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-xl font-bold text-[#032e42] mb-4">
              2. Sustainable Waste Management:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Developing Waste Sorting and Recycling Systems:</strong> Support the development of infrastructure for sorting and processing waste materials, including plastics, paper, and other recyclables.
              </li>
              <li>
                <strong className="text-[#032e42]">Supporting Waste Collection and Transportation:</strong> Improve the efficiency and reliability of waste collection services, potentially through the use of technology and public-private partnerships.
              </li>
              <li>
                <strong className="text-[#032e42]">Promoting Composting:</strong> Encourage the use of composting technologies, particularly for organic waste, to reduce landfill waste.
              </li>
              <li>
                <strong className="text-[#032e42]">Closing Dumping Sites:</strong> Assist governments in closing illegal dumping sites and developing proper waste disposal facilities.
              </li>
            </ul>
          </motion.section>

          {/* 3. Circular Economy Practices */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-xl font-bold text-[#032e42] mb-4">
              3. Circular Economy Practices:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Promoting Reuse and Upcycling:</strong> Support initiatives that encourage the reuse of materials and products, as well as the upcycling of waste into new products.
              </li>
              <li>
                <strong className="text-[#032e42]">Developing a Sharing Economy:</strong> Foster the development of sharing platforms and other initiatives that promote the sharing of resources and reduce the need for individual ownership.
              </li>
              <li>
                <strong className="text-[#032e42]">Supporting Innovative Solutions:</strong> Encourage the development of innovative technologies and business models that can contribute to the circular economy, such as waste-to-energy projects and circular product design.
              </li>
              <li>
                <strong className="text-[#032e42]">Engaging with Stakeholders:</strong> Involve businesses, NGOs, community organizations, and individuals in the development and implementation of circular economy initiatives.
              </li>
            </ul>
          </motion.section>

          {/* 4. Training and Awareness */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-xl font-bold text-[#032e42] mb-4">
              4. Training and Awareness:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Developing Training Programs:</strong> Provide training on waste management and circular economy principles for local government officials, technical staff, and other stakeholders.
              </li>
              <li>
                <strong className="text-[#032e42]">Raising Public Awareness:</strong> Implement public awareness campaigns to educate the public on the importance of waste reduction, recycling, and other circular economy practices.
              </li>
            </ul>
          </motion.section>

          {/* 5. Monitoring and Evaluation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-xl font-bold text-[#032e42] mb-4">
              5. Monitoring and Evaluation:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Data Collection and Analysis:</strong> Establish systems for collecting data on waste generation, recycling rates, and other relevant indicators.
              </li>
              <li>
                <strong className="text-[#032e42]">Monitoring and Evaluation:</strong> Regularly monitor the progress of waste management and circular economy programs and evaluate their effectiveness.
              </li>
            </ul>
          </motion.section>
        </div>

        {/* Bottom Circular Nature/Economy Diagram Image */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 flex justify-center border-t pt-10"
        >
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/1_Q-076RSkpQEwS08jPVpuYQ.png"
            alt="Nature and Circular Economy cycle"
            className="w-full max-w-[550px] h-auto"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-2.jpg";
            }}
          />
        </motion.div>

      </main>

      <Footer />
    </div>
  );
};

export default Waste;
