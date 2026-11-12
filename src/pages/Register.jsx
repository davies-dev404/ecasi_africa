import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, CheckCircle2, Check, Printer, Mail } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { dataService } from "@/lib/dataService";
import countryListData from "@/data/countriesData.json";
import CountrySelector from "@/components/CountrySelector";
import { adminRegistrationService } from "@/services/adminRegistrationService";

const COUNTRY_DIAL_CODES = countryListData;

const INITIAL_FORM_STATE = {
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  jobTitle: "",
  organisation: "",
  country: "Kenya",
  dialCode: "+254",
  phoneNumber: "",
  personalEmail: "",
  officialEmail: "",
  currentDuties: "",
  trainingExpectations: "",
  tailorMadeRequirements: "",
  hearAboutUs: "",
  invoiceTo: "Self",
  approvingAuthorityName: "",
  approvingAuthorityEmail: "",
  participantsCount: 1,
  needAccommodation: "No",
  needAirportTransfer: "No",
  needSafariTour: "No",
};

function formatDurationRange(datesParam) {
  if (!datesParam) {
    return "From: November 23, 2026 To: December 4, 2026";
  }
  // Convert e.g. "11 - 15 May 2026" into "From: May 11, 2026 To: May 15, 2026"
  const match = datesParam.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const [, startDay, endDay, monthShort, year] = match;
    const monthNames = {
      Jan: "January",
      Feb: "February",
      Mar: "March",
      Apr: "April",
      May: "May",
      Jun: "June",
      Jul: "July",
      Aug: "August",
      Sep: "September",
      Oct: "October",
      Nov: "November",
      Dec: "December",
    };
    const fullMonth = monthNames[monthShort.slice(0, 3)] || monthShort;
    return `From: ${fullMonth} ${startDay}, ${year} To: ${fullMonth} ${endDay}, ${year}`;
  }
  if (datesParam.toLowerCase().startsWith("from:")) {
    return datesParam;
  }
  return `From: ${datesParam}`;
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const scheduleId = searchParams.get("schedule") || "400827";
  const courseSlug = searchParams.get("course") || "";
  const titleParam = searchParams.get("title") || "";
  const datesParam = searchParams.get("dates") || "";
  const venueParam = searchParams.get("venue") || "Nairobi, Kenya";
  const formatParam = searchParams.get("format") || "Classroom";
  const feeParam = searchParams.get("fee") || "1000";

  // Look up course details if slug is provided
  const courseObj = useMemo(() => {
    if (!courseSlug) return null;
    if (typeof dataService.getCourseBySlug === "function") {
      return dataService.getCourseBySlug(courseSlug);
    }
    const all = dataService.getCourses();
    return all && all[courseSlug] ? { slug: courseSlug, ...all[courseSlug] } : null;
  }, [courseSlug]);

  const eventTitle =
    titleParam ||
    courseObj?.title ||
    "Executive Training Programme";

  const baseFeeNumber = useMemo(() => {
    const cleaned = String(feeParam).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return !isNaN(parsed) && parsed > 0 ? parsed : 1000;
  }, [feeParam]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [notARobot, setNotARobot] = useState(false);
  const [robotLoading, setRobotLoading] = useState(false);
  const [robotError, setRobotError] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const recaptchaRef = React.useRef(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LcJIBEuAAAAAFVVFtrAoFN88Hzbpi0ADHuZ9YNw';

  // Check if running on localhost development environment
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".localhost"));

  // Auto-render Google reCAPTCHA v2 if in production and global script is loaded
  useEffect(() => {
    if (isLocalhost || !siteKey) return;
    let timerId = null;
    let attempts = 0;

    const tryRender = () => {
      if (window.grecaptcha && recaptchaRef.current) {
        try {
          window.grecaptcha.ready(() => {
            if (recaptchaRef.current && !recaptchaRef.current.hasChildNodes()) {
              window.grecaptcha.render(recaptchaRef.current, {
                sitekey: siteKey,
                callback: () => {
                  setNotARobot(true);
                  setRobotError(false);
                },
                'expired-callback': () => {
                  setNotARobot(false);
                },
              });
            }
          });
          if (timerId) clearInterval(timerId);
        } catch (err) {
          console.warn('reCAPTCHA init error:', err);
        }
      } else {
        attempts++;
        if (attempts > 30 && timerId) clearInterval(timerId);
      }
    };

    tryRender();
    timerId = setInterval(tryRender, 400);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [siteKey, isLocalhost]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      const found = COUNTRY_DIAL_CODES.find((c) => c.country === value);
      setFormData((prev) => ({
        ...prev,
        country: value,
        dialCode: found ? found.code : prev.dialCode,
      }));
    } else if (name === "participantsCount") {
      const num = Math.max(1, parseInt(value || "1", 10));
      setFormData((prev) => ({ ...prev, participantsCount: num }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setNotARobot(false);
    setRobotError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notARobot) {
      setRobotError(true);
      return;
    }
    setRobotError(false);
    const generatedRef = `ECAS-${scheduleId}-${Math.floor(1000 + Math.random() * 9000)}`;
    const submissionRecord = {
      ...formData,
      referenceNo: generatedRef,
      eventTitle,
      courseSlug,
      scheduleId,
      venue: venueParam,
      format: formatParam,
      durationText: formatDurationRange(datesParam),
      totalFee: baseFeeNumber * (Number(formData.participantsCount) || 1),
      submittedAt: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: "Pending",
      paymentStatus: "Unpaid",
    };

    // Save to Msimamizi Admin Portal persistent repository
    adminRegistrationService.addRegistration(submissionRecord);

    setSubmittedData(submissionRecord);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedCountryObj = useMemo(() => {
    return (
      COUNTRY_DIAL_CODES.find((c) => c.country === formData.country) ||
      COUNTRY_DIAL_CODES.find((c) => c.code === formData.dialCode) ||
      COUNTRY_DIAL_CODES[0]
    );
  }, [formData.country, formData.dialCode]);

  const selectedCountryFlagUrl = selectedCountryObj?.flagUrl || "https://flagcdn.com/w40/ke.png";

  const totalTrainingFee = baseFeeNumber * (Number(formData.participantsCount) || 1);
  const durationLine = formatDurationRange(datesParam);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1a202c]">
      <SEO
        title={`Registration - ${eventTitle} | ECAS Institute`}
        description={`Online registration form for ${eventTitle} (Schedule #${scheduleId}) at ECAS Institute.`}
      />
      <Header />

      {/* Top Breadcrumb Strip in ECAS Brand Colors */}
      <div className="bg-[#032e42] text-white text-xs sm:text-[13px] py-2.5 border-b border-white/15">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-2">
          <Link to="/" className="text-white/85 hover:text-[#4ade80] transition-colors">
            Home
          </Link>
          <span className="text-[#4ade80] font-bold">»</span>
          <Link
            to="/institute-overview"
            className="text-white/85 hover:text-[#4ade80] transition-colors"
          >
            Executive Training
          </Link>
          {courseSlug && (
            <>
              <span className="text-[#4ade80] font-bold">»</span>
              <Link
                to={`/executive-training/${courseSlug}`}
                className="text-white/85 hover:text-[#4ade80] transition-colors line-clamp-1 max-w-[320px]"
              >
                {eventTitle}
              </Link>
            </>
          )}
          <span className="text-[#4ade80] font-bold">»</span>
          <span className="text-[#4ade80] font-semibold">
            Registration (Schedule #{scheduleId})
          </span>
        </div>
      </div>

      <main className="flex-1 py-10 md:py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-[760px] mx-auto">
          {submittedData ? (
            /* ── Registration Confirmation View ── */
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-3 text-[#008000] mb-4">
                <CheckCircle2 className="w-8 h-8 shrink-0" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#008000]">
                    Registration Confirmed • Ref: {submittedData.referenceNo}
                  </span>
                  <h1 className="text-2xl font-bold text-[#032e42]">
                    Thank You for Registering!
                  </h1>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                We have received your registration for{" "}
                <strong className="text-[#032e42]">{submittedData.eventTitle}</strong>. Our
                Training Admissions Coordinator will send the official invitation letter and
                proforma invoice to{" "}
                <strong className="text-[#032e42]">{submittedData.personalEmail}</strong>
                {submittedData.officialEmail ? ` and ${submittedData.officialEmail}` : ""}.
              </p>

              <div className="bg-[#f8fafc] border border-gray-200 rounded-lg p-5 mb-6 space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Participant Name:</span>
                  <span className="font-bold text-[#032e42]">
                    {submittedData.title} {submittedData.firstName}{" "}
                    {submittedData.middleName} {submittedData.lastName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Organisation:</span>
                  <span className="font-semibold text-[#032e42]">
                    {submittedData.organisation} ({submittedData.country})
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Course / Event:</span>
                  <span className="font-bold text-[#008000] text-right max-w-[60%]">
                    {submittedData.eventTitle}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Duration:</span>
                  <span className="font-semibold text-[#032e42]">
                    {submittedData.durationText}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Venue &amp; Mode:</span>
                  <span className="font-semibold text-[#032e42]">
                    {submittedData.venue} ({submittedData.format})
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Invoice To:</span>
                  <span className="font-semibold text-[#032e42]">
                    {submittedData.invoiceTo} ({submittedData.participantsCount}{" "}
                    {submittedData.participantsCount > 1 ? "Participants" : "Participant"})
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-800 font-bold">Total Training Fee (USD):</span>
                  <span className="font-extrabold text-lg text-[#008000]">
                    ${submittedData.totalFee.toLocaleString()} (Offline Payment)
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/254728925306?text=${encodeURIComponent(
                      `Hello ECAS Institute, I have submitted course registration ref ${submittedData.referenceNo} for "${submittedData.eventTitle}". Participant: ${submittedData.title} ${submittedData.firstName} ${submittedData.lastName} (${submittedData.organisation}, ${submittedData.country}). Official Email: ${submittedData.personalEmail}. Please confirm our admission and send invoice.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.42-.101.825zM12.004 2C6.48 2 2 6.48 2 12.008c0 1.947.562 3.766 1.533 5.309L2 22.5l5.347-1.401A9.957 9.957 0 0012.004 22c5.523 0 10.004-4.48 10.004-9.992C22.008 6.48 11.527 2 12.004 2z"/>
                    </svg>
                    Send to WhatsApp
                  </a>

                  <a
                    href={`mailto:info@ecasiafrica.org?subject=${encodeURIComponent(
                      `New Course Registration Ref: ${submittedData.referenceNo} - ${submittedData.eventTitle}`
                    )}&body=${encodeURIComponent(
                      `Registration Reference: ${submittedData.referenceNo}\nCourse: ${submittedData.eventTitle}\nParticipant: ${submittedData.title} ${submittedData.firstName} ${submittedData.middleName || ''} ${submittedData.lastName}\nJob Title: ${submittedData.jobTitle || 'N/A'}\nOrganisation: ${submittedData.organisation} (${submittedData.country})\nPhone: ${submittedData.phone}\nPersonal Email: ${submittedData.personalEmail}\nOfficial Email: ${submittedData.officialEmail || 'N/A'}\nInvoice To: ${submittedData.invoiceTo}\nNumber of Participants: ${submittedData.participantsCount}\nTotal Fee: ${submittedData.totalFee}\nAccommodation: ${submittedData.accommodation}\nAirport Transfer: ${submittedData.airportTransfer}\nSafari Tour: ${submittedData.safariTour}\n\nPlease issue proforma invoice and letter of invitation.`
                    )}`}
                    className="inline-flex items-center gap-1.5 bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <Mail className="w-4 h-4 text-white" />
                    Send via Email
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 bg-[#032e42] hover:bg-[#1e73be] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Summary
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedData(null);
                      handleReset();
                    }}
                    className="inline-flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Register Another Participant
                  </button>
                </div>

                <div className="pt-2 text-right">
                  <Link
                    to={courseSlug ? `/executive-training/${courseSlug}` : "/institute-overview"}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e73be] hover:text-[#008000]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Course Page
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ── Exact Registration Form Layout Matching Screenshot 1 ── */
            <div>
              {/* Top Heading & Event Subtext */}
              <h1
                className="text-[22px] sm:text-[26px] font-bold text-[#032e42] mb-1"
                style={{ fontFamily: "'Fira Sans', sans-serif" }}
              >
                Registration
              </h1>
              <p className="text-[13.5px] sm:text-[14px] text-[#334155] mb-6 leading-relaxed">
                Please enter information in the form below to process registration for event{" "}
                <strong className="font-bold text-[#032e42]">{eventTitle}</strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Title * */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Title <span className="text-[#d83030]">*</span>
                  </label>
                  <select
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
                  >
                    <option value="">Select a Title</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Eng.">Eng.</option>
                    <option value="CPA">CPA</option>
                    <option value="Hon.">Hon.</option>
                  </select>
                </div>

                {/* 2. First Name * */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    First Name <span className="text-[#d83030]">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 3. Middle Name */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    placeholder="Middle Name"
                    value={formData.middleName}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 4. Last Name * */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Last Name <span className="text-[#d83030]">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 5. Job Title */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="Job Title"
                    value={formData.jobTitle}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 6. Organisation * */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Organisation <span className="text-[#d83030]">*</span>
                  </label>
                  <input
                    type="text"
                    name="organisation"
                    required
                    placeholder="Organisation"
                    value={formData.organisation}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 7. Country * (Graphical SVG/PNG Flags, No Windows KE regional indicators) */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Country <span className="text-[#d83030]">*</span>
                  </label>
                  <CountrySelector
                    value={formData.country}
                    onChange={(selected) => {
                      setFormData((prev) => ({
                        ...prev,
                        country: selected.country,
                        dialCode: selected.code || prev.dialCode,
                      }));
                    }}
                  />
                </div>

                {/* 8. Phone Number * (Flag Image + Dial Code Dropdown + Input) */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Phone Number <span className="text-[#d83030]">*</span>
                  </label>
                  <div className="flex items-stretch">
                    <div className="relative flex items-center bg-[#efefef] border border-r-0 border-[#e2e8f0] rounded-l-[4px] px-2.5 shrink-0 gap-1.5">
                      <img
                        src={selectedCountryFlagUrl}
                        alt=""
                        aria-hidden="true"
                        className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm shrink-0 border border-black/10"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <select
                        name="dialCode"
                        value={formData.dialCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = COUNTRY_DIAL_CODES.find((c) => c.code === val);
                          setFormData((prev) => ({
                            ...prev,
                            dialCode: val,
                            country: found ? found.country : prev.country,
                          }));
                        }}
                        aria-label="Country Dial Code"
                        className="bg-transparent text-[13px] font-medium text-[#1e293b] focus:outline-none cursor-pointer pr-1"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={`${c.country}-${c.code}`} value={c.code}>
                            {c.country} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleFieldChange}
                      className="flex-1 h-[38px] px-3 rounded-r-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 9. Personal Email * */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Personal Email <span className="text-[#d83030]">*</span>
                  </label>
                  <input
                    type="email"
                    name="personalEmail"
                    required
                    placeholder="Personal Email"
                    value={formData.personalEmail}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 10. Official Email */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Official Email
                  </label>
                  <input
                    type="email"
                    name="officialEmail"
                    placeholder="Official Email"
                    value={formData.officialEmail}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 11. Current Duties */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Current Duties
                  </label>
                  <textarea
                    name="currentDuties"
                    rows={3}
                    placeholder="Current Duties"
                    value={formData.currentDuties}
                    onChange={handleFieldChange}
                    className="w-full p-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 12. Training Expectations */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Training Expectations
                  </label>
                  <textarea
                    name="trainingExpectations"
                    rows={3}
                    placeholder="Training Expectations"
                    value={formData.trainingExpectations}
                    onChange={handleFieldChange}
                    className="w-full p-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 13. Tailor-made Requirements */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Tailor-made Requirements
                  </label>
                  <textarea
                    name="tailorMadeRequirements"
                    rows={3}
                    placeholder="Tailor-Made Requirements"
                    value={formData.tailorMadeRequirements}
                    onChange={handleFieldChange}
                    className="w-full p-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 14. How did you first hear about ECAS Institute? */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    How did you first hear about ECAS Institute?
                  </label>
                  <select
                    name="hearAboutUs"
                    value={formData.hearAboutUs}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
                  >
                    <option value="">Select an option</option>
                    <option value="Search Engine (Google, Bing)">Search Engine (Google, Bing)</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook / X / Instagram">Facebook / X / Instagram</option>
                    <option value="Colleague / Referral">Colleague / Referral</option>
                    <option value="Email Newsletter">Email Newsletter</option>
                    <option value="Previous ECAS Institute Training">Previous ECAS Institute Training</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* 15. Invoice to? * */}
                <div className="pt-1">
                  <label className="block text-[13px] font-medium text-[#334155] mb-2">
                    Invoice to? <span className="text-[#d83030]">*</span>
                  </label>
                  <div className="space-y-1.5 pl-1">
                    <label className="flex items-center gap-2 text-[13px] text-[#334155] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.invoiceTo === "Self"}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, invoiceTo: "Self" }))
                        }
                        className="w-3.5 h-3.5 accent-[#008000] rounded-sm cursor-pointer"
                      />
                      <span>Self</span>
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[#334155] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.invoiceTo === "Organisation"}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, invoiceTo: "Organisation" }))
                        }
                        className="w-3.5 h-3.5 accent-[#008000] rounded-sm cursor-pointer"
                      />
                      <span>Organisation</span>
                    </label>
                  </div>
                </div>

                {/* 16. Name of Approving Authority */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Name of Approving Authority
                  </label>
                  <input
                    type="text"
                    name="approvingAuthorityName"
                    placeholder="Name Of Approving Authority"
                    value={formData.approvingAuthorityName}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 17. Email of Approving Authority */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Email of Approving Authority
                  </label>
                  <input
                    type="email"
                    name="approvingAuthorityEmail"
                    placeholder="Email Of Approving Authority"
                    value={formData.approvingAuthorityEmail}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 18. Number of Participants */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    name="participantsCount"
                    min={1}
                    max={100}
                    value={formData.participantsCount}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
                  />
                </div>

                {/* 19. Would you like accommodation arrangement? */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Would you like accommodation arrangement?
                  </label>
                  <select
                    name="needAccommodation"
                    value={formData.needAccommodation}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
                  >
                    <option value="No">No</option>
                    <option value="Yes - 4 Star Hotel">Yes - 4 Star Hotel (Nairobi / Mombasa / Kigali / Dubai / Kuala Lumpur)</option>
                    <option value="Yes - 5 Star Hotel">Yes - 5 Star Luxury Hotel</option>
                    <option value="Yes - Standard Executive Guest House">Yes - Standard Executive Guest House</option>
                  </select>
                </div>

                {/* 20. Would you like airport transfer arrangements? */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Would you like airport transfer arrangements?
                  </label>
                  <select
                    name="needAirportTransfer"
                    value={formData.needAirportTransfer}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
                  >
                    <option value="No">No</option>
                    <option value="Yes - Round Trip (Airport Pickup & Drop-off)">Yes - Round Trip (Airport Pickup & Drop-off)</option>
                    <option value="Yes - Airport Pickup Only">Yes - Airport Pickup Only</option>
                    <option value="Yes - Airport Drop-off Only">Yes - Airport Drop-off Only</option>
                  </select>
                </div>

                {/* 21. Would you like a safari tour arrangement? */}
                <div>
                  <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                    Would you like a safari tour arrangement?
                  </label>
                  <select
                    name="needSafariTour"
                    value={formData.needSafariTour}
                    onChange={handleFieldChange}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
                  >
                    <option value="No">No</option>
                    <option value="Yes - Nairobi National Park Half-Day Game Drive">Yes - Nairobi National Park Half-Day Game Drive</option>
                    <option value="Yes - Giraffe Centre & Daphne Sheldrick Elephant Orphanage">Yes - Giraffe Centre & Elephant Orphanage</option>
                    <option value="Yes - Lake Naivasha & Hell&apos;s Gate Weekend Excursion">Yes - Lake Naivasha &amp; Hell&apos;s Gate Excursion</option>
                    <option value="Yes - Maasai Mara 3-Day Executive Safari Tour">Yes - Maasai Mara 3-Day Executive Safari Tour</option>
                  </select>
                </div>

                {/* Divider before Summary */}
                <hr className="border-t border-gray-300 my-6" />

                {/* Summary Section (Exact match to Screenshot 1) */}
                <div className="space-y-3">
                  <h2
                    className="text-[16px] font-bold text-[#032e42]"
                    style={{ fontFamily: "'Fira Sans', sans-serif" }}
                  >
                    Summary
                  </h2>

                  <div>
                    <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
                      Training fee
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={totalTrainingFee}
                      className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#475569] cursor-default focus:outline-none"
                    />
                  </div>

                  <div className="text-[13px] text-[#334155] pt-1">
                    Payment Method: Offline Payment
                  </div>

                  <div className="text-[13px] text-[#334155]">
                    Duration: {durationLine}
                  </div>
                </div>

                {/* Divider after Summary */}
                <hr className="border-t border-gray-300 my-6" />

                {/* reCAPTCHA Box + 3 Action Buttons (Back | Complete Registration | Reset) */}
                <div className="space-y-3 pt-1">
                  {/* reCAPTCHA Widget Box (Supports live Google reCAPTCHA v2 in production, or 1-click interactive confirmation on localhost) */}
                  {!isLocalhost && siteKey ? (
                    <div ref={recaptchaRef} className="min-h-[78px]" />
                  ) : (
                    <div className="space-y-2">
                      <div
                        onClick={() => {
                          if (robotLoading) return;
                          setRobotLoading(true);
                          setRobotError(false);
                          setTimeout(() => {
                            setRobotLoading(false);
                            setNotARobot((prev) => !prev);
                          }, 250);
                        }}
                        role="checkbox"
                        aria-checked={notARobot}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            setNotARobot((prev) => !prev);
                            setRobotError(false);
                          }
                        }}
                        className={`w-[302px] h-[74px] bg-[#f9f9f9] hover:bg-[#f5f5f5] border ${
                          robotError ? "border-[#d83030]" : notARobot ? "border-[#008000]" : "border-[#d3d3d3]"
                        } rounded-[3px] px-3.5 flex items-center justify-between shadow-sm cursor-pointer select-none transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-[2px] border-2 flex items-center justify-center transition-all ${
                              notARobot
                                ? "border-[#008000] bg-[#008000] text-white"
                                : robotLoading
                                ? "border-blue-500 bg-white"
                                : "border-[#c1c1c1] bg-white hover:border-[#999]"
                            }`}
                          >
                            {robotLoading ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : notARobot ? (
                              <Check className="w-5 h-5 stroke-[3]" />
                            ) : null}
                          </div>
                          <span className="text-[14px] font-medium text-[#282828]">
                            {notARobot ? "Verification Complete" : "I'm not a robot"}
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center leading-tight pl-2">
                          <svg
                            viewBox="0 0 64 64"
                            className="w-7 h-7 mb-0.5"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M32 10C21.5 10 12.7 17.3 10.5 27.1L17.3 28.9C18.9 22.1 24.9 17 32 17C36.8 17 41.1 19.2 43.9 22.7L38 28.6H54V12.6L48.9 17.7C44.8 12.9 38.7 10 32 10Z"
                              fill="#1e73be"
                            />
                            <path
                              d="M53.5 36.9L46.7 35.1C45.1 41.9 39.1 47 32 47C27.2 47 22.9 44.8 20.1 41.3L26 35.4H10V51.4L15.1 46.3C19.2 51.1 25.3 54 32 54C42.5 54 51.3 46.7 53.5 36.9Z"
                              fill="#008000"
                            />
                          </svg>
                          <span className="text-[9px] text-[#555555] font-semibold">
                            reCAPTCHA
                          </span>
                          <div className="flex gap-1 text-[7.5px] text-[#777777]">
                            <span>Privacy</span>
                            <span>•</span>
                            <span>Terms</span>
                          </div>
                        </div>
                      </div>

                      {isLocalhost && (
                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setNotARobot(true);
                              setRobotError(false);
                            }}
                            className="px-2.5 py-1 rounded bg-[#008000] hover:bg-[#006600] text-white font-bold text-[11px] shadow-sm transition cursor-pointer"
                          >
                            ✓ Click to Confirm Not a Robot (Localhost)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {robotError && (
                    <p className="text-xs text-[#d83030] font-medium">
                      Please confirm that you are not a robot before completing registration.
                    </p>
                  )}

                  {/* 3 Buttons Row: Back | Complete Registration | Reset */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (courseSlug) {
                          navigate(`/executive-training/${courseSlug}`);
                        } else {
                          navigate(-1);
                        }
                      }}
                      className="inline-flex items-center gap-1 bg-[#1e73be] hover:bg-[#032e42] text-white text-[12px] font-semibold px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center bg-[#008000] hover:bg-[#006600] text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-[3px] transition-colors cursor-pointer"
                    >
                      Complete Registration
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 bg-[#1e73be] hover:bg-[#032e42] text-white text-[12px] font-semibold px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Divider */}
                <hr className="border-t border-gray-300 mt-8" />
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

