import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeroBanner from '@/components/PageHeroBanner';
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  FileText,
  UploadCloud,
  Send,
  CheckCircle2,
  Loader2,
  Mail,
  FileCheck,
  User,
  GraduationCap,
  ShieldCheck,
  Plus,
  Trash2,
  Printer,
  MapPin,
  Clock,
  Building2,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/lib/dataService';
import { adminRegistrationService } from '@/services/adminRegistrationService';

const DRAFT_STORAGE_KEY = 'ecasi_recruitment_draft_v1';

const APPLICATION_STEPS = [
  { id: 1, label: 'Personal Profile', icon: User },
  { id: 2, label: 'Education', icon: GraduationCap },
  { id: 3, label: 'Experience & Referees', icon: Briefcase },
  { id: 4, label: 'Documents & Cover Letter', icon: UploadCloud },
  { id: 5, label: 'Review & Submit', icon: ShieldCheck },
];

const STATUTORY_CLEARANCES = [
  'Valid National ID / Passport Copy',
  'KRA Tax Compliance Certificate (TCC)',
  'DCI Certificate of Good Conduct',
  'HELB Clearance Certificate',
  'EACC Self-Declaration / Clearance',
  'CRB Clearance Report',
];

const emptyEducation = () => ({
  level: "Bachelor's Degree",
  institution: '',
  fieldOfStudy: '',
  grade: '',
  graduationYear: '',
});

const emptyExperience = () => ({
  jobTitle: '',
  employer: '',
  startDate: '',
  endDate: '',
  current: false,
  responsibilities: '',
});

const emptyReferee = () => ({
  name: '',
  organisation: '',
  title: '',
  phone: '',
  email: '',
});

const createInitialDraft = () => ({
  fullName: '',
  email: '',
  phone: '',
  nationalId: '',
  gender: 'Prefer not to say',
  dateOfBirth: '',
  county: 'Nairobi, Kenya',
  physicalAddress: '',
  disabilityStatus: 'No',
  specialty: 'Environmental Researcher',
  highestQualification: "Bachelor's Degree",
  careerSummary: '',
  education: [emptyEducation()],
  professionalMemberships: {
    bodyName: '',
    membershipNo: '',
    status: 'Active / Good Standing',
  },
  experience: [emptyExperience()],
  referees: [emptyReferee(), emptyReferee()],
  complianceChecklist: ['Valid National ID / Passport Copy'],
  coverLetter: '',
});

const VacancyApplication = () => {
  const { jobId: paramJobId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const loadOpenVacancies = useCallback(() => {
    const raw = dataService.getVacancies();
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((job) => job && job.status !== 'Closed' && String(job.title || '').trim() !== '');
  }, []);

  const [vacancies, setVacancies] = useState(() => loadOpenVacancies());
  const initialJobId = paramJobId || searchParams.get('jobId') || 'speculative';
  const initialTitleParam = searchParams.get('title') || '';

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedJob, setSelectedJob] = useState(
    initialTitleParam || (initialJobId === 'speculative' ? 'Speculative Application' : '')
  );
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return { ...createInitialDraft(), ...JSON.parse(saved) };
      }
    } catch {
      // ignore corrupted draft
    }
    return createInitialDraft();
  });

  const [cvFile, setCvFile] = useState(null);
  const [cvDataUrl, setCvDataUrl] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [certDataUrl, setCertDataUrl] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);
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

  // Match title cleanly if navigated with jobId
  useEffect(() => {
    if (selectedJobId === 'speculative') {
      setSelectedJob('Speculative Application');
      return;
    }
    const found = vacancies.find((v) => v.id === selectedJobId);
    if (found) {
      setSelectedJob(found.title);
    } else if (!selectedJob && initialTitleParam) {
      setSelectedJob(initialTitleParam);
    }
  }, [selectedJobId, vacancies, initialTitleParam, selectedJob]);

  // Auto-save text fields locally
  useEffect(() => {
    if (isSubmitted) return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage errors
    }
  }, [formData, isSubmitted]);

  const activeVacancyDetails = vacancies.find((v) => v.id === selectedJobId) || null;

  const readAttachmentFile = (e, maxMb, onSuccess) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxMb * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: `Please attach a document up to ${maxMb} MB so it uploads cleanly.`,
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSuccess(file, typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const updateArrayItem = (field, idx, patch) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const addArrayItem = (field, factory, maxItems) => {
    setFormData((prev) => {
      if (prev[field].length >= maxItems) return prev;
      return { ...prev, [field]: [...prev[field], factory()] };
    });
  };

  const removeArrayItem = (field, idx, minItems = 1) => {
    setFormData((prev) => {
      if (prev[field].length <= minItems) return prev;
      return { ...prev, [field]: prev[field].filter((_, i) => i !== idx) };
    });
  };

  const toggleComplianceItem = (itemLabel) => {
    setFormData((prev) => {
      const exists = prev.complianceChecklist.includes(itemLabel);
      return {
        ...prev,
        complianceChecklist: exists
          ? prev.complianceChecklist.filter((c) => c !== itemLabel)
          : [...prev.complianceChecklist, itemLabel],
      };
    });
  };

  const validateAndAdvance = (nextStep) => {
    if (nextStep <= activeStep) {
      setActiveStep(nextStep);
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }
    if (activeStep === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.nationalId.trim()) {
        toast({
          title: 'Personal Details Required',
          description: 'Please fill in Full Legal Name, National ID / Passport No., Email Address, and Mobile Phone Number.',
          variant: 'destructive',
        });
        return;
      }
    }
    if (activeStep === 2) {
      const hasAcademic = formData.education.some((ed) => ed.institution.trim() && ed.fieldOfStudy.trim());
      if (!hasAcademic) {
        toast({
          title: 'Academic Qualification Required',
          description: 'Please enter at least one Institution Attended and Course / Field of Study.',
          variant: 'destructive',
        });
        return;
      }
    }
    if (activeStep === 4 && !cvFile) {
      toast({
        title: 'CV Document Required',
        description: 'Please upload your Curriculum Vitae (PDF, DOC, or DOCX) before reviewing and submitting.',
        variant: 'destructive',
      });
      return;
    }
    setActiveStep(nextStep);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setActiveStep(4);
      toast({
        title: 'CV Missing',
        description: 'Please upload your Curriculum Vitae before submitting.',
        variant: 'destructive',
      });
      return;
    }
    if (!declarationAccepted) {
      toast({
        title: 'Applicant Declaration Required',
        description: 'Please tick the declaration box confirming all information provided is accurate.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const targetJobTitle = selectedJob || 'Speculative Application';
    const subject = `Job Application: ${targetJobTitle} - ${formData.fullName}`;
    const body = `Dear Chief Executive Officer / HR Director, ECAS Institute,\n\nI have submitted my online application for "${targetJobTitle}".\n\nApplicant Summary:\n- Name: ${formData.fullName}\n- National ID / Passport: ${formData.nationalId}\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Highest Qualification: ${formData.highestQualification}\n- Attached CV: ${cvFile.name}\n\nCover Letter:\n${formData.coverLetter || 'Submitted via ECAS Online Recruitment Portal.'}\n\nBest regards,\n${formData.fullName}`;
    setBackupMailto(`mailto:info@ecasiafrica.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

    const saved = await adminRegistrationService.addApplication({
      jobId: selectedJobId || 'speculative',
      jobTitle: targetJobTitle,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      nationalId: formData.nationalId.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      county: formData.county.trim(),
      physicalAddress: formData.physicalAddress.trim(),
      disabilityStatus: formData.disabilityStatus,
      specialty: formData.specialty,
      highestQualification: formData.highestQualification,
      careerSummary: formData.careerSummary.trim(),
      education: formData.education.filter((ed) => ed.institution.trim() || ed.fieldOfStudy.trim()),
      professionalMemberships: formData.professionalMemberships,
      experience: formData.experience.filter((ex) => ex.jobTitle.trim() || ex.employer.trim()),
      referees: formData.referees.filter((ref) => ref.name.trim()),
      complianceChecklist: formData.complianceChecklist,
      coverLetter: formData.coverLetter.trim(),
      cvFileName: cvFile.name,
      cvFileType: cvFile.type || 'application/octet-stream',
      cvFileSize: cvFile.size || 0,
      cvDataUrl,
      certFileName: certFile?.name || '',
      certFileType: certFile?.type || '',
      certFileSize: certFile?.size || 0,
      certDataUrl,
      declarationAccepted: true,
    });

    setIsSubmitting(false);
    setSubmittedRecord(saved);
    setIsSubmitted(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    toast({
      title: 'Application Submitted Successfully!',
      description: saved?.referenceNo
        ? `Reference ${saved.referenceNo} has been logged directly in the ECAS Recruitment Portal.`
        : 'Your application and CV have been received.',
    });
  };

  const resetForm = () => {
    const blank = createInitialDraft();
    setFormData(blank);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setCvFile(null);
    setCvDataUrl('');
    setCertFile(null);
    setCertDataUrl('');
    setDeclarationAccepted(false);
    setActiveStep(1);
    setSubmittedRecord(null);
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title={`Job Application${selectedJob ? ` — ${selectedJob}` : ''}`}
        description="Submit your complete structured career application, CV, academic credentials, work experience, and Cover Letter online to ECAS Institute."
      />
      <Header />

      <PageHeroBanner
        title="Online Job Application Portal"
        subtitle={selectedJob ? `Position Applying For: ${selectedJob}` : 'Join ECAS Institute — Structured Candidate Application'}
        image="/images/Gallery/training_workshop_session.jpg"
        icon={FileCheck}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Vacancies', path: '/vacancies' },
          { label: 'Apply Online' },
        ]}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/vacancies"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#032e42] hover:text-[#008000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Current Vacancies
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            Draft Auto-Saved Locally
          </span>
        </div>

        {/* Selected Vacancy Context Card */}
        {!isSubmitted && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008000]">
                Target Opportunity
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#032e42]">
                {selectedJob || 'Speculative Application (Talent Pool)'}
              </h2>
              {activeVacancyDetails && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  {activeVacancyDetails.department && (
                    <span className="flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5 text-[#008000]" /> {activeVacancyDetails.department}</span>
                  )}
                  <span className="flex items-center gap-1 font-medium"><Briefcase className="w-3.5 h-3.5 text-[#008000]" /> {activeVacancyDetails.type || 'Full-time'}</span>
                  <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-[#008000]" /> {activeVacancyDetails.location || 'Nairobi, Kenya'}</span>
                  <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-[#008000]" /> Deadline: {activeVacancyDetails.deadline || 'Open Until Filled'}</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-72 shrink-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Switch Position / Role
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  const idVal = e.target.value;
                  setSelectedJobId(idVal);
                  if (idVal === 'speculative') {
                    setSelectedJob('Speculative Application');
                  } else {
                    const match = vacancies.find((v) => v.id === idVal);
                    if (match) setSelectedJob(match.title);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-[#032e42] bg-slate-50 focus:outline-none focus:border-[#008000]"
              >
                <option value="speculative">Speculative Application (Talent Pool)</option>
                {vacancies.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Main Application Shell */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {!isSubmitted && (
            <div className="bg-[#032e42] p-4 sm:p-5 border-b border-slate-200">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
                {APPLICATION_STEPS.map((st) => {
                  const Icon = st.icon;
                  const isCurrent = activeStep === st.id;
                  const isDone = activeStep > st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => validateAndAdvance(st.id)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#008000] text-white shadow-sm'
                          : isDone
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                          : 'bg-white/10 text-white/75 hover:bg-white/15'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate hidden sm:inline">{st.id}. {st.label}</span>
                      <span className="sm:hidden">{st.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-5 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#032e42] mb-2">Application &amp; CV Submitted!</h3>
                  {submittedRecord?.referenceNo && (
                    <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-mono font-bold px-4 py-1.5 rounded-full">
                      Tracking Reference: {submittedRecord.referenceNo}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-sm space-y-2 text-slate-700">
                  <div><strong>Position Applied:</strong> {selectedJob || 'Speculative Application'}</div>
                  <div><strong>Applicant Name:</strong> {formData.fullName} ({formData.nationalId})</div>
                  <div><strong>Email / Phone:</strong> {formData.email} • {formData.phone}</div>
                  <div><strong>Highest Qualification:</strong> {formData.highestQualification} ({formData.education.length} academic record{formData.education.length > 1 ? 's' : ''})</div>
                  <div><strong>Attached CV Document:</strong> {cvFile?.name || 'Attached'}</div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Thank you for applying to ECAS Institute. Your complete application dossier and uploaded CV have been saved directly in our Recruitment Portal for review.
                </p>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 border border-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-[#032e42]" /> Print Confirmation
                  </button>
                  {backupMailto && (
                    <a
                      href={backupMailto}
                      className="inline-flex items-center gap-1.5 border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs"
                    >
                      <Mail className="h-4 w-4 text-[#008000]" /> Optional: Email Copy via Default Mail App
                    </a>
                  )}
                  <Link
                    to="/vacancies"
                    onClick={resetForm}
                    className="bg-[#008000] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#006600] transition-colors text-xs inline-flex items-center gap-1.5"
                  >
                    Return to Vacancies <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* STEP 1: PERSONAL PROFILE */}
                {activeStep === 1 && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-extrabold text-[#032e42] uppercase tracking-wider">
                        1. Applicant Profile &amp; Identification
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Ensure all particulars match your official National Identification Card or Passport.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jane Wanjiku Mwangi"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">National ID / Passport Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 34567890"
                          value={formData.nationalId}
                          onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="jane@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+254 700 000 000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#008000]"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">County / Country of Residence</label>
                        <input
                          type="text"
                          placeholder="e.g. Nairobi, Kenya"
                          value={formData.county}
                          onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Person Living With Disability?</label>
                        <select
                          value={formData.disabilityStatus}
                          onChange={(e) => setFormData({ ...formData, disabilityStatus: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#008000]"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes (Equal Opportunity Assessment)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Primary Area of Expertise</label>
                        <select
                          value={formData.specialty}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#008000]"
                        >
                          <option value="Environmental Researcher">Environmental Researcher</option>
                          <option value="Policy Analyst">Policy Analyst</option>
                          <option value="Climate Finance & Carbon Markets">Climate Finance &amp; Carbon Markets</option>
                          <option value="Sustainability & ESG Lead">Sustainability &amp; ESG Lead</option>
                          <option value="Project Management & M&E">Project Management &amp; M&amp;E</option>
                          <option value="Corporate Governance & Legal">Corporate Governance &amp; Legal</option>
                          <option value="Finance, Admin & Operations">Finance, Admin &amp; Operations</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Postal / Physical Address</label>
                        <input
                          type="text"
                          placeholder="P.O. Box or Estate / Street"
                          value={formData.physicalAddress}
                          onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Professional Profile / Career Summary</label>
                      <textarea
                        rows={3}
                        placeholder="Summarize your core competencies, areas of impact, and professional background..."
                        value={formData.careerSummary}
                        onChange={(e) => setFormData({ ...formData, careerSummary: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: ACADEMIC QUALIFICATIONS & PROFESSIONAL BODIES */}
                {activeStep === 2 && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#032e42] uppercase tracking-wider">
                          2. Academic Qualifications &amp; Professional Bodies
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Record your qualifications starting from the highest level attained.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addArrayItem('education', emptyEducation, 8)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#008000]/10 text-[#008000] hover:bg-[#008000] hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Qualification
                      </button>
                    </div>

                    <div className="max-w-sm">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Highest Education Level Attained *</label>
                      <select
                        value={formData.highestQualification}
                        onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#008000]"
                      >
                        <option value="PhD / Doctorate">PhD / Doctorate</option>
                        <option value="Master's Degree">Master&apos;s Degree</option>
                        <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                        <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                        <option value="Higher Diploma / Diploma">Higher Diploma / Diploma</option>
                        <option value="Certificate / KCSE">Certificate / KCSE</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {formData.education.map((edu, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#032e42]">Qualification #{idx + 1}</span>
                            {formData.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayItem('education', idx, 1)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Level</label>
                              <select
                                value={edu.level}
                                onChange={(e) => updateArrayItem('education', idx, { level: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                              >
                                <option value="PhD / Doctorate">PhD / Doctorate</option>
                                <option value="Master's Degree">Master&apos;s Degree</option>
                                <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                                <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                                <option value="Diploma / Higher Diploma">Diploma / Higher Diploma</option>
                                <option value="Certificate / KCSE">Certificate / KCSE</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Institution / University Attended *</label>
                              <input
                                type="text"
                                placeholder="e.g. University of Nairobi"
                                value={edu.institution}
                                onChange={(e) => updateArrayItem('education', idx, { institution: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Course / Field of Study *</label>
                              <input
                                type="text"
                                placeholder="e.g. B.Sc. Environmental Policy & Sustainable Development"
                                value={edu.fieldOfStudy}
                                onChange={(e) => updateArrayItem('education', idx, { fieldOfStudy: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Grade / Class</label>
                                <input
                                  type="text"
                                  placeholder="Second Upper"
                                  value={edu.grade}
                                  onChange={(e) => updateArrayItem('education', idx, { grade: e.target.value })}
                                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Grad Year</label>
                                <input
                                  type="text"
                                  placeholder="2021"
                                  value={edu.graduationYear}
                                  onChange={(e) => updateArrayItem('education', idx, { graduationYear: e.target.value })}
                                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                      <span className="text-xs font-extrabold text-[#032e42] block">
                        Professional Body Membership &amp; Practicing License (Optional)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Professional Body (e.g. NEMA, ICPAK, EIK, LSK)"
                          value={formData.professionalMemberships.bodyName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              professionalMemberships: { ...formData.professionalMemberships, bodyName: e.target.value },
                            })
                          }
                          className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Membership / Practicing No."
                          value={formData.professionalMemberships.membershipNo}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              professionalMemberships: { ...formData.professionalMemberships, membershipNo: e.target.value },
                            })
                          }
                          className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                        <select
                          value={formData.professionalMemberships.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              professionalMemberships: { ...formData.professionalMemberships, status: e.target.value },
                            })
                          }
                          className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                        >
                          <option value="Active / Good Standing">Active / Good Standing</option>
                          <option value="Associate Member">Associate Member</option>
                          <option value="Renewal in Progress">Renewal in Progress</option>
                          <option value="Not Applicable">Not Applicable</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: WORK EXPERIENCE & REFEREES */}
                {activeStep === 3 && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#032e42] uppercase tracking-wider">
                          3. Chronological Work Experience &amp; Referees
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Provide your recent work history and up to three referees.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addArrayItem('experience', emptyExperience, 10)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#008000]/10 text-[#008000] hover:bg-[#008000] hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Work Role
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#032e42]">Employment Record #{idx + 1}</span>
                            {formData.experience.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayItem('experience', idx, 1)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Job Title / Designation"
                              value={exp.jobTitle}
                              onChange={(e) => updateArrayItem('experience', idx, { jobTitle: e.target.value })}
                              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                            />
                            <input
                              type="text"
                              placeholder="Employer / Organization"
                              value={exp.employer}
                              onChange={(e) => updateArrayItem('experience', idx, { employer: e.target.value })}
                              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                            />
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500">From</label>
                                <input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => updateArrayItem('experience', idx, { startDate: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500">To</label>
                                <input
                                  type="month"
                                  disabled={exp.current}
                                  value={exp.current ? '' : exp.endDate}
                                  onChange={(e) => updateArrayItem('experience', idx, { endDate: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white disabled:bg-slate-100"
                                />
                              </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateArrayItem('experience', idx, { current: e.target.checked })}
                              />
                              Currently working in this role
                            </label>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Key responsibilities, deliverables, and outcomes achieved..."
                            value={exp.responsibilities}
                            onChange={(e) => updateArrayItem('experience', idx, { responsibilities: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#032e42] uppercase tracking-wider">Professional Referees</span>
                        <button
                          type="button"
                          onClick={() => addArrayItem('referees', emptyReferee, 3)}
                          className="text-xs font-bold text-[#008000] hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Referee
                        </button>
                      </div>
                      {formData.referees.map((ref, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <input
                            type="text"
                            placeholder={`Referee ${idx + 1} Full Name`}
                            value={ref.name}
                            onChange={(e) => updateArrayItem('referees', idx, { name: e.target.value })}
                            className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Title & Organization"
                            value={ref.organisation}
                            onChange={(e) => updateArrayItem('referees', idx, { organisation: e.target.value })}
                            className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={ref.phone}
                            onChange={(e) => updateArrayItem('referees', idx, { phone: e.target.value })}
                            className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                          />
                          <input
                            type="email"
                            placeholder="Official Email"
                            value={ref.email}
                            onChange={(e) => updateArrayItem('referees', idx, { email: e.target.value })}
                            className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: DOCUMENTS, COVER LETTER & STATUTORY COMPLIANCE */}
                {activeStep === 4 && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-extrabold text-[#032e42] uppercase tracking-wider">
                        4. Required Document Uploads, Cover Letter &amp; Statutory Clearances
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Upload your CV (mandatory), write your Cover Letter, and select compliance documents held.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#032e42] uppercase tracking-wider mb-1.5">
                        1. Curriculum Vitae (CV) *
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-[#008000] transition-colors bg-slate-50/70">
                        {cvFile ? (
                          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-300">
                            <div className="flex items-center gap-2 overflow-hidden text-left">
                              <FileText className="h-5 w-5 text-[#008000] shrink-0" />
                              <span className="text-sm font-bold text-[#032e42] truncate max-w-[320px]">{cvFile.name}</span>
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
                              className="text-slate-500 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                            <UploadCloud className="h-8 w-8 text-[#008000] mb-1.5" />
                            <span className="text-sm font-bold text-[#032e42]">Click to upload Curriculum Vitae (CV)</span>
                            <span className="text-xs text-slate-500 mt-0.5">PDF, DOC or DOCX format (Max 3 MB)</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) =>
                                readAttachmentFile(e, 3, (file, dataUrl) => {
                                  setCvFile(file);
                                  setCvDataUrl(dataUrl);
                                })
                              }
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#032e42] uppercase tracking-wider mb-1.5">
                        2. Academic Certificates, National ID &amp; Testimonials Bundle (Optional)
                      </label>
                      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#008000] transition-colors bg-slate-50/50">
                        {certFile ? (
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 overflow-hidden text-left">
                              <FileText className="h-4 w-4 text-[#032e42] shrink-0" />
                              <span className="text-xs font-bold text-[#032e42] truncate max-w-[320px]">{certFile.name}</span>
                              <span className="text-[11px] text-slate-500">
                                ({(certFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCertFile(null);
                                setCertDataUrl('');
                              }}
                              className="text-slate-500 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex items-center justify-center gap-2 py-1 text-xs font-semibold text-slate-600">
                            <UploadCloud className="h-4 w-4 text-[#032e42]" />
                            <span>Attach Combined PDF of Certificates / National ID (Optional, Max 2.5 MB)</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                readAttachmentFile(e, 2.5, (file, dataUrl) => {
                                  setCertFile(file);
                                  setCertDataUrl(dataUrl);
                                })
                              }
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#032e42] uppercase tracking-wider mb-1.5">
                        3. Chapter Six &amp; Statutory Documents Held / Available Upon Shortlisting
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {STATUTORY_CLEARANCES.map((docName) => {
                          const checked = formData.complianceChecklist.includes(docName);
                          return (
                            <label
                              key={docName}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                checked
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 font-medium'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleComplianceItem(docName)}
                              />
                              <span>{docName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#032e42] uppercase tracking-wider mb-1.5">
                        4. Cover Letter (Addressed to CEO / Human Resources, ECAS Institute)
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Dear Chief Executive Officer / HR Director,&#10;&#10;Please write your formal Cover Letter outlining your qualifications, suitability for the role, and motivation for joining ECAS Institute..."
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW & DECLARATION */}
                {activeStep === 5 && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-extrabold text-[#032e42] uppercase tracking-wider">
                        5. Final Review &amp; Applicant Declaration
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Verify all entered information carefully before final submission.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-[#032e42] uppercase">Personal Details</span>
                          <button type="button" onClick={() => setActiveStep(1)} className="text-[#008000] font-bold hover:underline cursor-pointer">Edit</button>
                        </div>
                        <p><strong>Name:</strong> {formData.fullName}</p>
                        <p><strong>National ID:</strong> {formData.nationalId}</p>
                        <p><strong>Email / Tel:</strong> {formData.email} • {formData.phone}</p>
                        <p><strong>Location:</strong> {formData.county}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-[#032e42] uppercase">Qualifications &amp; Experience</span>
                          <button type="button" onClick={() => setActiveStep(2)} className="text-[#008000] font-bold hover:underline cursor-pointer">Edit</button>
                        </div>
                        <p><strong>Highest Qualification:</strong> {formData.highestQualification}</p>
                        <p><strong>Academic Entries:</strong> {formData.education.filter((e) => e.institution.trim()).length}</p>
                        <p><strong>Work Roles:</strong> {formData.experience.filter((x) => x.jobTitle.trim() || x.employer.trim()).length}</p>
                        <p><strong>Referees Listed:</strong> {formData.referees.filter((r) => r.name.trim()).length}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-900 uppercase">CV, Cover Letter &amp; Compliance</span>
                        <button type="button" onClick={() => setActiveStep(4)} className="text-[#008000] font-bold hover:underline cursor-pointer">Edit</button>
                      </div>
                      <p><strong>CV Document:</strong> {cvFile ? `${cvFile.name} (${(cvFile.size / 1024).toFixed(0)} KB)` : 'Missing'}</p>
                      <p><strong>Certificates Bundle:</strong> {certFile ? certFile.name : 'Not attached (optional)'}</p>
                      <p><strong>Cover Letter:</strong> {formData.coverLetter.trim() ? 'Provided' : 'Not entered (optional)'}</p>
                      <p><strong>Clearances Checked:</strong> {formData.complianceChecklist.length} item(s)</p>
                    </div>

                    <label className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationAccepted}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        <strong>Applicant Declaration *:</strong> I declare that all personal, academic, professional, and compliance details provided in this application are complete and true to the best of my knowledge.
                      </span>
                    </label>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {activeStep > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep((s) => Math.max(1, s - 1));
                          window.scrollTo({ top: 180, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1 cursor-pointer"
                    >
                      Clear Draft
                    </button>
                  </div>

                  {activeStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => validateAndAdvance(activeStep + 1)}
                      className="inline-flex items-center gap-1.5 bg-[#032e42] hover:bg-[#05435e] text-white font-bold px-6 py-3 rounded-xl text-xs shadow cursor-pointer"
                    >
                      <span>Save &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !declarationAccepted}
                      className="inline-flex items-center justify-center gap-2 bg-[#008000] hover:bg-[#006600] text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Submit Application to ECAS Portal
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VacancyApplication;
