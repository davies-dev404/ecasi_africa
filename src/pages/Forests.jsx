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

const Forests = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Forests, Biodiversity and Ecosystems"
        description="Our programme on Forests, Biodiversity, and Ecosystems focuses on conserving and sustainably using forest resources while protecting biodiversity and promoting ecosystem health."
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
            Forests, Biodiversity and Ecosystems
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
            <span className="text-white font-semibold">Forests, Biodiversity and Ecosystems</span>
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
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/IMG-20201212-WA0046-1024x768.jpg"
            alt="People in field, reforestation project"
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
          Our programme on Forests, Biodiversity, and Ecosystems focuses on conserving and sustainably using forest resources while protecting biodiversity and promoting ecosystem health. It aims to address the threats to forest ecosystems, such as deforestation, and implement strategies like forest restoration, protected areas, and sustainable forest management practices. The program involve collaboration between governments, organizations, and local communities to achieve long-term sustainability.
        </motion.p>

        {/* Detailed breakdown heading */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t pt-8 mb-8"
        >
          <p className="text-sm italic text-gray-500 mb-6">
            Here’s a more detailed look at the key aspects of such programs:
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* 1. Conservation and Sustainable Use */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-lg font-bold text-[#032e42] mb-4">
              1. Conservation and Sustainable Use:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Protecting biodiversity:</strong> Programs aim to safeguard the vast array of life within forests, including plants, animals, fungi, and microbes, along with their genetic diversity.
              </li>
              <li>
                <strong className="text-[#032e42]">Sustainable forestry:</strong> This involves managing forests in a way that meets current needs without compromising the ability of future generations to meet their own.
              </li>
              <li>
                <strong className="text-[#032e42]">Protected areas:</strong> Establishing and managing protected areas like national parks, reserves, and wilderness areas to safeguard specific habitats and species.
              </li>
            </ul>
          </motion.section>

          {/* 2. Ecosystem Restoration */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-lg font-bold text-[#032e42] mb-4">
              2. Ecosystem Restoration:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Replanting and restoring degraded land:</strong> Programs often involve initiatives to reforest deforested areas or restore degraded forest ecosystems.
              </li>
              <li>
                <strong className="text-[#032e42]">Landscape restoration:</strong> This involves addressing issues like fragmentation and connectivity of forest ecosystems to improve their health and resilience.
              </li>
            </ul>
          </motion.section>

          {/* 3. Addressing Threats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-lg font-bold text-[#032e42] mb-4">
              3. Addressing Threats:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Deforestation:</strong> Programs work to reduce deforestation by promoting sustainable land use practices, combating illegal logging, and supporting local communities who depend on forests.
              </li>
              <li>
                <strong className="text-[#032e42]">Climate change:</strong> Many programs consider the impact of climate change on forests and implement strategies for mitigation and adaptation.
              </li>
            </ul>
          </motion.section>

          {/* 4. Collaboration and Engagement */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="bg-gray-50 p-6 rounded-xl border border-gray-100"
          >
            <h3 className="text-lg font-bold text-[#032e42] mb-4">
              4. Collaboration and Engagement:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Working with communities:</strong> Programs often involve local communities in planning and implementing conservation and restoration efforts, ensuring sustainable livelihoods and resource management.
              </li>
              <li>
                <strong className="text-[#032e42]">Partnerships:</strong> Collaboration between governments, organizations, and private sector actors is crucial for effective program implementation.
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
            <h3 className="text-lg font-bold text-[#032e42] mb-4">
              5. Monitoring and Evaluation:
            </h3>
            <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
              <li>
                <strong className="text-[#032e42]">Tracking progress:</strong> Programs need to monitor their effectiveness by tracking changes in forest cover, biodiversity, and ecosystem health.
              </li>
              <li>
                <strong className="text-[#032e42]">Adapting strategies:</strong> Monitoring and evaluation results help in refining program strategies and ensuring they remain effective over time.
              </li>
            </ul>
          </motion.section>
        </div>

        {/* Centered Bottom Image */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex justify-center border-t pt-10"
        >
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/347549576_187525630473651_6083702411160806148_n-768x1024.jpg"
            alt="Scientist examining seedling in tree nursery"
            className="w-full max-w-[500px] h-auto border border-gray-200 shadow-sm rounded-lg"
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

export default Forests;
