import { useState, useEffect, useCallback } from 'react';
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
  Send,
  CheckCircle2,
  Loader2,
  Mail,
  FileCheck,
  Building2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/lib/dataService';
import { adminRegistrationService } from '@/services/adminRegistrationService';

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
  const loadOpenVacancies = useCallback(() => {
    const raw = dataService.getVacancies();
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((job) => job && job.status !== 'Closed' && String(job.title || '').trim() !== '');
  }, []);

  const [vacancies, setVacancies] = useState(() => loadOpenVacancies());
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('speculative');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: 'Environmental Researcher',
    coverLetter: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [cvDataUrl, setCvDataUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');
  const [backupMailto, setBackupMailto] = useState('');

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

  const handleOpenModal = (jobTitle = 'Speculative Application', jobId = 'speculative') => {
    setSelectedJob(jobTitle);
    setSelectedJobId(jobId);
    setIsSubmitted(false);
    setSubmittedRef('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload a PDF, DOC, or DOCX CV up to 3 MB so it can be attached directly to your portal application.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    setCvFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCvDataUrl(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) return;
    if (!cvFile) {
      toast({
        title: 'CV File Required',
        description: 'Please attach your CV (PDF, DOC, or DOCX) before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const targetJobTitle = selectedJob || 'Speculative Application';
    const subject = `CV Application: ${targetJobTitle} - ${formData.fullName}`;
    const body = `Dear ECAS Institute Team,\n\nI would like to submit my CV for your consideration.\n\nApplicant Details:\n- Name: ${formData.fullName}\n- Email: ${formData.email}\n- Phone: ${formData.phone || 'N/A'}\n- Primary Area of Expertise: ${formData.specialty}\n- Target Position: ${targetJobTitle}\n- Uploaded CV File: ${cvFile.name}\n\nCover Note:\n${formData.coverLetter || 'N/A'}\n\nBest regards,\n${formData.fullName}`;
    setBackupMailto(`mailto:info@ecasiafrica.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

    const saved = await adminRegistrationService.addApplication({
      jobId: selectedJobId || 'speculative',
      jobTitle: targetJobTitle,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      specialty: formData.specialty,
      coverLetter: formData.coverLetter.trim(),
      cvFileName: cvFile.name,
      cvFileType: cvFile.type || 'application/octet-stream',
      cvFileSize: cvFile.size || 0,
      cvDataUrl,
    });

    setIsSubmitting(false);
    setSubmittedRef(saved?.referenceNo || '');
    setIsSubmitted(true);
    toast({
      title: 'CV Submitted Successfully!',
      description: saved?.referenceNo
        ? `Reference ${saved.referenceNo} has been logged directly in the ECAS Recruitment Portal.`
        : 'Your application and CV have been received by ECAS Institute.',
    });
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      specialty: 'Environmental Researcher',
      coverLetter: '',
    });
    setCvFile(null);
    setCvDataUrl('');
    setSubmittedRef('');
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Vacancies"
        description="Join the Environmental Capacity and Sustainability Institute (ECAS Institute). View our latest career opportunities and job vacancies."
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
              {vacancies.map((job, index) => (
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
                    <button
                      type="button"
                      onClick={() => handleOpenModal(job.title, job.id || 'vacancy')}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg w-full md:w-auto cursor-pointer"
                    >
                      Apply Now <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
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
                Thank you for your interest in joining ECAS Institute. We currently do not have any open positions. Please check back later or submit your CV below for future opportunities.
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
            <button 
              onClick={() => handleOpenModal('Speculative Application')}
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <UploadCloud className="h-5 w-5" />
              Send Your CV
            </button>
          </motion.div>
        </div>
      </section>

      {/* CV Application Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="bg-primary p-6 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-white/90" />
                Submit Your CV
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm mt-1">
                {selectedJob ? `Position: ${selectedJob}` : 'Join the ECAS Institute Talent Pool'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 bg-white max-h-[80vh] overflow-y-auto">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Application & CV Received!</h3>
                {submittedRef && (
                  <p className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    Reference: {submittedRef}
                  </p>
                )}
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                  Thank you for submitting your CV ({cvFile?.name || 'attached'}) to ECAS Institute. Your application is now visible to our recruitment team in the ECAS portal.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {backupMailto && (
                    <a
                      href={backupMailto}
                      className="inline-flex items-center gap-1.5 border border-slate-300 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                    >
                      <Mail className="h-4 w-4 text-primary" /> Also Email Copy
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(false);
                    }}
                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ecasi-navy uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 text-ecasi-navy font-medium rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ecasi-navy uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 text-ecasi-navy font-medium rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ecasi-navy uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 text-ecasi-navy font-medium rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ecasi-navy uppercase tracking-wider mb-1">
                      Area of Expertise
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 text-ecasi-navy font-medium rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                    >
                      <option value="Environmental Researcher">Environmental Researcher</option>
                      <option value="Policy Analyst">Policy Analyst</option>
                      <option value="Sustainability Expert">Sustainability Expert</option>
                      <option value="Climate Change Specialist">Climate Change Specialist</option>
                      <option value="Forestry & Agriculture">Forestry & Agriculture</option>
                      <option value="Water & Waste Management">Water & Waste Management</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ecasi-navy uppercase tracking-wider mb-1">
                    Upload Curriculum Vitae (CV) *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-primary/70 transition-colors bg-slate-50/70">
                    {cvFile ? (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-300">
                        <div className="flex items-center gap-2 overflow-hidden text-left">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm font-bold text-ecasi-navy truncate max-w-[240px]">
                            {cvFile.name}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            ({(cvFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCvFile(null);
                            setCvDataUrl('');
                          }}
                          className="text-slate-500 hover:text-red-600 p-1 font-bold"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                        <UploadCloud className="h-8 w-8 text-primary mb-2" />
                        <span className="text-sm font-bold text-ecasi-navy">Click to upload CV document</span>
                        <span className="text-xs font-semibold text-slate-600 mt-1">PDF, DOC or DOCX format (Max 3MB)</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          required
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ecasi-navy uppercase tracking-wider mb-1">
                    Cover Note / Additional Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us briefly about your background and interests..."
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 text-ecasi-navy font-medium rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                  <a
                    href={`mailto:info@ecasiafrica.org?subject=CV Application - ${encodeURIComponent(formData.fullName || 'Talent Pool')}`}
                    className="text-xs font-bold text-ecasi-navy hover:text-ecasi-green flex items-center gap-1 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" /> Or email directly to info@ecasiafrica.org
                  </a>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Vacancies;

