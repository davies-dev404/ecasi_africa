import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Target, Users, Leaf, Zap, BookOpen, ShieldCheck, Milestone } from 'lucide-react';

const focusAreas = [
  {
    icon: Leaf,
    title: "Climate Change & Environmental Policy",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    description: "Providing evidence-based analysis, training, and advisory services on climate adaptation, mitigation strategies, and environmental governance across Africa.",
  },
  {
    icon: Target,
    title: "Green Economy & Sustainable Finance",
    color: "bg-green-50 text-green-600 border-green-100",
    description: "Advancing the transition to green economies through policy research, capacity development, and financial mechanism design that promotes inclusive growth.",
  },
  {
    icon: Zap,
    title: "Energy Transition & Clean Technologies",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    description: "Supporting Africa's shift to renewable energy through research, stakeholder engagement, and policy advisory services that accelerate just energy transitions.",
  },
  {
    icon: BookOpen,
    title: "Research, Policy & Practice Nexus",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    description: "Generating rigorous evidence and translating complex research findings into actionable policy recommendations that drive on-the-ground impact.",
  },
  {
    icon: Users,
    title: "Capacity Strengthening & Skilling",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    description: "Building the skills and institutional capacity of African researchers, policymakers, and practitioners through targeted training and mentorship programmes.",
  },
  {
    icon: ShieldCheck,
    title: "Governance & Institutional Development",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    description: "Supporting strong leadership, transparent governance structures, and institutional systems that enable sustainable development at national and continental scale.",
  },
];

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

const OurStrategicFocus = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Our Strategic Focus"
        description="ECAS Institute works to bridge the gaps between research, policy and practice by enabling use of data and relevant expertise in decision-making aimed at addressing various development challenges, particularly those pertaining to climate change and sustainable development."
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
              Our Strategic Focus
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center font-medium">
              Mapping our pathways to build a resilient, green, and sustainable Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-12 md:py-16">
        <div className="healthcare-container">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* Image from ECASI website */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                  src="/images/programmes/tana_river.png"
                  alt="ECAS Institute Strategic Focus"
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '560px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90" />
                <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white mb-3 border border-white/30 shadow-sm">
                    ECAS Think-Tank
                  </span>
                  <h3 className="text-2xl font-serif font-bold leading-tight text-white drop-shadow-md">
                    Driving Evidence-Based Transformation
                  </h3>
                </div>
              </div>
            </motion.div>

            {/* Overview text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full">
                <Milestone className="h-4 w-4" />
                <span>Overview</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 leading-tight">
                Bridging Research, Policy & Practice
              </h2>

              <div className="space-y-5 text-slate-600 leading-relaxed text-base">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-2xl"
                >
                  <p className="text-slate-800 font-semibold text-lg leading-relaxed">
                    Progress has been significant in Africa&apos;s capacity development over the past 30 plus
                    years. Even so, capacity deficits remain a significant challenge facing African
                    researchers, policy makers and practitioners in their quest for sustainable
                    development.
                  </p>
                </motion.div>

                <p>
                  These deficits continue to prevent the many players in the continent
                  from implementing development strategies and policies effectively. ECAS&apos;s recent
                  engagement with a broad cross-section of governments, private sector, civil society,
                  and development partners show that capacity constraints remain the main barrier to
                  the continent&apos;s sustainable transformation.
                </p>

                <p>
                  ECAS Institute works to bridge the gaps between research, policy and practice by
                  enabling use of data and relevant expertise in decision-making aimed at addressing
                  various development challenges, particularly those pertaining to climate change and
                  sustainable development and capacity strengthening in Africa. We take pride in being
                  a Pan-African Think-Tank.
                </p>

                <p>
                  As an African-led institution, we believe that strong leadership, technical expertise
                  and political commitment is critical to addressing the continent&apos;s sustainable
                  development challenges and harnessing its vast opportunities for transformation.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Strategic Focus Areas */}
      <section className="py-12 md:py-16 bg-white">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-3">
              Key Domains
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-5">
              Our Strategic Focus Areas
            </h2>
            <p className="text-slate-500 text-lg">
              Six interconnected themes guide ECASI&apos;s research, advisory, and capacity
              building work across Africa.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {focusAreas.map((area, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                {/* Background decorative element */}
                <div className={`absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${area.color.split(' ')[0]}`}></div>

                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-8 flex-shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm ${area.color}`}>
                  <area.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors leading-tight">
                  {area.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 relative z-10">
                  {area.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Inline CTA strip */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl px-6 py-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "18px 18px" }} />
            <div className="relative z-10">
              <p className="text-white font-bold text-sm">Work With ECAS Institute</p>
              <p className="text-white/70 text-xs">Engage with us on research, advisory &amp; capacity strengthening.</p>
            </div>
            <Link to="/contact" className="flex-shrink-0 relative z-10">
              <button className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold px-5 py-2 rounded-lg hover:bg-white hover:text-slate-900 transition-all shadow-md text-xs">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurStrategicFocus;
