import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  MapPin,
  CalendarRange,
  BadgeDollarSign,
  Plus,
  Download,
  Upload,
  Trash2,
  Edit,
  X,
  Check,
  Search,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import {
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

const DEFAULT_DESTINATIONS = [
  'Nairobi, Kenya',
  'Mombasa, Kenya',
  'Naivasha, Kenya',
  'Kigali, Rwanda',
  'Arusha, Tanzania',
  'Dubai, UAE',
  'Kuala Lumpur, Malaysia',
  'Online / Virtual Cohort',
];

export default function AcademicModule({
  activeTab,
  courses = [],
  registrations = [],
  cohorts = [],
  settings,
  currentUser,
  onDataChange,
  onEditCourse,
  onNavigate,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [cohortForm, setCohortForm] = useState({
    name: '',
    courseSlug: '',
    courseTitle: '',
    intakeYear: String(new Date().getFullYear()),
    destination: 'Nairobi, Kenya',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    availableSlots: 25,
    enrolmentStatus: 'Open',
    scheduleNotes: '',
  });
  const [feeEdits, setFeeEdits] = useState({});

  const canWrite = hasPermission(currentUser, 'courses.write');
  const usdToKes = Number(settings?.usdToKesRate) || 130;

  // Categories breakdown from actual 204+ courses
  const categories = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      const cat = c.category || 'Executive Training';
      if (!map[cat]) map[cat] = { name: cat, count: 0, totalFeeUsd: 0, enrolments: 0 };
      map[cat].count += 1;
      const usd = Number(c.feeUsd) || Number(String(c.fee || '').replace(/[^0-9.]/g, '')) || 1200;
      map[cat].totalFeeUsd += usd;
    });
    registrations.forEach((r) => {
      const matched = courses.find((c) => c.slug === r.courseSlug || c.title === r.eventTitle);
      const cat = matched?.category || 'Executive Training';
      if (map[cat]) map[cat].enrolments += Number(r.participantsCount) || 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [courses, registrations]);

  // Training Destinations breakdown
  const destinations = useMemo(() => {
    const map = {};
    DEFAULT_DESTINATIONS.forEach((d) => {
      map[d] = { name: d, cohorts: 0, enrolments: 0, revenue: 0 };
    });
    cohorts.forEach((c) => {
      const d = c.destination || 'Nairobi, Kenya';
      if (!map[d]) map[d] = { name: d, cohorts: 0, enrolments: 0, revenue: 0 };
      map[d].cohorts += 1;
    });
    registrations.forEach((r) => {
      const d = r.venue || 'Nairobi, Kenya';
      const key = Object.keys(map).find((k) => k.toLowerCase().includes(d.split(',')[0].trim().toLowerCase())) || d;
      if (!map[key]) map[key] = { name: key, cohorts: 0, enrolments: 0, revenue: 0 };
      map[key].enrolments += Number(r.participantsCount) || 1;
      map[key].revenue += Number(r.totalFee) || 0;
    });
    return Object.values(map);
  }, [cohorts, registrations]);

  const handleSaveCohort = (e) => {
    e.preventDefault();
    if (!canWrite || !cohortForm.name.trim()) return;
    const matchedCourse = courses.find((c) => c.slug === cohortForm.courseSlug);
    msimamiziEnterpriseService.saveCohort(
      {
        ...cohortForm,
        id: editingCohort?.id,
        courseTitle: matchedCourse?.title || cohortForm.courseTitle || 'Executive Programme',
      },
      currentUser
    );
    setIsCohortModalOpen(false);
    setEditingCohort(null);
    onDataChange();
    showToast(`Cohort "${cohortForm.name}" saved.`);
  };

  const handleSaveCourseFee = (course) => {
    if (!canWrite) return;
    const edit = feeEdits[course.slug];
    if (!edit) return;
    const prevUsd = Number(course.feeUsd) || 1200;
    const nextUsd = Math.max(0, Number(edit.feeUsd ?? prevUsd));
    const nextDiscount = Math.max(0, Math.min(100, Number(edit.discountPercent ?? course.discountPercent ?? 0)));
    const nextKes = Math.round(nextUsd * usdToKes);
    const nextDiscountPrice = Math.round(nextUsd * (1 - nextDiscount / 100));

    dataService.updateCoursePricing(course.slug, {
      feeUsd: nextUsd,
      feeKes: nextKes,
      fee: `$${nextUsd.toLocaleString()}`,
      discountPercent: nextDiscount,
      discountPrice: nextDiscountPrice,
    });
    msimamiziEnterpriseService.logAudit(
      currentUser,
      'COURSE_FEE_CHANGE',
      'Course',
      course.title,
      `USD ${prevUsd} (Discount ${course.discountPercent || 0}%)`,
      `USD ${nextUsd} / KES ${nextKes} (Discount ${nextDiscount}%) — Existing invoices unaffected`
    );
    setFeeEdits((prev) => {
      const cp = { ...prev };
      delete cp[course.slug];
      return cp;
    });
    onDataChange();
    showToast(`Updated fee for "${course.title}" (audited; previously issued invoices unchanged).`);
  };

  const handleBulkImportCSV = (file) => {
    if (!canWrite || !file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target.result || '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        alert('CSV must contain a header row and at least one course row (Title, Category, Duration, FeeUSD).');
        return;
      }
      let imported = 0;
      lines.slice(1).forEach((line) => {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        const [title, category, duration, feeStr] = cols;
        if (!title) return;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const feeUsd = Number(feeStr) || 1200;
        dataService.saveCourse({
          slug,
          title,
          category: category || 'Executive Training',
          duration: duration || '5 Days',
          feeUsd,
          feeKes: Math.round(feeUsd * usdToKes),
          fee: `$${feeUsd.toLocaleString()}`,
        });
        imported += 1;
      });
      msimamiziEnterpriseService.logAudit(currentUser, 'BULK_COURSE_IMPORT', 'Course', file.name, '', `${imported} courses imported`);
      onDataChange();
      showToast(`Imported ${imported} course(s) from ${file.name}.`);
    };
    reader.readAsText(file);
  };

  // 1. COURSE CATEGORIES
  if (activeTab === 'course-categories') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#00B8B0]" /> Course Categories &amp; Faculties ({categories.length})
            </h2>
            <p className="text-xs text-[#718096]">Live distribution across all {courses.length} active institutional programmes.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="px-3.5 py-2 rounded-xl bg-[#071C2D] text-white text-xs font-bold cursor-pointer"
          >
            Open Full Course Catalog
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#00B8B0] transition space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-extrabold text-[#10243E]">{cat.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#00B8B0] border border-teal-200 text-xs font-black shrink-0">
                  {cat.count}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Avg Fee</span>
                  <span className="font-bold text-[#10243E]">USD {Math.round(cat.totalFeeUsd / Math.max(1, cat.count)).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Enrolments</span>
                  <span className="font-bold text-[#16A36A]">{cat.enrolments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. TRAINING DESTINATIONS
  if (activeTab === 'training-destinations') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00B8B0]" /> Training Destinations &amp; Delivery Hubs
          </h2>
          <p className="text-xs text-[#718096] mt-0.5">Active African, Middle East, Asia &amp; Virtual delivery hubs with live enrolment metrics.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((dest) => (
            <div key={dest.name} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00B8B0] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#10243E]">{dest.name}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div>
                  <p className="text-[10px] text-[#718096] uppercase font-bold">Cohorts</p>
                  <p className="text-sm font-black text-[#10243E]">{dest.cohorts}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#718096] uppercase font-bold">Delegates</p>
                  <p className="text-sm font-black text-[#00B8B0]">{dest.enrolments}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#718096] uppercase font-bold">Revenue</p>
                  <p className="text-sm font-black text-[#16A36A]">${dest.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. COHORTS & INTAKES
  if (activeTab === 'cohorts-intakes') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-[#00B8B0]" /> Cohorts &amp; Intakes ({cohorts.length})
            </h2>
            <p className="text-xs text-[#718096]">Schedule upcoming intakes, capacities, deadlines, and live enrolment progress.</p>
          </div>
          {canWrite && (
            <button
              type="button"
              onClick={() => {
                setEditingCohort(null);
                setCohortForm({
                  name: '',
                  courseSlug: courses[0]?.slug || '',
                  courseTitle: courses[0]?.title || '',
                  intakeYear: String(new Date().getFullYear()),
                  destination: 'Nairobi, Kenya',
                  startDate: '',
                  endDate: '',
                  applicationDeadline: '',
                  availableSlots: 25,
                  enrolmentStatus: 'Open',
                  scheduleNotes: '',
                });
                setIsCohortModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B8B0] text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Cohort
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#071C2D] text-white text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Cohort / Year</th>
                  <th className="py-3 px-4">Course Programme</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Dates &amp; Deadline</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cohorts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#718096]">
                      No cohorts scheduled yet. Click &ldquo;Create Cohort&rdquo; to schedule an intake.
                    </td>
                  </tr>
                ) : (
                  cohorts.map((coh) => {
                    const enrolled = registrations.filter(
                      (r) => r.cohortName === coh.name || (coh.courseSlug && r.courseSlug === coh.courseSlug)
                    ).length;
                    return (
                      <tr key={coh.id} className="hover:bg-[#F5F8FC]">
                        <td className="py-3 px-4 font-bold text-[#10243E]">
                          {coh.name}
                          <span className="block text-[10px] text-[#718096] font-normal">Intake {coh.intakeYear}</span>
                        </td>
                        <td className="py-3 px-4 max-w-[240px] truncate font-medium">{coh.courseTitle}</td>
                        <td className="py-3 px-4">{coh.destination}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                          {coh.startDate || 'TBD'} → {coh.endDate || 'TBD'}
                          <span className="block text-[#F0A020] font-semibold">Deadline: {coh.applicationDeadline || 'Open'}</span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          {enrolled} / {coh.availableSlots} slots
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            coh.enrolmentStatus === 'Open' ? 'bg-emerald-100 text-[#16A36A]' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {coh.enrolmentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {canWrite && (
                            <div className="inline-flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCohort(coh);
                                  setCohortForm(coh);
                                  setIsCohortModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete cohort "${coh.name}"?`)) {
                                    msimamiziEnterpriseService.deleteCohort(coh.id, currentUser);
                                    onDataChange();
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC4545] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cohort Modal */}
        {isCohortModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSaveCohort} className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-xs">
              <div className="bg-[#071C2D] text-white px-5 py-4 flex items-center justify-between">
                <h3 className="font-bold text-sm">{editingCohort ? 'Edit Cohort' : 'Schedule New Cohort / Intake'}</h3>
                <button type="button" onClick={() => setIsCohortModalOpen(false)} className="cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#10243E] mb-1">Cohort Name *</label>
                  <input required value={cohortForm.name} onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })} placeholder="e.g. Q3 2026 Climate Finance Nairobi Cohort" className="w-full h-9 px-3 rounded-xl border border-slate-300" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#10243E] mb-1">Course Programme</label>
                  <select value={cohortForm.courseSlug} onChange={(e) => setCohortForm({ ...cohortForm, courseSlug: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                    {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">Destination</label>
                  <select value={cohortForm.destination} onChange={(e) => setCohortForm({ ...cohortForm, destination: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                    {DEFAULT_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">Available Slots</label>
                  <input type="number" min={1} value={cohortForm.availableSlots} onChange={(e) => setCohortForm({ ...cohortForm, availableSlots: Number(e.target.value) })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
                </div>
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">Start Date</label>
                  <input type="date" value={cohortForm.startDate} onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
                </div>
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">End Date</label>
                  <input type="date" value={cohortForm.endDate} onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
                </div>
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">Application Deadline</label>
                  <input type="date" value={cohortForm.applicationDeadline} onChange={(e) => setCohortForm({ ...cohortForm, applicationDeadline: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
                </div>
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">Status</label>
                  <select value={cohortForm.enrolmentStatus} onChange={(e) => setCohortForm({ ...cohortForm, enrolmentStatus: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                    <option value="Open">Open</option>
                    <option value="Filling Fast">Filling Fast</option>
                    <option value="Full">Full</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="px-5 py-3.5 bg-[#F5F8FC] border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCohortModalOpen(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#00B8B0] text-white font-bold cursor-pointer">Save Cohort</button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // 4. FEES & PRICING (Multi-currency + Audited Fee Changes + Bulk Import/Export)
  const filteredCourses = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.title || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#10243E] flex items-center gap-2">
              <BadgeDollarSign className="w-5 h-5 text-[#00B8B0]" /> Fees &amp; Multi-Currency Pricing ({courses.length} Courses)
            </h2>
            <p className="text-xs text-[#718096]">
              Configured FX rate: 1 USD = {usdToKes} KES. Fee edits are logged in Audit Logs and never silently alter previously issued invoices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canWrite && (
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00B8B0] text-white text-xs font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Bulk Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleBulkImportCSV(e.target.files[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            <button
              type="button"
              onClick={() => {
                const headers = ['Slug', 'Title', 'Category', 'Duration', 'Fee USD', 'Fee KES', 'Discount %'];
                const rows = filteredCourses.map((c) => {
                  const usd = Number(c.feeUsd) || Number(String(c.fee || '').replace(/[^0-9.]/g, '')) || 1200;
                  return [c.slug, c.title, c.category || '', c.duration || '5 Days', usd, Math.round(usd * usdToKes), c.discountPercent || 0];
                });
                msimamiziEnterpriseService.exportCSV(headers, rows, `ECAS_Course_Fees_${new Date().toISOString().slice(0, 10)}.csv`, currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#10243E] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Fee Sheet
            </button>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course name or category..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#071C2D] text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fee (USD)</th>
                <th className="py-3 px-4">Fee (KES)</th>
                <th className="py-3 px-4">Discount %</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.slice(0, 80).map((course) => {
                const baseUsd = Number(course.feeUsd) || Number(String(course.fee || '').replace(/[^0-9.]/g, '')) || 1200;
                const edit = feeEdits[course.slug];
                const curUsd = edit?.feeUsd !== undefined ? edit.feeUsd : baseUsd;
                const curDisc = edit?.discountPercent !== undefined ? edit.discountPercent : (course.discountPercent || 0);
                return (
                  <tr key={course.slug} className="hover:bg-[#F5F8FC]">
                    <td className="py-2.5 px-4 font-bold text-[#10243E] max-w-[280px] truncate">{course.title}</td>
                    <td className="py-2.5 px-4 text-[#718096] max-w-[180px] truncate">{course.category || 'Executive'}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        disabled={!canWrite}
                        value={curUsd}
                        onChange={(e) => setFeeEdits((p) => ({ ...p, [course.slug]: { ...p[course.slug], feeUsd: e.target.value } }))}
                        className="w-24 h-8 px-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      KES {Math.round((Number(curUsd) || 0) * usdToKes).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        disabled={!canWrite}
                        value={curDisc}
                        onChange={(e) => setFeeEdits((p) => ({ ...p, [course.slug]: { ...p[course.slug], discountPercent: e.target.value } }))}
                        className="w-16 h-8 px-2 rounded-lg border border-slate-300"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {edit && canWrite ? (
                        <button
                          type="button"
                          onClick={() => handleSaveCourseFee(course)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16A36A] text-white text-[11px] font-bold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Save Fee
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEditCourse(course)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                        >
                          Full Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
