import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import {
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Compass,
  Heart,
  Mail,
  Phone,
  Send,
  Info,
  Users,
  ShieldCheck,
} from "lucide-react";

const excursionsData = [
  {
    slug: "giraffe-centre",
    title: "Magical Visit to the Giraffe Centre",
    shortTitle: "Giraffe Centre",
    badge: "Conservation & Wildlife Sanctuary",
    subtitle:
      "A peaceful sanctuary nestled in leafy Lang'ata offering intimate encounters with endangered Rothschild giraffes.",
    heroImage: "/images/beyond/giraffe_centre.jpg",
    gallery: [
      {
        src: "/images/beyond/giraffe_centre.jpg",
        caption: "Elevated feeding platform overlooking the Rothschild giraffes",
      },
      {
        src: "/images/beyond/giraffe_centre_platform.jpg",
        caption: "Visitors hand-feeding pellets from the raised wooden platform",
      },
      {
        src: "/images/beyond/nairobi_safari_walk.jpg",
        caption: "Tranquil indigenous forest canopy surrounding Lang'ata sanctuary",
      },
    ],
    duration: "Half-Day (3–4 Hours)",
    location: "Lang'ata, Nairobi, Kenya",
    idealFor: "All Executive Cohorts, International Delegates & Teams",
    category: "Wildlife & Nature",
    highlights: [
      "Hand-feed endangered Rothschild giraffes from an elevated observation platform",
      "Opportunity to experience the iconic and lighthearted 'giraffe kiss'",
      "Guided educational tour on Rothschild giraffe breeding and Kenyan habitat preservation",
      "Meandering 1.5-kilometer nature trail through a pristine indigenous forest",
      "Rich birdwatching with over 60 indigenous bird species documented on the sanctuary grounds",
      "Ideal post-training excursion for relaxation, networking, and team connection",
    ],
    paragraphs: [
      "Just a short drive from the bustling metropolis of Nairobi lies one of Kenya’s most unique and heartwarming attractions: the Giraffe Centre. Nestled in the leafy suburb of Lang’ata, this peaceful sanctuary allows visitors an unforgettable, up-close encounter with the endangered Rothschild giraffes while promoting conservation, education, and sustainability.",
      "From the moment of arrival, the tranquility in the air greets one with a feeling of leaving the city behind. Tall trees surround the property; birds call from above, and, as you approach the raised wooden platform, you are greeted by the gentle, inquiring faces of giraffes looking over the railings. Long eyelashes, graceful movements, and friendly natures all combine to claim attention immediately.",
      "This visit allows one the unique opportunity to feed the giraffes by hand. Each guest is given special pellets of food that the giraffes take very delicately with their long, dark tongues. The reaction of most people is one of excitement mixed with humor, accompanied by lots of laughter and photo opportunities. For the truly adventurous, there is even the chance to share a “giraffe kiss”, a moment that many describe as the most memorable part of their trip.",
      "Beyond the interactive feeding experience, Giraffe Centre plays a very important role in conservation and education. Visitors can browse through the education center, in which exhibitions explain the importance of protection for the Rothschild’s giraffe and the preservation of Kenya’s wildlife habitats. Knowledgeable guides are always at hand to enlighten one with interesting facts about giraffes, their behavior, their diet, and the conservation that is happening in Kenya and beyond.",
      "For the nature lover, there is also a meandering nature trail to and from the centre through an indigenous forest. Ideal for a short walk, bird-watching, or simply tranquility, the path is the perfect addition to make this visit an informative and refreshing one. A visit to the Giraffe Centre is suitable for all types of visitors, whether on business, educational, or leisure trips. It is an ideal addition to any training or conference program, affording the opportunity for unwinding, reconnecting with nature, and enjoying a unique element of Kenyan heritage in just a few hours. The world is one where wildlife has increasingly come under threat, and the Giraffe Centre stands strong to remind us of the need for conservation, coexistence, and respect for nature. A visit here is not just an excursion, but a truly inspiring experience that stays with you long afterward.",
    ],
    included: [
      "Executive round-trip transfers from the training venue or conference hotel",
      "Giraffe Centre admission fee & conservation contribution levy",
      "Special giraffe feeding pellets and direct platform access",
      "Accompanying ECAS Institute delegate liaison & expert local guide",
      "Complimentary bottled water & light Kenyan refreshments",
    ],
    practicalTips: [
      "Bring a camera or smartphone for once-in-a-lifetime close-up wildlife photography",
      "Wear comfortable walking shoes for the forest nature trail",
      "Morning or mid-afternoon cohorts are ideal to catch the giraffes during their most active feeding hours",
    ],
  },
  {
    slug: "above-the-city",
    title: "Above the City: KICC Rooftop & Helipad",
    shortTitle: "Above the City (KICC)",
    badge: "Iconic Landmark & Skyline Panoramic",
    subtitle:
      "Stand on the legendary KICC Helipad high above Nairobi's central business district with 360° views stretching to Nairobi National Park.",
    heroImage: "/images/beyond/above_the_city.jpg",
    gallery: [
      {
        src: "/images/beyond/above_the_city.jpg",
        caption: "Golden hour sunset panoramic from the famous circular KICC Helipad",
      },
      {
        src: "/images/beyond/kicc_helipad_skyline.jpg",
        caption: "360-degree vista of Nairobi CBD, Upper Hill, and Westlands skyline",
      },
      {
        src: "/images/beyond/city_walk.jpg",
        caption: "The bustling streets and civic architecture below the KICC tower",
      },
    ],
    duration: "2–3 Hours (Sunset / Golden Hour)",
    location: "City Square, Central Business District, Nairobi",
    idealFor: "Executive Networking, Group Cohort Photography & Sunset Unwinding",
    category: "Skyline & Architectural Heritage",
    highlights: [
      "Ascend to the circular 28th-floor helipad of Kenya's most iconic architectural landmark",
      "Full 360-degree panoramic views of Upper Hill, Westlands, and Nairobi National Park",
      "Spectacular golden hour and twilight photography as the city transforms into a glittering sea of lights",
      "A peaceful, breeze-filled oasis of calm high above the busy street rhythms below",
      "Insightful architectural narrative on Kenya's modern governance and economic growth",
      "Relaxed informal setting for executive cohort bonding, networking, and group photos",
    ],
    paragraphs: [
      "Standing tall at the heart of Nairobi’s Central Business District, the Kenyatta International Convention Centre (KICC) is more than a landmark—it is a symbol of Kenya’s progress, resilience, and global outlook. A visit to the KICC rooftop offers an unforgettable experience, blending history, architecture, and breathtaking panoramic views of the city.",
      "As you step out, the city unfolds in every direction. To the north, the modern skyline of Upper Hill and Westlands reflects Nairobi’s rapid growth. To the south, on a clear day, you can spot the greenery of Nairobi National Park—an extraordinary reminder that this is the only capital city in the world with a national park at its doorstep.",
      "The view at sunset is particularly captivating. As the sun dips below the horizon, the city transitions from daylight hustle to a glittering sea of lights. It’s a perfect moment for photography, reflection, and appreciation of Nairobi’s unique character.",
      "One of the most striking aspects of the KICC rooftop is the sense of calm it offers. Despite being surrounded by busy streets, matatus, and office towers, the rooftop feels peaceful and refreshing. The cool breeze and open sky provide a welcome pause from the fast-paced rhythm of the city below.",
      "For visitors, this moment above the noise creates a deeper connection to Nairobi. It allows you to see the city not just as a place of meetings and schedules, but as a living, breathing metropolis with layers of culture, nature, and ambition.",
      "A KICC rooftop visit is an excellent addition to training programs, conferences, and corporate retreats. It offers a relaxed setting for informal networking, group photos, and shared experiences that strengthen connections among participants. Many visitors find it to be a refreshing way to unwind after a day of intensive learning or meetings.",
    ],
    included: [
      "VIP access pass and rooftop admission to the KICC Helipad",
      "Dedicated ECAS Institute escort and experienced architectural guide",
      "High-speed elevator ride to the 28th floor observation deck",
      "Professional group photo session against the Nairobi skyline backdrop",
      "Post-visit networking coffee or tea at a premier central cafe",
    ],
    practicalTips: [
      "Late afternoon (4:30 PM – 6:30 PM) offers the ultimate golden hour lighting for photography",
      "A light jacket is recommended as the rooftop breeze can be brisk at dusk",
      "Valid government-issued ID or passport is required for security clearance at the entrance",
    ],
  },
  {
    slug: "nairobi-safari-walk",
    title: "Nairobi Safari Walk: Kenya's Biodiversity Showcase",
    shortTitle: "Nairobi Safari Walk",
    badge: "Kenya Wildlife Service (KWS) Conservation Walk",
    subtitle:
      "A tranquil elevated wooden boardwalk showcasing Kenya's three major ecosystems: Wetlands, Savannah Grasslands, and Moist Forest.",
    heroImage: "/images/beyond/nairobi_safari_walk.jpg",
    gallery: [
      {
        src: "/images/beyond/nairobi_safari_walk.jpg",
        caption: "Elevated timber canopy boardwalk meandering through indigenous woodland",
      },
      {
        src: "/images/beyond/giraffe_centre.jpg",
        caption: "Up-close wildlife encounters in thoughtfully designed naturalistic habitats",
      },
      {
        src: "/images/beyond/above_the_city.jpg",
        caption: "Panoramic vistas bordering the untouched wilderness of Nairobi National Park",
      },
    ],
    duration: "Half-Day (3–4 Hours)",
    location: "KWS Headquarters, Lang'ata Road, Nairobi",
    idealFor: "Nature Enthusiasts, Environmental Delegates & Executive Groups",
    category: "Biodiversity & Conservation Education",
    highlights: [
      "Stroll along an elevated timber boardwalk elevated high above natural habitats",
      "Encounter rare and endangered species including the critically endangered mountain bongo",
      "See white rhinos, albino zebras, cheetahs, leopards, and a resident pride of lions",
      "Explore three distinct ecological zones in a single visit: Wetlands, Savannah, and Forest",
      "Learn about Kenya's 150+ indigenous tree species and their traditional medicinal uses",
      "Conveniently located directly at the gates of Nairobi National Park without requiring a 4x4 safari vehicle",
    ],
    paragraphs: [
      "Located at the main gate of the world-famous Nairobi National Park along Lang'ata Road, the Nairobi Safari Walk is Kenya's premier biodiversity showcase, managed by the Kenya Wildlife Service (KWS). Conceived as an immersive conservation education centre, it presents a living microcosm of Kenya's celebrated wildlife habitats in a tranquil, accessible, and impeccably maintained environment.",
      "The defining feature of the Safari Walk is its elevated timber boardwalk that gracefully snakes above the terrain. This innovative aerial walkway allows delegates to view animals living in near-natural habitats from safe, elevated vantage platforms while protecting the delicate undergrowth and indigenous flora below.",
      "The walk takes visitors through three distinct ecological zones that characterize East Africa: the Wetlands, the Savannah Grasslands, and the Moist Tropical Forest. Each zone features native vegetation, authentic watercourses, and corresponding wildlife species. In the Wetlands zone, delegates observe pygmy hippos and basking crocodiles from timber footbridges. Moving into the Savannah, open grasslands host plains game, white rhinos, and big cats. In the Moist Forest canopy, rare primates and forest antelope thrive.",
      "A rare conservation highlight is the presence of the critically endangered mountain bongo—one of the rarest forest antelopes on Earth, found naturally only in Kenya’s high-altitude montane forests. The facility also houses an albino zebra, cheetahs, and rescued raptors undergoing rehabilitation by KWS biologists.",
      "For participants attending ECAS Institute’s executive training courses, conferences, or workshops, the Nairobi Safari Walk provides the thrill and serenity of an authentic African safari in just a few relaxing hours. It is an inspiring way to decompress after intensive classroom sessions, soak in fresh pine and eucalyptus air, and foster meaningful cross-border professional relationships in nature.",
    ],
    included: [
      "Chauffeured executive transport to and from the KWS Lang'ata complex",
      "All KWS entry conservation fees and boardwalk permits",
      "Certified KWS naturalist guide providing in-depth ecological commentary",
      "Printed Kenyan Flora & Fauna field identification checklist",
      "Refreshment stop with cold drinks and Kenyan snacks",
    ],
    practicalTips: [
      "The elevated boardwalk is fully wheelchair-accessible and easy to navigate",
      "Binoculars are welcome for observing high-canopy forest birds and sleeping leopards",
      "A sunhat and sunglasses are recommended during sunny afternoon sessions",
    ],
  },
  {
    slug: "city-walk",
    title: "The City Walk: Urban Pulse & The Nairobi Expressway",
    shortTitle: "The City Walk",
    badge: "Urban Heritage & Infrastructure Marvel",
    subtitle:
      "Explore Nairobi Green City (NGC), the newly revitalized Uhuru Park, historic civic monuments, and the elevated Nairobi Expressway.",
    heroImage: "/images/beyond/nairobi_expressway.jpg",
    gallery: [
      {
        src: "/images/beyond/nairobi_expressway.jpg",
        caption: "The world-class 27km elevated Nairobi Expressway snaking above the skyline",
      },
      {
        src: "/images/beyond/nairobi_green_city.jpg",
        caption: "Parliament Buildings, City Square & the lush green expanses of Uhuru Park",
      },
      {
        src: "/images/beyond/city_walk.jpg",
        caption: "Vibrant urban streets, historical monuments, and civic architecture of Nairobi CBD",
      },
    ],
    duration: "2–3 Hours",
    location: "Central Business District & Nairobi Expressway Corridor",
    idealFor: "Public Sector, Governance & Infrastructure Delegates",
    category: "Architecture & Urban Development",
    highlights: [
      "Guided walking tour through Nairobi's historic civic quarter: Parliament, Supreme Court & City Hall",
      "Pay tribute at the Dedan Kimathi monument and explore post-colonial heritage landmarks",
      "Experience Nairobi Green City (NGC) urban renewal at the transformed Uhuru & Central Parks",
      "Architectural commentary on the visionary 27-kilometer elevated Nairobi Expressway",
      "Immerse yourself in Nairobi's vibrant street life, iconic matatu cultural art, and trading rhythm",
      "Executive coffee tasting at a historic central Nairobi coffeehouse",
    ],
    paragraphs: [
      "Known affectionately as 'The Green City in the Sun', Nairobi is East Africa’s economic powerhouse, diplomatic headquarters, and financial nerve centre. Our curated Nairobi City Walk invites international training delegates to step outside the classroom and experience the history, architecture, and breathtaking modern transformation of this vibrant African capital.",
      "The walking tour commences in the historic administrative heart of the capital. Delegates explore landmark civic monuments, including the stately Parliament of Kenya, the historic Supreme Court, Jamia Mosque, and the monument honoring celebrated freedom fighter Field Marshal Dedan Kimathi. Knowledgeable local guides share the political, social, and architectural milestones that turned an 1899 swampy railway depot into the proud capital of Kenya and the United Nations headquarters for the Global South.",
      "A standout highlight of the excursion is observing Nairobi's bold modern infrastructure—most visibly epitomized by the world-class elevated Nairobi Expressway. Slicing gracefully above the city's main arterial corridor from Jomo Kenyatta International Airport through the city center to Westlands, the expressway represents Kenya's Vision 2030 modernization drive and the future of smart urban mobility in Africa.",
      "The walk also showcases Nairobi's recent urban regeneration under the Nairobi Green City (NGC) initiative. Delegates stroll through the lushly landscaped Uhuru Park and Central Park, featuring state-of-the-art waterfront promenades, botanical gardens, and open-air recreational plazas that demonstrate sustainable urban forestry in the heart of a concrete metropolis.",
      "The City Walk is deliberately paced to allow easy conversation and camaraderie among delegates. It concludes at an iconic local coffee house, where participants savor fresh single-origin Kenyan coffee or spiced chai while discussing cross-border collaborations.",
    ],
    included: [
      "Guided historical and infrastructure walking tour with experienced city hosts",
      "VIP access and guided walk through the revitalized Uhuru Park & Central Park plazas",
      "Dedicated security and liaison officer accompanying the executive group",
      "Specialty coffee/tea tasting and pastry at an authentic Nairobi roastery",
      "Curated Nairobi Architectural & Historical Walking Map souvenir",
    ],
    practicalTips: [
      "Comfortable flat walking shoes and business casual attire are recommended",
      "Keep cameras and phones secured while walking through high-traffic intersections",
      "Mid-morning or late afternoon hours provide the most pleasant walking temperatures",
    ],
  },
  {
    slug: "nairobi-shopping",
    title: "A Taste of Nairobi Shopping & Cultural Markets",
    shortTitle: "Nairobi Shopping & Maasai Market",
    badge: "Artisanal Crafts, Textiles & Kenyan Coffee",
    subtitle:
      "Vibrant Maasai Market curio shopping, hand-woven sisal kiondos, African beaded jewelry, and world-class Kenyan AA coffee & purple tea.",
    heroImage: "/images/beyond/nairobi_shopping.png",
    gallery: [
      {
        src: "/images/beyond/nairobi_shopping.png",
        caption: "Colorful Maasai Market curio treasures, handmade jewelry, and African craftwork",
      },
      {
        src: "/images/beyond/city_walk.jpg",
        caption: "Premier artisan boutiques and cultural shopping collectives across Nairobi",
      },
      {
        src: "/images/beyond/above_the_city.jpg",
        caption: "Modern shopping destinations and craft markets in central Nairobi",
      },
    ],
    duration: "Half-Day (3–4 Hours)",
    location: "Maasai Market & Premier Nairobi Artisan Collectives",
    idealFor: "All Delegates Seeking Authentic Gifts, Souvenirs & Kenyan Coffee",
    category: "Culture, Crafts & Commerce",
    highlights: [
      "Immerse yourself in the world-famous open-air Maasai Market bustling with hundreds of artisans",
      "Shop authentic hand-woven sisal Kiondo baskets, beaded leather belts, and brass jewelry",
      "Browse hand-carved olive-wood bowls, soapstone animal sculptures, and Maasai Shuka blankets",
      "Purchase fresh single-origin Kenyan AA Arabica coffee beans and high-altitude purple tea",
      "Guided shopping etiquette and friendly bargaining tips provided by our local hosts",
      "Visit fair-trade women’s cooperatives supporting community livelihood initiatives",
    ],
    paragraphs: [
      "No international visit to Kenya is complete without experiencing the kaleidoscope of color, texture, and creativity that defines Nairobi’s artisan shopping scene. Designed especially for visiting training participants who wish to take home authentic treasures for family, colleagues, and friends, this excursion provides an insider's access to the finest Kenyan craftsmanship.",
      "The crown jewel of Nairobi's shopping journey is the open-air Maasai Market. Here, dozens of talented artisans and traders gather to display magnificent hand-crafted products: intricately woven beaded necklaces and bracelets, hand-carved olive-wood sculptures, soapstone animal figurines from Kisii, and the vibrant red, blue, and black checkered Maasai Shukas.",
      "Our excursion host guides delegates through the market etiquette, sharing insights into the symbolic meanings of different bead colors in Maasai culture and assisting delegates with friendly price negotiation so everyone secures quality souvenirs at fair prices.",
      "Beyond the bustling open-air market, the excursion stops at renowned specialty tea and coffee houses. Delegates can sample and purchase freshly roasted Kenyan AA Arabica coffee—globally celebrated for its bright acidity and complex blackcurrant notes—as well as Mount Kenya orthodox purple teas and single-estate dark chocolates.",
      "The excursion also highlights inspiring fair-trade women’s cooperatives and social enterprises, where purchases directly empower artisan families, promote sustainable livelihoods, and preserve centuries-old African craftsmanship.",
    ],
    included: [
      "Executive round-trip van transfers with generous cargo capacity for shopping bags",
      "Accompanied shopping assistance and friendly bargaining negotiation guidance",
      "Complimentary packaging service with bubble wrap for delicate wooden or stone carvings",
      "Tasting flight of single-origin Kenyan coffee and Mount Kenya tea",
      "Currency exchange advice and mobile money (M-Pesa) assistance if needed",
    ],
    practicalTips: [
      "Carry Kenyan Shillings (KES) in smaller denominations for easy market transactions",
      "Bargaining is expected at open-air markets—our guides will happily assist you in getting fair local prices",
      "Leave extra room in your luggage for unique handcrafted carvings, textiles, and coffee bags",
    ],
  },
];

const ExcursionDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Find selected excursion or default to giraffe-centre
  const currentExcursion =
    excursionsData.find((e) => e.slug === slug) || excursionsData[0];

  const [activeImage, setActiveImage] = useState(currentExcursion.gallery[0]?.src || currentExcursion.heroImage);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formDelegates, setFormDelegates] = useState("1-5");
  const [formCourse, setFormCourse] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Update active image when excursion changes
  useEffect(() => {
    setActiveImage(currentExcursion.gallery[0]?.src || currentExcursion.heroImage);
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = `${currentExcursion.title} | Beyond the Classroom | ECAS Institute`;
  }, [currentExcursion]);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Excursion Inquiry: ${currentExcursion.title} (${formOrg || "Corporate Group"})`
    );
    const body = encodeURIComponent(
      `Dear ECAS Institute Delegate Services,\n\n` +
        `I would like to inquire about arranging the "${currentExcursion.title}" excursion for our upcoming training cohort:\n\n` +
        `• Name: ${formName}\n` +
        `• Email: ${formEmail}\n` +
        `• Organization: ${formOrg}\n` +
        `• Number of Delegates: ${formDelegates}\n` +
        `• Training Course / Dates: ${formCourse || "2026 Executive Training Cohort"}\n` +
        `• Preferred Excursion: ${currentExcursion.title}\n` +
        `• Additional Requests:\n${formMessage || "None"}\n\n` +
        `Best regards,\n${formName}`
    );
    window.location.href = `mailto:info@ecasiafrica.org?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <>
      <Header />

      <main className="bg-[#f8fafc] min-h-screen">
        {/* ── Top Breadcrumbs & Sub-Nav Bar ── */}
        <section className="bg-[#032e42] text-white pt-28 pb-10 border-b border-white/10">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
            {/* Breadcrumb row */}
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70 mb-4 flex-wrap">
              <Link to="/" className="hover:text-[#4ade80] transition-colors">
                Home
              </Link>
              <ChevronRight size={13} />
              <Link to="/#beyond-the-classroom" className="hover:text-[#4ade80] transition-colors">
                Beyond the Classroom
              </Link>
              <ChevronRight size={13} />
              <span className="text-[#4ade80]">{currentExcursion.shortTitle}</span>
            </div>

            {/* Title & Badge */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-widest uppercase text-[#4ade80] bg-[#4ade80]/15 px-3 py-1 rounded-full mb-3 border border-[#4ade80]/30">
                  <Sparkles size={13} />
                  {currentExcursion.badge}
                </span>
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white leading-tight mb-3"
                  style={{ fontFamily: "'Fira Sans', sans-serif" }}
                >
                  {currentExcursion.title}
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                  {currentExcursion.subtitle}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 shrink-0">
                <a
                  href="#inquiry-form"
                  className="inline-flex items-center gap-2 bg-[#008000] hover:bg-[#1e73be] text-white font-bold text-sm px-6 py-3 rounded-lg shadow-md transition-all"
                >
                  <Mail size={16} />
                  <span>Book for Your Cohort</span>
                </a>
                <Link
                  to="/institute-overview"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-lg border border-white/20 transition-all"
                >
                  <span>View Courses</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            {/* Quick Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#4ade80] shrink-0" />
                <div>
                  <div className="text-white/60 text-[11px] font-semibold uppercase">Duration</div>
                  <div className="text-white font-bold">{currentExcursion.duration}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-[#4ade80] shrink-0" />
                <div>
                  <div className="text-white/60 text-[11px] font-semibold uppercase">Location</div>
                  <div className="text-white font-bold truncate">{currentExcursion.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-[#4ade80] shrink-0" />
                <div>
                  <div className="text-white/60 text-[11px] font-semibold uppercase">Cohort Format</div>
                  <div className="text-white font-bold">Group / Private</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-[#4ade80] shrink-0" />
                <div>
                  <div className="text-white/60 text-[11px] font-semibold uppercase">Logistics</div>
                  <div className="text-white font-bold">Fully Escorted</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Excursion Switcher Tabs ── */}
        <section className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                Excursions:
              </span>
              {excursionsData.map((item) => {
                const isSelected = item.slug === currentExcursion.slug;
                return (
                  <button
                    key={item.slug}
                    onClick={() => navigate(`/beyond-the-classroom/${item.slug}`)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#032e42] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{item.shortTitle}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#008000]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Main Content Grid ── */}
        <section className="py-10 sm:py-14 px-4 sm:px-6">
          <div className="max-w-[1380px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Left Column (8 cols): Photo Showcase & Full Story */}
              <div className="lg:col-span-8 space-y-8">
                {/* Image Gallery Showcase */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/80 p-3 sm:p-4">
                  {/* Big Active Image */}
                  <div className="relative h-72 sm:h-96 md:h-[430px] rounded-xl overflow-hidden bg-slate-900 group">
                    <img
                      src={activeImage}
                      alt={currentExcursion.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="inline-block bg-[#008000] text-[11px] font-extrabold uppercase px-2.5 py-1 rounded shadow-sm mb-1.5">
                        {currentExcursion.category}
                      </span>
                      <p className="text-sm sm:text-base font-semibold drop-shadow-md">
                        {currentExcursion.gallery.find((g) => g.src === activeImage)?.caption ||
                          currentExcursion.title}
                      </p>
                    </div>
                  </div>

                  {/* Thumbnails Row */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-3">
                    {currentExcursion.gallery.map((img, gIdx) => (
                      <button
                        key={gIdx}
                        type="button"
                        onClick={() => setActiveImage(img.src)}
                        className={`relative h-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImage === img.src
                            ? "border-[#008000] ring-2 ring-[#008000]/30 shadow-sm"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.src}
                          alt={img.caption}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Narrative Article Content */}
                <div className="bg-white rounded-2xl p-6 sm:p-9 shadow-md border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <Compass size={20} className="text-[#008000]" />
                    <h2
                      className="text-xl sm:text-2xl font-bold text-[#032e42]"
                      style={{ fontFamily: "'Fira Sans', sans-serif" }}
                    >
                      About the Experience
                    </h2>
                  </div>

                  {/* Lead paragraph */}
                  <div className="prose prose-slate max-w-none space-y-5 text-slate-700 leading-relaxed text-[15.5px] sm:text-[16.5px]">
                    {currentExcursion.paragraphs.map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className={
                          pIdx === 0
                            ? "text-[17px] sm:text-[18px] font-medium text-[#032e42] leading-relaxed border-l-4 border-[#008000] pl-4 italic bg-[#008000]/5 py-2.5 rounded-r"
                            : ""
                        }
                        style={{ textAlign: "justify" }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-lg font-bold text-[#032e42] mb-4 flex items-center gap-2">
                      <Sparkles size={18} className="text-[#008000]" />
                      Key Highlights &amp; Delegate Activities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {currentExcursion.highlights.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70"
                        >
                          <CheckCircle2 size={16} className="text-[#008000] shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                            {h}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What is Included Box */}
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-lg font-bold text-[#032e42] mb-4 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#008000]" />
                      What is Included in Your Excursion Package
                    </h3>
                    <ul className="space-y-2.5">
                      {currentExcursion.included.map((inc, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-[#008000]/10 text-[#008000] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            ✓
                          </span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Tips */}
                  <div className="mt-8 p-5 bg-amber-50/70 rounded-xl border border-amber-200/80">
                    <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                      <Info size={16} className="text-amber-700" />
                      Helpful Delegate Tips
                    </h4>
                    <ul className="space-y-1.5 pl-6 list-disc text-xs sm:text-sm text-amber-950">
                      {currentExcursion.practicalTips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Why We Include Beyond the Classroom Banner */}
                <div className="bg-gradient-to-r from-[#032e42] to-[#054b6d] text-white rounded-2xl p-6 sm:p-8 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#008000] flex items-center justify-center shrink-0 text-white shadow-md">
                      <Heart size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2">
                        The ECAS Institute Learning Philosophy: Beyond the Classroom
                      </h3>
                      <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                        At ECAS Institute, we believe transformative professional development occurs both inside the boardroom and through cultural immersion. Our &ldquo;Beyond the Classroom&rdquo; excursion series gives regional and international delegates an enriching local perspective on Kenya’s conservation triumphs, modern economic infrastructure, and vibrant heritage—forging lifelong connections among peer executives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Sticky Booking & Inquiry Form + Other Excursions */}
              <div className="lg:col-span-4 space-y-6">
                {/* Cohort Excursion Inquiry Card */}
                <div
                  id="inquiry-form"
                  className="bg-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-200/80 sticky top-16"
                >
                  <div className="flex items-center gap-2 text-[#008000] font-bold text-xs uppercase tracking-wider mb-2">
                    <Sparkles size={14} />
                    <span>Executive Cohort Services</span>
                  </div>
                  <h3
                    className="text-xl font-bold text-[#032e42] mb-2 leading-snug"
                    style={{ fontFamily: "'Fira Sans', sans-serif" }}
                  >
                    Inquire / Add to Cohort
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                    Planning to attend an upcoming 2026 executive training course or bringing an institutional delegation? Book this excursion as part of your training itinerary.
                  </p>

                  {submitted ? (
                    <div className="bg-[#008000]/10 border border-[#008000]/30 rounded-xl p-5 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#008000] text-white flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="font-bold text-[#032e42] text-sm mb-1">Inquiry Prepared!</h4>
                      <p className="text-xs text-slate-600 mb-3">
                        Your email client has opened with your excursion inquiry pre-filled. If it didn&apos;t open automatically, email us directly at:
                      </p>
                      <a
                        href="mailto:info@ecasiafrica.org"
                        className="text-xs font-bold text-[#008000] hover:underline"
                      >
                        info@ecasiafrica.org
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Dr. Jane Okello"
                          className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#008000] bg-slate-50/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Official Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="e.g. j.okello@ministry.gov"
                          className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#008000] bg-slate-50/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Organization / Ministry
                        </label>
                        <input
                          type="text"
                          value={formOrg}
                          onChange={(e) => setFormOrg(e.target.value)}
                          placeholder="e.g. Ministry of Environment / Authority"
                          className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#008000] bg-slate-50/60"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Delegates
                          </label>
                          <select
                            value={formDelegates}
                            onChange={(e) => setFormDelegates(e.target.value)}
                            className="w-full h-10 px-2.5 text-xs rounded-lg border border-slate-300 bg-slate-50/60 focus:outline-none focus:border-[#008000]"
                          >
                            <option value="1">1 Delegate</option>
                            <option value="2-5">2–5 Delegates</option>
                            <option value="6-10">6–10 Delegates</option>
                            <option value="10+">10+ Delegation</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Intake Timing
                          </label>
                          <select
                            value={formCourse}
                            onChange={(e) => setFormCourse(e.target.value)}
                            className="w-full h-10 px-2.5 text-xs rounded-lg border border-slate-300 bg-slate-50/60 focus:outline-none focus:border-[#008000]"
                          >
                            <option value="May 2026 Cohort">May 2026</option>
                            <option value="June 2026 Cohort">June 2026</option>
                            <option value="July 2026 Cohort">July 2026</option>
                            <option value="Aug 2026 Cohort">August 2026</option>
                            <option value="Custom Dates">Custom Dates</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Specific Requirements / Notes
                        </label>
                        <textarea
                          rows={3}
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="Any specific schedule preferences or special arrangements..."
                          className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#008000] bg-slate-50/60"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 bg-[#008000] hover:bg-[#1e73be] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-colors shadow flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send size={15} />
                        <span>Send Excursion Request</span>
                      </button>
                    </form>
                  )}

                  {/* Direct Contact Links */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-[#008000]" />
                      <a href="mailto:info@ecasiafrica.org" className="hover:underline">
                        info@ecasiafrica.org
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#008000]" />
                      <span>+254 722 000 000 / Admissions Desk</span>
                    </div>
                  </div>
                </div>

                {/* Explore Other Excursions Navigation Card */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80">
                  <h3
                    className="text-base font-bold text-[#032e42] mb-3 pb-2 border-b border-slate-100"
                    style={{ fontFamily: "'Fira Sans', sans-serif" }}
                  >
                    Other Nairobi Excursions
                  </h3>
                  <div className="space-y-3">
                    {excursionsData
                      .filter((e) => e.slug !== currentExcursion.slug)
                      .map((other) => (
                        <Link
                          key={other.slug}
                          to={`/beyond-the-classroom/${other.slug}`}
                          className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                            <img
                              src={other.heroImage}
                              alt={other.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#032e42] group-hover:text-[#008000] transition-colors truncate">
                              {other.shortTitle}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {other.duration} · {other.category}
                            </p>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-slate-400 group-hover:text-[#008000] group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                        </Link>
                      ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Link
                      to="/institute-overview"
                      className="block text-center py-2.5 px-4 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold transition-colors"
                    >
                      Browse Executive Training Catalog →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── All 5 Excursions Showcase Grid (Bottom Carousel / Overview) ── */}
        <section className="py-14 px-4 sm:px-6 bg-white border-t border-slate-200">
          <div className="max-w-[1380px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#008000] bg-[#008000]/10 px-3 py-1 rounded-full mb-2 inline-block">
                Complete Excursion Portfolio
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#032e42] mb-3"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Explore All Beyond the Classroom Experiences
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Every executive training course cohort in Nairobi includes curated opportunities to discover Kenya’s wildlife, architectural marvels, and cultural heritage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {excursionsData.map((excursion) => {
                const isCurrent = excursion.slug === currentExcursion.slug;
                return (
                  <div
                    key={excursion.slug}
                    className={`bg-white rounded-xl overflow-hidden border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                      isCurrent
                        ? "border-[#008000] shadow-md ring-2 ring-[#008000]/20"
                        : "border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={excursion.heroImage}
                          alt={excursion.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-[#032e42]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {excursion.category}
                        </span>
                        {isCurrent && (
                          <span className="absolute bottom-2.5 right-2.5 bg-[#008000] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                            Currently Viewing
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3
                          className="font-bold text-[#032e42] text-[15px] leading-snug mb-1.5 line-clamp-2"
                          style={{ fontFamily: "'Fira Sans', sans-serif" }}
                        >
                          <Link
                            to={`/beyond-the-classroom/${excursion.slug}`}
                            className="hover:text-[#008000] transition-colors"
                          >
                            {excursion.shortTitle}
                          </Link>
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-3">
                          {excursion.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link
                        to={`/beyond-the-classroom/${excursion.slug}`}
                        className={`block text-center text-xs font-bold py-2 px-3 rounded transition-colors ${
                          isCurrent
                            ? "bg-[#008000] text-white"
                            : "bg-[#032e42] hover:bg-[#008000] text-white"
                        }`}
                      >
                        {isCurrent ? "Viewing Page" : "View Excursion Page →"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ExcursionDetail;
