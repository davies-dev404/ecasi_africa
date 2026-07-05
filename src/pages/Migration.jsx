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

const Migration = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Environment, Migration and Mobility"
        description="Our programme on environment, migration, and mobility focuses on understanding and addressing the complex relationship between environmental factors, human movement, and sustainable development."
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
            Environment, Migration and Mobility
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-white/80 font-medium"
          >
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Environment, Migration and Mobility</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-4xl mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">

        {/* Hero Image at Top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <img
            src="/images/programmes/migration-team.png"
            alt="ECASI team in the field - environment, migration and mobility programme"
            className="w-full max-w-[700px] h-auto rounded-lg shadow-sm"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </motion.div>

        {/* Introductory Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-sm md:text-base text-justify mb-6 leading-relaxed"
        >
          Our programme on environment, migration, and mobility focuses on understanding and addressing the complex relationship between environmental factors, human movement, and sustainable development. It involves research, capacity building, policy advocacy, and community engagement, aiming to create more resilient and adaptable communities in the face of environmental changes and migration pressures.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm md:text-base text-justify mb-8"
        >
          Here's a more detailed breakdown of what our programme entail:
        </motion.p>

        {/* Section 1: Understanding the Interconnections */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-4">
            1. Understanding the Interconnections:
          </h2>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Environmental Drivers of Migration:</u></strong> Investigating how factors like climate change, resource depletion, and natural disasters contribute to migration patterns.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Migration and Environmental Change:</strong> Analyzing how migration affects the environment, both in origin and destination areas.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Mobility as Adaptation:</u></strong> Exploring how migration can be a form of adaptation to environmental changes, and how it can be managed effectively.
            </motion.li>
          </ul>
        </motion.section>

        {/* Section 2: Addressing Key Issues */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-4">
            2. Addressing Key Issues:
          </h2>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Climate-Induced Displacement and Migration:</u></strong>Providing support and protection to those affected by climate change-related displacement and migration.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Migration Governance and Policy:</u></strong>Developing policies that promote safe, orderly, and regular migration, taking into account environmental factors.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Sustainable Development and Migration:</u></strong> Integrating migration into national and regional development strategies, ensuring that it contributes to sustainable development goals.
            </motion.li>
          </ul>
        </motion.section>

        {/* Section 3: Capacity Building and Knowledge Sharing */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-4">
            3. Capacity Building and Knowledge Sharing:
          </h2>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Training and Education:</u></strong> Developing training and educational materials on migration, environment, and climate change.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Research and Data Collection:</u></strong> Conducting research and collecting data on migration patterns, environmental factors, and their interactions.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Information Sharing and Networks:</u></strong> Facilitating the exchange of information and experiences between governments, international organizations, and other stakeholders.
            </motion.li>
          </ul>
        </motion.section>

        {/* Section 4: Building Knowledge and Capacity */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-4">
            4. Building Knowledge and Capacity:
          </h2>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Community Dialogue:</u></strong> Engaging with affected communities to understand their needs and concerns.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Participatory Planning:</u></strong> Involving communities in the planning and implementation of programs and projects.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]"><u>Empowerment of Marginalized Groups:</u></strong> Prioritizing the needs and voices of vulnerable groups, including women and youth, in the design and implementation of the programme.
            </motion.li>
          </ul>
        </motion.section>

        {/* Closing Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 space-y-3 list-disc text-sm md:text-base text-justify"
        >
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-[#032e42]"><u>Supporting Adaptation and Resilience:</u></strong> we focus on helping communities build resilience to climate change and explore options for adapting in place while also supporting those who need to move.
            </li>
            <li>
              <strong className="text-[#032e42]"><u>Promoting Dignified Mobility:</u></strong> we emphasize the importance of safe, orderly, and regular migration, and advocate for policies that protect the rights of migrants.
            </li>
            <li>
              <strong className="text-[#032e42]"><u>Building Knowledge and Capacity:</u></strong> we use research, training, and capacity-building initiatives to empower individuals, communities, and policymakers to address climate mobility effectively.
            </li>
          </ul>
        </motion.div>

        {/* Bottom Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <img
            src="/images/programmes/migration-community.png"
            alt="ECASI community engagement and migration programme"
            className="w-full max-w-[700px] h-auto rounded-lg shadow-sm"
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

export default Migration;
