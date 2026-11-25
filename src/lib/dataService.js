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
import { realtimeService } from '@/services/realtimeService';

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
  COURSES: 'ecasi_courses_v2026_v3',
  COURSES_LINKS: 'ecasi_courses_links_v2026_v3'
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

const getSyncEndpoint = () => {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  const port = String(window.location.port || '');
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('ecasiafrica.org') ||
    port === '5173' ||
    port === '4173' ||
    port === '8080'
  ) {
    return '/api/msimamizi-sync.php';
  }
  return 'https://ecasiafrica.org/api/msimamizi-sync.php';
};

const RESOURCE_COLLECTIONS = {
  publications: { key: KEYS.PUBLICATIONS, label: 'Publications', defaultData: defaultPublications },
  policyBriefs: { key: KEYS.POLICY_BRIEFS, label: 'Policy Briefs', defaultData: defaultPolicyBriefs },
  policies: { key: KEYS.POLICIES, label: 'Policies & Laws', defaultData: defaultPolicies },
  reports: { key: KEYS.REPORTS, label: 'Reports', defaultData: defaultReports },
  videos: { key: KEYS.VIDEOS, label: 'Videos', defaultData: defaultVideos },
  books: { key: KEYS.BOOKS, label: 'Books', defaultData: defaultBooks },
};

const postAdminSync = (payload) => {
  const endpoint = getSyncEndpoint();
  if (!endpoint) return Promise.resolve(null);
  const token = sessionStorage.getItem('ecasi_msimamizi_token') || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['X-Admin-Token'] = token;
  }
  return fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return null;
      const json = await res.json();
      return { ok: res.ok, status: res.status, ...json };
    })
    .catch(() => null);
};

const syncCoursesToServer = (cachedCourses) =>
  postAdminSync({ action: 'set_courses', courses: cachedCourses || {} }).then((r) => {
    if (r?.success) realtimeService.publish('courses');
    return r;
  });

const syncVacanciesToServer = (vacanciesList) =>
  postAdminSync({ action: 'set_vacancies', vacancies: Array.isArray(vacanciesList) ? vacanciesList : [] }).then((r) => {
    if (r?.success) realtimeService.publish('vacancies');
    return r;
  });

const syncGalleryToServer = (galleryList) =>
  postAdminSync({ action: 'set_gallery', gallery: Array.isArray(galleryList) ? galleryList : [] }).then((r) => {
    if (r?.success) realtimeService.publish('gallery', { count: galleryList.length });
    return r;
  });

const syncResourcesToServer = (resourceType, items) =>
  postAdminSync({ action: 'set_resources', resourceType, items: Array.isArray(items) ? items : [] }).then((r) => {
    if (r?.success) realtimeService.publish('resources', { resourceType, count: items.length });
    return r;
  });

const applyServerMediaSnapshot = (data) => {
  if (!data || typeof window === 'undefined') return;
  try {
    if (data.galleryCustomized || Array.isArray(data.gallery)) {
      const nextGallery = Array.isArray(data.gallery) ? data.gallery : [];
      localStorage.setItem(KEYS.GALLERY, JSON.stringify(nextGallery));
      window.dispatchEvent(new CustomEvent('ecasi_gallery_updated'));
    }
    const resMap = data.resources && typeof data.resources === 'object' ? data.resources : {};
    const customMap = data.resourcesCustomized && typeof data.resourcesCustomized === 'object' ? data.resourcesCustomized : {};
    let resourcesChanged = false;
    Object.entries(RESOURCE_COLLECTIONS).forEach(([rType, meta]) => {
      if (customMap[rType] || Array.isArray(resMap[rType])) {
        const list = Array.isArray(resMap[rType]) ? resMap[rType] : [];
        localStorage.setItem(meta.key, JSON.stringify(list));
        resourcesChanged = true;
      }
    });
    if (resourcesChanged) {
      window.dispatchEvent(new CustomEvent('ecasi_resources_updated'));
    }
  } catch (e) {
    console.warn('Error applying remote media/resources snapshot:', e);
  }
};

const hydratePublicFromServer = () => {
  const baseEndpoint = getSyncEndpoint();
  if (!baseEndpoint) return Promise.resolve(null);
  return fetch(`${baseEndpoint}?scope=public&t=${Date.now()}`, { method: 'GET', cache: 'no-store' })
    .then(async (res) => {
      if (!res.ok) return null;
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return null;
      return res.json();
    })
    .then((json) => {
      const data = json?.data;
      if (!data) return null;
      const remoteCourses = data.courses;
      if (remoteCourses && typeof remoteCourses === 'object' && Object.keys(remoteCourses).length > 0) {
        const localCached = getLocalStorageData(KEYS.COURSES) || {};
        const merged = { ...localCached, ...remoteCourses };
        localStorage.setItem(KEYS.COURSES, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('ecasi_courses_updated'));
      }
      const remoteVacancies = data.vacancies;
      if (Array.isArray(remoteVacancies)) {
        localStorage.setItem(KEYS.VACANCIES, JSON.stringify(remoteVacancies));
        window.dispatchEvent(new CustomEvent('ecasi_vacancies_updated'));
      }
      applyServerMediaSnapshot(data);
      return data;
    })
    .catch(() => null);
};

// Subscribe to live Socket.IO / SSE / BroadcastChannel updates for public website collections
let publicRealtimeDebounce = null;
if (typeof window !== 'undefined') {
  realtimeService.subscribe((evt) => {
    if (['gallery', 'resources', 'courses', 'vacancies', 'sync', 'cms', 'announcements'].includes(evt?.topic)) {
      if (evt.topic === 'gallery') {
        window.dispatchEvent(new CustomEvent('ecasi_gallery_updated'));
      }
      if (evt.topic === 'resources') {
        window.dispatchEvent(new CustomEvent('ecasi_resources_updated'));
      }
      if (evt.topic === 'courses') {
        window.dispatchEvent(new CustomEvent('ecasi_courses_updated'));
      }
      if (evt.topic === 'vacancies') {
        window.dispatchEvent(new CustomEvent('ecasi_vacancies_updated'));
      }
      window.clearTimeout(publicRealtimeDebounce);
      publicRealtimeDebounce = window.setTimeout(() => {
        hydratePublicFromServer();
      }, 180);
    }
  });
}

// Automatically hydrate catalog, gallery, resources & vacancies overrides from server on startup
hydratePublicFromServer();

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
    if (!cached || typeof cached !== 'object') return defaultCourses;
    const merged = { ...defaultCourses };
    Object.entries(cached).forEach(([slug, override]) => {
      if (!override || typeof override !== 'object') return;
      if (override._deleted) {
        delete merged[slug];
        return;
      }
      const base = merged[slug] || {};
      const cleanOverride = {};
      Object.entries(override).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanOverride[k] = v;
        }
      });
      merged[slug] = { ...base, ...cleanOverride, slug };
    });
    return merged;
  },
  getCoursesList(includeCategoryPages = false) {
    const courses = this.getCourses();
    if (!courses) return [];
    const rawList = Array.isArray(courses)
      ? courses
      : Object.entries(courses).map(([slugKey, courseObj]) => ({
          slug: slugKey,
          ...(courseObj || {})
        }));
    if (includeCategoryPages) return rawList;
    return rawList.filter((c) => c && !c.isCategoryPage);
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

    const list = this.getCoursesList(true);
    
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

  updateCoursePricing(
    slug,
    {
      title,
      category,
      duration,
      image,
      summary,
      content,
      location,
      fee,
      feeUsd,
      feeKes,
      discountPercent,
      discountPrice,
      customCohorts
    }
  ) {
    if (!slug) return false;
    try {
      const cleanSlug = String(slug).trim().toLowerCase();
      const cached = getLocalStorageData(KEYS.COURSES) || {};
      const base = defaultCourses[cleanSlug] || {};

      const updates = {};
      if (title !== undefined && String(title).trim() !== '') updates.title = String(title).trim();
      if (category !== undefined && String(category).trim() !== '') updates.category = String(category).trim();
      if (duration !== undefined && String(duration).trim() !== '') updates.duration = String(duration).trim();
      if (image !== undefined && String(image).trim() !== '') updates.image = String(image).trim();
      if (summary !== undefined && String(summary).trim() !== '') updates.summary = String(summary).trim();
      if (content !== undefined) updates.content = content;
      if (location !== undefined && String(location).trim() !== '') updates.location = String(location).trim();
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
  },

  refreshPublicData() {
    return hydratePublicFromServer();
  },

  // ─── Vacancy Mutations (Msimamizi Admin <-> Public Vacancies Page) ───────────
  setVacancies(vacanciesList) {
    try {
      const cleanList = Array.isArray(vacanciesList) ? vacanciesList : [];
      localStorage.setItem(KEYS.VACANCIES, JSON.stringify(cleanList));
      syncVacanciesToServer(cleanList);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ecasi_vacancies_updated'));
      }
      return cleanList;
    } catch (e) {
      console.error("Error saving vacancies list", e);
      return null;
    }
  },

  saveVacancy(vacancyData) {
    if (!vacancyData || !String(vacancyData.title || '').trim()) return null;
    const current = this.getVacancies();
    const existingList = Array.isArray(current) ? current : [];
    const nowIso = new Date().toISOString();
    const vacId = vacancyData.id || `VAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      id: vacId,
      title: String(vacancyData.title || '').trim(),
      department: String(vacancyData.department || 'Research & Executive Training').trim(),
      location: String(vacancyData.location || 'Nairobi, Kenya').trim(),
      type: String(vacancyData.type || 'Full-time').trim(),
      deadline: String(vacancyData.deadline || 'Open Until Filled').trim(),
      description: String(vacancyData.description || '').trim(),
      requirements: String(vacancyData.requirements || '').trim(),
      posterDataUrl: typeof vacancyData.posterDataUrl === 'string' ? vacancyData.posterDataUrl : '',
      posterFileName: String(vacancyData.posterFileName || '').trim(),
      posterFileType: String(vacancyData.posterFileType || '').trim(),
      status: vacancyData.status === 'Closed' ? 'Closed' : 'Open',
      createdAt: vacancyData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const exists = existingList.some((v) => v.id === vacId);
    const updated = exists
      ? existingList.map((v) => (v.id === vacId ? { ...v, ...record } : v))
      : [record, ...existingList];

    this.setVacancies(updated);
    return record;
  },

  toggleVacancyStatus(id) {
    if (!id) return false;
    const existingList = Array.isArray(this.getVacancies()) ? this.getVacancies() : [];
    const updated = existingList.map((v) =>
      v.id === id
        ? { ...v, status: v.status === 'Closed' ? 'Open' : 'Closed', updatedAt: new Date().toISOString() }
        : v
    );
    this.setVacancies(updated);
    return true;
  },

  deleteVacancy(id) {
    if (!id) return false;
    const existingList = Array.isArray(this.getVacancies()) ? this.getVacancies() : [];
    const updated = existingList.filter((v) => v.id !== id);
    this.setVacancies(updated);
    return true;
  },

  // ─── Gallery Management (Msimamizi Admin <-> Public Gallery) ────────────────
  applyServerMediaSnapshot,

  async setGalleryImages(galleryList) {
    try {
      const cleanList = Array.isArray(galleryList) ? galleryList : [];
      localStorage.setItem(KEYS.GALLERY, JSON.stringify(cleanList));
      window.dispatchEvent(new CustomEvent('ecasi_gallery_updated'));
      realtimeService.publish('gallery', { count: cleanList.length });
      const res = await syncGalleryToServer(cleanList);
      return { ok: !res || Boolean(res.success), list: cleanList, serverResponse: res };
    } catch (e) {
      console.error('Error saving gallery list', e);
      return { ok: false, error: e?.message || 'Storage quota exceeded' };
    }
  },

  async saveGalleryImage(imgData) {
    if (!imgData || !String(imgData.src || '').trim()) return { ok: false, error: 'Image URL or file is required.' };
    const current = Array.isArray(this.getGalleryImages()) ? this.getGalleryImages() : [];
    const nowIso = new Date().toISOString();
    const imgId = imgData.id || `gal-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      id: imgId,
      src: String(imgData.src || '').trim(),
      category: ['events', 'fieldwork', 'training', 'community'].includes(String(imgData.category || '').toLowerCase())
        ? String(imgData.category).toLowerCase()
        : 'training',
      title: String(imgData.title || 'ECAS Institute Activity').trim(),
      description: String(imgData.description || '').trim(),
      createdAt: imgData.createdAt || nowIso,
      updatedAt: nowIso,
    };
    const exists = current.some((g) => (g.id && g.id === imgId) || g.src === record.src);
    const updated = exists
      ? current.map((g) => ((g.id && g.id === imgId) || g.src === record.src ? { ...g, ...record } : g))
      : [record, ...current];
    return this.setGalleryImages(updated);
  },

  async deleteGalleryImage(idOrSrc) {
    if (!idOrSrc) return { ok: false };
    const current = Array.isArray(this.getGalleryImages()) ? this.getGalleryImages() : [];
    const updated = current.filter((g) => g.id !== idOrSrc && g.src !== idOrSrc);
    return this.setGalleryImages(updated);
  },

  async resetGalleryToDefaults() {
    return this.setGalleryImages(defaultGallery);
  },

  // ─── Resources Management (Publications, Briefs, Policies, Reports, Videos, Books) ─
  getResourcesByType(resourceType) {
    const meta = RESOURCE_COLLECTIONS[resourceType];
    if (!meta) return [];
    const data = getLocalStorageData(meta.key);
    return Array.isArray(data) ? data : meta.defaultData;
  },

  async setResourcesByType(resourceType, itemsList) {
    const meta = RESOURCE_COLLECTIONS[resourceType];
    if (!meta) return { ok: false, error: 'Unknown resource type' };
    try {
      const cleanList = Array.isArray(itemsList) ? itemsList : [];
      localStorage.setItem(meta.key, JSON.stringify(cleanList));
      window.dispatchEvent(new CustomEvent('ecasi_resources_updated', { detail: { resourceType } }));
      realtimeService.publish('resources', { resourceType, count: cleanList.length });
      const res = await syncResourcesToServer(resourceType, cleanList);
      return { ok: !res || Boolean(res.success), list: cleanList, serverResponse: res };
    } catch (e) {
      console.error('Error saving resources list', e);
      return { ok: false, error: e?.message || 'Storage quota exceeded' };
    }
  },

  async saveResourceItem(resourceType, itemData) {
    if (!itemData || !String(itemData.title || '').trim()) {
      return { ok: false, error: 'Resource title is required.' };
    }
    const current = Array.isArray(this.getResourcesByType(resourceType)) ? this.getResourcesByType(resourceType) : [];
    const nowIso = new Date().toISOString();
    const itemId = itemData.id || `${resourceType.slice(0, 3)}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanTags = Array.isArray(itemData.tags)
      ? itemData.tags.map((t) => String(t).trim()).filter(Boolean)
      : String(itemData.tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
    const linkValue = String(itemData.downloadUrl || itemData.url || '').trim();
    const record = {
      id: itemId,
      title: String(itemData.title || '').trim(),
      type: String(itemData.type || 'Resource').trim(),
      issue: String(itemData.issue || '').trim(),
      date: String(itemData.date || new Date().getFullYear()).trim(),
      pages: String(itemData.pages || 'PDF Document').trim(),
      authors: String(itemData.authors || itemData.author || 'ECAS Institute').trim(),
      author: String(itemData.author || itemData.authors || 'ECAS Institute').trim(),
      country: String(itemData.country || 'Africa / Global').trim(),
      abstract: String(itemData.abstract || itemData.summary || '').trim(),
      summary: String(itemData.summary || itemData.abstract || '').trim(),
      description: String(itemData.description || itemData.summary || itemData.abstract || '').trim(),
      image: String(itemData.image || '').trim(),
      downloadUrl: linkValue,
      url: linkValue,
      tags: cleanTags,
      isSensitive: Boolean(itemData.isSensitive),
      createdAt: itemData.createdAt || nowIso,
      updatedAt: nowIso,
    };
    const exists = current.some((r) => r.id === itemId);
    const updated = exists
      ? current.map((r) => (r.id === itemId ? { ...r, ...record } : r))
      : [record, ...current];
    return this.setResourcesByType(resourceType, updated);
  },

  async deleteResourceItem(resourceType, id) {
    if (!id) return { ok: false };
    const current = Array.isArray(this.getResourcesByType(resourceType)) ? this.getResourcesByType(resourceType) : [];
    const updated = current.filter((r) => r.id !== id);
    return this.setResourcesByType(resourceType, updated);
  },

  async resetResourcesToDefaults(resourceType) {
    const meta = RESOURCE_COLLECTIONS[resourceType];
    if (!meta) return { ok: false };
    return this.setResourcesByType(resourceType, meta.defaultData);
  },
};
