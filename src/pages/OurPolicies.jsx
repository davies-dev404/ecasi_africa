import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, ShieldAlert, Scale, Plane, ShoppingBag, DollarSign, Download, ExternalLink, ShieldCheck } from 'lucide-react';

const policies = [
  {
    number: "1",
    title: "CONSTITUTION OF ENVIRONMENTAL CAPACITY AND SUSTAINABILITY INSTITUTE",
    category: "Governance",
    icon: Scale,
    url: "/reports/CONSTITUTION-OF-ENVIRONMENTAL-CAPACITY-AND-SUSTAINABILITY-INSTITUTE.pdf",
    description: "The founding constitutional document outlining the establishment, mandates, governance structures, and legal framework of ECAS Institute.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    number: "4",
    title: "ECAS Institute Antibribery-and-anticorruption-policy",
    category: "Ethics & Compliance",
    icon: ShieldCheck,
    url: "/reports/ECAS-Institute-Antibribery-and-anticorruption-policy.pdf",
    description: "Our zero-tolerance framework against bribery and corrupt practices, ensuring transparency, integrity, and ethical conduct across all operations.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    number: "5",
    title: "Whistleblower Policy",
    category: "Ethics & Compliance",
    icon: ShieldAlert,
    url: "/reports/Whistleblower-Policy.pdf",
    description: "A safe, anonymous channel for employees and partners to report unethical behavior, financial impropriety, or violations of code of conduct.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    number: "6",
    title: "RISK REGISTER-ECAS INSTITUTE",
    category: "Governance",
    icon: FileText,
    url: "/reports/RISK-REGISTER-ECAS-INSTITUTE.pdf",
    description: "Strategic registry outlining potential institutional risks, mitigation actions, impact analysis, and responsible focal departments.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    number: "7",
    title: "ECAS Institute Travel Expense Policy",
    category: "Operations",
    icon: Plane,
    url: "/reports/ECAS-iNSTITUTE-Travel-Expense-Policy-1.docx",
    description: "Regulatory procedures for travel allowances, reimbursements, booking guidelines, and expense management for official engagements.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    number: "8",
    title: "ECAS Institute Green Procurement Policy",
    category: "Operations",
    icon: ShoppingBag,
    url: "/reports/ECAS-Institute-_Green-Procurement-Policy.docx",
    description: "Procurement guidelines focused on sustainability, prioritizing eco-friendly vendors, energy-efficient goods, and minimal footprint services.",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    number: "9",
    title: "Financial Policy and Procedures",
    category: "Financial",
    icon: DollarSign,
    url: "/reports/Financial-Policy-and-Procedures.pdf",
    description: "Guidelines and standardized procedures governing financial transactions, budgeting, audits, and monetary controls at ECAS Institute.",
    color: "bg-green-50 text-green-600 border-green-100",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

const OurPolicies = () => {
  const handleDownload = async (e, url) => {
    e.preventDefault();
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      } else {
        alert("This document is currently being updated and will be available for download shortly. Please check back later.");
      }
    } catch (err) {
      alert("We are unable to process your download request at this time. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Our Policies"
        description="Access and download ECAS Institute's official policies, constitution, governance documents, ethical frameworks, and operational guidelines."
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
              Our Policies
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center font-medium">
              Access the legal, ethical, and operational frameworks that guarantee transparency and compliance in our work.
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-6">
              Governance, Transparency & Ethics
            </h2>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg">
              As a leading Pan-African think-tank, ECAS Institute operates under rigorous governance frameworks. 
              Below you will find the official documents outlining our constitution, compliance regulations, 
              financial procedures, and sustainability commitments.
            </p>
          </motion.div>

          {/* Grid of Policy Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {policies.map((policy, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative"
              >
                {/* Decorative background shape */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${policy.color.split(' ')[0]}`}></div>

                <div className="relative z-10">
                  {/* Category and Icon Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full shadow-sm">
                      Policy #{policy.number}
                    </span>
                    <motion.div 
                      whileHover={{ rotate: 15 }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${policy.color}`}
                    >
                      <policy.icon className="h-6 w-6" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-slate-800 mb-3 leading-snug group-hover:text-primary transition-colors">
                    {policy.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {policy.description}
                  </p>
                </div>

                {/* Actions / Download Links */}
                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <a
                    href={policy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Link</span>
                  </a>

                  <button
                    onClick={(e) => handleDownload(e, policy.url)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-50 text-primary border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Compliance / Whistleblower Banner */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="healthcare-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
            
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="w-20 h-20 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 shadow-inner"
            >
              <ShieldAlert className="h-10 w-10" />
            </motion.div>
            
            <div className="flex-1 text-center md:text-left z-10">
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-3">Compliance and Anonymous Reporting</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                ECAS Institute is committed to the highest ethical standard of research and project implementation. 
                If you observe any fraud, bribery, or violations of our Whistleblower Policy, please report it immediately to our compliance department.
              </p>
            </div>
            
            <div className="flex-shrink-0 z-10">
              <a href="mailto:compliance@ecasiafrica.org">
                <button className="bg-red-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Report Violation
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurPolicies;
