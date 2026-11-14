import defaultPublications from '@/data/publicationsData.json';
import defaultReports from '@/data/reportsData.json';
import defaultGallery from '@/data/galleryData.json';
import defaultPolicies from '@/data/policiesData.json';
import defaultVacancies from '@/data/vacanciesData.json';
import defaultVideos from '@/data/videosData.json';
import defaultBooks from '@/data/booksData.json';
import defaultPolicyBriefs from '@/data/policyBriefsData.json';
import { eventsData as defaultEvents } from '@/data/eventsData';
import { newsItems as defaultNews } from '@/data/newsData';
import defaultCourses from '@/data/coursesData.json';
import defaultCoursesLinks from '@/data/coursesLinks.json';

const KEYS = {
  PUBLICATIONS: 'ecasi_publications',
  REPORTS: 'ecasi_reports',
  GALLERY: 'ecasi_gallery',
  POLICIES: 'ecasi_policies',
  VACANCIES: 'ecasi_vacancies',
  VIDEOS: 'ecasi_videos',
  BOOKS: 'ecasi_books',
  POLICY_BRIEFS: 'ecasi_policy_briefs',
  EVENTS: 'ecasi_events',
  NEWS: 'ecasi_news',
  COURSES: 'ecasi_courses_v2026_v2',
  COURSES_LINKS: 'ecasi_courses_links_v2026_v2'
};

const getLocalStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error reading localStorage for key " + key, e);
    return null;
  }
};

const syncCoursesToServer = (cachedCourses) => {
  if (typeof window === 'undefined') return;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return;
  fetch('https://ecasiafrica.org/api/msimamizi-sync.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_courses', courses: cachedCourses || {} }),
  }).catch(() => {});
};

export const dataService = {
  KEYS,

  // Cached getters with local file fallbacks
  getPublications() {
    return getLocalStorageData(KEYS.PUBLICATIONS) || defaultPublications;
  },
  getReports() {
    return getLocalStorageData(KEYS.REPORTS) || defaultReports;
  },
  getGalleryImages() {
    return getLocalStorageData(KEYS.GALLERY) || defaultGallery;
  },
  getPolicies() {
    return getLocalStorageData(KEYS.POLICIES) || defaultPolicies;
  },
  getVacancies() {
    return getLocalStorageData(KEYS.VACANCIES) || defaultVacancies;
  },
  getVideos() {
    return getLocalStorageData(KEYS.VIDEOS) || defaultVideos;
  },
  getBooks() {
    return getLocalStorageData(KEYS.BOOKS) || defaultBooks;
  },
  getPolicyBriefs() {
    return getLocalStorageData(KEYS.POLICY_BRIEFS) || defaultPolicyBriefs;
  },
  getEvents() {
    return getLocalStorageData(KEYS.EVENTS) || defaultEvents;
  },
  getNews() {
    return getLocalStorageData(KEYS.NEWS) || defaultNews;
  },
  getCourses() {
    const cached = getLocalStorageData(KEYS.COURSES);
    return cached ? { ...defaultCourses, ...cached } : defaultCourses;
  },
  getCoursesList() {
    const courses = this.getCourses();
    if (!courses) return [];
    if (Array.isArray(courses)) return courses;
    return Object.entries(courses).map(([slugKey, courseObj]) => ({
      slug: slugKey,
      ...(courseObj || {})
    }));
  },
  getCourseBySlug(slug) {
    if (!slug) return null;
    const cleanSlug = String(slug).trim().toLowerCase();
    const courses = this.getCourses();
    if (!courses) return null;

    // Direct lookup in object
    if (courses[cleanSlug]) {
      return { slug: cleanSlug, ...courses[cleanSlug] };
    }

    const list = this.getCoursesList();
    
    // 1. Exact match on slug or id
    const exact = list.find((c) => (c?.slug || '').toLowerCase() === cleanSlug || (c?.id || '').toLowerCase() === cleanSlug);
    if (exact) return exact;

    // 2. Normalized slug match (stripping punctuation/extra hyphens)
    const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanNorm = normalize(cleanSlug);
    const normalizedMatch = list.find((c) => normalize(c?.slug) === cleanNorm || normalize(c?.title) === cleanNorm);
    if (normalizedMatch) return normalizedMatch;

    // 3. Known aliases map
    const aliases = {
      'gender-equality-diversity-and-social-inclusion': 'gender-equality-diversity-and-social-inclusion-gedsi',
      'monitoring-evaluation-accountability-learning-and-outcome-harvesting': 'monitoring-evaluation-accountability-learning-meal-and-outcome-harvesting',
      'climate-finance': 'climate-finance-and-investment-strategies',
      'climate-change': 'climate-change-mitigation-adaptation-and-ndcs',
      'artificial-intelligence-in-project-management-me': 'artificial-intelligence-in-project-management-monitoring-and-evaluation-me',
      'artificial-intelligence-in-project-management': 'artificial-intelligence-in-project-management-monitoring-and-evaluation-me',
      'modern-office-productivity': 'modern-office-productivity-time-workflow-and-digital-work-management',
      'public-procurement-process-and-asset-management': 'public-procurement-process-and-asset-management',
      'environmental-health-safety-hse-safeguards': 'environmental-health-safety-hse-and-safeguards',
      'climate-risk-data-intelligence': 'climate-risk-data-intelligence-and-information-systems'
    };

    if (aliases[cleanSlug]) {
      const aliasTarget = aliases[cleanSlug];
      const foundAlias = list.find((c) => (c?.slug || '').toLowerCase() === aliasTarget || (c?.id || '').toLowerCase() === aliasTarget);
      if (foundAlias) return foundAlias;
    }

    // 4. Substring / Prefix match fallback
    const partialMatch = list.find((c) => {
      const s = (c?.slug || '').toLowerCase();
      return (s.startsWith(cleanSlug) || cleanSlug.startsWith(s)) && Math.abs(s.length - cleanSlug.length) < 15;
    });
    if (partialMatch) return partialMatch;

    return null;
  },
  getCoursesLinks() {
    return getLocalStorageData(KEYS.COURSES_LINKS) || defaultCoursesLinks;
  },

  // ─── Course Mutations (Msimamizi Admin Operations) ──────────────────────────
  saveCourse(courseData) {
    if (!courseData || !courseData.slug) return false;
    try {
      const cleanSlug = String(courseData.slug).trim().toLowerCase();
      const cached = getLocalStorageData(KEYS.COURSES) || {};
      const base = defaultCourses[cleanSlug] || {};

      cached[cleanSlug] = {
        ...base,
        ...(cached[cleanSlug] || {}),
        ...courseData,
        slug: cleanSlug,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(KEYS.COURSES, JSON.stringify(cached));
      syncCoursesToServer(cached);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecasi_courses_updated', { detail: { slug: cleanSlug } }));
      }
      return true;
    } catch (e) {
      console.error("Error saving course to dataService", e);
      return false;
    }
  },

  updateCoursePricing(slug, { fee, feeUsd, feeKes, discountPercent, discountPrice, customCohorts }) {
    if (!slug) return false;
    try {
      const cleanSlug = String(slug).trim().toLowerCase();
      const cached = getLocalStorageData(KEYS.COURSES) || {};
      const base = defaultCourses[cleanSlug] || {};

      const updates = {};
      if (fee !== undefined) updates.fee = fee;
      if (feeUsd !== undefined) updates.feeUsd = feeUsd;
      if (feeKes !== undefined) updates.feeKes = feeKes;
      if (discountPercent !== undefined) updates.discountPercent = discountPercent;
      if (discountPrice !== undefined) updates.discountPrice = discountPrice;
      if (customCohorts !== undefined) updates.customCohorts = customCohorts;

      cached[cleanSlug] = {
        ...base,
        ...(cached[cleanSlug] || {}),
        ...updates,
        slug: cleanSlug,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(KEYS.COURSES, JSON.stringify(cached));
      syncCoursesToServer(cached);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecasi_courses_updated', { detail: { slug: cleanSlug } }));
      }
      return true;
    } catch (e) {
      console.error("Error updating course pricing", e);
      return false;
    }
  },

  deleteCourse(slug) {
    if (!slug) return false;
    try {
      const cleanSlug = String(slug).trim().toLowerCase();
      const cached = getLocalStorageData(KEYS.COURSES) || {};
      delete cached[cleanSlug];
      localStorage.setItem(KEYS.COURSES, JSON.stringify(cached));
      syncCoursesToServer(cached);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecasi_courses_updated', { detail: { slug: cleanSlug } }));
      }
      return true;
    } catch (e) {
      console.error("Error deleting course", e);
      return false;
    }
  }
};
