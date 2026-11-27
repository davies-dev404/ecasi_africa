import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  FileSpreadsheet,
  Printer,
  Eye,
  Receipt,
  CheckCircle2,
  FileCheck2,
  Upload,
  Trash2,
  X,
  UserCheck,
  History,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminRegistrationService } from '@/services/adminRegistrationService';
import {
  ADMISSION_STAGES,
  getEffectiveRegistrationStage,
  getRegistrationSecurityInfo,
  isRegistrationSecurityBlocked,
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';
import { escapeHtml } from '@/utils/htmlSanitizer';

const PAGE_SIZE = 12;

function getStageBadge(stage) {
  if (stage === 'Completed' || stage === 'Enrolment Confirmed' || stage === 'Payment Confirmed') {
    return 'bg-emerald-50 text-[#16A36A] border-emerald-200';
  }
  if (stage === 'Approved' || stage === 'Training In Progress' || stage === 'Invoice Issued') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (stage === 'Rejected' || stage === 'Withdrawn') {
    return 'bg-red-50 text-[#DC4545] border-red-200';
  }
  return 'bg-amber-50 text-amber-800 border-amber-200';
}

export default function AdmissionsModule({
  activeTab,
  registrations = [],
  invoices = [],
  payments = [],
  communications = [],
  staffAccounts = [],
  currentUser,
  onDataChange,
  onOpenNewRegistration,
  onNavigate,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [securityFilter, setSecurityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [stageNote, setStageNote] = useState('');
  const [docType, setDocType] = useState('National ID / Passport');

  const canWrite = hasPermission(currentUser, 'admissions.write');
  const canFinance = hasPermission(currentUser, 'finance.write');

  // Filter based on active sub-view
  const scopedList = useMemo(() => {
    let list = [...registrations];
    if (activeTab === 'enrolments') {
      list = list.filter((r) => {
        const s = getEffectiveRegistrationStage(r);
        return ['Payment Confirmed', 'Enrolment Confirmed', 'Training In Progress', 'Completed'].includes(s);
      });
    } else if (activeTab === 'application-documents') {
      list = list.filter((r) => (Array.isArray(r.documents) && r.documents.length > 0) || getEffectiveRegistrationStage(r) === 'Documents Required' || true);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        const hay = `${r.referenceNo || ''} ${r.firstName || ''} ${r.lastName || ''} ${r.officialEmail || ''} ${r.personalEmail || ''} ${r.phoneNumber || ''} ${r.organisation || ''} ${r.eventTitle || ''} ${r.venue || ''} ${r.country || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (stageFilter !== 'All') {
      list = list.filter((r) => getEffectiveRegistrationStage(r) === stageFilter);
    }
    if (paymentFilter !== 'All') {
      list = list.filter((r) => (r.paymentStatus || 'Unpaid') === paymentFilter);
    }

    if (securityFilter !== 'All') {
      list = list.filter((r) => {
        const sec = getRegistrationSecurityInfo(r);
        if (securityFilter === 'Low Risk') return sec.riskLevel === 'LOW RISK';
        if (securityFilter === 'Medium Risk') return sec.riskLevel === 'MEDIUM RISK';
        if (securityFilter === 'High Risk') return sec.riskLevel === 'HIGH RISK';
        if (securityFilter === 'Critical Risk') return sec.riskLevel === 'CRITICAL RISK';
        if (securityFilter === 'Unverified Organizations') return sec.orgVerification.toLowerCase().includes('unverified') || sec.orgVerification.toLowerCase().includes('pending');
        if (securityFilter === 'Unverified Emails') return !sec.emailVerification.toLowerCase().includes('verified (otp)');
        if (securityFilter === 'Unverified Phone Numbers') return !sec.phoneVerification.toLowerCase().includes('valid');
        if (securityFilter === 'Duplicate Applications') return sec.isDuplicate;
        if (securityFilter === 'Security Review Required') return sec.requiresSecurityReview;
        if (securityFilter === 'Security Cleared') return sec.securityClearance === 'Cleared' || sec.securityClearance.includes('Auto-Cleared');
        if (securityFilter === 'Rejected Fraudulent Applications') return sec.securityClearance.includes('Rejected');
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
      if (sortBy === 'fee-desc') return (Number(b.totalFee) || 0) - (Number(a.totalFee) || 0);
      if (sortBy === 'risk-desc') return getRegistrationSecurityInfo(b).riskScore - getRegistrationSecurityInfo(a).riskScore;
      if (sortBy === 'name') return `${a.firstName || ''} ${a.lastName || ''}`.localeCompare(`${b.firstName || ''} ${b.lastName || ''}`);
      return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
    });
    return list;
  }, [registrations, activeTab, search, stageFilter, paymentFilter, securityFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(scopedList.length / PAGE_SIZE));
  const pagedList = scopedList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Refresh selectedProfile when registrations update
  const activeProfile = useMemo(
    () => (selectedProfile ? registrations.find((r) => r.id === selectedProfile.id) || selectedProfile : null),
    [selectedProfile, registrations]
  );

  const handleStageUpdate = (reg, newStage) => {
    if (!canWrite) return;
    const res = msimamiziEnterpriseService.updateRegistrationWorkflow(reg.id, newStage, stageNote, currentUser);
    if (res?.blocked) {
      alert(res.error);
      return;
    }
    setStageNote('');
    onDataChange();
    showToast(`${reg.referenceNo} moved to "${newStage}".`);
  };

  const handleAssignOfficer = (reg, officerEmail) => {
    if (!canWrite) return;
    adminRegistrationService.updateRegistration(reg.id, { assignedOfficer: officerEmail });
    msimamiziEnterpriseService.logAudit(currentUser, 'ASSIGN_ADMISSIONS_OFFICER', 'Registration', reg.referenceNo, reg.assignedOfficer || 'Unassigned', officerEmail);
    onDataChange();
    showToast(`Assigned ${reg.referenceNo} to ${officerEmail || 'Unassigned'}.`);
  };

  const handleGenerateInvoice = (reg) => {
    if (!canFinance) {
      alert('Your role does not have Finance write permission to generate invoices.');
      return;
    }
    if (isRegistrationSecurityBlocked(reg)) {
      const sec = getRegistrationSecurityInfo(reg);
      alert(`Security Gate Blocked: ${reg.referenceNo} (${sec.riskLevel}, Score ${sec.riskScore}/100) must be cleared in the Security Review Queue before issuing an invoice.`);
      return;
    }
    const existing = invoices.find((i) => i.registrationId === reg.id && i.status !== 'Cancelled');
    if (existing) {
      showToast(`Invoice ${existing.invoiceNo} already exists for ${reg.referenceNo}. Opening Invoices...`);
      onNavigate('invoices');
      return;
    }
    const inv = msimamiziEnterpriseService.createInvoice(
      {
        registrationId: reg.id,
        applicantName: [reg.firstName, reg.middleName, reg.lastName].filter(Boolean).join(' '),
        applicantEmail: reg.officialEmail || reg.personalEmail || '',
        organisation: reg.organisation || '',
        courseTitle: reg.eventTitle || 'Executive Training Programme',
        courseSlug: reg.courseSlug || '',
        cohortName: reg.cohortName || reg.durationText || '',
        destination: reg.venue || 'Nairobi, Kenya',
        currency: reg.currency || 'USD',
        amount: Number(reg.totalFee) || 1200,
        discount: Number(reg.discountAmount) || 0,
      },
      currentUser
    );
    if (inv?.blocked) {
      alert(inv.error);
      return;
    }
    onDataChange();
    showToast(`Invoice ${inv.invoiceNo} generated and linked to ${reg.referenceNo}!`);
  };

  const handleUploadApplicantDoc = (reg, file) => {
    if (!canWrite || !file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Please upload a document up to 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const nextDoc = {
        id: `DOC-${Date.now()}`,
        name: file.name,
        type: docType,
        verified: false,
        uploadedAt: new Date().toISOString(),
        dataUrl: ev.target.result,
      };
      const updatedDocs = [nextDoc, ...(Array.isArray(reg.documents) ? reg.documents : [])];
      adminRegistrationService.updateRegistration(reg.id, { documents: updatedDocs });
      msimamiziEnterpriseService.logAudit(currentUser, 'UPLOAD_APPLICANT_DOCUMENT', 'Registration', reg.referenceNo, '', `${docType}: ${file.name}`);
      onDataChange();
      showToast(`Uploaded "${file.name}" to ${reg.referenceNo}.`);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleVerifyDoc = (reg, docId) => {
    if (!canWrite) return;
    const updatedDocs = (reg.documents || []).map((d) =>
      d.id === docId
        ? {
            ...d,
            verified: !d.verified,
            verifiedBy: !d.verified ? currentUser?.email || 'admin' : '',
            verifiedAt: !d.verified ? new Date().toISOString() : '',
          }
        : d
    );
    adminRegistrationService.updateRegistration(reg.id, { documents: updatedDocs });
    msimamiziEnterpriseService.logAudit(currentUser, 'VERIFY_APPLICANT_DOCUMENT', 'Registration', reg.referenceNo, '', `Document ${docId} verification toggled`);
    onDataChange();
  };

  const exportRows = () => ({
    headers: ['Reg No', 'Applicant', 'Email', 'Phone', 'Country', 'Course', 'Destination', 'Cohort', 'Date', 'Workflow Stage', 'Payment Status', 'Fee (USD)', 'Assigned Officer'],
    rows: scopedList.map((r) => [
      r.referenceNo || r.id,
      [r.title, r.firstName, r.middleName, r.lastName].filter(Boolean).join(' '),
      r.officialEmail || r.personalEmail || '',
      `${r.dialCode || ''} ${r.phoneNumber || ''}`.trim(),
      r.country || '',
      r.eventTitle || '',
      r.venue || '',
      r.cohortName || r.durationText || '',
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '',
      getEffectiveRegistrationStage(r),
      r.paymentStatus || 'Unpaid',
      r.totalFee || 0,
      r.assignedOfficer || 'Unassigned',
    ]),
  });

  const titleMap = {
    registrations: 'Registration Directory',
    applicants: 'Applicants & Admissions Pipeline',
    enrolments: 'Confirmed Enrolments & Active Trainees',
    'application-documents': 'Application Documents & Verification Desk',
  };

  // Detailed Applicant Profile View
  if (activeProfile) {
    const fullName = [activeProfile.title, activeProfile.firstName, activeProfile.middleName, activeProfile.lastName].filter(Boolean).join(' ');
    const stage = getEffectiveRegistrationStage(activeProfile);
    const linkedInvoices = invoices.filter((i) => i.registrationId === activeProfile.id);
    const linkedPayments = payments.filter((p) => p.registrationId === activeProfile.id || linkedInvoices.some((i) => i.id === p.invoiceId));
    const linkedComms = communications.filter(
      (c) =>
        c.linkedEntityId === activeProfile.id ||
        (activeProfile.officialEmail && c.recipientContact === activeProfile.officialEmail) ||
        (activeProfile.personalEmail && c.recipientContact === activeProfile.personalEmail)
    );

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedProfile(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#10243E] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to {titleMap[activeTab] || 'Registrations'}
          </button>
          <div className="flex items-center gap-2">
            {canFinance && (
              <button
                type="button"
                onClick={() => handleGenerateInvoice(activeProfile)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B8B0] hover:bg-[#009c95] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" /> Generate Invoice
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const html = `
                  <h3>Applicant Profile — ${escapeHtml(fullName)}</h3>
                  <table>
                    <tr><th>Registration No</th><td>${escapeHtml(activeProfile.referenceNo)}</td><th>Workflow Stage</th><td>${escapeHtml(stage)}</td></tr>
                    <tr><th>Email</th><td>${escapeHtml(activeProfile.officialEmail || activeProfile.personalEmail || '—')}</td><th>Phone</th><td>${escapeHtml(`${activeProfile.dialCode || ''} ${activeProfile.phoneNumber || ''}`)}</td></tr>
                    <tr><th>Organisation</th><td>${escapeHtml(activeProfile.organisation || '—')}</td><th>Country</th><td>${escapeHtml(activeProfile.country || '—')}</td></tr>
                    <tr><th>Course</th><td>${escapeHtml(activeProfile.eventTitle)}</td><th>Destination</th><td>${escapeHtml(activeProfile.venue)}</td></tr>
                    <tr><th>Cohort / Dates</th><td>${escapeHtml(activeProfile.cohortName || activeProfile.durationText || '—')}</td><th>Total Fee</th><td>${escapeHtml(activeProfile.currency || 'USD')} ${Number(activeProfile.totalFee || 0).toLocaleString()}</td></tr>
                  </table>
                `;
                msimamiziEnterpriseService.printInstitutionalDocument(`Applicant Profile - ${activeProfile.referenceNo}`, html, currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071C2D] text-white text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#00B8B0]" /> Print Profile
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#071C2D] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#00B8B0] uppercase tracking-wider">
                {activeProfile.referenceNo} • {activeProfile.country || 'Kenya'}
              </span>
              <h2 className="text-xl font-black mt-1">{fullName || 'Applicant'}</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeProfile.jobTitle ? `${activeProfile.jobTitle} — ` : ''}
                {activeProfile.organisation || 'Individual Delegate'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStageBadge(stage)}`}>
                {stage}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
                Payment: {activeProfile.paymentStatus || 'Unpaid'}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 & 2: Details + Documents + Financial History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200/80 space-y-1.5">
                  <h4 className="font-extrabold text-[#10243E] uppercase text-[10px] tracking-wider">Contact &amp; Personal</h4>
                  <p><strong>Official Email:</strong> {activeProfile.officialEmail || '—'}</p>
                  <p><strong>Personal Email:</strong> {activeProfile.personalEmail || '—'}</p>
                  <p><strong>Phone:</strong> {activeProfile.dialCode || ''} {activeProfile.phoneNumber || '—'}</p>
                  <p><strong>Academic Background:</strong> {activeProfile.academicBackground || 'Not specified'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200/80 space-y-1.5">
                  <h4 className="font-extrabold text-[#10243E] uppercase text-[10px] tracking-wider">Programme &amp; Cohort</h4>
                  <p><strong>Course:</strong> {activeProfile.eventTitle}</p>
                  <p><strong>Destination:</strong> {activeProfile.venue || 'Nairobi, Kenya'}</p>
                  <p><strong>Cohort / Schedule:</strong> {activeProfile.cohortName || activeProfile.durationText || 'Standard Intake'}</p>
                  <p><strong>Total Fee:</strong> {activeProfile.currency || 'USD'} {Number(activeProfile.totalFee || 0).toLocaleString()} ({activeProfile.participantsCount || 1} delegate)</p>
                </div>
              </div>

              {/* Uploaded Documents & Verification */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-[#10243E] uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#00B8B0]" /> Uploaded Documents &amp; Verification
                  </h4>
                  {canWrite && (
                    <div className="flex items-center gap-2">
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="h-8 px-2 rounded-lg border border-slate-200 text-[11px] bg-white"
                      >
                        <option>National ID / Passport</option>
                        <option>Academic Certificate</option>
                        <option>Employer Nomination Letter</option>
                        <option>LPO / Sponsorship Letter</option>
                        <option>Payment Proof / Slip</option>
                      </select>
                      <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#071C2D] text-white text-[11px] font-bold cursor-pointer">
                        <Upload className="w-3 h-3 text-[#00B8B0]" /> Attach File
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadApplicantDoc(activeProfile, e.target.files[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {(!activeProfile.documents || activeProfile.documents.length === 0) ? (
                  <p className="text-xs text-[#718096] bg-[#F5F8FC] rounded-lg p-3">No supporting documents uploaded for this applicant yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activeProfile.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#F5F8FC] border border-slate-200 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-[#10243E] truncate">{doc.name}</p>
                          <p className="text-[11px] text-[#718096]">
                            {doc.type} • {doc.verified ? `Verified by ${doc.verifiedBy}` : 'Pending Verification'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {doc.dataUrl && (
                            <a href={doc.dataUrl} download={doc.name} className="px-2 py-1 rounded bg-white border border-slate-200 text-[11px] font-bold text-[#10243E]">
                              Download
                            </a>
                          )}
                          {canWrite && (
                            <button
                              type="button"
                              onClick={() => handleToggleVerifyDoc(activeProfile, doc.id)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                                doc.verified ? 'bg-emerald-100 text-[#16A36A]' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doc.verified ? 'Verified ✓' : 'Verify Doc'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Invoices & Payments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                  <h4 className="text-xs font-extrabold text-[#10243E] uppercase tracking-wider">Invoice History ({linkedInvoices.length})</h4>
                  {linkedInvoices.length === 0 ? (
                    <p className="text-xs text-[#718096]">No invoices generated yet.</p>
                  ) : (
                    linkedInvoices.map((inv) => (
                      <div key={inv.id} className="p-2.5 rounded-lg bg-[#F5F8FC] text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#10243E]">{inv.invoiceNo}</p>
                          <p className="text-[11px] text-[#718096]">Due: {inv.dueDate || '—'} • {inv.status}</p>
                        </div>
                        <span className="font-black text-[#10243E]">{inv.currency} {Number(inv.netAmount || 0).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                  <h4 className="text-xs font-extrabold text-[#10243E] uppercase tracking-wider">Payment History ({linkedPayments.length})</h4>
                  {linkedPayments.length === 0 ? (
                    <p className="text-xs text-[#718096]">No verified payments recorded yet.</p>
                  ) : (
                    linkedPayments.map((pay) => (
                      <div key={pay.id} className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#16A36A]">{pay.reference}</p>
                          <p className="text-[11px] text-[#718096]">{pay.method} • {pay.transactionDate}</p>
                        </div>
                        <span className="font-black text-[#16A36A]">{pay.currency} {Number(pay.amount || 0).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Communication History */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <h4 className="text-xs font-extrabold text-[#10243E] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#00B8B0]" /> Communication History ({linkedComms.length})
                </h4>
                {linkedComms.length === 0 ? (
                  <p className="text-xs text-[#718096]">No direct communications logged for this applicant yet.</p>
                ) : (
                  linkedComms.slice(0, 6).map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-[#F5F8FC] text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#10243E]">[{c.channel}] {c.subject}</span>
                        <span className="text-[10px] text-[#718096]">{new Date(c.sentAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-[#718096] mt-0.5 line-clamp-2">{c.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: 12-Stage Workflow Control & Audit Timeline */}
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 p-4 bg-[#F5F8FC] space-y-3">
                <h4 className="text-xs font-extrabold text-[#10243E] uppercase tracking-wider">12-Stage Admissions Workflow</h4>
                <div>
                  <label className="block text-[11px] font-bold text-[#718096] mb-1">Decision / Stage Note</label>
                  <input
                    type="text"
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                    placeholder="Optional note recorded in audit trail..."
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#718096] mb-1">Update Workflow Stage</label>
                  <select
                    disabled={!canWrite}
                    value={stage}
                    onChange={(e) => handleStageUpdate(activeProfile, e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-[#10243E]"
                  >
                    {ADMISSION_STAGES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#718096] mb-1">Assigned Admissions Officer</label>
                  <select
                    disabled={!canWrite}
                    value={activeProfile.assignedOfficer || ''}
                    onChange={(e) => handleAssignOfficer(activeProfile, e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="">Unassigned</option>
                    {staffAccounts.map((acc) => (
                      <option key={acc.email} value={acc.email}>{acc.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#718096] mb-1">Internal Notes</label>
                  <textarea
                    rows={3}
                    disabled={!canWrite}
                    defaultValue={activeProfile.adminNotes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (activeProfile.adminNotes || '')) {
                        adminRegistrationService.updateRegistration(activeProfile.id, { adminNotes: e.target.value });
                        onDataChange();
                        showToast('Internal notes saved.');
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                <h4 className="text-xs font-extrabold text-[#10243E] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#00B8B0]" /> Timestamped Application History
                </h4>
                {(!activeProfile.statusHistory || activeProfile.statusHistory.length === 0) ? (
                  <p className="text-xs text-[#718096]">Initial submission recorded on {activeProfile.submittedAt ? new Date(activeProfile.submittedAt).toLocaleString() : 'N/A'}.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeProfile.statusHistory.map((h, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#F5F8FC] border-l-2 border-[#00B8B0] text-[11px]">
                        <p className="font-bold text-[#10243E]">{h.stage}</p>
                        <p className="text-[#718096]">{h.note}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {h.by} • {new Date(h.at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header & Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#00B8B0]" />
              {titleMap[activeTab] || 'Registration Directory'}
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#10243E]">
                {scopedList.length}
              </span>
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              12-stage institutional admissions lifecycle with document verification, officer assignment &amp; invoicing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canWrite && (
              <button
                type="button"
                onClick={onOpenNewRegistration}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B8B0] hover:bg-[#009c95] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Registration
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const { headers, rows } = exportRows();
                msimamiziEnterpriseService.exportCSV(headers, rows, `ECAS_Admissions_${new Date().toISOString().slice(0, 10)}.csv`, currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 border border-slate-200 text-xs font-bold text-[#10243E] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              type="button"
              onClick={() => {
                const { headers, rows } = exportRows();
                msimamiziEnterpriseService.exportExcel(headers, rows, `ECAS_Admissions_${new Date().toISOString().slice(0, 10)}.xls`, 'ECAS Admissions Directory', currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 border border-slate-200 text-xs font-bold text-[#10243E] cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#16A36A]" /> Excel
            </button>
            <button
              type="button"
              onClick={() => {
                const { headers, rows } = exportRows();
                const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
                msimamiziEnterpriseService.printInstitutionalDocument('ECAS Admissions Directory Report', html, currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#071C2D] text-white text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#00B8B0]" /> PDF
            </button>
          </div>
        </div>

        {/* Search & Filters (Includes All 12 Security & Risk Filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, ref, email, org..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00B8B0]"
            />
          </div>
          <select
            value={securityFilter}
            onChange={(e) => { setSecurityFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-[#10243E]"
          >
            <option value="All">All Security &amp; Risk Levels</option>
            <option value="Low Risk">Low Risk (0–29)</option>
            <option value="Medium Risk">Medium Risk (30–59)</option>
            <option value="High Risk">High Risk (60–79)</option>
            <option value="Critical Risk">Critical Risk (80–100)</option>
            <option value="Security Review Required">Security Review Required</option>
            <option value="Security Cleared">Security Cleared</option>
            <option value="Unverified Organizations">Unverified Organizations</option>
            <option value="Unverified Emails">Unverified Emails</option>
            <option value="Unverified Phone Numbers">Unverified Phone Numbers</option>
            <option value="Duplicate Applications">Duplicate Applications</option>
            <option value="Rejected Fraudulent Applications">Rejected Fraudulent Applications</option>
          </select>
          <select
            value={stageFilter}
            onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-[#10243E]"
          >
            <option value="All">All Workflow Stages</option>
            {ADMISSION_STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-[#10243E]"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Invoiced">Invoiced</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-[#10243E]"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="risk-desc">Sort: Highest Risk First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="fee-desc">Sort: Highest Fee</option>
            <option value="name">Sort: Applicant A–Z</option>
          </select>
        </div>
      </div>

      {/* Responsive Admissions Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#071C2D] text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Reg No / Date</th>
                <th className="py-3 px-4">Applicant &amp; Org</th>
                <th className="py-3 px-4">Course &amp; Destination</th>
                <th className="py-3 px-4">Risk &amp; Clearance</th>
                <th className="py-3 px-4">Workflow Stage</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Officer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#718096]">
                    <p className="font-bold text-[#10243E]">No matching records in {titleMap[activeTab] || 'Registrations'}.</p>
                    <p className="text-[11px] mt-1">Adjust filters or click &ldquo;New Registration&rdquo; to enrol a delegate.</p>
                  </td>
                </tr>
              ) : (
                pagedList.map((reg) => {
                  const fullName = [reg.firstName, reg.lastName].filter(Boolean).join(' ') || 'Applicant';
                  const stage = getEffectiveRegistrationStage(reg);
                  const sec = getRegistrationSecurityInfo(reg);
                  return (
                    <tr key={reg.id} className="hover:bg-[#F5F8FC]/80 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-mono font-bold text-[#10243E]">{reg.referenceNo || reg.id}</p>
                        <p className="text-[10.5px] text-[#718096]">{reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString() : '—'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#10243E]">{fullName}</p>
                        <p className="text-[11px] text-[#718096]">{reg.officialEmail || reg.personalEmail || '—'}</p>
                        <p className="text-[10.5px] text-slate-400">{reg.country || 'Kenya'} • {reg.organisation || 'Individual'}</p>
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <p className="font-semibold text-[#10243E] truncate" title={reg.eventTitle}>{reg.eventTitle}</p>
                        <p className="text-[11px] text-[#718096] truncate">{reg.venue || 'Nairobi'} • {reg.cohortName || reg.durationText || 'Standard'}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          sec.riskLevel === 'CRITICAL RISK' ? 'bg-red-100 text-[#DC4545] border-red-200' :
                          sec.riskLevel === 'HIGH RISK' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          sec.riskLevel === 'MEDIUM RISK' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-emerald-50 text-[#16A36A] border-emerald-200'
                        }`}>
                          {sec.riskScore}/100 • {sec.riskLevel.replace(' RISK', '')}
                        </span>
                        <p className="text-[10px] text-[#718096] mt-0.5">{sec.securityClearance}</p>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={!canWrite}
                          value={stage}
                          onChange={(e) => handleStageUpdate(reg, e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${getStageBadge(stage)}`}
                        >
                          {ADMISSION_STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-black text-[#10243E]">{reg.currency || 'USD'} {Number(reg.totalFee || 0).toLocaleString()}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.paymentStatus === 'Paid' ? 'bg-emerald-100 text-[#16A36A]' :
                          reg.paymentStatus === 'Invoiced' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {reg.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#718096]">
                        {reg.assignedOfficer ? reg.assignedOfficer.split('@')[0] : 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedProfile(reg)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#071C2D] hover:bg-[#102D49] text-white text-[11px] font-bold cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#00B8B0]" /> Profile
                          </button>
                          {canFinance && (
                            <button
                              type="button"
                              onClick={() => handleGenerateInvoice(reg)}
                              title="Generate Invoice"
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canWrite && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete registration ${reg.referenceNo}?`)) {
                                  adminRegistrationService.deleteRegistration(reg.id);
                                  onDataChange();
                                  showToast(`Deleted registration ${reg.referenceNo}.`);
                                }
                              }}
                              title="Delete Registration"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC4545] hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {scopedList.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#718096]">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, scopedList.length)} of {scopedList.length}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-[#10243E] px-2">Page {page} / {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
