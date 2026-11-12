import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  MapPin,
  Search,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  ExternalLink,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  Edit,
  X,
  Hotel,
  Plane,
  Compass,
  ArrowUpRight,
  Check,
  LayoutList,
  LayoutGrid,
  Menu,
  RefreshCw,
  ArrowRightLeft,
} from 'lucide-react';
import { adminRegistrationService } from '@/services/adminRegistrationService';
import { dataService } from '@/lib/dataService';

export default function MsimamiziAdmin() {

  // Authentication & Dynamic Credentials State
  const [isAuthenticated, setIsAuthenticated] = useState(() => adminRegistrationService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(() => adminRegistrationService.getCurrentUser());
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'create'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authRemember, setAuthRemember] = useState(true);
  const [authError, setAuthError] = useState('');

  // Dynamic resolution of public website link (handles subdomains vs main domain vs localhost)
  const publicSiteUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://ecasiafrica.org';
    if (
      window.location.hostname.startsWith('msimamizi.') ||
      window.location.hostname.includes('msimamizi') ||
      window.location.search.includes('portal=msimamizi')
    ) {
      return 'https://ecasiafrica.org';
    }
    return '/';
  }, []);

  // Mobile sidebar toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Desktop sidebar collapse / minimize state (Persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState(() => {
    try {
      return localStorage.getItem('msimamizi_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const setIsSidebarCollapsed = (val) => {
    setIsSidebarCollapsedState(val);
    try {
      localStorage.setItem('msimamizi_sidebar_collapsed', String(val));
    } catch {
      // ignore
    }
  };

  // Active Tab: 'dashboard' | 'registrations' | 'courses' (Persisted across refreshes & URL synced)
  const getInitialTab = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get('tab');
      if (urlTab && ['dashboard', 'registrations', 'courses'].includes(urlTab)) {
        return urlTab;
      }
      const hashTab = window.location.hash.replace('#', '');
      if (hashTab && ['dashboard', 'registrations', 'courses'].includes(hashTab)) {
        return hashTab;
      }
      const savedTab = localStorage.getItem('msimamizi_active_tab');
      if (savedTab && ['dashboard', 'registrations', 'courses'].includes(savedTab)) {
        return savedTab;
      }
    } catch {
      // Fallback
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('msimamizi_active_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Ignore
    }
  };

  // Registrations state (Persisted in sessionStorage across refreshes)
  const [registrations, setRegistrations] = useState([]);
  const [searchQuery, setSearchQueryState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_reg_search') || ''; } catch { return ''; }
  });
  const setSearchQuery = (val) => {
    setSearchQueryState(val);
    try { sessionStorage.setItem('msimamizi_reg_search', val); } catch { /* ignore */ }
  };

  const [filterStatus, setFilterStatusState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_reg_status') || 'All'; } catch { return 'All'; }
  });
  const setFilterStatus = (val) => {
    setFilterStatusState(val);
    try { sessionStorage.setItem('msimamizi_reg_status', val); } catch { /* ignore */ }
  };

  const [filterVenue, setFilterVenueState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_reg_venue') || 'All'; } catch { return 'All'; }
  });
  const setFilterVenue = (val) => {
    setFilterVenueState(val);
    try { sessionStorage.setItem('msimamizi_reg_venue', val); } catch { /* ignore */ }
  };

  const [filterPayment, setFilterPaymentState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_reg_payment') || 'All'; } catch { return 'All'; }
  });
  const setFilterPayment = (val) => {
    setFilterPaymentState(val);
    try { sessionStorage.setItem('msimamizi_reg_payment', val); } catch { /* ignore */ }
  };

  // Selected registration for details / voucher modal
  const [selectedReg, setSelectedReg] = useState(null);

  // New Manual Registration Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newRegData, setNewRegData] = useState({
    title: 'Mr.',
    firstName: '',
    lastName: '',
    officialEmail: '',
    phoneNumber: '',
    organisation: '',
    jobTitle: '',
    country: 'Kenya',
    eventTitle: 'Climate-Responsive Budgeting & Strategic Fiscal Management',
    venue: 'Nairobi, Kenya',
    format: 'Classroom',
    durationText: '2 Weeks (10 Days)',
    participantsCount: 1,
    totalFee: 1200,
    needAccommodation: 'No',
    needAirportTransfer: 'No',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    adminNotes: 'Manually entered by administrator.',
  });

  // KPI stats
  const [kpis, setKpis] = useState(adminRegistrationService.getKPIs());

  // Dynamic Courses Management State (213 Accredited Programs from DataService)
  const [courses, setCourses] = useState(() => dataService.getCoursesList());
  const [toastMessage, setToastMessage] = useState('');

  // World-Class Filtering & View State for Courses Catalog (Cached in localStorage & sessionStorage)
  const [courseSearch, setCourseSearchState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_course_search') || ''; } catch { return ''; }
  });
  const setCourseSearch = (val) => {
    setCourseSearchState(val);
    try { sessionStorage.setItem('msimamizi_course_search', val); } catch { /* ignore */ }
  };

  const [selectedDepartment, setSelectedDepartmentState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_course_dept') || 'All Departments'; } catch { return 'All Departments'; }
  });
  const setSelectedDepartment = (val) => {
    setSelectedDepartmentState(val);
    try { sessionStorage.setItem('msimamizi_course_dept', val); } catch { /* ignore */ }
  };

  const [selectedDuration, setSelectedDurationState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_course_duration') || 'All Durations'; } catch { return 'All Durations'; }
  });
  const setSelectedDuration = (val) => {
    setSelectedDurationState(val);
    try { sessionStorage.setItem('msimamizi_course_duration', val); } catch { /* ignore */ }
  };

  const [selectedPricing, setSelectedPricingState] = useState(() => {
    try { return sessionStorage.getItem('msimamizi_course_pricing') || 'All'; } catch { return 'All'; }
  });
  const setSelectedPricing = (val) => {
    setSelectedPricingState(val);
    try { sessionStorage.setItem('msimamizi_course_pricing', val); } catch { /* ignore */ }
  };

  const [courseSortBy, setCourseSortByState] = useState(() => {
    try { return localStorage.getItem('msimamizi_course_sort') || 'title-asc'; } catch { return 'title-asc'; }
  });
  const setCourseSortBy = (val) => {
    setCourseSortByState(val);
    try { localStorage.setItem('msimamizi_course_sort', val); } catch { /* ignore */ }
  };

  const [courseViewMode, setCourseViewModeState] = useState(() => {
    try { return localStorage.getItem('msimamizi_course_view_mode') || 'table'; } catch { return 'table'; }
  });
  const setCourseViewMode = (val) => {
    setCourseViewModeState(val);
    try { localStorage.setItem('msimamizi_course_view_mode', val); } catch { /* ignore */ }
  };

  const [coursesPerPage, setCoursesPerPageState] = useState(() => {
    try { return localStorage.getItem('msimamizi_course_per_page') || '25'; } catch { return '25'; }
  });
  const setCoursesPerPage = (val) => {
    setCoursesPerPageState(val);
    try { localStorage.setItem('msimamizi_course_per_page', val); } catch { /* ignore */ }
  };

  const [courseCurrentPage, setCourseCurrentPageState] = useState(() => {
    try {
      const p = parseInt(sessionStorage.getItem('msimamizi_course_page'), 10);
      return Number.isNaN(p) || p < 1 ? 1 : p;
    } catch { return 1; }
  });
  const setCourseCurrentPage = (val) => {
    setCourseCurrentPageState(val);
    try { sessionStorage.setItem('msimamizi_course_page', String(val)); } catch { /* ignore */ }
  };

  // Dynamic Departments derived directly from the loaded courses
  const categoryCounts = useMemo(() => {
    const counts = {};
    courses.forEach((c) => {
      const cat = c.category || 'Executive Training';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [courses]);

  const departmentsList = useMemo(() => {
    const cats = Object.keys(categoryCounts).sort();
    return ['All Departments', ...cats];
  }, [categoryCounts]);

  const durationList = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c.duration) set.add(c.duration);
    });
    return ['All Durations', ...Array.from(set).sort()];
  }, [courses]);

  // Reset pagination to page 1 ONLY when filters change (not on initial page load / refresh)
  const isInitialFilterMount = useRef(true);
  useEffect(() => {
    if (isInitialFilterMount.current) {
      isInitialFilterMount.current = false;
      return;
    }
    setCourseCurrentPage(1);
  }, [courseSearch, selectedDepartment, selectedDuration, selectedPricing, courseSortBy, coursesPerPage]);

  // Comprehensive Filter & Sort Logic
  const filteredAndSortedCourses = useMemo(() => {
    const list = courses.filter((c) => {
      if (courseSearch.trim()) {
        const q = courseSearch.toLowerCase().trim();
        const inTitle = (c.title || '').toLowerCase().includes(q);
        const inCat = (c.category || '').toLowerCase().includes(q);
        const inSlug = (c.slug || '').toLowerCase().includes(q);
        const inSummary = (c.summary || '').toLowerCase().includes(q);
        if (!inTitle && !inCat && !inSlug && !inSummary) return false;
      }
      if (selectedDepartment !== 'All Departments' && (c.category || 'Executive Training') !== selectedDepartment) {
        return false;
      }
      if (selectedDuration !== 'All Durations' && (c.duration || '5 Days') !== selectedDuration) {
        return false;
      }
      if (selectedPricing === 'Discounted') {
        if (!c.discountPercent || c.discountPercent <= 0) return false;
      } else if (selectedPricing === 'Standard') {
        if (c.discountPercent && c.discountPercent > 0) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (courseSortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (courseSortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      if (courseSortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      const feeA = Number(String(a.fee || 1200).replace(/[^0-9]/g, '')) || 1200;
      const feeB = Number(String(b.fee || 1200).replace(/[^0-9]/g, '')) || 1200;
      if (courseSortBy === 'fee-high') return feeB - feeA;
      if (courseSortBy === 'fee-low') return feeA - feeB;
      return 0;
    });

    return list;
  }, [courses, courseSearch, selectedDepartment, selectedDuration, selectedPricing, courseSortBy]);

  const totalFilteredCourses = filteredAndSortedCourses.length;
  const totalCoursePages = coursesPerPage === 'all' ? 1 : Math.ceil(totalFilteredCourses / Number(coursesPerPage));

  const paginatedCourses = useMemo(() => {
    if (coursesPerPage === 'all') return filteredAndSortedCourses;
    const perPage = Number(coursesPerPage) || 25;
    const start = (courseCurrentPage - 1) * perPage;
    return filteredAndSortedCourses.slice(start, start + perPage);
  }, [filteredAndSortedCourses, courseCurrentPage, coursesPerPage]);

  // Export entire course catalog as CSV
  const exportCoursesCSV = () => {
    if (!courses || courses.length === 0) return;
    const headers = ['Slug', 'Title', 'Category', 'Duration', 'Standard Fee (USD)', 'Fee (KES)', 'Discount %', 'Discount Price (USD)', 'Cohorts'];
    const rows = courses.map((c) => {
      const feeNum = Number(String(c.fee || 1200).replace(/[^0-9]/g, '')) || 1200;
      const feeKes = c.feeKes || (feeNum * 130);
      const cohorts = Array.isArray(c.customCohorts) ? c.customCohorts.join('; ') : '16 - 27 March 2026; 13 - 24 April 2026; 18 - 29 May 2026';
      return [
        c.slug,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${(c.category || '').replace(/"/g, '""')}"`,
        `"${c.duration || '5 Days'}"`,
        feeNum,
        feeKes,
        c.discountPercent || 0,
        c.discountPrice || feeNum,
        `"${cohorts.replace(/"/g, '""')}"`
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ECAS_Course_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Course Editing Modal State
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({
    feeUsd: 1200,
    feeKes: 155000,
    discountPercent: 0,
    discountPrice: 1200,
    duration: '5 Days',
    category: '',
    customCohorts: []
  });
  const [newCohortDateInput, setNewCohortDateInput] = useState('');
  const [cohortStartDate, setCohortStartDate] = useState('');
  const [cohortEndDate, setCohortEndDate] = useState('');

  // Upload New Course Modal State
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    category: 'Leadership, Governance & Public Sector Transformation',
    duration: '5 Days',
    feeUsd: 1200,
    feeKes: 155000,
    discountPercent: 10,
    discountPrice: 1080,
    cohortsText: '16 - 27 March 2026, 13 - 24 April 2026, 18 - 29 May 2026',
    venues: 'Nairobi, Mombasa, Kigali, Dubai, Kuala Lumpur, Online',
    summary: 'Executive training programme designed to build leadership competence and practical technical capacity.',
    contentModules: 'Module 1: Foundations & Global Frameworks\nModule 2: Strategic Applications & Implementation\nModule 3: Leadership, Risk & Governance\nModule 4: Case Studies, Capstone Action Plan & Certification'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Check initial authentication
  useEffect(() => {
    setIsAuthenticated(adminRegistrationService.isAuthenticated());
  }, []);

  // Load registrations & listen for real-time updates
  const loadData = () => {
    const list = adminRegistrationService.getRegistrations();
    setRegistrations(list);
    setKpis(adminRegistrationService.getKPIs());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('ecasi_registration_updated', handleUpdate);
    return () => window.removeEventListener('ecasi_registration_updated', handleUpdate);
  }, []);

  // Listen for dynamic course changes
  useEffect(() => {
    const handleCoursesUpdate = () => {
      setCourses(dataService.getCoursesList());
    };
    window.addEventListener('ecasi_courses_updated', handleCoursesUpdate);
    return () => window.removeEventListener('ecasi_courses_updated', handleCoursesUpdate);
  }, []);

  // 2026 Standard Executive Intake Cohorts
  const QUICK_2026_COHORTS = [
    '16 - 27 March 2026',
    '13 - 24 April 2026',
    '18 - 29 May 2026',
    '15 - 26 June 2026',
    '13 - 24 July 2026',
    '17 - 28 August 2026',
    '14 - 25 September 2026',
    '19 - 30 October 2026',
    '16 - 27 November 2026',
    '7 - 18 December 2026',
  ];

  const formatCohortDatesFromPickers = (startDateStr, endDateStr) => {
    if (!startDateStr) return '';
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const start = new Date(sY, sM - 1, sD);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (!endDateStr) {
      return `${start.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    }
    const [eY, eM, eD] = endDateStr.split('-').map(Number);
    const end = new Date(eY, eM - 1, eD);

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  };

  // Open Edit Course Modal with current pricing & cohorts
  const openEditCourse = (course) => {
    const feeRaw = Number(String(course.fee || 1200).replace(/[^0-9]/g, '')) || 1200;
    const feeKesRaw = course.feeKes || (feeRaw * 130);
    const discPct = Number(course.discountPercent) || (course.discountPrice ? Math.round((1 - course.discountPrice / feeRaw) * 100) : 0);
    const discPrice = course.discountPrice || (discPct ? Math.round(feeRaw * (1 - discPct / 100)) : feeRaw);

    const cohorts = Array.isArray(course.customCohorts) && course.customCohorts.length > 0
      ? course.customCohorts
      : [
          '16 - 27 March 2026',
          '13 - 24 April 2026',
          '18 - 29 May 2026',
          '15 - 26 June 2026',
          '13 - 24 July 2026'
        ];

    setEditingCourse(course);
    setEditForm({
      feeUsd: feeRaw,
      feeKes: feeKesRaw,
      discountPercent: discPct,
      discountPrice: discPrice,
      duration: course.duration || '5 Days',
      category: course.category || 'Executive Training',
      customCohorts: cohorts
    });
    setNewCohortDateInput('');
    setCohortStartDate('');
    setCohortEndDate('');
  };

  // Add new cohort intake date from custom text input
  const handleAddCohortDate = () => {
    if (!newCohortDateInput.trim()) return;
    const val = newCohortDateInput.trim();
    setEditForm((prev) => ({
      ...prev,
      customCohorts: prev.customCohorts.includes(val) ? prev.customCohorts : [...prev.customCohorts, val]
    }));
    setNewCohortDateInput('');
    showToast(`Added cohort: ${val}`);
  };

  // Add cohort intake date from date range picker
  const handleAddCohortDateFromPicker = () => {
    if (!cohortStartDate) return;
    const formatted = formatCohortDatesFromPickers(cohortStartDate, cohortEndDate);
    if (!formatted) return;
    setEditForm((prev) => ({
      ...prev,
      customCohorts: prev.customCohorts.includes(formatted) ? prev.customCohorts : [...prev.customCohorts, formatted]
    }));
    setCohortStartDate('');
    setCohortEndDate('');
    showToast(`Added cohort: ${formatted}`);
  };

  // Add 1-click preset 2026 cohort date
  const handleAddPresetCohort = (preset) => {
    setEditForm((prev) => ({
      ...prev,
      customCohorts: prev.customCohorts.includes(preset) ? prev.customCohorts : [...prev.customCohorts, preset]
    }));
    showToast(`Added cohort: ${preset}`);
  };

  // Remove cohort intake date
  const handleRemoveCohortDate = (idxToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      customCohorts: prev.customCohorts.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  // Save Course Edit (Tuition, Discount, Cohort Dates)
  const handleSaveCourseEdit = (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    const success = dataService.updateCoursePricing(editingCourse.slug, {
      fee: `$${editForm.feeUsd}`,
      feeUsd: editForm.feeUsd,
      feeKes: editForm.feeKes,
      discountPercent: Number(editForm.discountPercent) || 0,
      discountPrice: Number(editForm.discountPrice) || editForm.feeUsd,
      customCohorts: editForm.customCohorts
    });

    if (success) {
      setCourses(dataService.getCoursesList());
      setEditingCourse(null);
      showToast(`Successfully updated tuition, discounts, and cohort dates for "${editingCourse.title}"! Changes are now live on the public site.`);
    } else {
      alert('Failed to save course changes. Please check console.');
    }
  };

  // Create & Upload New Course / Training
  const handleCreateNewCourse = (e) => {
    e.preventDefault();
    if (!newCourseForm.title.trim()) {
      alert('Please provide a course title');
      return;
    }

    // Auto-generate clean slug
    const generatedSlug = newCourseForm.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const cohortList = newCourseForm.cohortsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newCourseObj = {
      title: newCourseForm.title.trim(),
      slug: generatedSlug,
      category: newCourseForm.category,
      duration: newCourseForm.duration,
      fee: `$${newCourseForm.feeUsd}`,
      feeUsd: Number(newCourseForm.feeUsd) || 1200,
      feeKes: Number(newCourseForm.feeKes) || 155000,
      discountPercent: Number(newCourseForm.discountPercent) || 0,
      discountPrice: Number(newCourseForm.discountPrice) || Number(newCourseForm.feeUsd),
      customCohorts: cohortList,
      location: newCourseForm.venues,
      summary: newCourseForm.summary,
      content: newCourseForm.contentModules,
      isPublished: true,
      createdAt: new Date().toISOString()
    };

    const success = dataService.saveCourse(newCourseObj);
    if (success) {
      setCourses(dataService.getCoursesList());
      setIsNewCourseModalOpen(false);
      showToast(`New course "${newCourseObj.title}" has been successfully published to the ECAS catalog!`);
      // Reset form
      setNewCourseForm({
        title: '',
        category: 'Governance, Leadership & Organizational Development',
        duration: '5 Days',
        feeUsd: 1200,
        feeKes: 155000,
        discountPercent: 10,
        discountPrice: 1080,
        cohortsText: '16 - 27 March 2026, 13 - 24 April 2026, 18 - 29 May 2026',
        venues: 'Nairobi, Mombasa, Kigali, Dubai, Kuala Lumpur, Online',
        summary: 'Executive training programme designed to build leadership competence and practical technical capacity.',
        contentModules: 'Module 1: Foundations & Global Frameworks\nModule 2: Strategic Applications & Implementation\nModule 3: Leadership, Risk & Governance\nModule 4: Case Studies, Capstone Action Plan & Certification'
      });
    } else {
      alert('Failed to create course. Please try again.');
    }
  };

  // Delete Course
  const handleDeleteCourse = (slug, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the catalog?`)) return;
    const success = dataService.deleteCourse(slug);
    if (success) {
      setCourses(dataService.getCoursesList());
      showToast(`Course "${title}" removed from catalog.`);
    }
  };

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const result = adminRegistrationService.login(authEmail, authPassword, authRemember);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
    } else {
      setAuthError(result.message || 'Invalid administrative credentials');
    }
  };

  // Handle First-Time Administrator Password Creation
  const handleCreatePasswordSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (createPassword !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify both fields.');
      return;
    }

    const result = adminRegistrationService.registerAdmin(createEmail, createPassword, authRemember);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      showToast('Administrator credentials created successfully! Welcome to Msimamizi.');
    } else {
      setAuthError(result.message);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    adminRegistrationService.logout();
    setIsAuthenticated(false);
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = `${r.title || ''} ${r.firstName || ''} ${r.middleName || ''} ${r.lastName || ''}`.toLowerCase();
        const org = (r.organisation || '').toLowerCase();
        const course = (r.eventTitle || '').toLowerCase();
        const ref = (r.referenceNo || '').toLowerCase();
        const email = (r.officialEmail || r.personalEmail || '').toLowerCase();
        if (!name.includes(q) && !org.includes(q) && !course.includes(q) && !ref.includes(q) && !email.includes(q)) {
          return false;
        }
      }
      // Status
      if (filterStatus !== 'All' && r.status !== filterStatus) return false;
      // Venue
      if (filterVenue !== 'All' && !(r.venue || '').toLowerCase().includes(filterVenue.toLowerCase())) return false;
      // Payment
      if (filterPayment !== 'All' && r.paymentStatus !== filterPayment) return false;

      return true;
    });
  }, [registrations, searchQuery, filterStatus, filterVenue, filterPayment]);

  // Update status quickly
  const handleQuickStatusChange = (id, newStatus) => {
    let paymentUpdate = {};
    if (newStatus === 'Confirmed') paymentUpdate = { paymentStatus: 'Paid' };
    if (newStatus === 'Approved') paymentUpdate = { paymentStatus: 'Invoiced' };
    adminRegistrationService.updateRegistration(id, { status: newStatus, ...paymentUpdate });
    loadData();
    if (selectedReg && selectedReg.id === id) {
      setSelectedReg((prev) => ({ ...prev, status: newStatus, ...paymentUpdate }));
    }
  };

  // Delete registration
  const handleDeleteRegistration = (id, refNo) => {
    if (window.confirm(`Are you sure you want to permanently delete registration ${refNo}?`)) {
      adminRegistrationService.deleteRegistration(id);
      loadData();
      if (selectedReg && selectedReg.id === id) setSelectedReg(null);
    }
  };

  // Add Manual Registration
  const handleCreateManualRegistration = (e) => {
    e.preventDefault();
    if (!newRegData.firstName || !newRegData.lastName || !newRegData.officialEmail) {
      alert('Please fill in required fields (First Name, Last Name, Email)');
      return;
    }
    const created = adminRegistrationService.addRegistration(newRegData);
    if (created) {
      setIsNewModalOpen(false);
      loadData();
      alert(`Registration ${created.referenceNo} created successfully!`);
      setNewRegData({
        title: 'Mr.',
        firstName: '',
        lastName: '',
        officialEmail: '',
        phoneNumber: '',
        organisation: '',
        jobTitle: '',
        country: 'Kenya',
        eventTitle: 'Climate-Responsive Budgeting & Strategic Fiscal Management',
        venue: 'Nairobi, Kenya',
        format: 'Classroom',
        durationText: '2 Weeks (10 Days)',
        participantsCount: 1,
        totalFee: 1200,
        needAccommodation: 'No',
        needAirportTransfer: 'No',
        status: 'Pending',
        paymentStatus: 'Unpaid',
        adminNotes: 'Manually entered by administrator.',
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LOGIN SCREEN (If not authenticated)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#021f2d] flex items-center justify-center p-4 selection:bg-[#008000] selection:text-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Top Banner */}
          <div className="bg-[#032e42] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#032e42] via-[#022433] to-[#006600]/40 opacity-90" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg mb-3 flex items-center justify-center">
                <img src="/logo.png" alt="ECAS Institute" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                ECAS Msimamizi
              </h1>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-widest font-semibold">
                Executive Training Admin Portal
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008000]/30 border border-[#008000]/50 text-white text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] animate-pulse" />
                msimamizi.ecasiafrica.org
              </div>
            </div>
          </div>

          {/* Dual-Mode Auth Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-[#032e42] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('create');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'create'
                  ? 'bg-white text-[#008000] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Password</span>
            </button>
          </div>

          {/* Login Form */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrator Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="admin@ecasiafrica.org"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Security Password / Access PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Testing login: <strong className="text-slate-600 font-mono">admin@ecasiafrica.org</strong> (PIN: <strong className="text-slate-600 font-mono">msimamizi2026</strong>)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={authRemember}
                    onChange={(e) => setAuthRemember(e.target.checked)}
                    className="rounded text-[#008000] focus:ring-[#008000]"
                  />
                  <span>Remember this terminal</span>
                </label>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 bg-[#032e42] hover:bg-[#008000] text-white font-bold text-sm rounded-xl shadow-md transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Msimamizi Portal</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('create');
                    setAuthError('');
                  }}
                  className="text-xs font-semibold text-[#008000] hover:underline cursor-pointer"
                >
                  First time logging in? Click here to create your password
                </button>
              </div>

              <div className="pt-2 text-center border-t border-slate-100">
                <a
                  href={publicSiteUrl}
                  className="text-xs font-semibold text-slate-500 hover:text-[#032e42] inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Return to Public Website (ecasiafrica.org)</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </form>
          )}

          {/* First-Time Administrator Password Creation Form */}
          {authMode === 'create' && (
            <form onSubmit={handleCreatePasswordSubmit} className="p-6 sm:p-8 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008000] shrink-0 mt-0.5" />
                <p>
                  Create your personal administrative password using your authorized <strong>@ecasiafrica.org</strong> email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="yourname@ecasiafrica.org"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Must end with <strong className="font-mono text-slate-700">@ecasiafrica.org</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={authRemember}
                    onChange={(e) => setAuthRemember(e.target.checked)}
                    className="rounded text-[#008000] focus:ring-[#008000]"
                  />
                  <span>Remember this terminal</span>
                </label>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 bg-[#008000] hover:bg-[#006600] text-white font-bold text-sm rounded-xl shadow-md transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Password &amp; Enter Portal</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-[#032e42] hover:underline cursor-pointer"
                >
                  Already have an account? Sign In here
                </button>
              </div>

              <div className="pt-2 text-center border-t border-slate-100">
                <a
                  href={publicSiteUrl}
                  className="text-xs font-semibold text-slate-500 hover:text-[#032e42] inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Return to Public Website (ecasiafrica.org)</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MAIN MSIMAMIZI ADMIN PORTAL INTERFACE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans selection:bg-[#008000] selection:text-white flex flex-col md:flex-row">
      {/* ─────────────────────────────────────────────────────────────
          LEFT VERTICAL SIDEBAR (COLLAPSIBLE / MINIMIZABLE)
      ───────────────────────────────────────────────────────────── */}
      <aside className={`w-full ${
        isSidebarCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'
      } bg-[#032e42] text-white flex-shrink-0 flex flex-col justify-between border-r border-[#022433] md:sticky md:top-0 md:h-screen md:overflow-y-auto z-40 shadow-xl transition-all duration-300 ease-in-out`}>
        {/* Top Branding & Navigation */}
        <div className="flex flex-col">
          {/* Header Brand */}
          <div className={`border-b border-white/10 flex items-center transition-all ${
            isSidebarCollapsed ? 'p-3 flex-row md:flex-col gap-2 justify-between md:justify-center' : 'p-5 justify-between'
          }`}>
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'md:flex-col md:gap-1' : ''}`}>
              <div
                className="w-10 h-10 rounded-xl bg-white p-1.5 shadow flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition"
                onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
                title={isSidebarCollapsed ? "Click to expand sidebar" : "ECAS Msimamizi"}
              >
                <img src="/logo.png" alt="ECAS Logo" className="w-full h-full object-contain" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-white truncate">
                      ECAS Msimamizi
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#008000] text-white text-[9px] font-black uppercase tracking-wider">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Live Sync Active
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Minimize / Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={isSidebarCollapsed ? "Expand sidebar navigation" : "Minimize sidebar navigation"}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronsRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ChevronsLeft className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Nav Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Items (Visible on desktop, toggled on mobile) */}
          <div className={`${isSidebarCollapsed ? 'p-2 space-y-4' : 'p-4 space-y-6'} ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {/* Main Menu */}
            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold tracking-wider text-white/40 uppercase mb-2">
                  Management Modules
                </p>
              )}
              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  title={isSidebarCollapsed ? "Overview Dashboard" : undefined}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'
                  } rounded-xl font-bold text-xs transition-all cursor-pointer relative group ${
                    activeTab === 'dashboard'
                      ? 'bg-[#008000] text-white shadow-lg shadow-emerald-950/40'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Compass className={`w-5 h-5 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#00c853]'}`} />
                    {!isSidebarCollapsed && <span>Overview Dashboard</span>}
                  </div>
                  {!isSidebarCollapsed && activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 text-white/70" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('registrations');
                    setIsMobileMenuOpen(false);
                  }}
                  title={isSidebarCollapsed ? `Course Registrations (${registrations.length})` : undefined}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'
                  } rounded-xl font-bold text-xs transition-all cursor-pointer relative group ${
                    activeTab === 'registrations'
                      ? 'bg-[#008000] text-white shadow-lg shadow-emerald-950/40'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Users className={`w-5 h-5 shrink-0 ${activeTab === 'registrations' ? 'text-white' : 'text-[#00c853]'}`} />
                    {!isSidebarCollapsed && <span>Registrations</span>}
                  </div>
                  {!isSidebarCollapsed ? (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                      activeTab === 'registrations' ? 'bg-white text-[#008000]' : 'bg-white/10 text-white'
                    }`}>
                      {registrations.length}
                    </span>
                  ) : (
                    registrations.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-4.5 px-1 bg-[#008000] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#032e42] shadow-sm">
                        {registrations.length}
                      </span>
                    )
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('courses');
                    setIsMobileMenuOpen(false);
                  }}
                  title={isSidebarCollapsed ? `Courses & Fees (${courses.length})` : undefined}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'
                  } rounded-xl font-bold text-xs transition-all cursor-pointer relative group ${
                    activeTab === 'courses'
                      ? 'bg-[#008000] text-white shadow-lg shadow-emerald-950/40'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <GraduationCap className={`w-5 h-5 shrink-0 ${activeTab === 'courses' ? 'text-white' : 'text-[#00c853]'}`} />
                    {!isSidebarCollapsed && <span>Courses &amp; Fees</span>}
                  </div>
                  {!isSidebarCollapsed ? (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                      activeTab === 'courses' ? 'bg-white text-[#008000]' : 'bg-white/10 text-white'
                    }`}>
                      {courses.length}
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 px-1 bg-white/20 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-[#032e42]">
                      {courses.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Quick Actions Panel */}
            <div>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold tracking-wider text-white/40 uppercase mb-2">
                  Quick Actions
                </p>
              )}
              <div className={`space-y-2 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  title="New Registration (+)"
                  className={`${
                    isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full px-3.5 py-2.5 justify-center gap-2'
                  } flex items-center rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 shadow-sm transition cursor-pointer`}
                >
                  <Plus className="w-4 h-4 text-[#00c853]" />
                  {!isSidebarCollapsed && <span>+ New Registration</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsNewCourseModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  title="Upload New Course"
                  className={`${
                    isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full px-3.5 py-2.5 justify-center gap-2'
                  } flex items-center rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-semibold border border-white/10 transition cursor-pointer`}
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  {!isSidebarCollapsed && <span>+ Upload New Course</span>}
                </button>

                <button
                  type="button"
                  onClick={() => adminRegistrationService.downloadCSV()}
                  title="Export Registrations to CSV"
                  className={`${
                    isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full px-3.5 py-2 justify-center gap-2'
                  } flex items-center rounded-xl bg-transparent hover:bg-white/5 text-white/70 hover:text-white text-xs font-medium transition cursor-pointer`}
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  {!isSidebarCollapsed && <span>Export Registrations (CSV)</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className={`border-t border-white/10 bg-[#022433] ${
          isSidebarCollapsed ? 'p-2 space-y-2 flex flex-col items-center' : 'p-4 space-y-3'
        } ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          {!isSidebarCollapsed ? (
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#00c853]" />
                <span>Public Website</span>
              </span>
              <span className="text-[10px] text-white/50 font-mono">ecasiafrica.org</span>
            </a>
          ) : (
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Public Website (ecasiafrica.org)"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-2 pt-1' : 'justify-between pt-1'}`}>
            <div className={`flex items-center gap-2 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`} title={`${currentUser?.role || 'Administrator'} (${currentUser?.email || 'admin@ecasiafrica.org'})`}>
              <div className="w-8 h-8 rounded-full bg-[#008000] flex items-center justify-center text-white font-extrabold text-xs shrink-0 uppercase">
                {currentUser?.email ? currentUser.email.substring(0, 2) : 'AD'}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.role || 'Administrator'}</p>
                  <p className="text-[10px] text-white/60 truncate font-mono">{currentUser?.email || 'admin@ecasiafrica.org'}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout from Msimamizi"
              className={`p-2 rounded-lg text-red-300 hover:text-white hover:bg-red-900/40 transition cursor-pointer ${
                isSidebarCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT MAIN CONTENT AREA
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Header Bar on Right Side */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Minimize / Expand Toggle in Topbar */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title={isSidebarCollapsed ? "Expand sidebar navigation" : "Minimize sidebar navigation"}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronsRight className="w-4 h-4 text-[#008000]" />
              ) : (
                <ChevronsLeft className="w-4 h-4" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 capitalize tracking-tight">
                  {activeTab === 'dashboard' && 'Executive Overview'}
                  {activeTab === 'registrations' && 'Course Registrations'}
                  {activeTab === 'courses' && 'Course Catalog & Pricing Management'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                  Live DB
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                msimamizi.ecasiafrica.org • Institute Central Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                loadData();
                setToastMessage('Data refreshed from live database.');
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-[#008000] hover:bg-slate-100 transition cursor-pointer"
              title="Sync / Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Registration</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
        {/* ════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW DASHBOARD
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Registrations
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#032e42] mt-1">
                    {kpis.totalRegistrations}
                  </p>
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Live across all venues</span>
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#032e42]/10 text-[#032e42] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pending Review
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                    {kpis.pendingCount}
                  </p>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Requires proforma invoice</span>
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Confirmed Enrolments
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
                    {kpis.confirmedCount}
                  </p>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>LPO or payment received</span>
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Enrolment Value
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#032e42] mt-1">
                    ${kpis.totalRevenueUSD.toLocaleString()}
                  </p>
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{kpis.totalDelegates} Total delegates booked</span>
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#008000]/10 text-[#008000] flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Destination Breakdown & Quick Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Venue Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#008000]" />
                    <span>Enrolments by Venue</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400">2026 Cohorts</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(kpis.venueBreakdown).length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <MapPin className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600">No venue registrations yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Enrolments will populate breakdown by destination automatically.</p>
                    </div>
                  ) : (
                    Object.entries(kpis.venueBreakdown).map(([venueName, count]) => {
                      const percentage = Math.round((count / (kpis.totalRegistrations || 1)) * 100);
                      return (
                        <div key={venueName} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-700">{venueName}</span>
                            <span className="text-slate-900 font-bold">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#008000] transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recent Enrolment Feed */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#032e42]" />
                      <span>Recent Registrations Stream</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('registrations')}
                      className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {registrations.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Users className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">No client registrations received yet.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Submissions from ecasiafrica.org/register stream directly here.</p>
                      </div>
                    ) : (
                      registrations.slice(0, 4).map((reg) => (
                        <div
                          key={reg.id}
                          onClick={() => setSelectedReg(reg)}
                          className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800 truncate">
                                {reg.title} {reg.firstName} {reg.lastName}
                              </span>
                              <span className="text-xs text-slate-500 font-medium truncate hidden sm:inline">
                                • {reg.organisation}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {reg.eventTitle}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                reg.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : reg.status === 'Approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {reg.status}
                            </span>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {reg.venue.split(',')[0]}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Showing top recent submissions</span>
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(true)}
                    className="font-bold text-[#032e42] hover:text-[#008000] inline-flex items-center gap-1"
                  >
                    <span>+ Add Manual Entry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 2: REGISTRATIONS MANAGER TABLE
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by delegate name, organization, course title, or reference..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/10 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 overflow-x-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#008000]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approved / Invoiced</option>
                    <option value="Confirmed">Confirmed / Paid</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={filterVenue}
                    onChange={(e) => setFilterVenue(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#008000]"
                  >
                    <option value="All">All Venues</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Online">Online / Virtual</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('All');
                      setFilterVenue('All');
                      setFilterPayment('All');
                    }}
                    title="Reset filters"
                    className="h-10 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition text-xs font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Registrations Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Mobile Horizontal Scroll Indicator Banner */}
              <div className="md:hidden bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#008000]" />
                  <span>Scroll left &amp; right to view all registration details</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">&larr; swipe &rarr;</span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                      <th className="py-3.5 px-4">Ref &amp; Date</th>
                      <th className="py-3.5 px-4">Delegate / Participant</th>
                      <th className="py-3.5 px-4">Organization &amp; Country</th>
                      <th className="py-3.5 px-4">Course Programme</th>
                      <th className="py-3.5 px-4">Venue &amp; Mode</th>
                      <th className="py-3.5 px-4 text-center">Delegates</th>
                      <th className="py-3.5 px-4">Fee (USD)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] z-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm font-semibold">No course registrations match your search filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                            <div>{r.referenceNo}</div>
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900">
                              {r.title} {r.firstName} {r.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500">{r.officialEmail || r.personalEmail}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 line-clamp-1">{r.organisation}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{r.jobTitle} • {r.country}</div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-[#032e42] line-clamp-2 leading-snug">
                              {r.eventTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Schedule #{r.scheduleId}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-medium text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#008000]" />
                              <span>{r.venue}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{r.format}</div>
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {r.participantsCount || 1}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-[#032e42]">
                            ${(r.totalFee || 0).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={r.status}
                              onChange={(e) => handleQuickStatusChange(r.id, e.target.value)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                                r.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : r.status === 'Approved'
                                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : r.status === 'Completed'
                                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                                  : r.status === 'Cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] z-10">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedReg(r)}
                                title="View delegate dossier"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#032e42] hover:bg-slate-100 transition cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReg(r);
                                  setTimeout(() => window.print(), 300);
                                }}
                                title="Print admission slip"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#008000] hover:bg-emerald-50 transition cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteRegistration(r.id, r.referenceNo)}
                                title="Delete registration"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  Showing <strong>{filteredRegistrations.length}</strong> of <strong>{registrations.length}</strong> total registrations
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adminRegistrationService.downloadCSV()}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 3: WORLD-CLASS COURSE MANAGEMENT, PRICING & COHORT HUB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'courses' && (
          <div className="space-y-5">
            {/* Action & Stats Banner */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#032e42]">
                    ECAS Executive Course Catalog
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {courses.length} Accredited Courses Total
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    {departmentsList.length - 1} Academic Departments
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Search, filter, update tuition fees, configure promotional discounts, and schedule cohort intake dates for all {courses.length} courses across Kenya (Nairobi, Mombasa, Naivasha), Rwanda (Kigali), UAE (Dubai), Malaysia (Kuala Lumpur), and Online.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full xl:w-auto">
                <button
                  type="button"
                  onClick={exportCoursesCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
                  title="Export complete 213 courses catalog to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Catalog (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Upload New Course</span>
                </button>

                <a
                  href="/institute-overview"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold transition shadow-sm"
                  title="Open live public course finder in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Finder</span>
                </a>
              </div>
            </div>

            {/* World-Class Filter System Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Row 1: Search Bar & Primary Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Instant Search Input */}
                <div className="relative md:col-span-5">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses by title, slug, code, or keyword..."
                    className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15"
                  />
                  {courseSearch && (
                    <button
                      type="button"
                      onClick={() => setCourseSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Department Selector */}
                <div className="md:col-span-4">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#008000] cursor-pointer"
                  >
                    {departmentsList.map((dept) => {
                      const count = dept === 'All Departments' ? courses.length : (categoryCounts[dept] || 0);
                      return (
                        <option key={dept} value={dept}>
                          {dept} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Duration Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#008000] cursor-pointer"
                  >
                    {durationList.map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Secondary Controls, Sorting, View Toggle, and Results Count */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                {/* Secondary Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Pricing Status */}
                  <select
                    value={selectedPricing}
                    onChange={(e) => setSelectedPricing(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008000] cursor-pointer"
                  >
                    <option value="All">All Pricing Types</option>
                    <option value="Discounted">Promotional / Discounted Only</option>
                    <option value="Standard">Standard Tuition Only</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={courseSortBy}
                    onChange={(e) => setCourseSortBy(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008000] cursor-pointer"
                  >
                    <option value="title-asc">Sort: Title (A &rarr; Z)</option>
                    <option value="title-desc">Sort: Title (Z &rarr; A)</option>
                    <option value="fee-high">Sort: Tuition (High to Low)</option>
                    <option value="fee-low">Sort: Tuition (Low to High)</option>
                    <option value="category">Sort: Department</option>
                  </select>

                  {/* Per Page */}
                  <select
                    value={coursesPerPage}
                    onChange={(e) => setCoursesPerPage(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008000] cursor-pointer"
                  >
                    <option value="15">15 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                    <option value="all">Show All ({filteredAndSortedCourses.length})</option>
                  </select>

                  {/* Clear Filters Button (Shows when any filter is active) */}
                  {(courseSearch || selectedDepartment !== 'All Departments' || selectedDuration !== 'All Durations' || selectedPricing !== 'All') && (
                    <button
                      type="button"
                      onClick={() => {
                        setCourseSearch('');
                        setSelectedDepartment('All Departments');
                        setSelectedDuration('All Durations');
                        setSelectedPricing('All');
                      }}
                      className="h-9 px-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

                {/* View Mode & Results Count */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-slate-500 font-medium">
                    Showing <strong>{totalFilteredCourses > 0 ? (courseCurrentPage - 1) * (coursesPerPage === 'all' ? totalFilteredCourses : Number(coursesPerPage)) + 1 : 0}</strong> - <strong>{coursesPerPage === 'all' ? totalFilteredCourses : Math.min(courseCurrentPage * Number(coursesPerPage), totalFilteredCourses)}</strong> of <strong>{totalFilteredCourses}</strong> courses
                  </span>

                  {/* View Mode Toggle */}
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setCourseViewMode('table')}
                      title="Table View (Data Grid)"
                      className={`p-1.5 rounded-md transition cursor-pointer ${
                        courseViewMode === 'table' ? 'bg-white text-[#032e42] shadow-sm font-bold' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseViewMode('grid')}
                      title="Grid Cards View"
                      className={`p-1.5 rounded-md transition cursor-pointer ${
                        courseViewMode === 'grid' ? 'bg-white text-[#032e42] shadow-sm font-bold' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Display: Table View OR Grid View */}
            {totalFilteredCourses === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold text-slate-800 text-sm">No courses matched your search criteria</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Try adjusting your search terms or reset the department filter to &quot;All Departments&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCourseSearch('');
                    setSelectedDepartment('All Departments');
                    setSelectedDuration('All Durations');
                    setSelectedPricing('All');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : courseViewMode === 'table' ? (
              /* ── TABLE VIEW ── */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Mobile Horizontal Scroll Indicator Banner */}
                <div className="md:hidden bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#008000]" />
                    <span>Scroll horizontally to view all courses, pricing &amp; actions</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">&larr; swipe &rarr;</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs min-w-[950px] sm:min-w-[1050px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                        <th className="py-3 px-3.5 text-center w-12">#</th>
                        <th className="py-3 px-4 min-w-[260px]">Course Programme &amp; Slug</th>
                        <th className="py-3 px-4 min-w-[200px]">Academic Department</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Duration</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Standard Fee</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">Promotion</th>
                        <th className="py-3 px-4 min-w-[180px]">Upcoming Cohorts</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] z-10">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedCourses.map((c, idx) => {
                        const rowNumber = coursesPerPage === 'all' ? idx + 1 : (courseCurrentPage - 1) * Number(coursesPerPage) + idx + 1;
                        const feeNum = Number(String(c.fee || 1200).replace(/[^0-9]/g, '')) || 1200;
                        const feeKes = c.feeKes || (feeNum * 130);
                        const hasDiscount = Boolean(c.discountPercent && c.discountPercent > 0);
                        const discountPrice = c.discountPrice || Math.round(feeNum * (1 - (c.discountPercent || 0) / 100));

                        const displayCohorts = Array.isArray(c.customCohorts) && c.customCohorts.length > 0
                          ? c.customCohorts
                          : ['16 - 27 March 2026', '13 - 24 April 2026', '18 - 29 May 2026'];

                        return (
                          <tr key={c.slug} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                              {rowNumber}
                            </td>

                            <td className="py-3 px-4">
                              <a
                                href={`/executive-training/${c.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-[#032e42] hover:text-[#008000] transition line-clamp-2 leading-snug"
                              >
                                {c.title}
                              </a>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                /{c.slug}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="inline-block text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 leading-snug">
                                {c.category || 'Executive Training'}
                              </span>
                            </td>

                            <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-600">
                              {c.duration || '5 Days'}
                            </td>

                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className={`font-black text-sm ${hasDiscount ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                ${feeNum.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                KES {feeKes.toLocaleString()}
                              </div>
                            </td>

                            <td className="py-3 px-3.5 whitespace-nowrap">
                              {hasDiscount ? (
                                <div>
                                  <span className="font-black text-emerald-700 text-sm block">
                                    ${discountPrice.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    {c.discountPercent}% OFF
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-normal">
                                  Standard
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {displayCohorts.slice(0, 2).map((d, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded whitespace-nowrap"
                                  >
                                    {d}
                                  </span>
                                ))}
                                {displayCohorts.length > 2 && (
                                  <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                                    +{displayCohorts.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] z-10">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditCourse(c)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-[11px] font-bold transition shadow-sm cursor-pointer"
                                  title="Edit Pricing, Discounts & Cohort Dates"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                <a
                                  href={`/executive-training/${c.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#008000] hover:bg-emerald-50 transition cursor-pointer"
                                  title="View Public Page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCourse(c.slug, c.title)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title="Delete Course"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
            ) : (
              /* ── GRID CARDS VIEW ── */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedCourses.map((c) => {
                  const feeNum = Number(String(c.fee || 1200).replace(/[^0-9]/g, '')) || 1200;
                  const feeKes = c.feeKes || (feeNum * 130);
                  const hasDiscount = Boolean(c.discountPercent && c.discountPercent > 0);
                  const discountPrice = c.discountPrice || Math.round(feeNum * (1 - (c.discountPercent || 0) / 100));

                  const displayCohorts = Array.isArray(c.customCohorts) && c.customCohorts.length > 0
                    ? c.customCohorts
                    : ['16 - 27 March 2026', '13 - 24 April 2026', '18 - 29 May 2026'];

                  return (
                    <div
                      key={c.slug}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-[#008000]/60 transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Category & Duration Tag */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 line-clamp-1">
                            {c.category || 'Executive Training'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                            {c.duration || '5 Days'}
                          </span>
                        </div>

                        {/* Course Title */}
                        <h4 className="font-bold text-sm text-[#032e42] leading-snug line-clamp-2 mb-2.5">
                          {c.title}
                        </h4>

                        {/* Tuition Pricing & Discount Banner */}
                        <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Tuition Fee
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className={`font-black text-sm ${hasDiscount ? 'line-through text-slate-400' : 'text-[#032e42]'}`}>
                                ${feeNum.toLocaleString()}
                              </span>
                              {hasDiscount && (
                                <span className="font-black text-emerald-700 text-sm">
                                  ${discountPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {hasDiscount ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                              {c.discountPercent}% OFF
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              KES {feeKes.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Scheduled Cohort Dates */}
                        <div className="mb-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Scheduled 2026 Cohorts ({displayCohorts.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {displayCohorts.slice(0, 3).map((d, dIdx) => (
                              <span
                                key={dIdx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                              >
                                {d}
                              </span>
                            ))}
                            {displayCohorts.length > 3 && (
                              <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                                +{displayCohorts.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCourse(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Pricing &amp; Dates</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <a
                            href={`/executive-training/${c.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#008000] hover:bg-emerald-50 transition"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(c.slug, c.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalCoursePages > 1 && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Page <strong>{courseCurrentPage}</strong> of <strong>{totalCoursePages}</strong> ({totalFilteredCourses} courses total)
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={courseCurrentPage === 1}
                    onClick={() => setCourseCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalCoursePages }, (_, idx) => idx + 1)
                    .filter((page) => page === 1 || page === totalCoursePages || Math.abs(page - courseCurrentPage) <= 2)
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      return (
                        <React.Fragment key={page}>
                          {prevPage && page - prevPage > 1 && (
                            <span className="px-1 text-slate-400">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCourseCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${
                              courseCurrentPage === page
                                ? 'bg-[#032e42] text-white'
                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    type="button"
                    disabled={courseCurrentPage === totalCoursePages}
                    onClick={() => setCourseCurrentPage((p) => Math.min(totalCoursePages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: VIEW REGISTRATION DOSSIER & PRINT VOUCHER
      ───────────────────────────────────────────────────────────── */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="bg-[#032e42] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Admission Dossier • {selectedReg.referenceNo}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedReg.title} {selectedReg.firstName} {selectedReg.lastName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Print Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Status & Payment Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-500 font-semibold">Enrolment Status:</span>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full font-bold ${
                      selectedReg.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedReg.status === 'Approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedReg.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Total Invoice:</span>
                  <span className="ml-2 font-extrabold text-[#032e42] text-sm">
                    ${(selectedReg.totalFee || 0).toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Course & Timing */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
                  Course &amp; Cohort Logistics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Course Title</span>
                    <strong className="text-slate-800">{selectedReg.eventTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Schedule Reference</span>
                    <span className="font-mono text-slate-800 font-semibold">#{selectedReg.scheduleId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Training Venue</span>
                    <strong className="text-slate-800">{selectedReg.venue}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration &amp; Mode</span>
                    <span className="text-slate-800 font-medium">{selectedReg.durationText} ({selectedReg.format})</span>
                  </div>
                </div>
              </div>

              {/* Delegate Details */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
                  Participant Contact &amp; Organization
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Official Email</span>
                    <span className="text-slate-800 font-medium">{selectedReg.officialEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone / WhatsApp</span>
                    <span className="text-slate-800 font-medium">
                      {selectedReg.dialCode} {selectedReg.phoneNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Organization</span>
                    <strong className="text-slate-800">{selectedReg.organisation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Job Designation</span>
                    <span className="text-slate-800 font-medium">{selectedReg.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Country</span>
                    <span className="text-slate-800 font-medium">{selectedReg.country}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Participants Count</span>
                    <strong className="text-slate-800">{selectedReg.participantsCount || 1} Delegate(s)</strong>
                  </div>
                </div>
              </div>

              {/* Accommodation & Hospitality */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
                  Hospitality &amp; Travel Preferences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5 text-[#008000]" />
                      <span>Accommodation</span>
                    </span>
                    <strong className="text-slate-800 mt-1 block">{selectedReg.needAccommodation || 'No'}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-[#008000]" />
                      <span>Airport Transfer</span>
                    </span>
                    <strong className="text-slate-800 mt-1 block">{selectedReg.needAirportTransfer || 'No'}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#008000]" />
                      <span>Safari / Tour</span>
                    </span>
                    <strong className="text-slate-800 mt-1 block">{selectedReg.needSafariTour || 'No'}</strong>
                  </div>
                </div>
              </div>

              {/* Sponsoring Authority & Invoicing */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
                  Billing &amp; Approvals
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Invoice Directed To</span>
                    <span className="text-slate-800 font-medium">{selectedReg.invoiceTo || 'Self'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Approving Authority</span>
                    <span className="text-slate-800 font-medium">
                      {selectedReg.approvingAuthorityName || 'Direct'}{' '}
                      {selectedReg.approvingAuthorityEmail ? `(${selectedReg.approvingAuthorityEmail})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-1.5">
                  Internal Administrative Notes
                </h4>
                <textarea
                  rows={2}
                  defaultValue={selectedReg.adminNotes || ''}
                  onBlur={(e) => {
                    adminRegistrationService.updateRegistration(selectedReg.id, { adminNotes: e.target.value });
                    loadData();
                  }}
                  placeholder="Add notes about payment status, visa assistance, hotel vouchers..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#008000]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteRegistration(selectedReg.id, selectedReg.referenceNo)}
                className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
              >
                Delete Record
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#008000] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Admission Dossier
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: ADD NEW MANUAL REGISTRATION
      ───────────────────────────────────────────────────────────── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-[#032e42] p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">New Manual Course Registration</h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualRegistration} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Title</label>
                  <select
                    value={newRegData.title}
                    onChange={(e) => setNewRegData({ ...newRegData, title: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Eng.">Eng.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newRegData.firstName}
                    onChange={(e) => setNewRegData({ ...newRegData, firstName: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newRegData.lastName}
                    onChange={(e) => setNewRegData({ ...newRegData, lastName: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newRegData.officialEmail}
                    onChange={(e) => setNewRegData({ ...newRegData, officialEmail: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newRegData.phoneNumber}
                    onChange={(e) => setNewRegData({ ...newRegData, phoneNumber: e.target.value })}
                    placeholder="+254 7..."
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Organization</label>
                  <input
                    type="text"
                    value={newRegData.organisation}
                    onChange={(e) => setNewRegData({ ...newRegData, organisation: e.target.value })}
                    placeholder="e.g. Ministry of Finance"
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Country</label>
                  <input
                    type="text"
                    value={newRegData.country}
                    onChange={(e) => setNewRegData({ ...newRegData, country: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Course Title</label>
                <input
                  type="text"
                  value={newRegData.eventTitle}
                  onChange={(e) => setNewRegData({ ...newRegData, eventTitle: e.target.value })}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Venue</label>
                  <select
                    value={newRegData.venue}
                    onChange={(e) => setNewRegData({ ...newRegData, venue: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Nairobi, Kenya">Nairobi, Kenya</option>
                    <option value="Mombasa, Kenya">Mombasa, Kenya</option>
                    <option value="Kigali, Rwanda">Kigali, Rwanda</option>
                    <option value="Dubai, UAE">Dubai, UAE</option>
                    <option value="Kuala Lumpur, Malaysia">Kuala Lumpur, Malaysia</option>
                    <option value="Online / Virtual">Online / Virtual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Participants</label>
                  <input
                    type="number"
                    min={1}
                    value={newRegData.participantsCount}
                    onChange={(e) => {
                      const count = Number(e.target.value) || 1;
                      setNewRegData({
                        ...newRegData,
                        participantsCount: count,
                        totalFee: count * 1200,
                      });
                    }}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Total Fee ($)</label>
                  <input
                    type="number"
                    value={newRegData.totalFee}
                    onChange={(e) => setNewRegData({ ...newRegData, totalFee: Number(e.target.value) || 0 })}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold shadow"
                >
                  Save Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL: EDIT COURSE PRICING, DISCOUNTS & COHORT DATES
      ════════════════════════════════════════════════════════════ */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#032e42] p-5 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Course Management &bull; {editingCourse.category || 'Executive Training'}
                </span>
                <h3 className="text-base font-black leading-snug mt-1">
                  {editingCourse.title}
                </h3>
                <p className="text-xs text-white/70 font-mono mt-0.5">
                  Slug: {editingCourse.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCourseEdit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Tuition Fees (USD & KES) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Standard Tuition Fee ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editForm.feeUsd}
                      onChange={(e) => {
                        const usd = Number(e.target.value) || 0;
                        const disc = editForm.discountPercent ? Math.round(usd * (1 - editForm.discountPercent / 100)) : usd;
                        setEditForm({
                          ...editForm,
                          feeUsd: usd,
                          feeKes: usd * 130,
                          discountPrice: disc
                        });
                      }}
                      className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#008000] text-sm font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tuition Fee (KES / Local)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">KES</span>
                    <input
                      type="number"
                      value={editForm.feeKes}
                      onChange={(e) => setEditForm({ ...editForm, feeKes: Number(e.target.value) || 0 })}
                      className="w-full h-10 pl-11 pr-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#008000] text-sm font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Promotional Discount & Promo Price */}
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Promotional Early-Bird / Corporate Discount</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Live on website</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editForm.discountPercent}
                      onChange={(e) => {
                        const pct = Number(e.target.value) || 0;
                        const disc = Math.round(editForm.feeUsd * (1 - pct / 100));
                        setEditForm({
                          ...editForm,
                          discountPercent: pct,
                          discountPrice: disc
                        });
                      }}
                      placeholder="e.g. 15 for 15% off"
                      className="w-full h-9 px-3 rounded-lg border border-emerald-300 bg-white font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Discounted Price ($ USD)</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.discountPrice}
                      onChange={(e) => {
                        const disc = Number(e.target.value) || 0;
                        const pct = editForm.feeUsd > 0 ? Math.round((1 - disc / editForm.feeUsd) * 100) : 0;
                        setEditForm({
                          ...editForm,
                          discountPrice: disc,
                          discountPercent: Math.max(0, pct)
                        });
                      }}
                      className="w-full h-9 px-3 rounded-lg border border-emerald-300 bg-white font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* Upcoming Cohort Training Dates Hub (Mobile-Optimized & Multi-Mode) */}
              <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#008000]" />
                      <span>Upcoming Cohort Training Dates (2026 Calendar)</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Manage cohorts via visual calendar date picker, 1-click 2026 presets, or custom text.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    {editForm.customCohorts.length} Active
                  </span>
                </div>

                {/* Scheduled Cohort Dates Chips List */}
                {editForm.customCohorts.length === 0 ? (
                  <div className="p-3 text-center bg-white rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                    No intake dates scheduled yet. Use the calendar picker or 2026 presets below to add dates.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {editForm.customCohorts.map((dateStr, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:border-slate-300 transition"
                      >
                        <span className="font-semibold text-slate-800 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#008000] shrink-0" />
                          {dateStr}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCohortDate(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                          title="Remove cohort date"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Method 1: Visual Date Range Picker (Mobile Friendly) */}
                <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 block">
                    Option 1: Pick Start &amp; End Date from Calendar
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Start Date</label>
                      <input
                        type="date"
                        value={cohortStartDate}
                        onChange={(e) => setCohortStartDate(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">End Date</label>
                      <input
                        type="date"
                        value={cohortEndDate}
                        min={cohortStartDate || undefined}
                        onChange={(e) => setCohortEndDate(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddCohortDateFromPicker}
                        disabled={!cohortStartDate}
                        className={`w-full h-9 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                          cohortStartDate
                            ? 'bg-[#008000] hover:bg-[#006600] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        title="Add Date from Calendar"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Method 2: 1-Click 2026 Intake Presets */}
                  <div className="pt-1.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                      Option 2: 1-Click 2026 Cohort Presets
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_2026_COHORTS.map((preset) => {
                        const isAdded = editForm.customCohorts.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddPresetCohort(preset)}
                            disabled={isAdded}
                            className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 opacity-60 cursor-default'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 shadow-2xs'
                            }`}
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{preset.split(' ')[0]} - {preset.split(' ')[2]} {preset.split(' ')[3]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Method 3: Custom Text / Modular Entry */}
                  <div className="pt-1.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Option 3: Custom Date Format or Modular Schedule
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newCohortDateInput}
                        onChange={(e) => setNewCohortDateInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCohortDate();
                          }
                        }}
                        placeholder="e.g. Modular: 17 - 28 August 2026"
                        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008000]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCohortDate}
                        className="h-9 px-4 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Date</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold transition shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Pricing &amp; Dates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL: UPLOAD NEW COURSE / TRAINING
      ════════════════════════════════════════════════════════════ */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="bg-[#032e42] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  ECAS Institute Catalog
                </span>
                <h3 className="text-base font-black leading-snug mt-0.5">
                  Upload New Executive Training Course
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCourseModalOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCourse} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                  placeholder="e.g. AI-Powered Public Financial Management & Ethical Leadership"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#008000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department / Category</label>
                  <select
                    value={newCourseForm.category}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-[#008000]"
                  >
                    {departmentsList.filter((c) => c !== 'All Departments').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Course Duration</label>
                  <select
                    value={newCourseForm.duration}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, duration: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-[#008000]"
                  >
                    <option value="5 Days">5 Days (1 Week Intensive)</option>
                    <option value="10 Days">10 Days (2 Weeks Comprehensive)</option>
                    <option value="3 Days">3 Days (Executive Masterclass)</option>
                    <option value="4 Weeks">4 Weeks (Modular Evening &amp; Weekend)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tuition Fee ($ USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCourseForm.feeUsd}
                    onChange={(e) => {
                      const usd = Number(e.target.value) || 0;
                      setNewCourseForm({
                        ...newCourseForm,
                        feeUsd: usd,
                        feeKes: usd * 130,
                        discountPrice: Math.round(usd * (1 - newCourseForm.discountPercent / 100))
                      });
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newCourseForm.discountPercent}
                    onChange={(e) => {
                      const pct = Number(e.target.value) || 0;
                      setNewCourseForm({
                        ...newCourseForm,
                        discountPercent: pct,
                        discountPrice: Math.round(newCourseForm.feeUsd * (1 - pct / 100))
                      });
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Promo Fee ($)</label>
                  <input
                    type="number"
                    readOnly
                    value={newCourseForm.discountPrice}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold">
                    Upcoming Cohort Dates (Comma separated)
                  </label>
                  <span className="text-[10px] text-slate-400">Type or 1-click add chips below</span>
                </div>
                <input
                  type="text"
                  value={newCourseForm.cohortsText}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, cohortsText: e.target.value })}
                  placeholder="e.g. 16 - 27 March 2026, 13 - 24 April 2026, 18 - 29 May 2026"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#008000]"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick 2026 Add:</span>
                  {QUICK_2026_COHORTS.map((preset) => {
                    const currentCohorts = newCourseForm.cohortsText
                      ? newCourseForm.cohortsText.split(',').map((s) => s.trim()).filter(Boolean)
                      : [];
                    const isAdded = currentCohorts.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (!isAdded) {
                            const updated = currentCohorts.length > 0 ? `${newCourseForm.cohortsText}, ${preset}` : preset;
                            setNewCourseForm({ ...newCourseForm, cohortsText: updated });
                          }
                        }}
                        disabled={isAdded}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-0.5 ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800 opacity-60 cursor-default'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200'
                        }`}
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{preset.split(' ')[2]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Delivery Venues</label>
                <input
                  type="text"
                  value={newCourseForm.venues}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, venues: e.target.value })}
                  placeholder="Nairobi, Mombasa, Kigali, Dubai, Kuala Lumpur, Online"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#008000]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Course Overview &amp; Objective</label>
                <textarea
                  rows={2}
                  value={newCourseForm.summary}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, summary: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#008000]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Curriculum Outline Modules</label>
                <textarea
                  rows={3}
                  value={newCourseForm.contentModules}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, contentModules: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#008000] font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold transition shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Publish to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          FLOATING TOAST NOTIFICATION
      ════════════════════════════════════════════════════════════ */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#032e42] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#00c853] shrink-0" />
          <span className="text-xs font-semibold leading-snug">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-white/60 hover:text-white ml-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

