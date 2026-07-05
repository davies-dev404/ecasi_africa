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
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }
  }
};

const Energy = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Energy and Green Economy"
        description="Accelerating Africa's clean energy transition and green economy through policy, research, and capacity development."
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
            Energy and Green Economy
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
            <span className="text-white font-semibold">Energy and Green Economy</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-5xl mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        
        {/* Side-by-Side Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <img
              src="https://ecasiafrica.org/wp-content/uploads/2025/05/20241003_133952069-1-1024x683.jpg"
              alt="Geothermal Spa Group"
              className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
              }}
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between bg-black">
            <img
              src="https://ecasiafrica.org/wp-content/uploads/2025/05/image-8.png"
              alt="The Future of Public Transport in Kenya"
              className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-2.jpg";
              }}
            />
          </div>
        </motion.div>

        {/* Introductory Highlight Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-base md:text-lg text-justify text-[#032e42] font-medium mb-12 border-l-4 border-ecasi-green pl-4"
        >
          This Programme is a <em>structured initiative that involves conducting research and providing analysis on complex societal issues</em>, focused on the energy sector. The program aims to generate ideas, inform policy, and influence decisions related to energy policy and practice.
        </motion.p>

        {/* Key Features of the Programme */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-[#032e42] mb-6">
            Key Features of the Programme include:
          </h2>
          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Research and Analysis:</strong> The program involves conducting in-depth research into various aspects of the energy sector, such as renewable energy, energy efficiency, energy security, and the impacts of energy policies.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Policy Recommendations:</strong> we develop policy proposals based on their research, aiming to influence decision-makers and shape energy policy.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Expert Advisory:</strong> We employ a team of experts, including energy specialists, economists, and policymakers, to provide guidance and analysis.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Collaboration and Dialogue:</strong> We engage in collaborations with other organizations, universities, and government agencies to facilitate knowledge sharing and build consensus.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Public Engagement:</strong> We conduct public awareness campaigns to educate the public on energy issues and engage them in discussions about energy policy.
            </motion.li>
          </ul>
        </motion.section>

        {/* Programme Areas heading */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t pt-10 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-ecasi-green">
            Programme Areas
          </h2>
        </motion.div>

        {/* Area 1: Energy Planning */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100"
        >
          <h3 className="text-xl font-bold text-[#032e42] mb-4">
            1. Energy Planning
          </h3>
          <p className="text-sm md:text-base text-justify mb-6">
            This program on energy planning and management typically involves several key steps: assessing current energy use, setting energy goals, identifying energy strategies, creating an action plan, implementing the plan, and measuring progress. This program aims to improve energy efficiency and reduce consumption.
          </p>

          <h4 className="text-base font-bold text-[#032e42] mb-4">
            1.1 Our Approaches
          </h4>
          <ol className="space-y-4 list-decimal pl-5 text-sm md:text-base text-justify">
            <li>
              <strong className="text-[#032e42]">Assessing Current Energy Use:</strong> This involves understanding how much energy is currently being used, where it’s being used, and why. This includes analyzing energy bills, monitoring energy consumption patterns, and identifying areas of high energy intensity.
            </li>
            <li>
              <strong className="text-[#032e42]">Setting Energy Goals:</strong> We define specific, measurable, achievable, relevant, and time-bound (SMART) energy goals. These goals focus on reducing energy consumption, improving energy efficiency, or increasing the use of renewable energy sources.
            </li>
            <li>
              <strong className="text-[#032e42]">Identifying Energy Strategies:</strong> We research and explore various energy efficiency and renewable energy options that align with the set goals. This involves considering energy-efficient technologies, building modifications, behavioral changes, and renewable energy solutions.
            </li>
            <li>
              <strong className="text-[#032e42]">Creating an Action Plan:</strong> We develop detailed plans outlining the steps to achieve the energy goals. This plan specifies the actions to be taken, the resources needed, the timeline for implementation, and the metrics to track progress.
            </li>
            <li>
              <strong className="text-[#032e42]">Implement the Plan:</strong> We help put the action plan into action, implementing the identified energy strategies and technologies. This involves training staff, implementing new equipment, or modifying building systems.
            </li>
            <li>
              <strong className="text-[#032e42]">Measuring Progress and Evaluation:</strong> We regularly monitor energy consumption and track progress towards the set goals. This is done through energy monitoring systems, analyzing energy bills, and conducting performance audits.
            </li>
            <li>
              <strong className="text-[#032e42]">Adjusting and Improving:</strong> Based on the results of the evaluation, we help make adjustments to energy plans and continue to strive for continuous improvement. This involves refining energy strategies, updating the action plan, or exploring new technologies.
            </li>
          </ol>
        </motion.section>

        {/* Area 2: Green Economy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100"
        >
          <h3 className="text-xl font-bold text-[#032e42] mb-4">
            1.2 Green Economy
          </h3>
          <p className="text-sm md:text-base text-justify mb-6">
            This programme aims to transform African economies to be more environmentally sustainable and socially inclusive. It involves reshaping policies, investments, and spending towards sectors like clean technologies, renewable energy, and green infrastructure, while ensuring economic growth is coupled with environmental protection and social equity.
          </p>

          <h4 className="text-base font-bold text-[#032e42] mb-4">
            1.2.1 Key Aspects of our Green Economy Programme:
          </h4>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base">
            <li>
              <strong className="text-[#032e42]">Policy and Investment Shifting:</strong> Prioritizing policies and investments that promote environmental sustainability and resource efficiency.
            </li>
            <li>
              <strong className="text-[#032e42]">Sectoral Transformation:</strong> Focusing on sectors like renewable energy, green transportation, waste management, and sustainable agriculture.
            </li>
            <li>
              <strong className="text-[#032e42]">Capacity Building and Support:</strong> Providing technical assistance and capacity building to governments and businesses to implement green economy initiatives.
            </li>
            <li>
              <strong className="text-[#032e42]">Green Finance:</strong> Encouraging green investments and developing financial instruments that support sustainable projects.
            </li>
            <li>
              <strong className="text-[#032e42]">Inclusive Growth:</strong> Ensuring that the transition to a green economy benefits all segments of society and does not exacerbate inequality.
            </li>
            <li>
              <strong className="text-[#032e42]">International Collaboration:</strong> Working with international organizations and partners to share knowledge, best practices, and resources.
            </li>
          </ul>
        </motion.section>

        {/* Area 3: Energy Transition */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100"
        >
          <h3 className="text-xl font-bold text-[#032e42] mb-4">
            1.3 Energy Transition
          </h3>
          <p className="text-sm md:text-base text-justify mb-6">
            Our energy transition program aims to shift Africa’s energy systems from fossil fuels to cleaner, more sustainable sources, like renewable energy. The program is crucial for combating climate change and promoting sustainable development. It involves a range of actions, including investing in renewable energy infrastructure, improving energy efficiency, and developing policies that support the transition.
          </p>

          <h4 className="text-base font-bold text-[#032e42] mb-4">
            1.3.1 Key Components of an Energy Transition Program:
          </h4>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base mb-8">
            <li>
              <strong className="text-[#032e42]">Renewable Energy Deployment:</strong> We promote investments in solar, wind, hydro, geothermal, and biomass power generation.
            </li>
            <li>
              <strong className="text-[#032e42]">Energy Efficiency Improvements:</strong> We promote the reduction of energy consumption across various sectors, such as buildings, industry, and transportation.
            </li>
            <li>
              <strong className="text-[#032e42]">Decarbonization of Key Sectors:</strong> We promote transitioning electricity generation, transportation, and industrial processes away from fossil fuels as a central goal.
            </li>
            <li>
              <strong className="text-[#032e42]">Just Transition:</strong> We recognise that the transition can affect workers and communities in fossil fuel industries, programs often include measures to support affected individuals and regions.
            </li>
            <li>
              <strong className="text-[#032e42]">Policy and Regulatory Frameworks:</strong> We support governments in playing a crucial role in creating supportive policies, regulations, and incentives that encourage the transition.
            </li>
            <li>
              <strong className="text-[#032e42]">Financing and Investment:</strong> We seek to secure funding for renewable energy projects and energy efficiency improvements is essential.
            </li>
            <li>
              <strong className="text-[#032e42]">Technology Development:</strong> We promote investments in innovative energy technologies, like energy storage and green hydrogen, can accelerate the transition.
            </li>
            <li>
              <strong className="text-[#032e42]">International Collaboration:</strong> We partner and cooperate in sharing best practices and accelerating global progress.
            </li>
          </ul>

          <h4 className="text-base font-bold text-[#032e42] mb-4">
            1.3.2 Why Do We Focus on Energy Transition?
          </h4>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base mb-8">
            <li>
              <strong className="text-[#032e42]">Reduced greenhouse gas emissions:</strong> Transitioning to cleaner energy sources is a crucial step in combating climate change.
            </li>
            <li>
              <strong className="text-[#032e42]">Improved air quality:</strong> Reducing reliance on fossil fuels can significantly improve air quality, particularly in urban areas.
            </li>
            <li>
              <strong className="text-[#032e42]">Increased energy security:</strong> Diversifying energy sources can reduce dependence on imported fossil fuels and make energy systems more resilient.
            </li>
            <li>
              <strong className="text-[#032e42]">Economic growth and job creation:</strong> The energy transition can create new industries and jobs in the renewable energy sector.
            </li>
            <li>
              <strong className="text-[#032e42]">Improved public health:</strong> Reduced air pollution and access to cleaner energy sources can improve public health.
            </li>
          </ul>

          <h4 className="text-base font-bold text-[#032e42] mb-4">
            1.4 Components of The Energy Transition Programme
          </h4>
          <ul className="space-y-3 list-disc pl-5 text-sm md:text-base">
            <li>
              <strong className="text-[#032e42]">Renewable Energy Sources:</strong> This involves the implementation of technologies like solar, wind, hydro, geothermal, and biomass to generate clean energy.
            </li>
            <li>
              <strong className="text-[#032e42]">Energy Efficiency:</strong> Improving the efficiency of energy use in various sectors, including buildings, industries, transportation, and appliances, is crucial for reducing overall energy demand and emissions.
            </li>
            <li>
              <strong className="text-[#032e42]">Electrification:</strong> Replacing fossil fuel-based technologies with electric alternatives in sectors like transportation and heating, often powered by renewable energy, is a key component.
            </li>
            <li>
              <strong className="text-[#032e42]">Smart Grids and Digitalization:</strong> Utilizing smart grids and digital technologies to monitor, control, and manage energy systems effectively, facilitating renewable energy integration and grid stability.
            </li>
            <li>
              <strong className="text-[#032e42]">Capacity Building and Collaboration:</strong> Developing human capacity in renewable energy technologies and promoting collaboration between the private sector and governments to support renewable energy projects.
            </li>
            <li>
              <strong className="text-[#032e42]">Just Transition:</strong> Ensuring that the transition to a low-carbon economy is fair and equitable, addressing potential social and economic impacts and creating opportunities for all.
            </li>
            <li>
              <strong className="text-[#032e42]">Financing and Investment:</strong> Attracting public and private investment in renewable energy projects and creating an enabling environment for financing innovative energy solutions.
            </li>
            <li>
              <strong className="text-[#032e42]">Policy and Regulatory Framework:</strong> Establishing a supportive policy and regulatory framework to encourage renewable energy deployment, energy efficiency, and electrification.
            </li>
          </ul>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Energy;
