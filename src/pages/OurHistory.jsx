import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, Globe2, Target, BookOpen, Users, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

const highlights = [
  { icon: CalendarDays, label: "Established", value: "2016", color: "text-blue-500 bg-blue-50" },
  { icon: Globe2,       label: "Reach",        value: "8+ African Countries", color: "text-green-600 bg-green-50" },
  { icon: Users,        label: "Trained",       value: "5,000+ Professionals", color: "text-purple-500 bg-purple-50" },
  { icon: Target,       label: "Type",          value: "Pan-African Think-Tank", color: "text-orange-500 bg-orange-50" },
];

const thematicAreas = [
  { icon: Globe2,   label: "Climate Change & Environmental Policy" },
  { icon: Target,   label: "Green Economy & Sustainable Finance" },
  { icon: BookOpen, label: "Sustainable Transport & Energy Transition" },
  { icon: Users,    label: "Agriculture & Food Security" },
  { icon: CheckCircle2, label: "Health & Development" },
  { icon: MapPin,   label: "Research, Innovation & Capacity Building" },
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

const OurHistory = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Welcome to ECAS Institute"
        description="The Environmental Capacity and Sustainability Institute (ECAS Institute) is a Pan-African policy think-tank established in 2016 to help bridge the triple nexus between research, policy and practice."
      />
      <Header />

      {/* Hero Banner */}
      <section className="bg-primary pt-28 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 drop-shadow-md">
              Welcome to ECAS Institute
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
              An independent Pan-African policy think-tank bridging research, policy and practice since 2016.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlight Stats Cards */}
      <section className="bg-white border-b border-slate-200">
        <div className="healthcare-container py-0">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-0"
          >
            {highlights.map((h, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="flex flex-col items-center text-center p-6 md:p-8 border-r last:border-r-0 border-slate-100 group hover:bg-slate-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm ${h.color}`}>
                  <h.icon className="h-6 w-6" />
                </div>
                <p className="font-bold text-slate-800 text-lg md:text-xl leading-tight mb-1">{h.value}</p>
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{h.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="healthcare-container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_360px] gap-12 xl:gap-16 items-start">

            {/* Article */}
            <motion.article 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <figure className="mb-10 rounded-[1.5rem] overflow-hidden shadow-xl group">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                  src="https://ecasiafrica.org/wp-content/uploads/2026/05/1729710108119.jpg"
                  alt="ECAS Institute — Pan-African Policy Think-tank"
                  className="w-full object-cover"
                  style={{ maxHeight: '460px' }}
                />
              </figure>

              <p className="text-base text-slate-500 italic mb-1 font-medium">Dear Partners and Stakeholders,</p>
              <p className="text-base text-slate-500 italic mb-8 font-medium">I am delighted to present to you ECAS Institute.</p>

              <div className="space-y-6 text-base md:text-lg text-slate-600 leading-relaxed">
                <div className="p-6 bg-slate-50 border-l-4 border-primary rounded-r-xl">
                  <p className="text-slate-800 font-semibold leading-relaxed">
                    The Environmental Capacity and Sustainability Institute (ECAS Institute) is a Pan-African
                    policy think-tank established in 2016 to help bridge the triple nexus between research,
                    policy, and practice.
                  </p>
                </div>
                <p>
                  Our work at ECAS is driven by a strong belief in the research-policy and practice nexus —
                  a dynamic, interconnected relationship where empirical evidence informs policy-making and
                  implementation, aiming for effective environmental, social, and governance solutions. We
                  focus on aligning research with policy needs, translating complex findings into actionable
                  recommendations, and implementing solutions on the ground.
                </p>
                <p>
                  ECAS Institute works across a wide range of thematic areas including climate change,
                  environmental policy, green economy, sustainable transport, energy transitions, agriculture,
                  health, and sustainable finance — providing integrated research, advisory, consultancy, and
                  capacity building services to governments, development partners, the private sector, and
                  civil society across Africa and beyond.
                </p>
                <p>
                  Over the years, ECAS has trained thousands of professionals on climate solutions,
                  sustainability, and founding leaders, and contributed research, policy advisory and
                  consultancy services that drive evidence-based solutions and sustainable impact across Africa.
                </p>
                <p>
                  We serve as an independent voice for communities, advancing evidence-based development and
                  policy solutions based on sound research. We are committed to building an Africa where
                  resilience, equity, and environmental stewardship go hand in hand with economic growth
                  and human flourishing.
                </p>
                <p className="font-medium text-slate-700">We look forward to working with you in building a more resilient, inclusive, and prosperous Africa.</p>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-primary font-bold text-lg">JO</span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Warm regards,</p>
                  <p className="text-slate-800 font-bold text-xl font-serif">ECAS Institute Leadership</p>
                  <p className="text-slate-500 text-xs mt-1">Environmental Capacity and Sustainability Institute</p>
                </div>
              </div>
            </motion.article>

            {/* Sidebar */}
            <motion.aside 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 lg:sticky lg:top-28"
            >

              {/* Quick Facts Card */}
              <div className="bg-primary rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none"></div>
                <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                  About ECAS Institute
                </h3>
                <ul className="space-y-4 relative z-10">
                  {[
                    { k: "Founded", v: "2016" },
                    { k: "Type", v: "Pan-African Policy Think-Tank" },
                    { k: "HQ", v: "Nairobi, Kenya" },
                    { k: "Coverage", v: "East, West & Southern Africa" },
                    { k: "Approach", v: "Research · Policy · Practice" },
                  ].map(({ k, v }) => (
                    <li key={k} className="flex flex-col gap-1 border-b border-white/15 pb-3 last:border-0 last:pb-0">
                      <span className="text-white/70 font-semibold text-xs uppercase tracking-wider">{k}</span>
                      <span className="text-white font-medium">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Thematic Areas Card */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
                  Thematic Focus Areas
                </h3>
                <ul className="space-y-4">
                  {thematicAreas.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-4 text-sm text-slate-600 font-medium group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Icon className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="group-hover:text-slate-900 transition-colors">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Card */}
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-lg font-bold text-slate-800 mb-3">Partner With ECASI</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Ready to collaborate on sustainable development across Africa?
                </p>
                <Link to="/contact" className="block">
                  <Button className="w-full gap-2 rounded-xl h-12 text-sm font-bold shadow-md hover:shadow-lg transition-all">
                    Get in Touch <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/about" className="block mt-3">
                  <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-bold border-slate-300 text-slate-700 hover:bg-slate-100 transition-all">
                    More About ECASI
                  </Button>
                </Link>
              </div>

            </motion.aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurHistory;
