import React, { useState, useMemo } from 'react';
import {
  FileUser,
  Star,
  Workflow,
  ClipboardList,
  Download,
  Eye,
  Search,
  Calendar,
} from 'lucide-react';
import { adminRegistrationService } from '@/services/adminRegistrationService';
import {
  RECRUITMENT_STAGES,
  normalizeCandidateStage,
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

export default function RecruitmentModule({
  activeTab,
  applications = [],
  vacancies = [],
  currentUser,
  onDataChange,
  onSelectApplication,
  onOpenPostVacancy,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [vacancyFilter, setVacancyFilter] = useState('All');
  const canWrite = hasPermission(currentUser, 'recruitment.write');

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const stage = normalizeCandidateStage(app.status);
      if (activeTab === 'shortlisted-candidates' && !['Shortlisted', 'Interview', 'Selected'].includes(stage)) {
        return false;
      }
      if (vacancyFilter !== 'All' && (app.jobTitle || 'Speculative Application') !== vacancyFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${app.fullName || ''} ${app.email || ''} ${app.phone || ''} ${app.jobTitle || ''} ${app.specialty || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [applications, activeTab, vacancyFilter, search]);

  const handleMoveStage = (app, nextStage) => {
    if (!canWrite) return;
    const prev = normalizeCandidateStage(app.status);
    adminRegistrationService.updateApplication(app.id, { status: nextStage });
    msimamiziEnterpriseService.logAudit(currentUser, 'CANDIDATE_STAGE_CHANGE', 'Candidate', app.fullName, prev, nextStage);
    onDataChange();
    showToast(`${app.fullName} moved to ${nextStage}.`);
  };

  const titleMap = {
    'candidate-cvs': 'Candidate CVs Repository',
    'recruitment-applications': 'Job Applications Directory',
    'shortlisted-candidates': 'Shortlisted & Interview Desk',
    'recruitment-pipeline': 'Recruitment Pipeline Board',
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              {activeTab === 'shortlisted-candidates' ? <Star className="w-5 h-5 text-[#F0A020]" /> :
               activeTab === 'recruitment-pipeline' ? <Workflow className="w-5 h-5 text-[#008000]" /> :
               activeTab === 'recruitment-applications' ? <ClipboardList className="w-5 h-5 text-[#008000]" /> :
               <FileUser className="w-5 h-5 text-[#008000]" />}
              {titleMap[activeTab] || 'Candidate Recruitment'} ({filtered.length})
            </h2>
            <p className="text-xs text-[#718096]">
              Pipeline: Application Received → Screening → Shortlisted → Interview → Selected / Rejected.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canWrite && (
              <button type="button" onClick={onOpenPostVacancy} className="px-3.5 py-2 rounded-xl bg-[#008000] text-white text-xs font-bold cursor-pointer">
                + Post Vacancy
              </button>
            )}
            <button
              type="button"
              onClick={() => adminRegistrationService.downloadApplicationsCSV()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#032e42] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CVs CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, email, role, expertise..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <select value={vacancyFilter} onChange={(e) => setVacancyFilter(e.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold">
            <option value="All">All Vacancies</option>
            <option value="Speculative Application">Speculative Application</option>
            {vacancies.map((v) => <option key={v.id} value={v.title}>{v.title}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban Pipeline */}
      {activeTab === 'recruitment-pipeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {RECRUITMENT_STAGES.map((stage) => {
            const items = filtered.filter((a) => normalizeCandidateStage(a.status) === stage);
            return (
              <div key={stage} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[520px]">
                <div className="px-4 py-3 border-b border-slate-100 bg-[#F5F8FC] rounded-t-2xl flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#032e42]">{stage}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#032e42] text-white text-[10px] font-bold">{items.length}</span>
                </div>
                <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
                  {items.length === 0 ? (
                    <p className="text-[11px] text-[#718096] text-center py-6">No candidates in {stage}</p>
                  ) : (
                    items.map((app) => (
                      <div key={app.id} className="p-3 rounded-xl border border-slate-200 hover:border-[#008000] space-y-2 text-xs">
                        <p className="font-bold text-[#032e42]">{app.fullName}</p>
                        <p className="text-[11px] text-[#718096] truncate">{app.jobTitle || 'Speculative'}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                          <select
                            disabled={!canWrite}
                            value={stage}
                            onChange={(e) => handleMoveStage(app, e.target.value)}
                            className="h-7 px-2 rounded-lg border border-slate-200 text-[10.5px] font-bold bg-[#F5F8FC]"
                          >
                            {RECRUITMENT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button type="button" onClick={() => onSelectApplication(app)} className="text-[11px] font-bold text-[#008000] hover:underline cursor-pointer">
                            Dossier
                          </button>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#032e42] text-white text-[11px] uppercase">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Vacancy Applied For</th>
                  <th className="py-3 px-4">CV Document</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  {activeTab === 'shortlisted-candidates' && <th className="py-3 px-4">Interview Date &amp; Outcome</th>}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-[#718096]">No candidate records found in this view.</td></tr>
                ) : (
                  filtered.map((app) => {
                    const stage = normalizeCandidateStage(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-[#F5F8FC]">
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#032e42]">{app.fullName}</p>
                          <p className="text-[11px] text-[#718096]">{app.email} • {app.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#032e42]">{app.jobTitle || 'Speculative Application'}</p>
                          <p className="text-[10.5px] text-[#718096]">{app.displayDate || ''}</p>
                        </td>
                        <td className="py-3 px-4">
                          {app.cvDataUrl ? (
                            <a href={app.cvDataUrl} download={app.cvFileName || 'CV.pdf'} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#008000] border border-emerald-200 font-bold text-[11px]">
                              <Download className="w-3 h-3" /> {app.cvFileName || 'Download CV'}
                            </a>
                          ) : (
                            <span className="text-[#718096]">{app.cvFileName || 'Metadata only'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            disabled={!canWrite}
                            value={stage}
                            onChange={(e) => handleMoveStage(app, e.target.value)}
                            className="h-8 px-2 rounded-lg border border-slate-300 bg-white text-[11px] font-bold"
                          >
                            {RECRUITMENT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        {activeTab === 'shortlisted-candidates' && (
                          <td className="py-3 px-4 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#008000]" />
                              <input
                                type="date"
                                disabled={!canWrite}
                                defaultValue={app.interviewDate || ''}
                                onBlur={(e) => {
                                  adminRegistrationService.updateApplication(app.id, { interviewDate: e.target.value });
                                  onDataChange();
                                }}
                                className="h-7 px-2 rounded border border-slate-200 text-[11px]"
                              />
                            </div>
                            <input
                              type="text"
                              disabled={!canWrite}
                              defaultValue={app.interviewOutcome || ''}
                              placeholder="Record interview outcome..."
                              onBlur={(e) => {
                                adminRegistrationService.updateApplication(app.id, { interviewOutcome: e.target.value });
                                onDataChange();
                              }}
                              className="w-full h-7 px-2 rounded border border-slate-200 text-[11px]"
                            />
                          </td>
                        )}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectApplication(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#032e42] text-white text-[11px] font-bold cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#4ade80]" /> View Dossier
                          </button>
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
}
