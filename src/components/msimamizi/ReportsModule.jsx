import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  Receipt,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  getEffectiveRegistrationStage,
  isConfirmedPaidEnrolment,
  getRealizedRegistrationRevenue,
  normalizeLeadStatus,
  normalizeCandidateStage,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

export default function ReportsModule({
  activeTab,
  registrations = [],
  inquiries = [],
  courses = [],
  vacancies = [],
  applications = [],
  invoices = [],
  payments = [],
  currentUser,
}) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const inRange = (dateStr) => {
    if (!dateStr) return true;
    const iso = String(dateStr).slice(0, 10);
    if (fromDate && iso < fromDate) return false;
    if (toDate && iso > toDate) return false;
    return true;
  };

  const fRegs = useMemo(() => registrations.filter((r) => inRange(r.submittedAt || r.createdAt)), [registrations, fromDate, toDate]);
  const fInqs = useMemo(() => inquiries.filter((i) => inRange(i.createdAt)), [inquiries, fromDate, toDate]);
  const fInvs = useMemo(() => invoices.filter((i) => inRange(i.createdAt)), [invoices, fromDate, toDate]);
  const fPays = useMemo(() => payments.filter((p) => inRange(p.transactionDate || p.createdAt)), [payments, fromDate, toDate]);
  const fApps = useMemo(() => applications.filter((a) => inRange(a.createdAt)), [applications, fromDate, toDate]);

  const byProgramme = useMemo(() => {
    const map = {};
    fRegs.forEach((r) => {
      const k = r.eventTitle || 'Unassigned Course';
      if (!map[k]) map[k] = { programme: k, registrations: 0, delegates: 0, revenue: 0 };
      map[k].registrations += 1;
      if (isConfirmedPaidEnrolment(r, fInvs, fPays)) {
        map[k].delegates += Number(r.participantsCount) || 1;
        map[k].revenue += getRealizedRegistrationRevenue(r, fInvs, fPays);
      }
    });
    return Object.values(map).sort((a, b) => b.registrations - a.registrations);
  }, [fRegs, fInvs, fPays]);

  const byCurrency = useMemo(() => {
    const map = {};
    fPays.filter((p) => p.status === 'Verified').forEach((p) => {
      const c = p.currency || 'USD';
      map[c] = (map[c] || 0) + (Number(p.amount) || 0);
    });
    return Object.entries(map).map(([currency, total]) => ({ currency, total }));
  }, [fPays]);

  const conversionRate = useMemo(() => {
    if (fInqs.length === 0) return '0%';
    const conv = fInqs.filter((i) => normalizeLeadStatus(i.status) === 'Converted').length;
    return `${Math.round((conv / fInqs.length) * 100)}%`;
  }, [fInqs]);

  const exportSets = [
    {
      name: 'Admissions & Enrolments Dataset',
      icon: Users,
      count: fRegs.length,
      headers: ['Ref No', 'Applicant', 'Email', 'Course', 'Destination', 'Stage', 'Payment', 'Fee'],
      rows: fRegs.map((r) => [r.referenceNo, `${r.firstName || ''} ${r.lastName || ''}`.trim(), r.officialEmail || r.personalEmail || '', r.eventTitle, r.venue, getEffectiveRegistrationStage(r), r.paymentStatus, r.totalFee]),
    },
    {
      name: 'Financial Invoices & Collections',
      icon: Receipt,
      count: fInvs.length,
      headers: ['Invoice No', 'Applicant', 'Course', 'Currency', 'Net Amount', 'Paid', 'Balance', 'Status'],
      rows: fInvs.map((i) => [i.invoiceNo, i.applicantName, i.courseTitle, i.currency, i.netAmount, i.paidAmount, i.balance, i.status]),
    },
    {
      name: 'Verified Payment Transactions',
      icon: CreditCard,
      count: fPays.length,
      headers: ['Reference', 'Invoice No', 'Applicant', 'Currency', 'Amount', 'Method', 'Date', 'Status', 'Reconciliation'],
      rows: fPays.map((p) => [p.reference, p.invoiceNo, p.applicantName, p.currency, p.amount, p.method, p.transactionDate, p.status, p.reconciliationStatus]),
    },
    {
      name: 'Course Catalog & Demand Report',
      icon: BookOpen,
      count: courses.length,
      headers: ['Slug', 'Course Title', 'Category', 'Duration', 'Fee USD', 'Enrolments'],
      rows: courses.map((c) => [c.slug, c.title, c.category || '', c.duration || '5 Days', c.feeUsd || 1200, fRegs.filter((r) => r.courseSlug === c.slug || r.eventTitle === c.title).length]),
    },
    {
      name: 'Recruitment & Candidate CVs Report',
      icon: Briefcase,
      count: fApps.length,
      headers: ['Ref', 'Candidate', 'Email', 'Vacancy', 'Stage', 'CV File', 'Date'],
      rows: fApps.map((a) => [a.referenceNo, a.fullName, a.email, a.jobTitle, normalizeCandidateStage(a.status), a.cvFileName, a.displayDate]),
    },
  ];

  const reportTitles = {
    'institutional-analytics': 'Institutional Business Intelligence',
    'admissions-reports': 'Admissions & Enrolment Reports',
    'financial-reports': 'Financial Performance & Collections Reports',
    'course-reports': 'Academic & Course Demand Reports',
    'recruitment-reports': 'Vacancies & Recruitment Reports',
    'data-exports': 'Institutional Data Export Hub',
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#008000]" /> {reportTitles[activeTab] || 'Reports & BI'}
          </h2>
          <p className="text-xs text-[#718096]">Verified institutional datasets with custom date range filtering and CSV, Excel &amp; PDF export.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 bg-[#F5F8FC] border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#718096]" />
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-transparent text-xs font-semibold" />
            <span>to</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-transparent text-xs font-semibold" />
          </div>
          {(fromDate || toDate) && (
            <button type="button" onClick={() => { setFromDate(''); setToDate(''); }} className="px-2.5 py-1.5 rounded-lg bg-slate-100 font-bold cursor-pointer">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#718096]">Registrations (Period)</p>
            <p className="text-xl font-black text-[#032e42] mt-1">{fRegs.length}</p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#032e42] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#718096]">Lead Conversion Rate</p>
            <p className="text-xl font-black text-[#008000] mt-1">{conversionRate}</p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008000] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#718096]">Verified Collections</p>
            <p className="text-xl font-black text-[#16A36A] mt-1">
              ${fPays.filter((p) => p.status === 'Verified').reduce((s, p) => s + (Number(p.amount) || 0), 0).toLocaleString()}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#718096]">Shortlisted / Total CVs</p>
            <p className="text-xl font-black text-[#032e42] mt-1">
              {fApps.filter((a) => ['Shortlisted', 'Interview', 'Selected'].includes(normalizeCandidateStage(a.status))).length} / {fApps.length}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-amber-50 text-[#F0A020] flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Top Courses Chart */}
      {activeTab !== 'data-exports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-extrabold text-[#032e42] mb-3">Registrations by Programme (Top 8)</h3>
            {byProgramme.length === 0 ? (
              <div className="h-52 flex items-center justify-center bg-[#F5F8FC] rounded-xl text-xs text-[#718096]">
                No programme registrations in the selected period.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byProgramme.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="programme" tick={{ fontSize: 10 }} tickFormatter={(s) => (s.length > 16 ? `${s.slice(0, 16)}…` : s)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="registrations" name="Registrations" fill="#008000" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-extrabold text-[#032e42] mb-3">Verified Collections by Currency</h3>
            {byCurrency.length === 0 ? (
              <div className="h-52 flex items-center justify-center bg-[#F5F8FC] rounded-xl text-xs text-[#718096]">
                No verified payments in the selected period.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCurrency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="currency" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" name="Collected" fill="#032e42" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Downloadable Datasets Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-[#F5F8FC]">
          <h3 className="text-sm font-extrabold text-[#032e42]">Exportable Institutional Reports (CSV, Excel &amp; Printable PDF)</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {exportSets.map((set) => {
            const SetIcon = set.icon || Download;
            return (
              <div key={set.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#F5F8FC] border border-slate-200 text-[#008000] flex items-center justify-center shrink-0">
                    <SetIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-bold text-[#032e42]">{set.name}</p>
                    <p className="text-[11px] text-[#718096]">{set.count} verified record{set.count === 1 ? '' : 's'} matching filter</p>
                  </div>
                </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => msimamiziEnterpriseService.exportCSV(set.headers, set.rows, `ECAS_${set.name.replace(/\s+/g, '_')}.csv`, currentUser)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F8FC] border border-slate-200 font-bold text-[#032e42] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => msimamiziEnterpriseService.exportExcel(set.headers, set.rows, `ECAS_${set.name.replace(/\s+/g, '_')}.xls`, set.name, currentUser)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-[#16A36A] cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const html = `<table><thead><tr>${set.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${set.rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
                    msimamiziEnterpriseService.printInstitutionalDocument(set.name, html, currentUser, {
                      mode: 'report',
                      headers: set.headers,
                      rows: set.rows,
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#032e42] text-white font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#4ade80]" /> PDF
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
