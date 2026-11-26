import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderTree,
  MapPin,
  CalendarRange,
  BadgeDollarSign,
  Plus,
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  Edit,
  Check,
  Search,
  BookOpen,
  ExternalLink,
  Users,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import {
  hasPermission,
  isConfirmedPaidEnrolment,
  getRealizedRegistrationRevenue,
  normalizeDestinationHub,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

const DESTINATION_HUBS = [
  {
    name: 'Nairobi, Kenya',
    region: 'East Africa',
    type: 'Headquarters Hub',
    typicalFeeUsd: 1000,
    nextWindows: ['11 – 15 May 2026', '23 Nov – 04 Dec 2026'],
    description: 'ECAS Institute flagship executive training hub serving ministries, UN agencies, and regional institutions.',
  },
  {
    name: 'Mombasa, Kenya',
    region: 'East Africa',
    type: 'Coastal Executive Hub',
    typicalFeeUsd: 1200,
    nextWindows: ['08 – 12 Jun 2026', '19 – 23 Oct 2026'],
    description: 'Dedicated coastal conference venues ideal for residential workshops, blue economy, and strategic retreats.',
  },
  {
    name: 'Diani, Kenya',
    region: 'East Africa',
    type: 'Executive Retreat Hub',
    typicalFeeUsd: 1250,
    nextWindows: ['08 – 12 Jun 2026', '17 – 21 Aug 2026'],
    description: 'High-focus south coast retreat environment tailored for board governance and senior leadership cohorts.',
  },
  {
    name: 'Naivasha, Kenya',
    region: 'East Africa',
    type: 'Policy Retreat Hub',
    typicalFeeUsd: 1150,
    nextWindows: ['15 – 19 Jun 2026', '12 – 16 Oct 2026'],
    description: 'Rift Valley executive venue popular with public financial management and climate policy delegations.',
  },
  {
    name: 'Zanzibar, Tanzania',
    region: 'East Africa',
    type: 'Regional Island Hub',
    typicalFeeUsd: 1650,
    nextWindows: ['13 – 17 Jul 2026', '09 – 13 Nov 2026'],
    description: 'International hospitality & executive learning hub hosting cross-border African and donor-funded cohorts.',
  },
  {
    name: 'Kigali, Rwanda',
    region: 'East & Central Africa',
    type: 'Innovation & Governance Hub',
    typicalFeeUsd: 1650,
    nextWindows: ['13 – 17 Jul 2026', '05 – 09 Oct 2026'],
    description: 'Premier Francophone & Anglophone hub for green growth, digital transformation, and public sector reforms.',
  },
  {
    name: 'Arusha, Tanzania',
    region: 'East Africa',
    type: 'EAC Diplomatic Hub',
    typicalFeeUsd: 1450,
    nextWindows: ['20 – 24 Jul 2026', '02 – 06 Nov 2026'],
    description: 'East African Community diplomatic center hosting regional environmental, legal, and trade policy training.',
  },
  {
    name: 'Dubai, UAE',
    region: 'Middle East & Global',
    type: 'International Executive Hub',
    typicalFeeUsd: 2450,
    nextWindows: ['14 – 18 Sep 2026', '16 – 20 Nov 2026'],
    description: 'Global executive benchmarking hub for climate finance, carbon markets, AI, and international leadership.',
  },
  {
    name: 'Kuala Lumpur, Malaysia',
    region: 'Asia-Pacific',
    type: 'Global Study Tour Hub',
    typicalFeeUsd: 2450,
    nextWindows: ['07 – 11 Dec 2026'],
    description: 'International study-tour hub focused on sustainable industrialization, green finance, and smart infrastructure.',
  },
  {
    name: 'Online / Virtual Cohort',
    region: 'Global Remote',
    type: 'Live Instructor-Led (Zoom/Teams)',
    typicalFeeUsd: 750,
    nextWindows: ['18 – 22 May 2026', '22 – 26 Jun 2026', '24 – 28 Aug 2026', '12 – 16 Oct 2026', '07 – 11 Dec 2026'],
    description: 'Interactive live virtual classrooms with real-time case studies, breakout labs, and digital executive certification.',
  },
];

const STANDARD_2026_INTAKES = [
  { id: 'std-1', name: 'May 2026 Nairobi Executive Intake', destination: 'Nairobi, Kenya', startDate: '2026-05-11', endDate: '2026-05-15', deadline: '2026-05-04', format: 'Classroom', feeUsd: 1000 },
  { id: 'std-2', name: 'May 2026 Global Virtual Cohort', destination: 'Online / Virtual Cohort', startDate: '2026-05-18', endDate: '2026-05-22', deadline: '2026-05-14', format: 'Online', feeUsd: 750 },
  { id: 'std-3', name: 'June 2026 Mombasa Coastal Intake', destination: 'Mombasa, Kenya', startDate: '2026-06-08', endDate: '2026-06-12', deadline: '2026-06-01', format: 'Classroom', feeUsd: 1200 },
  { id: 'std-4', name: 'July 2026 Kigali & Zanzibar Regional Intake', destination: 'Kigali, Rwanda', startDate: '2026-07-13', endDate: '2026-07-17', deadline: '2026-07-06', format: 'Classroom', feeUsd: 1650 },
  { id: 'std-5', name: 'August 2026 Diani Executive Retreat', destination: 'Diani, Kenya', startDate: '2026-08-17', endDate: '2026-08-21', deadline: '2026-08-10', format: 'Classroom', feeUsd: 1250 },
  { id: 'std-6', name: 'September 2026 Dubai Global Benchmarking Cohort', destination: 'Dubai, UAE', startDate: '2026-09-14', endDate: '2026-09-18', deadline: '2026-09-01', format: 'Classroom', feeUsd: 2450 },
  { id: 'std-7', name: 'October 2026 Mombasa & Virtual Dual Intake', destination: 'Mombasa, Kenya', startDate: '2026-10-19', endDate: '2026-10-23', deadline: '2026-10-12', format: 'Classroom', feeUsd: 1200 },
  { id: 'std-8', name: 'December 2026 Kuala Lumpur International Study Cohort', destination: 'Kuala Lumpur, Malaysia', startDate: '2026-12-07', endDate: '2026-12-11', deadline: '2026-11-23', format: 'Classroom', feeUsd: 2450 },
];

const DEFAULT_DESTINATIONS = DESTINATION_HUBS.map((h) => h.name);

const parseCourseUsd = (course) => {
  if (!course) return 1200;
  const direct = Number(course.feeUsd);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const parsed = Number(String(course.fee || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1200;
};

export default function AcademicModule({
  activeTab,
  courses = [],
  registrations = [],
  cohorts = [],
  invoices = [],
  payments = [],
  settings,
  currentUser,
  onDataChange,
  onEditCourse,
  onOpenUploadCourse,
  publicSiteUrl = 'https://ecasiafrica.org',
  onNavigate,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(DESTINATION_HUBS[0].name);
  const [cohortSearch, setCohortSearch] = useState('');
  const [cohortStatusFilter, setCohortStatusFilter] = useState('All');
  const [feeCategoryFilter, setFeeCategoryFilter] = useState('All');
  const [feePage, setFeePage] = useState(1);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  if (prevActiveTab !== activeTab) {
    setPrevActiveTab(activeTab);
    if (isCohortModalOpen) {
      setIsCohortModalOpen(false);
      setEditingCohort(null);
    }
  }
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
  const publicBase = publicSiteUrl === '/' ? '' : publicSiteUrl;

  const safeEditCourse = (course) => {
    if (typeof onEditCourse === 'function') {
      onEditCourse(course);
    } else if (typeof onNavigate === 'function') {
      onNavigate('courses');
    }
  };

  // Categories breakdown from actual 204+ courses
  const categories = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      const cat = c.category || 'Executive Training';
      if (!map[cat]) {
        map[cat] = { name: cat, count: 0, totalFeeUsd: 0, enrolments: 0, courses: [] };
      }
      map[cat].count += 1;
      map[cat].totalFeeUsd += parseCourseUsd(c);
      map[cat].courses.push(c);
    });
    registrations.forEach((r) => {
      if (!isConfirmedPaidEnrolment(r, invoices, payments)) return;
      const matched = courses.find((c) => c.slug === r.courseSlug || c.title === r.eventTitle);
      const cat = matched?.category || 'Executive Training';
      if (map[cat]) map[cat].enrolments += Number(r.participantsCount) || 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [courses, registrations, invoices, payments]);

  useEffect(() => {
    if (categories.length > 0 && (!selectedCategory || !categories.some((c) => c.name === selectedCategory))) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Training Destinations breakdown (strictly Confirmed + Invoiced + Paid for delegates & revenue)
  const destinations = useMemo(() => {
    const map = {};
    DESTINATION_HUBS.forEach((hub) => {
      map[hub.name] = {
        ...hub,
        cohorts: 0,
        cohortRecords: [],
        enrolments: 0,
        pendingPipeline: 0,
        registrationRecords: [],
        revenue: 0,
      };
    });
    cohorts.forEach((c) => {
      const d = normalizeDestinationHub(c.destination);
      if (!map[d]) {
        map[d] = {
          name: d,
          region: 'Custom Hub',
          type: 'Scheduled Delivery Location',
          typicalFeeUsd: 1200,
          nextWindows: [],
          description: 'Custom institutional delivery destination configured by ECAS academics.',
          cohorts: 0,
          cohortRecords: [],
          enrolments: 0,
          pendingPipeline: 0,
          registrationRecords: [],
          revenue: 0,
        };
      }
      map[d].cohorts += 1;
      map[d].cohortRecords.push(c);
    });
    registrations.forEach((r) => {
      const key = normalizeDestinationHub(r.venue);
      if (!map[key]) {
        map[key] = {
          name: key,
          region: 'Regional Hub',
          type: 'Active Delivery Hub',
          typicalFeeUsd: 1200,
          nextWindows: [],
          description: 'Active training destination with delegate registrations.',
          cohorts: 0,
          cohortRecords: [],
          enrolments: 0,
          pendingPipeline: 0,
          registrationRecords: [],
          revenue: 0,
        };
      }
      if (isConfirmedPaidEnrolment(r, invoices, payments)) {
        map[key].enrolments += Number(r.participantsCount) || 1;
        map[key].revenue += getRealizedRegistrationRevenue(r, invoices, payments);
        map[key].registrationRecords.push(r);
      } else {
        const st = (r.status || r.workflowStage || '').toLowerCase();
        if (!st.includes('rejected') && !st.includes('withdrawn') && !st.includes('cancelled')) {
          map[key].pendingPipeline += Number(r.participantsCount) || 1;
        }
      }
    });
    return Object.values(map);
  }, [cohorts, registrations, invoices, payments]);

  const openNewCohortModal = (prefill = {}) => {
    setEditingCohort(null);
    setCohortForm({
      name: prefill.name || '',
      courseSlug: prefill.courseSlug || courses[0]?.slug || '',
      courseTitle: prefill.courseTitle || courses[0]?.title || '',
      intakeYear: prefill.intakeYear || String(new Date().getFullYear()),
      destination: prefill.destination || 'Nairobi, Kenya',
      startDate: prefill.startDate || '',
      endDate: prefill.endDate || '',
      applicationDeadline: prefill.applicationDeadline || '',
      availableSlots: prefill.availableSlots || 25,
      enrolmentStatus: prefill.enrolmentStatus || 'Open',
      scheduleNotes: prefill.scheduleNotes || '',
    });
    setIsCohortModalOpen(true);
  };

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
    const prevUsd = parseCourseUsd(course);
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

  // Dedicated Full-Page Create / Edit Cohort Screen (replaces modal popup)
  if (isCohortModalOpen) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCohortModalOpen(false);
                setEditingCohort(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#032e42] text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div>
              <h2 className="text-base font-black text-[#032e42] flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-[#008000]" />
                {editingCohort ? 'Edit Tracked Cohort' : 'Schedule New Cohort / Intake'}
              </h2>
              <p className="text-[11px] text-[#718096]">
                Configure intake dates, delivery destination hub, seat capacity, and enrolment status.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveCohort} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-3xl overflow-hidden text-xs">
          <div className="bg-[#032e42] text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingCohort ? `Editing: ${editingCohort.name}` : 'New Institutional Training Cohort'}</h3>
            <span className="text-[11px] text-[#4ade80] font-semibold">Cohorts &amp; Intakes</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#032e42] mb-1">Cohort Name *</label>
              <input
                required
                value={cohortForm.name}
                onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                placeholder="e.g. Q3 2026 Climate Finance Nairobi Cohort"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#032e42] mb-1">Course Programme</label>
              <select
                value={cohortForm.courseSlug}
                onChange={(e) => setCohortForm({ ...cohortForm, courseSlug: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
              >
                {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Destination Hub</label>
              <select
                value={cohortForm.destination}
                onChange={(e) => setCohortForm({ ...cohortForm, destination: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
              >
                {DEFAULT_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Available Slots</label>
              <input
                type="number"
                min={1}
                value={cohortForm.availableSlots}
                onChange={(e) => setCohortForm({ ...cohortForm, availableSlots: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Start Date</label>
              <input
                type="date"
                value={cohortForm.startDate}
                onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">End Date</label>
              <input
                type="date"
                value={cohortForm.endDate}
                onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Application Deadline</label>
              <input
                type="date"
                value={cohortForm.applicationDeadline}
                onChange={(e) => setCohortForm({ ...cohortForm, applicationDeadline: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Enrolment Status</label>
              <select
                value={cohortForm.enrolmentStatus}
                onChange={(e) => setCohortForm({ ...cohortForm, enrolmentStatus: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
              >
                <option value="Open">Open</option>
                <option value="Filling Fast">Filling Fast</option>
                <option value="Full">Full</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#032e42] mb-1">Schedule Notes &amp; Faculty Details</label>
              <textarea
                rows={3}
                value={cohortForm.scheduleNotes || ''}
                onChange={(e) => setCohortForm({ ...cohortForm, scheduleNotes: e.target.value })}
                placeholder="Venue hotel, lead facilitators, field visit schedule, or corporate cohort instructions..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-[#F5F8FC] border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCohortModalOpen(false);
                setEditingCohort(null);
              }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Cohort
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. COURSE CATEGORIES (Interactive Faculty Breakdown + Drill-Down Catalog)
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === 'course-categories') {
    const activeCatObj = categories.find((c) => c.name === selectedCategory) || categories[0];
    const totalAvgFee = Math.round(
      courses.reduce((acc, c) => acc + parseCourseUsd(c), 0) / Math.max(1, courses.length)
    );
    const totalEnrolments = categories.reduce((acc, c) => acc + c.enrolments, 0);
    const visibleCatCourses = (activeCatObj?.courses || []).filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (c.title || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q);
    });

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#008000]" /> Course Categories &amp; Academic Faculties ({categories.length})
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Select any faculty card below to inspect, edit fees, or preview all {courses.length} accredited institutional programmes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canWrite && typeof onOpenUploadCourse === 'function' && (
              <button
                type="button"
                onClick={onOpenUploadCourse}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" /> Upload New Course
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('courses')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#032e42] hover:bg-[#06405c] text-white text-xs font-bold cursor-pointer transition"
            >
              <BookOpen className="w-3.5 h-3.5" /> Open Full Course Catalog
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Academic Faculties</p>
            <p className="text-2xl font-black text-[#032e42] mt-1">{categories.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Accredited Courses</p>
            <p className="text-2xl font-black text-[#008000] mt-1">{courses.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Avg Tuition Fee</p>
            <p className="text-2xl font-black text-[#032e42] mt-1">USD {totalAvgFee.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Active Enrolments</p>
            <p className="text-2xl font-black text-[#16A36A] mt-1">{totalEnrolments}</p>
          </div>
        </div>

        {/* Clickable Faculty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const isSelected = activeCatObj?.name === cat.name;
            const sharePct = Math.round((cat.count / Math.max(1, courses.length)) * 100);
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSearch('');
                }}
                className={`text-left rounded-2xl border p-5 shadow-sm transition space-y-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#032e42] text-white border-[#008000] ring-2 ring-[#008000]/30'
                    : 'bg-white text-[#032e42] border-slate-200 hover:border-[#008000]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-extrabold leading-snug ${isSelected ? 'text-white' : 'text-[#032e42]'}`}>
                    {cat.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black shrink-0 ${
                      isSelected
                        ? 'bg-[#008000] text-white border border-[#4ade80]/50'
                        : 'bg-emerald-50 text-[#008000] border border-emerald-200'
                    }`}
                  >
                    {cat.count}
                  </span>
                </div>

                {/* Progress Bar of Catalog Share */}
                <div className="w-full h-1.5 rounded-full bg-slate-200/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#008000]"
                    style={{ width: `${Math.max(4, sharePct)}%` }}
                  />
                </div>

                <div className={`grid grid-cols-3 gap-2 pt-2 border-t text-xs ${isSelected ? 'border-white/10' : 'border-slate-100'}`}>
                  <div>
                    <span className={`block text-[10px] uppercase font-bold ${isSelected ? 'text-slate-300' : 'text-[#718096]'}`}>Avg Fee</span>
                    <span className="font-bold">USD {Math.round(cat.totalFeeUsd / Math.max(1, cat.count)).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] uppercase font-bold ${isSelected ? 'text-slate-300' : 'text-[#718096]'}`}>Catalog</span>
                    <span className="font-bold">{sharePct}%</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] uppercase font-bold ${isSelected ? 'text-slate-300' : 'text-[#718096]'}`}>Enrolments</span>
                    <span className={`font-bold ${isSelected ? 'text-emerald-300' : 'text-[#16A36A]'}`}>{cat.enrolments}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Drill-Down Course Table for Selected Category */}
        {activeCatObj && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-[#032e42] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#008000]" />
                  Programmes in {activeCatObj.name} ({visibleCatCourses.length})
                </h3>
                <p className="text-[11px] text-[#718096] mt-0.5">
                  Click Edit Course to manage images, tuition fees, discounts, and 2026 cohorts.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter courses in faculty..."
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#032e42] text-white text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Fee (USD)</th>
                    <th className="py-3 px-4">Fee (KES)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleCatCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#718096]">
                        No courses match &ldquo;{search}&rdquo; in this category.
                      </td>
                    </tr>
                  ) : (
                    visibleCatCourses.map((c) => {
                      const feeUsd = parseCourseUsd(c);
                      return (
                        <tr key={c.slug} className="hover:bg-[#F5F8FC]">
                          <td className="py-3 px-4 font-bold text-[#032e42] max-w-[360px]">
                            <span className="block truncate">{c.title}</span>
                            <span className="text-[10px] text-[#718096] font-mono">{c.slug}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#008000]" /> {c.duration || '5 Days'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#032e42] whitespace-nowrap">
                            USD {feeUsd.toLocaleString()}
                            {Number(c.discountPercent) > 0 && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 text-[#16A36A] text-[10px] font-bold">
                                -{c.discountPercent}%
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                            KES {Math.round(feeUsd * usdToKes).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => safeEditCourse(c)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-[11px] font-bold cursor-pointer transition"
                              >
                                <Edit className="w-3 h-3" /> Edit
                              </button>
                              <a
                                href={`${publicBase}/executive-training/${c.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#008000] transition"
                                title="Preview on public website"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
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
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. TRAINING DESTINATIONS (Interactive Hub Directory + Hub Drill-Down)
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === 'training-destinations') {
    const activeHub = destinations.find((d) => d.name === selectedDestination) || destinations[0];
    const totalHubDelegates = destinations.reduce((a, b) => a + b.enrolments, 0);
    const totalHubRevenue = destinations.reduce((a, b) => a + b.revenue, 0);

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#008000]" /> Training Destinations &amp; Delivery Hubs ({destinations.length})
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Active East Africa, Middle East, Asia-Pacific &amp; Virtual delivery hubs with live enrolment metrics and 2026 schedules.
            </p>
          </div>
          {canWrite && (
            <button
              type="button"
              onClick={() => openNewCohortModal({ destination: activeHub?.name || 'Nairobi, Kenya' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Schedule Cohort in Hub
            </button>
          )}
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Delivery Hubs</p>
            <p className="text-2xl font-black text-[#032e42] mt-1">{destinations.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Tracked Cohorts</p>
            <p className="text-2xl font-black text-[#008000] mt-1">{cohorts.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Confirmed Delegates</p>
            <p className="text-2xl font-black text-[#032e42] mt-1">{totalHubDelegates}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Confirmed Revenue (USD)</p>
            <p className="text-2xl font-black text-[#16A36A] mt-1">${totalHubRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Interactive Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {destinations.map((dest) => {
            const isSelected = activeHub?.name === dest.name;
            return (
              <button
                key={dest.name}
                type="button"
                onClick={() => setSelectedDestination(dest.name)}
                className={`text-left rounded-2xl border p-4 shadow-sm space-y-3 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#032e42] text-white border-[#008000] ring-2 ring-[#008000]/30'
                    : 'bg-white text-[#032e42] border-slate-200 hover:border-[#008000]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#008000]/30 text-[#4ade80]' : 'bg-emerald-50 text-[#008000]'
                    }`}
                  >
                    {dest.name.toLowerCase().includes('online') ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-xs font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-[#032e42]'}`}>
                      {dest.name}
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-[#718096]'}`}>
                      {dest.region}
                    </p>
                  </div>
                </div>
                <div className={`grid grid-cols-3 gap-1 pt-2 border-t text-center ${isSelected ? 'border-white/10' : 'border-slate-100'}`}>
                  <div>
                    <p className={`text-[9.5px] uppercase font-bold ${isSelected ? 'text-slate-300' : 'text-[#718096]'}`}>Cohorts</p>
                    <p className="text-xs font-black">{dest.cohorts}</p>
                  </div>
                  <div>
                    <p className={`text-[9.5px] uppercase font-bold ${isSelected ? 'text-slate-300' : 'text-[#718096]'}`}>Delegates</p>
                    <p className="text-xs font-black text-[#008000]">{dest.enrolments}</p>
                  </div>
                  <div>
                    <p className={`text-[9.5px] uppercase font-bold ${isSelected ? 'text-slate-300' : 'text-[#718096]'}`}>Fee</p>
                    <p className={`text-xs font-black ${isSelected ? 'text-emerald-300' : 'text-[#16A36A]'}`}>
                      ${(dest.typicalFeeUsd || 1200).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Destination Detail Panel */}
        {activeHub && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#008000] border border-emerald-200 text-[10px] font-bold uppercase">
                    {activeHub.type}
                  </span>
                  <span className="text-[11px] font-semibold text-[#718096]">{activeHub.region}</span>
                </div>
                <h3 className="text-base font-black text-[#032e42] mt-1">{activeHub.name}</h3>
                <p className="text-xs text-[#718096] max-w-2xl mt-0.5">{activeHub.description}</p>
              </div>
              {canWrite && (
                <button
                  type="button"
                  onClick={() =>
                    openNewCohortModal({
                      destination: activeHub.name,
                      name: `${new Date().getFullYear()} ${activeHub.name.split(',')[0]} Executive Cohort`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Schedule Cohort Here
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/80 p-4 space-y-2.5">
                <h4 className="font-black text-[#032e42] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#008000]" /> Standard 2026 Delivery Windows
                </h4>
                {activeHub.nextWindows && activeHub.nextWindows.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeHub.nextWindows.map((win) => (
                      <span
                        key={win}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-semibold text-[#032e42]"
                      >
                        {win}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#718096]">Available on request for custom &amp; in-house cohorts.</p>
                )}
                <p className="text-[11px] text-[#718096] pt-1">
                  Standard tuition benchmark: <strong className="text-[#032e42]">USD {(activeHub.typicalFeeUsd || 1200).toLocaleString()}</strong> /{' '}
                  <strong className="text-[#032e42]">KES {Math.round((activeHub.typicalFeeUsd || 1200) * usdToKes).toLocaleString()}</strong> per delegate.
                </p>
              </div>

              <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/80 p-4 space-y-2.5">
                <h4 className="font-black text-[#032e42] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#008000]" /> Tracked Cohorts &amp; Confirmed Bookings ({activeHub.cohortRecords.length} Cohorts • {activeHub.enrolments} Confirmed Delegates)
                </h4>
                {activeHub.cohortRecords.length > 0 ? (
                  <div className="space-y-2">
                    {activeHub.cohortRecords.map((coh) => (
                      <div key={coh.id} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-[#032e42] truncate">{coh.name}</p>
                          <p className="text-[10.5px] text-[#718096] truncate">{coh.courseTitle} • {coh.startDate || 'TBD'}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#16A36A] text-[10px] font-bold shrink-0">
                          {coh.enrolmentStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#718096]">
                    All {courses.length} catalog courses are open for delivery in <strong>{activeHub.name}</strong>. Use &ldquo;Schedule Cohort Here&rdquo; to track slot capacities and deadlines.
                  </p>
                )}
                {activeHub.pendingPipeline > 0 && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2">
                    <strong>{activeHub.pendingPipeline}</strong> unconfirmed registration/inquiry awaiting confirmation, invoicing &amp; verified payment before counting toward confirmed delegates or hub revenue.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. COHORTS & INTAKES (Tracked Cohorts CRUD + 2026 Standard Intake Calendar)
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === 'cohorts-intakes') {
    const filteredCohorts = cohorts.filter((coh) => {
      if (cohortStatusFilter !== 'All' && coh.enrolmentStatus !== cohortStatusFilter) return false;
      if (!cohortSearch.trim()) return true;
      const q = cohortSearch.toLowerCase();
      return (
        (coh.name || '').toLowerCase().includes(q) ||
        (coh.courseTitle || '').toLowerCase().includes(q) ||
        (coh.destination || '').toLowerCase().includes(q)
      );
    });

    const totalSlots = cohorts.reduce((sum, c) => sum + (Number(c.availableSlots) || 0), 0);
    const openCohortsCount = cohorts.filter((c) => c.enrolmentStatus === 'Open' || c.enrolmentStatus === 'Filling Fast').length;

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-[#008000]" /> Cohorts &amp; Intakes ({cohorts.length} Tracked • {STANDARD_2026_INTAKES.length} Standard 2026 Windows)
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Schedule upcoming intakes, monitor seat capacities, set application deadlines, and convert standard 2026 calendar intakes into tracked cohorts.
            </p>
          </div>
          {canWrite && (
            <button
              type="button"
              onClick={() => openNewCohortModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Create Cohort
            </button>
          )}
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Tracked Cohorts</p>
            <p className="text-2xl font-black text-[#032e42] mt-1">{cohorts.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Open for Enrolment</p>
            <p className="text-2xl font-black text-[#16A36A] mt-1">{openCohortsCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">Total Capacity Slots</p>
            <p className="text-2xl font-black text-[#008000] mt-1">{totalSlots}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase text-[#718096]">2026 Standard Windows</p>
            <p className="text-2xl font-black text-[#032e42] mt-1">{STANDARD_2026_INTAKES.length}</p>
          </div>
        </div>

        {/* Tracked Cohorts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-black text-[#032e42]">Custom Tracked Cohorts</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cohortSearch}
                  onChange={(e) => setCohortSearch(e.target.value)}
                  placeholder="Search cohorts..."
                  className="h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <select
                value={cohortStatusFilter}
                onChange={(e) => setCohortStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Filling Fast">Filling Fast</option>
                <option value="Full">Full</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#032e42] text-white text-[11px] uppercase tracking-wider">
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
                {filteredCohorts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#718096]">
                      No custom tracked cohorts yet. Click &ldquo;Create Cohort&rdquo; above or activate any standard 2026 intake window below.
                    </td>
                  </tr>
                ) : (
                  filteredCohorts.map((coh) => {
                    const enrolled = registrations.filter(
                      (r) => r.cohortName === coh.name || (coh.courseSlug && r.courseSlug === coh.courseSlug)
                    ).length;
                    return (
                      <tr key={coh.id} className="hover:bg-[#F5F8FC]">
                        <td className="py-3 px-4 font-bold text-[#032e42]">
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
                            coh.enrolmentStatus === 'Open' ? 'bg-emerald-100 text-[#16A36A]' :
                            coh.enrolmentStatus === 'Filling Fast' ? 'bg-amber-100 text-[#F0A020]' :
                            'bg-slate-200 text-slate-700'
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

        {/* Standard 2026 Institutional Intake Calendar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-[#032e42] flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-[#008000]" /> Standard 2026 Institutional Intake Calendar
              </h3>
              <p className="text-[11px] text-[#718096] mt-0.5">
                Live published 2026 dates available across ECAS Institute&apos;s {courses.length} executive courses. Activate any window to track delegate seats.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4">
            {STANDARD_2026_INTAKES.map((win) => (
              <div key={win.id} className="rounded-xl border border-slate-200 bg-[#F5F8FC] p-4 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#008000] border border-emerald-200 text-[10px] font-bold">
                      {win.format}
                    </span>
                    <span className="text-[11px] font-black text-[#16A36A]">USD {win.feeUsd.toLocaleString()}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#032e42] leading-snug">{win.name}</h4>
                  <p className="text-[11px] text-[#718096] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#008000]" /> {win.destination}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {win.startDate} → {win.endDate}
                  </p>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() =>
                      openNewCohortModal({
                        name: win.name,
                        destination: win.destination,
                        startDate: win.startDate,
                        endDate: win.endDate,
                        applicationDeadline: win.deadline,
                        intakeYear: '2026',
                        availableSlots: 25,
                      })
                    }
                    className="w-full py-2 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-[11px] font-bold transition cursor-pointer"
                  >
                    Activate Tracked Cohort
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. FEES & PRICING (Multi-Currency + Audited Fee Changes + Full Pagination)
  // ═══════════════════════════════════════════════════════════════════════════
  const filteredCourses = courses.filter((c) => {
    if (feeCategoryFilter !== 'All' && (c.category || 'Executive Training') !== feeCategoryFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.slug || '').toLowerCase().includes(q)
    );
  });

  const FEE_PAGE_SIZE = 25;
  const totalFeePages = Math.max(1, Math.ceil(filteredCourses.length / FEE_PAGE_SIZE));
  const safeFeePage = Math.min(feePage, totalFeePages);
  const paginatedFeeCourses = filteredCourses.slice(
    (safeFeePage - 1) * FEE_PAGE_SIZE,
    safeFeePage * FEE_PAGE_SIZE
  );
  const avgFeeUsdAll = Math.round(
    courses.reduce((acc, c) => acc + parseCourseUsd(c), 0) / Math.max(1, courses.length)
  );
  const discountedCount = courses.filter((c) => Number(c.discountPercent) > 0).length;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
              <BadgeDollarSign className="w-5 h-5 text-[#008000]" /> Fees &amp; Multi-Currency Pricing ({courses.length} Courses)
            </h2>
            <p className="text-xs text-[#718096]">
              Configured FX rate: 1 USD = {usdToKes} KES. Fee edits are logged in Audit Logs and never silently alter previously issued invoices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canWrite && (
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold cursor-pointer transition">
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
                  const usd = parseCourseUsd(c);
                  return [c.slug, c.title, c.category || '', c.duration || '5 Days', usd, Math.round(usd * usdToKes), c.discountPercent || 0];
                });
                msimamiziEnterpriseService.exportCSV(headers, rows, `ECAS_Course_Fees_${new Date().toISOString().slice(0, 10)}.csv`, currentUser);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#032e42] cursor-pointer transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Fee Sheet
            </button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/70 p-3">
            <span className="text-[10px] font-bold uppercase text-[#718096] block">Total Priced Courses</span>
            <span className="text-lg font-black text-[#032e42]">{courses.length}</span>
          </div>
          <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/70 p-3">
            <span className="text-[10px] font-bold uppercase text-[#718096] block">Avg Tuition (USD)</span>
            <span className="text-lg font-black text-[#008000]">USD {avgFeeUsdAll.toLocaleString()}</span>
          </div>
          <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/70 p-3">
            <span className="text-[10px] font-bold uppercase text-[#718096] block">Avg Tuition (KES)</span>
            <span className="text-lg font-black text-[#032e42]">KES {Math.round(avgFeeUsdAll * usdToKes).toLocaleString()}</span>
          </div>
          <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/70 p-3">
            <span className="text-[10px] font-bold uppercase text-[#718096] block">Promotional Discounts</span>
            <span className="text-lg font-black text-[#16A36A]">{discountedCount}</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFeePage(1);
              }}
              placeholder="Search course name, slug, or category..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <select
            value={feeCategoryFilter}
            onChange={(e) => {
              setFeeCategoryFilter(e.target.value);
              setFeePage(1);
            }}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-[#032e42]"
          >
            <option value="All">All Faculties ({courses.length})</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#032e42] text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fee (USD)</th>
                <th className="py-3 px-4">Fee (KES)</th>
                <th className="py-3 px-4">Discount %</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFeeCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#718096]">
                    No courses match your current search or faculty filter.
                  </td>
                </tr>
              ) : (
                paginatedFeeCourses.map((course) => {
                  const baseUsd = parseCourseUsd(course);
                  const edit = feeEdits[course.slug];
                  const curUsd = edit?.feeUsd !== undefined ? edit.feeUsd : baseUsd;
                  const curDisc = edit?.discountPercent !== undefined ? edit.discountPercent : (course.discountPercent || 0);
                  return (
                    <tr key={course.slug} className="hover:bg-[#F5F8FC]">
                      <td className="py-2.5 px-4 font-bold text-[#032e42] max-w-[280px] truncate">{course.title}</td>
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
                      <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
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
                            onClick={() => safeEditCourse(course)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                          >
                            Full Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalFeePages > 1 && (
          <div className="px-4 py-3 bg-[#F5F8FC] border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#718096]">
              Showing <strong>{(safeFeePage - 1) * FEE_PAGE_SIZE + 1}–{Math.min(safeFeePage * FEE_PAGE_SIZE, filteredCourses.length)}</strong> of{' '}
              <strong>{filteredCourses.length}</strong> courses
            </span>
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeFeePage <= 1}
                onClick={() => setFeePage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="px-2 font-bold text-[#032e42]">
                Page {safeFeePage} / {totalFeePages}
              </span>
              <button
                type="button"
                disabled={safeFeePage >= totalFeePages}
                onClick={() => setFeePage((p) => Math.min(totalFeePages, p + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold disabled:opacity-40 cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
