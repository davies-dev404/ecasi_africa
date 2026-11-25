import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCog,
  ShieldCheck,
  ScrollText,
  Settings,
  Activity,
  Plus,
  RefreshCw,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Database,
  Server,
  HardDrive,
  Mail,
  Lock,
} from 'lucide-react';
import {
  ROLE_CATALOG,
  normalizeRole,
  getRoleDefinition,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

export default function AdministrationModule({
  activeTab,
  staffAccounts = [],
  auditEvents = [],
  settings,
  currentUser,
  onDataChange,
  showToast,
}) {
  const [staffForm, setStaffForm] = useState({ email: '', name: '', role: 'ADMISSIONS_OFFICER', status: 'Active' });
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState('All');
  const [settingsForm, setSettingsForm] = useState(settings || msimamiziEnterpriseService.getSettings());
  const [healthState, setHealthState] = useState({ loading: false, live: false, health: null });

  useEffect(() => {
    if (settings) setSettingsForm(settings);
  }, [settings]);

  const loadHealth = async () => {
    setHealthState((prev) => ({ ...prev, loading: true }));
    const res = await msimamiziEnterpriseService.fetchSystemHealth();
    setHealthState({ loading: false, live: Boolean(res?.live), health: res?.health || null });
  };

  useEffect(() => {
    if (activeTab === 'system-health') {
      loadHealth();
    }
  }, [activeTab]);

  const filteredAudits = useMemo(() => {
    return auditEvents.filter((ev) => {
      if (auditEntityFilter !== 'All' && ev.entityType !== auditEntityFilter) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const hay = `${ev.id || ''} ${ev.administrator || ''} ${ev.action || ''} ${ev.entityType || ''} ${ev.affectedRecord || ''} ${ev.newValue || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [auditEvents, auditSearch, auditEntityFilter]);

  // 1. STAFF ACCOUNTS
  if (activeTab === 'staff-accounts') {
    const handleSaveStaff = async (e) => {
      e.preventDefault();
      const res = await msimamiziEnterpriseService.manageStaffAccount(staffForm, currentUser);
      if (!res.success) {
        alert(res.error);
        return;
      }
      setStaffForm({ email: '', name: '', role: 'ADMISSIONS_OFFICER', status: 'Active' });
      onDataChange();
      showToast('Staff account permissions updated & synced.');
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#00B8B0]" /> Staff Accounts ({staffAccounts.length})
            </h2>
            <p className="text-xs text-[#718096]">Assign roles and enforce backend &amp; frontend RBAC permissions for @ecasiafrica.org staff.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#071C2D] text-white text-[11px] uppercase">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Role Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffAccounts.map((acc) => {
                  const def = getRoleDefinition(acc.role);
                  return (
                    <tr key={acc.email} className="hover:bg-[#F5F8FC]">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#10243E]">{acc.name || acc.email.split('@')[0]}</p>
                        <p className="text-[11px] font-mono text-[#718096]">{acc.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10.5px] font-bold ${def.badgeColor}`}>
                          {def.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.status === 'Suspended' ? 'bg-red-100 text-[#DC4545]' : 'bg-emerald-100 text-[#16A36A]'
                        }`}>
                          {acc.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={normalizeRole(acc.role)}
                            onChange={async (e) => {
                              const res = await msimamiziEnterpriseService.manageStaffAccount(
                                { email: acc.email, name: acc.name, role: e.target.value, status: acc.status || 'Active' },
                                currentUser
                              );
                              if (res.success) {
                                onDataChange();
                                showToast(`Updated ${acc.email} to ${e.target.value}.`);
                              }
                            }}
                            className="h-8 px-2 rounded-lg border border-slate-300 bg-white text-[11px] font-bold"
                          >
                            {ROLE_CATALOG.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                          </select>
                          <button
                            type="button"
                            onClick={async () => {
                              const nextStatus = acc.status === 'Suspended' ? 'Active' : 'Suspended';
                              await msimamiziEnterpriseService.manageStaffAccount(
                                { email: acc.email, name: acc.name, role: acc.role, status: nextStatus },
                                currentUser
                              );
                              onDataChange();
                              showToast(`${acc.email} marked as ${nextStatus}.`);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10.5px] font-bold cursor-pointer"
                          >
                            {acc.status === 'Suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSaveStaff} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs h-fit">
          <h3 className="text-sm font-black text-[#10243E] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#00B8B0]" /> Add / Update Staff Access
          </h3>
          <input required type="email" placeholder="staffname@ecasiafrica.org" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
          <input placeholder="Full Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
          <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white font-semibold">
            {ROLE_CATALOG.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <select value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-[#00B8B0] text-white font-bold cursor-pointer">
            Save Staff Permissions
          </button>
        </form>
      </div>
    );
  }

  // 2. ROLES & PERMISSIONS MATRIX
  if (activeTab === 'roles-permissions') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00B8B0]" /> Enterprise Roles &amp; Permissions Matrix
          </h2>
          <p className="text-xs text-[#718096] mt-0.5">
            Role-based access control is enforced both in the PHP backend API (HTTP 403 on unauthorized mutations) and the Msimamizi UI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_CATALOG.map((role) => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${role.badgeColor}`}>{role.label}</span>
                <span className="font-mono text-[10px] text-[#718096]">{role.id}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded bg-[#F5F8FC] border border-slate-200 text-[10px] font-mono text-[#10243E]">
                    {p === '*' ? 'ALL_PERMISSIONS' : p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. IMMUTABLE AUDIT LOGS
  if (activeTab === 'audit-logs') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-[#00B8B0]" /> Security &amp; Audit Logs ({filteredAudits.length})
              </h2>
              <p className="text-xs text-[#718096] flex items-center gap-1 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-[#16A36A]" /> Append-only immutable audit trail — cannot be edited or deleted through the portal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const headers = ['Event ID', 'Timestamp', 'Administrator', 'Role', 'Action', 'Entity', 'Affected Record', 'Previous Value', 'New Value', 'IP'];
                const rows = filteredAudits.map((e) => [e.id, e.timestamp, e.administrator, e.role, e.action, e.entityType, e.affectedRecord, e.previousValue, e.newValue, e.ip]);
                msimamiziEnterpriseService.exportCSV(headers, rows, `ECAS_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`, currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071C2D] text-white text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00B8B0]" /> Export Audit CSV
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} placeholder="Search admin, action, affected record..." className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs" />
            </div>
            <select value={auditEntityFilter} onChange={(e) => setAuditEntityFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold">
              <option value="All">All Entity Types</option>
              {['Auth', 'Registration', 'Lead', 'Course', 'Cohort', 'Invoice', 'Payment', 'Vacancy', 'Candidate', 'Communication', 'WebsiteCMS', 'StaffAccount', 'Settings', 'Export'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0">
                <tr className="bg-[#071C2D] text-white text-[11px] uppercase">
                  <th className="py-3 px-4">Timestamp / Event ID</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action &amp; Entity</th>
                  <th className="py-3 px-4">Affected Record</th>
                  <th className="py-3 px-4">Change (Prev → New)</th>
                  <th className="py-3 px-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAudits.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-[#718096]">No audit events recorded yet.</td></tr>
                ) : (
                  filteredAudits.slice(0, 200).map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#F5F8FC]">
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <p className="font-mono text-[11px] font-bold text-[#10243E]">{new Date(ev.timestamp).toLocaleString()}</p>
                        <p className="text-[10px] font-mono text-[#718096]">{ev.id}</p>
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-bold text-[#10243E]">{ev.administrator}</p>
                        <p className="text-[10px] text-[#718096]">{ev.role}</p>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 font-mono font-bold text-[10px]">{ev.action}</span>
                        <span className="block text-[10px] text-[#718096] mt-0.5">{ev.entityType}</span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#10243E] max-w-[180px] truncate">{ev.affectedRecord || '—'}</td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-600 max-w-[260px]">
                        {ev.previousValue && <span className="line-through text-slate-400 mr-1.5">{ev.previousValue}</span>}
                        {ev.newValue && <span className="font-semibold text-[#10243E]">{ev.newValue}</span>}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[10.5px] text-[#718096]">{ev.ip || '—'}</td>
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

  // 4. PLATFORM SETTINGS
  if (activeTab === 'platform-settings') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          msimamiziEnterpriseService.saveSettings(settingsForm, currentUser);
          onDataChange();
          showToast('Platform settings saved and synced.');
        }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs max-w-4xl"
      >
        <div className="bg-[#071C2D] text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#00B8B0]" /> Platform &amp; Institutional Settings
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">Secrets, passwords, and API keys are never exposed or editable from the client UI.</p>
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#00B8B0] text-white font-bold cursor-pointer">
            Save Configuration
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#10243E] mb-1">Institution Legal Name</label>
              <input value={settingsForm.institutionName || ''} onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#10243E] mb-1">Institutional Tagline</label>
              <input value={settingsForm.tagline || ''} onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#10243E] mb-1">Official Email</label>
              <input type="email" value={settingsForm.officialEmail || ''} onChange={(e) => setSettingsForm({ ...settingsForm, officialEmail: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#10243E] mb-1">Finance Desk Email</label>
              <input type="email" value={settingsForm.financeEmail || ''} onChange={(e) => setSettingsForm({ ...settingsForm, financeEmail: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#10243E] mb-1">WhatsApp Business Number</label>
              <input value={settingsForm.whatsappNumber || ''} onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#10243E] mb-1">Physical Address</label>
              <input value={settingsForm.address || ''} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#10243E] mb-1">Default Currency</label>
              <select value={settingsForm.defaultCurrency || 'USD'} onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                <option value="USD">USD ($)</option>
                <option value="KES">KES (KSh)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#10243E] mb-1">USD → KES Exchange Rate</label>
              <input type="number" min={1} value={settingsForm.usdToKesRate || 130} onChange={(e) => setSettingsForm({ ...settingsForm, usdToKesRate: Number(e.target.value) })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#10243E] mb-1">Invoice Payment Terms (Days)</label>
              <input type="number" min={1} max={90} value={settingsForm.invoicePaymentTermsDays || 14} onChange={(e) => setSettingsForm({ ...settingsForm, invoicePaymentTermsDays: Number(e.target.value) })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#10243E] mb-1">Bank &amp; Wire Instructions (Shown on Printable Invoices)</label>
            <textarea rows={3} value={settingsForm.bankDetails || ''} onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })} className="w-full p-3 rounded-xl border border-slate-300" />
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 font-semibold text-[#10243E] cursor-pointer">
              <input type="checkbox" checked={Boolean(settingsForm.emailNotificationsEnabled)} onChange={(e) => setSettingsForm({ ...settingsForm, emailNotificationsEnabled: e.target.checked })} />
              <span>Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 font-semibold text-[#10243E] cursor-pointer">
              <input type="checkbox" checked={Boolean(settingsForm.whatsappNotificationsEnabled)} onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNotificationsEnabled: e.target.checked })} />
              <span>Enable WhatsApp Integrations</span>
            </label>
            <label className="flex items-center gap-2 font-semibold text-[#10243E] cursor-pointer">
              <input type="checkbox" checked={Boolean(settingsForm.autoInvoiceOnApproval)} onChange={(e) => setSettingsForm({ ...settingsForm, autoInvoiceOnApproval: e.target.checked })} />
              <span>Auto-prompt Invoice on Application Approval</span>
            </label>
          </div>
        </div>
      </form>
    );
  }

  // 5. SYSTEM HEALTH
  const h = healthState.health;
  const formatBytes = (b) => {
    if (b === null || b === undefined) return 'N/A';
    if (b > 1073741824) return `${(b / 1073741824).toFixed(2)} GB`;
    if (b > 1048576) return `${(b / 1048576).toFixed(2)} MB`;
    return `${(b / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00B8B0]" /> System Health &amp; Infrastructure Diagnostics
          </h2>
          <p className="text-xs text-[#718096]">
            {healthState.live ? 'Live production server telemetry from msimamizi-sync.php' : 'Local environment telemetry snapshot'}
          </p>
        </div>
        <button
          type="button"
          onClick={loadHealth}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071C2D] text-white text-xs font-bold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00B8B0] ${healthState.loading ? 'animate-spin' : ''}`} /> Run Health Check
        </button>
      </div>

      {h && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            { icon: Server, label: 'Backend API Status', val: h.apiStatus, ok: h.apiStatus === 'Operational' || h.apiStatus === 'Local Dev Mode', sub: `PHP ${h.phpVersion}` },
            { icon: Database, label: 'Database & Store', val: h.databaseStatus, ok: true, sub: `MySQL: ${h.mysqlConnected ? 'Connected' : 'Optional / JSON Store Active'}` },
            { icon: HardDrive, label: 'Storage Availability', val: h.storageWritable ? 'Writable & Healthy' : 'Read-Only Warning', ok: h.storageWritable, sub: `Store: ${formatBytes(h.storeFileSizeBytes)} • Free: ${formatBytes(h.diskFreeBytes)}` },
            { icon: Mail, label: 'Email Service (PHP Mail)', val: h.mailFunctionAvailable ? 'Available' : 'Client / Mailto Fallback', ok: h.mailFunctionAvailable, sub: 'Outbound notifications & receipts' },
            { icon: ShieldCheck, label: 'Turnstile Bot Security', val: h.turnstileConfigured ? 'Configured' : 'Env Required', ok: h.turnstileConfigured, sub: 'Secrets protected server-side' },
            { icon: Activity, label: 'Active Admin Sessions', val: `${h.activeSessionsCount} Session(s)`, ok: true, sub: `Server UTC: ${new Date(h.serverTime).toLocaleTimeString()}` },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold text-[#10243E]">
                    <Icon className="w-4 h-4 text-[#00B8B0]" /> {card.label}
                  </span>
                  {card.ok ? <CheckCircle2 className="w-4 h-4 text-[#16A36A]" /> : <AlertTriangle className="w-4 h-4 text-[#F0A020]" />}
                </div>
                <p className="text-sm font-black text-[#10243E]">{card.val}</p>
                <p className="text-[11px] text-[#718096]">{card.sub}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
