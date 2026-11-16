import { motion } from 'framer-motion';
import { Train } from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeroBanner from '@/components/PageHeroBanner';

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

const Transport = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Sustainable Transport & E-Mobility"
        description="Our program focuses on sustainable transport and e-mobility in Nairobi, Kenya, and aims to transition towards cleaner, more efficient, and accessible urban transport systems."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <PageHeroBanner
        title="Sustainable Transport & E-Mobility"
        image="/images/beyond/nairobi_expressway.jpg"
        icon={Train}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Programmes', path: '/programmes' },
          { label: 'Sustainable Transport & E-Mobility' },
        ]}
      />

      {/* ── Main Content Area ── */}
      <main className="max-w-4xl mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        
        {/* Introductory Highlight Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-base md:text-lg text-justify text-[#032e42] font-medium mb-10 leading-relaxed border-l-4 border-ecasi-green pl-4"
        >
          Our program focuses on sustainable transport and e-mobility in Nairobi, Kenya, and aims to transition towards cleaner, more efficient, and accessible urban transport systems. This includes promoting electric vehicles, improving public transportation, and enhancing non-motorised transport options like cycling and walking. The program also addresses climate change impacts on infrastructure, ensuring resilience to extreme weather events.
        </motion.p>

        {/* Key Aspects of a Comprehensive Program */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12"
        >
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6">
            Key aspects of a comprehensive program would include:
          </h2>
          
          <ul className="space-y-5 list-disc pl-5 text-sm md:text-base text-justify">
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Infrastructure Development:</strong>
              <span className="ml-1">Investing in charging infrastructure for electric vehicles and upgrading public transport systems with e-buses and other low-emission vehicles.</span>
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Policy and Regulatory Frameworks:</strong>
              <span className="ml-1">Developing and implementing policies that incentivize e-mobility adoption, such as tax breaks, subsidies, and regulations for electric vehicle manufacturing and assembly.</span>
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Public Awareness and Education:</strong>
              <span className="ml-1">Raising awareness about the benefits of sustainable transport and e-mobility through campaigns and educational materials.</span>
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Capacity Building:</strong>
              <span className="ml-1">Providing training and technical assistance for local technicians, engineers, and other stakeholders involved in the e-mobility sector.</span>
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Financial Support and Incentives:</strong>
              <span className="ml-1">Offering financial incentives and subsidies for purchasing electric vehicles and setting up charging stations.</span>
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Collaboration and Partnerships:</strong>
              <span className="ml-1">Building partnerships between government agencies, private sector companies, and non-governmental organizations to ensure a coordinated and effective implementation of the program.</span>
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong className="text-[#032e42]">Monitoring and Evaluation:</strong>
              <span className="ml-1">Regularly monitoring the program’s progress and effectiveness, and making adjustments as needed to ensure it achieves its goals.</span>
            </motion.li>
          </ul>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Transport;
