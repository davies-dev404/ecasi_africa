import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  BarChart3, Search, FileText, Scale, ShieldCheck,
  Target, Database, GitCompareArrows, TrendingUp, CheckCircle2,
  Lightbulb, ArrowRight, Users, Globe, BookOpen,
  ClipboardCheck, ChevronRight, Sparkles, LayoutDashboard
} from 'lucide-react';

/* ── Framer Motion Variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

/* ── Data ── */
const whatItInvolves = [
  {
    icon: Search,
    title: 'Analyzing Existing Policies',
    description: 'Examining how policies were created, their intended and unintended consequences, and their effectiveness in achieving their goals.',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    icon: FileText,
    title: 'Developing New Policies',
    description: 'Identifying problems, exploring potential solutions, and designing policies that are likely to be effective and equitable.',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    icon: ClipboardCheck,
    title: 'Evaluating Policy Proposals',
    description: 'Assessing the potential impact of proposed policies, considering their costs and benefits, and identifying potential risks and challenges.',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-200',
  },
  {
    icon: Users,
    title: 'Advocacy',
    description: 'Informing advocacy efforts by providing evidence-based arguments and recommendations to influence policy decisions.',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
];

const keyAspects = [
  {
    icon: Target,
    title: 'Identifying Problems',
    description: 'Clearly defining the issue that the policy aims to address.',
  },
  {
    icon: Database,
    title: 'Gathering Evidence',
    description: 'Collecting data and information to support the analysis.',
  },
  {
    icon: GitCompareArrows,
    title: 'Evaluating Alternatives',
    description: 'Comparing different policy options and their potential outcomes.',
  },
  {
    icon: TrendingUp,
    title: 'Assessing Impact',
    description: 'Predicting the consequences of implementing a policy.',
  },
  {
    icon: LayoutDashboard,
    title: 'Developing Criteria',
    description: 'Establishing criteria for evaluating the effectiveness and efficiency of policies.',
  },
];

const benefits = [
  {
    icon: CheckCircle2,
    title: 'Improved Policy Outcomes',
    description: 'By providing evidence-based insights, policy analysis can help ensure that policies are well-designed and effectively address the problems they aim to solve.',
    stat: '95%',
    statLabel: 'Effectiveness',
  },
  {
    icon: Sparkles,
    title: 'Increased Efficiency',
    description: 'By identifying the most effective and efficient policy options, policy analysis can help reduce costs and maximize benefits.',
    stat: '40%',
    statLabel: 'Cost Reduction',
  },
  {
    icon: ShieldCheck,
    title: 'Enhanced Accountability',
    description: 'By evaluating the performance of policies, policy analysis can help hold policymakers and government agencies accountable for their actions.',
    stat: '100%',
    statLabel: 'Transparency',
  },
  {
    icon: Lightbulb,
    title: 'Better Decision-Making',
    description: 'By providing a clear understanding of the issues and potential solutions, policy analysis can help inform better decision-making at all levels of government.',
    stat: '3x',
    statLabel: 'Better Decisions',
  },
];

const relatedServices = [
  { title: 'Baseline Study', path: '/research/baseline-study', icon: BookOpen },
  { title: 'Policy Reviews & Assessments', path: '/research/policy-reviews-and-assessments', icon: FileText },
  { title: 'Environmental Audits', path: '/research/environmental-audits', icon: ClipboardCheck },
  { title: 'Strategic Environmental Assessments', path: '/research/strategic-environmental-assessments-sea-2', icon: Globe },
];

/* ── Component ── */
const PolicyAnalysis = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Policy Analysis"
        description="Our Policy Analysis service involves providing expert advice and guidance on understanding, developing, and evaluating public policies across social welfare, economics, and the environment."
      />
      <Header />

      {/* ── Hero Banner ── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006400] via-[#008000] to-[#20b2aa]" />
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Floating circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-sm" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white/5 blur-sm" />

        <div className="max-w-[1200px] mx-auto px-4 lg:px-16 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 drop-shadow-lg"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
            >
              Policy Analysis
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-white/85 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              Expert advice and guidance on understanding, developing, and evaluating public policies
              across social welfare, economics, and the environment.
            </motion.p>

            {/* Breadcrumbs */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 text-white/70 text-sm">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/specialties" className="text-white/80 hover:text-white transition-colors">Research & Consultancy</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Policy Analysis</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Introduction ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={slideInLeft}
              className="flex-1"
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full mb-6">
                <Scale className="h-3.5 w-3.5" />
                Consultancy Service
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Evidence-Based Policy Analysis for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Sustainable Impact
                </span>
              </h2>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6" style={{ fontFamily: "'Roboto', sans-serif" }}>
                Our Policy analysis service involves providing expert advice and guidance on understanding,
                developing, and evaluating public policies. It can involve analyzing existing policies,
                assessing their impact, and proposing new policy options.
              </p>
              <p className="text-slate-600 text-base leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
                This expertise can be applied to various sectors and issues, including social welfare,
                economics, and the environment.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={slideInRight}
              className="flex-1 w-full"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl blur-xl opacity-40" />
                <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                  <img
                    src="https://ecasiafrica.org/wp-content/uploads/2026/05/Group-photo-during-Air-Quality-Training.jpg"
                    alt="ECAS Institute Policy Analysis team during Air Quality Training"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="p-6 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Pan-African Coverage</p>
                        <p className="text-xs text-slate-500">Supporting 15+ countries across the continent</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── What It Involves ── */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-4">
              <FileText className="h-3.5 w-3.5" />
              What It Involves
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-800 mb-4"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
            >
              Our Policy Analysis Approach
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
              We deliver comprehensive policy analysis through four interconnected service areas,
              each designed to drive impactful outcomes.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8"
          >
            {whatItInvolves.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`group relative bg-white rounded-3xl p-8 border ${item.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                {/* Decorative gradient blob */}
                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${item.color} opacity-[0.06] group-hover:opacity-[0.12] group-hover:scale-125 transition-all duration-500`} />

                <div className="relative z-10">
                  <div className="flex items-start gap-5">
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className={`w-14 h-14 rounded-2xl ${item.bgLight} flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                    </motion.div>
                    <div>
                      <h3
                        className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors"
                        style={{ fontFamily: "'Fira Sans', sans-serif" }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Key Aspects ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left heading */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
              className="lg:w-80 flex-shrink-0"
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-4 py-2 rounded-full mb-4">
                <Target className="h-3.5 w-3.5" />
                Key Aspects
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Core Pillars of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-500">
                  Policy Analysis
                </span>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
                Our structured methodology ensures thorough and actionable policy insights
                that drive real-world outcomes.
              </p>
            </motion.div>

            {/* Right cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={containerVariants}
              className="flex-1 space-y-4"
            >
              {keyAspects.map((aspect, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ x: 8, transition: { duration: 0.2 } }}
                  className="group flex items-center gap-5 bg-slate-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-white rounded-2xl p-5 border border-slate-100 hover:border-violet-200 transition-all duration-300 cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:bg-violet-100 transition-all duration-300">
                    <aspect.icon className="h-6 w-6 text-slate-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 group-hover:text-violet-700 transition-colors text-base" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                      {aspect.title}
                    </h4>
                    <p className="text-slate-500 text-sm" style={{ fontFamily: "'Roboto', sans-serif" }}>
                      {aspect.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '30px 30px'
        }} />

        <div className="max-w-[1200px] mx-auto px-4 lg:px-16 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full mb-4 border border-emerald-400/20">
              <Sparkles className="h-3.5 w-3.5" />
              Why Policy Analysis
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
            >
              Benefits of Policy Analysis Consulting
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-base" style={{ fontFamily: "'Roboto', sans-serif" }}>
              Our evidence-based approach delivers measurable outcomes that transform governance and public policy.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group relative"
              >
                <div className="bg-white/[0.04] backdrop-blur-sm rounded-3xl p-7 border border-white/[0.08] hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all duration-300 h-full flex flex-col">
                  {/* Stat number */}
                  <div className="mb-5">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                      {benefit.stat}
                    </span>
                    <p className="text-emerald-400/60 text-xs font-semibold uppercase tracking-wider mt-1">
                      {benefit.statLabel}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all duration-300">
                    <benefit.icon className="h-6 w-6 text-emerald-400" />
                  </div>

                  <h3 className="font-bold text-white text-base mb-3" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                    {benefit.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed flex-1" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Visual Feature Image ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://ecasiafrica.org/wp-content/uploads/2026/05/DSC_0990-1.jpg"
              alt="ECAS Institute advancing sustainability across Africa"
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                  Shaping Africa's Policy Landscape
                </h3>
                <p className="text-white/80 text-base max-w-xl" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  ECAS Institute's policy analysis expertise spans climate change, environmental governance,
                  sustainable development, and social impact assessments across the African continent.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Related Services ── */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Related Consultancy Services
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-base" style={{ fontFamily: "'Roboto', sans-serif" }}>
              Explore our full range of research and consultancy offerings.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {relatedServices.map((service, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Link
                  to={service.path}
                  className="group block bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    <service.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors text-sm mb-2" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                    {service.title}
                  </h4>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-gradient-to-r from-[#006400] via-[#008000] to-[#20b2aa] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-white" />
        </div>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-16 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                Need Expert Policy Analysis?
              </h2>
              <p className="text-white/80 text-base max-w-xl" style={{ fontFamily: "'Roboto', sans-serif" }}>
                Get in touch with our team for evidence-based policy analysis, reviews, and strategic advisory services.
              </p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <Link
                to="/contact"
                className="bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Contact Us
              </Link>
              <Link
                to="/specialties"
                className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider hover:bg-white/10 transition-colors"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PolicyAnalysis;
