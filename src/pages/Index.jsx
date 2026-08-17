import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { GraduationCap, Briefcase, Brain, Landmark, Calendar, MapPin, Quote, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import LinkedInFeed from '@/components/LinkedInFeed';
import { dataService } from '@/lib/dataService';
import beryleImg from '@/assets/beryle.png';
import yasukoImg from '@/assets/yasuko.png';
// ─── Partners Data for Ticker Carousel ────────────────────────────────────────
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

// ─── Hero Slider ─────────────────────────────────────────────────────────────
// Slides mirror the WordPress Smart Slider 3 (n2-ss-3) on ecasiafrica.org
// Base: 1200×600px fullwidth | Autoplay: 5 000 ms | Transition: horizontal 800 ms easeOutQuad
const heroSlides = [
  {
    bg: "/images/Gallery/air_quality_handshake.jpg",
    title: "Air Quality Training &\nClimate Resilience",
    subtitle: "Empowering stakeholders and communities with technical knowledge to drive climate resilient actions and policies globally.",
    cta:  { label: "Our Programmes", to: "/training-education-public-awareness" },
    cta2: { label: "Contact Us",     to: "/contact" },
    focalX: '50%', focalY: '30%',
  },
  {
    bg: "/images/courses/professional_training.png",
    title: "Professional Training &\nCapacity Development",
    subtitle: "Empowering professionals with hands-on technical knowledge in climate change, green economy, and sustainable development through targeted workshops.",
    cta:  { label: "View Courses", to: "/institute-overview" },
    cta2: { label: "Register",     to: "/contact" },
    focalX: '50%', focalY: '35%',
  },
  {
    bg: "/images/Gallery/1710846398298.jpg",
    title: "Capacity\nDevelopment",
    subtitle: "Professional courses, executive workshops, and mentorship programs in climate change, green economy, and sustainable development.",
    cta:  { label: "View Courses", to: "/institute-overview" },
    cta2: { label: "Register",     to: "/contact" },
    focalX: '50%', focalY: '25%',
  },
  {
    bg: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    title: "Consultancy and\nBusiness Advisory",
    subtitle: "Providing environmental assessments, ESG advisory, and strategic consultancy to guide sustainable infrastructure and green investment decisions.",
    cta:  { label: "Consultancy Services", to: "/research/consulting" },
    cta2: { label: "Contact Us",           to: "/contact" },
    focalX: '50%', focalY: '35%',
  },
  {
    bg: "/images/research/field_research.jpg",
    title: "Research and\nInnovation",
    subtitle: "Conducting rigorous field research, systematic observation, and evidence-based analysis that powers policy decisions across Africa.",
    cta:  { label: "Research Areas", to: "/research-systematic-observation" },
    cta2: { label: "Our Work",       to: "/our-strategic-focus" },
    focalX: '50%', focalY: '25%',
  },
  {
    bg: "/images/research/technis.png",
    title: "Policy and\nTechnical Support",
    subtitle: "Driving impactful multilateral policy outcomes, policy advocacy, and enabling environments for sustainable development.",
    cta:  { label: "Our Policies", to: "/our-policies" },
    cta2: { label: "Learn More",   to: "/about" },
    focalX: '50%', focalY: '35%',
  },
];

// ─── Smart Slider 3 – faithful React recreation ───────────────────────────────
// Matches WP config:
//   • fullwidth, max-width 1200 px limiter (n2-ss-slide-limiter)
//   • horizontal translateX transition, 800 ms, cubic-bezier(0.25,0.46,0.45,0.94) ≈ easeOutQuad
//   • 5 000 ms autoplay
//   • Arrow: 26 px image-like chevron, orange (#ff9139) on hover
//   • Heading box: RGBA(0,0,0,0.67) bg → RGBA(255,145,57,1) on hover, border-radius 3 px
//   • Dot bullets at bottom-center
const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [sliding, setSliding] = useState(false);
  const timerRef = useRef(null);
  const n = heroSlides.length;

  const goTo = useCallback((next) => {
    if (sliding || next === current) return;
    setPrev(current);
    setCurrent(next);
    setSliding(true);
    setTimeout(() => { setPrev(null); setSliding(false); }, 820);
  }, [sliding, current]);

  const goNext = useCallback(() => goTo((current + 1) % n), [current, n, goTo]);
  // const goPrev = useCallback(() => goTo((current - 1 + n) % n), [current, n, goTo]);

  // Reset autoplay timer on every interaction
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, 5000);
  }, [goNext]);

  useEffect(() => {
    timerRef.current = setInterval(goNext, 5000);
    return () => clearInterval(timerRef.current);
  }, [current, goNext]);

  return (
    // n2-ss-slider-1 → n2-ss-slider-2 → n2-ss-slider-3
    <div
      className="n2ss-hero"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: 'clamp(300px, 60vh, 700px)',
        background: '#032e42',
      }}
    >
      {/* ── Slide backgrounds (n2-ss-slide-backgrounds) ── */}
      {heroSlides.map((s, idx) => {
        const isActive = idx === current;

        // Calculate shortest path distance with modulo
        let diff = idx - current;
        diff = ((diff + n/2) % n + n) % n - n/2;

        const transform = `translateX(${diff * 100}%)`;
        const transition = (isActive || idx === prev) && sliding
          ? 'transform 820ms cubic-bezier(0.25,0.46,0.45,0.94)'
          : 'none';
        const zIndex = isActive ? 12 : (idx === prev ? 11 : 10);

        return (
          <div
            key={idx}
            style={{
              position: 'absolute', inset: 0,
              transform, transition, zIndex,
              willChange: 'transform',
              background: '#032e42',
            }}
          >
            {/* Blurred fill layer — prevents dark bars on any aspect ratio */}
            <img
              src={s.bg}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40 select-none pointer-events-none"
              style={{ objectPosition: `${s.focalX || '50%'} ${s.focalY || '40%'}` }}
            />
            {/* Sharp primary image — object-cover with per-slide focal point */}
            <img
              src={s.bg}
              alt={`Slide ${idx + 1}`}
              fetchPriority={idx === 0 ? 'high' : 'auto'}
              loading={idx === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: `${s.focalX || '50%'} ${s.focalY || '40%'}`,
                filter: 'saturate(1.1) contrast(1.05) brightness(1.02)',
              }}
            />
          </div>
        );
      })}

      {/* ── Dark gradient overlay (matches WP ecasi-hero-overlay) ── */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none',
          background: `
            linear-gradient(to bottom,
              rgba(3,46,66,0.08) 0%,
              rgba(3,46,66,0.28) 55%,
              rgba(3,46,66,0.60) 100%),
            radial-gradient(circle at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.18) 100%)
          `,
        }}
      />

      {/* ── Slide content (n2-ss-slider-4 / n2-ss-slide) ── */}
      {/* n2-ss-slide-limiter: max-width 1200 px centered */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          {heroSlides.map((s, idx) => {
            const visible = idx === current;
            return (
              <div
                key={idx}
                style={{
                  display: visible ? 'block' : 'none',
                  animation: visible && !sliding ? 'n2ssContentIn 0.5s ease-out' : 'none',
                }}
              >

                {/* Heading — n2-style heading box: dark bg, orange hover */}
                <h1 className="n2ss-heading" style={{
                  display: 'inline-block',
                  fontFamily: "'Fira Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(22px, 3.4vw, 42px)',
                  lineHeight: 1.18,
                  color: '#ffffff',
                  whiteSpace: 'pre-line',
                  marginBottom: '28px',
                }}>
                  {s.title}
                </h1>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {s.cta && (
                    <Link
                      to={s.cta.to}
                      onClick={resetTimer}
                      style={{
                        background: '#008000',
                        color: '#ffffff',
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '10px 26px',
                        borderRadius: '3px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        transition: 'background 0.25s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#252628'}
                      onMouseLeave={e => e.currentTarget.style.background = '#008000'}
                    >
                      {s.cta.label}
                    </Link>
                  )}
                  {s.cta2 && (
                    <Link
                      to={s.cta2.to}
                      onClick={resetTimer}
                      style={{
                        border: '2px solid rgba(255,255,255,0.85)',
                        color: '#ffffff',
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '8px 24px',
                        borderRadius: '3px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        transition: 'background 0.25s, color 0.25s, border-color 0.25s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#032e42'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff'; }}
                    >
                      {s.cta2.label}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* ── Dot bullets (bottom-center) ── */}
      <div style={{
        position: 'absolute', bottom: '18px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '7px', zIndex: 25,
      }}>
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i, i > current ? 1 : -1); resetTimer(); }}
            aria-label={`Slide ${i + 1}`}
            style={{
              height: '8px',
              width: i === current ? '28px' : '8px',
              borderRadius: '4px',
              background: i === current ? '#ffffff' : 'rgba(255,255,255,0.45)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Stats Bar ───────────────────────────────────────────────────────────────
const stats = [
  { value: "30+", label: "Organizations Worked With" },
  { value: "8+", label: "Countries Delivered Services" },
  { value: "5000+", label: "Participants Inspired" },
  { value: "10+", label: "Years of Experience" },
  { value: "50+", label: "Physical & Online Sessions" },
];

// ─── Programmes ──────────────────────────────────────────────────────────────
const programmes = [
  {
    variant: "green",
    title: "TRAINING",
    desc: "We offer technical, knowledge, and green skills-based courses covering climate change, policy, finance, sustainability, governance, technology and research.",
    link: "/institute-overview",
    icon: <GraduationCap size={28} />,
  },
  {
    variant: "teal",
    title: "RESEARCH",
    desc: "As a think tank, we serve as a centre for research and analysis, conducting in-depth research to guide decision-makers and stakeholders.",
    link: "/research/overview",
    icon: <Brain size={28} className="text-white" />,
  },
  {
    variant: "green",
    title: "CONSULTANCY",
    desc: "We provide integrated consultancy and advisory services supporting governments, development partners, and private sector actors.",
    link: "/consultancy",
    icon: <Briefcase size={28} />,
  },
  {
    variant: "teal",
    title: "POLICY ADVISORY",
    desc: "We offer support in policy development and review, providing evidence-based recommendations to inform and influence policy decisions.",
    link: "/our-policies",
    icon: <Landmark size={28} className="text-white" />,
  },
  {
    variant: "green",
    title: "TECHNICAL ASSISTANCE",
    desc: "Our multidisciplinary team contributes to capacity building, stakeholder consultations, and technical implementation of sustainability programs.",
    link: "/our-strategic-focus",
    icon: <Briefcase size={28} />,
  },
  {
    variant: "teal",
    title: "AIR QUALITY",
    desc: "Empowering stakeholders and communities with technical knowledge to drive clean air initiatives and sustainable environments.",
    link: "/specialties/clean-air-programme",
    icon: <Brain size={28} className="text-white" />,
  },
];

// ─── Events (Imported from data) ────────────────────────────────────────────────

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Beryl Omolo",
    role: "Konza Technopolis Authority",
    quote: "It’s my first training and coming in I had so many expectations about knowing where these carbon markets are, is carbon markets really a thing. What I have learnt is very important and going back to the office I’ll be able to make an impact with the information.",
    image: beryleImg
  },
  {
    name: "Clifford Siocha",
    role: "Senior environmentalist, KETRACO",
    quote: "I’m quite delighted to be among the participants of the training on carbon markets as offered by NETFUND in collaboration with ECAS. We got to realize about the opportunity to train through an invitation letter sent to us.",
    image: ""
  },
  {
    name: "Yasuko Inoue",
    role: "Projects expert, JICA",
    quote: "I really thank the organizers of this training that is NETFUND and ECAS. There’s a lot of people who are interested in carbon markets and we are learning with each other, as we interact with various people who are very passionate.",
    image: yasukoImg
  },
  {
    name: "Robert Ayaga",
    role: "Electrical Engineer, KETRACO",
    quote: "My experience in this workshop, actually I was very green... I really appreciate this training. I intend to take this to KETRACO where I want to take advantage of our credit points. I appreciate this opportunity and I believe that we are going to keep in touch.",
    image: ""
  }
];

// ─── Main Component ───────────────────────────────────────────────────────────
const Index = () => {
  const upcomingEvents = dataService.getEvents();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentStat, setCurrentStat] = useState(0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const processedEvents = upcomingEvents.map(ev => {
    const eventDate = new Date(ev.date);
    return {
      ...ev,
      isPast: eventDate < now,
      dateObj: eventDate
    };
  }).sort((a, b) => {
    if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
    if (!a.isPast) return a.dateObj - b.dateObj;
    return b.dateObj - a.dateObj;
  });

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((c) => (c + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentStat((c) => (c + 1) % stats.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <SEO
        title="ECAS Institute — Bridging the Nexus Between Research, Policy and Practice"
        description="Environmental Capacities and Sustainability (ECAS) Institute is an independent Pan-African think tank advancing sustainable development through research, policy advisory, and capacity building."
      />
      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        {/* ── Hero Slider ── */}
        <HeroSlider />

        {/* ── Stats Bar ── */}
        <div className="bg-ecasi-navy py-0 overflow-hidden">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
            {/* Desktop View (lg and up) */}
            <div className="hidden lg:grid lg:grid-cols-5">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="py-3 px-5 text-center border-r border-white/10 last:border-r-0"
                >
                  <div
                    className="text-2xl font-bold text-ecasi-orange mb-0.5"
                    style={{ fontFamily: "'Fira Sans', sans-serif", color: "#fda128" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-white/70 text-xs uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile/Tablet View (below lg) - Carousel */}
            <div className="lg:hidden relative overflow-hidden py-4">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentStat * 100}%)` }}
              >
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="w-full flex-shrink-0 text-center px-4"
                  >
                    <div
                      className="text-3xl font-bold text-ecasi-orange mb-1"
                      style={{ fontFamily: "'Fira Sans', sans-serif", color: "#fda128" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-white/80 text-xs uppercase tracking-wider" style={{ fontFamily: "'Roboto', sans-serif" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {stats.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStat(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStat ? 'w-4 bg-ecasi-orange' : 'w-1.5 bg-white/30'}`}
                    aria-label={`Go to stat ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Our Big Idea ── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
            <ScrollAnimation animation="slide-up">
              <p className="ecasi-section-title text-2xl md:text-3xl mb-2">OUR BIG IDEA</p>
              <div className="ecasi-section-divider mb-8" />
              <div className="max-w-4xl">
                <p
                  className="ecasi-drop-cap text-ecasi-body text-base md:text-lg leading-relaxed mb-5"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Environmental Capacities and Sustainability (ECAS) Institute is a Pan-African think tank advancing capacity development through training, research, policy advisory, technical assistance and consultancy. We operate across East Africa, West Africa, and have a Global Reach, supporting green growth and evidence-based environment policies.
                </p>
                <p className="text-ecasi-body text-base leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  Over the years, ECAS has trained thousands of professionals and communities, mentored young leaders, conducted research assignments, and delivered advisory and consultancy services that drive evidence-based solutions, institutional growth, and sustainable impact across Africa and beyond.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Divider line */}
        <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
          <div className="h-px bg-gradient-to-r from-ecasi-green via-ecasi-teal to-transparent" />
        </div>

        {/* ── Our Specialized Programmes ── */}
        <section className="py-16 md:py-20 bg-ecasi-section">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              {/* Label column */}
              <div className="lg:w-56 flex-shrink-0">
                <ScrollAnimation animation="slide-in-left">
                  <p className="ecasi-section-title text-xl mb-2">OUR SPECIALIZED</p>
                  <p className="ecasi-section-title text-xl">PROGRAMMES</p>
                  <div className="ecasi-section-divider" />
                  <p className="text-ecasi-body text-sm leading-relaxed mt-4" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    Delivering excellence across all areas of capacity planning, environmental policy, and green transitions.
                  </p>
                  <Link to="/our-strategic-focus" className="ecasi-btn-primary mt-6 inline-block text-xs">
                    View All Focus Areas
                  </Link>
                </ScrollAnimation>
              </div>

              {/* Cards grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {programmes.map((p, i) => (
                  <ScrollAnimation key={i} animation="scale-in" delay={i * 80}>
                    <div className={p.variant === "green" ? "ecasi-card-green" : "ecasi-card-teal"}>
                      <div className="ecasi-card-wave" />
                      <div className="relative z-10 p-7 pt-8">
                        <div className="mb-4 opacity-90 text-white">{p.icon}</div>
                        <h3
                          className="text-white font-bold text-base mb-3 leading-snug"
                          style={{ fontFamily: "'Fira Sans', sans-serif" }}
                        >
                          {p.title}
                        </h3>
                        <p className="text-white/85 text-sm leading-relaxed mb-5" style={{ fontFamily: "'Roboto', sans-serif" }}>
                          {p.desc}
                        </p>
                        <p className="text-sm font-bold" style={{ fontFamily: "'Roboto', sans-serif" }}>
                          <span className="text-white/80">LEARN MORE? – </span>
                          <Link to={p.link} className="ecasi-learn-more text-white underline font-bold">
                            YES PLEASE!!
                          </Link>
                        </p>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Partners Section ── */}
        <section className="py-12 bg-white border-t border-gray-100 overflow-hidden select-none relative w-full">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16 mb-10">
            <ScrollAnimation animation="slide-up">
              <p className="ecasi-section-title text-2xl md:text-3xl mb-2 text-center">OUR PARTNERS</p>
              <div className="flex justify-center mb-6">
                <div className="ecasi-section-divider" />
              </div>
              <p className="text-center text-ecasi-body text-base max-w-2xl mx-auto">
                We collaborate with leading institutions to drive impact across Africa.
              </p>
            </ScrollAnimation>
          </div>

          <div className="relative w-full overflow-hidden flex flex-col justify-center">
            {/* Gradient Mask for Fade Effect at Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="flex w-[200%] gap-12 items-center animate-marquee whitespace-nowrap py-4">
              {/* Copy 1 */}
              <div className="flex justify-around items-center gap-16 min-w-full shrink-0">
                {partners.map((partner, idx) => (
                  <a
                    key={`p1-${idx}`}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-14 flex items-center transition-all duration-300 transform hover:scale-105 shrink-0"
                    title={partner.name}
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-full object-contain max-w-[160px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-gray-400 uppercase tracking-wider">${partner.name}</span>`;
                      }}
                    />
                  </a>
                ))}
              </div>
              {/* Copy 2 */}
              <div className="flex justify-around items-center gap-16 min-w-full shrink-0">
                {partners.map((partner, idx) => (
                  <a
                    key={`p2-${idx}`}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-14 flex items-center transition-all duration-300 transform hover:scale-105 shrink-0"
                    title={partner.name}
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-full object-contain max-w-[160px]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-gray-400 uppercase tracking-wider">${partner.name}</span>`;
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Upcoming Events ── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
            <div className="flex items-end justify-between mb-10">
              <ScrollAnimation animation="slide-up">
                <p className="ecasi-section-title text-2xl md:text-3xl mb-2">UPCOMING EVENTS</p>
                <div className="ecasi-section-divider" />
              </ScrollAnimation>
              <Link to="/newsroom" className="ecasi-btn-outline text-xs mt-4 md:mt-0">
                View All Events
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {processedEvents.map((ev, i) => (
                <ScrollAnimation key={i} animation="slide-up" delay={i * 100}>
                  <div className={`ecasi-event-card ${ev.isPast ? 'opacity-80 bg-gray-50' : ''}`}>
                    {/* Color header bar */}
                    <div
                      className="h-2"
                      style={{ background: ev.isPast ? '#9ca3af' : (i % 2 === 0 ? "#008000" : "#20b2aa") }}
                    />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white"
                          style={{ background: ev.isPast ? '#9ca3af' : (i % 2 === 0 ? "#008000" : "#20b2aa"), fontFamily: "'Roboto', sans-serif" }}
                        >
                          {ev.type}
                        </span>
                        {ev.isPast && (
                          <span className="inline-block text-[10px] font-bold px-2 py-1 rounded border border-red-300 bg-red-50 text-red-600 uppercase tracking-wider">
                            Past Event
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-ecasi-navy font-bold text-base mb-3 leading-snug"
                        style={{ fontFamily: "'Fira Sans', sans-serif" }}
                      >
                        {ev.title}
                      </h3>
                      <p className="text-ecasi-body text-sm leading-relaxed mb-4" style={{ fontFamily: "'Roboto', sans-serif" }}>
                        {ev.desc}
                      </p>
                      <div className="space-y-2 text-xs text-ecasi-body border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-ecasi-green flex-shrink-0" />
                          <span>{new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-ecasi-green flex-shrink-0" />
                          <span>{ev.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* ── LinkedIn Feed ── */}
        <section className="py-16 md:py-20 bg-gray-50 border-t border-gray-200">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
            <ScrollAnimation animation="slide-up">
              <p className="ecasi-section-title text-2xl md:text-3xl mb-2">LATEST FROM LINKEDIN</p>
              <div className="ecasi-section-divider mb-8" />
            </ScrollAnimation>
            <LinkedInFeed />
          </div>
        </section>

        {/* ── Client Testimonials ── */}
        <section className="py-8 md:py-10 bg-gray-50 relative overflow-hidden">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16 relative z-10">
            <ScrollAnimation animation="fade-in">
              <p
                className="text-center text-xl md:text-2xl font-bold mb-2 uppercase tracking-wide text-[#032e42]"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                WHAT OUR PARTNERS SAY
              </p>
              <div className="flex justify-center mb-6">
                <div className="ecasi-section-divider" style={{ background: "linear-gradient(90deg,#20b2aa,#008000)" }} />
              </div>
            </ScrollAnimation>

            <div className="max-w-3xl mx-auto overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="min-w-full px-4 flex flex-col items-center text-center">
                    <Quote size={32} className="mx-auto mb-3 opacity-20 text-[#008000]" />
                    <p className="text-gray-600 italic text-sm">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="flex flex-col items-center gap-1 mt-4">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover mb-1 border-2 border-[#008000]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 mb-1 border-2 border-[#008000]">
                          <User size={24} className="text-gray-500" />
                        </div>
                      )}
                      <span className="text-[#032e42] font-bold text-sm" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                        {testimonial.name}
                      </span>
                      <span className="text-gray-500 text-xs font-medium">{testimonial.role}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-3 mt-5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? "w-8 bg-[#008000]" : "w-2 bg-gray-300"}`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Call to Action ── */}
        <section className="py-16 bg-ecasi-green relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border-2 border-white" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-white" />
          </div>
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2
                  className="text-white text-2xl md:text-3xl font-bold mb-3"
                  style={{ fontFamily: "'Fira Sans', sans-serif" }}
                >
                  Advance Your Sustainable Development Capacity
                </h2>
                <p className="text-white/80 text-base max-w-xl" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  Register for our upcoming executive courses or reach out for specialized consultancy services.
                </p>
              </div>
              <div className="flex gap-4 flex-shrink-0">
                <Link
                  to="/contact"
                  className="bg-white text-ecasi-green font-bold px-8 py-3 rounded text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Register / Inquire
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-white text-white font-semibold px-8 py-3 rounded text-sm uppercase tracking-wider hover:bg-white/10 transition-colors"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Index;
