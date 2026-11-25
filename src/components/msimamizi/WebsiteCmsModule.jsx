import React, { useState, useEffect } from 'react';
import {
  Globe,
  Eye,
  CheckCircle2,
  History,
  Save,
  ExternalLink,
} from 'lucide-react';
import {
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

const TAB_TO_SECTION = {
  'cms-homepage': { key: 'homepage', label: 'Homepage Hero & Banner Content', publicPath: '/' },
  'cms-programmes': { key: 'programmes', label: 'Training Programmes Content', publicPath: '/programmes' },
  'cms-course-info': { key: 'application_instructions', label: 'Course & Registration Instructions', publicPath: '/institute-overview' },
  'cms-faqs': { key: 'faqs', label: 'Frequently Asked Questions (FAQs)', publicPath: '/about' },
};

export default function WebsiteCmsModule({
  activeTab,
  cmsContent = {},
  courses = [],
  vacancies = [],
  announcements = [],
  currentUser,
  onDataChange,
  onNavigate,
  showToast,
}) {
  const canWrite = hasPermission(currentUser, 'cms.write');
  const sectionMeta = TAB_TO_SECTION[activeTab] || TAB_TO_SECTION['cms-homepage'];
  const currentSec = cmsContent[sectionMeta.key] || {
    title: '',
    subtitle: '',
    body: '',
    ctaLabel: '',
    ctaUrl: '',
    status: 'Draft',
    revisions: [],
  };

  const [form, setForm] = useState(currentSec);
  const [revisionNote, setRevisionNote] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setForm(currentSec);
    setRevisionNote('');
    setShowPreview(false);
  }, [activeTab, cmsContent]);

  // Website Announcements sub-view delegates to announcements overview + quick link
  if (activeTab === 'cms-announcements') {
    const published = announcements.filter((a) => a.status === 'Published');
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42]">Website Announcements ({published.length} Published / {announcements.length} Total)</h2>
            <p className="text-xs text-[#718096]">Control public notices synced to the ECASIAFRICA website.</p>
          </div>
          <button type="button" onClick={() => onNavigate('announcements')} className="px-4 py-2 rounded-xl bg-[#008000] text-white text-xs font-bold cursor-pointer">
            Manage &amp; Publish Announcements
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {announcements.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#718096]">No website announcements created yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-[#032e42]">{a.title}</p>
                  <p className="text-[#718096] line-clamp-1">{a.body}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${a.status === 'Published' ? 'bg-emerald-100 text-[#16A36A]' : 'bg-slate-200 text-slate-700'}`}>
                  {a.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Published Vacancies sub-view
  if (activeTab === 'cms-vacancies') {
    const openVacs = vacancies.filter((v) => v.status !== 'Closed');
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42]">Published Website Vacancies ({openVacs.length} Live)</h2>
            <p className="text-xs text-[#718096]">Active career openings displayed live at ecasiafrica.org/vacancies.</p>
          </div>
          <div className="flex gap-2">
            <a href="https://ecasiafrica.org/vacancies" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#032e42]">
              <ExternalLink className="w-3.5 h-3.5" /> View Live Page
            </a>
            <button type="button" onClick={() => onNavigate('vacancies')} className="px-4 py-2 rounded-xl bg-[#008000] text-white text-xs font-bold cursor-pointer">
              Manage Vacancies &amp; Posters
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {openVacs.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#718096]">No open vacancies currently published on the public website.</p>
          ) : (
            openVacs.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-[#032e42]">{v.title}</p>
                  <p className="text-[#718096]">{v.department} • {v.location} • Deadline: {v.deadline || 'Open Until Filled'}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#16A36A] text-[10px] font-bold">
                  Live on Website
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const handleSave = (targetStatus) => {
    if (!canWrite) return;
    msimamiziEnterpriseService.saveCmsSection(
      sectionMeta.key,
      { ...form, status: targetStatus },
      revisionNote || `Set status to ${targetStatus}`,
      currentUser
    );
    setRevisionNote('');
    onDataChange();
    showToast(`${sectionMeta.label} saved as ${targetStatus}.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="bg-[#032e42] text-white p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ade80]">Controlled Website CMS</span>
            <h2 className="text-base font-black flex items-center gap-2 mt-0.5">
              <Globe className="w-4 h-4 text-[#4ade80]" /> {sectionMeta.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              form.status === 'Published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
            }`}>
              {form.status || 'Draft'}
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Edit Mode' : 'Preview'}
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="p-6 space-y-4 bg-[#F5F8FC]">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#008000] text-[10px] font-bold uppercase">Live Preview</span>
              <h3 className="text-xl font-black text-[#032e42]">{form.title || 'Untitled Section'}</h3>
              <p className="text-sm text-[#718096]">{form.subtitle}</p>
              <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pt-2 border-t border-slate-100">
                {form.body}
              </div>
              {form.ctaLabel && (
                <div className="pt-2">
                  <span className="inline-block px-4 py-2 rounded-xl bg-[#008000] text-white font-bold">{form.ctaLabel}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Section Heading / Title</label>
              <input disabled={!canWrite} value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Subtitle / Summary</label>
              <input disabled={!canWrite} value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Body Copy / Structured Content</label>
              <textarea disabled={!canWrite} rows={7} value={form.body || ''} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full p-3 rounded-xl border border-slate-300 font-sans" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#032e42] mb-1">CTA Button Label</label>
                <input disabled={!canWrite} value={form.ctaLabel || ''} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">CTA Target Route</label>
                <input disabled={!canWrite} value={form.ctaUrl || ''} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Revision Note (Recorded in History &amp; Audit Log)</label>
              <input disabled={!canWrite} value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} placeholder="e.g. Updated 2026 Q3 training banner copy" className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            </div>

            {canWrite && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {activeTab === 'cms-course-info' && (
                  <button type="button" onClick={() => onNavigate('courses')} className="text-xs font-bold text-[#008000] hover:underline cursor-pointer">
                    Manage all {courses.length} Courses &amp; Brochures →
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleSave('Draft')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#032e42] font-bold cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave('Published')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A36A] hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Publish Content
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revision History Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs h-fit">
        <h3 className="text-sm font-black text-[#032e42] flex items-center gap-1.5">
          <History className="w-4 h-4 text-[#008000]" /> Content Revision History
        </h3>
        {(!form.revisions || form.revisions.length === 0) ? (
          <p className="text-[#718096]">No revisions saved yet for this section.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {form.revisions.map((rev, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#F5F8FC] border-l-2 border-[#008000]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#032e42]">{rev.status}</span>
                  <span className="text-[10px] text-[#718096]">{new Date(rev.at).toLocaleString()}</span>
                </div>
                <p className="text-slate-600 mt-0.5">{rev.note}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{rev.by}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
