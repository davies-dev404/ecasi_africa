import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeroBanner from '@/components/PageHeroBanner';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  FileText,
  UploadCloud,
  Building2,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const Vacancies = () => {
  const loadOpenVacancies = useCallback(() => {
    const raw = dataService.getVacancies();
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((job) => job && job.status !== 'Closed' && String(job.title || '').trim() !== '');
  }, []);

  const [vacancies, setVacancies] = useState(() => loadOpenVacancies());

  useEffect(() => {
    dataService.refreshPublicData();
    const syncVacancies = () => setVacancies(loadOpenVacancies());
    window.addEventListener('ecasi_vacancies_updated', syncVacancies);
    window.addEventListener('storage', syncVacancies);
    return () => {
      window.removeEventListener('ecasi_vacancies_updated', syncVacancies);
      window.removeEventListener('storage', syncVacancies);
    };
  }, [loadOpenVacancies]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Vacancies"
        description="Join the Environmental Capacity and Sustainability Institute (ECAS Institute). View our latest career opportunities and submit your application online."
      />
      <Header />

      {/* Page Banner */}
      <PageHeroBanner
        title="Vacancies"
        subtitle="Join our team of experts driving sustainable development and climate action across Africa."
        image="/images/courses/mentorship_group.jpg"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'About Us', path: '/about' },
          { label: 'Vacancies' },
        ]}
      />

      {/* Main Section */}
      <section className="py-12 md:py-16">
        <div className="healthcare-container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {vacancies.length > 0 ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 mb-4 shadow-sm animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Vacancies Open ({vacancies.length} Position{vacancies.length > 1 ? 's' : ''} Available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold bg-red-100 text-red-700 border border-red-200 mb-4 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                No Vacancies Currently Available
              </span>
            )}

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
              {vacancies.map((job, index) => {
                const applyUrl = `/vacancies/apply/${encodeURIComponent(job.id || 'vacancy')}?title=${encodeURIComponent(job.title)}`;
                return (
                  <motion.div
                    key={job.id || index}
                    variants={itemVariants}
                    className="bg-white rounded-2xl p-6 border-2 border-emerald-200/70 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                    <div className="flex-1 pl-2">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Open Vacancy
                        </span>
                        {job.department && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                            <Building2 className="h-3.5 w-3.5" /> {job.department}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                        {job.title}
                      </h3>
                      {job.description && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3 whitespace-pre-line">
                          {job.description}
                        </p>
                      )}
                      {job.requirements && (
                        <div className="mb-3 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                          <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">Key Requirements:</span>
                          <span className="whitespace-pre-line">{job.requirements}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-700"><Briefcase className="h-4 w-4" /> {job.type || 'Full-time'}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location || 'Nairobi, Kenya'}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Deadline: {job.deadline || 'Open Until Filled'}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Link
                        to={applyUrl}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg w-full md:w-auto"
                      >
                        Apply Now <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-12 border-2 border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
              <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                <FileText className="h-10 w-10" />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-red-600 mb-3 drop-shadow-sm">
                No Vacancies Currently Available
              </h3>
              <p className="text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
                Thank you for your interest in joining ECAS Institute. We currently do not have any open positions. Please check back later or submit your CV &amp; application below for future opportunities.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* General Application CTA — navigates directly to dedicated Application Page */}
      <section className="bg-primary py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')",
          }}
        ></div>
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
              We are always on the lookout for talented researchers, policy analysts, and sustainability experts. You are welcome to submit your CV, Cover Letter, and credentials through our online application page.
            </p>
            <Link
              to="/vacancies/apply"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <UploadCloud className="h-5 w-5" />
              Submit Your CV &amp; Application
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vacancies;
