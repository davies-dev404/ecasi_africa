import { Heart, Globe2, BookOpen, Lightbulb, Users, Leaf, Zap, ShieldCheck, Star, Compass, GraduationCap, ArrowRight, Target } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: Heart,
    title: "Healing",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    description: "We believe that sustainable development heals communities. Our work addresses root environmental and socioeconomic causes of vulnerability, contributing to resilient, thriving societies across Africa.",
  },
  {
    icon: Lightbulb,
    title: "Optimism",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    description: "We approach Africa's development challenges with hope and a solutions-oriented mindset. We believe in Africa's capacity to leapfrog into a green, inclusive, and prosperous future.",
  },
  {
    icon: ShieldCheck,
    title: "Professionalism",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    description: "Our commitment to professionalism is unwavering. We uphold the highest ethical standards, maintain rigorous research integrity, and treat every stakeholder with respect, transparency, and accountability.",
  },
  {
    icon: Star,
    title: "Excellence",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    description: "Excellence is not just a goal — it is our standard. We relentlessly pursue quality in research, policy advisory, and technical assistance, continuously innovating to better serve Africa's development agenda.",
  },
];

const milestones = [
  { year: "2016", event: "ECAS Institute (ECASI) founded with a mandate to advance sustainable development in Africa" },
  { year: "2018", event: "Launch of flagship climate change policy advisory and green economy research programs" },
  { year: "2020", event: "Expanded operations pan-Africa with new partnerships across East, West, and Southern Africa" },
  { year: "2022", event: "Established the Centre for Research & Innovation in Sustainable Development" },
  { year: "2024", event: "Launched Training, Mentorship & Skilling programme in climate finance and ESG advisory" },
  { year: "2026", event: "ECASI Africa — driving policy, research, and capacity building across the continent" },
];

const programmes = [
  {
    icon: GraduationCap,
    title: "Training, Mentorship & Skilling",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    description: "Comprehensive courses and mentorship in climate change, sustainability policy, green finance, and capacity building for professionals across Africa.",
  },
  {
    icon: Users,
    title: "Consultancy & Business Advisory",
    color: "bg-teal-50 text-teal-600 border-teal-100",
    description: "Integrated consultancy services for governments, development partners, the private sector, and civil society, covering sustainability, ESG, and development strategy.",
  },
  {
    icon: BookOpen,
    title: "Research & Innovation",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    description: "A dedicated center for research and analysis that informs evidence-based policy decisions on climate, environment, health, and sustainable finance.",
  },
  {
    icon: Globe2,
    title: "Policy & Technical Assistance",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    description: "Expert support in policy development, ESG advisory, sustainability programs, and technical assistance to governments and institutions.",
  },
];

const focusAreas = [
  { icon: Leaf, title: "Climate Change & Environmental Policy" },
  { icon: Target, title: "Green Economy & Sustainable Finance" },
  { icon: Zap, title: "Energy Transitions & Clean Tech" },
  { icon: Users, title: "Agriculture & Food Systems" },
  { icon: Heart, title: "Health & Development" },
  { icon: BookOpen, title: "Research, Innovation & Capacity" },
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

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="About Us"
        description="Learn about ECAS Institute (ECASI Africa) — our history, mission, vision, strategic focus, and the values that drive our sustainable development work across Africa."
      />
      <Header />

      {/* Hero Section */}
      <section className="bg-primary pt-28 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 drop-shadow-md">
              About ECASI Africa
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
              An independent Pan-African think-tank advancing sustainable development through research, policy advisory, and capacity building.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Welcome to ECAS Institute */}
      <section className="py-16 md:py-24">
        <div className="healthcare-container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
                <Compass className="h-4 w-4" />
                <span>Our Profile</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-6 leading-tight">
                Welcome to ECAS Institute
              </h2>
              <div className="space-y-4 text-slate-600 text-base md:text-lg leading-relaxed">
                <p>
                  ECAS Institute (ECASI Africa) is a leading pan-African think-tank and development organisation dedicated
                  to advancing sustainable development across the continent. We work at the intersection of policy,
                  research, and practice — providing evidence-based solutions to Africa&apos;s most pressing development challenges.
                </p>
                <motion.div 
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="p-6 bg-slate-50 border-l-4 border-primary rounded-r-xl my-4"
                >
                  <p className="text-slate-800 font-medium">
                    Founded on the belief that Africa&apos;s transformation must be driven by Africans and informed by rigorous
                    evidence, ECASI operates across a wide range of thematic areas including climate change, environmental
                    policy, green economy, sustainable transport, energy transitions, agriculture, health, and sustainable finance.
                  </p>
                </motion.div>
                <p>
                  We work with governments, development partners, the private sector, and civil society, providing
                  integrated services that span research and innovation, policy advisory and technical assistance,
                  consultancy and business advisory, and training, mentorship and skilling.
                </p>
              </div>
            </motion.div>

            {/* Right: Highlights with Icons & Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {[
                {
                  icon: Globe2,
                  label: "Pan-African Reach",
                  value: "East, West & Southern Africa",
                  desc: "Operating across the continent with partners in multiple African nations.",
                  color: "bg-emerald-50/50 border-emerald-100",
                  accent: "text-emerald-700",
                  bg: "bg-emerald-100/50"
                },
                {
                  icon: Leaf,
                  label: "Thematic Areas",
                  value: "6+ Focus Domains",
                  desc: "From climate & energy to health, agriculture, and sustainable finance.",
                  color: "bg-green-50/50 border-green-100",
                  accent: "text-green-700",
                  bg: "bg-green-100/50"
                },
                {
                  icon: BookOpen,
                  label: "Programmes",
                  value: "4 Core Service Lines",
                  desc: "Research, Policy Advisory, Consultancy, and Training & Skilling.",
                  color: "bg-blue-50/50 border-blue-100",
                  accent: "text-blue-700",
                  bg: "bg-blue-100/50"
                },
                {
                  icon: Users,
                  label: "Stakeholders Served",
                  value: "Governments & Private Sector",
                  desc: "Integrated solutions for diverse actors across the development landscape.",
                  color: "bg-purple-50/50 border-purple-100",
                  accent: "text-purple-700",
                  bg: "bg-purple-100/50"
                },
              ].map((item, i) => (
                <motion.div key={i} variants={itemVariants} className={`rounded-[1.5rem] border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white relative overflow-hidden group`}>
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[2rem] opacity-30 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${item.bg}`}></div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm relative z-10 ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.accent}`} />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${item.accent} relative z-10`}>{item.label}</span>
                  <p className="text-slate-800 font-bold text-lg mt-2 mb-2 leading-tight relative z-10">{item.value}</p>
                  <p className="text-slate-600 text-sm leading-relaxed relative z-10">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="healthcare-container max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-50 rounded-[2rem] p-10 md:p-12 border border-slate-100 h-full flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Globe2 className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-6 relative z-10">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed text-lg relative z-10">
                To advance sustainable development in Africa by delivering high-quality research, evidence-based
                policy advisory, technical assistance, and capacity building that empowers governments, institutions,
                the private sector, and civil society to build resilient, inclusive, and green economies.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-50 rounded-[2rem] p-10 md:p-12 border border-slate-100 h-full flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-150"></div>
              <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Leaf className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-6 relative z-10">Our Vision</h2>
              <p className="text-slate-600 leading-relaxed text-lg relative z-10">
                A prosperous, equitable, and environmentally sustainable Africa — where communities thrive,
                ecosystems are protected, and policy is guided by rigorous evidence and inclusive dialogue.
                We envision a continent that leads the global transition to a green, just, and resilient future.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="healthcare-container max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-3">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-5">
              Our Core Values
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              ECASI&apos;s work is anchored in <strong className="text-primary">HOPE</strong> — Healing, Optimism, Professionalism, and Excellence.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${value.color.split(' ')[0]}`}></div>
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-8 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm relative z-10 ${value.color}`}>
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors relative z-10">
                  {value.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 relative z-10">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Specialized Programmes */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="healthcare-container max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-3">How We Work</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-5">
              Our Specialized Programmes
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              We deliver impact through four core programme areas, each designed to build capacity,
              generate evidence, and drive systemic change across Africa.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {programmes.map((prog, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-8 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${prog.color}`}>
                    <prog.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">
                    {prog.title}
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    {prog.description}
                  </p>
                </div>
                <div className="mt-8 pt-5 border-t border-slate-100">
                  <Link to="/our-history" className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all hover:text-primary/80">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Strategic Focus Areas - Compact Grid */}
      <section className="py-20 bg-white">
        <div className="healthcare-container max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-3">What We Work On</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-5">
              Strategic Focus Areas
            </h2>
          </motion.div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {focusAreas.map((area, index) => (
              <motion.div key={index} variants={itemVariants} className="h-full">
                <Link to="/our-strategic-focus" className="block h-full group">
                  <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 group-hover:border-primary/40 group-hover:bg-white group-hover:shadow-md transition-all duration-300 h-full">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
                      <area.icon className="h-5 w-5" />
                    </div>
                    <span className="text-slate-800 font-bold text-sm leading-tight group-hover:text-primary transition-colors">{area.title}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story / History Timeline */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        
        <div className="healthcare-container max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <span className="text-cyan-400 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Our Journey</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              A Decade of Impact
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Since our founding, ECAS Institute has grown into a continent-wide force for
              sustainable development — building partnerships, generating knowledge, and shaping policy across Africa.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-slate-800 rounded-full" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start relative">

                    {/* Timeline Dot */}
                    <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] z-10 mt-6 md:mt-8 border-4 border-slate-900" />

                    {/* Left Side */}
                    <div className={`flex-1 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'hidden md:block'}`}>
                      {index % 2 === 0 && (
                        <div className="group">
                          <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-700 hover:border-cyan-400/50 transition-all duration-300 shadow-xl hover:-translate-y-1">
                            <span className="text-3xl font-serif font-bold text-cyan-400 block mb-3 drop-shadow-md">{milestone.year}</span>
                            <p className="text-slate-300 text-base leading-relaxed">{milestone.event}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className={`flex-1 pl-12 md:pl-0 ${index % 2 !== 0 ? 'md:pl-16 md:text-left' : 'hidden md:block'}`}>
                      {index % 2 !== 0 && (
                        <div className="group">
                          <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-700 hover:border-cyan-400/50 transition-all duration-300 shadow-xl hover:-translate-y-1">
                            <span className="text-3xl font-serif font-bold text-cyan-400 block mb-3 drop-shadow-md">{milestone.year}</span>
                            <p className="text-slate-300 text-base leading-relaxed">{milestone.event}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Card */}
                    <div className="md:hidden pl-12 w-full">
                      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-xl">
                        <span className="text-2xl font-serif font-bold text-cyan-400 block mb-2">{milestone.year}</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{milestone.event}</p>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="healthcare-hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-5">
              Partner With Us
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-10 leading-relaxed">
              Whether you are a government, development partner, private sector organisation, or civil society actor —
              ECASI Africa is ready to work with you toward a sustainable, prosperous Africa.
            </p>
            <Link to="/contact">
              <button className="bg-white text-primary font-bold px-10 py-4 rounded-xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Get in Touch
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
