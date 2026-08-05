import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Handshake, Building2, Globe2, GraduationCap, ArrowRight } from 'lucide-react';

const partnersList = [
  // Financial Partners
  {
    name: "Clean Air Fund",
    logo: "/images/partners/clean.png",
    website: "https://www.cleanairfund.org/",
    category: "financial",
    type: "Financial Partner",
    icon: Globe2,
    description: "A global philanthropic organisation working with governments, funders, businesses and campaigners to create a future where everyone breathes clean air, supporting air quality regulations and Breathe Cities initiative in Nairobi.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    name: "Bloomberg Philanthropies",
    logo: "/images/bloomberg.png",
    website: "https://www.bloomberg.org/",
    category: "financial",
    type: "Financial Partner",
    icon: Globe2,
    description: "Encompasses all of Michael R. Bloomberg's charitable activities, focusing on five key areas: the environment, public health, government innovation, the arts, and education to ensure better, longer lives.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    name: "Breathe Cities",
    logo: "/images/partners/breathe_cities_logo.png",
    website: "https://breathecities.org/",
    category: "financial",
    type: "Financial Partner",
    icon: Globe2,
    description: "An initiative of Bloomberg Philanthropies, Clean Air Fund, and C40 Cities, collaborating with Nairobi City County to reduce air pollution and establish robust air quality standards.",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },

  // Governance Partners
  {
    name: "Nairobi City County",
    logo: "/images/partners/nairobi_county.png",
    website: "https://nairobi.go.ke/",
    category: "governance",
    type: "Governance Partner",
    icon: Building2,
    description: "The local government authority responsible for municipal services, urban development, and enacting locally tailored environment and air quality regulations in Nairobi, Kenya.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    name: "Government of Kenya (GoK)",
    logo: "/images/partners/gok_harambee.png",
    website: "https://www.kenya.go.ke/",
    category: "governance",
    type: "Governance Partner",
    icon: Building2,
    description: "The national government authority of the Republic of Kenya, formulating nationwide policies, coordinating climate programs, and enacting environmental legislation.",
    color: "bg-green-50 text-green-600 border-green-100",
  },
  {
    name: "Council of Governors (CoG)",
    logo: "/images/partners/council_of_governors.png",
    website: "https://www.cog.go.ke/",
    category: "governance",
    type: "Governance Partner",
    icon: Building2,
    description: "A non-partisan organization that provides a forum for consultation, sharing information, and coordinating climate action and policies across Kenya's 47 county governments.",
    color: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },

  // Academic Partners
  {
    name: "University of Nairobi (ICCA)",
    logo: "/images/partners/academic_uon.png",
    website: "https://www.uonbi.ac.ke/",
    category: "academic",
    type: "Academic Partner",
    icon: GraduationCap,
    description: "An elite academic and research institute at the University of Nairobi, established to build human capacity and conduct action-oriented research on climate change adaptation in Sub-Saharan Africa.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    name: "Kenyatta University",
    logo: "/images/partners/ku.png",
    website: "https://www.ku.ac.ke/",
    category: "academic",
    type: "Academic Partner",
    icon: GraduationCap,
    description: "A leading public research university in Kenya, actively engaging in environmental studies, green campus initiatives, and academic partnerships for sustainability.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    name: "Technical University of Mombasa (TUM)",
    logo: "/images/partners/academic_tum.png",
    website: "https://www.tum.ac.ke/",
    category: "academic",
    type: "Academic Partner",
    icon: GraduationCap,
    description: "A public university offering specialized engineering and environmental courses, collaborating on coastal climate resilience and ocean management studies.",
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    name: "Maseno University",
    logo: "/images/partners/academic_maseno.png",
    website: "https://www.maseno.ac.ke/",
    category: "academic",
    type: "Academic Partner",
    icon: GraduationCap,
    description: "A leading university in Western Kenya known for its research in environmental sciences, sustainable development, and community climate training.",
    color: "bg-pink-50 text-pink-600 border-pink-100",
  },

  // Professional Membership
  {
    name: "Environment Institute of Kenya (EIK)",
    logo: "/images/partners/eik.png",
    website: "https://eik.co.ke/",
    category: "membership",
    type: "Professional Membership",
    icon: Handshake,
    description: "The professional body for environmental practitioners in Kenya, certifying and regulating environmental impact assessment (EIA) and audit experts.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    name: "Adaptation Research Alliance (ARA)",
    logo: "/images/partners/ara.png",
    website: "https://www.adaptationresearchalliance.org/",
    category: "membership",
    type: "Professional Membership",
    icon: Handshake,
    description: "A global coalition that promotes action-oriented research to inform adaptation and build climate resilience for vulnerable communities.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    name: "Kenya Climate Change Working Group (KCCWG)",
    logo: "/images/partners/kccwg.png",
    website: "https://kccwg.org/",
    category: "membership",
    type: "Professional Membership",
    icon: Handshake,
    description: "A leading civil society coalition in Kenya advocating for climate justice, community awareness, and effective national climate change policies.",
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    name: "Ukama",
    logo: "/images/partners/ukama.png",
    website: "https://www.ukama-learning.org/",
    category: "membership",
    type: "Professional Membership",
    icon: Handshake,
    description: "A network of organizations and experts collaborating on sustainable development education, knowledge exchange, and climate learning tools.",
    color: "bg-lime-50 text-lime-600 border-lime-100",
  },
  {
    name: "Pan African Climate Justice Alliance (PACJA)",
    logo: "/images/partners/pacja.png",
    website: "https://www.pacja.org/",
    category: "membership",
    type: "Professional Membership",
    icon: Handshake,
    description: "A coalition of civil society organizations across Africa advocating for climate justice, equity, and fair climate policies for the continent in global forums.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
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

const Partners = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Partners" },
    { id: "financial", label: "Financial Partners" },
    { id: "governance", label: "Governance Partners" },
    { id: "academic", label: "Academic Partners" },
    { id: "membership", label: "Professional Membership" },
  ];

  const filteredPartners = activeCategory === "all"
    ? partnersList
    : partnersList.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Partners"
        description="Meet the official partners collaborating with ECAS Institute on climate change, air quality, policy development, and sustainable development initiatives across Africa."
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
              Our Partners
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center font-medium">
              Collaborating with global philanthropy, government institutions, and academia to scale environmental impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-12 md:py-16">
        <div className="healthcare-container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
              <Handshake className="h-4 w-4" />
              <span>Strategic Alliances</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-6">
              Co-creating Sustainable Solutions
            </h2>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg">
              We believe that complex environmental and developmental challenges cannot be solved in isolation. 
              ECAS Institute partners with leading international organizations, municipal governments, and elite 
              research institutes to drive research, policy, and practice.
            </p>
          </motion.div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 max-w-4xl mx-auto px-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-[#008000] text-white shadow-lg shadow-green-600/20 scale-105"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-[#008000] hover:text-[#008000]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Partners */}
          <motion.div 
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-6xl mx-auto"
          >
            {filteredPartners.map((partner, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative"
              >
                {/* Decorative background shape */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${partner.color.split(' ')[0]}`}></div>

                {/* Top Portion */}
                <div className="relative z-10">
                  {/* Logo Panel */}
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="h-28 w-full bg-slate-50/60 rounded-2xl p-4 mb-6 flex items-center justify-center overflow-hidden border border-slate-100"
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="max-h-20 max-w-full object-contain transition-all duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="text-primary font-bold text-lg text-center flex flex-col items-center gap-2"><span class="bg-primary/10 p-3 rounded-2xl text-primary"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></span></div>`;
                        }}
                      />
                    </motion.div>
                  </a>

                  {/* Badge */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm ${partner.color}`}>
                      <partner.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                      {partner.type}
                    </span>
                  </div>

                  {/* Partner Name & Description */}
                  <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 leading-snug group-hover:text-primary transition-colors">
                    {partner.name}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {partner.description}
                  </p>
                </div>

                {/* Optional CTA Link */}
                <div className="mt-8 pt-5 border-t border-slate-100 relative z-10 flex justify-end">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all hover:text-primary/80 bg-primary/5 px-4 py-2 rounded-xl">
                    View Institution <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Collaboration Call out */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="healthcare-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4">
              Become a Strategic Partner
            </h2>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Are you looking to collaborate on action-oriented climate research, policy formulation, or professional capacity strengthening in Africa? Partner with us.
            </p>
            <Link to="/contact">
              <button className="bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Collaborate With Us
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
