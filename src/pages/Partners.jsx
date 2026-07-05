import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Handshake, Building2, Globe2, GraduationCap, ArrowRight } from 'lucide-react';

const partnersList = [
  {
    name: "Clean Air Fund",
    logo: "https://ecasiafrica.org/wp-content/uploads/2025/04/CLEAN-AIR-FUND.png",
    website: "https://www.cleanairfund.org/",
    type: "Philanthropic Organisation",
    icon: Globe2,
    description: "Clean Air Fund is a global philanthropic organisation working with governments, funders, businesses and campaigners to create a future where everyone breathes clean air.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    name: "Nairobi City County",
    logo: "https://ecasiafrica.org/wp-content/uploads/2025/04/download-1.jpg",
    website: "https://nairobi.go.ke/",
    type: "Government Authority",
    icon: Building2,
    description: "The Nairobi City County was created by the Constitution of Kenya 2010 and is the successor of the defunct City Council of Nairobi. It operates under the auspices of the Cities and Urban Areas Act, the Devolved Governments Act, and a host of other Acts. The Nairobi City County is charged with the responsibility of providing a variety of services to residents within its area of jurisdiction.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    name: "The Institute for Climate Change and Adaptation (ICCA)",
    logo: "https://ecasiafrica.org/wp-content/uploads/2025/04/Uon_emblem-1.gif",
    website: "https://icca.uonbi.ac.ke/",
    type: "Academic & Research Institution",
    icon: GraduationCap,
    description: "The Institute for Climate Change and Adaptation (ICCA) was established in 2011 with the mission of building human capacity necessary to address the unique climate change and adaptation needs of vulnerable communities through teaching, action-oriented research, development of innovative technologies and community participation. The Institute also provides expert advice for national and regional policy formulation and implementation.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
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
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Partners"
        description="Meet the official partners collaborating with ECAS Institute on climate change, air quality, policy development, and sustainable development initiatives across Africa."
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
              Our Partners
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
              Collaborating with global philanthropy, government institutions, and academia to scale environmental impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-16 md:py-24">
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

          {/* Grid of Partners */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto"
          >
            {partnersList.map((partner, index) => (
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
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="h-40 w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 mb-8 flex items-center justify-center overflow-hidden shadow-inner"
                  >
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="max-h-full max-w-full object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="text-primary font-bold text-lg text-center flex flex-col items-center gap-2"><span class="bg-primary/10 p-3 rounded-2xl text-primary"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></span></div>`;
                      }}
                    />
                  </motion.div>

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
