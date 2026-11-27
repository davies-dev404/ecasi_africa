import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Eye,
  Download,
  Plus,
  Search,
  Lock,
  Activity,
  Globe,
  Mail,
  Phone,
  Building2,
  Flag,
  ChevronLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  getRegistrationSecurityInfo,
  getEffectiveRegistrationStage,
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

const INCIDENT_PHASES = [
  '1. Detected',
  '2. Alert Generated',
  '3. Severity Assessed',
  '4. Contained',
  '5. Logs Preserved',
  '6. Investigating',
  '7. Restored',
  '8. Documented',
  '9. Controls Improved',
];

function getRiskBadgeClass(level) {
  if (level === 'CRITICAL RISK') return 'bg-red-100 text-[#DC4545] border-red-300';
  if (level === 'HIGH RISK') return 'bg-orange-100 text-orange-800 border-orange-300';
  if (level === 'MEDIUM RISK') return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-emerald-100 text-[#16A36A] border-emerald-200';
}

function getSeverityBadge(sev) {
  if (sev === 'CRITICAL') return 'bg-red-100 text-[#DC4545] border-red-200';
  if (sev === 'HIGH') return 'bg-orange-100 text-orange-800 border-orange-200';
  if (sev === 'MEDIUM') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function SecurityCenterModule({
  activeTab,
  registrations = [],
  securityAlerts = [],
  securityIncidents = [],
  securityStats = {},
  currentUser,
  onDataChange,
  showToast,
}) {
  const [queueFilter, setQueueFilter] = useState('Needs Review');
  const [queueSearch, setQueueSearch] = useState('');
  const [selectedRegId, setSelectedRegId] = useState(null);
  const [justification, setJustification] = useState('');
  const [orgVerInput, setOrgVerInput] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const [alertFilter, setAlertFilter] = useState('All');
  const [dateRangeDays, setDateRangeDays] = useState('all');
  const [incidentFormOpen, setIncidentFormOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    category: 'Suspicious Registration / Fraud',
    severity: 'HIGH',
    phase: '1. Detected',
    affectedComponent: '',
    containmentActions: '',
    rootCause: '',
    status: 'Open',
  });

  const canReview = hasPermission(currentUser, 'security.review');

  const enrichedRegs = useMemo(
    () => registrations.map((r) => ({ reg: r, sec: getRegistrationSecurityInfo(r) })),
    [registrations]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SECURITY REVIEW QUEUE (Mandatory Admissions Security Gate)
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === 'security-review-queue') {
    const selectedItem = selectedRegId ? enrichedRegs.find((x) => x.reg.id === selectedRegId) : null;

    const handleDecision = async (decision) => {
      if (!selectedItem) return;
      if (!justification.trim() || justification.trim().length < 5) {
        alert('A written officer justification (minimum 5 characters) is mandatory for every security decision.');
        return;
      }
      setSubmittingDecision(true);
      const res = await msimamiziEnterpriseService.submitSecurityReviewDecision(
        {
          registrationId: selectedItem.reg.id,
          decision,
          justification: justification.trim(),
          orgVerification: orgVerInput.trim() || undefined,
        },
        currentUser
      );
      setSubmittingDecision(false);
      if (!res.success) {
        alert(res.error || 'Could not record decision.');
        return;
      }
      setJustification('');
      setOrgVerInput('');
      onDataChange();
      showToast(`Security decision (${decision}) recorded & audited for ${selectedItem.reg.referenceNo}.`);
    };

    if (selectedItem) {
      const { reg, sec } = selectedItem;
      const fullName = [reg.title, reg.firstName, reg.middleName, reg.lastName].filter(Boolean).join(' ');
      return (
        <div className="space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSelectedRegId(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-bold text-[#10243E] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Security Review Queue
            </button>
            <span className={`px-3 py-1 rounded-full border font-black ${getRiskBadgeClass(sec.riskLevel)}`}>
              Risk Score: {sec.riskScore}/100 — {sec.riskLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Investigation Evidence Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-mono text-[11px] font-bold text-[#00B8B0]">{reg.referenceNo}</p>
                    <h2 className="text-lg font-black text-[#10243E]">{fullName}</h2>
                    <p className="text-[#718096]">{reg.eventTitle} • {reg.venue}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase text-[#718096]">Security Clearance</span>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      sec.securityClearance === 'Cleared' ? 'bg-emerald-100 text-[#16A36A]' :
                      sec.securityClearance.includes('Rejected') ? 'bg-red-100 text-[#DC4545]' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {sec.securityClearance}
                    </span>
                  </div>
                </div>

                {/* Verification Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F5F8FC] border border-slate-200/80 space-y-1">
                    <p className="font-bold text-[#10243E] flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-[#00B8B0]" /> Organization</p>
                    <p className="font-semibold text-slate-800">{reg.organisation || 'Unspecified'}</p>
                    {reg.organisationWebsite && <p className="text-[10.5px] font-mono text-blue-700 break-all">{reg.organisationWebsite}</p>}
                    {reg.organisationRegNo && <p className="text-[10.5px] text-slate-600">Reg No: {reg.organisationRegNo}</p>}
                    <p className="text-[10.5px] font-bold text-[#00B8B0]">{sec.orgVerification}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F8FC] border border-slate-200/80 space-y-1">
                    <p className="font-bold text-[#10243E] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#00B8B0]" /> Email Verification</p>
                    <p className="font-semibold text-slate-800 break-all">{reg.officialEmail || reg.personalEmail || '—'}</p>
                    <p className="text-[10.5px] font-bold text-[#00B8B0]">{sec.emailVerification}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F8FC] border border-slate-200/80 space-y-1">
                    <p className="font-bold text-[#10243E] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#00B8B0]" /> Phone &amp; Origin</p>
                    <p className="font-semibold text-slate-800">{reg.dialCode} {reg.phoneNumber}</p>
                    <p className="text-[10.5px] text-slate-600">Country: {reg.country || 'Kenya'}</p>
                    <p className="text-[10.5px] font-bold text-[#00B8B0]">{sec.phoneVerification}</p>
                  </div>
                </div>

                {/* Explainable Risk Indicators */}
                <div className="space-y-2">
                  <h3 className="font-black text-[#10243E] text-sm">Explainable Risk Indicators ({sec.reasons.length})</h3>
                  {sec.reasons.length === 0 ? (
                    <p className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                      No elevated risk signals detected during automated screening.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sec.reasons.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3">
                          <div>
                            <span className="font-mono text-[10px] font-black text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded">{r.signal}</span>
                            <p className="text-slate-800 mt-1">{r.detail}</p>
                          </div>
                          <span className="font-black text-[#DC4545] shrink-0">+{r.weight} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Officer Review History */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h3 className="font-black text-[#10243E] text-sm">Security Review Audit Trail</h3>
                  {sec.reviewHistory.length === 0 ? (
                    <p className="text-[#718096]">No officer review actions logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {sec.reviewHistory.map((h, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#F5F8FC] border-l-4 border-[#00B8B0]">
                          <div className="flex justify-between font-bold text-[#10243E]">
                            <span>{h.decision} — {h.officer} ({h.role})</span>
                            <span className="text-[10px] text-[#718096]">{new Date(h.at).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{h.justification}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Officer Decision Control Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
              <div className="flex items-center gap-2 text-[#10243E]">
                <ShieldCheck className="w-5 h-5 text-[#00B8B0]" />
                <h3 className="text-sm font-black">Officer Verification Controls</h3>
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Every decision requires documented justification and is permanently recorded in the immutable audit log. Clearing an application unlocks the 12-stage admissions &amp; invoicing workflow.
              </p>

              <div>
                <label className="block font-bold text-[#10243E] mb-1">Organization Verification Status</label>
                <select
                  value={orgVerInput}
                  onChange={(e) => setOrgVerInput(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">Keep Current ({sec.orgVerification})</option>
                  <option value="Verified by Officer">Verified by Officer</option>
                  <option value="Verified via Official Registry">Verified via Official Registry</option>
                  <option value="Unverified — Pending Docs">Unverified — Pending Docs</option>
                  <option value="Confirmed Fraudulent / Fake">Confirmed Fraudulent / Fake</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#10243E] mb-1">Mandatory Justification / Investigation Notes *</label>
                <textarea
                  rows={4}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Document phone/email confirmation, registry check, false-positive reason, or fraud evidence..."
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              {canReview ? (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision('Clear')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#16A36A] hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Grant Security Clearance (Allow Invoicing)
                  </button>
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision('ClearFalsePositive')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#00B8B0] hover:bg-teal-600 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" /> Clear as False Positive
                  </button>
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision('VerifyOrg')}
                    className="w-full py-2 px-3 rounded-xl bg-[#071C2D] hover:bg-[#102D49] text-white font-bold cursor-pointer"
                  >
                    Mark Organization Verified
                  </button>
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision('RequestDocs')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold cursor-pointer"
                  >
                    Request Supporting Documentation
                  </button>
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision('Escalate')}
                    className="w-full py-2 px-3 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" /> Escalate to Super Admin
                  </button>
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision('RejectFraud')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#DC4545] hover:bg-red-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Reject Fraudulent Application (Preserve Evidence)
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-600 font-semibold">
                  View-only access. Only Super Admins and Verification Officers may grant security clearance.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    const filteredQueue = enrichedRegs.filter(({ reg, sec }) => {
      if (queueFilter === 'Needs Review' && !sec.requiresSecurityReview) return false;
      if (queueFilter === 'Critical' && sec.riskLevel !== 'CRITICAL RISK') return false;
      if (queueFilter === 'High' && sec.riskLevel !== 'HIGH RISK') return false;
      if (queueFilter === 'Medium' && sec.riskLevel !== 'MEDIUM RISK') return false;
      if (queueFilter === 'Cleared' && sec.securityClearance !== 'Cleared') return false;
      if (queueFilter === 'Rejected' && !sec.securityClearance.includes('Rejected')) return false;
      if (queueSearch.trim()) {
        const q = queueSearch.toLowerCase();
        const hay = `${reg.referenceNo || ''} ${reg.firstName || ''} ${reg.lastName || ''} ${reg.organisation || ''} ${reg.officialEmail || ''} ${reg.personalEmail || ''} ${reg.country || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.sec.riskScore - a.sec.riskScore);

    const pendingCount = enrichedRegs.filter((x) => x.sec.requiresSecurityReview).length;

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#DC4545]" /> Admissions Security Review Queue ({pendingCount} Pending Gate)
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Mandatory pre-invoicing fraud &amp; verification gate. High-risk and critical-risk registrations cannot progress to invoicing or confirmation until explicitly cleared.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['Needs Review', 'Critical', 'High', 'Medium', 'Cleared', 'Rejected', 'All'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setQueueFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  queueFilter === f ? 'bg-[#071C2D] text-white' : 'bg-[#F5F8FC] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                placeholder="Search reference, applicant, organization, email, or country..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <span className="text-xs font-bold text-[#718096]">{filteredQueue.length} record(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#071C2D] text-white text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Ref / Applicant</th>
                  <th className="py-3 px-4">Organization &amp; Country</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Verifications</th>
                  <th className="py-3 px-4">Security Clearance</th>
                  <th className="py-3 px-4">Workflow Stage</th>
                  <th className="py-3 px-4 text-right">Investigate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#718096]">
                      No registrations in &ldquo;{queueFilter}&rdquo; view. All screened registrations are clean or already cleared.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(({ reg, sec }) => (
                    <tr key={reg.id} className="hover:bg-[#F5F8FC]">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#00B8B0] block">{reg.referenceNo}</span>
                        <span className="font-bold text-[#10243E]">{[reg.firstName, reg.lastName].filter(Boolean).join(' ')}</span>
                        <span className="block text-[10.5px] text-[#718096]">{reg.officialEmail || reg.personalEmail}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#10243E] block">{reg.organisation || 'Self-Sponsored'}</span>
                        <span className="text-[10.5px] text-[#718096]">{reg.country || 'Kenya'}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full border text-[10.5px] font-black ${getRiskBadgeClass(sec.riskLevel)}`}>
                          {sec.riskScore}/100 • {sec.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10.5px] space-y-0.5">
                        <div><strong>Org:</strong> {sec.orgVerification}</div>
                        <div><strong>Email:</strong> {sec.emailVerification}</div>
                        <div><strong>Phone:</strong> {sec.phoneVerification}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          sec.securityClearance === 'Cleared' || sec.securityClearance.includes('Auto-Cleared')
                            ? 'bg-emerald-100 text-[#16A36A]'
                            : sec.securityClearance.includes('Rejected')
                              ? 'bg-red-100 text-[#DC4545]'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sec.securityClearance}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-[#10243E]">
                        {getEffectiveRegistrationStage(reg)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRegId(reg.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#071C2D] hover:bg-[#00B8B0] text-white font-bold text-[11px] cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Investigate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SECURITY ANALYTICS DASHBOARD (Real Database Metrics + Interactive Charts)
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === 'security-dashboard') {
    const cutoffMs = dateRangeDays === 'all' ? 0 : Date.now() - Number(dateRangeDays) * 86400000;
    const scopedRegs = enrichedRegs.filter(({ reg }) => !cutoffMs || (reg.submittedAt && new Date(reg.submittedAt).getTime() >= cutoffMs));
    const scopedAlerts = securityAlerts.filter((a) => !cutoffMs || (a.createdAt && new Date(a.createdAt).getTime() >= cutoffMs));

    const lowCount = scopedRegs.filter((x) => x.sec.riskLevel === 'LOW RISK').length;
    const medCount = scopedRegs.filter((x) => x.sec.riskLevel === 'MEDIUM RISK').length;
    const highCount = scopedRegs.filter((x) => x.sec.riskLevel === 'HIGH RISK').length;
    const critCount = scopedRegs.filter((x) => x.sec.riskLevel === 'CRITICAL RISK').length;
    const orgVerifiedCount = scopedRegs.filter((x) => x.sec.orgVerification.toLowerCase().includes('verified') && !x.sec.orgVerification.toLowerCase().includes('unverified')).length;
    const orgAwaitingCount = scopedRegs.length - orgVerifiedCount;
    const dupCount = scopedRegs.filter((x) => x.sec.isDuplicate).length;
    const pendingRevCount = scopedRegs.filter((x) => x.sec.requiresSecurityReview).length;
    const fpCount = Math.max(Number(securityStats?.falsePositivesCleared) || 0, scopedRegs.filter((x) => x.sec.falsePositiveCleared).length);

    const riskChart = [
      { name: 'Low (0–29)', count: lowCount, color: '#16A36A' },
      { name: 'Medium (30–59)', count: medCount, color: '#F0A020' },
      { name: 'High (60–79)', count: highCount, color: '#EA580C' },
      { name: 'Critical (80–100)', count: critCount, color: '#DC4545' },
    ];

    const countryMap = {};
    scopedRegs.forEach(({ reg }) => {
      const c = reg.country || 'Kenya';
      countryMap[c] = (countryMap[c] || 0) + 1;
    });
    const countryChart = Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const alertCatMap = {};
    scopedAlerts.forEach((a) => {
      const cat = a.category || 'Security Event';
      alertCatMap[cat] = (alertCatMap[cat] || 0) + 1;
    });
    const alertCatChart = Object.entries(alertCatMap).map(([name, count]) => ({ name, count }));

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00B8B0]" /> Security Analytics &amp; Fraud Intelligence Dashboard
            </h2>
            <p className="text-xs text-[#718096]">Real-time telemetry computed strictly from live ECAS registration screenings, alerts, and authentication logs.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRangeDays}
              onChange={(e) => setDateRangeDays(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const headers = ['Ref', 'Applicant', 'Organization', 'Country', 'Risk Score', 'Risk Level', 'Org Verification', 'Email Verification', 'Clearance'];
                const rows = scopedRegs.map(({ reg, sec }) => [
                  reg.referenceNo, `${reg.firstName} ${reg.lastName}`, reg.organisation, reg.country,
                  sec.riskScore, sec.riskLevel, sec.orgVerification, sec.emailVerification, sec.securityClearance,
                ]);
                msimamiziEnterpriseService.exportCSV(headers, rows, `ECAS_Security_Analytics_${new Date().toISOString().slice(0, 10)}.csv`, currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071C2D] text-white text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00B8B0]" /> Export Security CSV
            </button>
          </div>
        </div>

        {/* 14-Metric Live Security KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
          {[
            { label: 'Total Screened', val: scopedRegs.length, color: 'text-[#10243E]' },
            { label: 'Low Risk', val: lowCount, color: 'text-[#16A36A]' },
            { label: 'Medium Risk', val: medCount, color: 'text-[#F0A020]' },
            { label: 'High Risk', val: highCount, color: 'text-orange-600' },
            { label: 'Critical Risk', val: critCount, color: 'text-[#DC4545]' },
            { label: 'Orgs Verified', val: orgVerifiedCount, color: 'text-[#16A36A]' },
            { label: 'Orgs Awaiting Check', val: orgAwaitingCount, color: 'text-amber-700' },
            { label: 'Duplicate Bookings', val: dupCount, color: 'text-orange-700' },
            { label: 'Pending Reviews', val: pendingRevCount, color: 'text-[#DC4545]' },
            { label: 'Confirmed False Positives', val: fpCount, color: 'text-[#00B8B0]' },
            { label: 'Blocked Bots', val: Number(securityStats?.blockedBots) || 0, color: 'text-[#10243E]' },
            { label: 'Failed Admin Logins', val: Number(securityStats?.failedLogins) || 0, color: 'text-[#DC4545]' },
            { label: 'Malicious Uploads Blocked', val: Number(securityStats?.maliciousUploadsBlocked) || 0, color: 'text-[#DC4545]' },
            { label: 'Open Security Alerts', val: scopedAlerts.filter((a) => a.status === 'Open').length, color: 'text-orange-700' },
            { label: 'Logged Incidents', val: securityIncidents.length, color: 'text-[#10243E]' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-[#718096]">{k.label}</p>
              <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.val}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-black text-[#10243E] mb-4">Registration Risk Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {riskChart.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-black text-[#10243E] mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00B8B0]" /> Registrations Screened by Country
            </h3>
            {countryChart.length === 0 ? (
              <p className="text-xs text-[#718096] py-20 text-center">No registrations recorded yet in this period.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#071C2D" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-black text-[#10243E] mb-4">Security Alerts &amp; Events by Category</h3>
            {alertCatChart.length === 0 ? (
              <p className="text-xs text-[#718096] py-10 text-center">No security alerts triggered in this time window.</p>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={alertCatChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00B8B0" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SECURITY ALERTS & INCIDENT RESPONSE CONSOLE
  // ═══════════════════════════════════════════════════════════════════════════
  const filteredAlerts = securityAlerts.filter((a) => alertFilter === 'All' || a.status === alertFilter);

  const handleSaveIncident = async (e) => {
    e.preventDefault();
    const res = await msimamiziEnterpriseService.saveSecurityIncident(incidentForm, currentUser);
    if (res.success) {
      setIncidentFormOpen(false);
      setIncidentForm({
        title: '',
        category: 'Suspicious Registration / Fraud',
        severity: 'HIGH',
        phase: '1. Detected',
        affectedComponent: '',
        containmentActions: '',
        rootCause: '',
        status: 'Open',
      });
      onDataChange();
      showToast(`Incident ${res.incident.id} logged in Security Response Desk.`);
    }
  };

  return (
    <div className="space-y-5 text-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F0A020]" /> Security Notification Centre &amp; Incident Response
          </h2>
          <p className="text-xs text-[#718096]">Centralized operational alerts (high-risk bookings, phishing reports, failed logins, malicious uploads) &amp; 9-stage incident management.</p>
        </div>
        {canReview && (
          <button
            type="button"
            onClick={() => setIncidentFormOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DC4545] hover:bg-red-700 text-white font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Security Incident
          </button>
        )}
      </div>

      {incidentFormOpen && (
        <form onSubmit={handleSaveIncident} className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <h3 className="font-black text-sm text-[#10243E]">Log New Security Incident</h3>
          </div>
          <input required value={incidentForm.title} onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })} placeholder="Incident title *" className="h-9 px-3 rounded-xl border border-slate-300" />
          <select value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })} className="h-9 px-3 rounded-xl border border-slate-300 bg-white">
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          <select value={incidentForm.phase} onChange={(e) => setIncidentForm({ ...incidentForm, phase: e.target.value })} className="h-9 px-3 rounded-xl border border-slate-300 bg-white">
            {INCIDENT_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input value={incidentForm.affectedComponent} onChange={(e) => setIncidentForm({ ...incidentForm, affectedComponent: e.target.value })} placeholder="Affected system / account / registration" className="h-9 px-3 rounded-xl border border-slate-300" />
          <textarea rows={2} value={incidentForm.containmentActions} onChange={(e) => setIncidentForm({ ...incidentForm, containmentActions: e.target.value })} placeholder="Containment actions taken (evidence preserved — do not auto-delete)" className="sm:col-span-2 p-3 rounded-xl border border-slate-300" />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIncidentFormOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#071C2D] text-white font-bold cursor-pointer">Save Incident</button>
          </div>
        </form>
      )}

      {/* Alerts List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[#10243E]">Security Alerts ({filteredAlerts.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Open', 'Acknowledged', 'Investigating', 'Resolved', 'False Positive'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setAlertFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                  alertFilter === st ? 'bg-[#071C2D] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-10 text-center text-[#718096]">
              <Lock className="w-8 h-8 text-[#00B8B0] mx-auto mb-2" />
              No security alerts in &ldquo;{alertFilter}&rdquo; status.
            </div>
          ) : (
            filteredAlerts.map((a) => (
              <div key={a.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#F5F8FC]">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${getSeverityBadge(a.severity)}`}>{a.severity}</span>
                    <span className="font-bold text-[#10243E]">{a.category}</span>
                    <span className="font-mono text-[10px] text-[#00B8B0]">{a.id}</span>
                    <span className="text-[10px] text-[#718096]">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-slate-700">{a.description}</p>
                  <p className="text-[11px] text-[#718096]"><strong>Recommended Action:</strong> {a.recommendedAction}</p>
                </div>
                {canReview && (
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={a.status || 'Open'}
                      onChange={async (e) => {
                        await msimamiziEnterpriseService.updateSecurityAlert({ alertId: a.id, status: e.target.value }, currentUser);
                        onDataChange();
                        showToast(`Alert ${a.id} updated to ${e.target.value}.`);
                      }}
                      className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white font-bold text-[11px] cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Resolved">Resolved</option>
                      <option value="False Positive">False Positive</option>
                    </select>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Formal Incident Response Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-[#10243E] flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#00B8B0]" /> Incident Response Register ({securityIncidents.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {securityIncidents.length === 0 ? (
            <p className="p-8 text-center text-[#718096]">No formal security incidents logged. Use &ldquo;Log Security Incident&rdquo; above if an active incident occurs.</p>
          ) : (
            securityIncidents.map((inc) => (
              <div key={inc.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${getSeverityBadge(inc.severity)}`}>{inc.severity}</span>
                    <span className="font-bold text-[#10243E]">{inc.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{inc.id}</span>
                  </div>
                  <p className="text-[11px] text-[#718096] mt-0.5">Phase: <strong>{inc.phase}</strong> • Component: {inc.affectedComponent || 'General'}</p>
                  {inc.containmentActions && <p className="text-slate-700 mt-1">{inc.containmentActions}</p>}
                </div>
                {canReview && (
                  <select
                    value={inc.status}
                    onChange={async (e) => {
                      await msimamiziEnterpriseService.saveSecurityIncident({ ...inc, status: e.target.value }, currentUser);
                      onDataChange();
                      showToast(`Incident ${inc.id} marked ${e.target.value}.`);
                    }}
                    className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white font-bold text-[11px] cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Contained">Contained</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Restored">Restored</option>
                    <option value="Closed">Closed</option>
                  </select>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
