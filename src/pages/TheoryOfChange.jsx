import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Network, Database, Award, BookOpen, Coins, Users, Sparkles, Target, Compass, Globe, Map } from 'lucide-react';

const leavers = [
  {
    title: "Supporting Changemakers",
    description: "We establish and support partnerships that help individuals and organizations achieve their objectives in strengthening enabling policies and data ecosystems.",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    title: "Creating Incentives",
    description: "We use our communications and advocacy expertise to provide visibility to leaders in the field, create mechanisms for engagement and build coalitions for change to promote innovation and investment in research and capacity building.",
    icon: Sparkles,
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    title: "Developing Learning",
    description: "We share, and aggregate, so all partners can learn and show what can be done, and how to do it.",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
];

const contributions = [
  {
    name: "Data",
    description: "Refers to a variety and types of data and data sets that enable evidence-based climate action and policymaking.",
    icon: Database,
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    name: "Skills",
    description: "Refers to technical expertise on tools, methodologies, and systems that build robust capacity for environmental planning.",
    icon: Award,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    name: "Knowledge",
    description: "Refers to information in a variety of forms (policy papers, webinars, discussions, seminars, websites, conferences) that support individual and collective learning.",
    icon: Compass,
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    name: "Resources",
    description: "Refers primarily to financial investments but also includes time and personnel investments committed to a defined goal and objective.",
    icon: Coins,
    color: "bg-green-50 text-green-600 border-green-100",
  },
];

const stakeholders = [
  {
    title: "Governments",
    description: "National and county governments indicate their receptiveness to be influenced by data and base decisions on evidence through engagement. As primary stakeholders, they hold regulatory power and deliver on development priorities.",
  },
  {
    title: "Private Sector",
    description: "Entities indicate commitment to double or triple bottom lines by engaging with the Institute. They collect and hold private climate, energy, and environmental data, providing unique developmental insights.",
  },
  {
    title: "Civil Society",
    description: "Organizations express citizen interests through independent data production and lobby for issue-specific data generation, transparency, and accountability.",
  },
  {
    title: "Academia & Research",
    description: "Organizations generate and own data for development knowledge. They foster innovation and have the capacity to test robust methodologies and tools that can be applied to monitoring sustainable development targets.",
  },
  {
    title: "Donors & Partners",
    description: "Provide resources to support the operationalization of data for development, aligning funding with active sustainable development goals and initiatives.",
  },
];

const geoLevels = [
  {
    level: "National",
    description: "Activities address sector-specific data gaps and needs that contribute to strengthening of the national level data ecosystem. Aligned to national priorities using multi-stakeholder approaches.",
    icon: Map,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    level: "Regional",
    description: "Our activities address institutionalization and knowledge sharing across peers, regional bodies, and Pan-African networks.",
    icon: Globe,
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    level: "Global",
    description: "Our activities address influencing models of engagement and priority areas for knowledge building, coalition building, and international policy input.",
    icon: Network,
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
];

const networks = [
  {
    title: "Broad",
    description: "Comprising institutions from different sectors and regions, and a mix of data producers and users, large and small players.",
  },
  {
    title: "Engaged",
    description: "Finding value in their relationship with us and prepared to invest time and resources in it to achieve common objectives.",
  },
  {
    title: "Open",
    description: "Willing to engage with our partners, collaborators, and supporters to overcome challenges and drive progress.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const TheoryOfChange = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Theory of Change"
        description="Explore ECAS Institute's Theory of Change - a collaborative framework detailing our strategic impact pathways, contributions, and leavers of change for a greener Africa."
      />
      <Header />

      {/* Page Banner */}
      <section className="bg-primary pt-28 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 drop-shadow-md">
              Theory of Change
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
              Our roadmap for co-creating a sustainable, greener, and safer future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="healthcare-container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex justify-center mb-6 relative z-10">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"
              >
                <Target className="h-8 w-8" />
              </motion.div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-8 relative z-10">
              Our Strategic Impact Framework
            </h2>

            <div className="space-y-6 text-slate-600 text-base md:text-lg leading-relaxed relative z-10 text-left">
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                Our theory of change describes the impact that we wish to see in the world and our understanding of how we will contribute towards a greener, safe and secure world. It is a framework that we have developed in collaboration with our experts and partners to measure the impact of our interventions when it comes to capacity building, research, policy dialogues and advisory services.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                We use the Theory of Change to evaluate and assess the likelihood that an intervention will lead to impact. We define impact as a long-lasting result arising directly or indirectly from an activity or a project. Impacts are intended and positive changes and must relate to ECAS Institute’s mandate.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="font-medium p-6 bg-slate-50 border-l-4 border-primary rounded-r-xl">
                The Institute’s ToC is based on the fundamental logic that change is dynamic and non-linear, the change pathways from outputs to outcomes are dependent on a combination of mutually reinforcing and sometimes overlapping activities categorized as leavers of change (training, research and advisory services) and our contributions to partners skills, data, knowledge and resources.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leavers of Change */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="healthcare-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4">
              Leavers of Change
            </h2>
            <p className="text-slate-500 text-lg">
              Key strategic vectors we deploy to catalyze sustainable advancements.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {leavers.map((leaver, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 md:p-10 h-full flex flex-col items-center text-center group hover:shadow-xl hover:border-primary/20 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${leaver.color.split(' ')[0]} opacity-50`}></div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${leaver.color}`}>
                  <leaver.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">
                  {leaver.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {leaver.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contributions to Partners */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="healthcare-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4">
              Our Contributions
            </h2>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed">
              The effectiveness of our networks is defined by the partners and their engagement. As an institute, we facilitate and connect the demand and supply of critical assets to strengthen ecosystems.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {contributions.map((item, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white border border-slate-100 rounded-[1.5rem] p-8 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stakeholders & Geographical levels */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="healthcare-container max-w-6xl mx-auto">
          
          {/* Stakeholders */}
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-24">
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
                  <Users className="h-4 w-4" />
                  <span>Coalitions</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-6 leading-tight">
                  Our Stakeholder Groups
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  How we engage and collaborate with various actors to stimulate localized ownership and sustainable impact.
                  Each group provides a unique role in our theories of change.
                </p>
              </motion.div>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-8 space-y-6"
            >
              {stakeholders.map((s, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="bg-slate-50 rounded-[1.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md hover:bg-white hover:border-primary/20 transition-all duration-300"
                >
                  <h3 className="text-lg md:text-xl font-serif font-bold text-slate-800 mb-3 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {s.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed pl-5">
                    {s.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Geographical Levels */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4">
              Geographical Levels of Change
            </h2>
            <p className="text-slate-500 text-lg">
              Aligning actions from local environments to regional structures and global networks.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {geoLevels.map((geo, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white border border-slate-100 shadow-lg shadow-slate-200/50 rounded-[2rem] p-8 h-full flex flex-col group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${geo.color.split(' ')[0]}`}></div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ${geo.color}`}>
                  <geo.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">
                  {geo.level} Level
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed relative z-10">
                  {geo.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Our Networks */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our Networks
            </h2>
            <p className="text-white/80 text-lg">
              To achieve true scalable success, our networks and coalitions operate under three core principles.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {networks.map((network, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-8 text-center hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 shadow-xl"
              >
                <h3 className="text-2xl font-serif font-bold mb-4 drop-shadow-sm">
                  {network.title}
                </h3>
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  {network.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TheoryOfChange;
