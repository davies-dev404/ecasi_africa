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

export const dataService = {
  KEYS,
  
  getPublications() {
    return getLocalStorageData(KEYS.PUBLICATIONS) || defaultPublications;
  },
  savePublications(data) {
    saveLocalStorageData(KEYS.PUBLICATIONS, data);
  },

  getReports() {
    return getLocalStorageData(KEYS.REPORTS) || defaultReports;
  },
  saveReports(data) {
    saveLocalStorageData(KEYS.REPORTS, data);
  },

  getGalleryImages() {
    return getLocalStorageData(KEYS.GALLERY) || defaultGallery;
  },
  saveGalleryImages(data) {
    saveLocalStorageData(KEYS.GALLERY, data);
  },

  getPolicies() {
    return getLocalStorageData(KEYS.POLICIES) || defaultPolicies;
  },
  savePolicies(data) {
    saveLocalStorageData(KEYS.POLICIES, data);
  },

  getVacancies() {
    return getLocalStorageData(KEYS.VACANCIES) || defaultVacancies;
  },
  saveVacancies(data) {
    saveLocalStorageData(KEYS.VACANCIES, data);
  },

  getVideos() {
    return getLocalStorageData(KEYS.VIDEOS) || defaultVideos;
  },
  saveVideos(data) {
    saveLocalStorageData(KEYS.VIDEOS, data);
  },

  getBooks() {
    return getLocalStorageData(KEYS.BOOKS) || defaultBooks;
  },
  saveBooks(data) {
    saveLocalStorageData(KEYS.BOOKS, data);
  },

  getPolicyBriefs() {
    return getLocalStorageData(KEYS.POLICY_BRIEFS) || defaultPolicyBriefs;
  },
  savePolicyBriefs(data) {
    saveLocalStorageData(KEYS.POLICY_BRIEFS, data);
  },

  getEvents() {
    return getLocalStorageData(KEYS.EVENTS) || defaultEvents;
  },
  saveEvents(data) {
    saveLocalStorageData(KEYS.EVENTS, data);
  },

  getNews() {
    return getLocalStorageData(KEYS.NEWS) || defaultNews;
  },
  saveNews(data) {
    saveLocalStorageData(KEYS.NEWS, data);
  },

  getCourses() {
    return getLocalStorageData(KEYS.COURSES) || defaultCourses;
  },
  saveCourses(data) {
    saveLocalStorageData(KEYS.COURSES, data);
  },

  getCoursesLinks() {
    return getLocalStorageData(KEYS.COURSES_LINKS) || defaultCoursesLinks;
  },
  saveCoursesLinks(data) {
    saveLocalStorageData(KEYS.COURSES_LINKS, data);
  },

  resetAllData() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
};
