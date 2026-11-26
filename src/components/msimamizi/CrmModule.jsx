import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  ArrowRightCircle,
  CalendarClock,
  Download,
  Trash2,
  X,
  UserPlus,
  Clock,
  CheckCircle2,
  GitBranch,
  History,
} from 'lucide-react';
import { adminRegistrationService } from '@/services/adminRegistrationService';
import {
  LEAD_PIPELINE_STAGES,
  LEAD_SOURCES,
  normalizeLeadStatus,
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

export default function CrmModule({
  activeTab,
  inquiries = [],
  courses = [],
  communications = [],
  staffAccounts = [],
  currentUser,
  onDataChange,
  onNavigate,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  if (prevActiveTab !== activeTab) {
    setPrevActiveTab(activeTab);
    if (isAddModalOpen) setIsAddModalOpen(false);
  }
  const [activeLead, setActiveLead] = useState(null);
  const [callLogText, setCallLogText] = useState('');
  const [callLogType, setCallLogType] = useState('Phone Call');

  const createEmptyLeadForm = (tab = activeTab) => ({
    fullName: '',
    email: '',
    phone: '',
    organisation: '',
    country: 'Kenya',
    leadSource: 'Website',
    inquiryType: 'Course Inquiry',
    courseTitle: '',
    venue: 'Nairobi, Kenya',
    status: 'New Lead',
    nextFollowUp: tab === 'follow-ups' ? new Date().toISOString().split('T')[0] : '',
    assignedOfficer: currentUser?.email || '',
    message: '',
  });

  const [leadForm, setLeadForm] = useState(() => createEmptyLeadForm(activeTab));

  const openAddLeadPage = () => {
    setLeadForm(createEmptyLeadForm(activeTab));
    setActiveLead(null);
    setIsAddModalOpen(true);
  };

  const canWrite = hasPermission(currentUser, 'crm.write');
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredLeads = useMemo(() => {
    return inquiries.filter((lead) => {
      const stage = normalizeLeadStatus(lead.status);
      if (stageFilter !== 'All' && stage !== stageFilter) return false;
      const src = lead.leadSource || lead.channel || 'Website';
      if (sourceFilter !== 'All' && src !== sourceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${lead.referenceNo || ''} ${lead.fullName || ''} ${lead.email || ''} ${lead.phone || ''} ${lead.organisation || ''} ${lead.courseTitle || ''} ${lead.venue || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [inquiries, search, sourceFilter, stageFilter]);

  const followUpsList = useMemo(() => {
    return inquiries
      .filter((l) => l.nextFollowUp && normalizeLeadStatus(l.status) !== 'Converted' && normalizeLeadStatus(l.status) !== 'Closed')
      .sort((a, b) => String(a.nextFollowUp).localeCompare(String(b.nextFollowUp)));
  }, [inquiries]);

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!canWrite || !leadForm.fullName.trim()) return;
    adminRegistrationService.addInquiry({
      ...leadForm,
      channel: leadForm.leadSource,
      status: leadForm.status || 'New Lead',
      lastContactDate: todayStr,
      communicationLog: [
        {
          id: `LOG-${Date.now()}`,
          type: 'Created',
          summary: `Lead captured via ${leadForm.leadSource}. ${leadForm.message || ''}`.trim(),
          by: currentUser?.email || 'admin',
          at: new Date().toISOString(),
        },
      ],
    });
    msimamiziEnterpriseService.logAudit(currentUser, 'CREATE_CRM_LEAD', 'Lead', leadForm.fullName, '', leadForm.courseTitle || leadForm.inquiryType);
    setIsAddModalOpen(false);
    setLeadForm(createEmptyLeadForm(activeTab));
    onDataChange();
    showToast('New CRM lead created and added to pipeline.');
  };

  const handleMoveLeadStage = (lead, newStage) => {
    if (!canWrite) return;
    const prev = normalizeLeadStatus(lead.status);
    adminRegistrationService.updateInquiry(lead.id, {
      status: newStage,
      lastContactDate: todayStr,
    });
    msimamiziEnterpriseService.logAudit(currentUser, 'LEAD_STAGE_UPDATE', 'Lead', lead.referenceNo || lead.id, prev, newStage);
    onDataChange();
    showToast(`Lead ${lead.fullName} moved to ${newStage}.`);
  };

  const handleLogInteraction = (lead) => {
    if (!canWrite || !callLogText.trim()) return;
    const entry = {
      id: `LOG-${Date.now()}`,
      type: callLogType,
      summary: callLogText.trim(),
      by: currentUser?.email || 'admin',
      at: new Date().toISOString(),
    };
    const nextLogs = [entry, ...(Array.isArray(lead.communicationLog) ? lead.communicationLog : [])];
    adminRegistrationService.updateInquiry(lead.id, {
      communicationLog: nextLogs,
      lastContactDate: todayStr,
      status: normalizeLeadStatus(lead.status) === 'New Lead' ? 'Contacted' : lead.status,
    });
    setCallLogText('');
    onDataChange();
    showToast(`${callLogType} logged for ${lead.fullName}.`);
  };

  const handleConvertLead = (lead) => {
    if (!canWrite) return;
    const res = msimamiziEnterpriseService.convertLeadToRegistration(lead, currentUser);
    if (res.success) {
      onDataChange();
      showToast(
        res.alreadyExisted
          ? `Lead linked to existing registration ${res.registration.referenceNo} (duplicate avoided).`
          : `Lead converted to Registration ${res.registration.referenceNo}!`
      );
      if (window.confirm(`Registration ${res.registration.referenceNo} is ready. Open Admissions Directory now?`)) {
        onNavigate('registrations');
      }
    } else {
      alert(res.error || 'Could not convert lead.');
    }
  };

  const liveSelectedLead = useMemo(
    () => (activeLead ? inquiries.find((i) => i.id === activeLead.id) || activeLead : null),
    [activeLead, inquiries]
  );

  const renderActiveSubView = () => {
    // ─── Communication History Sub-view ───────────────────────────────────────
    if (activeTab === 'communication-history') {
    const allLogs = [
      ...communications.map((c) => ({
        id: c.id,
        date: c.sentAt,
        contact: c.recipientName || c.recipientContact,
        channel: c.channel,
        summary: `${c.subject}: ${c.body}`,
        by: c.sentBy,
        status: c.deliveryStatus,
      })),
      ...inquiries.flatMap((lead) =>
        (lead.communicationLog || []).map((log) => ({
          id: `${lead.id}-${log.id}`,
          date: log.at,
          contact: lead.fullName,
          channel: log.type,
          summary: log.summary,
          by: log.by,
          status: normalizeLeadStatus(lead.status),
        }))
      ),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              <History className="w-5 h-5 text-[#008000]" /> CRM Communication History ({allLogs.length})
            </h2>
            <p className="text-xs text-[#718096]">Unified timeline of logged phone calls, WhatsApp responses, emails, and conversions.</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
          {allLogs.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#718096]">No communication logs recorded yet.</div>
          ) : (
            allLogs.map((item) => (
              <div key={item.id} className="p-4 hover:bg-[#F5F8FC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#008000] font-bold text-[10px]">{item.channel}</span>
                    <span className="font-bold text-[#032e42]">{item.contact}</span>
                    <span className="text-[10px] text-[#718096]">by {item.by}</span>
                  </div>
                  <p className="text-slate-600 mt-1 line-clamp-2">{item.summary}</p>
                </div>
                <span className="text-[11px] font-mono text-[#718096] shrink-0">
                  {item.date ? new Date(item.date).toLocaleString() : '—'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ─── Follow-ups & Overdue Reminders Sub-view ────────────────────────────────
  if (activeTab === 'follow-ups') {
    const overdue = followUpsList.filter((l) => l.nextFollowUp < todayStr);
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#008000]" /> Scheduled Follow-ups &amp; Reminders
            </h2>
            <p className="text-xs text-[#718096]">
              {overdue.length} overdue follow-up{overdue.length === 1 ? '' : 's'} • {followUpsList.length} total scheduled
            </p>
          </div>
          {canWrite && (
            <button
              type="button"
              onClick={openAddLeadPage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Lead &amp; Follow-up
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followUpsList.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-[#718096]">
              No pending follow-ups scheduled. Open any lead to set a Next Follow-up date.
            </div>
          ) : (
            followUpsList.map((lead) => {
              const isOverdue = lead.nextFollowUp < todayStr;
              const isToday = lead.nextFollowUp === todayStr;
              return (
                <div
                  key={lead.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm space-y-2.5 text-xs ${
                    isOverdue ? 'border-[#DC4545]/60 bg-red-50/20' : isToday ? 'border-[#F0A020]/60' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOverdue ? 'bg-red-100 text-[#DC4545]' : isToday ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-[#008000]'
                    }`}>
                      {isOverdue ? `Overdue (${lead.nextFollowUp})` : isToday ? 'Due Today' : `Due ${lead.nextFollowUp}`}
                    </span>
                    <span className="font-mono text-[10px] text-[#718096]">{lead.referenceNo}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#032e42]">{lead.fullName}</h4>
                  <p className="text-[#718096] truncate">{lead.courseTitle}</p>
                  <p className="text-[11px] text-slate-500">Officer: {lead.assignedOfficer || 'Unassigned'}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveLead(lead)}
                      className="flex-1 py-1.5 rounded-lg bg-[#032e42] text-white font-bold text-[11px] cursor-pointer"
                    >
                      Log Call / Update
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConvertLead(lead)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#16A36A] border border-emerald-200 font-bold text-[11px] cursor-pointer"
                    >
                      Convert
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              {activeTab === 'lead-pipeline' ? <GitBranch className="w-5 h-5 text-[#008000]" /> : <MessageSquare className="w-5 h-5 text-[#008000]" />}
              {activeTab === 'lead-pipeline' ? 'CRM Lead Pipeline' : 'Inquiries & CRM Leads'}
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5F8FC] border border-slate-200 text-xs font-bold">
                {filteredLeads.length}
              </span>
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Track inquiries from Website, WhatsApp, Email, Telephone &amp; Social Media and convert directly into Registrations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canWrite && (
              <button
                type="button"
                onClick={openAddLeadPage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Add New Lead
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('registrations')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer"
            >
              <ArrowRightCircle className="w-3.5 h-3.5" /> Registrations Directory
            </button>
            <button
              type="button"
              onClick={() => adminRegistrationService.downloadInquiriesCSV()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#032e42] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/80 px-3.5 py-2.5 text-[11px] text-slate-600">
          <strong className="text-[#032e42]">Inquiries vs Registrations:</strong> This directory holds <strong className="text-[#032e42]">pre-booking questions, WhatsApp/Email inquiries, Contact Us messages &amp; proposal requests</strong> (<code className="bg-white px-1 rounded border">INQ-...</code>). Unconverted leads do not generate invoices or outstanding fees. Click <strong className="text-[#16A36A]">Convert</strong> once a client confirms attendance to move them to Registrations &amp; Invoicing.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lead name, email, phone, course..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#008000]"
            />
          </div>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold">
            <option value="All">All Lead Sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold">
            <option value="All">All Pipeline Stages</option>
            {LEAD_PIPELINE_STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban Pipeline View */}
      {activeTab === 'lead-pipeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {LEAD_PIPELINE_STAGES.map((stage) => {
            const items = filteredLeads.filter((l) => normalizeLeadStatus(l.status) === stage);
            return (
              <div key={stage} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[540px]">
                <div className="px-4 py-3 border-b border-slate-100 bg-[#F5F8FC] rounded-t-2xl flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#032e42]">{stage}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#032e42] text-white text-[10px] font-bold">{items.length}</span>
                </div>
                <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
                  {items.length === 0 ? (
                    <p className="text-[11px] text-[#718096] text-center py-6">No leads in this stage</p>
                  ) : (
                    items.map((lead) => (
                      <div key={lead.id} className="p-3 rounded-xl border border-slate-200 hover:border-[#008000] bg-white space-y-2 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-[#032e42]">{lead.fullName}</p>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">{lead.leadSource || lead.channel}</span>
                        </div>
                        <p className="text-[11px] text-[#718096] line-clamp-1">{lead.courseTitle}</p>
                        {lead.nextFollowUp && (
                          <p className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Follow-up: {lead.nextFollowUp}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setActiveLead(lead)}
                            className="text-[11px] font-bold text-[#008000] hover:underline cursor-pointer"
                          >
                            Manage
                          </button>
                          {stage !== 'Converted' && canWrite && (
                            <button
                              type="button"
                              onClick={() => handleConvertLead(lead)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#16A36A] text-[10px] font-bold cursor-pointer"
                            >
                              <ArrowRightCircle className="w-3 h-3" /> Convert
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Lead Management Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#032e42] text-white text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Programme &amp; Destination</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Follow-up / Officer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#718096]">
                      No leads found. Click &ldquo;Add New Lead&rdquo; or wait for website/WhatsApp inquiries.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const stage = normalizeLeadStatus(lead.status);
                    const isOverdue = lead.nextFollowUp && lead.nextFollowUp < todayStr && stage !== 'Converted' && stage !== 'Closed';
                    const cleanPhone = String(lead.phone || '').replace(/[^0-9]/g, '');
                    return (
                      <tr key={lead.id} className="hover:bg-[#F5F8FC]/80">
                        <td className="py-3 px-4 font-mono font-bold text-[#032e42] whitespace-nowrap">
                          {lead.referenceNo || lead.id}
                          <p className="text-[10px] text-[#718096] font-sans font-normal">{lead.displayDate || ''}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#032e42]">{lead.fullName}</p>
                          <p className="text-[11px] text-[#718096]">{lead.email || '—'}</p>
                          <p className="text-[10.5px] text-slate-400">{lead.phone || '—'} • {lead.organisation || 'Individual'}</p>
                        </td>
                        <td className="py-3 px-4 max-w-[230px]">
                          <p className="font-semibold text-[#032e42] truncate">{lead.courseTitle}</p>
                          <p className="text-[11px] text-[#718096]">{lead.venue || 'Nairobi / Online'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                            {lead.leadSource || lead.channel || 'Website'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            disabled={!canWrite}
                            value={stage}
                            onChange={(e) => handleMoveLeadStage(lead, e.target.value)}
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                              stage === 'Converted' ? 'bg-emerald-50 text-[#16A36A] border-emerald-200' :
                              stage === 'New Lead' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {LEAD_PIPELINE_STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          <p className={isOverdue ? 'text-[#DC4545] font-bold' : 'text-[#032e42]'}>
                            {lead.nextFollowUp ? (isOverdue ? `Overdue: ${lead.nextFollowUp}` : lead.nextFollowUp) : 'Not scheduled'}
                          </p>
                          <p className="text-[10.5px] text-[#718096]">{lead.assignedOfficer ? lead.assignedOfficer.split('@')[0] : 'Unassigned'}</p>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveLead(lead)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#032e42] text-white text-[11px] font-bold cursor-pointer"
                            >
                              CRM Drawer
                            </button>
                            {stage !== 'Converted' && canWrite && (
                              <button
                                type="button"
                                onClick={() => handleConvertLead(lead)}
                                title="Convert Lead directly into Registration"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                              >
                                <ArrowRightCircle className="w-3.5 h-3.5" /> Convert
                              </button>
                            )}
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp Lead"
                                className="p-1.5 rounded-lg bg-emerald-50 text-[#16A36A] hover:bg-emerald-100"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}?subject=${encodeURIComponent(`ECAS Institute: ${lead.courseTitle}`)}`}
                                title="Email Lead"
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {canWrite && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete lead ${lead.fullName}?`)) {
                                    adminRegistrationService.deleteInquiry(lead.id);
                                    onDataChange();
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC4545] cursor-pointer"
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
        </div>
      )}
      </div>
    );
  };

  if (isAddModalOpen) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#032e42] text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div>
              <h2 className="text-base font-black text-[#032e42] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#008000]" /> Add New CRM Lead &amp; Follow-up
              </h2>
              <p className="text-[11px] text-[#718096]">
                Capture prospective delegate details, assign an officer, and schedule follow-up reminders.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateLead} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-3xl overflow-hidden text-xs">
          <div className="bg-[#032e42] text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-sm">Prospective Delegate / Client Details</h3>
            <span className="text-[11px] text-[#4ade80] font-semibold">Live CRM Pipeline</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Contact Name *</label>
              <input
                required
                value={leadForm.fullName}
                onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                placeholder="e.g. Jane Wanjiku"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Lead Source</label>
              <select
                value={leadForm.leadSource}
                onChange={(e) => setLeadForm({ ...leadForm, leadSource: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
              >
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Email</label>
              <input
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                placeholder="delegate@organisation.org"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Phone / WhatsApp</label>
              <input
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                placeholder="+254 708 060 223"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Organisation</label>
              <input
                value={leadForm.organisation}
                onChange={(e) => setLeadForm({ ...leadForm, organisation: e.target.value })}
                placeholder="Ministry / NGO / Corporate"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Country</label>
              <input
                value={leadForm.country}
                onChange={(e) => setLeadForm({ ...leadForm, country: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Pipeline Stage</label>
              <select
                value={leadForm.status}
                onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
              >
                {LEAD_PIPELINE_STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={leadForm.nextFollowUp}
                onChange={(e) => setLeadForm({ ...leadForm, nextFollowUp: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Preferred Venue / Destination</label>
              <input
                value={leadForm.venue}
                onChange={(e) => setLeadForm({ ...leadForm, venue: e.target.value })}
                placeholder="Nairobi, Kenya / Online"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Assigned Officer</label>
              <select
                value={leadForm.assignedOfficer}
                onChange={(e) => setLeadForm({ ...leadForm, assignedOfficer: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
              >
                <option value="">Unassigned</option>
                {staffAccounts.map((a) => <option key={a.email} value={a.email}>{a.email}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#032e42] mb-1">Programme of Interest</label>
              <input
                list="ecas-courses-datalist"
                value={leadForm.courseTitle}
                onChange={(e) => setLeadForm({ ...leadForm, courseTitle: e.target.value })}
                placeholder="Type or pick a course..."
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
              <datalist id="ecas-courses-datalist">
                {courses.slice(0, 100).map((c) => <option key={c.slug} value={c.title} />)}
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#032e42] mb-1">Inquiry &amp; Follow-up Notes</label>
              <textarea
                rows={4}
                value={leadForm.message}
                onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                placeholder="Details of the call, email, WhatsApp inquiry, or next action..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-[#F5F8FC] border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold shadow-sm cursor-pointer">
              <UserPlus className="w-4 h-4" /> Save Lead
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      {renderActiveSubView()}

      {/* CRM Lead Detail Drawer Modal (Available across all CRM sub-views) */}
      {liveSelectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden text-xs">
            <div className="bg-[#032e42] text-white p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-[#4ade80] font-bold">{liveSelectedLead.referenceNo}</p>
                <h3 className="text-base font-black">{liveSelectedLead.fullName}</h3>
              </div>
              <button type="button" onClick={() => setActiveLead(null)} className="p-1.5 rounded-lg bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F5F8FC] border border-slate-200">
                <div><span className="text-[#718096] block">Email</span><span className="font-bold">{liveSelectedLead.email || '—'}</span></div>
                <div><span className="text-[#718096] block">Phone</span><span className="font-bold">{liveSelectedLead.phone || '—'}</span></div>
                <div className="col-span-2"><span className="text-[#718096] block">Programme</span><span className="font-bold">{liveSelectedLead.courseTitle}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Assign Officer</label>
                  <select
                    disabled={!canWrite}
                    value={liveSelectedLead.assignedOfficer || ''}
                    onChange={(e) => {
                      adminRegistrationService.updateInquiry(liveSelectedLead.id, { assignedOfficer: e.target.value });
                      onDataChange();
                    }}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {staffAccounts.map((a) => <option key={a.email} value={a.email}>{a.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Next Follow-up</label>
                  <input
                    type="date"
                    disabled={!canWrite}
                    value={liveSelectedLead.nextFollowUp || ''}
                    onChange={(e) => {
                      adminRegistrationService.updateInquiry(liveSelectedLead.id, { nextFollowUp: e.target.value });
                      onDataChange();
                      showToast('Follow-up date updated.');
                    }}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {canWrite && (
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-[#032e42]">Log Call / Follow-up Note</label>
                  <div className="flex gap-2">
                    <select value={callLogType} onChange={(e) => setCallLogType(e.target.value)} className="h-9 px-2.5 rounded-lg border border-slate-300 bg-white">
                      <option>Phone Call</option>
                      <option>WhatsApp</option>
                      <option>Email</option>
                      <option>Internal Note</option>
                    </select>
                    <input
                      value={callLogText}
                      onChange={(e) => setCallLogText(e.target.value)}
                      placeholder="Summarize conversation or next step..."
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLogInteraction(liveSelectedLead)}
                    className="w-full py-2 rounded-xl bg-[#032e42] text-white font-bold cursor-pointer"
                  >
                    Record Interaction
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-extrabold text-[#032e42] uppercase text-[10px] tracking-wider">Interaction Timeline</h4>
                {(!liveSelectedLead.communicationLog || liveSelectedLead.communicationLog.length === 0) ? (
                  <p className="text-[#718096]">No logged conversations yet.</p>
                ) : (
                  liveSelectedLead.communicationLog.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-[#F5F8FC] border-l-2 border-[#008000]">
                      <p className="font-bold text-[#032e42]">{log.type} <span className="font-normal text-[#718096]">• {log.by}</span></p>
                      <p className="text-slate-600 mt-0.5">{log.summary}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(log.at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-[#F5F8FC] flex justify-between items-center">
              {normalizeLeadStatus(liveSelectedLead.status) !== 'Converted' && canWrite ? (
                <button
                  type="button"
                  onClick={() => handleConvertLead(liveSelectedLead)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A36A] text-white font-bold cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Convert to Registration
                </button>
              ) : (
                <span className="text-[#16A36A] font-bold">Converted ✓</span>
              )}
              <button type="button" onClick={() => setActiveLead(null)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
