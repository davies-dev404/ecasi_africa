import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowUpRight, Search, Landmark, Wallet, CloudSun, Cpu,
  FolderKanban, Briefcase, Award, Building2, Users, Globe,
  ChevronLeft, ChevronRight, Star, CheckCircle2, MapPin, Clock, X, Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import beryleImg from '@/assets/beryle.png';
import yasukoImg from '@/assets/yasuko.png';

// ─── ECAS Partners Data (Retained) ───────────────────────────────────────────
const partners = [
  { name: "Clean Air Fund", logo: "/images/partners/breathe_cities_logo.png", url: "https://www.cleanairfund.org/" },
  { name: "Bloomberg Philanthropies", logo: "/images/bloomberg.png", url: "https://www.bloomberg.org/" },
  { name: "Breathe Cities", logo: "/images/breaths.png", url: "https://breathecities.org/" },
  { name: "Nairobi City County", logo: "/images/partners/nairobi_county.png", url: "https://nairobi.go.ke/" },
  { name: "Government of Kenya", logo: "/images/partners/gok_harambee.png", url: "https://www.kenya.go.ke/" },
  { name: "Council of Governors", logo: "/images/partners/council_of_governors.png", url: "https://www.cog.go.ke/" },
  { name: "University of Nairobi (ICCA)", logo: "/images/partners/uon.png", url: "https://icca.uonbi.ac.ke/" },
  { name: "Kenyatta University", logo: "/images/partners/academic_ku.png", url: "https://www.ku.ac.ke/" },
  { name: "Technical University of Mombasa", logo: "/images/partners/academic_tum.png", url: "https://www.tum.ac.ke/" },
  { name: "Maseno University", logo: "/images/partners/academic_maseno.png", url: "https://www.maseno.ac.ke/" },
  { name: "Environment Institute of Kenya", logo: "/images/partners/eik.png", url: "https://eik.co.ke/" },
  { name: "Adaptation Research Alliance", logo: "/images/partners/ara.png", url: "https://www.adaptationresearchalliance.org/" },
  { name: "Kenya Climate Change Working Group", logo: "/images/partners/kccwg.png", url: "https://kccwg.org/" },
  { name: "Ukama", logo: "/images/partners/ukama.png", url: "https://www.ukama-learning.org/" },
  { name: "Pan African Climate Justice Alliance", logo: "/images/partners/pacja.png", url: "https://www.pacja.org/" },
];

// ─── Hero Background Slides for Dynamic Video/Visual Effect ──────────────────
const heroBgs = [
  "/images/Gallery/1732710492385.jpg",
  "/images/Gallery/training_workshop_session.jpg",
  "/images/courses/executive_training.jpg",
  "/images/courses/IMGM1984-1024x683.jpg",
];

// ─── Course Search Dropdown Options ──────────────────────────────────────────
const searchCategories = [
  { value: "climate-finance", label: "Climate Finance & Public Financial Management" },
  { value: "climate-change", label: "Climate Change & Sustainability" },
  { value: "carbon-markets", label: "Carbon Markets & ESG" },
  { value: "leadership-and-corporate-governance", label: "Leadership, Governance & Anti-Corruption" },
  { value: "project-management-and-me", label: "Project Management, Procurement & M&E" },
  { value: "human-resources", label: "Human Resources & 5IR Office Administration" },
  { value: "communication-and-public-relations", label: "Communication, PR & Government Protocol" },
  { value: "data-and-it", label: "Big Data, Analytics, IT & Cybersecurity" },
  { value: "artificial-intelligence", label: "Artificial Intelligence & Machine Learning" },
  { value: "environmental-health-and-safety", label: "Air Quality, Environmental Health & Safety" },
  { value: "organizational-change-management", label: "Organizational Change Management" },
  { value: "design-thinking-in-policy-reforms", label: "Design Thinking in Policy Reforms" },
];

const searchLocations = [
  "Nairobi - Kenya",
  "Mombasa - Kenya",
  "Naivasha - Kenya",
  "Arusha - Tanzania",
  "Dar es Salaam - Tanzania",
  "Kigali - Rwanda",
  "Kampala - Uganda",
  "Dubai - UAE",
  "Kuala Lumpur - Malaysia",
  "Abuja - Nigeria",
  "Accra - Ghana",
  "Pretoria - South Africa",
];

const searchFormats = [
  { value: "Classroom", label: "Classroom" },
  { value: "Online", label: "Online" },
  { value: "In-House", label: "In-House / Custom Cohort" },
];

const searchMonths = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// ─── Why Choose ECAS Institute (Devimpact 6 Value Cards) ─────────────────────
const whyChooseItems = [
  {
    title: "Expert Trainers",
    desc: "Our facilitators are industry leaders, policy experts, and practitioners who bring a wealth of experience to the classroom. They blend global best practices with local expertise - ensuring participants gain knowledge that’s relevant, practical, and immediately applicable."
  },
  {
    title: "Excellence You Can Trust",
    desc: "We have successfully delivered hundreds of training programs for government ministries, state departments, development partners, financial institutions, and private organizations. Our clients choose us for our consistency, NITA & NEMA accreditation, professionalism, and proven results."
  },
  {
    title: "Customized Learning",
    desc: "We don’t believe in one-size-fits-all. Every training program is carefully and strategically tailored to meet your organization’s unique goals and context - with case studies, exercises, and discussions designed to make learning highly engaging and impactful."
  },
  {
    title: "Flexible and Accessible Learning",
    desc: "Whether you prefer in-person classroom cohorts, virtual sessions, or blended in-house training, our training formats are designed for flexibility. We make learning accessible and convenient for busy professionals and teams spread across different regions."
  },
  {
    title: "Quality and Measurable Impact",
    desc: "Quality is our hallmark. From course design to delivery, institutional action planning, and post-training evaluation, we focus on achieving measurable outcomes - helping individuals grow and organizations thrive."
  },
  {
    title: "Ongoing Support",
    desc: "Our engagement doesn’t end when the training concludes. We provide participants with post-training support, actionable toolkits, access to resources, and opportunities for continuous learning."
  }
];

// ─── Our Course Categories (Devimpact Dark Grid Layout with ECAS Courses) ─────
const courseCategoriesGrid = [
  {
    title: "Governance, Leadership & Organizational Development",
    path: "/executive-training/leadership-and-corporate-governance",
    icon: Landmark,
    links: [
      { label: "Governance, Ethics and Anti-Corruption Reforms", path: "/executive-training/governance-ethics-and-anti-corruption-reforms" },
      { label: "Proactive Management & Strategic Leadership", path: "/executive-training/proactive-management-and-strategic-leadership" },
      { label: "Management Course for Office Administrators (5IR & AI)", path: "/executive-training/management-course-for-office-administrators-5ir-ai" },
      { label: "Modern Office Productivity: Time, Workflow & Digital Work", path: "/executive-training/modern-office-productivity-time-workflow-and-digital-work-management" },
      { label: "21st Century, Public Relations and Interpersonal Skills", path: "/executive-training/21st-century-public-relations-and-interpersonal-skills" },
      { label: "Government Protocol, Etiquette and Events Management", path: "/executive-training/government-protocol-etiquette-and-events-management" },
      { label: "Organizational Change Management Programme", path: "/executive-training/organizational-change-management" },
      { label: "Design Thinking in Policy Reforms", path: "/executive-training/design-thinking-in-policy-reforms" },
    ]
  },
  {
    title: "Climate Finance, Budgeting & Public Finance (PFM)",
    path: "/executive-training/climate-finance",
    icon: Wallet,
    links: [
      { label: "Climate Finance and Investment Strategies", path: "/executive-training/climate-finance-and-investment-strategies" },
      { label: "Climate-Responsive Budgeting & Strategic Fiscal Management", path: "/executive-training/climate-responsive-budgeting-and-strategic-fiscal-management" },
      { label: "Strategic Climate Finance Budgeting, Tracking & Reporting", path: "/executive-training/strategic-climate-finance-budgeting-tracking-and-performance-reporting" },
      { label: "Innovations in PFM: Climate Finance, AI & Ethical Leadership", path: "/executive-training/innovations-in-public-financial-management-climate-finance-ai-ethical-leadership" },
      { label: "Certified Expert in Climate Adaptation Finance", path: "/executive-training/certified-expert-in-climate-adaptation-finance" },
      { label: "Certificate in Green Finance", path: "/executive-training/certificate-in-green-finance" },
      { label: "Certified Expert in Sustainable Finance", path: "/executive-training/certified-expert-in-sustainable-finance" },
      { label: "Certified Expert in Biodiversity Finance", path: "/executive-training/certified-expert-in-biodiversity-finance" },
    ]
  },
  {
    title: "Business, Procurement & Corporate Sustainability",
    path: "/executive-training/carbon-markets",
    icon: Briefcase,
    links: [
      { label: "Public Procurement Process and Asset Management", path: "/executive-training/public-procurement-process-and-asset-management" },
      { label: "Structuring & Managing Special Purpose Vehicle (SPV) for PPP", path: "/executive-training/structuring-and-managing-special-purpose-vehicle-for-ppp" },
      { label: "Environmental, Social and Governance (ESG) Courses", path: "/executive-training/esg" },
      { label: "Carbon Accounting & Carbon Offsetting Course", path: "/executive-training/carbon-accounting-carbon-offsetting-course" },
      { label: "Agricultural Carbon Credit Markets", path: "/executive-training/agricultural-carbon-credit-markets" },
      { label: "Training on Carbon Markets and Trading", path: "/executive-training/training-on-carbon-markets" },
      { label: "Business Sustainability Management", path: "/executive-training/business-sustainability-management" },
      { label: "Certified Expert in Environmental Accounting", path: "/executive-training/certified-expert-in-environmental-accounting" },
    ]
  },
  {
    title: "Environment, Climate Change & Sustainability",
    path: "/executive-training/climate-change",
    icon: CloudSun,
    links: [
      { label: "Climate Change Mitigation, Adaptation & Technology Responses", path: "/executive-training/introduction-to-climate-change-mitigation-adaptation-and-technology-responses" },
      { label: "Air Quality Policy, Monitoring & Management", path: "/executive-training/air-quality" },
      { label: "Renewable Energy, Green Economy & Just Transition", path: "/executive-training/energy" },
      { label: "Energy Transition and Sustainable Mobility", path: "/executive-training/energy-transition-and-mobility" },
      { label: "Agriculture and Sustainable Food Systems", path: "/executive-training/agriculture-and-food-systems" },
      { label: "Climate-Smart Forestry & Biodiversity", path: "/executive-training/climate-smart-forestry" },
      { label: "Nature-Based Solutions for Disaster & Climate Resilience", path: "/executive-training/certificate-course-on-nature-based-solutions-for-disaster-and-climate-resilience" },
      { label: "Health, Safety and Environment (HSE) Workshop", path: "/executive-training/health-safety-and-environment-hse-workshop" },
    ]
  },
  {
    title: "Digital, Data, Artificial Intelligence & Technology",
    path: "/executive-training/data-and-it",
    icon: Cpu,
    links: [
      { label: "Learning from Big Data, Data Mining & Business Analytics", path: "/executive-training/learning-from-big-data-data-mining-and-business-analytics" },
      { label: "Secure Coding for Software Security Engineering Programme", path: "/executive-training/secure-coding-for-software-security-engineering-programme" },
      { label: "Artificial Intelligence in Project Management & M&E", path: "/executive-training/artificial-intelligence-in-project-management-me" },
      { label: "Artificial Intelligence & Machine Learning Executive Courses", path: "/executive-training/artificial-intelligence" },
      { label: "Data Analytics Using MS Excel & Power BI", path: "/executive-training/data-analytics-using-ms-excel-power-bi" },
      { label: "Mobile Data Collection (ODK, ONA, CommCare & Kobo)", path: "/executive-training/mobile-data-collection-using-odk-ona-commcare-and-kobo-toolbox" },
      { label: "Climate Risk Data Intelligence & Information Systems", path: "/executive-training/climate-risk-data-intelligence-and-information-systems" },
      { label: "Information Security and Data Governance", path: "/executive-training/information-security-and-data-management-training" },
    ]
  },
  {
    title: "Project Management, Monitoring & Evaluation",
    path: "/executive-training/project-management-and-me",
    icon: FolderKanban,
    links: [
      { label: "AI in Project Management, Monitoring and Evaluation (M&E)", path: "/executive-training/artificial-intelligence-in-project-management-me" },
      { label: "Monitoring, Evaluation, Accountability & Learning (MEAL)", path: "/executive-training/monitoring-evaluation-accountability-learning-meal-and-outcome-harvesting" },
      { label: "Project Design, Restructuring & Performance Contracting", path: "/executive-training/project-design-management-restructuring-and-performance-contracting" },
      { label: "Feasibility Studies: Preparation, Analysis and Evaluation", path: "/executive-training/feasibility-studies-preparation-analysis-and-evaluation" },
      { label: "Conducting Environmental Impact Assessment (EIA) for Projects", path: "/executive-training/conducting-environmental-impact-assessment-for-projects-and-operations" },
      { label: "Developing Grant Proposals and Fundraising Techniques", path: "/executive-training/developing-grant-proposals-and-fundraising-techniques" },
      { label: "Climate Resilient Infrastructure Development", path: "/executive-training/climate-resilient-infrastructure" },
      { label: "Gender Equality, Diversity and Social Inclusion (GEDSI)", path: "/executive-training/gender-equality-diversity-and-social-inclusion-gedsi" },
    ]
  }
];

// ─── Featured Flagship Executive Courses (From Ecasi_Courses.rar) ────────────
const flagshipCourses = [
  {
    title: "Climate-Responsive Budgeting and Strategic Fiscal Management",
    slug: "climate-responsive-budgeting-and-strategic-fiscal-management",
    category: "Climate Finance & PFM",
    duration: "3 Weeks (15 Days)",
    location: "Nairobi / Arusha / Mombasa",
    image: "/images/Gallery/1732710492385.jpg",
  },
  {
    title: "Strategic Climate Finance Budgeting, Tracking and Performance Reporting",
    slug: "strategic-climate-finance-budgeting-tracking-and-performance-reporting",
    category: "Climate Finance & PFM",
    duration: "3 Weeks (15 Days)",
    location: "Nairobi / Arusha / Mombasa",
    image: "/images/Gallery/1715195551211.jpg",
  },
  {
    title: "Innovations in Public Financial Management: Climate Finance, AI & Ethical Leadership",
    slug: "innovations-in-public-financial-management-climate-finance-ai-ethical-leadership",
    category: "Executive Cohort Programme",
    duration: "4 Weeks (20 Days)",
    location: "Arusha, Tanzania / Nairobi / Kuala Lumpur, Malaysia",
    image: "/images/courses/mentorship_group.jpg",
  },
  {
    title: "Artificial Intelligence in Project Management, Monitoring and Evaluation (M&E)",
    slug: "artificial-intelligence-in-project-management-me",
    category: "AI & Project Management",
    duration: "2 Weeks (10 Days)",
    location: "Nairobi / Kigali / Online",
    image: "/images/research/tech.png",
  },
  {
    title: "Climate Finance and Investment Strategies",
    slug: "climate-finance-and-investment-strategies",
    category: "Climate Finance",
    duration: "2 Weeks (10 Days)",
    location: "Nairobi / Naivasha",
    image: "/images/courses/IMGM1984-1024x683.jpg",
  },
  {
    title: "Governance, Ethics and Anti-Corruption Reforms",
    slug: "governance-ethics-and-anti-corruption-reforms",
    category: "Governance & Leadership",
    duration: "2 Weeks (10 Days)",
    location: "Nairobi / Mombasa",
    image: "/images/Gallery/regulation_training_group.jpg",
  },
  {
    title: "Management Course for Office Administrators (5IR & AI-Enabled Administration)",
    slug: "management-course-for-office-administrators-5ir-ai",
    category: "HR & Office Administration",
    duration: "2 Weeks (10 Days)",
    location: "Nairobi / Mombasa / Naivasha",
    image: "/images/Gallery/DSC_0055.JPG",
  },
  {
    title: "Modern Office Productivity: Time, Workflow and Digital Work Management",
    slug: "modern-office-productivity-time-workflow-and-digital-work-management",
    category: "Office Productivity & AI",
    duration: "3 Weeks (15 Days)",
    location: "Nairobi / Arusha / Mombasa",
    image: "/images/Gallery/DSC_0085.JPG",
  },
  {
    title: "Public Procurement Process and Asset Management",
    slug: "public-procurement-process-and-asset-management",
    category: "Procurement & Asset Mgmt",
    duration: "2 Weeks (10 Days)",
    location: "Nairobi / Mombasa",
    image: "/images/research/policy_advisory_meeting.jpg",
  },
  {
    title: "Structuring and Managing a Special Purpose Vehicle (SPV) for PPP",
    slug: "structuring-and-managing-special-purpose-vehicle-for-ppp",
    category: "PPP & Infrastructure Finance",
    duration: "5 Days",
    location: "Nairobi / Naivasha / Dubai / Kuala Lumpur, Malaysia",
    image: "/images/Gallery/1730827985704.jpg",
  },
  {
    title: "Secure Coding for Software Security Engineering Programme",
    slug: "secure-coding-for-software-security-engineering-programme",
    category: "Cybersecurity & IT",
    duration: "5 Days",
    location: "Nairobi / Online",
    image: "/images/Gallery/DSC_0082.JPG",
  },
  {
    title: "Learning from Big Data, Data Mining and Business Analytics",
    slug: "learning-from-big-data-data-mining-and-business-analytics",
    category: "Data & Business Analytics",
    duration: "1 Week (5 Days)",
    location: "Nairobi / Online",
    image: "/images/Gallery/DSC_0091.JPG",
  },
];

// ─── Beyond the Classroom Cards (5 Curated Nairobi Excursions) ───────────────
const beyondClassroomCards = [
  {
    slug: "giraffe-centre",
    title: "Magical Visit to the Giraffe Centre",
    image: "/images/beyond/giraffe_centre.jpg",
    desc: "Nestled in leafy Lang'ata, this peaceful sanctuary allows visitors an unforgettable, up-close encounter with endangered Rothschild giraffes while promoting conservation, education, and sustainability.",
    details: "Hand-feed giraffes special food pellets from elevated wooden platforms, learn about wildlife protection at the education centre, and explore the tranquil indigenous forest nature trail."
  },
  {
    slug: "above-the-city",
    title: "Above the City: KICC Rooftop & Helipad",
    image: "/images/beyond/above_the_city.jpg",
    desc: "Standing tall at the heart of Nairobi’s CBD, visit the iconic KICC rooftop and helipad for breathtaking 360-degree panoramic views of the city skyline and Nairobi National Park.",
    details: "Experience golden hour and sunset vistas as daylight transitions into a glittering sea of lights. A refreshing, breeze-filled haven for executive cohort networking and reflection high above the city."
  },
  {
    slug: "nairobi-safari-walk",
    title: "Nairobi Safari Walk",
    image: "/images/beyond/nairobi_safari_walk.jpg",
    desc: "Experience Kenya's rich wildlife and botanical heritage along elevated wooden boardwalks meandering through Wetlands, Savannah, and Moist Forest ecosystems at the gate of Nairobi National Park.",
    details: "Observe the rare mountain bongo, white rhinos, albino zebras, cheetahs, and lions in naturalistic habitats alongside over 150 identified species of indigenous Kenyan trees."
  },
  {
    slug: "city-walk",
    title: "The City Walk & Nairobi Expressway",
    image: "/images/beyond/nairobi_expressway.jpg",
    desc: "Discover Nairobi’s dynamic urban pulse, from the historic Parliament buildings and Dedan Kimathi monument to the elevated 27km Nairobi Expressway and revitalized Nairobi Green City (NGC) parks.",
    details: "A curated guided walk through Nairobi's civic landmarks and newly landscaped Uhuru Park, concluding with single-origin Kenyan specialty coffee at a historic central roastery."
  },
  {
    slug: "nairobi-shopping",
    title: "A Taste of Nairobi Shopping",
    image: "/images/beyond/nairobi_shopping.png",
    desc: "Step into Nairobi’s vibrant shopping scene at the world-famous Maasai Market, artisan boutiques, and craft collectives for handmade jewelry, textiles, and authentic Kenyan coffee & tea.",
    details: "Shop hand-woven sisal kiondo bags, Maasai beadwork, soapstone carvings, and high-altitude single-origin Kenyan AA coffee with accompanied bargaining guidance and packing support."
  }
];

// ─── Training Testimonials (Retained & Expanded in Devimpact Google-Review Style) ───
const trainingTestimonials = [
  {
    name: "Beryl Omolo",
    role: "Konza Technopolis Authority",
    quote: "It’s my first training and coming in I had so many expectations about knowing where these carbon markets are, is carbon markets really a thing. What I have learnt is very important and going back to the office I’ll be able to make an impact with the information.",
    image: beryleImg
  },
  {
    name: "Yasuko Inoue",
    role: "Projects Expert, JICA",
    quote: "I really thank the organizers of this training that is NETFUND and ECAS. There’s a lot of people who are interested in carbon markets and we are learning with each other, as we interact with various people who are very passionate.",
    image: yasukoImg
  },
  {
    name: "Clifford Siocha",
    role: "Senior Environmentalist, KETRACO",
    quote: "I’m quite delighted to be among the participants of the training on carbon markets as offered by NETFUND in collaboration with ECAS. Very structured training content and well organized facilitators.",
    image: ""
  },
  {
    name: "Robert Ayaga",
    role: "Electrical Engineer, KETRACO",
    quote: "My experience in this workshop, actually I was very green... I really appreciate this training. I intend to take this to KETRACO where I want to take advantage of our credit points. I appreciate this opportunity and I believe that we are going to keep in touch.",
    image: ""
  },
  {
    name: "Mosele Mahana",
    role: "Public Sector Finance Delegate",
    quote: "Very nice experience I had at ECAS Institute, well organized staff members and very structured executive training content on climate-responsive budgeting and fiscal management.",
    image: ""
  },
  {
    name: "William Bigirwa",
    role: "Regional Programme Coordinator",
    quote: "I've had a wonderful experience with the training team and I'd highly recommend them for any executive capacity building needs. My facilitator was well versed in the topic area and the fun activities around Nairobi after classes were amazing as well.",
    image: ""
  }
];

// ─── Milestones Counter Data (Retained & Animated on Open / Scroll) ─────────
const milestones = [
  { target: 15, suffix: "+", label: "Years of Experience", icon: Award },
  { target: 30, suffix: "+", label: "Impacted Organizations", icon: Building2 },
  { target: 5, suffix: "K+", label: "Impacted Professionals", icon: Users },
  { target: 8, suffix: "+", label: "Impacted Countries", icon: Globe },
];

function AnimatedMilestoneCard({ milestone }) {
  const [count, setCount] = useState(0);
  const cardRef = useRef(null);
  const IconComp = milestone.icon;

  useEffect(() => {
    let animationFrameId;
    const duration = 1800; // 1.8s smooth count-up

    const runCounter = () => {
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * milestone.target));
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCount(milestone.target);
        }
      };
      setCount(0);
      animationFrameId = requestAnimationFrame(step);
    };

    // Run on page open AND re-trigger when scrolled into view
    runCounter();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [milestone.target]);

  return (
    <div
      ref={cardRef}
      className="bg-transparent border-b-4 border-[#008000] rounded-xl p-6 text-center flex flex-col items-center justify-center transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="w-14 h-14 rounded-full bg-[#008000] flex items-center justify-center mb-3 text-white shadow-sm">
        <IconComp size={26} />
      </div>
      <div
        className="text-3xl sm:text-4xl font-extrabold text-[#032e42] mb-1 tabular-nums"
        style={{ fontFamily: "'Fira Sans', sans-serif" }}
      >
        {count}
        {milestone.suffix}
      </div>
      <h3 className="text-slate-700 text-sm sm:text-base font-bold">
        {milestone.label}
      </h3>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();

  // Hero background crossfade
  const [heroBgIdx, setHeroBgIdx] = useState(0);

  // Course filter state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [keywordQuery, setKeywordQuery] = useState("");

  // Carousels state
  const [whyIndex, setWhyIndex] = useState(0);
  const [whyPaused, setWhyPaused] = useState(false);
  const [beyondModal, setBeyondModal] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Course categories compact & filter state (to save scrolling space & time)
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroBgIdx((prev) => (prev + 1) % heroBgs.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Automatic moving carousel for "Why Choose ECAS Institute"
  useEffect(() => {
    if (whyPaused) return;
    const interval = setInterval(() => {
      setWhyIndex((prev) => (prev + 1) % whyChooseItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [whyPaused]);

  // Automatic moving carousel for "Training Testimonials"
  useEffect(() => {
    if (testimonialPaused) return;
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % trainingTestimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonialPaused]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedLocation) params.set("location", selectedLocation);
    if (selectedFormat) params.set("format", selectedFormat);
    if (selectedMonth) params.set("month", selectedMonth);
    navigate(`/institute-overview?${params.toString()}`);
  };

  const handleKeywordSubmit = (e) => {
    e.preventDefault();
    if (keywordQuery.trim()) {
      navigate(`/institute-overview?q=${encodeURIComponent(keywordQuery.trim())}`);
    } else {
      navigate(`/institute-overview`);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubmitted(false), 5000);
    }
  };

  return (
    <>
      <SEO
        title="Professional Executive Training Courses in Kenya & Africa | ECAS Institute"
        description="Build practical skills with ECAS Institute’s professional executive training courses in Nairobi and beyond. Explore classroom, online and tailored in-house training in Climate Finance, AI, PFM, Governance, Carbon Markets & Project Management."
      />
      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        {/* ══════════════════════════════════════════════════════════════════════
            1. HERO SECTION (Devimpact Layout & Typography)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[480px] md:min-h-[540px] flex items-center justify-center overflow-hidden bg-[#021d38]">
          {/* Crossfading background images */}
          {heroBgs.map((bg, idx) => (
            <img
              key={bg}
              src={bg}
              alt="ECAS Executive Training"
              fetchPriority={idx === 0 ? "high" : "auto"}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 ${
                idx === heroBgIdx ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* ECAS Navy & Green overlay with enhanced visibility for background training images */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(3, 46, 66, 0.58) 0%, rgba(3, 46, 66, 0.68) 55%, rgba(0, 102, 0, 0.62) 100%)"
            }}
          />

          {/* Centered Hero Content */}
          <div className="relative z-10 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
            <h1
              className="text-white font-extrabold tracking-tight mb-6 leading-[1.18]"
              style={{
                fontFamily: "'Fira Sans', 'Nunito Sans', sans-serif",
                fontSize: "clamp(28px, 4.5vw, 52px)",
              }}
            >
              Practical Training Solutions for <br className="hidden sm:inline" />
              Professionals
            </h1>

            <p
              className="text-white/95 max-w-4xl mx-auto text-center text-base md:text-lg leading-relaxed mb-9 font-normal"
              style={{ fontFamily: "'Roboto', 'Nunito', sans-serif", textAlign: "center" }}
            >
              Enroll in our flexible online or instructor-led classroom training programs and gain in-demand workplace skills guided by seasoned industry professionals. Our courses combine practical learning, real-world application, and internationally relevant best practices to help you advance your career and earn recognized professional certifications.
            </p>

            {/* Two Pill CTA Buttons in ECAS Green & ECAS Blue */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                to="/institute-overview"
                className="inline-flex items-center gap-2.5 bg-[#008000] hover:bg-[#006600] text-white font-bold text-sm md:text-base px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <ArrowUpRight size={18} className="stroke-[2.5]" />
                <span>Explore Courses</span>
              </Link>

              <a
                href="#course-categories"
                className="inline-flex items-center gap-2.5 bg-[#1e73be] hover:bg-[#032e42] text-white font-bold text-sm md:text-base px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <ArrowUpRight size={18} className="stroke-[2.5]" />
                <span>Executive Trainings</span>
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            2. COURSE FILTER & SEARCH BAR (Devimpact 2-Row Filter + Search)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-20 -mt-8 md:-mt-10 px-4 sm:px-6">
          <div
            className="max-w-[1380px] w-full mx-auto bg-white rounded-xl p-5 md:p-7 border border-[#032e42]/10"
            style={{ boxShadow: "0px 4px 20px rgba(3, 46, 66, 0.16)" }}
          >
            {/* Row 1: Category, Location, Format, Month + Submit */}
            <form
              onSubmit={handleFilterSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-4"
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Select Category"
                className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-gray-50/70 text-[#032e42] text-sm font-medium focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition-all"
              >
                <option value="">Select Category</option>
                {searchCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Select Location"
                className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-gray-50/70 text-[#032e42] text-sm font-medium focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition-all"
              >
                <option value="">Select Location</option>
                {searchLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                aria-label="Select Format"
                className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-gray-50/70 text-[#032e42] text-sm font-medium focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition-all"
              >
                <option value="">Select Format</option>
                {searchFormats.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Select Month"
                className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-gray-50/70 text-[#032e42] text-sm font-medium focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition-all"
              >
                <option value="">Select Month</option>
                {searchMonths.map((m) => (
                  <option key={m.value} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full h-11 bg-[#032e42] hover:bg-[#008000] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Submit
              </button>
            </form>

            {/* Row 2: Keyword Search Input + Search Button */}
            <form onSubmit={handleKeywordSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={keywordQuery}
                  onChange={(e) => setKeywordQuery(e.target.value)}
                  placeholder="Search Courses (e.g., Climate Finance, AI in Project Management, Procurement, SPV for PPP, Office Administration...)"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-[#032e42] text-sm placeholder-gray-400 focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/15 transition-all"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-8 bg-[#008000] hover:bg-[#1e73be] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            3. ABOUT ECAS INSTITUTE (Devimpact Centered Style)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="pt-14 pb-10 px-4 sm:px-6 bg-white">
          <div className="max-w-[1380px] w-full mx-auto text-center">
            <ScrollAnimation animation="slide-up">
              <h2
                className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[35px] mb-5"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                About ECAS Institute
              </h2>
              <p
                className="text-[#1a202c] text-base md:text-[17px] leading-relaxed max-w-4xl mx-auto"
                style={{ textAlign: "center" }}
              >
                We are dedicated to empowering professionals and organizations through transformative learning experiences that build practical skills, enhance performance, and drive sustainable impact. Founded in 2011 and accredited by NITA and NEMA, ECAS Institute combines international best practices with African relevance across Climate Finance, Public Financial Management, Governance, Artificial Intelligence, Project Management, and Sustainability—ensuring that learning is both meaningful and applicable to real-world challenges.
              </p>
            </ScrollAnimation>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            4. WHY CHOOSE ECAS INSTITUTE (Automatic Moving Carousel)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          className="py-10 md:py-14 px-4 sm:px-6 bg-white"
          onMouseEnter={() => setWhyPaused(true)}
          onMouseLeave={() => setWhyPaused(false)}
        >
          <div className="max-w-[1380px] w-full mx-auto">
            <ScrollAnimation animation="slide-up">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-center sm:text-left">
                  <h2
                    className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[35px]"
                    style={{ fontFamily: "'Fira Sans', sans-serif" }}
                  >
                    Why Choose ECAS Institute
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Excellence, accredited certifications, and real-world African leadership experience.
                  </p>
                </div>
                {/* Carousel Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setWhyIndex((prev) => (prev === 0 ? whyChooseItems.length - 1 : prev - 1))
                    }
                    aria-label="Previous slide"
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#032e42] hover:bg-[#008000] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setWhyIndex((prev) => (prev + 1) % whyChooseItems.length)
                    }
                    aria-label="Next slide"
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#032e42] hover:bg-[#008000] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </ScrollAnimation>

            {/* Desktop 3-Card Carousel Track with Continuous Smooth Slide */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${whyIndex * (100 / (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1))}%)`
                }}
              >
                {whyChooseItems.concat(whyChooseItems.slice(0, 3)).map((item, idx) => (
                  <div
                    key={`${item.title}-${idx}`}
                    className="w-full md:w-1/2 lg:w-1/3 shrink-0 px-3"
                  >
                    <div
                      className="bg-white rounded-[12px] p-7 h-full flex flex-col justify-between border-t-4 border-[#008000] hover:-translate-y-1.5 transition-transform"
                      style={{
                        boxShadow: "0px 4px 20px rgba(3, 46, 66, 0.12)",
                        minHeight: "340px"
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="w-9 h-9 rounded-full bg-[#008000]/10 text-[#008000] font-black text-sm flex items-center justify-center">
                            0{(idx % whyChooseItems.length) + 1}
                          </span>
                          <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400">
                            ECASI Hallmark
                          </span>
                        </div>
                        <h3
                          className="text-[#032e42] font-bold text-[20px] mb-3 leading-snug"
                          style={{ fontFamily: "'Fira Sans', sans-serif" }}
                        >
                          {item.title}
                        </h3>
                        <p
                          className="text-[#1a202c] text-[15px] leading-[1.65] font-normal"
                          style={{ textAlign: "justify" }}
                        >
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#008000]">Accredited Excellence</span>
                        <CheckCircle2 size={16} className="text-[#008000]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Slide Indicators */}
            <div className="flex justify-center items-center gap-2 mt-8">
              {whyChooseItems.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setWhyIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    whyIndex === dotIdx ? "w-8 bg-[#008000]" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            5. OUR COURSE CATEGORIES (Compact, Space-Saving Layout)
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="course-categories" className="pt-6 pb-2 bg-white">
          <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 mb-4">
            <h2
              className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[32px] text-center"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
            >
              Our Course Categories
            </h2>
          </div>

          {/* Compact Course Categories Container with clearly visible background image */}
          <div className="relative bg-[#0a384f] py-8 sm:py-10 overflow-hidden">
            {/* Clear, visible background image */}
            <img
              src="/images/courses/professional_training.png"
              alt="ECAS Institute Executive Training"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(3, 46, 66, 0.60) 0%, rgba(3, 46, 66, 0.72) 100%)"
              }}
            />

            <div className="relative z-10 max-w-[1380px] w-full mx-auto px-4 sm:px-6">
              {/* Category Quick Filter Pills (Saves scrolling space & time on mobile & desktop) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
                <span className="text-white/70 text-xs font-bold uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                  Filter Faculty:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("all")}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCategoryFilter === "all"
                      ? "bg-[#008000] text-white shadow"
                      : "bg-white/15 text-white/90 hover:bg-white/25 hover:text-white border border-white/20"
                  }`}
                >
                  All Faculties ({courseCategoriesGrid.length})
                </button>
                {courseCategoriesGrid.map((cat, idx) => {
                  const shortName = cat.title.split(",")[0].replace(" & Technology", "").trim();
                  const isSelected = activeCategoryFilter === String(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCategoryFilter(String(idx))}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#008000] text-white shadow"
                          : "bg-white/15 text-white/90 hover:bg-white/25 hover:text-white border border-white/20"
                      }`}
                    >
                      {shortName}
                    </button>
                  );
                })}
              </div>

              {/* 3-Column Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
                {courseCategoriesGrid
                  .map((cat, originalIdx) => ({ cat, originalIdx }))
                  .filter(({ originalIdx }) => activeCategoryFilter === "all" || activeCategoryFilter === String(originalIdx))
                  .map(({ cat, originalIdx }) => {
                    const IconComp = cat.icon;
                    const isExpanded = !!expandedCategories[originalIdx];
                    const displayedLinks = isExpanded ? cat.links : cat.links.slice(0, 4);

                    return (
                      <div
                        key={originalIdx}
                        className="flex flex-col justify-between bg-[#032e42]/75 backdrop-blur-[2px] p-4 sm:p-4.5 rounded-xl border border-white/15 shadow-sm transition-all hover:border-[#008000]/60"
                      >
                        <div>
                          {/* Icon + Green Underlined Category Header */}
                          <div className="flex items-start gap-2.5 mb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#008000] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                              <IconComp size={17} />
                            </div>
                            <h3 className="text-[13.5px] sm:text-[14px] font-bold uppercase leading-snug tracking-wide">
                              <Link
                                to={cat.path}
                                className="text-[#4ade80] hover:text-white underline decoration-[#008000] underline-offset-4 transition-colors line-clamp-2"
                              >
                                {cat.title}
                              </Link>
                            </h3>
                          </div>

                          {/* Course / Sub-category Links List (Compact, 1-line truncation) */}
                          <ul className="space-y-1.5 pl-0.5">
                            {displayedLinks.map((item, lIdx) => (
                              <li key={lIdx} className="border-b border-white/10 pb-1.5 last:border-b-0">
                                <Link
                                  to={item.path}
                                  title={item.label}
                                  className="flex items-center justify-between gap-2 text-white hover:text-[#4ade80] text-[12.5px] sm:text-[13px] font-medium leading-snug transition-colors group"
                                >
                                  <span className="line-clamp-1">{item.label}</span>
                                  <ChevronRight
                                    size={13}
                                    className="shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#4ade80]"
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Card Footer: Toggle +N more & View Faculty */}
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                          {cat.links.length > 4 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCategories((prev) => ({
                                  ...prev,
                                  [originalIdx]: !prev[originalIdx],
                                }))
                              }
                              className="text-[11px] font-bold text-white/80 hover:text-white py-0.5 px-2 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            >
                              {isExpanded ? "Show less ▲" : `+${cat.links.length - 4} more ▼`}
                            </button>
                          ) : (
                            <span />
                          )}

                          <Link
                            to={cat.path}
                            className="text-[12px] font-bold text-[#4ade80] hover:text-white inline-flex items-center gap-0.5 ml-auto transition-colors"
                          >
                            <span>View All ({cat.links.length})</span>
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom CTA bar inside Course Categories */}
              <div className="mt-7 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <p className="text-white font-bold text-sm sm:text-base" style={{ textAlign: "left" }}>
                    Looking for our complete 2026–2030 Executive Training Catalogue?
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm" style={{ textAlign: "left" }}>
                    Browse over 180+ specialized courses across 13 departments or request a tailored in-house programme.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <Link
                    to="/institute-overview"
                    className="inline-flex items-center gap-1.5 bg-[#008000] hover:bg-[#1e73be] text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition-all"
                  >
                    <span>View All 2026 Courses</span>
                    <ArrowUpRight size={15} />
                  </Link>
                  <a
                    href="/ECASI_Training_Profile.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full border border-white/30 transition-all"
                  >
                    <span>Download Profile</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            5B. FEATURED 2026 EXECUTIVE TRAINING PROGRAMMES
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-gray-50/70">
          <div className="max-w-[1380px] w-full mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-9 gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#008000] bg-[#008000]/10 px-3 py-1 rounded-full mb-2">
                  <Sparkles size={13} /> 2026 Executive Cohorts Now Open
                </span>
                <h2
                  className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[33px]"
                  style={{ fontFamily: "'Fira Sans', sans-serif" }}
                >
                  Featured Executive Training Programmes
                </h2>
              </div>
              <Link
                to="/institute-overview"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#032e42] hover:text-[#008000] transition-colors"
              >
                <span>Open Course Finder</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flagshipCourses.map((course, idx) => (
                <div
                  key={course.slug}
                  className="bg-white rounded-[10px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "0px 0px 5px 0px rgba(3, 46, 66, 0.3)" }}
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-[#032e42]/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded">
                        {course.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#008000] text-white text-[11px] font-extrabold px-2.5 py-1 rounded shadow">
                        {course.duration}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3
                        className="text-[#032e42] font-bold text-[16.5px] leading-snug mb-3 line-clamp-2 hover:text-[#008000] transition-colors"
                        style={{ fontFamily: "'Fira Sans', sans-serif" }}
                      >
                        <Link to={`/executive-training/${course.slug}`}>
                          {course.title}
                        </Link>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#008000]" />
                          {course.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-[#1e73be]" />
                          Classroom / Online
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-auto">
                    <Link
                      to={`/executive-training/${course.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                    >
                      <span>Course Details</span>
                      <ArrowUpRight size={14} />
                    </Link>
                    <Link
                      to={`/register?schedule=${400827 + idx}&course=${encodeURIComponent(course.slug)}&title=${encodeURIComponent(course.title)}&venue=${encodeURIComponent(course.location)}&fee=1200`}
                      className="mt-3 text-xs font-bold text-[#008000] hover:underline"
                    >
                      Register Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            6. BEYOND THE CLASSROOM (Retained as Requested!)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-14 md:py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-[1380px] w-full mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2
                className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[35px] text-center mb-4"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Beyond the Classroom
              </h2>
              <p
                className="text-[#1a202c] text-base md:text-[16.5px] leading-relaxed max-w-4xl mx-auto mb-10"
                style={{ textAlign: "center" }}
              >
                Give your training journey an unforgettable local touch. Designed for our international participants, these exclusive experiences allow you to discover Nairobi’s vibrant culture, iconic landmarks, and stunning natural surroundings creating the perfect balance between learning, exploration, and connection.
              </p>
            </ScrollAnimation>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {beyondClassroomCards.map((card, idx) => (
                <ScrollAnimation key={card.title} animation="scale-in" delay={idx * 70}>
                  <div
                    className="bg-white rounded-[10px] p-3.5 h-full flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 group"
                    style={{
                      boxShadow: "0px 0px 5px 0px rgba(23, 37, 129, 0.4)",
                    }}
                  >
                    <div>
                      <Link
                        to={`/beyond-the-classroom/${card.slug}`}
                        className="block mb-3.5 overflow-hidden rounded-[10px]"
                        style={{ boxShadow: "0px 0px 8px 0px rgba(23, 37, 129, 0.3)" }}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-[155px] object-cover rounded-[10px] transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                      <h3
                        className="text-[#032e42] font-bold text-[16px] mb-2 leading-snug group-hover:text-[#008000] transition-colors"
                        style={{ fontFamily: "'Fira Sans', sans-serif" }}
                      >
                        <Link to={`/beyond-the-classroom/${card.slug}`}>
                          {card.title}
                        </Link>
                      </h3>
                      <p className="text-[#1a202c] text-[13.5px] leading-[1.45] mb-4 line-clamp-3">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setBeyondModal(card)}
                        className="text-xs font-bold text-slate-600 hover:text-[#032e42] py-1.5 px-2.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Quick View
                      </button>
                      <Link
                        to={`/beyond-the-classroom/${card.slug}`}
                        className="inline-flex items-center gap-1 bg-[#032e42] hover:bg-[#008000] text-white font-bold text-xs px-3 py-1.5 rounded-[4px] transition-colors"
                      >
                        <span>Full Page</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            {/* Bottom link to all excursions */}
            <div className="mt-10 text-center">
              <Link
                to="/beyond-the-classroom"
                className="inline-flex items-center gap-2 bg-[#008000] hover:bg-[#1e73be] text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-md transition-all"
              >
                <span>View Dedicated Beyond the Classroom Hub (All Excursions)</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Modal for Beyond the Classroom Details */}
        {beyondModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setBeyondModal(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56">
                <img
                  src={beyondModal.image}
                  alt={beyondModal.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setBeyondModal(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008000]">
                  Beyond the Classroom — Nairobi Excursion
                </span>
                <h3 className="text-2xl font-bold text-[#032e42] mt-1 mb-3">
                  {beyondModal.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {beyondModal.desc}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {beyondModal.details}
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBeyondModal(null)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Close
                  </button>
                  <Link
                    to={`/beyond-the-classroom/${beyondModal.slug}`}
                    onClick={() => setBeyondModal(null)}
                    className="px-4 py-2 bg-[#032e42] hover:bg-[#008000] text-white text-sm font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>View Dedicated Page</span>
                    <ArrowUpRight size={14} />
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setBeyondModal(null)}
                    className="px-4 py-2 bg-[#008000] hover:bg-[#006600] text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Inquire For Cohort
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            7. OUR PARTNERS (Retained ECAS Partners in Devimpact Elevated Box)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 md:py-14 px-4 sm:px-6 bg-white">
          <div className="max-w-[1380px] w-full mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2
                className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[35px] text-center mb-8"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Our Partners
              </h2>
            </ScrollAnimation>

            <div
              className="bg-white rounded-[10px] py-8 px-4 md:px-8 overflow-hidden relative"
              style={{
                boxShadow: "0px 0px 5px 0px rgba(23, 37, 129, 0.5)",
              }}
            >
              {/* Auto-scrolling Marquee of ECAS Partner Logos */}
              <div className="relative w-full overflow-hidden">
                <div className="flex w-[200%] gap-12 items-center animate-marquee whitespace-nowrap py-2">
                  {[0, 1].map((copyIdx) => (
                    <div key={copyIdx} className="flex justify-around items-center gap-12 min-w-full shrink-0">
                      {partners.map((partner, idx) => (
                        <a
                          key={`p-${copyIdx}-${idx}`}
                          href={partner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-16 flex items-center justify-center transition-transform duration-300 hover:scale-105 shrink-0 px-2"
                          title={partner.name}
                        >
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="max-h-14 w-auto object-contain max-w-[150px]"
                          />
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Load More Button matching Devimpact */}
              <div className="mt-6 text-center">
                <Link
                  to="/partners"
                  className="inline-block bg-[#032e42] hover:bg-[#008000] text-white font-semibold text-sm px-6 py-2.5 rounded-[3px] transition-colors"
                >
                  Load More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            8. TRAINING TESTIMONIALS (Retained & Styled Like Devimpact Review Slider)
        ══════════════════════════════════════════════════════════════════════ */}
        <section
          className="py-12 md:py-16 px-4 sm:px-6 bg-[#f9fafb]"
          onMouseEnter={() => setTestimonialPaused(true)}
          onMouseLeave={() => setTestimonialPaused(false)}
        >
          <div className="max-w-[1380px] w-full mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2
                className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[35px] text-center mb-10"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Training Testimonials
              </h2>
            </ScrollAnimation>

            <div className="relative">
              {/* Prev / Next Controls */}
              <div className="flex justify-end gap-2 mb-4">
                <button
                  type="button"
                  onClick={() =>
                    setTestimonialIndex((prev) =>
                      prev === 0 ? Math.max(0, trainingTestimonials.length - 3) : prev - 1
                    )
                  }
                  aria-label="Previous review"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#032e42] hover:bg-[#008000] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTestimonialIndex((prev) =>
                      prev >= trainingTestimonials.length - 3 ? 0 : prev + 1
                    )
                  }
                  aria-label="Next review"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#032e42] hover:bg-[#008000] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Continuous Smooth Review Slider */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${testimonialIndex * (100 / (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1))}%)`
                  }}
                >
                  {trainingTestimonials.concat(trainingTestimonials.slice(0, 3)).map((review, idx) => (
                    <div
                      key={`${review.name}-${idx}`}
                      className="w-full md:w-1/2 lg:w-1/3 shrink-0 px-3"
                    >
                      <div
                        className="bg-white rounded-xl p-6 border border-gray-100 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 h-full"
                        style={{
                          boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
                          minHeight: "280px"
                        }}
                      >
                        <div>
                          {/* Stars + Verified Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, sIdx) => (
                                <Star
                                  key={sIdx}
                                  size={16}
                                  className="fill-[#fbbc04] text-[#fbbc04]"
                                />
                              ))}
                              <CheckCircle2
                                size={15}
                                className="text-[#1e73be] ml-1"
                                title="Verified Training Participant"
                              />
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              Verified Review
                            </span>
                          </div>

                          {/* Review Text */}
                          <p className="text-[#1a202c] text-[14.5px] leading-relaxed mb-6">
                            “{review.quote}”
                          </p>
                        </div>

                        {/* Reviewer Profile Header */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                          {review.image ? (
                            <img
                              src={review.image}
                              alt={review.name}
                              className="w-11 h-11 rounded-full object-cover border border-[#008000]"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#008000] text-white font-bold text-sm flex items-center justify-center shrink-0">
                              {review.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#032e42] text-sm">
                              {review.name}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              {review.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            9. MILESTONES SECTION (Retained & Styled Like Devimpact Funfact Grid)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-14 md:py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-[1380px] w-full mx-auto">
            <ScrollAnimation animation="slide-up">
              <h2
                className="text-[#032e42] font-bold text-2xl sm:text-3xl md:text-[35px] text-center mb-10"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Milestones
              </h2>
            </ScrollAnimation>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((m, idx) => (
                <ScrollAnimation key={m.label} animation="scale-in" delay={idx * 80}>
                  <AnimatedMilestoneCard milestone={m} />
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            10. SUBSCRIBE TO OUR NEWSLETTER! (Devimpact Pre-Footer Banner)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 px-4 sm:px-6 bg-[#f2f5f9] border-t border-gray-200">
          <div className="max-w-[900px] mx-auto text-center">
            <h2
              className="text-[#032e42] font-bold text-2xl sm:text-3xl mb-3"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
            >
              Subscribe to our Newsletter!
            </h2>
            <p
              className="text-gray-600 text-sm sm:text-base mb-6 max-w-xl mx-auto"
              style={{ textAlign: "center" }}
            >
              Stay updated with our upcoming 2026 executive training cohorts, new courses, workshops, and policy insights.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 h-12 px-4 rounded-lg border border-gray-300 bg-white text-[#032e42] text-sm focus:outline-none focus:border-[#008000]"
              />
              <button
                type="submit"
                className="h-12 px-8 bg-[#008000] hover:bg-[#003B80] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>

            {newsletterSubmitted && (
              <p className="text-[#008000] font-semibold text-sm mt-3" style={{ textAlign: "center" }}>
                Thank you for subscribing to ECAS Institute’s Executive Training updates!
              </p>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Index;
