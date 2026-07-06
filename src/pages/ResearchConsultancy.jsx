import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, FileSearch, Shield, Scale, Leaf, Zap, Wheat,
  TreePine, Train, Recycle, ArrowRightLeft, Gavel, ChevronRight,
  ClipboardCheck, BarChart3, FileText, Building2
} from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import researchData from '@/data/researchData.json';

/* ── Framer Motion Variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

/* ── Icon mapping for known research slugs ── */
const slugIcons = {
  'overview':                  BookOpen,
  'consulting':                Building2,
  'baseline-study':            FileSearch,
  'assessments':               ClipboardCheck,
  'policy-reviews-and-assessments': FileText,
  'policy-analysis':           BarChart3,
  'environmental-and-social-impact-assessment': Shield,
  'strategic-environmental-assessments-sea-2':  Shield,
  'environmental-and-social-management-plans-esmp': FileText,
  'rapporteur-and-reporting-services': FileText,
  'environmental-audits':      ClipboardCheck,
  'energy-audits':             Zap,
  'scoping-studies':           FileSearch,
  'climate-finance':           Scale,
  'climate-adaptation':        Leaf,
  'climate-change-mitigation': Leaf,
  'climate-and-technology':    Zap,
  'energy-transition':         Zap,
  'agriculture-and-food-systems-2': Wheat,
  'natural-resources':         TreePine,
  'transport-and-e-mobility':  Train,
  'waste-and-circular-economy-2': Recycle,
  'just-transition':           ArrowRightLeft,
  'environmental-law-and-governance': Gavel,
};

/* ── Related pages for the sidebar cards ── */
const relatedPages = {
  consultancy: [
    { label: 'Overview', slug: 'consulting' },
    { label: 'Baseline Study', slug: 'baseline-study' },
    { label: 'Assessments', slug: 'assessments' },
    { label: 'Policy Reviews', slug: 'policy-reviews-and-assessments' },
    { label: 'Policy Analysis', slug: 'policy-analysis' },
    { label: 'Environmental Audits', slug: 'environmental-audits' },
    { label: 'Energy Audits', slug: 'energy-audits' },
    { label: 'Scoping Studies', slug: 'scoping-studies' },
    { label: 'Rapporteur Services', slug: 'rapporteur-and-reporting-services' },
  ],
  research: [
    { label: 'Climate Finance', slug: 'climate-finance' },
    { label: 'Climate Adaptation', slug: 'climate-adaptation' },
    { label: 'Climate Change Mitigation', slug: 'climate-change-mitigation' },
    { label: 'Climate & Technology', slug: 'climate-and-technology' },
    { label: 'Energy Transition', slug: 'energy-transition' },
    { label: 'Agriculture & Food Systems', slug: 'agriculture-and-food-systems-2' },
    { label: 'Natural Resources', slug: 'natural-resources' },
    { label: 'Transport & E-Mobility', slug: 'transport-and-e-mobility' },
    { label: 'Waste & Circular Economy', slug: 'waste-and-circular-economy-2' },
    { label: 'Just Transition', slug: 'just-transition' },
    { label: 'Environmental Law', slug: 'environmental-law-and-governance' },
  ],
};

const consultancySlugs = [
  'overview', 'consulting', 'baseline-study', 'assessments',
  'policy-reviews-and-assessments', 'policy-analysis',
  'environmental-and-social-impact-assessment',
  'strategic-environmental-assessments-sea-2',
  'environmental-and-social-management-plans-esmp',
  'rapporteur-and-reporting-services',
  'environmental-audits', 'energy-audits', 'scoping-studies'
];

const formatTitle = (slug) => {
  if (!slug) return 'Research & Consultancy';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ResearchConsultancy = () => {
  const { slug } = useParams();

  const pageInfo = researchData[slug];
  const title = formatTitle(slug);
  const IconComponent = slugIcons[slug] || BookOpen;
  const isConsultancy = consultancySlugs.includes(slug);
  const sidebarItems = isConsultancy ? relatedPages.consultancy : relatedPages.research;
  const sectionLabel = isConsultancy ? 'Consultancy' : 'Research Areas';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={`${title} - ECASI AFRICA`}
        description="ECASI Research and Consultancy Services."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-8 text-white text-center relative overflow-hidden">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-1/4 w-32 h-32 border border-white rounded-full" />
          <div className="absolute bottom-2 right-1/3 w-24 h-24 border border-white rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Icon badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm mb-4"
          >
            <IconComponent size={28} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold uppercase tracking-wide"
          >
            {title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-2 mt-3 text-xs md:text-sm text-white/80 font-medium"
          >
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <Link to="/research/overview" className="text-white/80 hover:text-white transition-colors">Research & Consultancy</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">{title}</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content with Sidebar ── */}
      <main className="flex-grow py-12 md:py-16 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Left — Main article content */}
            <motion.article
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="flex-1 min-w-0"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                {pageInfo ? (
                  <div
                    className="prose prose-lg prose-green max-w-none text-gray-700
                      prose-headings:text-ecasi-navy prose-headings:font-bold
                      prose-a:text-ecasi-green prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-xl prose-img:shadow-md
                      prose-li:marker:text-ecasi-green
                      prose-strong:text-ecasi-navy"
                    dangerouslySetInnerHTML={{ __html: pageInfo.content }}
                  />
                ) : (
                  <div className="py-12 px-4 text-center max-w-2xl mx-auto">
                    <BookOpen size={48} className="mx-auto mb-6 text-ecasi-green/50" />
                    <h3 className="text-3xl font-bold text-ecasi-navy mb-4">Research & Consultancy</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Select an area from the menu to discover how ECASI provides cutting-edge research, baseline studies, and comprehensive policy assessments to support evidence-based decision-making.
                    </p>
                    <p className="text-gray-500 mb-8">
                      We empower governments, development partners, and the private sector across Africa with expert insights for sustainable development.
                    </p>
                    <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-ecasi-green text-white font-medium rounded-xl hover:bg-ecasi-green-dark transition-colors">
                      Inquire About Our Services
                    </Link>
                  </div>
                )}
              </div>
            </motion.article>

            {/* Right — Sidebar */}
            <motion.aside
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full lg:w-80 flex-shrink-0 space-y-6"
            >
              {/* Section navigation card */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="bg-ecasi-green px-5 py-4">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} />
                    {sectionLabel}
                  </h3>
                </div>
                <nav className="divide-y divide-gray-50">
                  {sidebarItems.map((item) => {
                    const ItemIcon = slugIcons[item.slug] || BookOpen;
                    const isCurrentPage = item.slug === slug;
                    return (
                      <Link
                        key={item.slug}
                        to={`/research/${item.slug}`}
                        className={`flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 group ${
                          isCurrentPage
                            ? 'bg-ecasi-green/10 text-ecasi-green font-semibold border-l-4 border-ecasi-green'
                            : 'text-ecasi-navy hover:bg-ecasi-green/5 hover:text-ecasi-green hover:pl-6'
                        }`}
                      >
                        <ItemIcon size={16} className={`flex-shrink-0 ${isCurrentPage ? 'text-ecasi-green' : 'text-gray-400 group-hover:text-ecasi-green'}`} />
                        <span className="truncate">{item.label}</span>
                        <ChevronRight size={14} className={`ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentPage ? 'opacity-100' : ''}`} />
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>

              {/* CTA Card */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-ecasi-navy to-ecasi-navy/90 rounded-2xl p-6 text-white"
              >
                <h4 className="font-bold text-base mb-2">Need Consulting?</h4>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  Our team of experts is ready to help with your research and consultancy needs.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-ecasi-green hover:bg-ecasi-green-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  Get in Touch
                  <ChevronRight size={14} />
                </Link>
              </motion.div>
            </motion.aside>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResearchConsultancy;
