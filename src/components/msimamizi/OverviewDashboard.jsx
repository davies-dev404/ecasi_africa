import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  Briefcase,
  FileUser,
  Plus,
  Upload,
  Receipt,
  Megaphone,
  Download,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Mail,
  FileSearch,
  CalendarClock,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getEffectiveRegistrationStage,
  normalizeLeadStatus,
  normalizeCandidateStage,
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

const CHART_COLORS = ['#00B8B0', '#071C2D', '#16A36A', '#F0A020', '#3B82F6', '#DC4545', '#6366F1', '#0EA5E9'];

export default function OverviewDashboard({
  registrations = [],
  inquiries = [],
  courses = [],
  vacancies = [],
  applications = [],
  invoices = [],
  payments = [],
  cohorts = [],
  currentUser,
  onNavigate,
  onOpenNewRegistration,
  onOpenUploadCourse,
  onOpenPostVacancy,
}) {
  const [trendGranularity, setTrendGranularity] = useState('monthly'); // daily | weekly | monthly | annual
  const [dateRange, setDateRange] = useState('all'); // 30d | 90d | 365d | all

  const filterByDate = (dateStr) => {
    if (dateRange === 'all' || !dateStr) return true;
    const dt = new Date(dateStr);
    if (Number.isNaN(dt.getTime())) return true;
    const days = dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    return Date.now() - dt.getTime() <= days * 86400000;
  };

  const scopedRegs = useMemo(
    () => registrations.filter((r) => filterByDate(r.submittedAt || r.createdAt)),
    [registrations, dateRange]
  );
  const scopedInvoices = useMemo(
    () => invoices.filter((i) => filterByDate(i.createdAt)),
    [invoices, dateRange]
  );
  const scopedPayments = useMemo(
    () => payments.filter((p) => filterByDate(p.transactionDate || p.createdAt)),
    [payments, dateRange]
  );

  // ─── Real Database KPIs (Zero Fabricated Numbers) ───────────────────────────
  const stats = useMemo(() => {
    const totalRegistrations = scopedRegs.length;
    const confirmedEnrolments = scopedRegs.filter((r) => {
      const s = getEffectiveRegistrationStage(r);
      return s === 'Enrolment Confirmed' || s === 'Payment Confirmed' || s === 'Training In Progress' || s === 'Completed';
    }).length;
    const pendingApplications = scopedRegs.filter((r) => {
      const s = getEffectiveRegistrationStage(r);
      return s === 'Application Received' || s === 'Under Review' || s === 'Documents Required';
    }).length;
    const approvedApplications = scopedRegs.filter((r) => {
      const s = getEffectiveRegistrationStage(r);
      return s === 'Approved' || s === 'Invoice Issued' || s === 'Payment Pending';
    }).length;

    // Revenue from verified payments + paid registrations (avoiding double counting linked invoices)
    const verifiedPaymentsTotal = scopedPayments
      .filter((p) => p.status === 'Verified')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const invoicedRegIds = new Set(scopedInvoices.map((i) => i.registrationId).filter(Boolean));
    const uninvoicedPaidRegs = scopedRegs
      .filter((r) => r.paymentStatus === 'Paid' && !invoicedRegIds.has(r.id))
      .reduce((sum, r) => sum + (Number(r.totalFee) || 0), 0);
    const totalRevenue = verifiedPaymentsTotal + uninvoicedPaidRegs;

    const invoiceOutstanding = scopedInvoices
      .filter((i) => i.status !== 'Cancelled' && i.status !== 'Draft')
      .reduce((sum, i) => sum + Math.max(0, (Number(i.netAmount) || 0) - (Number(i.paidAmount) || 0)), 0);
    const uninvoicedUnpaidRegs = scopedRegs
      .filter((r) => r.paymentStatus !== 'Paid' && r.paymentStatus !== 'Refunded' && !invoicedRegIds.has(r.id))
      .reduce((sum, r) => sum + (Number(r.totalFee) || 0), 0);
    const outstandingFees = invoiceOutstanding + uninvoicedUnpaidRegs;

    const activeCourses = courses.length;
    const courseInquiries = inquiries.length;
    const activeVacancies = vacancies.filter((v) => v.status !== 'Closed').length;
    const candidateCvs = applications.length;

    return {
      totalRegistrations,
      confirmedEnrolments,
      pendingApplications,
      approvedApplications,
      totalRevenue,
      outstandingFees,
      activeCourses,
      courseInquiries,
      activeVacancies,
      candidateCvs,
    };
  }, [scopedRegs, scopedInvoices, scopedPayments, courses, inquiries, vacancies, applications]);

  // ─── Attention Needed Operational Alerts (11 Real Checks) ───────────────────
  const alerts = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    const pendingRegs = registrations.filter((r) => getEffectiveRegistrationStage(r) === 'Application Received').length;
    const reviewRegs = registrations.filter((r) => {
      const s = getEffectiveRegistrationStage(r);
      return s === 'Under Review' || s === 'Documents Required';
    }).length;
    const unreadInq = inquiries.filter((i) => normalizeLeadStatus(i.status) === 'New Lead').length;
    const unansweredWhatsApp = inquiries.filter(
      (i) => i.channel === 'WhatsApp' && normalizeLeadStatus(i.status) === 'New Lead'
    ).length;
    const unansweredEmail = inquiries.filter(
      (i) => i.channel === 'Email' && normalizeLeadStatus(i.status) === 'New Lead'
    ).length;
    const pendingInvoices = invoices.filter(
      (i) => i.status === 'Issued' || i.status === 'Partially Paid'
    ).length;
    const overdueInvoices = invoices.filter(
      (i) => i.status !== 'Paid' && i.status !== 'Cancelled' && i.status !== 'Draft' && i.dueDate && i.dueDate < todayStr
    ).length;
    const upcomingCohorts = cohorts.filter((c) => {
      if (!c.applicationDeadline || c.enrolmentStatus === 'Closed') return false;
      const diffDays = (new Date(c.applicationDeadline).getTime() - now) / 86400000;
      return diffDays >= 0 && diffDays <= 14;
    }).length;
    const newCvs = applications.filter((a) => normalizeCandidateStage(a.status) === 'Application Received').length;
    const expiringVacancies = vacancies.filter((v) => {
      if (v.status === 'Closed' || !v.deadline) return false;
      const d = new Date(v.deadline);
      if (Number.isNaN(d.getTime())) return false;
      const diffDays = (d.getTime() - now) / 86400000;
      return diffDays >= 0 && diffDays <= 10;
    }).length;
    const coursesNeedingUpdates = courses.filter(
      (c) => !c.summary || !c.image || (!c.feeUsd && !c.fee)
    ).length;

    return [
      { label: 'Pending Registrations', count: pendingRegs, severity: pendingRegs > 0 ? 'warning' : 'ok', target: 'registrations', icon: Clock },
      { label: 'Applications Awaiting Review', count: reviewRegs, severity: reviewRegs > 0 ? 'warning' : 'ok', target: 'applicants', icon: FileSearch },
      { label: 'Unread Inquiries', count: unreadInq, severity: unreadInq > 0 ? 'danger' : 'ok', target: 'inquiries', icon: MessageSquare },
      { label: 'Unanswered WhatsApp Leads', count: unansweredWhatsApp, severity: unansweredWhatsApp > 0 ? 'warning' : 'ok', target: 'inquiries', icon: MessageCircle },
      { label: 'Unanswered Email Inquiries', count: unansweredEmail, severity: unansweredEmail > 0 ? 'warning' : 'ok', target: 'inquiries', icon: Mail },
      { label: 'Pending Invoice Payments', count: pendingInvoices, severity: pendingInvoices > 0 ? 'warning' : 'ok', target: 'outstanding-balances', icon: Receipt },
      { label: 'Overdue Invoices', count: overdueInvoices, severity: overdueInvoices > 0 ? 'danger' : 'ok', target: 'outstanding-balances', icon: AlertTriangle },
      { label: 'Upcoming Cohort Deadlines (14d)', count: upcomingCohorts, severity: upcomingCohorts > 0 ? 'info' : 'ok', target: 'cohorts-intakes', icon: CalendarClock },
      { label: 'New CV Submissions', count: newCvs, severity: newCvs > 0 ? 'info' : 'ok', target: 'candidate-cvs', icon: FileUser },
      { label: 'Vacancies Approaching Expiry', count: expiringVacancies, severity: expiringVacancies > 0 ? 'warning' : 'ok', target: 'vacancies', icon: Briefcase },
      { label: 'Courses Requiring Updates', count: coursesNeedingUpdates, severity: coursesNeedingUpdates > 0 ? 'info' : 'ok', target: 'courses', icon: BookOpen },
    ];
  }, [registrations, inquiries, invoices, cohorts, applications, vacancies, courses]);

  // ─── Chart Data Computations ────────────────────────────────────────────────
  const registrationTrendsData = useMemo(() => {
    const buckets = {};
    scopedRegs.forEach((r) => {
      const dt = new Date(r.submittedAt || r.createdAt || Date.now());
      if (Number.isNaN(dt.getTime())) return;
      let key = '';
      if (trendGranularity === 'daily') {
        key = dt.toISOString().slice(0, 10);
      } else if (trendGranularity === 'weekly') {
        const startOfYear = new Date(dt.getFullYear(), 0, 1);
        const week = Math.ceil(((dt - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        key = `${dt.getFullYear()}-W${String(week).padStart(2, '0')}`;
      } else if (trendGranularity === 'annual') {
        key = String(dt.getFullYear());
      } else {
        key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      }
      if (!buckets[key]) buckets[key] = { period: key, registrations: 0, delegates: 0, revenue: 0 };
      buckets[key].registrations += 1;
      buckets[key].delegates += Number(r.participantsCount) || 1;
      buckets[key].revenue += Number(r.totalFee) || 0;
    });
    return Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period)).slice(-12);
  }, [scopedRegs, trendGranularity]);

  const admissionStatusData = useMemo(() => {
    const counts = {
      Pending: 0,
      'Under Review': 0,
      Approved: 0,
      Invoiced: 0,
      Paid: 0,
      Confirmed: 0,
      Completed: 0,
      Rejected: 0,
    };
    scopedRegs.forEach((r) => {
      const s = getEffectiveRegistrationStage(r);
      if (s === 'Application Received') counts.Pending += 1;
      else if (s === 'Under Review' || s === 'Documents Required') counts['Under Review'] += 1;
      else if (s === 'Approved') counts.Approved += 1;
      else if (s === 'Invoice Issued' || s === 'Payment Pending') counts.Invoiced += 1;
      else if (s === 'Payment Confirmed') counts.Paid += 1;
      else if (s === 'Enrolment Confirmed' || s === 'Training In Progress') counts.Confirmed += 1;
      else if (s === 'Completed') counts.Completed += 1;
      else if (s === 'Rejected' || s === 'Withdrawn') counts.Rejected += 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [scopedRegs]);

  const destinationPerformanceData = useMemo(() => {
    const map = {};
    scopedRegs.forEach((r) => {
      const dest = (r.venue || 'Nairobi').split(',')[0].trim();
      if (!map[dest]) map[dest] = { destination: dest, enrolments: 0, revenue: 0 };
      map[dest].enrolments += Number(r.participantsCount) || 1;
      map[dest].revenue += Number(r.totalFee) || 0;
    });
    return Object.values(map).sort((a, b) => b.enrolments - a.enrolments).slice(0, 7);
  }, [scopedRegs]);

  const recruitmentFunnelData = useMemo(() => {
    return [
      { stage: 'Active Vacancies', count: vacancies.filter((v) => v.status !== 'Closed').length },
      { stage: 'CVs Received', count: applications.length },
      { stage: 'Screening', count: applications.filter((a) => normalizeCandidateStage(a.status) === 'Screening').length },
      { stage: 'Shortlisted', count: applications.filter((a) => normalizeCandidateStage(a.status) === 'Shortlisted').length },
      { stage: 'Interview', count: applications.filter((a) => normalizeCandidateStage(a.status) === 'Interview').length },
      { stage: 'Selected', count: applications.filter((a) => normalizeCandidateStage(a.status) === 'Selected').length },
    ];
  }, [vacancies, applications]);

  const paidVsOutstandingData = useMemo(
    () => [
      { name: 'Collected Revenue', value: Math.round(stats.totalRevenue) },
      { name: 'Outstanding Fees', value: Math.round(stats.outstandingFees) },
    ].filter((d) => d.value > 0),
    [stats]
  );

  const handleDownloadExecutiveBrief = () => {
    const html = `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Total Registrations</div><div class="kpi-val">${stats.totalRegistrations}</div></div>
        <div class="kpi"><div class="kpi-label">Confirmed Enrolments</div><div class="kpi-val">${stats.confirmedEnrolments}</div></div>
        <div class="kpi"><div class="kpi-label">Collected Revenue (USD)</div><div class="kpi-val">$${stats.totalRevenue.toLocaleString()}</div></div>
        <div class="kpi"><div class="kpi-label">Outstanding Fees (USD)</div><div class="kpi-val">$${stats.outstandingFees.toLocaleString()}</div></div>
      </div>
      <h3>Operational Overview Summary</h3>
      <table>
        <thead><tr><th>Metric</th><th>Actual Database Value</th></tr></thead>
        <tbody>
          <tr><td>Pending Applications</td><td>${stats.pendingApplications}</td></tr>
          <tr><td>Approved Applications</td><td>${stats.approvedApplications}</td></tr>
          <tr><td>Active Courses & Programmes</td><td>${stats.activeCourses}</td></tr>
          <tr><td>Total Course Inquiries & Leads</td><td>${stats.courseInquiries}</td></tr>
          <tr><td>Active Job Vacancies</td><td>${stats.activeVacancies}</td></tr>
          <tr><td>Candidate CVs Received</td><td>${stats.candidateCvs}</td></tr>
        </tbody>
      </table>
    `;
    msimamiziEnterpriseService.printInstitutionalDocument('ECAS Institutional Executive Brief', html, currentUser);
  };

  const kpiCards = [
    { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users, accent: 'text-[#071C2D] bg-slate-100', target: 'registrations' },
    { label: 'Confirmed Enrolments', value: stats.confirmedEnrolments, icon: CheckCircle2, accent: 'text-[#16A36A] bg-emerald-50', target: 'enrolments' },
    { label: 'Pending Applications', value: stats.pendingApplications, icon: Clock, accent: 'text-[#F0A020] bg-amber-50', target: 'applicants' },
    { label: 'Approved Applications', value: stats.approvedApplications, icon: ShieldCheck, accent: 'text-blue-600 bg-blue-50', target: 'registrations' },
    { label: 'Total Revenue (USD)', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, accent: 'text-[#16A36A] bg-emerald-50', target: 'finance-overview' },
    { label: 'Outstanding Fees', value: `$${stats.outstandingFees.toLocaleString()}`, icon: AlertTriangle, accent: 'text-[#DC4545] bg-red-50', target: 'outstanding-balances' },
    { label: 'Active Courses', value: stats.activeCourses, icon: BookOpen, accent: 'text-[#00B8B0] bg-teal-50', target: 'courses' },
    { label: 'Course Inquiries', value: stats.courseInquiries, icon: MessageSquare, accent: 'text-indigo-600 bg-indigo-50', target: 'inquiries' },
    { label: 'Active Vacancies', value: stats.activeVacancies, icon: Briefcase, accent: 'text-[#102D49] bg-slate-100', target: 'vacancies' },
    { label: 'Candidate CVs', value: stats.candidateCvs, icon: FileUser, accent: 'text-cyan-700 bg-cyan-50', target: 'candidate-cvs' },
  ];

  return (
    <div className="space-y-6">
      {/* Command Centre Header & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00B8B0]/10 text-[#00B8B0] border border-[#00B8B0]/30 text-[10px] font-extrabold uppercase tracking-wider">
                Command Centre
              </span>
              <span className="text-[11px] font-medium text-[#718096]">
                ECAS Institute (ECASIAFRICA)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#10243E] mt-1 tracking-tight">
              Platform Overview Dashboard
            </h1>
            <p className="text-xs text-[#718096] mt-0.5">
              Live institutional telemetry across admissions, CRM leads, academic programmes, finance, and recruitment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-[#F5F8FC] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#718096]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent font-semibold text-[#10243E] focus:outline-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="365d">Last 12 Months</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleDownloadExecutiveBrief}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071C2D] hover:bg-[#102D49] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00B8B0]" />
              <span>Export Executive Brief</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {hasPermission(currentUser, 'admissions.write') && (
            <button
              type="button"
              onClick={onOpenNewRegistration}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00B8B0] hover:bg-[#009c95] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Registration
            </button>
          )}
          {hasPermission(currentUser, 'courses.write') && (
            <button
              type="button"
              onClick={onOpenUploadCourse}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 text-[#10243E] border border-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#00B8B0]" /> Upload Course
            </button>
          )}
          {hasPermission(currentUser, 'recruitment.write') && (
            <button
              type="button"
              onClick={onOpenPostVacancy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 text-[#10243E] border border-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#16A36A]" /> Post Vacancy
            </button>
          )}
          {hasPermission(currentUser, 'finance.write') && (
            <button
              type="button"
              onClick={() => onNavigate('invoices')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 text-[#10243E] border border-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-[#F0A020]" /> Create Invoice
            </button>
          )}
          {hasPermission(currentUser, 'crm.write') && (
            <button
              type="button"
              onClick={() => onNavigate('inquiries')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 text-[#10243E] border border-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Add New Lead
            </button>
          )}
          {hasPermission(currentUser, 'communications.write') && (
            <button
              type="button"
              onClick={() => onNavigate('announcements')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 text-[#10243E] border border-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-indigo-600" /> Send Announcement
            </button>
          )}
          {hasPermission(currentUser, 'admin.manage') && (
            <button
              type="button"
              onClick={() => onNavigate('staff-accounts')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#071C2D] hover:bg-[#102D49] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#00B8B0]" /> Add Staff User
            </button>
          )}
          {hasPermission(currentUser, 'reports.export') && (
            <button
              type="button"
              onClick={() => onNavigate('data-exports')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] hover:bg-slate-200/70 text-[#10243E] border border-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" /> Export Reports
            </button>
          )}
        </div>
      </div>

      {/* 10 Main Institutional Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => onNavigate(kpi.target)}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md hover:border-[#00B8B0] transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#00B8B0] transition" />
              </div>
              <p className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider truncate">
                {kpi.label}
              </p>
              <p className="text-xl font-black text-[#10243E] mt-1 truncate">{kpi.value}</p>
            </button>
          );
        })}
      </div>

      {/* Operational Attention Needed Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-[#071C2D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#F0A020]" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider">
              Attention Needed — Operational Action Queue
            </h2>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-[#00B8B0]">
            {alerts.filter((a) => a.count > 0).length} Active Alert{alerts.filter((a) => a.count > 0).length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {alerts.map((alert) => {
            const AlertIcon = alert.icon || AlertCircle;
            const iconBoxClass =
              alert.count === 0
                ? 'bg-emerald-50 text-[#16A36A]'
                : alert.severity === 'danger'
                ? 'bg-red-50 text-[#DC4545]'
                : alert.severity === 'warning'
                ? 'bg-amber-50 text-[#F0A020]'
                : 'bg-teal-50 text-[#00B8B0]';
            return (
              <button
                key={alert.label}
                type="button"
                onClick={() => onNavigate(alert.target)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                  alert.count > 0
                    ? 'bg-[#F5F8FC] hover:bg-slate-100 border-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-100 opacity-80'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBoxClass}`}>
                    <AlertIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-[#10243E] truncate">{alert.label}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                    alert.count === 0
                      ? 'bg-emerald-50 text-[#16A36A]'
                      : alert.severity === 'danger'
                      ? 'bg-red-50 text-[#DC4545]'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {alert.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutional Analytics Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Registration Trends */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#10243E] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00B8B0]" />
                Registration Trends
              </h3>
              <p className="text-[11px] text-[#718096]">Actual submitted registrations over time</p>
            </div>
            <div className="inline-flex rounded-lg bg-[#F5F8FC] p-0.5 border border-slate-200 text-[11px]">
              {['daily', 'weekly', 'monthly', 'annual'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setTrendGranularity(g)}
                  className={`px-2 py-1 rounded-md font-bold capitalize cursor-pointer transition ${
                    trendGranularity === g ? 'bg-[#071C2D] text-white' : 'text-[#718096] hover:text-[#10243E]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {registrationTrendsData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center bg-[#F5F8FC] rounded-xl border border-dashed border-slate-200 p-4">
              <TrendingUp className="w-7 h-7 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-[#10243E]">No Registration Records Yet</p>
              <p className="text-[11px] text-[#718096] mt-0.5">Live registration trends will chart automatically once delegates register.</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrendsData}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B8B0" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00B8B0" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#718096' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#718096' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#00B8B0" strokeWidth={2.5} fill="url(#regGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 2. Admission Status & Financial Split */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#10243E] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#00B8B0]" />
                Admission Status &amp; Financial Split
              </h3>
              <p className="text-[11px] text-[#718096]">Pipeline breakdown and collected vs outstanding fees</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-56">
              {admissionStatusData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center bg-[#F5F8FC] rounded-xl border border-dashed border-slate-200 p-3">
                  <p className="text-xs font-bold text-[#10243E]">No Admission Data</p>
                  <p className="text-[10px] text-[#718096]">Status breakdown appears here.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={admissionStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={66} paddingAngle={2}>
                      {admissionStatusData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="h-56">
              {paidVsOutstandingData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center bg-[#F5F8FC] rounded-xl border border-dashed border-slate-200 p-3">
                  <p className="text-xs font-bold text-[#10243E]">No Financial Balances</p>
                  <p className="text-[10px] text-[#718096]">Paid vs outstanding chart appears once invoices/fees exist.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paidVsOutstandingData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={66}>
                      <Cell fill="#16A36A" />
                      <Cell fill="#DC4545" />
                    </Pie>
                    <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* 3. Enrolments & Revenue by Destination */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-[#10243E] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00B8B0]" />
              Enrolments by Training Destination
            </h3>
            <p className="text-[11px] text-[#718096]">Delegate counts across Nairobi, Mombasa, Dubai, Kuala Lumpur &amp; Online</p>
          </div>
          {destinationPerformanceData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center bg-[#F5F8FC] rounded-xl border border-dashed border-slate-200 p-4">
              <BarChart3 className="w-7 h-7 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-[#10243E]">No Destination Enrolments Yet</p>
              <p className="text-[11px] text-[#718096] mt-0.5">Destination performance populates automatically from delegate registrations.</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="destination" tick={{ fontSize: 11, fill: '#718096' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#718096' }} />
                  <Tooltip />
                  <Bar dataKey="enrolments" name="Delegates" fill="#071C2D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. Recruitment Pipeline Performance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-[#10243E] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#00B8B0]" />
              Recruitment Performance Funnel
            </h3>
            <p className="text-[11px] text-[#718096]">Active vacancies, CV submissions, shortlisting, interviews &amp; hires</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recruitmentFunnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#718096' }} />
                <YAxis type="category" dataKey="stage" width={105} tick={{ fontSize: 11, fill: '#10243E' }} />
                <Tooltip />
                <Bar dataKey="count" name="Count" fill="#00B8B0" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
