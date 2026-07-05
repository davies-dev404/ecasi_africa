import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Briefcase, MapPin, Clock, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const vacancies = [
  // Keeping it empty as per typical "no vacancies" or placeholder layout, 
  // but adding one placeholder so the user has a design to see.
  // We can add a "No Vacancies" state as well if array is empty.
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

const Vacancies = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Vacancies"
        description="Join the Environmental Capacity and Sustainability Institute (ECAS Institute). View our latest career opportunities and job vacancies."
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
              Vacancies
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
              Join our team of experts driving sustainable development and climate action across Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-16 md:py-24">
        <div className="healthcare-container max-w-4xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">Current Opportunities</h2>
            <p className="text-slate-600">
              Discover roles where you can make a tangible impact on environmental policy and sustainability.
            </p>
          </motion.div>

          {vacancies.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {vacancies.map((job, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.type}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Deadline: {job.deadline}</span>
                    </div>
                  </div>
                  <div>
                    <Link to="/contact" className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-xl font-bold transition-colors w-full md:w-auto">
                      Apply Now <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-12 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-200"></div>
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
                <FileText className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-3">
                No Vacancies Currently Available
              </h3>
              <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
                Thank you for your interest in joining ECAS Institute. We currently do not have any open positions. Please check back later or follow our social media channels for future updates.
              </p>
            </motion.div>
          )}

        </div>
      </section>
      
      {/* General Application CTA */}
      <section className="bg-primary py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container max-w-3xl text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              Speculative Applications
            </h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              We are always on the lookout for talented researchers, policy analysts, and sustainability experts. You are welcome to send your CV to our talent pool.
            </p>
            <a href="mailto:careers@ecasiafrica.org" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Send Your CV
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vacancies;
