import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, BookOpen, ChevronRight, Leaf, Zap, Scale,
  TreePine, Wheat, Briefcase, Users, Building2, Globe, Award, HeartPulse
} from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import coursesData from '@/data/coursesData.json';

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

/* ── Icon mapping for known course slugs ── */
const slugIcons = {
  'energy':                   Zap,
  'climate-smart-forestry':   TreePine,
  'energy-transition-and-mobility': Zap,
  'agricultural-carbon-credit-markets': Wheat,
  'agriculture-and-food-systems': Wheat,
  'an-introduction-to-climate-change-and-human-rights': Scale,
  'certified-expert-in-climate-adaptation-finance': Scale,
  'biodiversity-and-natural-resources': TreePine,
  'business-sustainability-management': Briefcase,
  'carbon-accounting-carbon-offsetting-course': Leaf,
  'certificate-course-on-nature-based-solutions-for-disaster-and-climate-resilience': Leaf,
  'certificate-in-green-finance': Scale,
  'certified-expert-in-biodiversity-finance': TreePine,
  'certified-expert-in-environmental-accounting': Building2,
  'certified-expert-in-sustainable-finance': Scale,
  'climate-biodiversity-certificate-program': Leaf,
  'climate-and-health-certificate-course': HeartPulse,
  'climate-change-and-water': Globe,
  'human-resources-professional-courses': Users,
  'green-skills-development': Award,
  'climate-resilient-infrastructure': Building2,
  'environment-climate-change-courses': Leaf,
  'regional-workshop': Globe,
  'training-on-carbon-markets': Scale,
};

/* ── Related courses for sidebar ── */
const popularCourses = [
  { label: 'Carbon Accounting & Offsetting', slug: 'carbon-accounting-carbon-offsetting-course' },
  { label: 'Climate & Biodiversity Program', slug: 'climate-biodiversity-certificate-program' },
  { label: 'Green Finance Certificate', slug: 'certificate-in-green-finance' },
  { label: 'Sustainable Finance Expert', slug: 'certified-expert-in-sustainable-finance' },
  { label: 'Climate Resilient Infrastructure', slug: 'climate-resilient-infrastructure' },
  { label: 'Energy & Green Economy', slug: 'energy' },
  { label: 'Climate & Health Course', slug: 'climate-and-health-certificate-course' },
  { label: 'Business Sustainability', slug: 'business-sustainability-management' },
];

const formatTitle = (slug) => {
  if (!slug) return 'Executive Training';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ExecutiveTraining = () => {
  const { slug } = useParams();

  const courseInfo = coursesData[slug];
  const title = formatTitle(slug);
  const IconComponent = slugIcons[slug] || GraduationCap;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={`${title} - ECASI AFRICA`}
        description="ECASI Executive Training and Courses."
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
            <Link to="/institute-overview" className="hover:text-white transition-colors">Executive Training</Link>
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
                {courseInfo ? (
                  <div
                    className="prose prose-lg prose-green max-w-none text-gray-700
                      prose-headings:text-ecasi-navy prose-headings:font-bold
                      prose-a:text-ecasi-green prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-xl prose-img:shadow-md
                      prose-li:marker:text-ecasi-green
                      prose-strong:text-ecasi-navy"
                    dangerouslySetInnerHTML={{ __html: courseInfo.content }}
                  />
                ) : (
                  <div className="py-12 px-4 text-center max-w-2xl mx-auto">
                    <GraduationCap size={48} className="mx-auto mb-6 text-ecasi-green/50" />
                    <h3 className="text-3xl font-bold text-ecasi-navy mb-4">Welcome to Executive Training</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Explore our comprehensive suite of executive training programmes. Please select a course from the menu to view detailed information, curriculum, and enrollment options.
                    </p>
                    <p className="text-gray-500 mb-8">
                      Our training modules offer actionable strategies in sustainability, climate finance, and policy implementation tailored specifically for professionals and leaders across the African continent.
                    </p>
                    <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-ecasi-green text-white font-medium rounded-xl hover:bg-ecasi-green-dark transition-colors">
                      Contact Us for Custom Training
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
              {/* Popular courses card */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="bg-ecasi-green px-5 py-4">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={16} />
                    Popular Courses
                  </h3>
                </div>
                <nav className="divide-y divide-gray-50">
                  {popularCourses.map((item) => {
                    const ItemIcon = slugIcons[item.slug] || GraduationCap;
                    const isCurrentPage = item.slug === slug;
                    return (
                      <Link
                        key={item.slug}
                        to={`/executive-training/${item.slug}`}
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
                <h4 className="font-bold text-base mb-2">Enroll Today</h4>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  Transform your career with ECASI's world-class executive training programmes.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-ecasi-green hover:bg-ecasi-green-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  Contact Us
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

export default ExecutiveTraining;
