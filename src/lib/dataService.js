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
  COURSES: 'ecasi_courses',
  COURSES_LINKS: 'ecasi_courses_links'
};

const API_BASE = '/api';

const getLocalStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error reading localStorage for key " + key, e);
    return null;
  }
};

const saveLocalStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error writing localStorage for key " + key, e);
  }
};

// Helper for backend requests
const apiRequest = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API request failed: ${url}`, err);
    throw err;
  }
};

export const dataService = {
  KEYS,

  // Synchronous cached getters with local file fallbacks
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
    return getLocalStorageData(KEYS.COURSES) || defaultCourses;
  },
  getCoursesLinks() {
    return getLocalStorageData(KEYS.COURSES_LINKS) || defaultCoursesLinks;
  },

  // Asynchronous API content savers
  async savePublications(data) {
    saveLocalStorageData(KEYS.PUBLICATIONS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=publications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveReports(data) {
    saveLocalStorageData(KEYS.REPORTS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveGalleryImages(data) {
    saveLocalStorageData(KEYS.GALLERY, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async savePolicies(data) {
    saveLocalStorageData(KEYS.POLICIES, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveVacancies(data) {
    saveLocalStorageData(KEYS.VACANCIES, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=vacancies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveVideos(data) {
    saveLocalStorageData(KEYS.VIDEOS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveBooks(data) {
    saveLocalStorageData(KEYS.BOOKS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async savePolicyBriefs(data) {
    saveLocalStorageData(KEYS.POLICY_BRIEFS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=briefs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveEvents(data) {
    saveLocalStorageData(KEYS.EVENTS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveNews(data) {
    saveLocalStorageData(KEYS.NEWS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveCourses(data) {
    saveLocalStorageData(KEYS.COURSES, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async saveCoursesLinks(data) {
    saveLocalStorageData(KEYS.COURSES_LINKS, data);
    await apiRequest(`${API_BASE}/admin_actions.php?action=save&category=courses_links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // Reset database & local storage content to default state
  async resetAllData() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    await apiRequest(`${API_BASE}/admin_actions.php?action=reset_all`, {
      method: 'POST'
    });
  },

  // Asynchronous background synchronization function to fetch latest database records
  async syncCategory(category, storageKey) {
    try {
      const res = await fetch(`${API_BASE}/admin_actions.php?action=get&category=${category}`);
      if (res.ok) {
        const text = await res.text();
        // Validate if response is correct JSON array or object
        const parsed = JSON.parse(text);
        saveLocalStorageData(storageKey, parsed);
      }
    } catch {
      // Offline or network error - fail silently and keep local cache
    }
  },

  // Sync all categories in the background
  syncAllData() {
    const syncMapping = [
      { cat: 'publications', key: KEYS.PUBLICATIONS },
      { cat: 'reports', key: KEYS.REPORTS },
      { cat: 'gallery', key: KEYS.GALLERY },
      { cat: 'policies', key: KEYS.POLICIES },
      { cat: 'vacancies', key: KEYS.VACANCIES },
      { cat: 'videos', key: KEYS.VIDEOS },
      { cat: 'books', key: KEYS.BOOKS },
      { cat: 'briefs', key: KEYS.POLICY_BRIEFS },
      { cat: 'events', key: KEYS.EVENTS },
      { cat: 'news', key: KEYS.NEWS },
      { cat: 'courses', key: KEYS.COURSES },
      { cat: 'courses_links', key: KEYS.COURSES_LINKS }
    ];

    syncMapping.forEach(mapping => {
      this.syncCategory(mapping.cat, mapping.key);
    });
  }
};
