import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap, BookOpen, ChevronDown,
  Users, Building2, Globe, Award,
  Clock, MapPin, Search, ArrowUpRight,
  X, Calendar, Download, CheckCircle2,
  Phone, Mail, SlidersHorizontal, LayoutList, LayoutGrid,
  UserPlus, ArrowDown, MessageSquare, Facebook, Linkedin, MessageCircle
} from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { dataService } from '@/lib/dataService';

/* ── Visually verified course featured images ── */
const courseFeaturedImages = {
  'energy': '/images/courses/20241003_133952069-1-1024x683.jpg',
  'climate-smart-forestry': '/images/courses/biodiversity.png',
  'energy-transition-and-mobility': '/images/courses/energy-transition.png',
  'agricultural-carbon-credit-markets': '/images/programmes/agriculture_crops.png',
  'agriculture-and-food-systems': '/images/programmes/agriculture_farm.png',
  'an-introduction-to-climate-change-and-human-rights': '/images/Gallery/G0BhQmUXcAAI77B.jpg',
  'certified-expert-in-climate-adaptation-finance': '/images/Gallery/training 1.jpg',
  'biodiversity-and-natural-resources': '/images/Gallery/hi.jpg',
  'business-sustainability-management': '/images/Gallery/jk.jpg',
  'carbon-accounting-carbon-offsetting-course': '/images/Gallery/DSC_0090.JPG',
  'certificate-course-on-nature-based-solutions-for-disaster-and-climate-resilience': '/images/Gallery/kyvkv.jpg',
  'certificate-in-green-finance': '/images/research/image-6.png',
  'certified-expert-in-biodiversity-finance': '/images/programmes/ocean_sustainable.png',
  'certified-expert-in-environmental-accounting': '/images/Gallery/1715195548735.jpg',
  'certified-expert-in-sustainable-finance': '/images/Gallery/1714399115076.jpg',
  'climate-biodiversity-certificate-program': '/images/Gallery/ji.jpg',
  'climate-and-health-certificate-course': '/images/Gallery/air_quality_handshake.jpg',
  'climate-change-and-water': '/images/programmes/tana_river.png',
  'human-resources-professional-courses': '/images/courses/target_participants.jpg',
  'green-skills-development': '/images/courses/85079752_1227263344135855_2280708113273192448_n.jpg',
  'climate-resilient-infrastructure': '/images/research/consultancy.jpg',
  'environment-climate-change-courses': '/images/Gallery/jkhjn.jpg',
  'regional-workshop': '/images/Gallery/1717137013154.jpg',
  'training-on-carbon-markets': '/images/Gallery/1715195547353.jpg',
  'climate-responsive-budgeting-and-strategic-fiscal-management': '/images/Gallery/1732710492385.jpg',
  'strategic-climate-finance-budgeting-tracking-and-performance-reporting': '/images/Gallery/1715195551211.jpg',
  'innovations-in-public-financial-management-climate-finance-ai-ethical-leadership': '/images/courses/mentorship_group.jpg',
  'artificial-intelligence-in-project-management-me': '/images/research/tech.png',
  'climate-finance-and-investment-strategies': '/images/courses/IMGM1984-1024x683.jpg',
  'governance-ethics-and-anti-corruption-reforms': '/images/Gallery/regulation_training_group.jpg',
  'management-course-for-office-administrators-5ir-ai': '/images/Gallery/DSC_0055.JPG',
  'modern-office-productivity-time-workflow-and-digital-work-management': '/images/Gallery/DSC_0085.JPG',
  'public-procurement-process-and-asset-management': '/images/research/policy_advisory_meeting.jpg',
  'structuring-and-managing-special-purpose-vehicle-for-ppp': '/images/Gallery/1730827985704.jpg',
  'secure-coding-for-software-security-engineering-programme': '/images/Gallery/DSC_0082.JPG',
  'learning-from-big-data-data-mining-and-business-analytics': '/images/Gallery/DSC_0091.JPG',
  '21st-century-public-relations-and-interpersonal-skills': '/images/Gallery/training2.jpg',
  'government-protocol-etiquette-and-events-management': '/images/Gallery/1714399114741.jpg',
  'proactive-management-and-strategic-leadership': '/images/Gallery/training_workshop_session.jpg',
};

const categorySlugToName = {
  'climate-finance': 'Climate Finance & Public Financial Management',
  'climate-finance-public-financial-management': 'Climate Finance & Public Financial Management',
  'climate-finance-and-public-financial-management': 'Climate Finance & Public Financial Management',
  'climate-change': 'Climate Change & Sustainability',
  'climate-change-sustainability': 'Climate Change & Sustainability',
  'climate-change-and-sustainability': 'Climate Change & Sustainability',
  'environment-climate-change-courses': 'Climate Change & Sustainability',
  'carbon-markets': 'Carbon Markets & ESG',
  'carbon-markets-esg': 'Carbon Markets & ESG',
  'carbon-markets-and-esg': 'Carbon Markets & ESG',
  'training-on-carbon-markets': 'Carbon Markets & ESG',
  'esg': 'Carbon Markets & ESG',
  'leadership-and-corporate-governance': 'Leadership, Governance & Public Sector Transformation',
  'leadership-governance-public-sector-transformation': 'Leadership, Governance & Public Sector Transformation',
  'leadership-governance-and-public-sector-transformation': 'Leadership, Governance & Public Sector Transformation',
  'leadership-governance-anti-corruption': 'Leadership, Governance & Public Sector Transformation',
  'organizational-change-management': 'Leadership, Governance & Public Sector Transformation',
  'design-thinking-in-policy-reforms': 'Leadership, Governance & Public Sector Transformation',
  'project-management-and-me': 'Project Management, Procurement & M&E',
  'project-management-procurement-me': 'Project Management, Procurement & M&E',
  'project-management-procurement-and-me': 'Project Management, Procurement & M&E',
  'project-management-monitoring-evaluation-me-ppp': 'Project Management, Procurement & M&E',
  'human-resources': 'Human Resources, Office Administration & Communication',
  'human-resources-professional-courses': 'Human Resources, Office Administration & Communication',
  'human-resources-office-administration-communication': 'Human Resources, Office Administration & Communication',
  'human-resources-and-5ir-office-administration': 'Human Resources, Office Administration & Communication',
  'communication-and-public-relations': 'Human Resources, Office Administration & Communication',
  'data-and-it': 'Data, Artificial Intelligence, IT & Cybersecurity',
  'artificial-intelligence': 'Data, Artificial Intelligence, IT & Cybersecurity',
  'artificial-intelligence-and-machine-learning': 'Data, Artificial Intelligence, IT & Cybersecurity',
  'big-data-analytics-it-cybersecurity': 'Data, Artificial Intelligence, IT & Cybersecurity',
  'data-artificial-intelligence-it-cybersecurity': 'Data, Artificial Intelligence, IT & Cybersecurity',
  'environmental-health-and-safety': 'Air Quality, Environmental Health & Safety (EHS)',
  'air-quality': 'Air Quality, Environmental Health & Safety (EHS)',
  'air-quality-environmental-health-safety': 'Air Quality, Environmental Health & Safety (EHS)',
  'air-quality-environmental-health-safety-ehs': 'Air Quality, Environmental Health & Safety (EHS)',
};

const categoryDescriptions = {
  'All': 'Explore practical, industry-aligned executive training courses in Nairobi, Mombasa, Naivasha, Kigali, Arusha, Dubai, and Online. Build technical capacity across Climate Finance, Carbon Markets, ESG, AI, Data Analytics, Project Management, and Public Sector Governance.',
  'Climate Finance & Public Financial Management': 'Best Climate Finance, Green Bonds, Climate-Responsive Budgeting, and Public Financial Management courses for executives, policymakers, and finance professionals.',
  'Climate Change & Sustainability': 'Comprehensive Climate Change Adaptation, Mitigation, Policy, Nature-Based Solutions, and Resilience courses designed for environmental leaders and government ministries.',
  'Carbon Markets & ESG': 'Hands-on Carbon Accounting, Article 6, Emissions Trading Systems (ETS), Voluntary Carbon Markets (VCM), and ESG Reporting courses for project developers and sustainability teams.',
  'Leadership, Governance & Public Sector Transformation': 'Executive Leadership, Public Sector Governance, Board Oversight, Ethics, Design Thinking, and Change Management courses tailored for directors and senior managers.',
  'Project Management, Monitoring & Evaluation (M&E) & PPP': 'Results-Based Monitoring & Evaluation (MEL), Project Cycle Management, PPP Structuring, and Procurement courses for development and corporate project practitioners.',
  'Human Resources, Office Administration & Communication': 'Strategic Human Resource Management, 5IR Office Administration, Public Relations, and Executive Communication courses for modern workplace leaders.',
  'Data, Artificial Intelligence, IT & Cybersecurity': 'Best Data Management, Big Data Analytics, Artificial Intelligence, GIS, Cybersecurity, and Digital Transformation courses for professionals.',
  'Air Quality, Environmental Health & Safety (EHS)': 'Urban Air Quality Monitoring, Emissions Inventory, Occupational Health & Safety (HSE), and Environmental Impact Assessment (ESIA) courses.',
};

const DELIVERY_FORMATS = ['Classroom (In-Person)', 'Online (Virtual)', 'In-House / Custom'];
const TRAINING_VENUES = ['Nairobi, Kenya', 'Mombasa, Kenya', 'Naivasha, Kenya', 'Arusha, Tanzania', 'Kigali, Rwanda', 'Dubai, UAE', 'Kuala Lumpur, Malaysia', 'Online / Virtual'];
const TRAINING_DURATIONS = ['5 Days', '10 Days (2 Weeks)', '3 Weeks'];

/* ── Helper to clean and format raw WP/HTML course content into Devimpact style ── */
function formatCourseHtmlContent(rawHtml = '') {
  if (!rawHtml) return '';
  let cleaned = rawHtml
    // Remove external srcset / sizes that point to old wp-content URLs
    .replace(/\s+srcset="[^"]*"/gi, '')
    .replace(/\s+sizes="[^"]*"/gi, '')
    // Convert standalone uppercase section labels in <p><strong>...</strong></p> to <h2>
    .replace(
      /<p[^>]*>\s*(?:<a[^>]*>)?\s*<strong>\s*(OVERVIEW|BACKGROUND|INTRODUCTION|DETAILS|AUDIENCE|TARGET PARTICIPANTS|WHAT YOU WILL LEARN|COURSE OBJECTIVES|OBJECTIVES OF THE TRAINING|COURSE STRUCTURE|COURSE OUTLINE|TRAINING MODULES|COURSE MODULES &amp; SPECIALIZED TRACKS|DIGITAL CERTIFICATION|TRAINING CUSTOMIZATION|REQUIREMENTS|TRAINING FEE|COURSE FEES|DELIVERY STYLE|GENERAL NOTES)\s*<\/strong>\s*(?:<\/a>)?\s*<\/p>/gi,
      (_, headingText) => {
        const formatted = headingText
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return `<h2>${formatted}</h2>`;
      }
    )
    // Convert <h4 class="wp-block-heading"><strong>Module ...</strong></h4> to <h3>
    .replace(
      /<h4[^>]*>\s*<strong>(Module[^<]*)<\/strong>\s*<\/h4>/gi,
      '<h3>$1</h3>'
    )
    .replace(
      /<p[^>]*>\s*<strong>(Module\s+\d+[^<]*)<\/strong>\s*<\/p>/gi,
      '<h3>$1</h3>'
    );
  return cleaned;
}

/* ── Helper to generate deterministic 2026 training schedules for any course ── */
function generateCourseSchedules(courseTitle = '', duration = '5 Days') {
  const hash = Array.from(courseTitle).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const cleanDuration = duration.includes('2 Week')
    ? '10 Days (2 Weeks)'
    : duration.includes('3 Week')
    ? '15 Days (3 Weeks)'
    : '5 Days';

  const classroomCohorts = [
    {
      id: 'cls-1',
      scheduleNo: '400827',
      dates: '11 - 15 May 2026',
      duration: cleanDuration,
      venue: 'Nairobi, Kenya',
      format: 'Classroom',
      feeUsd: '$1,000',
      feeKes: 'KES 95,000',
    },
    {
      id: 'cls-2',
      scheduleNo: '400828',
      dates: '08 - 12 Jun 2026',
      duration: cleanDuration,
      venue: hash % 2 === 0 ? 'Mombasa, Kenya' : 'Naivasha, Kenya',
      format: 'Classroom',
      feeUsd: '$1,200',
      feeKes: 'KES 105,000',
    },
    {
      id: 'cls-3',
      scheduleNo: '400829',
      dates: '13 - 17 Jul 2026',
      duration: cleanDuration,
      venue: 'Kigali, Rwanda',
      format: 'Classroom',
      feeUsd: '$1,650',
      feeKes: 'KES 145,000',
    },
    {
      id: 'cls-4',
      scheduleNo: '400830',
      dates: '17 - 21 Aug 2026',
      duration: cleanDuration,
      venue: 'Nairobi, Kenya',
      format: 'Classroom',
      feeUsd: '$1,000',
      feeKes: 'KES 95,000',
    },
    {
      id: 'cls-5',
      scheduleNo: '400831',
      dates: '14 - 18 Sep 2026',
      duration: cleanDuration,
      venue: hash % 3 === 0 ? 'Dubai, UAE' : 'Arusha, Tanzania',
      format: 'Classroom',
      feeUsd: hash % 3 === 0 ? '$2,450' : '$1,550',
      feeKes: hash % 3 === 0 ? 'KES 220,000' : 'KES 135,000',
    },
    {
      id: 'cls-6',
      scheduleNo: '400832',
      dates: '19 - 23 Oct 2026',
      duration: cleanDuration,
      venue: 'Mombasa, Kenya',
      format: 'Classroom',
      feeUsd: '$1,200',
      feeKes: 'KES 105,000',
    },
    {
      id: 'cls-7',
      scheduleNo: '400833',
      dates: '23 Nov - 04 Dec 2026',
      duration: cleanDuration,
      venue: 'Nairobi, Kenya',
      format: 'Classroom',
      feeUsd: '$1,000',
      feeKes: 'KES 95,000',
    },
  ];

  const onlineCohorts = [
    {
      id: 'onl-1',
      scheduleNo: '400840',
      dates: '18 - 22 May 2026',
      duration: cleanDuration,
      venue: 'Live Instructor-Led (Zoom / Teams)',
      format: 'Online / Virtual',
      feeUsd: '$750',
      feeKes: 'KES 55,000',
    },
    {
      id: 'onl-2',
      scheduleNo: '400841',
      dates: '22 - 26 Jun 2026',
      duration: cleanDuration,
      venue: 'Live Instructor-Led (Zoom / Teams)',
      format: 'Online / Virtual',
      feeUsd: '$750',
      feeKes: 'KES 55,000',
    },
    {
      id: 'onl-3',
      scheduleNo: '400842',
      dates: '24 - 28 Aug 2026',
      duration: cleanDuration,
      venue: 'Live Instructor-Led (Zoom / Teams)',
      format: 'Online / Virtual',
      feeUsd: '$750',
      feeKes: 'KES 55,000',
    },
    {
      id: 'onl-4',
      scheduleNo: '400843',
      dates: '12 - 16 Oct 2026',
      duration: cleanDuration,
      venue: 'Live Instructor-Led (Zoom / Teams)',
      format: 'Online / Virtual',
      feeUsd: '$750',
      feeKes: 'KES 55,000',
    },
    {
      id: 'onl-5',
      scheduleNo: '400844',
      dates: '07 - 11 Dec 2026',
      duration: cleanDuration,
      venue: 'Live Instructor-Led (Zoom / Teams)',
      format: 'Online / Virtual',
      feeUsd: '$750',
      feeKes: 'KES 55,000',
    },
  ];

  return { classroomCohorts, onlineCohorts };
}

/* ── Devimpact Layout Styled in ECAS Institute Brand Colors (#032e42 Navy, #008000 Green, #1e73be Blue) ── */
const devimpactCourseStyles = `
  .devimpact-page-wrap {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #303b45;
    background: #f7f9fc;
  }
  .ast-breadcrumbs-wrapper {
    background: #032e42;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    padding: 10px 0;
    font-size: 13px;
    color: #ffffff;
  }
  .ast-breadcrumbs-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ast-breadcrumbs-inner a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .ast-breadcrumbs-inner a:hover {
    color: #4ade80;
  }
  .ast-breadcrumbs-inner .breadcrumb-sep {
    color: #4ade80;
    font-weight: 700;
  }
  .ast-breadcrumbs-inner .breadcrumb-leaf {
    color: #4ade80;
    font-weight: 600;
  }

  /* ── Hero Header (.course-detail-info & .single-course-custom-breadcrumb) ── */
  .course-detail-info {
    background: linear-gradient(135deg, #032e42 0%, #1e73be 100%);
    padding: 36px 0 32px 0;
    color: #fff;
    position: relative;
    border-bottom: 4px solid #008000;
  }
  .single-course-custom-breadcrumb {
    max-width: 1170px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }
  .single-course-custom-breadcrumb h1 {
    font-family: "Fira Sans", "Roboto Condensed", "Poppins", sans-serif;
    font-size: 36px;
    font-weight: 800;
    color: #ffffff !important;
    margin: 0 0 12px 0 !important;
    line-height: 1.22;
    letter-spacing: -0.01em;
  }
  .single-course-custom-breadcrumb p.hero-desc {
    color: rgba(255, 255, 255, 0.92);
    font-size: 15.5px;
    line-height: 1.65;
    max-width: 860px;
    margin: 0 auto 20px auto;
  }

  /* ── In-House Pill Button (.shortcode-inhouse-open-btn) ── */
  .shortcode-inhouse-open-btn {
    border-radius: 999px !important;
    border: 1.5px solid #ffffff !important;
    background-color: #032e42 !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    padding: 10px 24px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 10px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25) !important;
    cursor: pointer !important;
    transition: all 0.25s ease-in-out !important;
    text-decoration: none !important;
  }
  .shortcode-inhouse-open-btn .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #ffffff;
    color: #008000;
    font-size: 13px;
    transition: all 0.25s ease-in-out;
  }
  .shortcode-inhouse-open-btn:hover {
    background-color: #008000 !important;
    color: #ffffff !important;
    border-color: #ffffff !important;
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3) !important;
  }
  .shortcode-inhouse-open-btn:hover .icon {
    background: #ffffff;
    color: #008000;
  }

  /* ── Hero Search Bar (.course-input-search-form) ── */
  .course-input-search-form {
    max-width: 620px;
    display: flex;
    padding-top: 18px;
    margin: 0 auto;
  }
  .course-search-input {
    width: 100%;
    height: 46px;
    padding: 0 18px;
    border: 2px solid #ffffff;
    border-right: none;
    border-top-left-radius: 10px !important;
    border-bottom-left-radius: 10px !important;
    font-size: 14.5px;
    color: #1e293b;
    background: #ffffff;
    outline: none;
  }
  .course-search-input::placeholder {
    color: #64748b !important;
    font-weight: 500;
  }
  .course-search-button {
    height: 46px;
    padding: 0 24px;
    background: #008000 !important;
    color: #ffffff !important;
    font-weight: 700;
    font-size: 14px;
    border: 2px solid #008000;
    border-top-right-radius: 10px !important;
    border-bottom-right-radius: 10px !important;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .course-search-button:hover {
    background: #006600 !important;
    border-color: #006600;
  }

  /* ── Single Course Hero Action Row (.custom-breadcrumb-row) Matching Screenshot 2 ── */
  .custom-breadcrumb-row {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 22px;
  }
  .custom-breadcrumb-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  .custom-breadcrumb-buttons .btn {
    color: #ffffff;
    background-color: #032e42;
    font-size: 13.5px;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 9999px;
    border: 1.5px solid #ffffff;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.22s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  }
  .custom-breadcrumb-buttons .btn.btn-outline-highlight {
    outline: 1.5px dotted rgba(255, 255, 255, 0.85);
    outline-offset: 2px;
  }
  .custom-breadcrumb-buttons .btn:hover {
    color: #ffffff;
    background-color: #008000;
    border-color: #ffffff;
    transform: translateY(-2px);
  }
  .custom-breadcrumb-social-icons {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-left: 4px;
  }
  .custom-breadcrumb-social-icons .social-btn {
    color: #ffffff;
    background: transparent;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 4px;
    text-decoration: none;
  }
  .custom-breadcrumb-social-icons .social-btn:hover {
    color: #4ade80;
    transform: scale(1.15);
  }

  /* ── Course Category / Finder Loop Wrapper (.courses-loop-wrapper) ── */
  .courses-loop-wrapper {
    max-width: 1380px;
    width: 100%;
    margin: 0 auto;
    padding: 24px 16px 64px 16px;
    display: block;
  }
  @media (min-width: 992px) {
    .courses-loop-wrapper {
      display: grid;
      grid-template-columns: 310px minmax(0, 1fr);
      gap: 32px;
      align-items: start;
      padding: 36px 24px 64px 24px;
    }
  }

  /* ── Left Sidebar: Course Finder Filter (.course-finder-search-filter) ── */
  .course-finder-search-filter {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 18px;
    box-shadow: 0 4px 16px rgba(3, 46, 66, 0.06);
    position: static;
  }
  @media (min-width: 992px) {
    .course-finder-search-filter {
      position: sticky;
      top: 96px;
    }
  }
  @media (max-width: 991px) {
    .course-finder-search-filter.desktop-only {
      display: none !important;
    }
  }
  .course-finder-filter-title {
    font-size: 16px;
    font-weight: 700;
    color: #032e42;
    margin: 0 0 14px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #008000;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .course-finder-search-wrapper {
    position: relative;
    margin-bottom: 14px;
  }
  .course-finder-input-field {
    width: 100%;
    padding: 10px 36px 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 13.5px;
    color: #1e293b;
    background: #f8fafc;
    outline: none;
    transition: border-color 0.2s;
  }
  .course-finder-input-field:focus {
    border-color: #008000;
    background: #fff;
  }
  .course-finder-toggle-menu {
    margin-bottom: 10px;
  }
  .course-finder-toggle-btn {
    width: 100%;
    background-color: #032e42;
    color: #fff;
    padding: 10px 14px;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 13.5px;
    font-weight: 600;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s ease;
  }
  .course-finder-toggle-btn:hover,
  .course-finder-toggle-btn.active {
    background-color: #008000;
    color: #fff;
  }
  .course-finder-toggle-content {
    background-color: #f9fafb;
    padding: 10px 12px;
    margin-top: 4px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    max-height: 280px;
    overflow-y: auto;
  }
  .course-finder-checkbox-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 5px 2px;
    font-size: 12.5px;
    color: #334155;
    cursor: pointer;
    transition: color 0.15s;
  }
  .course-finder-checkbox-item:hover {
    color: #008000;
  }
  .course-finder-checkbox-item input[type="checkbox"],
  .course-finder-checkbox-item input[type="radio"] {
    accent-color: #008000;
    width: 15px;
    height: 15px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .course-finder-count-pill {
    font-size: 11px;
    font-weight: 600;
    background: #e2e8f0;
    color: #475569;
    padding: 1px 7px;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .course-finder-reset-btn {
    background-color: #e2e8f0;
    color: #1e293b;
    padding: 10px;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: center;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
    transition: all 0.2s ease;
  }
  .course-finder-reset-btn:hover {
    background-color: #cbd5e1;
    color: #032e42;
  }

  /* ── Right Main Column: Custom Course Loop (.custom-course-loop) ── */
  .custom-course-loop-header {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  .custom-course-loop-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #032e42;
    margin: 0;
  }
  .custom-course-loop {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .custom-course-loop.grid-mode {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
  @media (max-width: 768px) {
    .custom-course-loop.grid-mode {
      grid-template-columns: 1fr;
    }
  }
  .custom-course-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-left: 4px solid #032e42;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 16px 20px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .custom-course-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(3, 46, 66, 0.14);
    border-left-color: #008000;
  }
  .custom-course-thumb {
    width: 108px;
    height: 74px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid #e2e8f0;
  }
  .custom-title-links-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 16px;
  }
  .custom-course-title {
    margin: 0 0 6px 0;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.38;
  }
  .custom-course-title a {
    color: #032e42;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .custom-course-title a:hover {
    color: #008000;
  }
  .custom-course-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    font-size: 12.5px;
    color: #64748b;
  }
  .custom-course-meta span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .custom-course-meta .cat-badge {
    background: rgba(0, 128, 0, 0.09);
    color: #008000;
    font-weight: 600;
    padding: 2px 9px;
    border-radius: 999px;
    font-size: 11.5px;
  }
  .custom-course-links {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .custom-course-links .view-btn {
    background-color: #032e42;
    color: #fff;
    padding: 8px 14px;
    border-radius: 5px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .custom-course-links .view-btn:hover {
    background-color: #1e73be;
    color: #ffffff;
  }
  .custom-course-links .reg-btn {
    background-color: #008000;
    color: #fff;
    padding: 8px 14px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
    white-space: nowrap;
    text-decoration: none;
    display: inline-block;
  }
  .custom-course-links .reg-btn:hover {
    background-color: #006600;
    color: #fff;
  }
  @media (max-width: 768px) {
    .custom-course-item {
      flex-direction: column;
      align-items: flex-start;
    }
    .custom-course-thumb {
      width: 100%;
      height: 160px;
    }
    .custom-title-links-wrapper {
      flex-direction: column;
      align-items: flex-start;
    }
    .custom-course-links {
      width: 100%;
      justify-content: flex-start;
      margin-top: 6px;
    }
  }

  /* ── Pagination (.custom-pagination-container) ── */
  .custom-pagination-container {
    text-align: center;
    margin: 28px 0 10px 0;
  }
  .custom-pagination {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    align-items: center;
  }
  .custom-pagination button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    height: 38px;
    padding: 0 12px;
    color: #032e42;
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .custom-pagination button:hover:not(:disabled) {
    background-color: #032e42;
    color: #fff;
    border-color: #032e42;
  }
  .custom-pagination button.current {
    background-color: #008000;
    color: #fff;
    border-color: #008000;
    cursor: default;
  }
  .custom-pagination button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ── Single Course Schedule & Registration Tabs (.course-register-tabs) ── */
  .course-register-section {
    max-width: 1380px;
    width: 100%;
    margin: 28px auto 10px auto;
    padding: 0 24px;
  }
  .course-register-tabs {
    background: #ffffff;
    border-radius: 14px;
    padding: 26px 28px;
    border: 1px solid rgba(3, 46, 66, 0.1);
    box-shadow: 0 6px 24px rgba(3, 46, 66, 0.07);
  }
  .course-register-tab-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-bottom: 22px;
  }
  .course-register-tab-btn {
    padding: 11px 22px;
    cursor: pointer;
    border: 2px solid #032e42;
    font-weight: 600;
    color: #fff;
    background-color: #032e42;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    font-size: 14px;
    border-radius: 50px;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .course-register-tab-btn:hover {
    background-color: #008000;
    border-color: #008000;
    color: #fff;
  }
  .course-register-tab-btn.active {
    color: #008000;
    background-color: #fff;
    border: 2px solid #008000;
  }
  .course-register-tab-content {
    overflow-x: auto;
  }
  .course-register-tab-content table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border-radius: 8px;
    overflow: hidden;
  }
  .course-register-tab-content th {
    background-color: #032e42;
    color: #fff;
    padding: 12px 14px;
    text-align: left;
    font-weight: 600;
    font-size: 13.5px;
    white-space: nowrap;
  }
  .course-register-tab-content td {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    color: #1e293b;
    vertical-align: middle;
  }
  .course-register-tab-content tbody tr:nth-child(even) {
    background-color: #f1f5f9;
  }
  .course-register-tab-content tbody tr:hover {
    background-color: #f0fdf4;
  }
  .course-register-tab-content .btn {
    padding: 6px 14px;
    font-size: 12.5px;
    font-weight: 600;
    border-radius: 50px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background-color: #008000;
    color: #fff;
    border: 1px solid #008000;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .course-register-tab-content .btn:hover {
    background-color: #032e42;
    border-color: #032e42;
    color: #fff;
  }
  .course-register-tab-content .btn.outline {
    background-color: #1e73be;
    border-color: #1e73be;
    color: #fff;
    margin-left: 6px;
  }
  .course-register-tab-content .btn.outline:hover {
    background-color: #032e42;
    border-color: #032e42;
  }

  /* ── Single Post Layout (.single-post) from #wp-custom-css ── */
  .single-post-container {
    max-width: 1380px;
    width: 100%;
    margin: 26px auto 64px auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 36px;
    align-items: start;
  }
  @media (max-width: 992px) {
    .single-post-container {
      grid-template-columns: 1fr;
    }
  }
  .single-post-article {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(3, 46, 66, 0.08);
    overflow: hidden;
  }
  .single-post-article .entry-header {
    padding: 32px 42px 24px 42px;
    border-bottom: 1px solid rgba(3, 46, 66, 0.10);
  }
  .single-post-article .entry-category {
    display: inline-block;
    background: #008000;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 6px 14px;
    border-radius: 50px;
    margin-bottom: 14px;
  }
  .single-post-article .entry-title {
    color: #032e42;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.28;
    margin: 0 0 14px 0;
  }
  .single-post-article .entry-meta {
    color: #6b7785;
    font-size: 13.5px;
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
  }
  .single-post-article .entry-meta span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .single-post-article .post-thumbnail img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    display: block;
  }
  .single-post-article .entry-content {
    padding: 36px 42px 48px 42px;
    font-size: 16.5px;
    line-height: 1.82;
    color: #303b45;
  }
  @media (max-width: 768px) {
    .single-post-article .entry-header {
      padding: 24px 22px 18px 22px;
    }
    .single-post-article .entry-title {
      font-size: 22px;
    }
    .single-post-article .entry-content {
      padding: 24px 22px 32px 22px;
      font-size: 15.5px;
    }
  }
  .single-post-article .entry-content p {
    margin-bottom: 18px;
  }
  .single-post-article .entry-content h2 {
    color: #032e42;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.3;
    margin-top: 34px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    position: relative;
  }
  .single-post-article .entry-content h2:first-child {
    margin-top: 0;
  }
  .single-post-article .entry-content h2::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 55px;
    height: 4px;
    background: #008000;
    border-radius: 10px;
  }
  .single-post-article .entry-content h3,
  .single-post-article .entry-content h4 {
    color: #032e42;
    font-size: 18.5px;
    font-weight: 700;
    line-height: 1.4;
    margin-top: 24px;
    margin-bottom: 10px;
  }
  .single-post-article .entry-content ul {
    list-style: none;
    padding-left: 0;
    margin: 14px 0 24px 0;
  }
  .single-post-article .entry-content ul li {
    position: relative;
    padding-left: 28px;
    margin-bottom: 10px;
  }
  .single-post-article .entry-content ul li::before {
    content: "✓";
    position: absolute;
    left: 0;
    top: 0;
    color: #008000;
    font-weight: 800;
  }
  .single-post-article .entry-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 22px 0;
    font-size: 14px;
  }
  .single-post-article .entry-content table td,
  .single-post-article .entry-content table th {
    border: 1px solid #cbd5e1;
    padding: 10px 12px;
  }
  .single-post-article .entry-content blockquote,
  .devimpact-highlight {
    background: rgba(0, 128, 0, 0.045);
    border: 1px solid rgba(0, 128, 0, 0.14);
    border-left: 5px solid #008000;
    padding: 24px 28px;
    margin: 28px 0;
    border-radius: 10px;
    color: #1f2a33;
  }
  .devimpact-action {
    background: linear-gradient(135deg, #032e42 0%, #1e73be 100%);
    color: #ffffff;
    padding: 32px 34px;
    border-radius: 14px;
    margin: 36px 0 8px 0;
  }
  .devimpact-action h3 {
    color: #ffffff !important;
    margin-top: 0 !important;
    font-size: 22px !important;
  }
  .devimpact-action p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 18px;
  }
  .devimpact-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #008000;
    color: #ffffff !important;
    font-weight: 700;
    font-size: 14.5px;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    text-decoration: none !important;
    transition: all 0.25s ease;
  }
  .devimpact-btn:hover {
    background: #006600;
    transform: translateY(-2px);
  }

  /* ── Right Sticky Sidebar (.sidebar-main) ── */
  .sidebar-main {
    position: sticky;
    top: 96px;
  }
  .sidebar-main .widget {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid rgba(3, 46, 66, 0.08);
    box-shadow: 0 5px 20px rgba(3, 46, 66, 0.05);
  }
  .sidebar-main .widget-title {
    color: #032e42;
    font-size: 18px;
    font-weight: 700;
    padding-bottom: 11px;
    margin: 0 0 16px 0;
    border-bottom: 3px solid #008000;
  }
  .course-time-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    margin-bottom: 8px;
    background-color: #f8fafc;
    font-size: 13px;
  }
  .course-time-row .label {
    color: #64748b;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .course-time-row .val {
    color: #032e42;
    font-weight: 700;
    text-align: right;
  }
  .sidebar-feature-course {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background-color: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 10px;
    transition: all 0.2s ease;
  }
  .sidebar-feature-course:hover {
    border-color: #008000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .sidebar-feature-course img {
    width: 56px;
    height: 44px;
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0;
  }
  .sidebar-feature-course h5 {
    margin: 0;
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.35;
    color: #032e42;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sidebar-feature-course .view-link {
    background-color: #032e42;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 11.5px;
    font-weight: 600;
    text-decoration: none;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .sidebar-feature-course .view-link:hover {
    background-color: #008000;
    color: #fff;
  }

  /* ── Devimpact Popup Modals (.enquiry-overlay & #pum-35380) ── */
  .enquiry-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3, 46, 66, 0.72);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 99999;
  }
  .enquiry-modal {
    position: relative;
    width: 100%;
    max-width: 720px;
    max-height: 90vh;
    overflow-y: auto;
    background: #ffffff;
    border-radius: 16px;
    border: 2px solid #032e42;
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.32);
    animation: modalFadeIn 0.22s ease;
  }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .enquiry-modal-header {
    background: #032e42;
    color: #ffffff;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 3px solid #008000;
  }
  .enquiry-modal-header h3 {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
    color: #ffffff;
  }
  .enquiry-close-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    background: #032e42;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s ease;
    flex-shrink: 0;
  }
  .enquiry-close-btn:hover {
    background: #008000;
    border-color: #008000;
    transform: rotate(90deg);
  }
  .enquiry-modal-body {
    padding: 24px 28px 28px 28px;
  }
  .enquiry-course-summary {
    background: #f0fdf4;
    border-left: 4px solid #008000;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 13.5px;
    color: #032e42;
  }
  .enquiry-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .enquiry-field-full {
    grid-column: 1 / -1;
  }
  @media (max-width: 640px) {
    .enquiry-form-grid {
      grid-template-columns: 1fr;
    }
  }
  .enquiry-field label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #032e42;
  }
  .enquiry-field input,
  .enquiry-field select,
  .enquiry-field textarea {
    width: 100%;
    padding: 11px 14px;
    font-size: 14px;
    color: #1f2937;
    background: #f7f9fc;
    border: 1px solid #d6deeb;
    border-radius: 8px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .enquiry-field input:focus,
  .enquiry-field select:focus,
  .enquiry-field textarea:focus {
    background: #ffffff;
    border-color: #008000;
    box-shadow: 0 0 0 3px rgba(0, 128, 0, 0.14);
  }
  .enquiry-submit-btn {
    width: 100%;
    padding: 14px 22px;
    border: none;
    border-radius: 8px;
    background: #008000;
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    margin-top: 8px;
  }
  .enquiry-submit-btn:hover {
    background: #032e42;
    color: #ffffff;
  }

  /* ── Toast Notification (.wp-form-toast) ── */
  .wp-form-toast {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 100000;
    max-width: 400px;
    background: #ffffff;
    color: #1f2937;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
    border-left: 5px solid #008000;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: modalFadeIn 0.25s ease;
  }
`;

export default function ExecutiveTraining() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Safely normalize courses map or array into an array of course objects
  const allCourses = useMemo(() => {
    const raw = dataService.getCourses();
    if (!raw) return [];
    const list = Array.isArray(raw)
      ? raw
      : Object.entries(raw).map(([key, val]) => ({
          slug: key,
          ...(val || {}),
        }));
    return list.filter((c) => !c.isCategoryPage);
  }, []);

  // Safely resolve single course or category page by slug
  const courseInfo = useMemo(() => {
    if (!slug) return null;
    if (typeof dataService.getCourseBySlug === 'function') {
      return dataService.getCourseBySlug(slug);
    }
    const raw = dataService.getCourses();
    if (!raw) return null;
    if (Array.isArray(raw)) {
      return raw.find((c) => c?.slug === slug) || null;
    }
    return raw[slug] ? { slug, ...raw[slug] } : null;
  }, [slug]);

  // Determine whether we are viewing a Category / Course Finder page OR a Single Course Detail page
  const isCategoryOrCatalogView =
    !slug || Boolean(courseInfo?.isCategoryPage) || Boolean(categorySlugToName[slug] && !courseInfo);

  // Determine active category from URL slug or query param
  const initialCategoryFromSlug = useMemo(() => {
    if (slug && categorySlugToName[slug]) {
      return categorySlugToName[slug];
    }
    if (courseInfo?.isCategoryPage && courseInfo?.category) {
      return courseInfo.category;
    }
    const qCat = searchParams.get('category');
    if (qCat) {
      const normalized = qCat.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      return categorySlugToName[qCat] || categorySlugToName[normalized] || qCat;
    }
    return 'All';
  }, [slug, courseInfo, searchParams]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFromSlug);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const COURSES_PER_PAGE = 14;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accordion state in left sidebar filter
  const [openFilterSections, setOpenFilterSections] = useState({
    categories: true,
    format: true,
    venue: false,
    duration: false,
  });

  // Single course schedule tab state
  const [activeScheduleTab, setActiveScheduleTab] = useState('classroom');

  // Interactive Modal state (Inquiry / In-House Enquiry / Calendar Download)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'inquiry',
    courseTitle: '',
    courseCode: '',
    cohortDates: '',
    cohortVenue: '',
    cohortFormat: '',
    cohortFee: '',
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync category state when URL slug or query param changes
  useEffect(() => {
    if (slug && categorySlugToName[slug]) {
      setSelectedCategory(categorySlugToName[slug]);
      setCurrentPage(1);
    } else if (courseInfo?.isCategoryPage && courseInfo?.category) {
      setSelectedCategory(courseInfo.category);
      setCurrentPage(1);
    } else if (!slug) {
      const qCat = searchParams.get('category');
      if (qCat) {
        const normalized = qCat.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        const resolved = categorySlugToName[qCat] || categorySlugToName[normalized] || qCat;
        setSelectedCategory(resolved);
      } else {
        setSelectedCategory('All');
      }
      const qSearch = searchParams.get('q');
      if (qSearch !== null) setSearchQuery(qSearch);

      const qLoc = searchParams.get('location');
      if (qLoc) {
        const matched = TRAINING_VENUES.find((v) =>
          v.toLowerCase().includes(qLoc.toLowerCase().split('-')[0].trim()) ||
          qLoc.toLowerCase().includes(v.toLowerCase().split(',')[0].trim())
        );
        if (matched) {
          setSelectedVenues([matched]);
          setOpenFilterSections((prev) => ({ ...prev, venue: true }));
        }
      }
      setCurrentPage(1);
    }
  }, [slug, courseInfo, searchParams]);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  // Compute unique categories and counts from real courses
  const categoriesWithCounts = useMemo(() => {
    const counts = { All: allCourses.length };
    allCourses.forEach((c) => {
      const cat = c.category || 'Executive Training';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const orderedCats = ['All', ...Object.keys(counts).filter((k) => k !== 'All')];
    return orderedCats.map((cat) => ({
      name: cat,
      count: counts[cat] || 0,
    }));
  }, [allCourses]);

  // Filtered courses for the Course Category / Course Finder Loop
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      // Category match (exact or substring match for short category names)
      if (selectedCategory !== 'All') {
        const cCat = (course.category || '').toLowerCase();
        const sCat = selectedCategory.toLowerCase();
        if (cCat !== sCat && !cCat.includes(sCat) && !sCat.includes(cCat)) {
          const normC = cCat.replace(/[^a-z0-9]/g, '');
          const normS = sCat.replace(/[^a-z0-9]/g, '');
          if (normC !== normS && !normC.includes(normS) && !normS.includes(normC)) {
            return false;
          }
        }
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = course.title?.toLowerCase().includes(q);
        const matchCat = course.category?.toLowerCase().includes(q);
        const matchSummary = course.summary?.toLowerCase().includes(q);
        const matchCode = course.code?.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchSummary && !matchCode) return false;
      }
      // Duration filter
      if (selectedDurations.length > 0) {
        const cDur = (course.duration || '5 Days').toLowerCase();
        const matchesDur = selectedDurations.some((d) => {
          if (d.startsWith('5')) return cDur.includes('5') || cDur.includes('1 week');
          if (d.startsWith('10')) return cDur.includes('10') || cDur.includes('2 week');
          if (d.startsWith('3')) return cDur.includes('3 week') || cDur.includes('15');
          return true;
        });
        if (!matchesDur) return false;
      }
      return true;
    });
  }, [allCourses, selectedCategory, searchQuery, selectedDurations]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(start, start + COURSES_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const toggleFilterSection = (key) => {
    setOpenFilterSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayFilter = (setter, value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedFormats([]);
    setSelectedVenues([]);
    setSelectedDurations([]);
    setCurrentPage(1);
    if (searchParams.toString()) {
      setSearchParams({});
    }
  };

  const openModal = ({
    type = 'inquiry',
    courseTitle = '',
    courseCode = '',
    cohortDates = 'Flexible 2026 Intake',
    cohortVenue = 'Nairobi / Online / Custom',
    cohortFormat = 'Classroom or Online',
    cohortFee = '',
  }) => {
    setModalConfig({
      isOpen: true,
      type,
      courseTitle,
      courseCode,
      cohortDates,
      cohortVenue,
      cohortFormat,
      cohortFee,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };


  const handleInquiryAction = (channel) => {
    const isCustomInHouse = modalConfig.type === 'inhouse';
    const courseTitle = modalConfig.courseTitle || courseInfo?.title || 'Executive Training Programme';
    const dates = modalConfig.cohortDates;
    const venue = modalConfig.cohortVenue;
    const fee = modalConfig.cohortFee;
    const code = modalConfig.courseCode;

    closeModal();

    if (channel === 'whatsapp') {
      const msg = buildCorporateWhatsAppMessage({
        type: modalConfig.type,
        courseTitle,
        code,
        dates,
        venue,
        fee,
      });

      const waUrl = `https://wa.me/254728925306?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setToastMessage(`Opening WhatsApp to inquire about "${courseTitle}"...`);
    } else if (channel === 'email') {
      const subject = isCustomInHouse
        ? `Official Inquiry: Tailored In-House Training — ${courseTitle}`
        : `Executive Training Inquiry & Proforma Invoice Request — ${courseTitle}`;

      const emailBody = buildCorporateEmailTemplate({
        type: modalConfig.type,
        courseTitle,
        courseCode: code,
        cohortDates: dates,
        cohortVenue: venue,
        cohortFormat: modalConfig.cohortFormat,
        cohortFee: fee,
      });

      // Direct Gmail compose web link:
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=info@ecasiafrica.org&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      setToastMessage(`Opening Gmail with corporate inquiry template...`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    closeModal();
    if (modalConfig.type === 'calendar') {
      setToastMessage(`Thank you! Your 2026 ECAS Institute Training Calendar is downloading now.`);
      window.open('/courses/ECASI-BROCHURE.pdf', '_blank', 'noopener,noreferrer');
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Resolve image for any course item
  const getCourseImage = (item) => {
    if (!item) return '/images/Gallery/training_workshop_session.jpg';
    if (item.slug && courseFeaturedImages[item.slug]) return courseFeaturedImages[item.slug];
    if (item.image) return item.image;
    return '/images/Gallery/training_workshop_session.jpg';
  };

  /* ══════════════════════════════════════════════════════════════════════════
     VIEW 1: COURSE CATEGORY ARCHIVE / COURSE FINDER PAGE (Devimpact Clone)
     ══════════════════════════════════════════════════════════════════════════ */
    const renderFilterControls = (isMobile = false) => (
    <div>
      <div className="course-finder-filter-title">
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#008000]" />
          Filter Courses
        </span>
        <span className="text-xs font-semibold text-slate-500">
          {filteredCourses.length} Courses
        </span>
      </div>

      {/* Quick keyword input inside sidebar */}
      <div className="course-finder-search-wrapper">
        <input
          type="text"
          className="course-finder-input-field"
          placeholder="Quick filter keyword..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
      </div>

      {/* 1. Course Categories Accordion */}
      <div className="course-finder-toggle-menu">
        <button
          type="button"
          className={`course-finder-toggle-btn ${openFilterSections.categories ? 'active' : ''}`}
          onClick={() => toggleFilterSection('categories')}
        >
          <span>Course Categories</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${openFilterSections.categories ? 'rotate-180' : ''}`}
          />
        </button>
        {openFilterSections.categories && (
          <div className="course-finder-toggle-content">
            {categoriesWithCounts.map((cat) => (
              <label key={cat.name} className="course-finder-checkbox-item">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name={isMobile ? "course_category_mobile" : "course_category"}
                    checked={selectedCategory === cat.name}
                    onChange={() => {
                      setSelectedCategory(cat.name);
                      setCurrentPage(1);
                    }}
                  />
                  <span className="leading-snug">{cat.name}</span>
                </span>
                <span className="course-finder-count-pill">{cat.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2. Delivery Format Accordion */}
      <div className="course-finder-toggle-menu">
        <button
          type="button"
          className={`course-finder-toggle-btn ${openFilterSections.format ? 'active' : ''}`}
          onClick={() => toggleFilterSection('format')}
        >
          <span>Delivery Format</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${openFilterSections.format ? 'rotate-180' : ''}`}
          />
        </button>
        {openFilterSections.format && (
          <div className="course-finder-toggle-content">
            {DELIVERY_FORMATS.map((fmt) => (
              <label key={fmt} className="course-finder-checkbox-item">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedFormats.includes(fmt)}
                    onChange={() => toggleArrayFilter(setSelectedFormats, fmt)}
                  />
                  <span>{fmt}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 3. Training Location / Venue Accordion */}
      <div className="course-finder-toggle-menu">
        <button
          type="button"
          className={`course-finder-toggle-btn ${openFilterSections.venue ? 'active' : ''}`}
          onClick={() => toggleFilterSection('venue')}
        >
          <span>Training Location</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${openFilterSections.venue ? 'rotate-180' : ''}`}
          />
        </button>
        {openFilterSections.venue && (
          <div className="course-finder-toggle-content">
            {TRAINING_VENUES.map((venue) => (
              <label key={venue} className="course-finder-checkbox-item">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedVenues.includes(venue)}
                    onChange={() => toggleArrayFilter(setSelectedVenues, venue)}
                  />
                  <span>{venue}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Duration Accordion */}
      <div className="course-finder-toggle-menu">
        <button
          type="button"
          className={`course-finder-toggle-btn ${openFilterSections.duration ? 'active' : ''}`}
          onClick={() => toggleFilterSection('duration')}
        >
          <span>Course Duration</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${openFilterSections.duration ? 'rotate-180' : ''}`}
          />
        </button>
        {openFilterSections.duration && (
          <div className="course-finder-toggle-content">
            {TRAINING_DURATIONS.map((dur) => (
              <label key={dur} className="course-finder-checkbox-item">
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDurations.includes(dur)}
                    onChange={() => toggleArrayFilter(setSelectedDurations, dur)}
                  />
                  <span>{dur}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Filters Button */}
      <button
        type="button"
        className="course-finder-reset-btn"
        onClick={handleResetFilters}
      >
        Reset All Filters
      </button>

      {/* 2026 Training Calendar Download Box */}
      <div className="mt-5 p-4 rounded-lg bg-[#032e42] text-white text-center">
        <Calendar className="w-7 h-7 text-[#008000] mx-auto mb-2" />
        <h4 className="font-bold text-sm mb-1 text-white">2026 Training Calendar</h4>
        <p className="text-xs text-white/80 mb-3">
          Download our full 2026 Executive Training Catalogue & Dates.
        </p>
        <button
          type="button"
          onClick={() => {
            if (isMobile) setMobileFiltersOpen(false);
            openModal({
              type: 'calendar',
              courseTitle: '2026 Executive Training Calendar',
            });
          }}
          className="w-full py-2 px-3 rounded bg-[#008000] hover:bg-[#006600] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Download 2026 Calendar
        </button>
      </div>
    </div>
  );

  if (isCategoryOrCatalogView) {
    const activeCatTitle =
      selectedCategory === 'All'
        ? courseInfo?.title || 'Executive Training Courses & Professional Programs'
        : courseInfo?.isCategoryPage
        ? courseInfo.title
        : `${selectedCategory}`;
    const activeCatDescription =
      courseInfo?.summary ||
      categoryDescriptions[selectedCategory] ||
      categoryDescriptions['All'];

    return (
      <div className="min-h-screen flex flex-col devimpact-page-wrap">
        <SEO
          title={`${activeCatTitle} | ECAS Institute`}
          description={activeCatDescription}
        />
        <style>{devimpactCourseStyles}</style>
        <Header />

        {/* Top Breadcrumb Bar */}
        <div className="ast-breadcrumbs-wrapper">
          <div className="ast-breadcrumbs-inner">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">»</span>
            <Link to="/institute-overview">Courses</Link>
            {selectedCategory !== 'All' && (
              <>
                <span className="breadcrumb-sep">»</span>
                <span className="breadcrumb-leaf">{selectedCategory}</span>
              </>
            )}
          </div>
        </div>

        {/* Hero Banner (.course-detail-info) */}
        <section className="course-detail-info">
          <div className="single-course-custom-breadcrumb">
            <h1>{activeCatTitle}</h1>
            <p className="hero-desc">{activeCatDescription}</p>

            {/* In-House Training Pill Button (.shortcode-inhouse-open-btn) */}
            <div style={{ margin: '14px 0 8px 0' }}>
              <button
                type="button"
                className="shortcode-inhouse-open-btn"
                onClick={() =>
                  openModal({
                    type: 'inhouse',
                    courseTitle:
                      selectedCategory === 'All'
                        ? 'Tailored In-House Institutional Training'
                        : `${selectedCategory} - Custom In-House Training`,
                  })
                }
              >
                <span className="icon">★</span>
                <span>Request Tailored In-House Training for Your Team</span>
              </button>
            </div>

            {/* Centered Search Form (.course-input-search-form) */}
            <form
              className="course-input-search-form"
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
              }}
            >
              <input
                type="text"
                className="course-search-input"
                placeholder="Search courses by title, topic, keyword or course code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <button type="submit" className="course-search-button">
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Main Two-Column Loop Wrapper (.courses-loop-wrapper) */}
        <main className="courses-loop-wrapper flex-1">
          {/* DESKTOP SIDEBAR: Course Finder Accordion Filter (hidden on mobile) */}
          <aside className="course-finder-search-filter desktop-only hidden lg:block">
            {renderFilterControls(false)}
          </aside>

          {/* MOBILE OFF-CANVAS SLIDE-OVER DRAWER */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[100] flex lg:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setMobileFiltersOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer Content */}
              <div className="relative ml-auto w-[85%] max-w-[340px] h-full bg-white shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#008000]" />
                    <h3 className="font-bold text-sm text-[#032e42]">Filter Courses</h3>
                    <span className="text-xs bg-[#008000]/10 text-[#008000] font-semibold px-2 py-0.5 rounded-full">
                      {filteredCourses.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter Controls Body */}
                <div className="flex-1 overflow-y-auto p-4">
                  {renderFilterControls(true)}
                </div>

                {/* Sticky Drawer Footer */}
                <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-1/3 py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition text-center"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-2/3 py-2.5 px-4 bg-[#008000] hover:bg-[#006600] text-white font-bold text-xs rounded-lg transition text-center shadow-md"
                  >
                    Show ({filteredCourses.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT MAIN AREA: Custom Course Loop (.custom-course-loop) */}
          <section className="min-w-0 w-full">
            {/* Mobile Filter Trigger Bar (Visible only on mobile < lg / 992px) */}
            <div className="lg:hidden mb-4 p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#032e42] truncate">
                  {selectedCategory === 'All' ? 'All Professional Courses' : selectedCategory}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                  <span>{filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found</span>
                  {(selectedFormats.length > 0 || selectedVenues.length > 0 || selectedDurations.length > 0 || selectedCategory !== 'All') && (
                    <span className="text-[#008000] font-semibold bg-[#008000]/10 px-1.5 py-0.5 rounded text-[10px]">
                      {selectedFormats.length + selectedVenues.length + selectedDurations.length + (selectedCategory !== 'All' ? 1 : 0)} Active
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#008000] hover:bg-[#006600] text-white font-bold text-xs shadow-sm active:scale-95 transition flex-shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {(selectedFormats.length > 0 || selectedVenues.length > 0 || selectedDurations.length > 0 || selectedCategory !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>
            {/* Header Bar */}
            <div className="custom-course-loop-header">
              <div>
                <h2>
                  {selectedCategory === 'All'
                    ? 'All Professional Training Courses'
                    : `${selectedCategory}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing{' '}
                  <strong className="text-[#032e42]">
                    {filteredCourses.length === 0
                      ? 0
                      : (currentPage - 1) * COURSES_PER_PAGE + 1}
                    –{Math.min(currentPage * COURSES_PER_PAGE, filteredCourses.length)}
                  </strong>{' '}
                  of <strong className="text-[#032e42]">{filteredCourses.length}</strong>{' '}
                  courses
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded border text-xs font-semibold inline-flex items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-[#032e42] text-white border-[#032e42]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#032e42]'
                  }`}
                  title="List View"
                >
                  <LayoutList className="w-4 h-4" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded border text-xs font-semibold inline-flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-[#032e42] text-white border-[#032e42]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#032e42]'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grid
                </button>
              </div>
            </div>

            {/* Course List / Grid */}
            {paginatedCourses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <BookOpen className="w-12 h-12 text-[#008000] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#032e42] mb-2">
                  No courses match your current filter criteria
                </h3>
                <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
                  Try clearing your search keyword or switching to &ldquo;All&rdquo; course categories.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="devimpact-btn"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`custom-course-loop ${viewMode === 'grid' ? 'grid-mode' : ''}`}>
                {paginatedCourses.map((course) => {
                  const thumb = getCourseImage(course);
                  return (
                    <div key={course.slug} className="custom-course-item">
                      <Link to={`/executive-training/${course.slug}`} className="shrink-0">
                        <img
                          src={thumb}
                          alt={course.title}
                          className="custom-course-thumb"
                          loading="lazy"
                        />
                      </Link>
                      <div className="custom-title-links-wrapper">
                        <div>
                          <h3 className="custom-course-title">
                            <Link to={`/executive-training/${course.slug}`}>
                              {course.title}
                            </Link>
                          </h3>
                          <div className="custom-course-meta">
                            {course.category && (
                              <span className="cat-badge">{course.category}</span>
                            )}
                            <span>
                              <Clock className="w-3.5 h-3.5 text-[#008000]" />
                              {course.duration || '5 Days'}
                            </span>
                            <span>
                              <MapPin className="w-3.5 h-3.5 text-[#032e42]" />
                              {course.location ? `${course.location.replace(/ \/ Online$/, '')} / Dubai / Malaysia / Online` : 'Nairobi / Mombasa / Kigali / Dubai / Malaysia / Online'}
                            </span>
                          </div>
                        </div>

                        <div className="custom-course-links">
                          <Link
                            to={`/executive-training/${course.slug}`}
                            className="view-btn"
                          >
                            View Course
                          </Link>
                          <Link
                            to={`/register?schedule=400827&course=${encodeURIComponent(course.slug)}&title=${encodeURIComponent(course.title)}&venue=${encodeURIComponent(course.location || 'Nairobi, Kenya')}&fee=1200`}
                            className="reg-btn"
                          >
                            Register
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination (.custom-pagination-container) */}
            {totalPages > 1 && (
              <div className="custom-pagination-container">
                <div className="custom-pagination">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 260, behavior: 'smooth' });
                    }}
                  >
                    « Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={currentPage === page ? 'current' : ''}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 260, behavior: 'smooth' });
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 260, behavior: 'smooth' });
                    }}
                  >
                    Next »
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Interactive Popup Modal & Toast */}
        {renderModalsAndToast(modalConfig, closeModal, handleModalSubmit, handleInquiryAction, toastMessage)}
        <Footer />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     VIEW 2: SINGLE COURSE DETAIL VIEW (Devimpact Clone)
     ══════════════════════════════════════════════════════════════════════════ */
  if (!courseInfo) {
    return (
      <div className="min-h-screen flex flex-col devimpact-page-wrap">
        <SEO title="Course Not Found | ECAS Institute" />
        <style>{devimpactCourseStyles}</style>
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <GraduationCap className="w-16 h-16 text-[#008000] mb-4" />
          <h1 className="text-3xl font-extrabold text-[#032e42] mb-2">Course Not Found</h1>
          <p className="text-slate-600 mb-6 max-w-md">
            The training course you are looking for may have been moved or updated in our 2026 catalog.
          </p>
          <Link to="/institute-overview" className="devimpact-btn">
            Browse All Courses
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const courseBannerImg = getCourseImage(courseInfo);
  const { classroomCohorts, onlineCohorts } = generateCourseSchedules(
    courseInfo.title,
    courseInfo.duration || '5 Days'
  );
  const formattedHtmlContent = formatCourseHtmlContent(courseInfo.content || '');

  // Related courses in the same category for the right sidebar
  const relatedCourses = allCourses
    .filter((c) => c.slug !== slug && c.category === courseInfo.category)
    .slice(0, 5);
  const sidebarCourses =
    relatedCourses.length > 0 ? relatedCourses : allCourses.filter((c) => c.slug !== slug).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col devimpact-page-wrap">
      <SEO
        title={`${courseInfo.title} | ECAS Institute`}
        description={
          courseInfo.summary ||
          courseInfo.subtitle ||
          `Executive training course on ${courseInfo.title} offered by ECAS Institute in Nairobi, Mombasa, Kigali, Dubai, and Online.`
        }
      />
      <style>{devimpactCourseStyles}</style>
      <Header />

      {/* 1. Top Breadcrumb Bar (.ast-breadcrumbs-wrapper) */}
      <div className="ast-breadcrumbs-wrapper">
        <div className="ast-breadcrumbs-inner">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">»</span>
          <Link to="/institute-overview">Courses</Link>
          {courseInfo.category && (
            <>
              <span className="breadcrumb-sep">»</span>
              <Link
                to={`/institute-overview?category=${encodeURIComponent(courseInfo.category)}`}
              >
                {courseInfo.category}
              </Link>
            </>
          )}
          <span className="breadcrumb-sep">»</span>
          <span className="breadcrumb-leaf">{courseInfo.title}</span>
        </div>
      </div>

      {/* 2. Top Hero Banner (.course-detail-info & .single-course-custom-breadcrumb) */}
      <section className="course-detail-info">
        <div className="single-course-custom-breadcrumb">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-3">
            {courseInfo.category && (
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-wider text-[#008000]">
                {courseInfo.category}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white">
              Duration: {courseInfo.duration || '5 Days'}
            </span>
          </div>

          <h1>{courseInfo.title}</h1>

          {(courseInfo.summary || courseInfo.subtitle) && (
            <p className="hero-desc">{courseInfo.summary || courseInfo.subtitle}</p>
          )}

          {/* Hero Action Buttons & Social Share Row (.custom-breadcrumb-row) Exactly matching Screenshot 2 */}
          <div className="custom-breadcrumb-row">
            <div className="custom-breadcrumb-buttons">
              <Link
                to={`/register?schedule=${classroomCohorts[0]?.scheduleNo || 400827}&course=${encodeURIComponent(courseInfo.slug)}&title=${encodeURIComponent(courseInfo.title)}&venue=${encodeURIComponent(classroomCohorts[0]?.venue || 'Nairobi, Kenya')}&fee=1200`}
                className="btn"
                style={{ backgroundColor: '#008000', borderColor: '#ffffff', color: '#ffffff' }}
              >
                <span>Register Now</span>
                <UserPlus className="w-4 h-4 stroke-[2.2]" />
              </Link>

              <button
                type="button"
                className="btn btn-outline-highlight"
                style={{ backgroundColor: '#032e42', borderColor: '#ffffff', color: '#ffffff' }}
                onClick={() => {
                  const outlineEl = document.getElementById('course-outline') || document.querySelector('.entry-content');
                  if (outlineEl) {
                    outlineEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <span>View Course Outline</span>
                <ArrowDown className="w-4 h-4 stroke-[2.2]" />
              </button>

              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#032e42', borderColor: '#ffffff', color: '#ffffff' }}
                onClick={() =>
                  openModal({
                    type: 'inhouse',
                    courseTitle: courseInfo.title,
                    courseCode: courseInfo.code || '',
                    cohortDates: 'Upcoming 2026 Cohorts',
                    cohortVenue: 'Nairobi / Mombasa / Online',
                    cohortFormat: 'Course Enquiry',
                  })
                }
              >
                <span>Enquire About this Course</span>
                <MessageSquare className="w-4 h-4 stroke-[2.2]" />
              </button>

              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#032e42', borderColor: '#ffffff', color: '#ffffff' }}
                onClick={() =>
                  openModal({
                    type: 'calendar',
                    courseTitle: courseInfo.title,
                    courseCode: courseInfo.code || '',
                  })
                }
              >
                <span>Download Course Brochure</span>
                <Download className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Social Share Icons: Facebook, LinkedIn, WhatsApp */}
            <div className="custom-breadcrumb-social-icons">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Share on Facebook"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4 text-white hover:text-[#4ade80]" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-white hover:text-[#4ade80]" />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this executive training course: ${courseInfo.title} at ECAS Institute - ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-white hover:text-[#4ade80]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Schedule & Registration Tabs (.course-register-tabs) */}
      <section className="course-register-section">
        <div className="course-register-tabs">
          <div className="course-register-tab-buttons">
            <button
              type="button"
              className={`course-register-tab-btn ${activeScheduleTab === 'classroom' ? 'active' : ''}`}
              onClick={() => setActiveScheduleTab('classroom')}
            >
              <MapPin className="w-4 h-4" />
              Classroom Training Schedule (2026)
            </button>
            <button
              type="button"
              className={`course-register-tab-btn ${activeScheduleTab === 'online' ? 'active' : ''}`}
              onClick={() => setActiveScheduleTab('online')}
            >
              <Globe className="w-4 h-4" />
              Online / Virtual Training Schedule (2026)
            </button>
            <button
              type="button"
              className={`course-register-tab-btn ${activeScheduleTab === 'inhouse' ? 'active' : ''}`}
              onClick={() => setActiveScheduleTab('inhouse')}
            >
              <Building2 className="w-4 h-4" />
              In-House / Custom Institutional Training
            </button>
          </div>

          {activeScheduleTab === 'classroom' && (
            <div className="course-register-tab-content">
              <table>
                <thead>
                  <tr>
                    <th>Training Dates</th>
                    <th>Duration</th>
                    <th>Venue / Location</th>
                    <th>Delivery Mode</th>
                    <th>Tuition Fee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classroomCohorts.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold text-[#032e42]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#008000]" />
                          {c.dates}
                        </span>
                      </td>
                      <td>{c.duration}</td>
                      <td>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#032e42]" />
                          {c.venue}
                        </span>
                      </td>
                      <td>{c.format}</td>
                      <td className="font-semibold">
                        {c.feeUsd}{' '}
                        <span className="text-xs text-slate-500 font-normal">
                          ({c.feeKes})
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <Link
                          to={`/register?schedule=${c.scheduleNo || 400827}&course=${encodeURIComponent(courseInfo.slug)}&title=${encodeURIComponent(courseInfo.title)}&venue=${encodeURIComponent(c.venue)}&fee=${encodeURIComponent(c.feeUsd.replace(/[^0-9]/g, '') || '1200')}`}
                          className="btn"
                          style={{ backgroundColor: '#008000', borderColor: '#008000' }}
                        >
                          Register
                        </Link>
                        <button
                          type="button"
                          className="btn outline"
                          onClick={() =>
                            openModal({
                              type: 'inquiry',
                              courseTitle: courseInfo.title,
                              courseCode: courseInfo.code || '',
                              cohortDates: c.dates,
                              cohortVenue: c.venue,
                              cohortFormat: `${c.format} (Enquiry)`,
                              cohortFee: `${c.feeUsd} (${c.feeKes})`,
                            })
                          }
                        >
                          Enquire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeScheduleTab === 'online' && (
            <div className="course-register-tab-content">
              <table>
                <thead>
                  <tr>
                    <th>Training Dates</th>
                    <th>Duration</th>
                    <th>Platform / Format</th>
                    <th>Delivery Mode</th>
                    <th>Tuition Fee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineCohorts.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold text-[#032e42]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#008000]" />
                          {c.dates}
                        </span>
                      </td>
                      <td>{c.duration}</td>
                      <td>{c.venue}</td>
                      <td>{c.format}</td>
                      <td className="font-semibold">
                        {c.feeUsd}{' '}
                        <span className="text-xs text-slate-500 font-normal">
                          ({c.feeKes})
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <Link
                          to={`/register?schedule=${c.scheduleNo || 400827}&course=${encodeURIComponent(courseInfo.slug)}&title=${encodeURIComponent(courseInfo.title)}&venue=${encodeURIComponent(c.venue)}&fee=${encodeURIComponent(c.feeUsd.replace(/[^0-9]/g, '') || '850')}`}
                          className="btn"
                          style={{ backgroundColor: '#008000', borderColor: '#008000' }}
                        >
                          Register Online
                        </Link>
                        <button
                          type="button"
                          className="btn outline"
                          onClick={() =>
                            openModal({
                              type: 'inquiry',
                              courseTitle: courseInfo.title,
                              courseCode: courseInfo.code || '',
                              cohortDates: c.dates,
                              cohortVenue: c.venue,
                              cohortFormat: `${c.format} (Enquiry)`,
                              cohortFee: `${c.feeUsd} (${c.feeKes})`,
                            })
                          }
                        >
                          Enquire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeScheduleTab === 'inhouse' && (
            <div className="p-6 bg-[#f7f9fc] rounded-xl border border-slate-200 text-center">
              <h3 className="text-xl font-bold text-[#032e42] mb-2">
                Tailored In-House Training for Your Organization
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl mx-auto mb-5 leading-relaxed">
                We can customize <strong>{courseInfo.title}</strong> to address your institution&apos;s specific datasets, regulatory environment, and operational goals. Available for groups of 5 or more participants at your premises or any preferred venue across Africa and the Middle East.
              </p>
              <button
                type="button"
                className="devimpact-btn"
                onClick={() =>
                  openModal({
                    type: 'inhouse',
                    courseTitle: courseInfo.title,
                    courseCode: courseInfo.code || '',
                    cohortDates: 'Flexible Client-Selected Dates',
                    cohortVenue: 'On-Site / Client Preferred Location',
                    cohortFormat: 'Customized In-House Cohort',
                  })
                }
              >
                <Users className="w-4 h-4" />
                Request Custom In-House Proposal
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Main Two-Column Course Body (.single-post-container) */}
      <main className="single-post-container flex-1">
        {/* LEFT COLUMN: Course Article Card (.single-post-article) */}
        <article className="single-post-article">
          {/* Article Header (.entry-header) */}
          <header className="entry-header">
            <span className="entry-category">
              {courseInfo.category || 'Executive Training'}
            </span>
            <h2 className="entry-title">{courseInfo.title}</h2>
            <div className="entry-meta">
              <span>
                <Clock className="w-4 h-4 text-[#008000]" />
                <strong>Duration:</strong> {courseInfo.duration || '5 Days'}
              </span>
              <span>
                <MapPin className="w-4 h-4 text-[#008000]" />
                <strong>Venues:</strong> Nairobi, Mombasa, Kigali, Arusha, Dubai, Malaysia & Online
              </span>
              <span>
                <Award className="w-4 h-4 text-[#008000]" />
                <strong>Certificate:</strong> ECAS Institute Executive Certificate
              </span>
            </div>
          </header>

          {/* Featured Course Image (.post-thumbnail) */}
          <div className="post-thumbnail">
            <img src={courseBannerImg} alt={courseInfo.title} />
          </div>

          {/* Course Content Body (.entry-content) */}
          <div className="entry-content">
            {formattedHtmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: formattedHtmlContent }} />
            ) : (
              <>
                <h2>Course Overview</h2>
                <p>
                  {courseInfo.summary ||
                    courseInfo.subtitle ||
                    `This intensive executive training course on ${courseInfo.title} equips policy leaders, project managers, and technical specialists with practical frameworks, global standards, and hands-on analytical tools for immediate institutional impact.`}
                </p>
              </>
            )}

            {/* Training Methodology & Certification Highlight Box (.devimpact-highlight) */}
            <div className="devimpact-highlight">
              <h3 style={{ marginTop: 0 }}>Training Methodology & Executive Certification</h3>
              <p style={{ marginBottom: '12px' }}>
                This course combines interactive expert lectures, real-world African and global case studies, group simulations, policy clinics, and hands-on technical exercises led by seasoned practitioners.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Certification:</strong> Upon successful completion of the programme, participants are awarded an official <strong>ECAS Institute Certificate of Executive Completion</strong>.
              </p>
            </div>

            {/* Bottom Call-to-Action Box (.devimpact-action) */}
            <div className="devimpact-action">
              <h3>Ready to Enroll or Customize This Course for Your Team?</h3>
              <p>
                Join our upcoming 2026 classroom or virtual cohorts, or request a tailored in-house training package delivered at your preferred location and schedule.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/register?schedule=${classroomCohorts[0]?.scheduleNo || 400827}&course=${encodeURIComponent(courseInfo.slug)}&title=${encodeURIComponent(courseInfo.title)}&venue=${encodeURIComponent(classroomCohorts[0]?.venue || 'Nairobi, Kenya')}&fee=${encodeURIComponent((courseInfo.fee || '1200').replace(/[^0-9]/g, '') || '1200')}`}
                  className="devimpact-btn"
                >
                  <GraduationCap className="w-4 h-4" />
                  Register for This Course
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openModal({
                      type: 'inhouse',
                      courseTitle: courseInfo.title,
                      courseCode: courseInfo.code || '',
                    })
                  }
                  className="px-5 py-3 rounded-lg border-2 border-white text-white font-bold text-sm hover:bg-white hover:text-[#032e42] transition"
                >
                  Request In-House Training
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* RIGHT COLUMN: Sticky Sidebar (.sidebar-main) */}
        <aside className="sidebar-main">
          {/* Widget 1: Course Key Facts & Quick Registration */}
          <div className="widget">
            <h3 className="widget-title">Course Summary</h3>
            <div className="course-time-row">
              <span className="label">
                <Clock className="w-3.5 h-3.5 text-[#008000]" />
                Duration
              </span>
              <span className="val">{courseInfo.duration || '5 Days'}</span>
            </div>
            <div className="course-time-row">
              <span className="label">
                <Globe className="w-3.5 h-3.5 text-[#008000]" />
                Format
              </span>
              <span className="val">{courseInfo.format || 'Classroom / Online / In-House'}</span>
            </div>
            <div className="course-time-row">
              <span className="label">
                <MapPin className="w-3.5 h-3.5 text-[#008000]" />
                Venues
              </span>
              <span className="val">Nairobi, Mombasa, Kigali, Dubai, Malaysia</span>
            </div>
            <div className="course-time-row">
              <span className="label">
                <Award className="w-3.5 h-3.5 text-[#008000]" />
                Certificate
              </span>
              <span className="val">Yes (Executive Certificate)</span>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                to={`/register?schedule=${classroomCohorts[0]?.scheduleNo || 400827}&course=${encodeURIComponent(courseInfo.slug)}&title=${encodeURIComponent(courseInfo.title)}&venue=${encodeURIComponent(classroomCohorts[0]?.venue || "Nairobi, Kenya")}&fee=${encodeURIComponent((courseInfo.fee || "1200").replace(/[^0-9]/g, "") || "1200")}`}
                className="w-full py-3 px-4 rounded-lg bg-[#008000] hover:bg-[#006600] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition shadow-sm"
              >
                <GraduationCap className="w-4 h-4" />
                Register Now
              </Link>

              <button
                type="button"
                onClick={() =>
                  openModal({
                    type: "inhouse",
                    courseTitle: courseInfo.title,
                    courseCode: courseInfo.code || "",
                  })
                }
                className="w-full py-2.5 px-4 rounded-lg bg-[#032e42] hover:bg-[#1e73be] text-white font-semibold text-xs inline-flex items-center justify-center gap-2 transition"
              >
                <Users className="w-4 h-4 text-[#4ade80]" />
                Request In-House Training
              </button>
            </div>
          </div>

          {/* Widget 2: Related / Featured Courses (.sidebar-feature-course) */}
          <div className="widget">
            <h3 className="widget-title">Related Courses</h3>
            <div>
              {sidebarCourses.map((rc) => (
                <div key={rc.slug} className="sidebar-feature-course">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={getCourseImage(rc)}
                      alt={rc.title}
                      loading="lazy"
                    />
                    <h5>{rc.title}</h5>
                  </div>
                  <Link
                    to={`/executive-training/${rc.slug}`}
                    className="view-link"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/institute-overview"
                className="text-xs font-bold text-[#032e42] hover:text-[#008000] inline-flex items-center gap-1"
              >
                Browse All {allCourses.length}+ Courses
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Widget 3: 2026 Training Calendar & Direct Contact */}
          <div className="widget">
            <h3 className="widget-title">Training Downloads & Support</h3>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Download our complete 2026 Training Calendar or speak directly with our admissions team.
            </p>
            <button
              type="button"
              onClick={() =>
                openModal({
                  type: 'calendar',
                  courseTitle: courseInfo.title,
                })
              }
              className="w-full py-2.5 px-4 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition mb-3"
            >
              <Download className="w-4 h-4" />
              Download 2026 Training Calendar
            </button>
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#008000]" />
                <a href="mailto:info@ecasiafrica.org" className="hover:text-[#032e42] font-medium">
                  info@ecasiafrica.org
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#008000]" />
                <span>+254 728 925 306 | Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Interactive Popup Modal & Toast */}
      {renderModalsAndToast(modalConfig, closeModal, handleModalSubmit, handleInquiryAction, toastMessage)}
      <Footer />
    </div>
  );
}

/* ── Corporate Executive Email & WhatsApp Template Builders ── */
function buildCorporateEmailTemplate({
  type = 'inquiry',
  courseTitle = 'Executive Training Programme',
  courseCode = '',
  cohortDates = '',
  cohortVenue = '',
  cohortFormat = '',
  cohortFee = '',
}) {
  const isCustomInHouse = type === 'inhouse';

  if (isCustomInHouse) {
    return [
      'Dear ECAS Institute Executive Training Team,',
      '',
      'RE: REQUEST FOR CUSTOMIZED IN-HOUSE INSTITUTIONAL TRAINING PROPOSAL',
      `Programme Focus: ${courseTitle}`,
      '',
      'Our organization is interested in commissioning ECAS Institute to deliver a tailored in-house executive training programme for our team.',
      '',
      '══════════════════════════════════════════════════════════',
      'PROPOSED TRAINING PARAMETERS',
      '══════════════════════════════════════════════════════════',
      `• Core Subject Area:       ${courseTitle}`,
      courseCode ? `• Course Reference Code:   ${courseCode}` : null,
      cohortVenue ? `• Preferred Venue / City:   ${cohortVenue}` : '• Preferred Venue:          On-Site (Client Premises) / Executive Retreat',
      cohortDates ? `• Target Dates / Intake:    ${cohortDates}` : '• Target Timeline:          Flexible / Upcoming Quarter 2026',
      `• Delivery Format:          Tailored In-House (Classroom / Hybrid)`,
      '',
      '══════════════════════════════════════════════════════════',
      'INSTITUTIONAL & CONTACT DETAILS',
      '══════════════════════════════════════════════════════════',
      '• Sponsoring Organization:  [Enter Ministry / Organization / Company Name]',
      '• Department / Division:    [Enter Department or Unit]',
      '• Contact Person & Title:   [Enter Full Name and Official Designation]',
      '• Official Work Email:      [Enter Corporate / Institutional Email]',
      '• Telephone / WhatsApp:     [Enter Direct Phone Number]',
      '• Estimated Participant Count: [e.g. 5 to 25 Delegates]',
      '',
      '══════════════════════════════════════════════════════════',
      'REQUESTED DELIVERABLES & DOCUMENTATION',
      '══════════════════════════════════════════════════════════',
      'To enable our executive management and procurement committee to review and approve this engagement, kindly share:',
      '1. Tailored modular technical syllabus and day-by-day training agenda',
      '2. Official institutional quotation / proforma invoice addressed to our organization',
      '3. Lead facilitator profiles and practical case-study learning methodology',
      '4. Statutory NITA accreditation credentials for training levy reimbursement',
      '',
      'We appreciate your prompt assistance and look forward to receiving your customized proposal.',
      '',
      'Yours faithfully,',
      '',
      '[Your Full Name]',
      '[Your Job Title]',
      '[Your Organization / Ministry / Company]',
      '[Your Direct Telephone Number]'
    ].filter(Boolean).join('\n');
  }

  return [
    'Dear ECAS Institute Admissions & Executive Development Directorate,',
    '',
    'RE: OFFICIAL TRAINING INQUIRY & PROFORMA INVOICE REQUEST',
    `Programme: ${courseTitle}${courseCode ? ` (Ref Code: ${courseCode})` : ''}`,
    '',
    'I am writing on behalf of our institution to formally inquire about enrollment, seat reservation, and admission procedures for the following executive programme at ECAS Institute:',
    '',
    '══════════════════════════════════════════════════════════',
    'EXECUTIVE PROGRAMME DETAILS',
    '══════════════════════════════════════════════════════════',
    `• Course Title:      ${courseTitle}`,
    courseCode ? `• Course Code:       ${courseCode}` : null,
    cohortDates ? `• Cohort Schedule:   ${cohortDates}` : '• Cohort Schedule:   Upcoming 2026 Intake',
    cohortVenue ? `• Training Venue:    ${cohortVenue}` : '• Training Venue:    Nairobi / Mombasa / Kigali / Online',
    cohortFormat ? `• Delivery Mode:     ${cohortFormat}` : '• Delivery Mode:     Classroom (In-Person) or Virtual Online',
    cohortFee ? `• Standard Tuition:  ${cohortFee}` : null,
    '',
    '══════════════════════════════════════════════════════════',
    'DELEGATE & SPONSOR INFORMATION',
    '══════════════════════════════════════════════════════════',
    '• Sponsoring Organization:  [Enter Ministry / Corporate / NGO / Self]',
    '• Nominated Delegate Name:  [Enter Participant Full Name]',
    '• Designation / Job Title:  [Enter Current Professional Title]',
    '• Official Work Email:      [Enter Corporate Email Address]',
    '• Contact Telephone:        [Enter Mobile / WhatsApp Number]',
    '• Number of Participants:   [e.g. 1 Delegate / Group Booking]',
    '',
    '══════════════════════════════════════════════════════════',
    'REQUESTED DOCUMENTATION & ACTION',
    '══════════════════════════════════════════════════════════',
    'To facilitate our internal review, approval, and invoice processing, kindly furnish us with:',
    '1. Complete course brochure, learning modules, and daily schedule',
    '2. Official proforma invoice addressed to our sponsoring organization',
    '3. Available reservation slots and registration deadlines',
    '4. Bank wire payment guidelines and official admission instructions',
    '',
    'Thank you for your prompt cooperation. We look forward to hearing from you.',
    '',
    'Yours faithfully,',
    '',
    '[Your Full Name]',
    '[Your Job Title]',
    '[Your Organization / Ministry / Company]',
    '[Your Telephone Number]'
  ].filter(Boolean).join('\n');
}

function buildCorporateWhatsAppMessage({
  type = 'inquiry',
  courseTitle = 'Executive Training Programme',
  code = '',
  dates = '',
  venue = '',
  fee = '',
}) {
  const isCustomInHouse = type === 'inhouse';
  if (isCustomInHouse) {
    return [
      '*ECAS INSTITUTE — IN-HOUSE TRAINING INQUIRY*',
      '───────────────────────────────',
      'Dear Admissions Team,',
      '',
      'Our organization would like to request an official in-house training proposal for:',
      `• *Programme:* ${courseTitle}`,
      code ? `• *Course Code:* ${code}` : null,
      dates ? `• *Preferred Timeline:* ${dates}` : null,
      venue ? `• *Preferred Venue:* ${venue}` : null,
      '',
      'Kindly share your customized technical syllabus, trainer profiles, and proforma quotation for institutional review.',
      '',
      'Thank you.'
    ].filter(Boolean).join('\n');
  }

  return [
    '*ECAS INSTITUTE — EXECUTIVE TRAINING INQUIRY*',
    '───────────────────────────────',
    'Dear Admissions Team,',
    '',
    'I am inquiring about seat reservation and admission details for:',
    `• *Course Title:* ${courseTitle}`,
    code ? `• *Course Code:* ${code}` : null,
    dates ? `• *Intake Dates:* ${dates}` : null,
    venue ? `• *Venue:* ${venue}` : null,
    fee ? `• *Tuition Fee:* ${fee}` : null,
    '',
    'Kindly share the complete course curriculum, official proforma invoice, and registration instructions.',
    '',
    'Thank you.'
  ].filter(Boolean).join('\n');
}


/* ── Shared Modal & Toast Renderer (Devimpact #pum-35380 & .enquiry-overlay style) ── */
function renderModalsAndToast(modalConfig, closeModal, handleModalSubmit, handleInquiryAction, toastMessage) {
  return (
    <>
      {modalConfig.isOpen && (
        <div className="enquiry-overlay" onClick={closeModal}>
          <div className="enquiry-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="enquiry-modal-header">
              <h3>
                {modalConfig.type === 'calendar'
                  ? 'Download 2026 ECAS Institute Training Calendar'
                  : modalConfig.type === 'inhouse'
                  ? 'Inquire: Tailored In-House Training Proposal'
                  : 'Inquire About This Course'}
              </h3>
              <button
                type="button"
                className="enquiry-close-btn"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="enquiry-modal-body">
              {modalConfig.courseTitle && (
                <div className="enquiry-course-summary">
                  <div className="font-bold text-sm mb-1 text-[#032e42]">{modalConfig.courseTitle}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                    {modalConfig.courseCode && (
                      <span>
                        <strong>Code:</strong> {modalConfig.courseCode}
                      </span>
                    )}
                    {modalConfig.cohortDates && (
                      <span>
                        <strong>Dates:</strong> {modalConfig.cohortDates}
                      </span>
                    )}
                    {modalConfig.cohortVenue && (
                      <span>
                        <strong>Venue:</strong> {modalConfig.cohortVenue}
                      </span>
                    )}
                    {modalConfig.cohortFee && (
                      <span>
                        <strong>Tuition:</strong> {modalConfig.cohortFee}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {modalConfig.type === 'calendar' ? (
                <form onSubmit={handleModalSubmit}>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Click the button below to download the official 2026 ECAS Institute Executive Training Calendar.
                  </p>
                  <button type="submit" className="enquiry-submit-btn">
                    Download 2026 Training Calendar Now
                  </button>
                </form>
              ) : (
                <div className="py-2">
                  <p className="text-sm font-semibold text-[#032e42] mb-1">
                    How would you like to inquire about this course?
                  </p>
                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    Choose <strong>WhatsApp</strong> for immediate chat with our admissions team or <strong>Email</strong> to receive the full syllabus, quotation, and official proforma invoice.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Option 1: WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleInquiryAction('whatsapp')}
                      className="group flex flex-col items-center justify-center p-5 rounded-xl border-2 border-[#25D366] bg-green-50/50 hover:bg-[#25D366] text-[#032e42] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#25D366] text-white group-hover:bg-white group-hover:text-[#25D366] flex items-center justify-center mb-2.5 transition-colors shadow-sm">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.42-.101.825zM12.004 2C6.48 2 2 6.48 2 12.008c0 1.947.562 3.766 1.533 5.309L2 22.5l5.347-1.401A9.957 9.957 0 0012.004 22c5.523 0 10.004-4.48 10.004-9.992C22.008 6.48 11.527 2 12.004 2z"/>
                        </svg>
                      </div>
                      <span className="font-bold text-base leading-snug">Inquire on WhatsApp</span>
                      <span className="text-[11px] opacity-80 mt-1">Instant chat &amp; quick queries</span>
                    </button>

                    {/* Option 2: Email (Gmail Web / Email Client) */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleInquiryAction('email')}
                        className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-[#008000] bg-emerald-50/50 hover:bg-[#008000] text-[#032e42] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer text-center h-full"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#008000] text-white group-hover:bg-white group-hover:text-[#008000] flex items-center justify-center mb-2 transition-colors shadow-sm">
                          <Mail className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span className="font-bold text-base leading-snug">Inquire via Gmail</span>
                        <span className="text-[11px] opacity-80 mt-0.5">Opens Gmail compose</span>
                      </button>
                      <a
                        href={`mailto:info@ecasiafrica.org?subject=${encodeURIComponent(
                          modalConfig.type === 'inhouse'
                            ? `Official Inquiry: Tailored In-House Training — ${modalConfig.courseTitle || 'Executive Training'}`
                            : `Executive Training Inquiry & Proforma Invoice Request — ${modalConfig.courseTitle || 'Executive Training'}`
                        )}&body=${encodeURIComponent(
                          buildCorporateEmailTemplate({
                            type: modalConfig.type,
                            courseTitle: modalConfig.courseTitle || 'Executive Training Programme',
                            courseCode: modalConfig.courseCode,
                            cohortDates: modalConfig.cohortDates,
                            cohortVenue: modalConfig.cohortVenue,
                            cohortFormat: modalConfig.cohortFormat,
                            cohortFee: modalConfig.cohortFee,
                          })
                        )}`}
                        onClick={closeModal}
                        className="text-center text-[11px] text-slate-500 hover:text-[#008000] hover:underline py-0.5"
                      >
                        or open default Mail app
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                    <span>Admissions Email: <strong>info@ecasiafrica.org</strong></span>
                    <span>Direct Call/WhatsApp: <strong>+254 728 925 306</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="wp-form-toast">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed font-medium text-slate-800">
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}
