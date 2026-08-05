import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Wind, Zap, Leaf, Truck, Recycle, TreePine, Globe, 
  ArrowRight, ShieldAlert, GraduationCap, Brain, Compass
} from 'lucide-react';

const coreProgrammes = [
  {
    icon: Wind,
    title: "Air Quality Programme",
    description: "Addressing the growing challenges of urban air pollution through monitoring, policy recommendations, and technical assistance.",
    path: "/specialties/clean-air-programme",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    icon: Zap,
    title: "Renewable Energy and Just Transition",
    description: "Accelerating clean energy access and supporting African nations in designing transition strategies that are fair and inclusive.",
    path: "/specialties/energy",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    icon: Leaf,
    title: "Agriculture and Food Systems",
    description: "Promoting climate-smart agricultural practices, enhancing food security, and developing resilient supply chains across the continent.",
    path: "/specialties/sustainable-agriculture-and-food-systems",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    icon: Truck,
    title: "Sustainable Transport & E-Mobility",
    description: "Supporting the transition to low-carbon transportation, e-mobility integration, and sustainable urban transit planning.",
    path: "/specialties/transport",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: Recycle,
    title: "Waste & Circular Economy",
    description: "Advancing circularity principles, waste resource recovery systems, and sustainable materials management frameworks.",
    path: "/specialties/waste-and-circular-economy",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
];

const climateActionProgrammes = [
  {
    title: "Training, Education & Public Awareness",
    path: "/training-education-public-awareness"
  },
  {
    title: "Research and Systematic Observation",
    path: "/research-systematic-observation"
  },
  {
    title: "Creation of an Enabling Environment",
    path: "/creation-enabling-environment"
  },
  {
    title: "Adaptation & Mitigation Assessments",
    path: "/adaptation-mitigation-assessments"
  },
  {
    title: "GHG Inventories",
    path: "/ghg-inventories"
  },
  {
    title: "Institutional Capacity-Building and Reskilling",
    path: "/institutional-capacity-building"
  },
  {
    title: "Integrated Programming for Climate Change",
    path: "/climate-change-programming"
  },
  {
    title: "National Communications",
    path: "/national-communications"
  }
];

const naturalResourceProgrammes = [
  {
    icon: TreePine,
    title: "Forests, Biodiversity & Ecosystems",
    path: "/specialties/forests",
  },
  {
    icon: Compass,
    title: "Sustainable Mining & Extractives",
    path: "/specialties/mining-extractives",
  },
  {
    icon: Globe,
    title: "Environment, Migration & Mobility",
    path: "/specialties/security-migration",
  },
  {
    icon: Compass,
    title: "Fresh Water Programme",
    path: "/specialties/water",
  },
  {
    icon: Wind,
    title: "Oceans & Marine Programme",
    path: "/specialties/oceans-marine",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const Programmes = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Our Programmes"
        description="Explore the specialized programmes of ECAS Institute, spanning Air Quality, Renewable Energy, Sustainable Agriculture, Circular Economy, Climate Change Action, and Natural Resources Management."
      />
      <Header />

      {/* Page Banner */}
      <section className="bg-primary pt-24 pb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 drop-shadow-md">
              Our Programmes
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center font-medium">
              Shaping policies, enhancing capacities, and delivering sustainable development solutions across Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Specialties Section */}
      <section className="py-16 md:py-24">
        <div className="healthcare-container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Core Service Areas</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800">
              Specialized Programmes
            </h2>
            <div className="w-16 h-1 bg-ecasi-green mx-auto mt-4 rounded" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {coreProgrammes.map((prog, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${prog.color}`}>
                    <prog.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                    {prog.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {prog.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <Link to={prog.path} className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all hover:text-primary/80">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Climate Change Action Sub-programmes */}
      <section className="py-16 md:py-20 bg-slate-50 border-y border-slate-100">
        <div className="healthcare-container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Technical Delivery</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800">
              Climate Change Action Areas
            </h2>
            <div className="w-16 h-1 bg-ecasi-green mx-auto mt-4 rounded" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {climateActionProgrammes.map((sub, sIdx) => (
              <motion.div 
                key={sIdx}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between group"
              >
                <h4 className="font-semibold text-slate-800 text-sm mb-4 leading-snug group-hover:text-primary transition-colors">
                  {sub.title}
                </h4>
                <Link to={sub.path} className="text-primary text-xs font-bold flex items-center gap-1.5 hover:text-primary/80">
                  View Focus <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Natural Resources Management Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="healthcare-container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Ecosystem Governance</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800">
              Natural Resources Management
            </h2>
            <div className="w-16 h-1 bg-ecasi-green mx-auto mt-4 rounded" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center"
          >
            {naturalResourceProgrammes.map((sub, sIdx) => (
              <motion.div 
                key={sIdx}
                variants={itemVariants}
                className="bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <sub.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base mb-3 leading-snug group-hover:text-primary transition-colors">
                    {sub.title}
                  </h4>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/50">
                  <Link to={sub.path} className="text-primary text-xs font-bold flex items-center gap-1.5 hover:text-primary/80">
                    Learn More <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programmes;
