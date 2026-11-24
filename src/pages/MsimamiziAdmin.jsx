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
  Image as ImageIcon,
  Upload,
  MessageSquare,
  Briefcase,
  Building2,
  Paperclip,
  Eye,
  TrendingUp,
  Bell,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { adminRegistrationService } from '@/services/adminRegistrationService';
import { dataService } from '@/lib/dataService';
import TurnstileWidget from '@/components/TurnstileWidget';
import { verifyTurnstile } from '@/services/turnstileService';
import { printRegistrationVoucher } from '@/utils/printRegistrationVoucher';
import CourseRegistrationForm from '@/components/CourseRegistrationForm';
import SEO from '@/components/SEO';

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
  const [authError, setAuthError] = useState('');
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

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

  // Active Tab: 'dashboard' | 'registrations' | 'inquiries' | 'courses' | 'vacancies' (Persisted across refreshes & URL synced)
  const getInitialTab = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get('tab');
      if (urlTab && ['dashboard', 'registrations', 'inquiries', 'courses', 'vacancies'].includes(urlTab)) {
        return urlTab;
      }
      const hashTab = window.location.hash.replace('#', '');
      if (hashTab && ['dashboard', 'registrations', 'inquiries', 'courses', 'vacancies'].includes(hashTab)) {
        return hashTab;
      }
      const savedTab = localStorage.getItem('msimamizi_active_tab');
      if (savedTab && ['dashboard', 'registrations', 'inquiries', 'courses', 'vacancies'].includes(savedTab)) {
        return savedTab;
      }
    } catch {
      // Fallback
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const mainScrollRef = useRef(null);

  const scrollMainTop = () => {
    if (mainScrollRef.current && typeof mainScrollRef.current.scrollTo === 'function') {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setEditingCourse(null);
    setIsNewCourseModalOpen(false);
    setSelectedReg(null);
    setIsNewModalOpen(false);
    setSelectedApplication(null);
    setIsVacancyFormOpen(false);
    scrollMainTop();
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
  const [inquiries, setInquiries] = useState(() => adminRegistrationService.getInquiries());
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryChannelFilter, setInquiryChannelFilter] = useState('All');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('All');
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

  // Selected registration for details / voucher view
  const [selectedReg, setSelectedReg] = useState(null);

  // New Manual Registration page state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // KPI stats
  const [kpis, setKpis] = useState(adminRegistrationService.getKPIs());

  // Dynamic Courses Management State (Accredited Programs from DataService)
  const [courses, setCourses] = useState(() => dataService.getCoursesList());
  const [vacancies, setVacancies] = useState(() => {
    const list = dataService.getVacancies();
    return Array.isArray(list) ? list : [];
  });
  const [applications, setApplications] = useState(() => adminRegistrationService.getApplications());
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [isVacancyFormOpen, setIsVacancyFormOpen] = useState(false);
  const [vacancyForm, setVacancyForm] = useState({
    title: '',
    department: 'Research & Executive Training',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    deadline: '',
    description: '',
    requirements: '',
    status: 'Open',
  });
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

  // Compress uploaded local image file via HTML5 Canvas so it fits in localStorage & server sync
  const handleImageFileUpload = (file, onResult) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 840;
        const maxH = 560;
        let width = img.width;
        let height = img.height;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        onResult(compressedDataUrl);
        showToast('Course image uploaded from your computer! Click Save to publish.');
      };
      img.onerror = () => {
        alert('Could not read the selected image file.');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Course Editing Modal State
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    image: '/images/Gallery/training_workshop_session.jpg',
    summary: '',
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
    image: '/images/Gallery/training_workshop_session.jpg',
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

  // Load registrations, inquiries, vacancies, applications & listen for real-time updates
  const loadData = () => {
    const list = adminRegistrationService.getRegistrations();
    const inqList = adminRegistrationService.getInquiries();
    const vacList = dataService.getVacancies();
    const appList = adminRegistrationService.getApplications();
    setRegistrations(list);
    setInquiries(inqList);
    setVacancies(Array.isArray(vacList) ? vacList : []);
    setApplications(Array.isArray(appList) ? appList : []);
    setKpis(adminRegistrationService.getKPIs());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('ecasi_registration_updated', handleUpdate);
    window.addEventListener('ecasi_inquiry_updated', handleUpdate);
    window.addEventListener('ecasi_vacancies_updated', handleUpdate);
    window.addEventListener('ecasi_applications_updated', handleUpdate);
    return () => {
      window.removeEventListener('ecasi_registration_updated', handleUpdate);
      window.removeEventListener('ecasi_inquiry_updated', handleUpdate);
      window.removeEventListener('ecasi_vacancies_updated', handleUpdate);
      window.removeEventListener('ecasi_applications_updated', handleUpdate);
    };
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

  // Open Edit Course Page with current image, details, pricing & cohorts
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

    closeDetailViews();
    setEditingCourse(course);
    setEditForm({
      title: course.title || '',
      image: course.image || '/images/Gallery/training_workshop_session.jpg',
      summary: course.summary || '',
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
    scrollMainTop();
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

  // Save Course Edit (Image, Title, Summary, Tuition, Discount, Cohort Dates)
  const handleSaveCourseEdit = (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    const success = dataService.updateCoursePricing(editingCourse.slug, {
      title: editForm.title || editingCourse.title,
      category: editForm.category || editingCourse.category,
      duration: editForm.duration || editingCourse.duration,
      image: editForm.image || editingCourse.image || '/images/Gallery/training_workshop_session.jpg',
      summary: editForm.summary || editingCourse.summary,
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
      showToast(`Successfully updated image, course details, pricing & cohorts for "${editForm.title || editingCourse.title}"! Changes are now live on the public site.`);
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

    const parsedModules = String(newCourseForm.contentModules || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newCourseObj = {
      title: newCourseForm.title.trim(),
      slug: generatedSlug,
      image: (newCourseForm.image || '/images/Gallery/training_workshop_session.jpg').trim(),
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
      content: parsedModules.length > 0 ? parsedModules : [newCourseForm.contentModules],
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
        image: '/images/Gallery/training_workshop_session.jpg',
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

  const closeDetailViews = () => {
    setEditingCourse(null);
    setIsNewCourseModalOpen(false);
    setSelectedReg(null);
    setIsNewModalOpen(false);
    setSelectedApplication(null);
    setIsVacancyFormOpen(false);
  };

  const openNewCoursePage = () => {
    closeDetailViews();
    setIsNewCourseModalOpen(true);
    scrollMainTop();
  };

  const openNewRegistrationPage = () => {
    closeDetailViews();
    setIsNewModalOpen(true);
    scrollMainTop();
  };

  const openRegistrationDossierPage = (reg) => {
    closeDetailViews();
    setSelectedReg(reg);
    scrollMainTop();
  };

  const openApplicationDossierPage = (app) => {
    closeDetailViews();
    setSelectedApplication(app);
    scrollMainTop();
  };

  const activeDetailView =
    editingCourse ? 'edit-course' :
    isNewCourseModalOpen ? 'new-course' :
    selectedReg ? 'registration-dossier' :
    isNewModalOpen ? 'new-registration' :
    selectedApplication ? 'application-dossier' :
    isVacancyFormOpen ? 'vacancy-form' :
    null;

  const renderBackBar = (label, onBack) => (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => {
          onBack();
          scrollMainTop();
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#032e42] hover:text-[#008000] font-bold text-xs shadow-2xs transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{label}</span>
      </button>
    </div>
  );

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const domToken = e.currentTarget?.querySelector?.('input[name="cf-turnstile-response"]')?.value || '';
    const effectiveToken = turnstileToken || domToken;

    if (!turnstileVerified && !effectiveToken) {
      setAuthError('Please complete the Cloudflare Turnstile security verification.');
      return;
    }

    if (effectiveToken) {
      try {
        const check = await verifyTurnstile(effectiveToken, 'login');
        if (check && check.success === false) {
          setAuthError(check.error || 'Security verification failed. Please retry.');
          return;
        }
      } catch (err) {
        console.warn('[Cloudflare Turnstile Login Verification]:', err);
      }
    }

    const result = await adminRegistrationService.login(authEmail, authPassword);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      loadData();
    } else {
      setAuthError(result.message || 'Invalid administrative credentials');
    }
  };

  // Handle First-Time Administrator Password Creation
  const handleCreatePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (createPassword !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify both fields.');
      return;
    }

    const domToken = e.currentTarget?.querySelector?.('input[name="cf-turnstile-response"]')?.value || '';
    const effectiveToken = turnstileToken || domToken;

    if (!turnstileVerified && !effectiveToken) {
      setAuthError('Please complete the Cloudflare Turnstile security verification.');
      return;
    }

    if (effectiveToken) {
      try {
        const check = await verifyTurnstile(effectiveToken, 'create_admin');
        if (check && check.success === false) {
          setAuthError(check.error || 'Security verification failed. Please retry.');
          return;
        }
      } catch (err) {
        console.warn('[Cloudflare Turnstile Admin Creation Verification]:', err);
      }
    }

    const result = await adminRegistrationService.registerAdmin(createEmail, createPassword);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      loadData();
      showToast('Administrator credentials created successfully! Welcome to Msimamizi.');
    } else {
      setAuthError(result.message);
    }
  };

  // Handle Logout & Session Expiry
  const handleLogout = (expiredByIdle = false) => {
    adminRegistrationService.logout();
    setIsAuthenticated(false);
    setAuthPassword('');
    setTurnstileVerified(false);
    setTurnstileToken('');
    if (expiredByIdle) {
      setAuthError('Your session has ended. Please sign in again to continue.');
    }
  };

  // Silent idle timeout monitor & server session enforcement
  useEffect(() => {
    if (!isAuthenticated) return;

    adminRegistrationService.touchSessionActivity();
    let lastTouchAt = Date.now();
    let lastVerifyAt = Date.now();

    const enforceOrTouchActivity = () => {
      if (adminRegistrationService.isSessionIdleExpired()) {
        handleLogout(true);
        return;
      }
      const now = Date.now();
      if (now - lastTouchAt >= 4000) {
        adminRegistrationService.touchSessionActivity();
        lastTouchAt = now;
      }
    };

    const handleVisibilityOrFocus = () => {
      if (adminRegistrationService.isSessionIdleExpired()) {
        handleLogout(true);
        return;
      }
      adminRegistrationService.verifyServerSession();
    };

    const handleInvalidated = () => {
      handleLogout(true);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, enforceOrTouchActivity, { passive: true }));
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('ecasi_session_invalidated', handleInvalidated);

    const intervalId = window.setInterval(() => {
      if (adminRegistrationService.isSessionIdleExpired()) {
        handleLogout(true);
        return;
      }
      const now = Date.now();
      if (now - lastVerifyAt >= 15000) {
        lastVerifyAt = now;
        adminRegistrationService.verifyServerSession();
      }
    }, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, enforceOrTouchActivity));
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('ecasi_session_invalidated', handleInvalidated);
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

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

  // Filtered Inquiries (WhatsApp, Email, Calendar, In-House)
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (inquirySearch.trim()) {
        const q = inquirySearch.toLowerCase();
        const sender = (inq.fullName || inq.senderName || '').toLowerCase();
        const org = (inq.organisation || '').toLowerCase();
        const course = (inq.courseTitle || '').toLowerCase();
        const email = (inq.email || inq.senderEmail || '').toLowerCase();
        const phone = (inq.phone || inq.senderPhone || '').toLowerCase();
        const ref = (inq.referenceNo || '').toLowerCase();
        if (
          !sender.includes(q) &&
          !org.includes(q) &&
          !course.includes(q) &&
          !email.includes(q) &&
          !phone.includes(q) &&
          !ref.includes(q)
        ) {
          return false;
        }
      }
      if (inquiryChannelFilter !== 'All' && (inq.channel || '').toLowerCase() !== inquiryChannelFilter.toLowerCase()) {
        return false;
      }
      if (inquiryStatusFilter !== 'All' && (inq.status || 'New') !== inquiryStatusFilter) {
        return false;
      }
      return true;
    });
  }, [inquiries, inquirySearch, inquiryChannelFilter, inquiryStatusFilter]);

  const handleUpdateInquiryStatus = (id, status) => {
    adminRegistrationService.updateInquiry(id, { status });
    loadData();
    setToastMessage(`Inquiry status updated to ${status}.`);
  };

  const handleDeleteInquiry = (id, refNo) => {
    if (window.confirm(`Are you sure you want to delete inquiry ${refNo}?`)) {
      adminRegistrationService.deleteInquiry(id);
      loadData();
      setToastMessage(`Inquiry ${refNo} deleted.`);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (applicationStatusFilter !== 'All' && (app.status || 'New') !== applicationStatusFilter) {
        return false;
      }
      if (applicationSearch.trim()) {
        const q = applicationSearch.toLowerCase().trim();
        const hay = `${app.referenceNo || ''} ${app.fullName || ''} ${app.email || ''} ${app.phone || ''} ${app.jobTitle || ''} ${app.specialty || ''} ${app.cvFileName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [applications, applicationSearch, applicationStatusFilter]);

  const resetVacancyForm = () => {
    setEditingVacancy(null);
    setVacancyForm({
      title: '',
      department: 'Research & Executive Training',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      deadline: '',
      description: '',
      requirements: '',
      status: 'Open',
    });
  };

  const openCreateVacancy = () => {
    closeDetailViews();
    resetVacancyForm();
    setIsVacancyFormOpen(true);
    scrollMainTop();
  };

  const openEditVacancy = (vac) => {
    closeDetailViews();
    setEditingVacancy(vac);
    setVacancyForm({
      title: vac.title || '',
      department: vac.department || 'Research & Executive Training',
      location: vac.location || 'Nairobi, Kenya',
      type: vac.type || 'Full-time',
      deadline: vac.deadline || '',
      description: vac.description || '',
      requirements: vac.requirements || '',
      status: vac.status === 'Closed' ? 'Closed' : 'Open',
    });
    setIsVacancyFormOpen(true);
    scrollMainTop();
  };

  const handleSaveVacancy = (e) => {
    e.preventDefault();
    if (!vacancyForm.title.trim()) {
      alert('Please enter a vacancy position title.');
      return;
    }
    const saved = dataService.saveVacancy({
      ...vacancyForm,
      id: editingVacancy?.id,
      createdAt: editingVacancy?.createdAt,
    });
    if (saved) {
      loadData();
      setIsVacancyFormOpen(false);
      resetVacancyForm();
      showToast(`Vacancy "${saved.title}" saved and synced live to ecasiafrica.org/vacancies.`);
    }
  };

  const handleToggleVacancyStatus = (vac) => {
    dataService.toggleVacancyStatus(vac.id);
    loadData();
    showToast(`Vacancy "${vac.title}" marked as ${vac.status === 'Closed' ? 'Open' : 'Closed'}.`);
  };

  const handleDeleteVacancy = (vac) => {
    if (window.confirm(`Delete vacancy "${vac.title}" from the website and portal?`)) {
      dataService.deleteVacancy(vac.id);
      loadData();
      showToast(`Vacancy "${vac.title}" removed.`);
    }
  };

  const handleUpdateApplicationStatus = (id, status) => {
    adminRegistrationService.updateApplication(id, { status });
    loadData();
    showToast(`Application status updated to ${status}.`);
  };

  const handleDeleteApplication = (id, refNo) => {
    if (window.confirm(`Delete candidate CV submission ${refNo}?`)) {
      adminRegistrationService.deleteApplication(id);
      loadData();
      showToast(`Application ${refNo} deleted.`);
    }
  };

  const handleDownloadAttachment = (dataUrl, fileName, fallbackName = 'Attachment.pdf') => {
    if (!dataUrl) {
      alert('No file payload attached to this record.');
      return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName || fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCV = (app) =>
    handleDownloadAttachment(
      app?.cvDataUrl,
      app?.cvFileName,
      `CV_${app?.fullName || app?.referenceNo || 'Candidate'}.pdf`
    );

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

  // Add Manual Registration (Submitted from shared ECAS Course Registration Form)
  const handleCreateManualRegistration = (submissionRecord) => {
    if (!submissionRecord?.firstName || !submissionRecord?.lastName || (!submissionRecord?.personalEmail && !submissionRecord?.officialEmail)) {
      alert('Please fill in required fields (First Name, Last Name, Email).');
      return;
    }
    const created = adminRegistrationService.addRegistration(submissionRecord);
    if (created) {
      setIsNewModalOpen(false);
      loadData();
      scrollMainTop();
      showToast(`Registration ${created.referenceNo} saved successfully!`);
    }
  };

  // Brief MakaziFlow-inspired Msimamizi initial loading splash
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialLoader(false), 320);
    return () => window.clearTimeout(timer);
  }, []);

  // Dashboard Analytics Data (Computed live from portal records)
  const venueAnalyticsData = useMemo(() => {
    const map = {};
    registrations.forEach((r) => {
      const key = (r.venue || 'Nairobi, Kenya').split(',')[0].trim() || 'Nairobi';
      if (!map[key]) {
        map[key] = { name: key, revenueUSD: 0, bookings: 0 };
      }
      map[key].revenueUSD += Number(r.totalFee) || 0;
      map[key].bookings += 1;
    });
    const list = Object.values(map).sort((a, b) => b.revenueUSD - a.revenueUSD);
    if (list.length > 0) return list.slice(0, 7);
    return [
      { name: 'Nairobi', revenueUSD: 0, bookings: 0 },
      { name: 'Mombasa', revenueUSD: 0, bookings: 0 },
      { name: 'Diani', revenueUSD: 0, bookings: 0 },
      { name: 'Zanzibar', revenueUSD: 0, bookings: 0 },
      { name: 'Dubai', revenueUSD: 0, bookings: 0 },
    ];
  }, [registrations]);

  const statusDistributionData = useMemo(() => {
    const counts = { Confirmed: 0, Approved: 0, Pending: 0, Completed: 0 };
    registrations.forEach((r) => {
      const st = r.status || 'Pending';
      if (st in counts) {
        counts[st] += 1;
      } else {
        counts.Pending += 1;
      }
    });
    const palette = [
      { name: 'Confirmed', value: counts.Confirmed, color: '#00a99d' },
      { name: 'Approved', value: counts.Approved, color: '#0d2240' },
      { name: 'Pending', value: counts.Pending, color: '#f59e0b' },
      { name: 'Completed', value: counts.Completed, color: '#008000' },
    ];
    return palette.filter((item) => item.value > 0);
  }, [registrations]);

  const monthlyActivityData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        registrations: 0,
        inquiries: 0,
        applications: 0,
      });
    }
    const bucket = Object.fromEntries(months.map((m) => [m.key, m]));
    const assign = (items, field) => {
      items.forEach((item) => {
        const dt = item?.submittedAt ? new Date(item.submittedAt) : null;
        if (!dt || Number.isNaN(dt.getTime())) return;
        const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        if (bucket[k]) bucket[k][field] += 1;
      });
    };
    assign(registrations, 'registrations');
    assign(inquiries, 'inquiries');
    assign(applications, 'applications');
    return months;
  }, [registrations, inquiries, applications]);

  const initialLoaderOverlay = showInitialLoader ? (
    <div className="fixed inset-0 z-[99999] bg-white flex items-center justify-center font-['Inter',sans-serif] text-[13px] transition-opacity duration-300">
      <div className="min-w-[260px] text-[#212529] text-center border border-slate-200 rounded-xl shadow-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 gap-6">
          <div className="font-['Outfit',sans-serif] text-[24px] font-bold text-[#0d2240] tracking-tight flex items-center">
            ECAS<span className="text-[#00a99d]">.Msimamizi</span>
          </div>
          <svg
            className="animate-spin w-7 h-7"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <path
              fill="#e7e7e7"
              d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"
            />
            <path
              fill="#00a99d"
              d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0C22.32,8.481,24.301,9.057,26.013,10.047z"
            />
          </svg>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-200 text-slate-500 text-xs">
          Please Wait. Loading...
        </div>
      </div>
    </div>
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LOGIN SCREEN (If not authenticated)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08172e] flex items-center justify-center p-4 font-['Inter',sans-serif] selection:bg-[#00a99d] selection:text-white">
        {initialLoaderOverlay}
        <SEO
          title="ECAS Msimamizi Admin Portal"
          description="ECAS Institute administrative portal."
          noIndex
        />
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${authMode === 'login'
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${authMode === 'create'
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
              </div>

              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-[#008000] shrink-0" />
                <span>Security: Single active session enforced. Sign-in is required for each visit.</span>
              </div>

              <div className="pt-1 flex justify-center">
                <TurnstileWidget
                  action="login"
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setTurnstileVerified(true);
                    setAuthError('');
                  }}
                  onError={(_errCode, fallbackToken) => {
                    setTurnstileToken(fallbackToken || `dev-turnstile-fallback-${Date.now()}`);
                    setTurnstileVerified(true);
                    setAuthError('');
                  }}
                  onExpire={() => {
                    setTurnstileToken('');
                    setTurnstileVerified(false);
                  }}
                />
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

              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-[#008000] shrink-0" />
                <span>Security: Single active session enforced per administrator account.</span>
              </div>

              <div className="pt-1 flex justify-center">
                <TurnstileWidget
                  action="create_admin"
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setTurnstileVerified(true);
                    setAuthError('');
                  }}
                  onError={(_errCode, fallbackToken) => {
                    setTurnstileToken(fallbackToken || `dev-turnstile-fallback-${Date.now()}`);
                    setTurnstileVerified(true);
                    setAuthError('');
                  }}
                  onExpire={() => {
                    setTurnstileToken('');
                    setTurnstileVerified(false);
                  }}
                />
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
  // 2. MAIN MSIMAMIZI ADMIN PORTAL INTERFACE (MAKAZIFLOW-INSPIRED LAYOUT)
  // ─────────────────────────────────────────────────────────────────────────────
  const openVacanciesCount = vacancies.filter((v) => v.status !== 'Closed').length;
  const attentionTotalCount =
    (kpis.pendingCount || 0) +
    (kpis.newInquiriesCount || 0) +
    (kpis.newApplicationsCount || 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d2240] font-['Inter',sans-serif] selection:bg-[#00a99d] selection:text-white flex flex-col md:flex-row">
      {initialLoaderOverlay}
      <SEO
        title="ECAS Msimamizi Admin Portal"
        description="ECAS Institute administrative portal."
        noIndex
      />
      {/* ─────────────────────────────────────────────────────────────
          LEFT VERTICAL SIDEBAR (SLIM DARK NAVY RAIL, MINIMIZABLE TO HAMBURGER)
      ───────────────────────────────────────────────────────────── */}
      <aside className={`w-full md:w-56 bg-[#08172e] text-white flex-shrink-0 flex-col justify-between border-r border-white/10 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-40 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'flex' : 'hidden'
      } ${
        isSidebarCollapsed ? 'md:hidden' : 'md:flex'
      }`}>
        {/* Top Branding & Navigation */}
        <div className="flex flex-col">
          {/* Header Brand */}
          <div className="relative border-b border-white/10 px-4 py-5 flex flex-col items-center text-center">
            {/* Desktop Minimize-to-Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="hidden md:flex absolute top-3 right-3 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Minimize navigation to hamburger"
              aria-label="Minimize navigation to hamburger"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile Nav Close */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center mb-2">
              <img src="/logo.png" alt="ECAS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="font-['Outfit',sans-serif] font-bold text-base tracking-tight text-white">
              ECAS<span className="text-[#00a99d]">.Msimamizi</span>
            </div>
            <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-[#00a99d]/15 border border-[#00a99d]/35 text-[#00a99d] text-[9px] font-bold uppercase tracking-widest">
              Administration
            </span>
          </div>

          {/* Navigation Items (Strictly Navigation, Quick Actions live on Dashboard) */}
          <div className="px-2.5 py-4 space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-wider text-white/35 uppercase mb-2">
              Platform Modules
            </p>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white/10 text-white border-l-2 border-[#00a99d] rounded-l-none'
                    : 'text-slate-300/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Compass className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-[#00a99d]' : 'text-slate-400'}`} />
                  <span>Overview</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('registrations');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
                  activeTab === 'registrations'
                    ? 'bg-white/10 text-white border-l-2 border-[#00a99d] rounded-l-none'
                    : 'text-slate-300/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 shrink-0 ${activeTab === 'registrations' ? 'text-[#00a99d]' : 'text-slate-400'}`} />
                  <span>Registrations</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'registrations' ? 'bg-[#00a99d] text-white' : 'bg-white/10 text-white/75'
                }`}>
                  {registrations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiries');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
                  activeTab === 'inquiries'
                    ? 'bg-white/10 text-white border-l-2 border-[#00a99d] rounded-l-none'
                    : 'text-slate-300/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === 'inquiries' ? 'text-[#00a99d]' : 'text-slate-400'}`} />
                  <span>Inquiries &amp; Leads</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'inquiries' ? 'bg-[#00a99d] text-white' : 'bg-white/10 text-white/75'
                }`}>
                  {inquiries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('courses');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-white/10 text-white border-l-2 border-[#00a99d] rounded-l-none'
                    : 'text-slate-300/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <GraduationCap className={`w-4 h-4 shrink-0 ${activeTab === 'courses' ? 'text-[#00a99d]' : 'text-slate-400'}`} />
                  <span>Courses &amp; Fees</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'courses' ? 'bg-[#00a99d] text-white' : 'bg-white/10 text-white/75'
                }`}>
                  {courses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('vacancies');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
                  activeTab === 'vacancies'
                    ? 'bg-white/10 text-white border-l-2 border-[#00a99d] rounded-l-none'
                    : 'text-slate-300/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Briefcase className={`w-4 h-4 shrink-0 ${activeTab === 'vacancies' ? 'text-[#00a99d]' : 'text-slate-400'}`} />
                  <span>Vacancies &amp; CVs</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'vacancies' ? 'bg-[#00a99d] text-white' : 'bg-white/10 text-white/75'
                }`}>
                  {applications.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="border-t border-white/10 bg-[#061124] px-3 py-3 space-y-2.5">
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/75 hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3 text-[#00a99d]" />
              <span>ecasiafrica.org</span>
            </span>
            <ArrowUpRight className="w-3 h-3 text-white/40" />
          </a>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-2 min-w-0" title={`${currentUser?.role || 'Administrator'} (${currentUser?.email || 'admin@ecasiafrica.org'})`}>
              <div className="w-7 h-7 rounded-full bg-[#00a99d] flex items-center justify-center text-white font-bold text-[10px] shrink-0 uppercase">
                {currentUser?.email ? currentUser.email.substring(0, 2) : 'AD'}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">{currentUser?.role || 'Administrator'}</p>
                <p className="text-[10px] text-white/50 truncate font-mono">{currentUser?.email || 'admin@ecasiafrica.org'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLogout(false)}
              title="Logout from Msimamizi"
              className="p-1.5 rounded-lg text-red-300 hover:text-white hover:bg-red-900/40 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT MAIN CONTENT AREA
      ───────────────────────────────────────────────────────────── */}
      <div ref={mainScrollRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top White Utility Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[#0d2240] hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Desktop Hamburger Toggle (Minimize / Expand Sidebar) */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[#0d2240] hover:bg-slate-50 transition cursor-pointer"
              title={isSidebarCollapsed ? "Open navigation menu" : "Minimize navigation to hamburger"}
              aria-label={isSidebarCollapsed ? "Open navigation menu" : "Minimize navigation to hamburger"}
            >
              <Menu className="w-4 h-4" />
              {isSidebarCollapsed && (
                <span className="text-[11px] font-semibold">Menu</span>
              )}
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/70 text-[#0d2240] text-xs font-semibold truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00a99d] shrink-0" />
              <span className="truncate">
                {activeDetailView === 'edit-course' && 'Edit Course & Pricing'}
                {activeDetailView === 'new-course' && 'Upload New Course'}
                {activeDetailView === 'registration-dossier' && 'Registration Dossier'}
                {activeDetailView === 'new-registration' && 'Course Registration Form'}
                {activeDetailView === 'application-dossier' && 'Candidate Dossier'}
                {activeDetailView === 'vacancy-form' && (editingVacancy ? 'Edit Job Vacancy' : 'Publish Job Vacancy')}
                {!activeDetailView && activeTab === 'dashboard' && 'Overview'}
                {!activeDetailView && activeTab === 'registrations' && 'Registrations'}
                {!activeDetailView && activeTab === 'inquiries' && 'Inquiries & Leads'}
                {!activeDetailView && activeTab === 'courses' && 'Courses & Fees'}
                {!activeDetailView && activeTab === 'vacancies' && 'Vacancies & CVs'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00a99d]" />
              <span>{currentUser?.role || 'Administrator'}</span>
            </span>

            <button
              type="button"
              onClick={() => {
                loadData();
                setToastMessage('Data refreshed from live database.');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
              title="Sync / Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogout(false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Centered SaaS Content Body */}
        <main className="p-4 sm:p-6 lg:px-8 lg:py-6 space-y-5 flex-1 max-w-[1180px] w-full mx-auto">
          {!activeDetailView && (
            <>
          {/* ════════════════════════════════════════════════════════════
            TAB 1: PLATFORM OVERVIEW DASHBOARD (MAKAZIFLOW LAYOUT)
        ════════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Row 1: Dashboard Heading + Quick Action Strip */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h1 className="font-['Outfit',sans-serif] text-xl sm:text-2xl font-bold text-[#0d2240] tracking-tight">
                    Platform Overview Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time visibility across ECAS registrations, catalog programmes, client inquiries, and career vacancies.
                  </p>
                </div>

                {/* Dashboard Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openNewRegistrationPage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a99d] hover:bg-[#008e84] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Registration</span>
                  </button>
                  <button
                    type="button"
                    onClick={openNewCoursePage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d2240] hover:bg-[#163460] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Course</span>
                  </button>
                  <button
                    type="button"
                    onClick={openCreateVacancy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0d2240] text-xs font-semibold transition cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#00a99d]" />
                    <span>Post Vacancy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => adminRegistrationService.downloadCSV()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Attention Needed Alert Box */}
              <div className="bg-amber-50/75 border border-amber-200/90 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d2240]">
                    <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Attention Needed ({attentionTotalCount})</span>
                  </div>
                  <span className="text-[11px] font-medium text-amber-800/80">
                    Quick operational alerts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('Pending');
                      setActiveTab('registrations');
                    }}
                    className="text-left bg-white hover:bg-amber-50/40 border border-amber-200/80 rounded-lg px-3.5 py-2.5 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0d2240] truncate">
                        {kpis.pendingCount} Pending Registration{kpis.pendingCount === 1 ? '' : 's'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Require proforma invoice dispatch or admission confirmation
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('inquiries')}
                    className="text-left bg-white hover:bg-amber-50/40 border border-amber-200/80 rounded-lg px-3.5 py-2.5 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0d2240] truncate">
                        {kpis.newInquiriesCount || 0} Unread Course Inquir{(kpis.newInquiriesCount || 0) === 1 ? 'y' : 'ies'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        WhatsApp &amp; Email follow-ups logged from website forms
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('vacancies')}
                    className="text-left bg-white hover:bg-amber-50/40 border border-amber-200/80 rounded-lg px-3.5 py-2.5 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0d2240] truncate">
                        {kpis.newApplicationsCount || 0} New Candidate CV{(kpis.newApplicationsCount || 0) === 1 ? '' : 's'} Received
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {openVacanciesCount} active job openings synced live to website
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className="text-left bg-white hover:bg-amber-50/40 border border-amber-200/80 rounded-lg px-3.5 py-2.5 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0d2240] truncate">
                        {courses.length} Accredited Courses Synchronized
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Manage 2026 cohort dates, fees, and course cover imagery
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Row 3: 8 Crisp KPI Metric Cards (2 Rows × 4 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Registrations
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-[#0d2240]/5 text-[#0d2240] flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    {kpis.totalRegistrations}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {kpis.totalDelegates} total delegates booked
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Confirmed Enrolments
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-[#00a99d]/10 text-[#00a99d] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    {kpis.confirmedCount}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {kpis.approvedCount} approved / invoiced
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pending Review
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    {kpis.pendingCount}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Awaiting LPO or confirmation
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Enrolment Value (USD)
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#008000] flex items-center justify-center shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    ${kpis.totalRevenueUSD.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#00a99d] font-medium mt-1">
                    Paid: ${(kpis.paidRevenueUSD || 0).toLocaleString()} USD
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Catalog Courses
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-[#0d2240]/5 text-[#0d2240] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    {courses.length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Active training programmes
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Inquiries &amp; Leads
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-[#00a99d]/10 text-[#00a99d] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    {kpis.totalInquiries || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    WA: {kpis.whatsappInquiriesCount || 0} • Email: {kpis.emailInquiriesCount || 0}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active Vacancies
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-[#0d2240] flex items-center justify-center shrink-0">
                      <Briefcase className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    {openVacanciesCount}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {vacancies.length} total posted positions
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] hover:border-[#00a99d]/40 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Candidate CVs
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#008000] flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2240] mt-2">
                    {applications.length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {kpis.shortlistedApplicationsCount || 0} shortlisted for interview
                  </p>
                </div>
              </div>

              {/* Row 4: 2-Column Analytics Charts (Venue Bar Chart + Status Donut Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(13,34,64,0.03)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-['Outfit',sans-serif] text-sm font-bold text-[#0d2240]">
                        Enrolment Value Analytics (By Venue)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Total registration value across training destinations (USD)
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00a99d]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#00a99d]" />
                      <span>Fee Value (USD)</span>
                    </span>
                  </div>

                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={venueAnalyticsData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(13,34,64,0.08)',
                          }}
                          formatter={(val) => [`$${Number(val).toLocaleString()} USD`, 'Total Value']}
                        />
                        <Bar dataKey="revenueUSD" fill="#00a99d" radius={[6, 6, 0, 0]} maxBarSize={44} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(13,34,64,0.03)] flex flex-col justify-between">
                  <div>
                    <h3 className="font-['Outfit',sans-serif] text-sm font-bold text-[#0d2240]">
                      Admission Status Mix
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Current distribution across all bookings
                    </p>
                  </div>

                  {statusDistributionData.length === 0 ? (
                    <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                      <div className="w-24 h-24 rounded-full border-[12px] border-slate-100 mb-2" />
                      <p className="text-xs font-medium text-slate-500">No registration statuses yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <PieChart>
                            <Pie
                              data={statusDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={72}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {statusDistributionData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                fontSize: '12px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        {statusDistributionData.map((entry) => (
                          <span key={entry.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name} ({entry.value})</span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Row 5: Full-Width Platform Activity Trend Chart */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(13,34,64,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-['Outfit',sans-serif] text-sm font-bold text-[#0d2240] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#00a99d]" />
                      <span>Enrolment &amp; Inquiry Growth (Last 6 Months)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Monthly intake volume across registrations, website inquiries, and job applications
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00a99d]" />
                      <span>Registrations</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0d2240]" />
                      <span>Inquiries</span>
                    </span>
                  </div>
                </div>

                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={monthlyActivityData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ecasiTealFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00a99d" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#00a99d" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(13,34,64,0.08)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="registrations"
                        name="Registrations"
                        stroke="#00a99d"
                        strokeWidth={2}
                        fill="url(#ecasiTealFill)"
                      />
                      <Area
                        type="monotone"
                        dataKey="inquiries"
                        name="Inquiries"
                        stroke="#0d2240"
                        strokeWidth={2}
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 6: 3-Column Bottom Feeds (Inquiries | Registrations | Candidate CVs) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Feed 1: Recent Inquiries */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] flex flex-col">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <h3 className="font-['Outfit',sans-serif] text-xs font-bold uppercase tracking-wider text-[#0d2240] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00a99d]" />
                      <span>Recent Inquiries</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('inquiries')}
                      className="text-[11px] font-semibold text-[#00a99d] hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {inquiries.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No WhatsApp or Email inquiries yet.
                      </div>
                    ) : (
                      inquiries.slice(0, 6).map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => setActiveTab('inquiries')}
                          className="py-2.5 flex items-start justify-between gap-2 hover:bg-slate-50 px-1.5 rounded-lg transition cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#0d2240] truncate">
                              {inq.fullName || inq.senderName || 'Prospective Delegate'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {inq.courseTitle || inq.inquiryType}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            inq.channel === 'WhatsApp'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {inq.channel || 'Inquiry'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Feed 2: Recent Registrations */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] flex flex-col">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <h3 className="font-['Outfit',sans-serif] text-xs font-bold uppercase tracking-wider text-[#0d2240] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#00a99d]" />
                      <span>Recent Registrations</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('registrations')}
                      className="text-[11px] font-semibold text-[#00a99d] hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {registrations.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No course registrations received yet.
                      </div>
                    ) : (
                      registrations.slice(0, 6).map((reg) => (
                        <div
                          key={reg.id}
                          onClick={() => openRegistrationDossierPage(reg)}
                          className="py-2.5 flex items-start justify-between gap-2 hover:bg-slate-50 px-1.5 rounded-lg transition cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#0d2240] truncate">
                              {reg.title} {reg.firstName} {reg.lastName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {reg.eventTitle}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] font-bold text-[#0d2240]">
                              ${(reg.totalFee || 0).toLocaleString()}
                            </p>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              reg.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : reg.status === 'Approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {reg.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Feed 3: New Candidate CVs */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(13,34,64,0.03)] flex flex-col">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <h3 className="font-['Outfit',sans-serif] text-xs font-bold uppercase tracking-wider text-[#0d2240] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#00a99d]" />
                      <span>Career Submissions</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vacancies')}
                      className="text-[11px] font-semibold text-[#00a99d] hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {applications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No candidate CVs submitted yet.
                      </div>
                    ) : (
                      applications.slice(0, 6).map((app) => (
                        <div
                          key={app.id}
                          onClick={() => openApplicationDossierPage(app)}
                          className="py-2.5 flex items-start justify-between gap-2 hover:bg-slate-50 px-1.5 rounded-lg transition cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#0d2240] truncate">
                              {app.fullName || 'Candidate'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {app.jobTitle || 'Role Application'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#0d2240] text-[10px] font-semibold shrink-0">
                            {app.status || 'New'}
                          </span>
                        </div>
                      ))
                    )}
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
                      <option value="Diani">Diani</option>
                      <option value="Zanzibar">Zanzibar</option>
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
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${r.status === 'Confirmed'
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
                                  onClick={() => openRegistrationDossierPage(r)}
                                  title="View delegate dossier"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#032e42] hover:bg-slate-100 transition cursor-pointer"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    openRegistrationDossierPage(r);
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
                    Search, filter, update tuition fees, configure promotional discounts, and schedule cohort intake dates for all {courses.length} courses across Kenya (Nairobi, Mombasa, Diani, Naivasha), Tanzania (Zanzibar, Arusha), Rwanda (Kigali), UAE (Dubai), Malaysia (Kuala Lumpur), and Online.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full xl:w-auto">
                  <button
                    type="button"
                    onClick={exportCoursesCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
                    title={`Export complete ${courses.length} courses catalog to CSV`}
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export Catalog (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={openNewCoursePage}
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
                        className={`p-1.5 rounded-md transition cursor-pointer ${courseViewMode === 'table' ? 'bg-white text-[#032e42] shadow-sm font-bold' : 'text-slate-400 hover:text-slate-700'
                          }`}
                      >
                        <LayoutList className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseViewMode('grid')}
                        title="Grid Cards View"
                        className={`p-1.5 rounded-md transition cursor-pointer ${courseViewMode === 'grid' ? 'bg-white text-[#032e42] shadow-sm font-bold' : 'text-slate-400 hover:text-slate-700'
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
                    <table className="w-full text-left border-collapse text-xs min-w-[1050px] sm:min-w-[1150px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                          <th className="py-3 px-3.5 text-center w-12">#</th>
                          <th className="py-3 px-3.5 w-28">Course Image</th>
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
                          const courseImg = c.image || '/images/Gallery/training_workshop_session.jpg';

                          const displayCohorts = Array.isArray(c.customCohorts) && c.customCohorts.length > 0
                            ? c.customCohorts
                            : ['16 - 27 March 2026', '13 - 24 April 2026', '18 - 29 May 2026'];

                          return (
                            <tr key={c.slug} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                                {rowNumber}
                              </td>

                              <td className="py-2.5 px-3.5">
                                <button
                                  type="button"
                                  onClick={() => openEditCourse(c)}
                                  className="group relative w-24 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 block shadow-2xs hover:border-[#008000] transition cursor-pointer"
                                  title="Click to upload course image from computer"
                                >
                                  <img
                                    src={courseImg}
                                    alt={c.title}
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = '/images/Gallery/training_workshop_session.jpg';
                                    }}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <span className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold gap-0.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Edit Image</span>
                                  </span>
                                </button>
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
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition cursor-pointer"
                                    title="Upload Course Image from Computer"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5 text-[#008000]" />
                                    <span>Image</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openEditCourse(c)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-[11px] font-bold transition shadow-sm cursor-pointer"
                                    title="Edit Image, Pricing, Discounts & Cohort Dates"
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
                    const courseImg = c.image || '/images/Gallery/training_workshop_session.jpg';

                    const displayCohorts = Array.isArray(c.customCohorts) && c.customCohorts.length > 0
                      ? c.customCohorts
                      : ['16 - 27 March 2026', '13 - 24 April 2026', '18 - 29 May 2026'];

                    return (
                      <div
                        key={c.slug}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-[#008000]/60 transition flex flex-col justify-between"
                      >
                        <div>
                          {/* Course Featured Image Banner */}
                          <div className="relative h-40 w-full bg-slate-100 overflow-hidden group">
                            <img
                              src={courseImg}
                              alt={c.title}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/Gallery/training_workshop_session.jpg';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                            <button
                              type="button"
                              onClick={() => openEditCourse(c)}
                              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-[#008000] text-white text-[11px] font-bold shadow-md backdrop-blur-xs transition cursor-pointer"
                              title="Upload course image from computer"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Change Image</span>
                            </button>
                          </div>

                          <div className="p-4 pb-0">
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
                        </div>

                        {/* Card Action Buttons */}
                        <div className="px-4 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => openEditCourse(c, false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Course &amp; Image</span>
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
                              className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${courseCurrentPage === page
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

          {/* ───────────────────────────────────────────────────────────
              TAB 4: WHATSAPP & EMAIL INQUIRIES LOG
          ─────────────────────────────────────────────────────────── */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              {/* Filter & Export Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      placeholder="Search by sender name, organization, email, phone, course title, or reference..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#008000]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      value={inquiryChannelFilter}
                      onChange={(e) => setInquiryChannelFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-[#008000]"
                    >
                      <option value="All">All Channels ({inquiries.length})</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                      <option value="Calendar Download">Calendar Download</option>
                    </select>

                    <select
                      value={inquiryStatusFilter}
                      onChange={(e) => setInquiryStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-[#008000]"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Archived">Archived</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => adminRegistrationService.downloadInquiriesCSV()}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#008000]" />
                      <span>Export Inquiries CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Ref &amp; Date</th>
                        <th className="py-3.5 px-4">Channel &amp; Type</th>
                        <th className="py-3.5 px-4">Sender &amp; Contact</th>
                        <th className="py-3.5 px-4">Course &amp; Cohort Details</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Follow-Up Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {filteredInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="font-semibold text-slate-600">No inquiries recorded yet</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              When visitors send an inquiry via WhatsApp or Email on ecasiafrica.org, it will appear here automatically.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredInquiries.map((inq) => {
                          const isWhatsApp = (inq.channel || '').toLowerCase().includes('whatsapp');
                          const isEmail = (inq.channel || '').toLowerCase().includes('email');
                          const senderName = inq.fullName || inq.senderName || 'Prospective Delegate';
                          const senderEmail = inq.email || inq.senderEmail || '';
                          const senderPhone = inq.phone || inq.senderPhone || '';
                          const cleanPhone = senderPhone.replace(/[^0-9]/g, '');
                          const replyWhatsAppUrl = cleanPhone
                            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${senderName}, thank you for your inquiry regarding "${inq.courseTitle}" (${inq.referenceNo}) at ECAS Institute.`
                              )}`
                            : null;
                          const replyEmailUrl = senderEmail
                            ? `mailto:${senderEmail}?subject=${encodeURIComponent(
                                `Re: ECAS Institute Course Inquiry - ${inq.courseTitle} (${inq.referenceNo})`
                              )}&body=${encodeURIComponent(
                                `Dear ${senderName},\n\nThank you for contacting the Environmental Capacities and Sustainability Institute (ECAS) regarding "${inq.courseTitle}".\n\nBest regards,\nTraining Admissions Team\nECAS Institute`
                              )}`
                            : null;

                          return (
                            <tr key={inq.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3.5 px-4 align-top">
                                <span className="font-mono font-bold text-[#032e42] block">
                                  {inq.referenceNo}
                                </span>
                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                  {inq.displayDate || (inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Just now')}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                    isWhatsApp
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : isEmail
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {inq.channel || 'WhatsApp'}
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold block mt-1">
                                  {inq.inquiryType || 'Course Inquiry'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <div className="font-bold text-slate-900">
                                  {senderName}
                                </div>
                                {inq.organisation && (
                                  <div className="text-[11px] text-slate-600 font-medium">
                                    {inq.organisation}
                                  </div>
                                )}
                                {senderEmail && (
                                  <div className="text-[11px] text-blue-700 font-mono mt-0.5">
                                    {senderEmail}
                                  </div>
                                )}
                                {senderPhone && (
                                  <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                                    {senderPhone}
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 align-top max-w-xs">
                                <div className="font-bold text-slate-800 line-clamp-2">
                                  {inq.courseTitle || 'General Programme Inquiry'}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {[inq.cohortDates, inq.venue, inq.format].filter(Boolean).join(' • ')}
                                </div>
                                {inq.participantsCount > 1 && (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                    {inq.participantsCount} Participants
                                  </span>
                                )}
                                {inq.message && (
                                  <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                                    &ldquo;{inq.message}&rdquo;
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <select
                                  value={inq.status || 'New'}
                                  onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                                    (inq.status || 'New') === 'New'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : inq.status === 'Contacted'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : inq.status === 'Converted'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Converted">Converted</option>
                                  <option value="Archived">Archived</option>
                                </select>
                              </td>

                              <td className="py-3.5 px-4 align-top text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {replyWhatsAppUrl && (
                                    <a
                                      href={replyWhatsAppUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => handleUpdateInquiryStatus(inq.id, 'Contacted')}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-emerald-800 font-bold text-[11px] transition"
                                      title="Reply to Delegate on WhatsApp"
                                    >
                                      WhatsApp
                                    </a>
                                  )}
                                  {replyEmailUrl && (
                                    <a
                                      href={replyEmailUrl}
                                      onClick={() => handleUpdateInquiryStatus(inq.id, 'Contacted')}
                                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition"
                                      title="Reply to Delegate via Email"
                                    >
                                      Email
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInquiry(inq.id, inq.referenceNo)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                    title="Delete Inquiry"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 5: VACANCIES & CANDIDATE CV SUBMISSIONS
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'vacancies' && (
            <div className="space-y-6">
              {/* Top Action Header */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-black text-[#032e42]">
                      Vacancies &amp; Candidate CV Recruitment Desk
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {vacancies.filter((v) => v.status !== 'Closed').length} Open / {vacancies.length} Total
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                      {applications.length} CV{applications.length === 1 ? '' : 's'} Received
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Publish or update career openings to sync live to ecasiafrica.org/vacancies, and review or download candidate CVs uploaded online.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={openCreateVacancy}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Post New Vacancy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => adminRegistrationService.downloadApplicationsCSV()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CVs (CSV)</span>
                  </button>

                  <a
                    href="https://ecasiafrica.org/vacancies"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Website Page</span>
                  </a>
                </div>
              </div>

              {/* Published Job Openings List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#032e42]">
                    Managed Job Openings ({vacancies.length})
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Active vacancies appear immediately on ecasiafrica.org/vacancies
                  </span>
                </div>

                {vacancies.length === 0 ? (
                  <div className="p-10 text-center">
                    <Briefcase className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No Vacancies Posted Yet</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Click &ldquo;Post New Vacancy&rdquo; above to publish a role to the ECAS Careers page. Visitors can still submit speculative CVs anytime.
                    </p>
                    <button
                      type="button"
                      onClick={openCreateVacancy}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008000] text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Create First Vacancy
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {vacancies.map((vac) => {
                      const applicantCount = applications.filter(
                        (a) => a.jobId === vac.id || a.jobTitle === vac.title
                      ).length;
                      const isOpen = vac.status !== 'Closed';
                      return (
                        <div key={vac.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isOpen
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isOpen ? 'Open on Website' : 'Closed'}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Building2 className="w-3 h-3" /> {vac.department || 'General'}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#032e42] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                {applicantCount} CV{applicantCount === 1 ? '' : 's'}
                              </span>
                            </div>
                            <h4 className="text-sm font-extrabold text-[#032e42]">{vac.title}</h4>
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {vac.type || 'Full-time'}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {vac.location || 'Nairobi, Kenya'}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Deadline: {vac.deadline || 'Open Until Filled'}</span>
                            </div>
                            {vac.description && (
                              <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">{vac.description}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditVacancy(vac)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleVacancyStatus(vac)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                                isOpen
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {isOpen ? 'Close Role' : 'Reopen Role'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVacancy(vac)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Vacancy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Received Candidate CVs & Job Applications Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/70">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#032e42]">
                      Submitted CVs &amp; Job Applications ({filteredApplications.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Applications and uploaded CV documents submitted from both open vacancies and speculative talent pool.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={applicationSearch}
                        onChange={(e) => setApplicationSearch(e.target.value)}
                        placeholder="Search candidate, email, role..."
                        className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                    <select
                      value={applicationStatusFilter}
                      onChange={(e) => setApplicationStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#008000]"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Hired">Hired</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Ref &amp; Date</th>
                        <th className="py-3.5 px-4">Position Applied</th>
                        <th className="py-3.5 px-4">Candidate Details</th>
                        <th className="py-3.5 px-4">Attached CV &amp; Cover Letter</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="font-bold text-slate-600">No CV submissions recorded yet</p>
                            <p className="text-[11px] mt-0.5">
                              Candidate CVs submitted from ecasiafrica.org/vacancies will appear here automatically.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => {
                          const replySubject = encodeURIComponent(`Regarding Your ECAS Application (${app.referenceNo || ''}): ${app.jobTitle || 'Talent Pool'}`);
                          const sizeKb = app.cvFileSize ? `${Math.max(1, Math.round(app.cvFileSize / 1024))} KB` : '';
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                <span className="font-mono font-bold text-[#032e42] block">
                                  {app.referenceNo || app.id}
                                </span>
                                <span className="text-[11px] text-slate-400">{app.displayDate || 'Recent'}</span>
                              </td>

                              <td className="py-3.5 px-4 align-top max-w-[200px]">
                                <div className="font-bold text-slate-800">{app.jobTitle || 'Speculative Application'}</div>
                                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                  {app.specialty || 'Sustainability & Policy'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <div className="font-extrabold text-slate-900">{app.fullName}</div>
                                {app.nationalId && (
                                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                                    ID/Passport: {app.nationalId}
                                  </div>
                                )}
                                {app.highestQualification && (
                                  <div className="text-[11px] text-[#032e42] font-semibold">
                                    {app.highestQualification}
                                  </div>
                                )}
                                {app.email && (
                                  <div className="text-[11px] text-blue-600 mt-0.5">{app.email}</div>
                                )}
                                {app.phone && (
                                  <div className="text-[11px] text-slate-600 font-mono mt-0.5">{app.phone}</div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 align-top max-w-xs">
                                {app.cvFileName ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
                                      <Paperclip className="w-3 h-3" />
                                      <span className="truncate max-w-[160px]">{app.cvFileName}</span>
                                      {sizeKb && <span className="text-[10px] font-normal text-emerald-700">({sizeKb})</span>}
                                    </span>
                                    {app.cvDataUrl && (
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadCV(app)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#032e42] hover:bg-[#05435e] text-white font-bold text-[11px] cursor-pointer"
                                      >
                                        <Download className="w-3 h-3" /> Download CV
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">No CV attachment</span>
                                )}
                                {app.coverLetter && (
                                  <p className="text-[11px] text-slate-500 italic mt-1.5 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                                    &ldquo;{app.coverLetter}&rdquo;
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <select
                                  value={app.status || 'New'}
                                  onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                                    (app.status || 'New') === 'New'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : app.status === 'Shortlisted'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : app.status === 'Interview'
                                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                                      : app.status === 'Hired'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  <option value="New">New</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Interview">Interview</option>
                                  <option value="Hired">Hired</option>
                                  <option value="Archived">Archived</option>
                                </select>
                              </td>

                              <td className="py-3.5 px-4 align-top text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openApplicationDossierPage(app)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#032e42] hover:text-white text-slate-700 font-bold text-[11px] transition cursor-pointer"
                                    title="View Structured Candidate Application Dossier"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Dossier</span>
                                  </button>
                                  {app.email && (
                                    <a
                                      href={`mailto:${app.email}?subject=${replySubject}`}
                                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition"
                                      title="Email Candidate"
                                    >
                                      Email
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteApplication(app.id, app.referenceNo)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                    title="Delete Application"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
            </div>
          )}
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────
              DEDICATED PAGE: PUBLISH / EDIT JOB VACANCY
          ───────────────────────────────────────────────────────────── */}
          {activeDetailView === 'vacancy-form' && (
            <div className="max-w-4xl mx-auto">
              {renderBackBar('Back to Vacancies & CVs', () => {
                setIsVacancyFormOpen(false);
                resetVacancyForm();
              })}
              <form
                onSubmit={handleSaveVacancy}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs"
              >
                <div className="bg-[#032e42] p-5 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      ECAS Recruitment &amp; Careers Desk
                    </span>
                    <h3 className="text-base font-black flex items-center gap-2 mt-0.5">
                      <Briefcase className="w-4 h-4 text-[#00c853]" />
                      <span>{editingVacancy ? `Edit Vacancy: ${editingVacancy.title}` : 'Publish New Job Vacancy'}</span>
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Job Position Title *</label>
                      <input
                        type="text"
                        required
                        value={vacancyForm.title}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                        placeholder="e.g. Senior Climate Policy & Carbon Markets Researcher"
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department / Unit</label>
                      <input
                        type="text"
                        value={vacancyForm.department}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, department: e.target.value })}
                        placeholder="Research & Executive Training"
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Work Location</label>
                      <input
                        type="text"
                        value={vacancyForm.location}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, location: e.target.value })}
                        placeholder="Nairobi, Kenya (Hybrid)"
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contract Type</label>
                      <select
                        value={vacancyForm.type}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, type: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Consultancy">Consultancy</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship / Fellowship">Internship / Fellowship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Application Deadline</label>
                      <input
                        type="text"
                        value={vacancyForm.deadline}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, deadline: e.target.value })}
                        placeholder="e.g. 30 November 2026"
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Website Visibility</label>
                      <select
                        value={vacancyForm.status}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, status: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#008000]"
                      >
                        <option value="Open">Open (Visible on Website)</option>
                        <option value="Closed">Closed (Hidden on Website)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Role Summary &amp; Responsibilities</label>
                      <textarea
                        rows={5}
                        value={vacancyForm.description}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                        placeholder="Describe the core mandate, key deliverables, and impact of this position..."
                        className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Qualifications &amp; Requirements</label>
                      <textarea
                        rows={5}
                        value={vacancyForm.requirements}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, requirements: e.target.value })}
                        placeholder="List academic background, years of experience, and technical competencies..."
                        className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008000]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVacancyFormOpen(false);
                        resetVacancyForm();
                        scrollMainTop();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingVacancy ? 'Save Changes & Sync' : 'Publish Vacancy to Website'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED PAGE: STRUCTURED CANDIDATE RECRUITMENT DOSSIER
      ───────────────────────────────────────────────────────────── */}
      {selectedApplication && (
        <div className="max-w-5xl mx-auto">
          {renderBackBar('Back to Vacancies & CVs', () => setSelectedApplication(null))}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <div className="bg-[#032e42] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Candidate Application Dossier • {selectedApplication.referenceNo || selectedApplication.id}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedApplication.fullName} — {selectedApplication.jobTitle || 'Speculative Application'}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Personal & Statutory ID Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block">National ID / Passport</span>
                  <strong className="text-slate-800">{selectedApplication.nationalId || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Gender &amp; DOB</span>
                  <strong className="text-slate-800">
                    {[selectedApplication.gender, selectedApplication.dateOfBirth].filter(Boolean).join(' • ') || 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Disability Status</span>
                  <strong className="text-slate-800">{selectedApplication.disabilityStatus || 'No'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <strong className="text-blue-700">{selectedApplication.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <strong className="text-slate-800 font-mono">{selectedApplication.phone || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">County / Address</span>
                  <strong className="text-slate-800">
                    {[selectedApplication.county, selectedApplication.physicalAddress].filter(Boolean).join(' — ') || 'N/A'}
                  </strong>
                </div>
              </div>

              {selectedApplication.careerSummary && (
                <div>
                  <h4 className="font-extrabold text-[#032e42] uppercase tracking-wider mb-1.5">Career Summary</h4>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                    {selectedApplication.careerSummary}
                  </p>
                </div>
              )}

              {/* Academic Qualifications */}
              {Array.isArray(selectedApplication.education) && selectedApplication.education.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[#032e42] uppercase tracking-wider mb-2">
                    Academic Qualifications (Highest: {selectedApplication.highestQualification || 'Specified'})
                  </h4>
                  <div className="space-y-2">
                    {selectedApplication.education.map((edu, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-800">
                            {edu.level ? `${edu.level} — ` : ''}{edu.fieldOfStudy}
                          </div>
                          <div className="text-slate-600">{edu.institution}</div>
                        </div>
                        <div className="text-right font-semibold text-slate-600">
                          {edu.grade && <div>{edu.grade}</div>}
                          {edu.graduationYear && <div className="text-[11px]">{edu.graduationYear}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Membership */}
              {selectedApplication.professionalMemberships?.bodyName && (
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <strong className="text-[#032e42]">Professional Body Membership:</strong>{' '}
                  {selectedApplication.professionalMemberships.bodyName}
                  {selectedApplication.professionalMemberships.membershipNo ? ` (No. ${selectedApplication.professionalMemberships.membershipNo})` : ''} —{' '}
                  {selectedApplication.professionalMemberships.status}
                </div>
              )}

              {/* Work Experience */}
              {Array.isArray(selectedApplication.experience) && selectedApplication.experience.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[#032e42] uppercase tracking-wider mb-2">Work Experience</h4>
                  <div className="space-y-2">
                    {selectedApplication.experience.map((exp, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex flex-wrap justify-between gap-2">
                          <strong className="text-slate-900">{exp.jobTitle} — {exp.employer}</strong>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {exp.startDate || 'Start'} to {exp.current ? 'Present' : (exp.endDate || 'End')}
                          </span>
                        </div>
                        {exp.responsibilities && (
                          <p className="text-slate-600 whitespace-pre-line">{exp.responsibilities}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referees */}
              {Array.isArray(selectedApplication.referees) && selectedApplication.referees.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[#032e42] uppercase tracking-wider mb-2">Referees</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedApplication.referees.map((ref, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">{ref.name}</div>
                        {ref.organisation && <div className="text-slate-600">{ref.organisation}</div>}
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {[ref.phone, ref.email].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statutory Clearances & Cover Note */}
              {Array.isArray(selectedApplication.complianceChecklist) && selectedApplication.complianceChecklist.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-[#032e42] uppercase tracking-wider mb-1.5">
                    Chapter Six / Statutory Documents Declared
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApplication.complianceChecklist.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-extrabold text-[#032e42] uppercase tracking-wider mb-1.5">Cover Letter</h4>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}

              {/* Attached Documents Download Row */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedApplication.cvDataUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownloadCV(selectedApplication)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download CV ({selectedApplication.cvFileName || 'CV'})</span>
                    </button>
                  )}
                  {selectedApplication.certDataUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadAttachment(
                          selectedApplication.certDataUrl,
                          selectedApplication.certFileName,
                          `Certificates_${selectedApplication.fullName || 'Candidate'}.pdf`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#032e42] hover:bg-[#05435e] text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Certificates ({selectedApplication.certFileName})</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedApplication(null);
                    scrollMainTop();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Back to Vacancies &amp; CVs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED PAGE: VIEW REGISTRATION DOSSIER & PRINT VOUCHER
      ───────────────────────────────────────────────────────────── */}
      {selectedReg && (
        <div className="max-w-5xl mx-auto">
          {renderBackBar('Back to Registrations', () => setSelectedReg(null))}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <div className="bg-[#032e42] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Admission Dossier • {selectedReg.referenceNo}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedReg.title} {selectedReg.firstName} {selectedReg.middleName ? `${selectedReg.middleName} ` : ''}{selectedReg.lastName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printRegistrationVoucher(selectedReg)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#008000] hover:bg-[#006600] text-white font-bold text-xs transition cursor-pointer"
                  title="Print Official Registration Voucher"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Status & Payment Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-500 font-semibold">Enrolment Status:</span>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full font-bold ${selectedReg.status === 'Confirmed'
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
                    <span className="text-slate-400 block">Personal Email</span>
                    <span className="text-slate-800 font-medium">{selectedReg.personalEmail || 'N/A'}</span>
                  </div>
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
                    <span className="text-slate-800 font-medium">{selectedReg.jobTitle || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Country</span>
                    <span className="text-slate-800 font-medium">{selectedReg.country}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Participants Count</span>
                    <strong className="text-slate-800">{selectedReg.participantsCount || 1} Delegate(s)</strong>
                  </div>
                  {selectedReg.hearAboutUs && (
                    <div>
                      <span className="text-slate-400 block">Referral Source</span>
                      <span className="text-slate-800 font-medium">{selectedReg.hearAboutUs}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedReg.currentDuties || selectedReg.trainingExpectations || selectedReg.tailorMadeRequirements) && (
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
                    Learning Profile &amp; Tailor-Made Requirements
                  </h4>
                  <div className="space-y-2.5">
                    {selectedReg.currentDuties && (
                      <div>
                        <span className="text-slate-400 block">Current Duties</span>
                        <p className="text-slate-800 whitespace-pre-line">{selectedReg.currentDuties}</p>
                      </div>
                    )}
                    {selectedReg.trainingExpectations && (
                      <div>
                        <span className="text-slate-400 block">Training Expectations</span>
                        <p className="text-slate-800 whitespace-pre-line">{selectedReg.trainingExpectations}</p>
                      </div>
                    )}
                    {selectedReg.tailorMadeRequirements && (
                      <div>
                        <span className="text-slate-400 block">Tailor-made Requirements</span>
                        <p className="text-slate-800 whitespace-pre-line">{selectedReg.tailorMadeRequirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  onClick={() => printRegistrationVoucher(selectedReg)}
                  className="px-4 py-2 rounded-xl bg-[#008000] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Voucher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReg(null);
                    scrollMainTop();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  Back to Registrations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED PAGE: ADD NEW MANUAL REGISTRATION (FULL ECAS REGISTRATION FORM)
      ───────────────────────────────────────────────────────────── */}
      {isNewModalOpen && (
        <div className="max-w-4xl mx-auto">
          {renderBackBar('Back to Registrations', () => setIsNewModalOpen(false))}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <div className="bg-[#032e42] p-5 sm:p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  ECAS Course Admissions Desk
                </span>
                <h3 className="text-lg font-bold mt-0.5">Course Registration Form</h3>
                <p className="text-xs text-white/75 mt-0.5">
                  Please enter delegate information in the form below to process registration for an ECAS course.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <CourseRegistrationForm
                mode="admin"
                courses={courses}
                cohortPresets={QUICK_2026_COHORTS}
                onSubmitRegistration={handleCreateManualRegistration}
                onBack={() => {
                  setIsNewModalOpen(false);
                  scrollMainTop();
                }}
                backLabel="Back to Registrations"
                submitLabel="Complete Registration"
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          DEDICATED PAGE: EDIT COURSE IMAGE, DETAILS, PRICING & COHORT DATES
      ════════════════════════════════════════════════════════════ */}
      {editingCourse && (
        <div className="max-w-5xl mx-auto">
          {renderBackBar('Back to Courses Catalog', () => setEditingCourse(null))}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#032e42] p-5 sm:p-6 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Course &amp; Image Management &bull; {editForm.category || editingCourse.category || 'Executive Training'}
                </span>
                <h3 className="text-lg font-black leading-snug mt-1">
                  {editForm.title || editingCourse.title}
                </h3>
                <p className="text-xs text-white/70 font-mono mt-0.5">
                  Slug: /{editingCourse.slug}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCourseEdit} className="p-5 sm:p-7 space-y-5 text-xs">
              {/* Course Featured Image Editor (Upload ONLY from Local Computer / Device) */}
              <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#008000]" />
                    <span>Course Featured Image (Shown on ecasiafrica.org)</span>
                  </label>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Upload an image directly from your computer or local device storage (JPG, PNG, WEBP).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 items-center">
                  {/* Live Image Preview */}
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 shrink-0 relative shadow-xs">
                    <img
                      src={editForm.image || '/images/Gallery/training_workshop_session.jpg'}
                      alt={editForm.title || editingCourse.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/Gallery/training_workshop_session.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 bg-slate-900/75 text-white text-[9px] font-semibold px-2 py-0.5 rounded truncate">
                      Live Website Preview
                    </span>
                  </div>

                  {/* Upload from Computer Control */}
                  <div className="flex-1 w-full">
                    <label className="flex flex-col items-center justify-center gap-1.5 px-4 py-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#008000] bg-white text-slate-700 hover:text-[#008000] font-bold text-xs transition cursor-pointer shadow-2xs text-center">
                      <Upload className="w-5 h-5 text-[#008000]" />
                      <span>Choose Image from Computer / Local Storage</span>
                      <span className="text-[10px] font-medium text-slate-400">Supports JPG, PNG, WEBP — automatically optimized</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageFileUpload(file, (dataUrl) => {
                              setEditForm((prev) => ({ ...prev, image: dataUrl }));
                            });
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Course Title, Department & Duration */}
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#008000]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Academic Department / Category</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#008000]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Duration</label>
                    <input
                      type="text"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                      placeholder="e.g. 5 Days or 10 Days"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#008000]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Course Executive Description / Summary</label>
                  <textarea
                    rows={2}
                    value={editForm.summary}
                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                    placeholder="Concise executive overview displayed on catalog cards and course page..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#008000]"
                  />
                </div>
              </div>

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
                        className={`w-full h-9 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${cohortStartDate
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
                            className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1 ${isAdded
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourse(null);
                    scrollMainTop();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold transition shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Course &amp; Image</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          DEDICATED PAGE: UPLOAD NEW COURSE / TRAINING
      ════════════════════════════════════════════════════════════ */}
      {isNewCourseModalOpen && (
        <div className="max-w-5xl mx-auto">
          {renderBackBar('Back to Courses Catalog', () => setIsNewCourseModalOpen(false))}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#032e42] p-5 sm:p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  ECAS Institute Catalog
                </span>
                <h3 className="text-lg font-black leading-snug mt-0.5">
                  Upload New Executive Training Course
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateNewCourse} className="p-6 space-y-5 text-xs">
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

              {/* Course Featured Image Section for New Course (Local Upload Only) */}
              <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#008000]" />
                    <span>Course Featured Image</span>
                  </label>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Upload a course image directly from your computer or local device storage.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 items-center">
                  <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 shrink-0 relative shadow-xs">
                    <img
                      src={newCourseForm.image || '/images/Gallery/training_workshop_session.jpg'}
                      alt={newCourseForm.title || 'New course preview'}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/Gallery/training_workshop_session.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1.5 right-1.5 bg-slate-900/75 text-white text-[9px] font-semibold px-2 py-0.5 rounded truncate">
                      Course Image Preview
                    </span>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#008000] bg-white text-slate-700 hover:text-[#008000] font-bold text-xs transition cursor-pointer shadow-2xs text-center">
                      <Upload className="w-5 h-5 text-[#008000]" />
                      <span>Upload Image from Computer / Local Storage</span>
                      <span className="text-[10px] font-medium text-slate-400">JPG, PNG or WEBP — stored and synced automatically</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageFileUpload(file, (dataUrl) => {
                              setNewCourseForm((prev) => ({ ...prev, image: dataUrl }));
                            });
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
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
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-0.5 ${isAdded
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
                  placeholder="Nairobi, Mombasa, Diani, Zanzibar, Kigali, Dubai, Kuala Lumpur, Online"
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
                  onClick={() => {
                    setIsNewCourseModalOpen(false);
                    scrollMainTop();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold transition shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Publish to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </main>

        {/* Transparent Portal Footer: ECAS Copyright & Transparent Tagline */}
        <footer className="mt-auto bg-transparent border-t border-slate-200/60 px-4 sm:px-6 lg:px-8 py-4 max-w-[1180px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-transparent">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 bg-transparent">
              <img
                src="/logo_transparent.png"
                alt="ECAS Institute"
                className="h-7 w-auto object-contain opacity-45 select-none pointer-events-none"
              />
              <span className="hidden sm:inline-block h-4 w-px bg-slate-300/60" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#032e42]/40 bg-transparent select-none">
                Environment | Energy | Climate Action
              </p>
            </div>
            <p className="text-xs font-medium text-slate-500/75 bg-transparent">
              Copyright &copy; ECAS Institute, {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

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

