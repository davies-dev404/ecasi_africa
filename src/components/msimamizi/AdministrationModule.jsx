import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCog,
  ShieldCheck,
  ScrollText,
  Settings,
  Activity,
  UserPlus,
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
  Crown,
  User,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { isSuperAdminEmail } from '@/services/adminRegistrationService';
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
  const [staffForm, setStaffForm] = useState({ email: '', name: '', role: 'ADMISSIONS_OFFICER', status: 'Active', password: '' });
  const [showStaffPass, setShowStaffPass] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState('All');
  const [settingsForm, setSettingsForm] = useState(settings || msimamiziEnterpriseService.getSettings());
  const [healthState, setHealthState] = useState({ loading: false, live: false, health: null });
  const [mfaSetup, setMfaSetup] = useState({ active: false, secret: '', otpauthUri: '', code: '', recoveryCodes: [], busy: false, error: '' });
  const [mfaDisablePass, setMfaDisablePass] = useState('');
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', busy: false, msg: '', err: '' });
  const [backupStatus, setBackupStatus] = useState('');

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

  // 1. STAFF ACCOUNTS (Super Admins Jacob Olonde & Gift Rioba manage @ecasiafrica.org users)
  if (activeTab === 'staff-accounts') {
    const handleSaveStaff = async (e) => {
      e.preventDefault();
      const rawEmail = staffForm.email.trim();
      const fullEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@ecasiafrica.org`;
      const res = await msimamiziEnterpriseService.manageStaffAccount(
        { ...staffForm, email: fullEmail },
        currentUser
      );
      if (!res.success) {
        alert(res.error);
        return;
      }
      setStaffForm({ email: '', name: '', role: 'ADMISSIONS_OFFICER', status: 'Active', password: '' });
      onDataChange();
      showToast(
        res.isNew
          ? `Added ${fullEmail} to ECAS Msimamizi (${staffForm.role}).`
          : `Updated permissions for ${fullEmail}.`
      );
    };

    const handleQuickResetPassword = async (acc) => {
      const nextPass = window.prompt(`Enter a new temporary password (min. 6 characters) for ${acc.email}:`);
      if (!nextPass) return;
      if (nextPass.trim().length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }
      const res = await msimamiziEnterpriseService.manageStaffAccount(
        { email: acc.email, name: acc.name, role: acc.role, status: acc.status || 'Active', password: nextPass.trim() },
        currentUser
      );
      if (res.success) {
        onDataChange();
        showToast(`Password updated for ${acc.email}.`);
      } else {
        alert(res.error);
      }
    };

    return (
      <div className="space-y-5">
        {/* Primary Super Admin Authority Banner */}
        <div className="bg-[#032e42] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#008000]/25 border border-[#4ade80]/40 text-[#4ade80] flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4ade80]">
                Super Admin User Provisioning Authority
              </p>
              <h3 className="text-sm font-black mt-0.5">
                Primary Super Admins: Jacob Olonde (jacob@ecasiafrica.org) &amp; Gift Rioba (riobag@ecasiafrica.org)
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Only Super Admins can add, assign roles to, suspend, or remove other <strong className="text-white">@ecasiafrica.org</strong> institutional users.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
                <UserCog className="w-5 h-5 text-[#008000]" /> Institutional Staff Accounts ({staffAccounts.length})
              </h2>
              <p className="text-xs text-[#718096]">Role-based access control enforced on both backend PHP API and Msimamizi UI.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#032e42] text-white text-[11px] uppercase">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Manage Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffAccounts.map((acc) => {
                    const def = getRoleDefinition(acc.role);
                    const isPrimarySuper = isSuperAdminEmail(acc.email);
                    return (
                      <tr key={acc.email} className="hover:bg-[#F5F8FC]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${isPrimarySuper ? 'bg-[#032e42] text-[#4ade80]' : 'bg-emerald-50 text-[#008000]'
                              }`}>
                              {isPrimarySuper ? <Crown className="w-4 h-4" /> : (acc.name || acc.email).substring(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-[#032e42] flex items-center gap-1.5">
                                <span>{acc.name || acc.email.split('@')[0]}</span>
                                {isPrimarySuper && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-black uppercase">
                                    Primary
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] font-mono text-[#718096]">{acc.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10.5px] font-bold ${def.badgeColor}`}>
                            {def.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${acc.status === 'Suspended' ? 'bg-red-100 text-[#DC4545]' : 'bg-emerald-100 text-[#16A36A]'
                            }`}>
                            {acc.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {isPrimarySuper ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10.5px] font-bold">
                                <Lock className="w-3 h-3 text-[#008000]" /> Protected Super Admin
                              </span>
                            ) : (
                              <>
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
                                  onClick={() => handleQuickResetPassword(acc)}
                                  title="Set / Reset Password"
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>
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
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!window.confirm(`Remove staff account ${acc.email} from Msimamizi?`)) return;
                                    const res = await msimamiziEnterpriseService.deleteStaffAccount(acc.email, currentUser);
                                    if (res.success) {
                                      onDataChange();
                                      showToast(`Removed ${acc.email}.`);
                                    } else {
                                      alert(res.error);
                                    }
                                  }}
                                  title="Remove Staff User"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC4545] hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New @ecasiafrica.org User Form */}
          <form onSubmit={handleSaveStaff} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 text-xs h-fit">
            <div>
              <h3 className="text-sm font-black text-[#032e42] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#008000]" /> Add @ecasiafrica.org User
              </h3>
              <p className="text-[11px] text-[#718096] mt-0.5">
                Provision a new staff account using their institutional email.
              </p>
            </div>

            <div>
              <label className="block font-bold text-[#032e42] mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  placeholder="e.g. Jane Wanjiku"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#032e42] mb-1">Institutional Email *</label>
              <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden focus-within:border-[#008000]">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    placeholder="username"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full h-9 pl-9 pr-2 border-0 focus:outline-none text-xs"
                  />
                </div>
                {!staffForm.email.includes('@') && (
                  <span className="px-2.5 h-9 flex items-center bg-[#F5F8FC] border-l border-slate-200 text-[11px] font-mono font-bold text-[#032e42]">
                    @ecasiafrica.org
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#032e42] mb-1">Assigned Role &amp; Permissions</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#008000] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  {ROLE_CATALOG.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#032e42] mb-1">
                Initial Password <span className="font-normal text-[#718096]">(Optional, min 6 chars)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showStaffPass ? 'text' : 'password'}
                  minLength={6}
                  placeholder="Set password now or leave blank"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full h-9 pl-9 pr-9 rounded-xl border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPass((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showStaffPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10.5px] text-[#718096] mt-1">
                If left blank, the user can set their own password on first login via &ldquo;Create First Password&rdquo;.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add &amp; Authorize User</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. ROLES & PERMISSIONS MATRIX
  if (activeTab === 'roles-permissions') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#008000]" /> Enterprise Roles &amp; Permissions Matrix
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
                  <span key={p} className="px-2 py-0.5 rounded bg-[#F5F8FC] border border-slate-200 text-[10px] font-mono text-[#032e42]">
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
              <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-[#008000]" /> Security &amp; Audit Logs ({filteredAudits.length})
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#032e42] text-white text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#4ade80]" /> Export Audit CSV
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
                <tr className="bg-[#032e42] text-white text-[11px] uppercase">
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
                        <p className="font-mono text-[11px] font-bold text-[#032e42]">{new Date(ev.timestamp).toLocaleString()}</p>
                        <p className="text-[10px] font-mono text-[#718096]">{ev.id}</p>
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-bold text-[#032e42]">{ev.administrator}</p>
                        <p className="text-[10px] text-[#718096]">{ev.role}</p>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#032e42] font-mono font-bold text-[10px]">{ev.action}</span>
                        <span className="block text-[10px] text-[#718096] mt-0.5">{ev.entityType}</span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#032e42] max-w-[180px] truncate">{ev.affectedRecord || '—'}</td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-600 max-w-[260px]">
                        {ev.previousValue && <span className="line-through text-slate-400 mr-1.5">{ev.previousValue}</span>}
                        {ev.newValue && <span className="font-semibold text-[#032e42]">{ev.newValue}</span>}
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
        <div className="bg-[#032e42] text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#4ade80]" /> Platform &amp; Institutional Settings
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">Secrets, passwords, and API keys are never exposed or editable from the client UI.</p>
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#008000] text-white font-bold cursor-pointer">
            Save Configuration
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Institution Legal Name</label>
              <input value={settingsForm.institutionName || ''} onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Institutional Tagline</label>
              <input value={settingsForm.tagline || ''} onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Official Email</label>
              <input type="email" value={settingsForm.officialEmail || ''} onChange={(e) => setSettingsForm({ ...settingsForm, officialEmail: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Finance Desk Email</label>
              <input type="email" value={settingsForm.financeEmail || ''} onChange={(e) => setSettingsForm({ ...settingsForm, financeEmail: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">WhatsApp Business Number</label>
              <input value={settingsForm.whatsappNumber || ''} onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Physical Address</label>
              <input value={settingsForm.address || ''} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Default Currency</label>
              <select value={settingsForm.defaultCurrency || 'USD'} onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                <option value="USD">USD ($)</option>
                <option value="KES">KES (KSh)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">USD → KES Exchange Rate</label>
              <input type="number" min={1} value={settingsForm.usdToKesRate || 130} onChange={(e) => setSettingsForm({ ...settingsForm, usdToKesRate: Number(e.target.value) })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Invoice Payment Terms (Days)</label>
              <input type="number" min={1} max={90} value={settingsForm.invoicePaymentTermsDays || 14} onChange={(e) => setSettingsForm({ ...settingsForm, invoicePaymentTermsDays: Number(e.target.value) })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#032e42] mb-1">Bank &amp; Wire Instructions (Shown on Printable Invoices)</label>
            <textarea rows={3} value={settingsForm.bankDetails || ''} onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })} className="w-full p-3 rounded-xl border border-slate-300" />
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 font-semibold text-[#032e42] cursor-pointer">
              <input type="checkbox" checked={Boolean(settingsForm.emailNotificationsEnabled)} onChange={(e) => setSettingsForm({ ...settingsForm, emailNotificationsEnabled: e.target.checked })} />
              <span>Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 font-semibold text-[#032e42] cursor-pointer">
              <input type="checkbox" checked={Boolean(settingsForm.whatsappNotificationsEnabled)} onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNotificationsEnabled: e.target.checked })} />
              <span>Enable WhatsApp Integrations</span>
            </label>
            <label className="flex items-center gap-2 font-semibold text-[#032e42] cursor-pointer">
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#008000]" /> System Health, Account MFA &amp; Verified Backups
          </h2>
          <p className="text-xs text-[#718096]">
            {healthState.live ? 'Live production server telemetry from msimamizi-sync.php' : 'Local environment telemetry snapshot'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const res = await msimamiziEnterpriseService.exportVerifiedBackup(currentUser);
              if (res.success) {
                setBackupStatus(`Backup downloaded • SHA-256: ${res.sha256}`);
                showToast('SHA-256 Verified Institutional Backup downloaded.');
              } else {
                alert(res.error);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold cursor-pointer transition"
          >
            <Download className="w-3.5 h-3.5" /> Download Verified Backup
          </button>
          <button
            type="button"
            onClick={loadHealth}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#032e42] text-white text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#4ade80] ${healthState.loading ? 'animate-spin' : ''}`} /> Run Health Check
          </button>
        </div>
      </div>

      {backupStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono break-all">
          {backupStatus}
        </div>
      )}

      {/* Administrator MFA (TOTP Authenticator App) & Password Rotation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-[#032e42] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#008000]" /> Multi-Factor Authentication (Authenticator App)
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${currentUser?.mfaEnabled ? 'bg-emerald-100 text-[#16A36A]' : 'bg-amber-100 text-amber-800'}`}>
              {currentUser?.mfaEnabled ? 'MFA Active' : 'Not Enrolled'}
            </span>
          </div>
          <p className="text-[#718096]">
            Protect your administrator account ({currentUser?.email}) with RFC 6238 TOTP 6-digit codes from Google Authenticator, Microsoft Authenticator, or Authy, plus 8 single-use backup recovery codes.
          </p>

          {!currentUser?.mfaEnabled && !mfaSetup.active && (
            <button
              type="button"
              disabled={mfaSetup.busy}
              onClick={async () => {
                setMfaSetup((s) => ({ ...s, busy: true, error: '' }));
                const res = await msimamiziEnterpriseService.startMfaSetup();
                if (res.success) {
                  setMfaSetup({ active: true, secret: res.secret, otpauthUri: res.otpauthUri, code: '', recoveryCodes: [], busy: false, error: '' });
                } else {
                  setMfaSetup((s) => ({ ...s, busy: false, error: res.error }));
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#032e42] hover:bg-[#008000] text-white font-bold cursor-pointer transition"
            >
              <Lock className="w-3.5 h-3.5" /> Enroll Authenticator App MFA
            </button>
          )}

          {mfaSetup.active && (
            <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200 space-y-3">
              <p className="font-bold text-[#032e42]">Step 1: Add this account to Google / Microsoft Authenticator</p>
              <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-[11px] break-all">
                <span className="text-[10px] text-[#718096] block uppercase font-sans font-bold mb-1">Manual Setup Key (Base32):</span>
                <strong className="text-[#032e42] select-all">{mfaSetup.secret}</strong>
              </div>
              <p className="font-bold text-[#032e42]">Step 2: Enter the 6-digit code shown in your app</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaSetup.code}
                  onChange={(e) => setMfaSetup((s) => ({ ...s, code: e.target.value }))}
                  placeholder="123456"
                  className="h-9 px-3 rounded-xl border border-slate-300 bg-white font-mono w-36"
                />
                <button
                  type="button"
                  disabled={mfaSetup.busy}
                  onClick={async () => {
                    setMfaSetup((s) => ({ ...s, busy: true, error: '' }));
                    const res = await msimamiziEnterpriseService.confirmMfaSetup(mfaSetup.code);
                    if (res.success) {
                      setMfaSetup({ active: false, secret: '', otpauthUri: '', code: '', recoveryCodes: res.recoveryCodes || [], busy: false, error: '' });
                      onDataChange();
                      showToast('MFA enabled! Save your 8 backup recovery codes safely.');
                    } else {
                      setMfaSetup((s) => ({ ...s, busy: false, error: res.error }));
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#16A36A] text-white font-bold cursor-pointer"
                >
                  Confirm &amp; Activate MFA
                </button>
              </div>
            </div>
          )}

          {mfaSetup.recoveryCodes.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
              <p className="font-black text-amber-950">Save These 8 Single-Use Backup Recovery Codes Now (Shown Once!):</p>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] font-bold text-[#032e42]">
                {mfaSetup.recoveryCodes.map((c) => <span key={c} className="bg-white px-2 py-1 rounded border border-amber-200">{c}</span>)}
              </div>
            </div>
          )}

          {currentUser?.mfaEnabled && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <input
                type="password"
                value={mfaDisablePass}
                onChange={(e) => setMfaDisablePass(e.target.value)}
                placeholder="Current password to disable MFA"
                className="h-9 px-3 rounded-xl border border-slate-300 flex-1 min-w-[180px]"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!mfaDisablePass) return;
                  const res = await msimamiziEnterpriseService.disableMfa(mfaDisablePass);
                  if (res.success) {
                    setMfaDisablePass('');
                    onDataChange();
                    showToast('MFA disabled on your account.');
                  } else {
                    setMfaSetup((s) => ({ ...s, error: res.error }));
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC4545] border border-red-200 font-bold cursor-pointer"
              >
                Disable MFA
              </button>
            </div>
          )}

          {mfaSetup.error && <p className="text-[#DC4545] font-bold">{mfaSetup.error}</p>}
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (pwdForm.newPassword !== pwdForm.confirmPassword) {
              setPwdForm((p) => ({ ...p, err: 'New passwords do not match.', msg: '' }));
              return;
            }
            setPwdForm((p) => ({ ...p, busy: true, err: '', msg: '' }));
            const res = await msimamiziEnterpriseService.changeOwnPassword(pwdForm.currentPassword, pwdForm.newPassword, currentUser);
            if (res.success) {
              setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '', busy: false, msg: res.message, err: '' });
              showToast('Password updated securely and other sessions invalidated.');
            } else {
              setPwdForm((p) => ({ ...p, busy: false, err: res.error }));
            }
          }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3"
        >
          <h3 className="text-sm font-black text-[#032e42] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#008000]" /> Rotate My Administrator Password
          </h3>
          <p className="text-[#718096]">Changing your password requires your current password and immediately invalidates all other active sessions.</p>
          <input type="password" required value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} placeholder="Current password *" className="w-full h-9 px-3 rounded-xl border border-slate-300" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input type="password" required minLength={8} value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} placeholder="New password (min 8 chars) *" className="h-9 px-3 rounded-xl border border-slate-300" />
            <input type="password" required minLength={8} value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} placeholder="Confirm new password *" className="h-9 px-3 rounded-xl border border-slate-300" />
          </div>
          {pwdForm.err && <p className="text-[#DC4545] font-bold">{pwdForm.err}</p>}
          {pwdForm.msg && <p className="text-[#16A36A] font-bold">{pwdForm.msg}</p>}
          <button type="submit" disabled={pwdForm.busy} className="px-4 py-2 rounded-xl bg-[#032e42] hover:bg-[#008000] text-white font-bold cursor-pointer transition">
            {pwdForm.busy ? 'Updating...' : 'Update Password & Invalidate Other Sessions'}
          </button>
        </form>
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
                  <span className="flex items-center gap-2 font-bold text-[#032e42]">
                    <Icon className="w-4 h-4 text-[#008000]" /> {card.label}
                  </span>
                  {card.ok ? <CheckCircle2 className="w-4 h-4 text-[#16A36A]" /> : <AlertTriangle className="w-4 h-4 text-[#F0A020]" />}
                </div>
                <p className="text-sm font-black text-[#032e42]">{card.val}</p>
                <p className="text-[11px] text-[#718096]">{card.sub}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
