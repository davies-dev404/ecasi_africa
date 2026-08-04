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
    return getLocalStorageData(KEYS.COURSES) || defaultCourses;
  },
  getCoursesLinks() {
    return getLocalStorageData(KEYS.COURSES_LINKS) || defaultCoursesLinks;
  }
};
