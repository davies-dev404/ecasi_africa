import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, BookOpen, ChevronRight, Leaf, Zap, Scale,
  TreePine, Wheat, Briefcase, Users, Building2, Globe, Award, HeartPulse,
  Clock, MapPin
} from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { dataService } from '@/lib/dataService';

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

const cleanContent = (htmlContent) => {
  if (!htmlContent) return '';
  // Strip Duration blocks from WordPress paragraph style
  let cleaned = htmlContent.replace(/<p[^>]*>\s*(?:<strong>)?\s*Duration\s*(?:<\/strong>)?\s*<\/p>\s*<p[^>]*>[^<]*Days?\s*<\/p>/gi, '');
  // Also strip any other occurrences of Duration: X Days or Duration: ...
  cleaned = cleaned.replace(/<p[^>]*>\s*(?:<strong>)?\s*Duration:\s*(?:<\/strong>)?\s*[^<]*Days?\s*<\/p>/gi, '');

  // Fix the "A<strong>CCOMMODATION</strong>" typo (where the letter 'A' is left outside the strong tags)
  cleaned = cleaned.replace(/A\s*<strong>\s*CCOMMODATION\s*<\/strong>/gi, '<strong>ACCOMMODATION</strong>');
  cleaned = cleaned.replace(/A\s*<b>\s*CCOMMODATION\s*<\/b>/gi, '<b>ACCOMMODATION</b>');
  cleaned = cleaned.replace(/A\s*CCOMMODATION/gi, 'ACCOMMODATION');

  // Prepend inline SVG icons to headings inside the course content prose
  const iconMap = [
    {
      key: 'OVERVIEW',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`
    },
    {
      key: 'AUDIENCE',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
    },
    {
      key: 'TARGET PARTICIPANTS',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
    },
    {
      key: 'WHAT YOU WILL LEARN',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`
    },
    {
      key: "WHAT YOU&#8217;LL LEARN",
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`
    },
    {
      key: 'COURSE STRUCTURE',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>`
    },
    {
      key: 'COURSE OUTLINE',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>`
    },
    {
      key: 'REQUIREMENTS',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    },
    {
      key: 'TRAINING FEE',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1m4-12H8a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z"></path></svg>`
    },
    {
      key: 'ACCOMMODATION',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
    },
    {
      key: 'TRAINING CUSTOMIZATION',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>`
    },
    {
      key: 'DIGITAL CERTIFICATION',
      svg: `<svg class="inline-block w-5 h-5 mr-2 text-ecasi-green align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>`
    }
  ];

  iconMap.forEach(item => {
    // Match headers wrapped in paragraphs or strong/b tags
    const regex1 = new RegExp(`(<p[^>]*>\\s*(?:<strong>|<b>)?\\s*)${item.key}(\\s*(?:<\\/strong>|<\\/b>)?\\s*<\\/p>)`, 'gi');
    cleaned = cleaned.replace(regex1, `$1${item.svg}${item.key}$2`);

    // Match simple block headers like <h2><strong>OVERVIEW</strong></h2>
    const regex2 = new RegExp(`(<h[1-6][^>]*>\\s*(?:<strong>|<b>)?\\s*)${item.key}(\\s*(?:<\\/strong>|<\\/b>)?\\s*<\\/h[1-6]>)`, 'gi');
    cleaned = cleaned.replace(regex2, `$1${item.svg}${item.key}$2`);
  });

  return cleaned;
};

const extractDuration = (htmlContent, slug) => {
  if (!htmlContent) return '5 Days';

  // 1. Check for explicit "Duration" heading or text followed by a day/week string
  const durationRegex = /(?:Duration|Workload)(?:\s*<\/strong>)?(?:\s*<\/p>)?(?:\s*<p[^>]*>)?\s*(?::\s*)?([0-9]+\s*(?:Days?|Weeks?|Months?))/i;
  const match = htmlContent.match(durationRegex);
  if (match && match[1]) {
    let val = match[1].replace(/<[^>]*>/g, '').trim();
    return val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // 2. Check for general sentences like "7 days blended learning"
  const sentenceRegex = /([0-9]+\s*(?:Days?|Weeks?|Months?))\s*(?:blended|full-time|training|online|course|learning|programme)/i;
  const sentenceMatch = htmlContent.match(sentenceRegex);
  if (sentenceMatch && sentenceMatch[1]) {
    let val = sentenceMatch[1].replace(/<[^>]*>/g, '').trim();
    return val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // 3. Fallback defaults for specific slugs or general fallback (5 Days)
  const defaults = {
    'carbon-accounting-carbon-offsetting-course': '5 Days',
    'climate-smart-forestry': '5 Days',
    'certificate-course-on-nature-based-solutions-for-disaster-and-climate-resilience': '7 Days',
    'certified-expert-in-biodiversity-finance': '5 Days',
    'certified-expert-in-sustainable-finance': '5 Days',
    'climate-biodiversity-certificate-program': '5 Days',
    'climate-and-health-certificate-course': '5 Days',
    'climate-change-and-water': '5 Days',
    'energy-transition-and-mobility': '3 Days',
    'agricultural-carbon-credit-markets': '5 Days',
    'certificate-in-green-finance': '7 Days',
    'climate-resilient-infrastructure': '5 Days',
    'environment-climate-change-courses': '5 Days',
    'regional-workshop': '5 Days',
    'training-on-carbon-markets': '5 Days',
  };

  return defaults[slug] || '5 Days';
};

const ExecutiveTraining = () => {
  const { slug } = useParams();
  const coursesData = dataService.getCourses();

  const courseInfo = coursesData[slug];
  const title = formatTitle(slug);
  const IconComponent = slugIcons[slug] || GraduationCap;
  
  const courseDuration = courseInfo ? extractDuration(courseInfo.content, slug) : '5 Days';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={`${title} - ECASI AFRICA`}
        description="ECASI Executive Training and Courses."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-24 pb-8 text-white text-center relative overflow-hidden">
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
                  <div className="space-y-8">
                    {/* Course Quick Stats Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gradient-to-br from-ecasi-navy/[0.03] to-ecasi-navy/[0.01] rounded-2xl border border-gray-100 mb-8 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-ecasi-green/10 flex items-center justify-center text-ecasi-green flex-shrink-0 shadow-inner">
                          <Clock size={22} />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Duration</span>
                          <span className="text-sm font-bold text-ecasi-navy">{courseDuration}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-ecasi-green/10 flex items-center justify-center text-ecasi-green flex-shrink-0 shadow-inner">
                          <MapPin size={22} />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Location / Venue</span>
                          <span className="text-sm font-bold text-ecasi-navy">TBC</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-ecasi-green/10 flex items-center justify-center text-ecasi-green flex-shrink-0 shadow-inner">
                          <Award size={22} />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Certification</span>
                          <span className="text-sm font-bold text-ecasi-navy">Certificate</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-ecasi-green/10 flex items-center justify-center text-ecasi-green flex-shrink-0 shadow-inner">
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Format</span>
                          <span className="text-sm font-bold text-ecasi-navy">In-Person / Online</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div
                      className="prose prose-lg prose-green max-w-none text-gray-700 text-justify
                        prose-headings:text-ecasi-navy prose-headings:font-bold
                        prose-a:text-ecasi-green prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-md
                        prose-li:marker:text-ecasi-green
                        prose-strong:text-ecasi-navy"
                      dangerouslySetInnerHTML={{ __html: cleanContent(courseInfo.content) }}
                    />

                    {/* Register Button block at the bottom */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-ecasi-green/[0.06] to-ecasi-green/[0.02] rounded-2xl border border-ecasi-green/10 mt-8 shadow-sm">
                      <div className="space-y-1 text-left w-full">
                        <h4 className="text-base font-bold text-ecasi-navy">Ready to Enroll?</h4>
                        <p className="text-xs text-gray-600">Register now for our upcoming session. Custom delivery options are available.</p>
                      </div>
                      <Link
                        to="/contact"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-ecasi-green hover:bg-ecasi-green-dark text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-ecasi-green/20 whitespace-nowrap"
                      >
                        Register for Course
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
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
                  Transform your career with ECASI&apos;s world-class executive training programmes.
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
