import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { GraduationCap, Briefcase, Brain, Landmark, Calendar, MapPin, Quote, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import LinkedInFeed from '@/components/LinkedInFeed';
import { eventsData as upcomingEvents } from '@/data/eventsData';
import beryleImg from '@/assets/beryle.png';
import yasukoImg from '@/assets/yasuko.png';
// ─── Hero Slider ────────────────────────────────────────────────────────────
const heroSlides = [
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/Group-photo-during-Air-Quality-Training.jpg",
    title: "Air Quality Training &\nClimate Resilience",
    subtitle: "Empowering stakeholders and communities with technical knowledge to drive climate resilient actions and policies across Africa.",
    cta: { label: "Our Programmes", to: "/training-education-public-awareness" },
    cta2: { label: "Contact Us", to: "/contact" },
  },
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/DSC_0990-1.jpg",
    title: "Advancing Sustainability\nAcross Africa",
    subtitle: "We serve as an independent Pan-African think tank supporting green growth and evidence-based environment policies.",
    cta: { label: "About ECAS", to: "/about" },
    cta2: { label: "Our Team", to: "/our-team" },
  },
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/Netfund-training.jpeg",
    title: "Capacity Strengthening &\nMentorship Programs",
    subtitle: "Building the green skills required to navigate carbon markets, sustainable finance, and environment impact assessments.",
    cta: { label: "Training Courses", to: "/institute-overview" },
    cta2: { label: "Register Now", to: "/contact" },
  },
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/Lidya-caf-with-Prof-Shem.jpg",
    title: "Evidence-Based Research\n& Specialized Advisory",
    subtitle: "Providing high-level consultancy for baseline studies, strategic social assessments, and policy reviews.",
    cta: { label: "Consultancy Services", to: "/research/consulting" },
    cta2: { label: "Learn More", to: "/about" },
  },
  {
    bg: "/images/research/1710846398420-1-1-1024x683.jpg",
    title: "Field Research &\nSystematic Observation",
    subtitle: "Conducting in-depth research and delivering evidence-based recommendations for policy makers across the continent.",
    cta: { label: "Research Areas", to: "/research-systematic-observation" },
    cta2: { label: "Our Work", to: "/our-strategic-focus" },
  },
  {
    bg: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    title: "Environmental Impact\nAssessments",
    subtitle: "Delivering strategic environmental and social impact assessments that guide sustainable infrastructure and investment decisions.",
    cta: { label: "Consultancy", to: "/research/consulting" },
    cta2: { label: "Contact Us", to: "/contact" },
  },
  {
    bg: "/images/research/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1.jpg",
    title: "Policy Advocacy &\nInternational Engagement",
    subtitle: "Representing Africa's voice in global environmental forums and driving impactful multilateral policy outcomes.",
    cta: { label: "Our Policies", to: "/our-policies" },
    cta2: { label: "Learn More", to: "/about" },
  },
  {
    bg: "/images/courses/IMGM1984-1024x683.jpg",
    title: "Executive Training\nWorkshops",
    subtitle: "Professional courses in climate change, green economy, and sustainable development delivered by leading experts.",
    cta: { label: "View Courses", to: "/institute-overview" },
    cta2: { label: "Register", to: "/contact" },
  },
];


const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const go = (dir) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((c) => (c + dir + heroSlides.length) % heroSlides.length);
      setTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => go(1), 5000);
    return () => clearInterval(timerRef.current);
  });

  const slide = heroSlides[current];

  return (
    <div className="ecasi-hero" style={{ height: "clamp(380px, 55vw, 600px)" }}>
      {/* Background Images - Render all to preload */}
      {heroSlides.map((s, idx) => (
        <img
          key={idx}
          src={s.bg}
          alt={`Hero Background ${idx + 1}`}
          fetchPriority="high"
          loading="eager"
          className="ecasi-hero-img absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          style={{ opacity: idx === current && !transitioning ? 1 : 0 }}
        />
      ))}
      <div className="ecasi-hero-overlay" />

      {/* Content */}
      <div
        className="ecasi-hero-content absolute inset-0 flex items-center"
        style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s" }}
      >
        <div className="max-w-[1476px] w-full mx-auto px-4 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-white/80 text-sm uppercase tracking-widest mb-3 font-medium" style={{ fontFamily: "'Roboto', sans-serif" }}>
              ECAS INSTITUTE — BRIDGING THE NEXUS BETWEEN RESEARCH, POLICY AND PRACTICE
            </p>
            <h1
              className="ecasi-slide-heading mb-4 whitespace-pre-line"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
            >
              {slide.title}
            </h1>
            <p className="text-white/85 text-base md:text-lg mb-8 leading-relaxed max-w-xl" style={{ fontFamily: "'Roboto', sans-serif" }}>
              {slide.subtitle}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to={slide.cta.to} className="ecasi-btn-primary">
                {slide.cta.label}
              </Link>
              <Link
                to={slide.cta2.to}
                className="text-white border-2 border-white/70 hover:border-white px-7 py-2.5 rounded text-sm font-semibold uppercase tracking-wider transition-all hover:bg-white/10"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                {slide.cta2.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => { if (!transitioning) { setTransitioning(true); setTimeout(() => { setCurrent(i); setTransitioning(false); }, 300); } }}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-7 bg-white" : "w-2 bg-white/50"}`}
            aria-label={`Slide ${i + 1}`}
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
    title: "TRAINING, MENTORSHIP & SKILLING",
    desc: "We offer technical, knowledge, and green skills-based courses covering climate change, policy, finance, sustainability, governance, technology and research, projects, and human resource development and mentorship among other specialized areas.",
    link: "/training-education-public-awareness",
    icon: <GraduationCap size={28} />,
  },
  {
    variant: "teal",
    title: "CONSULTANCY & BUSINESS ADVISORY",
    desc: "ECAS Institute provides integrated consultancy and advisory services supporting governments, development partners, private sector actors, and civil society in designing and implementing sustainable, evidence-based solutions. Our work spans strategic planning, institutional development, policy advisory, environmental assessments, and sustainability-focused technical support.",
    link: "/research/consulting",
    icon: <Briefcase size={28} className="text-white" />,
  },
  {
    variant: "green",
    title: "RESEARCH & INNOVATION",
    desc: "As a think tank, we serve as a centre for research and analysis, informing and influencing policy decisions and public discourse on complex societal issues. We conduct in-depth research, analyse data, and develop evidence-based policy recommendations to guide decision-makers and stakeholders.",
    link: "/research/overview",
    icon: <Brain size={28} />,
  },
  {
    variant: "teal",
    title: "POLICY & TECHNICAL ASSISTANCE",
    desc: "We offer support in policy development and review, environmental and climate assessments, ESG advisory, and technical implementation of sustainability programs. Our multidisciplinary team also contributes to capacity building, stakeholder consultations, and knowledge exchange across key sectors.",
    link: "/our-policies",
    icon: <Landmark size={28} className="text-white" />,
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
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
        <div className="bg-ecasi-navy py-0">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16">
            <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {stats.map((s, i) => (
                <div
                  key={i}
                  className={`py-2 lg:py-3 px-4 md:px-5 text-center min-w-max flex-1 snap-start border-r border-white/10 last:border-r-0`}
                >
                  <div
                    className="text-xl md:text-2xl font-bold text-ecasi-orange mb-0.5"
                    style={{ fontFamily: "'Fira Sans', sans-serif", color: "#fda128" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-white/70 text-[9px] md:text-xs uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {s.label}
                  </div>
                </div>
              ))}
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
                  Environmental Capacities and Sustainability (ECAS) Institute is an independent Pan-African think tank advancing sustainable development through research, policy advisory, technical assistance, consultancy, and capacity strengthening. ECAS offers high-level specialized management training, skills development programmes, consultancy, and research services across climate change, environmental policy, green economy, sustainable transport, energy transitions, agriculture, health, and sustainable finance to support resilient and inclusive development.
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
        <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
          <div className="max-w-[1476px] mx-auto px-4 lg:px-16 relative z-10">
            <ScrollAnimation animation="fade-in">
              <p
                className="text-center text-2xl md:text-3xl font-bold mb-2 uppercase tracking-wide text-[#032e42]"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                WHAT OUR PARTICIPANTS SAY
              </p>
              <div className="flex justify-center mb-12">
                <div className="ecasi-section-divider" style={{ background: "linear-gradient(90deg,#20b2aa,#008000)" }} />
              </div>
            </ScrollAnimation>

            <div className="max-w-4xl mx-auto overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="min-w-full px-4 flex flex-col items-center text-center">
                    <Quote size={48} className="mx-auto mb-6 opacity-20 text-[#008000]" />
                    <p className="text-gray-600 italic">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="flex flex-col items-center gap-1 mt-8">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-[#008000]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 mb-2 border-2 border-[#008000]">
                          <User size={32} className="text-gray-500" />
                        </div>
                      )}
                      <span className="text-[#032e42] font-bold text-base" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                        {testimonial.name}
                      </span>
                      <span className="text-gray-500 text-sm font-medium">{testimonial.role}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-3 mt-10">
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
