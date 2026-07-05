import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, Phone, Clock, ChevronDown, ChevronRight, Mail, Search
} from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'about' | 'programmes' | 'training' | 'research' | 'resources'
  const [activeSubDropdown, setActiveSubDropdown] = useState(null); // 'climate' | 'resources-mgmt' | 'consultancy' | 'research-areas' | 'courses'
  const [activeThirdLevelDropdown, setActiveThirdLevelDropdown] = useState(null);
  const [activeFourthLevelDropdown, setActiveFourthLevelDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveSubDropdown(null);
    setActiveThirdLevelDropdown(null);
    setActiveFourthLevelDropdown(null);
    setSearchOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Navigation Items data representation for clean rendering
  const aboutLinks = [
    { label: "Welcome to ECAS Institute", path: "/our-history" },
    { label: "Governing Council", path: "/governing-council" },
    { label: "Our Strategic Focus", path: "/our-strategic-focus" },
    { label: "Our Team", path: "/our-team" },
    { label: "Our Policies", path: "/our-policies" },
    { label: "Partners", path: "/partners" },
    { label: "Governance", path: "/governance" },
    { label: "Theory of Change", path: "/theory-of-change" },
    { label: "Vacancies", path: "/vacancies" },
  ];

  return (
    <header className={`ecasi-sticky-nav ${scrolled ? "scrolled" : ""}`}>
      {/* ── Top Bar ── */}
      <div className="ecasi-topbar min-h-[36px] flex items-center justify-end px-4 lg:px-16" style={{
        background: "linear-gradient(90deg, #1e73be 0%, #1e73be 20%, #008000 20%, #008000 100%)"
      }}>
        <div className="flex items-center text-white text-xs font-semibold py-2">
          <Clock size={13} className="mr-2" />
          <span>Mon – Fri: 8:00am – 7:00pm</span>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="bg-white border-b border-gray-100 relative">
        <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
          <div className="flex items-center justify-between" style={{ height: "100px" }}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <img
                src="/logo.png"
                alt="ECASI Africa Logo"
                className="h-16 w-auto object-contain mix-blend-multiply"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center h-full">

              {/* HOME */}
              <Link
                to="/"
                className={`ecasi-nav-link flex items-center h-full text-sm font-semibold tracking-wide ${isActive("/") ? "active" : ""}`}
              >
                HOME
              </Link>

              {/* ABOUT US Dropdown */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => setActiveDropdown('about')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                    isActive("/about") || aboutLinks.some(l => isActive(l.path)) ? "active" : ""
                  }`}
                >
                  ABOUT US
                  <ChevronDown size={14} className="transition-transform duration-200" />
                </button>
                {activeDropdown === 'about' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 z-50 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                    {aboutLinks.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              {/* PROGRAMMES Dropdown (Mega dropdown style) */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => setActiveDropdown('programmes')}
                onMouseLeave={() => { setActiveDropdown(null); setActiveSubDropdown(null); }}
              >
                <button
                  className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                    location.pathname.startsWith("/programmes") || location.pathname.startsWith("/specialties") ? "active" : ""
                  }`}
                >
                  PROGRAMMES
                  <ChevronDown size={14} className="transition-transform duration-200" />
                </button>
                {activeDropdown === 'programmes' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 z-50 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                    <Link
                      to="/specialties/clean-air-programme"
                      className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                    >
                      Air Quality Programme
                    </Link>

                    {/* Climate Change Action Subdropdown */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubDropdown('climate')}
                      onMouseLeave={() => setActiveSubDropdown(null)}
                    >
                      <div className="flex items-center justify-between px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section cursor-pointer transition-colors font-medium">
                        <span>Climate Change Action</span>
                        <ChevronRight size={14} />
                      </div>
                      {activeSubDropdown === 'climate' && (
                        <div className="absolute left-full top-0 pl-2 w-72 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                          {[
                            { label: "Training, Education & Public Awareness", path: "/training-education-public-awareness" },
                            { label: "Research and Systematic Observation", path: "/research-systematic-observation" },
                            { label: "Creation of an Enabling Environment", path: "/creation-enabling-environment" },
                            { label: "Adaptation & Mitigation Assessments", path: "/adaptation-mitigation-assessments" },
                            { label: "GHG Inventories", path: "/ghg-inventories" },
                            { label: "Institutional capacity-building and Reskilling", path: "/institutional-capacity-building" },
                            { label: "Integrated Programming for Climate Change", path: "/climate-change-programming" },
                            { label: "National Communications", path: "/national-communications" }
                          ].map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              to={sub.path}
                              className="block px-4 py-2 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/specialties/energy"
                      className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                    >
                      Renewable Energy and Just Transition
                    </Link>
                    <Link
                      to="/specialties/sustainable-agriculture-and-food-systems"
                      className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                    >
                      Agriculture and Food Systems
                    </Link>
                    <Link
                      to="/specialties/transport"
                      className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                    >
                      Sustainable Transport &amp; E-Mobility
                    </Link>
                    <Link
                      to="/specialties/waste-and-circular-economy"
                      className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                    >
                      Waste &amp; Circular Economy
                    </Link>

                    {/* Natural Resources Management Subdropdown */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubDropdown('resources-mgmt')}
                      onMouseLeave={() => setActiveSubDropdown(null)}
                    >
                      <div className="flex items-center justify-between px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section cursor-pointer transition-colors font-medium">
                        <span>Natural Resources Management</span>
                        <ChevronRight size={14} />
                      </div>
                      {activeSubDropdown === 'resources-mgmt' && (
                        <div className="absolute left-full top-0 pl-2 w-72 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                          {[
                            { label: "Forests, Biodiversity and Ecosystems", path: "/specialties/forests" },
                            { label: "Sustainable Mining & Extractives", path: "/specialties/mining-extractives" },
                            { label: "Environment, Migration and Mobility", path: "/specialties/security-migration" },
                            { label: "Fresh Water Programme", path: "/specialties/water" },
                            { label: "Oceans & Marine Programme", path: "/specialties/oceans-marine" }
                          ].map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              to={sub.path}
                              className="block px-4 py-2 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>

              {/* EXECUTIVE TRAINING Dropdown */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => setActiveDropdown('training')}
                onMouseLeave={() => { setActiveDropdown(null); setActiveSubDropdown(null); }}
              >
                <button
                  className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                    isActive("/courses") || isActive("/training-overview") ? "active" : ""
                  }`}
                >
                  EXECUTIVE TRAINING
                  <ChevronDown size={14} className="transition-transform duration-200" />
                </button>
                {activeDropdown === 'training' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 z-50 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                    <Link
                      to="/institute-overview"
                      className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                    >
                      Institute Overview
                    </Link>

                    {/* Courses Subdropdown */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubDropdown('courses')}
                      onMouseLeave={() => setActiveSubDropdown(null)}
                    >
                      <div className="flex items-center justify-between px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section cursor-pointer transition-colors font-medium">
                        <span>Courses</span>
                        <ChevronRight size={14} />
                      </div>
                      {activeSubDropdown === 'courses' && (
                        <div className="absolute left-full top-0 pl-2 w-72 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                          {[
                            {
                              label: "Climate Change",
                              path: "/executive-training/climate-change",
                              id: "climate-change",
                              children: [
                                { label: "Energy and Green Economy", path: "/executive-training/energy" },
                                { label: "Climate-Smart Forestry", path: "/executive-training/climate-smart-forestry" },
                                { label: "Energy Transition and Mobility", path: "/executive-training/energy-transition-and-mobility" },
                                { label: "Agricultural carbon credit markets", path: "/executive-training/agricultural-carbon-credit-markets" },
                                { label: "Agriculture and Food Systems", path: "/executive-training/agriculture-and-food-systems" },
                                { label: "An Introduction to Climate Change and Human Rights", path: "/executive-training/an-introduction-to-climate-change-and-human-rights" },
                                { label: "Certified Expert in Climate Adaptation Finance", path: "/executive-training/certified-expert-in-climate-adaptation-finance" }
                              ]
                            },
                            { label: "Biodiversity and Natural Resources", path: "/executive-training/biodiversity-and-natural-resources" },
                            { label: "Business Sustainability Management", path: "/executive-training/business-sustainability-management" },
                            {
                              label: "Carbon Markets",
                              path: "/executive-training/carbon-markets",
                              id: "carbon-markets",
                              children: [
                                { label: "Carbon Accounting & Carbon Offsetting Course", path: "/executive-training/carbon-accounting-carbon-offsetting-course" },
                                { label: "Certificate Course on Nature Based Solutions for Disaster and Climate Resilience", path: "/executive-training/certificate-course-on-nature-based-solutions-for-disaster-and-climate-resilience" },
                                { label: "Certificate in Green Finance", path: "/executive-training/certificate-in-green-finance" },
                                { label: "Certified Expert in Biodiversity Finance", path: "/executive-training/certified-expert-in-biodiversity-finance" },
                                { label: "Certified Expert in Environmental Accounting, Leadership and Sustainability", path: "/executive-training/certified-expert-in-environmental-accounting" },
                                { label: "Certified Expert in Sustainable Finance", path: "/executive-training/certified-expert-in-sustainable-finance" },
                                { label: "Climate & Biodiversity Certificate Program", path: "/executive-training/climate-biodiversity-certificate-program" },
                                { label: "CLIMATE AND HEALTH CERTIFICATE COURSE", path: "/executive-training/climate-and-health-certificate-course" },
                                { label: "Climate Change and Water", path: "/executive-training/climate-change-and-water" }
                              ]
                            },
                            { label: "Human Resources Professional Courses", path: "/executive-training/human-resources-professional-courses" },
                            { label: "Green Skills Development", path: "/executive-training/green-skills-development" },
                            {
                              label: "Past Training",
                              path: "/executive-training/past-training",
                              id: "past-training",
                              children: [
                                { label: "CLIMATE RESILIENT INFRASTRACTURE DEVELOPMENT TRAINING COURSE", path: "/executive-training/climate-resilient-infrastructure" },
                                { label: "ENVIRONMENT, CLIMATE CHANGE, ENERGY, AND SUSTAINABILITY COURSES", path: "/executive-training/environment-climate-change-courses" },
                                { label: "REGIONAL WORKSHOP: CLIMATE CHANGE AND FOOD SYSTEMS TRANSFORMATION", path: "/executive-training/regional-workshop" },
                                { label: "TRAINING ON CARBON MARKETS AND TRADING", path: "/executive-training/training-on-carbon-markets" }
                              ]
                            }
                          ].map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="relative"
                              onMouseEnter={() => sub.children && setActiveThirdLevelDropdown(sub.id)}
                              onMouseLeave={() => sub.children && setActiveThirdLevelDropdown(null)}
                            >
                              <Link
                                to={sub.path}
                                className="flex items-center justify-between px-6 py-2.5 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium border-b border-gray-50 last:border-0"
                              >
                                <span>{sub.label}</span>
                                {sub.children && <ChevronRight size={12} />}
                              </Link>
                              
                              {/* Third Level Dropdown */}
                              {sub.children && activeThirdLevelDropdown === sub.id && (
                                <div className="absolute left-full top-0 pl-1 w-72 z-50 animate-fade-in">
                                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                                    {sub.children.map((child, cIdx) => (
                                      <Link
                                        key={cIdx}
                                        to={child.path}
                                        className="block px-6 py-2.5 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors border-b border-gray-50 last:border-0"
                                      >
                                        {child.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>

              {/* RESEARCH & CONSULTANCY Dropdown */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => setActiveDropdown('research')}
                onMouseLeave={() => { setActiveDropdown(null); setActiveSubDropdown(null); }}
              >
                <button
                  className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                    isActive("/newsroom") ? "active" : ""
                  }`}
                >
                  RESEARCH &amp; CONSULTANCY
                  <ChevronDown size={14} className="transition-transform duration-200" />
                </button>
                {activeDropdown === 'research' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 z-50 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                    <Link
                      to="/research/overview"
                      className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                    >
                      Overview
                    </Link>

                    {/* Consultancy Subdropdown */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubDropdown('consultancy')}
                      onMouseLeave={() => setActiveSubDropdown(null)}
                    >
                      <div className="flex items-center justify-between px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section cursor-pointer transition-colors font-medium">
                        <span>Consultancy</span>
                        <ChevronRight size={14} />
                      </div>
                      {activeSubDropdown === 'consultancy' && (
                        <div className="absolute left-full top-0 pl-2 w-72 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                          {[
                            { label: "Overview", path: "/research/consulting" },
                            {
                              label: "Studies and Assessments",
                              path: "/research/assessments",
                              id: "studies-and-assessments",
                              children: [
                                { label: "Baseline Study", path: "/research/baseline-study" },
                                { label: "Assessments", path: "/research/assessments" },
                                { label: "Policy Reviews and Assessments", path: "/research/policy-reviews-and-assessments" },
                                { label: "Policy Analysis", path: "/research/policy-analysis" }
                              ]
                            },
                            {
                              label: "Strategic Social and Environmental Assessments (SSEA)",
                              path: "/research/strategic-environmental-assessments-sea-2",
                              id: "ssea",
                              children: [
                                { label: "Environmental and Social Impact Assessment (SEA)", path: "/research/environmental-and-social-impact-assessment" },
                                { label: "Strategic Environmental Assessments (SEA)", path: "/research/strategic-environmental-assessments-sea-2" },
                                { label: "Environmental and Social Management Plans (ESMP)", path: "/research/environmental-and-social-management-plans-esmp" }
                              ]
                            },
                            { label: "Rapporteur and Reporting Services", path: "/research/rapporteur-and-reporting-services" },
                            {
                              label: "Audits",
                              path: "/research/environmental-audits",
                              id: "audits",
                              children: [
                                { label: "Environmental Audits", path: "/research/environmental-audits" },
                                { label: "Energy Audits", path: "/research/energy-audits" },
                                { label: "Scoping Studies", path: "/research/scoping-studies" }
                              ]
                            }
                          ].map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="relative"
                              onMouseEnter={() => sub.children && setActiveThirdLevelDropdown(sub.id)}
                              onMouseLeave={() => sub.children && setActiveThirdLevelDropdown(null)}
                            >
                              <Link
                                to={sub.path}
                                className="flex items-center justify-between px-6 py-2.5 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium border-b border-gray-50 last:border-0"
                              >
                                <span>{sub.label}</span>
                                {sub.children && <ChevronRight size={12} />}
                              </Link>
                              
                              {sub.children && activeThirdLevelDropdown === sub.id && (
                                <div className="absolute left-full top-0 pl-1 w-72 z-50 animate-fade-in">
                                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                                    {sub.children.map((child, cIdx) => (
                                      <Link
                                        key={cIdx}
                                        to={child.path}
                                        className="block px-6 py-2.5 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors border-b border-gray-50 last:border-0"
                                      >
                                        {child.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        </div>
                      )}
                    </div>

                    {/* Research Areas Subdropdown */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubDropdown('research-areas')}
                      onMouseLeave={() => setActiveSubDropdown(null)}
                    >
                      <div className="flex items-center justify-between px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section cursor-pointer transition-colors font-medium">
                        <span>Research Areas</span>
                        <ChevronRight size={14} />
                      </div>
                      {activeSubDropdown === 'research-areas' && (
                        <div className="absolute left-full top-0 pl-2 w-72 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                          {[
                            {
                              label: "Climate Change",
                              path: "/research/climate-finance",
                              id: "climate-change-research",
                              children: [
                                { label: "Climate Finance", path: "/research/climate-finance" },
                                { label: "Climate Adaptation", path: "/research/climate-adaptation" },
                                { label: "Climate Change Mitigation", path: "/research/climate-change-mitigation" },
                                { label: "Climate and Technology", path: "/research/climate-and-technology" }
                              ]
                            },
                            { label: "Energy Transition", path: "/research/energy-transition" },
                            { label: "Agriculture and Food Systems", path: "/research/agriculture-and-food-systems-2" },
                            { label: "Natural Resources Research", path: "/research/natural-resources" },
                            { label: "Transport and E-Mobility", path: "/research/transport-and-e-mobility" },
                            { label: "Waste and Circular Economy", path: "/research/waste-and-circular-economy-2" },
                            { label: "Just Transition", path: "/research/just-transition" },
                            { label: "Environmental Law and Governance", path: "/research/environmental-law-and-governance" }
                          ].map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="relative"
                              onMouseEnter={() => sub.children && setActiveThirdLevelDropdown(sub.id)}
                              onMouseLeave={() => sub.children && setActiveThirdLevelDropdown(null)}
                            >
                              <Link
                                to={sub.path}
                                className="flex items-center justify-between px-6 py-2.5 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium border-b border-gray-50 last:border-0"
                              >
                                <span>{sub.label}</span>
                                {sub.children && <ChevronRight size={12} />}
                              </Link>
                              
                              {sub.children && activeThirdLevelDropdown === sub.id && (
                                <div className="absolute left-full top-0 pl-1 w-72 z-50 animate-fade-in">
                                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                                    {sub.children.map((child, cIdx) => (
                                      <Link
                                        key={cIdx}
                                        to={child.path}
                                        className="block px-6 py-2.5 text-xs text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors border-b border-gray-50 last:border-0"
                                      >
                                        {child.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>

              {/* RESOURCES Dropdown */}
              <div
                className="relative flex items-center h-full"
                onMouseEnter={() => setActiveDropdown('resources')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`ecasi-nav-link flex items-center gap-1 h-full text-sm font-semibold tracking-wide ${
                    isActive("/gallery") ? "active" : ""
                  }`}
                >
                  RESOURCES
                  <ChevronDown size={14} className="transition-transform duration-200" />
                </button>
                {activeDropdown === 'resources' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 z-50 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3">
                    {[
                      { label: "Resources Hub", path: "/resources" },
                      { label: "Gallery", path: "/gallery" },
                      { label: "Publications", path: "/resources/publications" },
                      { label: "Policies and Laws", path: "/resources/policies-and-laws" },
                      { label: "Reports", path: "/resources/reports" },
                      { label: "Vacancies", path: "/vacancies" },
                      { label: "Videos", path: "/resources/videos" },
                      { label: "Books", path: "/resources/books" },
                      { label: "Policy Briefs", path: "/resources/policy-briefs" }
                    ].map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        className="block px-6 py-2.5 text-sm text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              {/* CONTACT US */}
              <Link
                to="/contact"
                className={`ecasi-nav-link flex items-center h-full text-sm font-semibold tracking-wide ${isActive("/contact") ? "active" : ""}`}
              >
                CONTACT US
              </Link>
            </div>

            {/* Search Overlay icon */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="ecasi-icon-circle"
                aria-label="Search"
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
            <div className="max-w-[1476px] mx-auto flex items-center gap-4">
              <input
                type="text"
                placeholder="Search ECASI Africa..."
                autoFocus
                className="flex-1 border-b-2 border-ecasi-green outline-none py-2 text-base text-ecasi-navy placeholder-ecasi-body bg-transparent font-sans"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-ecasi-body hover:text-ecasi-red transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white absolute top-full left-0 w-full z-50 max-h-[80vh] overflow-y-auto shadow-lg py-4">
            <div className="px-4 space-y-1">

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded ${
                  isActive("/") ? "bg-ecasi-section text-ecasi-red" : "text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section"
                }`}
              >
                Home
              </Link>

              {/* About Us (Accordion style for mobile) */}
              <div>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold uppercase tracking-wide text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section rounded shadow-sm"
                >
                  About Us
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'about' ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === 'about' && (
                  <div className="bg-gray-50 px-4 border-l-[3px] border-ecasi-green py-1.5 space-y-0.5 mt-0.5 rounded-r shadow-inner">
                    {aboutLinks.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Programmes */}
              <div>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'programmes' ? null : 'programmes')}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold uppercase tracking-wide text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section rounded shadow-sm"
                >
                  Programmes
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'programmes' ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === 'programmes' && (
                  <div className="bg-gray-50 px-4 border-l-[3px] border-ecasi-green py-1.5 space-y-0.5 mt-0.5 rounded-r shadow-inner">
                    <Link
                      to="/specialties/clean-air-programme"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Air Quality Programme
                    </Link>
                    {/* Climate Change Action sub-accordion */}
                    <div>
                      <button
                        onClick={() => setActiveSubDropdown(activeSubDropdown === 'climate' ? null : 'climate')}
                        className="w-full flex items-center justify-between py-1.5 text-sm text-ecasi-body hover:text-ecasi-green"
                      >
                        Climate Change Action
                        <ChevronDown size={12} className={`transition-transform duration-200 ${activeSubDropdown === 'climate' ? "rotate-180" : ""}`} />
                      </button>
                      {activeSubDropdown === 'climate' && (
                        <div className="bg-gray-100/80 px-3 border-l-2 border-ecasi-green/40 py-1 space-y-0.5 mt-0.5 rounded-r">
                          {[
                            { label: "Training, Education & Public Awareness", path: "/training-education-public-awareness" },
                            { label: "Research and Systematic Observation", path: "/research-systematic-observation" },
                            { label: "Creation of an Enabling Environment", path: "/creation-enabling-environment" },
                            { label: "Adaptation & Mitigation Assessments", path: "/adaptation-mitigation-assessments" },
                            { label: "GHG Inventories", path: "/ghg-inventories" },
                            { label: "Institutional capacity-building and Reskilling", path: "/institutional-capacity-building" },
                            { label: "Integrated Programming for Climate Change", path: "/climate-change-programming" },
                            { label: "National Communications", path: "/national-communications" },
                          ].map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              to={sub.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-1 text-xs text-ecasi-body hover:text-ecasi-green"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link
                      to="/specialties/energy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Renewable Energy and Just Transition
                    </Link>
                    <Link
                      to="/specialties/sustainable-agriculture-and-food-systems"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Agriculture and Food Systems
                    </Link>
                    <Link
                      to="/specialties/transport"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Sustainable Transport &amp; E-Mobility
                    </Link>
                    <Link
                      to="/specialties/waste-and-circular-economy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Waste &amp; Circular Economy
                    </Link>
                    <Link
                      to="/specialties/forests"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Natural Resources Management
                    </Link>
                  </div>
                )}
              </div>

              {/* Executive Training */}
              <div>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'training' ? null : 'training')}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold uppercase tracking-wide text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section rounded shadow-sm"
                >
                  Executive Training
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'training' ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === 'training' && (
                  <div className="bg-gray-50 px-4 border-l-[3px] border-ecasi-green py-1.5 space-y-0.5 mt-0.5 rounded-r shadow-inner">
                    <Link
                      to="/institute-overview"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Institute Overview
                    </Link>
                    <Link
                      to="/executive-training/courses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-gray-700 hover:text-ecasi-green transition-colors"
                    >
                      Courses
                    </Link>
                  </div>
                )}
              </div>

              {/* Research & Consultancy */}
              <div>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'research' ? null : 'research')}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold uppercase tracking-wide text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section rounded shadow-sm"
                >
                  Research &amp; Consultancy
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'research' ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === 'research' && (
                  <div className="pl-6 border-l-2 border-ecasi-green py-1 space-y-1">
                    <Link
                      to="/research/overview"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Overview
                    </Link>
                    <Link
                      to="/research/consulting"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Consultancy
                    </Link>
                    <Link
                      to="/research/climate-finance"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Research Areas
                    </Link>
                  </div>
                )}
              </div>

              {/* Resources */}
              <div>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wide text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section rounded"
                >
                  Resources
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'resources' ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === 'resources' && (
                  <div className="pl-6 border-l-2 border-ecasi-green py-1 space-y-1">
                    <Link
                      to="/resources"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Resources Hub
                    </Link>
                    <Link
                      to="/gallery"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Gallery
                    </Link>
                    <Link
                      to="/resources/publications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Publications
                    </Link>
                    <Link
                      to="/resources/policies-and-laws"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Policies and Laws
                    </Link>
                    <Link
                      to="/resources/reports"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Reports
                    </Link>
                    <Link
                      to="/vacancies"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Vacancies
                    </Link>
                    <Link
                      to="/resources/videos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Videos
                    </Link>
                    <Link
                      to="/resources/books"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Books
                    </Link>
                    <Link
                      to="/resources/policy-briefs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-ecasi-body hover:text-ecasi-green"
                    >
                      Policy Briefs
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded ${
                  isActive("/contact") ? "bg-ecasi-section text-ecasi-red" : "text-ecasi-navy hover:text-ecasi-green hover:bg-ecasi-section"
                }`}
              >
                Contact Us
              </Link>

            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
