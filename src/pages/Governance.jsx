import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Users, FileText, Briefcase, Landmark, ShieldCheck, ArrowRight } from 'lucide-react';

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
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const Governance = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Governance"
        description="Learn about the governance structure, operational oversight, and institutional frameworks of the Environmental Capacity and Sustainability Institute (ECAS Institute)."
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
              Governance
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center font-medium">
              Providing strategic oversight and institutional compliance to execute our mission to the highest standard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 md:py-24">
        <div className="healthcare-container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
                  <Landmark className="h-4 w-4" />
                  <span>Institutional Framework</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-6 leading-tight">
                  Our Governance Structure
                </h2>
                <div className="space-y-4 text-slate-600 text-base md:text-lg leading-relaxed">
                  <p>
                    The primary mandate of our governance structure is to provide strategic oversight and ensure the Institute functions to the highest ethical and professional standards to execute its mission.
                  </p>
                  <p>
                    Governance at ECAS Institute is distributed across the Governing Council, the Executive Secretariat, and compliance monitoring teams operating under a unified set of policies, processes, and systems.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:col-span-6">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem] pointer-events-none"></div>
                
                <h3 className="text-2xl font-serif font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  Key Objectives
                </h3>
                
                <ul className="space-y-6">
                  <motion.li 
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                    className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Transparency:</strong> Openness in financial reporting, project execution, and stakeholder communication.
                    </p>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                    className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Compliance:</strong> Strict adherence to the laws, environmental regulations, and constitutional provisions of Kenya.
                    </p>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
                    className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Accountability:</strong> Clear delegation of duties from the Governing Council down to the secretariat teams.
                    </p>
                  </motion.li>
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Pillars Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8 mt-24"
          >
            {/* Pillar 1: Governing Council */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] p-8 h-full flex flex-col justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50 pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">Governing Council</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  Our council consists of distinguished international leaders and academic fellows providing macro guidance, audit approvals, and policy oversight.
                </p>
              </div>
              <Link
                to="/governing-council"
                className="inline-flex items-center justify-between w-full p-4 bg-slate-50 rounded-xl text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors mt-auto relative z-10 group/btn"
              >
                <span>Meet Governing Council</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Pillar 2: Secretariat & Teams */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] p-8 h-full flex flex-col justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">Secretariat Team</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  Led by the CEO, the Secretariat executes daily programmatic actions, research partnerships, training sessions, and community interventions.
                </p>
              </div>
              <Link
                to="/our-team"
                className="inline-flex items-center justify-between w-full p-4 bg-slate-50 rounded-xl text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors mt-auto relative z-10 group/btn"
              >
                <span>Meet Secretariat Team</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Pillar 3: Policies & Compliance */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] p-8 h-full flex flex-col justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full opacity-50 pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">Policies & Compliance</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  Governed by our official constitution and standard operating guidelines on procurement, anti-corruption, and whistleblower protections.
                </p>
              </div>
              <Link
                to="/our-policies"
                className="inline-flex items-center justify-between w-full p-4 bg-slate-50 rounded-xl text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors mt-auto relative z-10 group/btn"
              >
                <span>View Our Policies</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Governance;
