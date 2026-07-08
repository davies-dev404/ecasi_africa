import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


const EnablingEnvironment = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Creation of an Enabling Environment"
        description="This program involves creating the necessary conditions for effective climate action, particularly by the private sector and communities."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-ecasi-green pt-28 pb-6 text-white text-center"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Creation of an Enabling Environment
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-white/80 font-medium">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Climate Change Action</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Creation of an Enabling Environment</span>
          </div>
        </div>
      </motion.section>

      {/* ── Main Content Area ── */}
      <main className="max-w-[1000px] mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        {/* Centered Cover Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/images.png"
            alt="Kenya Gazette Supplement"
            className="w-full max-w-[400px] h-auto border border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </motion.div>

        {/* Introductory paragraph */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-[#008000] font-medium text-justify mb-10 leading-relaxed"
        >
          This program involves creating the necessary conditions for effective climate action, particularly by the private sector and communities. This includes supportive policies, regulations, incentives, and institutions that encourage investments and actions to reduce greenhouse gas emissions and adapt to climate impacts. It's about fostering a landscape where climate-friendly solutions are prioritized and readily adopted
        </motion.p>

        {/* Section A: Legal & Political Arrangements */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6 leading-snug">
            A. We contribute to legal and political arrangements that contribute to an enabling environment for climate action; for example:
          </h2>

          <ol className="space-y-4 list-decimal pl-5 text-sm md:text-base">
            <li>establishing national designated entities to develop and implement environmental and climate policies;</li>
            <li>undertaking MRV of adaptation action and processes;</li>
            <li>developing cross-sectoral plans and policies;</li>
            <li>subnational governments adopting regional climate change programmes;</li>
            <li>implementing comprehensive laws and regulations that provide a legal basis for effective climate action;</li>
            <li>collaborating with and including different stakeholders in policymaking; enforcing international agreements;</li>
            <li>enhancing international cooperation and data-sharing; incorporating gender considerations and traditional knowledge into climate policies;</li>
            <li>implementing tailored policies on education, training and climate change awareness in sectors like energy, infrastructure, waste management, transport, and forestry, as well as carbon-intensive sectors;</li>
            <li>implementing climate change policies and developing a national GHG inventory system that includes working groups for different sectors and thematic teams for preparing NCs and updating BURs.</li>
          </ol>
        </motion.div>

        {/* Section B */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-12 gap-8 items-center mb-12 border-t pt-8"
        >
          <div className="md:col-span-7">
            <p className="text-sm md:text-base text-justify">
              <strong className="text-[#032e42]">B.</strong> We support processes towards strengthening and establishing institutional frameworks and updating policy documents related to policy and law implementation and contribute to an enabling environment for climate action by enhancing resilience, creating institutional and human capacity, increasing access to financial and technical resources, integrating climate change adaptation into national and local planning, and promoting synergies between climate action and the achievement of the Sustainable Development Goals.
            </p>
          </div>
          <div className="md:col-span-5 flex justify-center">
            <img
              src="https://ecasiafrica.org/wp-content/uploads/2025/08/1714399114741.jpg"
              alt="Institutional Frameworks"
              className="w-full max-w-[360px] h-auto rounded-lg shadow-md border border-gray-100"
              onError={(e) => {
                e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
              }}
            />
          </div>
        </motion.div>

        {/* Section C */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-12 gap-8 items-center mb-12 border-t pt-8"
        >
          <div className="md:col-span-7">
            <p className="text-sm md:text-base text-justify">
              <strong className="text-[#032e42]">C.</strong> We contribute to development of strong policies and regulatory frameworks to provide clear guidelines and incentives for climate action, including setting emission reduction targets, implementing carbon pricing mechanisms and promoting use of renewable energy sources. We reinforce awareness-raising campaigns concerning priority areas such as adaptation and mitigation, including in relation to reducing energy consumption, using renewable energy, promoting environmentally conscious consumption and resilience-building, to encourage active public participation in climate action.
            </p>
          </div>
          <div className="md:col-span-5 flex justify-center">
            <img
              src="https://ecasiafrica.org/wp-content/uploads/2025/08/1714411123684-1024x682.jpg"
              alt="Policy & Regulatory Frameworks"
              className="w-full max-w-[360px] h-auto rounded-lg shadow-md border border-gray-100"
              onError={(e) => {
                e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
              }}
            />
          </div>
        </motion.div>

        {/* Section D */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-12 gap-8 items-center border-t pt-8"
        >
          <div className="md:col-span-7">
            <p className="text-sm md:text-base text-justify">
              <strong className="text-[#032e42]">D.</strong> We support efforts towards the transfer of clean and sustainable technologies from developed to developing countries for reducing GHG emissions and promoting climate resilience, including by providing technical assistance, capacity-building and knowledge-sharing to ensure effective adoption and implementation of climate-friendly technologies.
            </p>
          </div>
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[360px] rounded-lg overflow-hidden shadow-md border border-gray-100 bg-black">
              <img
                src="https://ecasiafrica.org/wp-content/uploads/2025/05/image-8.png"
                alt="The Future of Public Transport in Kenya"
                className="w-full h-auto block"
                onError={(e) => {
                  e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
                }}
              />
              <div className="bg-[#cc0000] text-white text-center py-2 px-3 text-xs md:text-sm font-bold tracking-wide uppercase">
                The Future of Public Transport in Kenya
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default EnablingEnvironment;
