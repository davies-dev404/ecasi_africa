import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Phone, Clock, ChevronDown, ChevronRight, Mail, Search,
  GraduationCap, BookOpen, ArrowUpRight
} from "lucide-react";
import { dataService } from "@/lib/dataService";

/* ── Horizontal Card-Box Data (Matching Screenshot 1 Devimpact Style) ── */
const aboutBoxCards = [
  {
    title: "Who We Are",
    path: "/our-history",
    image: "/logo.png",
    isLogo: true,
    subLinks: [
      { label: "Our Strategic Focus", path: "/our-strategic-focus" },
      { label: "Theory of Change", path: "/theory-of-change" },
      { label: "Organisation Profiles", path: "/organisation-profiles" },
    ],
  },
  {
    title: "Impacted Organizations",
    path: "/partners",
    image: "/images/Gallery/1717137013154.jpg",
    subLinks: [
      { label: "Our Partners & Clients", path: "/partners" },
    ],
  },
  {
    title: "Accreditation & Governance",
    path: "/governance",
    image: "/images/Gallery/regulation_training_group.jpg",
    subLinks: [
      { label: "Governing Council", path: "/governing-council" },
      { label: "Our Team", path: "/our-team" },
      { label: "Institutional Policies", path: "/our-policies" },
    ],
  },
  {
    title: "Training Event Gallery",
    path: "/gallery",
    image: "/images/Gallery/training_workshop_session.jpg",
    subLinks: [
      { label: "Executive Training Photos", path: "/gallery" },
    ],
  },
  {
    title: "Contact Us",
    path: "/contact",
    image: "/images/courses/mentorship_group.jpg",
    subLinks: [
      { label: "Enquiries & Location", path: "/contact" },
      { label: "Careers & Vacancies", path: "/vacancies" },
    ],
  },
];

const programmesBoxCards = [
  {
    title: "Air Quality Programme",
    path: "/specialties/clean-air-programme",
    image: "/images/Gallery/breathe_cities_presentation.jpg",
    subLinks: [
      { label: "Clean Air & Emissions Action", path: "/specialties/clean-air-programme" },
    ],
  },
  {
    title: "Climate Change Action",
    path: "/climate-change-programming",
    image: "/images/Gallery/jkhjn.jpg",
    subLinks: [
      { label: "Training & Public Awareness", path: "/training-education-public-awareness" },
      { label: "Adaptation & Mitigation", path: "/adaptation-mitigation-assessments" },
      { label: "GHG Inventories", path: "/ghg-inventories" },
      { label: "National Communications", path: "/national-communications" },
    ],
  },
  {
    title: "Renewable Energy & Just Transition",
    path: "/specialties/energy",
    image: "/images/courses/energy-transition.png",
    subLinks: [
      { label: "Energy Transition", path: "/specialties/energy" },
      { label: "Sustainable Transport & E-Mobility", path: "/specialties/transport" },
    ],
  },
  {
    title: "Agriculture & Food Systems",
    path: "/specialties/sustainable-agriculture-and-food-systems",
    image: "/images/programmes/agriculture_farm.png",
    subLinks: [
      { label: "Climate-Smart Agriculture", path: "/specialties/sustainable-agriculture-and-food-systems" },
      { label: "Waste & Circular Economy", path: "/specialties/waste-and-circular-economy" },
    ],
  },
  {
    title: "Natural Resources Management",
    path: "/specialties/forests",
    image: "/images/programmes/tana_river.png",
    subLinks: [
      { label: "Forests & Biodiversity", path: "/specialties/forests" },
      { label: "Fresh Water Programme", path: "/specialties/water" },
      { label: "Oceans & Marine", path: "/specialties/oceans-marine" },
      { label: "Sustainable Mining", path: "/specialties/mining-extractives" },
    ],
  },
];

const researchBoxCards = [
  {
    title: "Research Overview",
    path: "/research/overview",
    image: "/images/research/image-6.png",
    subLinks: [
      { label: "Systematic Observation", path: "/research-systematic-observation" },
      { label: "Enabling Environment", path: "/creation-enabling-environment" },
    ],
  },
  {
    title: "Climate Finance & Adaptation",
    path: "/research/climate-finance",
    image: "/images/courses/IMGM1984-1024x683.jpg",
    subLinks: [
      { label: "Climate Finance", path: "/research/climate-finance" },
      { label: "Climate Adaptation", path: "/research/climate-adaptation" },
      { label: "Climate Mitigation", path: "/research/climate-change-mitigation" },
      { label: "Climate & Technology", path: "/research/climate-and-technology" },
    ],
  },
  {
    title: "Energy & Just Transition",
    path: "/research/energy-transition",
    image: "/images/courses/20241003_133952069-1-1024x683.jpg",
    subLinks: [
      { label: "Energy Transition Research", path: "/research/energy-transition" },
      { label: "Just Transition", path: "/research/just-transition" },
    ],
  },
  {
    title: "Agriculture & Natural Resources",
    path: "/research/agriculture-and-food-systems-2",
    image: "/images/programmes/agriculture_crops.png",
    subLinks: [
      { label: "Food Systems Research", path: "/research/agriculture-and-food-systems-2" },
      { label: "Natural Resources Research", path: "/research/natural-resources" },
    ],
  },
  {
    title: "Law, Governance & E-Mobility",
    path: "/research/environmental-law-and-governance",
    image: "/images/research/policy_advisory_meeting.jpg",
    subLinks: [
      { label: "Environmental Law & Governance", path: "/research/environmental-law-and-governance" },
      { label: "Transport & E-Mobility", path: "/research/transport-and-e-mobility" },
      { label: "Waste & Circular Economy", path: "/research/waste-and-circular-economy-2" },
    ],
  },
];

const consultancyBoxCards = [
  {
    title: "Consultancy Overview",
    path: "/research/consulting",
    image: "/images/research/consultancy.jpg",
    subLinks: [
      { label: "Advisory & Technical Assistance", path: "/research/consulting" },
      { label: "Institutional Capacity Building", path: "/institutional-capacity-building" },
    ],
  },
  {
    title: "Studies & Assessments",
    path: "/research/assessments",
    image: "/images/research/policy_advisory_meeting.jpg",
    subLinks: [
      { label: "Baseline Studies", path: "/research/baseline-study" },
      { label: "Policy Reviews & Assessments", path: "/research/policy-reviews-and-assessments" },
      { label: "Policy Analysis", path: "/research/policy-analysis" },
    ],
  },
  {
    title: "ESIA, SEA & Management Plans",
    path: "/research/strategic-environmental-assessments-sea-2",
    image: "/images/Gallery/hi.jpg",
    subLinks: [
      { label: "Environmental & Social Impact (ESIA)", path: "/research/environmental-and-social-impact-assessment" },
      { label: "Strategic Assessments (SEA)", path: "/research/strategic-environmental-assessments-sea-2" },
      { label: "Management Plans (ESMP)", path: "/research/environmental-and-social-management-plans-esmp" },
    ],
  },
  {
    title: "Environmental & Energy Audits",
    path: "/research/environmental-audits",
    image: "/images/Gallery/1715195548735.jpg",
    subLinks: [
      { label: "Environmental Audits", path: "/research/environmental-audits" },
      { label: "Energy Audits", path: "/research/energy-audits" },
      { label: "Scoping Studies", path: "/research/scoping-studies" },
    ],
  },
  {
    title: "Rapporteur & Reporting Services",
    path: "/research/rapporteur-and-reporting-services",
    image: "/images/Gallery/DSC_0085.JPG",
    subLinks: [
      { label: "Conference & Summit Rapporteur", path: "/research/rapporteur-and-reporting-services" },
    ],
  },
];

const resourcesBoxCards = [
  {
    title: "Resources Hub",
    path: "/resources",
    image: "/images/Gallery/DSC_0090.JPG",
    subLinks: [
      { label: "All Institutional Resources", path: "/resources" },
    ],
  },
  {
    title: "Publications & Policy Briefs",
    path: "/resources/publications",
    image: "/images/research/image-6.png",
    subLinks: [
      { label: "Publications", path: "/resources/publications" },
      { label: "Policy Briefs", path: "/resources/policy-briefs" },
      { label: "Books", path: "/resources/books" },
    ],
  },
  {
    title: "Reports, Policies & Laws",
    path: "/resources/reports",
    image: "/images/Gallery/1732710492385.jpg",
    subLinks: [
      { label: "Technical Reports", path: "/resources/reports" },
      { label: "Policies & Laws", path: "/resources/policies-and-laws" },
    ],
  },
  {
    title: "Training Videos & Media",
    path: "/resources/videos",
    image: "/images/Gallery/training 1.jpg",
    subLinks: [
      { label: "Video Library", path: "/resources/videos" },
    ],
  },
  {
    title: "Training Event Gallery",
    path: "/gallery",
    image: "/images/Gallery/1717137013154.jpg",
    subLinks: [
      { label: "Photo Gallery", path: "/gallery" },
      { label: "Vacancies", path: "/vacancies" },
    ],
  },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const coursesLinks = dataService.getCoursesLinks() || [];

  const groupToCategoryMap = {
    'climate-finance': 'Climate Finance & Public Financial Management',
    'climate-change': 'Climate Change & Sustainability',
    'carbon-markets': 'Carbon Markets & ESG',
    'leadership-governance': 'Leadership, Governance & Public Sector Transformation',
    'leadership': 'Leadership, Governance & Public Sector Transformation',
    'project-management': 'Project Management, Procurement & M&E',
    'hr-admin': 'Human Resources, Office Administration & Communication',
    'hr': 'Human Resources, Office Administration & Communication',
    'data-ai-it': 'Data, Artificial Intelligence, IT & Cybersecurity',
    'data-it': 'Data, Artificial Intelligence, IT & Cybersecurity',
    'ehs-air-quality': 'Air Quality, Environmental Health & Safety (EHS)',
    'environment': 'Air Quality, Environmental Health & Safety (EHS)',
  };

  const categoryCourseCounts = useMemo(() => {
    const raw = dataService.getCourses();
    if (!raw) return {};
    const courses = Array.isArray(raw) ? raw : Object.values(raw);
    const counts = {};
    courses.filter((c) => !c.isCategoryPage).forEach((c) => {
      const cat = c.category;
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, []);

  const getCategoryCount = (catGroup) => {
    const catName = groupToCategoryMap[catGroup.id] || groupToCategoryMap[catGroup.label] || catGroup.label;
    if (categoryCourseCounts[catName]) {
      return categoryCourseCounts[catName];
    }
    const normTarget = (catName || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    for (const [realCat, count] of Object.entries(categoryCourseCounts)) {
      const normReal = realCat.replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (normReal === normTarget || normReal.includes(normTarget) || normTarget.includes(normReal)) {
        return count;
      }
    }
    return (catGroup.children || []).length;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/institute-overview?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Close dropdown when clicking outside the header
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (key) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  /* ── Helper to Render the Devimpact Horizontal 5-Box Mega Bar (Screenshot 1 Style in ECAS Colors) ── */
  const renderHorizontalBoxDropdown = (cards) => (
    <div
      className="fixed left-0 right-0 w-full bg-white/98 backdrop-blur-md border-t border-b border-gray-200 z-50 animate-fade-in"
      style={{
        top: scrolled ? "70px" : "140px",
        boxShadow: "0 18px 40px rgba(3, 46, 66, 0.14)",
      }}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="max-w-[1380px] mx-auto px-4 lg:px-10 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-[6px] border border-gray-200/90 hover:border-[#008000] p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
              style={{
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
              }}
            >
              {/* Main Horizontal Card Box matching Screenshot 1 */}
              <Link
                to={card.path}
                onClick={() => setActiveDropdown(null)}
                className="flex items-center gap-3.5"
              >
                <div
                  className={`w-[68px] h-[52px] rounded-[4px] overflow-hidden shrink-0 flex items-center justify-center ${
                    card.isLogo
                      ? "bg-white border border-gray-100 p-1"
                      : "bg-[#032e42]"
                  }`}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className={`w-full h-full ${
                      card.isLogo ? "object-contain" : "object-cover"
                    } transition-transform duration-300 group-hover:scale-105`}
                  />
                </div>
                <span className="text-[#032e42] group-hover:text-[#008000] font-bold text-[15px] leading-snug transition-colors">
                  {card.title}
                </span>
              </Link>

              {/* Compact Sub-links (optional quick access) */}
              {card.subLinks && card.subLinks.length > 1 && (
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-x-3 gap-y-1">
                  {card.subLinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      to={sub.path}
                      onClick={() => setActiveDropdown(null)}
                      className="text-[11.5px] font-medium text-slate-600 hover:text-[#008000] inline-flex items-center gap-0.5 transition-colors"
                    >
                      <ChevronRight size={11} className="text-[#008000]" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-[140px] w-full shrink-0" aria-hidden="true"></div>
      <header ref={navRef} className={`ecasi-sticky-nav ${scrolled ? "scrolled" : ""}`}>
        {/* ── Top Bar ── */}
        <div
          className={`ecasi-topbar relative overflow-hidden bg-ecasi-green transition-all duration-300 ease-in-out ${
            scrolled ? "h-0 opacity-0 min-h-[0px]" : "h-auto opacity-100"
          }`}
        >
          <div
            className="hidden sm:block absolute top-0 left-0 bottom-0 bg-ecasi-blue"
            style={{
              width: "60%",
              clipPath: "polygon(0 0, 100% 0, calc(100% - 30px) 100%, 0 100%)",
            }}
          ></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center text-white text-[11px] sm:text-xs md:text-sm font-semibold w-full max-w-[1476px] mx-auto justify-between">
            <div className="bg-ecasi-blue sm:bg-transparent py-2 px-4 sm:py-2.5 lg:pl-16 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-white flex-grow sm:flex-grow-0">
              <a
                href="tel:+254728925306"
                className="flex items-center text-white hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Phone size={13} className="mr-1.5 md:mr-2 stroke-[2.5]" />
                <span className="tracking-wide">+254 728 925 306</span>
              </a>
              <a
                href="mailto:info@ecasiafrica.org"
                className="flex items-center text-white hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mail size={13} className="mr-1.5 md:mr-2 stroke-[2.5]" />
                <span className="tracking-wide">info@ecasiafrica.org</span>
              </a>
            </div>
            <div className="bg-ecasi-green sm:bg-transparent py-2 px-4 sm:py-2.5 lg:pr-16 flex items-center justify-center sm:justify-end whitespace-nowrap sm:ml-auto flex-grow sm:flex-grow-0">
              <Clock size={13} className="mr-1.5 md:mr-2 stroke-[2.5]" />
              <span className="tracking-wide">Mon – Fri: 8:00am – 7:00pm</span>
            </div>
          </div>
        </div>

        {/* ── Main Navigation (No Home Button — Logo Clicks to Home) ── */}
        <nav className="bg-white border-b border-gray-100 relative">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-12">
            <div
              className={`flex items-center justify-between transition-all duration-300 ${
                scrolled ? "h-[70px]" : "h-[96px]"
              }`}
            >
              {/* Logo (Clicks to Home `/`) */}
              <Link
                to="/"
                title="Go to Home Page"
                className="flex items-center gap-3 flex-shrink-0 group"
              >
                <img
                  src="/logo.png"
                  alt="ECAS Institute Logo - Home"
                  className={`w-auto object-contain mix-blend-multiply transition-all duration-300 ${
                    scrolled ? "h-12" : "h-20"
                  }`}
                />
              </Link>

              {/* Desktop Navigation Items:
                  1. EXECUTIVE TRAINING (First, with Course Finder & Categories Mega-Menu)
                  2. PROGRAMMES (Horizontal Boxes)
                  3. RESEARCH (Horizontal Boxes)
                  4. CONSULTANCY (Horizontal Boxes)
                  5. ABOUT US (Second Last! Horizontal Boxes including Contact Us)
                  6. RESOURCES (Last! Horizontal Boxes)
              */}
              <div className="hidden lg:flex items-center h-full">
                {/* 1. EXECUTIVE TRAINING (Primary Focus) */}
                <div
                  className="relative flex items-center h-full"
                  onMouseEnter={() => setActiveDropdown("training")}
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown("training")}
                    className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-bold tracking-wide ${
                      isActive("/institute-overview") ||
                      location.pathname.startsWith("/executive-training")
                        ? "active"
                        : ""
                    }`}
                  >
                    EXECUTIVE TRAINING
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "training" ? "rotate-180 text-[#008000]" : ""
                      }`}
                    />
                  </button>

                  {activeDropdown === "training" && (
                    <div
                      className="fixed left-0 right-0 w-full bg-white/98 backdrop-blur-md border-t border-b border-gray-200 z-50 animate-fade-in"
                      style={{
                        top: scrolled ? "70px" : "140px",
                        boxShadow: "0 18px 40px rgba(3, 46, 66, 0.16)",
                      }}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="max-w-[1380px] mx-auto px-6 py-6">
                        {/* Top Bar inside Training Mega-Menu */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#008000] text-white flex items-center justify-center">
                              <GraduationCap size={22} />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-[#032e42] leading-tight">
                                Executive Training &amp; Professional Capacity Development
                              </h3>
                              <p className="text-xs text-slate-500">
                                Explore 200+ practical courses across 8 thematic faculties in Nairobi, Mombasa, Kigali, Dubai, Kuala Lumpur (Malaysia) &amp; Online
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link
                              to="/institute-overview"
                              onClick={() => setActiveDropdown(null)}
                              className="px-4 py-2 rounded-md bg-[#008000] hover:bg-[#1e73be] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <BookOpen size={14} />
                              Open Course Finder (All Courses)
                            </Link>
                            <a
                              href="/courses/ECASI-BROCHURE.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-md border border-[#032e42] text-[#032e42] hover:bg-[#032e42] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                            >
                              Download 2026 Training Catalogue
                              <ArrowUpRight size={14} />
                            </a>
                          </div>
                        </div>

                        {/* 4x2 Grid of Course Categories */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[62vh] overflow-y-auto pr-1">
                          {coursesLinks.map((catGroup, idx) => (
                            <div
                              key={catGroup.id || idx}
                              className="bg-[#f8fafc] rounded-lg p-4 border border-slate-200/80 hover:border-[#008000] transition-all"
                            >
                              <Link
                                to={catGroup.path}
                                onClick={() => setActiveDropdown(null)}
                                className="block font-bold text-[13.5px] text-[#032e42] hover:text-[#008000] pb-2 mb-2.5 border-b border-slate-200 leading-snug"
                              >
                                {catGroup.label}
                              </Link>
                              <ul className="space-y-1.5">
                                {(catGroup.children || []).slice(0, 5).map((courseItem, cIdx) => (
                                  <li key={cIdx}>
                                    <Link
                                      to={courseItem.path}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[12px] text-slate-600 hover:text-[#008000] font-medium flex items-start gap-1.5 leading-snug"
                                    >
                                      <ChevronRight
                                        size={12}
                                        className="text-[#008000] shrink-0 mt-0.5"
                                      />
                                      <span className="line-clamp-1">{courseItem.label}</span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-3 pt-2 border-t border-slate-100">
                                <Link
                                  to={catGroup.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[11.5px] font-bold text-[#008000] hover:text-[#1e73be] inline-flex items-center gap-1"
                                >
                                  View all {getCategoryCount(catGroup)} courses »
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PROGRAMMES (Horizontal Card Boxes like Screenshot 1) */}
                <div
                  className="relative flex items-center h-full"
                  onMouseEnter={() => setActiveDropdown("programmes")}
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown("programmes")}
                    className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                      location.pathname.startsWith("/programmes") ||
                      location.pathname.startsWith("/specialties")
                        ? "active"
                        : ""
                    }`}
                  >
                    PROGRAMMES
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "programmes" ? "rotate-180 text-[#008000]" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "programmes" &&
                    renderHorizontalBoxDropdown(programmesBoxCards)}
                </div>

                {/* 3. RESEARCH (Horizontal Card Boxes like Screenshot 1) */}
                <div
                  className="relative flex items-center h-full"
                  onMouseEnter={() => setActiveDropdown("research")}
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown("research")}
                    className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                      location.pathname.startsWith("/research") &&
                      !location.pathname.includes("consulting")
                        ? "active"
                        : ""
                    }`}
                  >
                    RESEARCH
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "research" ? "rotate-180 text-[#008000]" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "research" &&
                    renderHorizontalBoxDropdown(researchBoxCards)}
                </div>

                {/* 4. CONSULTANCY (Horizontal Card Boxes like Screenshot 1) */}
                <div
                  className="relative flex items-center h-full"
                  onMouseEnter={() => setActiveDropdown("consultancy")}
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown("consultancy")}
                    className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                      location.pathname.includes("consulting") ||
                      location.pathname.includes("assessments") ||
                      location.pathname.includes("audits")
                        ? "active"
                        : ""
                    }`}
                  >
                    CONSULTANCY
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "consultancy" ? "rotate-180 text-[#008000]" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "consultancy" &&
                    renderHorizontalBoxDropdown(consultancyBoxCards)}
                </div>

                {/* 5. ABOUT US (Second Last! Opens Screenshot-1 Horizontal Boxes including Contact Us) */}
                <div
                  className="relative flex items-center h-full"
                  onMouseEnter={() => setActiveDropdown("about")}
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown("about")}
                    className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                      isActive("/our-history") ||
                      isActive("/partners") ||
                      isActive("/governance") ||
                      isActive("/contact")
                        ? "active"
                        : ""
                    }`}
                  >
                    ABOUT US
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "about" ? "rotate-180 text-[#008000]" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "about" &&
                    renderHorizontalBoxDropdown(aboutBoxCards)}
                </div>

                {/* 6. RESOURCES (Last Item! Opens Screenshot-1 Horizontal Boxes) */}
                <div
                  className="relative flex items-center h-full"
                  onMouseEnter={() => setActiveDropdown("resources")}
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown("resources")}
                    className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                      location.pathname.startsWith("/resources") || isActive("/gallery")
                        ? "active"
                        : ""
                    }`}
                  >
                    RESOURCES
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "resources" ? "rotate-180 text-[#008000]" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "resources" &&
                    renderHorizontalBoxDropdown(resourcesBoxCards)}
                </div>
              </div>

              {/* Right Actions: Course Finder CTA & Search Icon */}
              <div className="flex items-center gap-2.5">
                <Link
                  to="/institute-overview"
                  className="hidden xl:inline-flex items-center gap-1.5 bg-[#008000] hover:bg-[#1e73be] text-white font-bold text-xs px-4 py-2.5 rounded-full transition-colors shadow-sm"
                >
                  <GraduationCap size={15} />
                  Course Finder
                </Link>

                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="ecasi-icon-circle"
                  aria-label="Search Courses"
                >
                  <Search size={15} />
                </button>

                {/* Mobile menu trigger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="ecasi-icon-circle lg:hidden"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Search bar slider */}
          {searchOpen && (
            <div className="animate-fade-in border-t border-gray-100 bg-white px-4 lg:px-16 py-4 absolute top-full left-0 w-full z-40 shadow-md">
              <form
                onSubmit={handleSearch}
                className="max-w-[1476px] mx-auto flex items-center gap-4"
              >
                <input
                  type="text"
                  placeholder="Search executive training courses, topics, or keywords..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-b-2 border-ecasi-green outline-none py-2 text-base text-ecasi-navy placeholder-ecasi-body bg-transparent font-sans"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-ecasi-body hover:text-ecasi-blue transition-colors"
                >
                  <X size={20} />
                </button>
              </form>
            </div>
          )}

          {/* Mobile Dropdown Nav Menu (No Home Button — Logo goes Home) */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 bg-white absolute top-full left-0 w-full z-50 max-h-[82vh] overflow-y-auto shadow-xl py-4">
              <div className="px-4 space-y-2">
                {/* 1. Executive Training */}
                <div>
                  <button
                    onClick={() => toggleDropdown("m-training")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#032e42] bg-slate-50 rounded-lg"
                  >
                    <span>Executive Training</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        activeDropdown === "m-training" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "m-training" && (
                    <div className="p-3 space-y-2 bg-white border border-slate-100 rounded-b-lg">
                      <Link
                        to="/institute-overview"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-3 rounded bg-[#008000] text-white text-xs font-bold text-center"
                      >
                        Course Finder (All 200+ Courses)
                      </Link>
                      {coursesLinks.map((grp, idx) => (
                        <Link
                          key={idx}
                          to={grp.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 px-2 text-xs font-semibold text-[#032e42] hover:text-[#008000] border-b border-slate-100 last:border-0"
                        >
                          {grp.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Programmes */}
                <div>
                  <button
                    onClick={() => toggleDropdown("m-programmes")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#032e42] bg-slate-50 rounded-lg"
                  >
                    <span>Programmes</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        activeDropdown === "m-programmes" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "m-programmes" && (
                    <div className="p-3 grid grid-cols-1 gap-2 bg-white border border-slate-100 rounded-b-lg">
                      {programmesBoxCards.map((c, idx) => (
                        <Link
                          key={idx}
                          to={c.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-2 rounded border border-slate-100 hover:border-[#008000]"
                        >
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-12 h-9 object-cover rounded shrink-0"
                          />
                          <span className="text-xs font-bold text-[#032e42]">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Research */}
                <div>
                  <button
                    onClick={() => toggleDropdown("m-research")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#032e42] bg-slate-50 rounded-lg"
                  >
                    <span>Research</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        activeDropdown === "m-research" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "m-research" && (
                    <div className="p-3 grid grid-cols-1 gap-2 bg-white border border-slate-100 rounded-b-lg">
                      {researchBoxCards.map((c, idx) => (
                        <Link
                          key={idx}
                          to={c.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-2 rounded border border-slate-100 hover:border-[#008000]"
                        >
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-12 h-9 object-cover rounded shrink-0"
                          />
                          <span className="text-xs font-bold text-[#032e42]">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Consultancy */}
                <div>
                  <button
                    onClick={() => toggleDropdown("m-consultancy")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#032e42] bg-slate-50 rounded-lg"
                  >
                    <span>Consultancy</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        activeDropdown === "m-consultancy" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "m-consultancy" && (
                    <div className="p-3 grid grid-cols-1 gap-2 bg-white border border-slate-100 rounded-b-lg">
                      {consultancyBoxCards.map((c, idx) => (
                        <Link
                          key={idx}
                          to={c.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-2 rounded border border-slate-100 hover:border-[#008000]"
                        >
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-12 h-9 object-cover rounded shrink-0"
                          />
                          <span className="text-xs font-bold text-[#032e42]">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. About Us (Second Last! Includes Contact Us box) */}
                <div>
                  <button
                    onClick={() => toggleDropdown("m-about")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#032e42] bg-slate-50 rounded-lg"
                  >
                    <span>About Us</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        activeDropdown === "m-about" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "m-about" && (
                    <div className="p-3 grid grid-cols-1 gap-2 bg-white border border-slate-100 rounded-b-lg">
                      {aboutBoxCards.map((c, idx) => (
                        <Link
                          key={idx}
                          to={c.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-2 rounded border border-slate-100 hover:border-[#008000]"
                        >
                          <img
                            src={c.image}
                            alt={c.title}
                            className={`w-12 h-9 rounded shrink-0 ${
                              c.isLogo ? "object-contain p-0.5 bg-white" : "object-cover"
                            }`}
                          />
                          <span className="text-xs font-bold text-[#032e42]">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Resources (Last) */}
                <div>
                  <button
                    onClick={() => toggleDropdown("m-resources")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#032e42] bg-slate-50 rounded-lg"
                  >
                    <span>Resources</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        activeDropdown === "m-resources" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === "m-resources" && (
                    <div className="p-3 grid grid-cols-1 gap-2 bg-white border border-slate-100 rounded-b-lg">
                      {resourcesBoxCards.map((c, idx) => (
                        <Link
                          key={idx}
                          to={c.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-2 rounded border border-slate-100 hover:border-[#008000]"
                        >
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-12 h-9 object-cover rounded shrink-0"
                          />
                          <span className="text-xs font-bold text-[#032e42]">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;
