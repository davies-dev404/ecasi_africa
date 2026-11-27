import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Search, ShieldCheck, CheckCircle2, Mail } from "lucide-react";
import countryListData from "@/data/countriesData.json";
import CountrySelector from "@/components/CountrySelector";
import TurnstileWidget from "@/components/TurnstileWidget";
import { verifyTurnstile } from "@/services/turnstileService";
import { getSyncUrl } from "@/services/adminRegistrationService";

const COUNTRY_DIAL_CODES = countryListData;

const INITIAL_COURSE_REGISTRATION_STATE = {
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  jobTitle: "",
  organisation: "",
  organisationWebsite: "",
  organisationRegNo: "",
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

const DEFAULT_COHORT_PRESETS = [
  "16 - 27 March 2026",
  "13 - 24 April 2026",
  "18 - 29 May 2026",
  "15 - 26 June 2026",
  "13 - 24 July 2026",
  "17 - 28 August 2026",
  "14 - 25 September 2026",
  "19 - 30 October 2026",
  "16 - 27 November 2026",
  "7 - 18 December 2026",
];

function formatRegistrationDurationRange(datesParam) {
  if (!datesParam) {
    return "From: November 23, 2026 To: December 4, 2026";
  }
  const match = String(datesParam)
    .trim()
    .match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
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
  if (String(datesParam).toLowerCase().startsWith("from:")) {
    return datesParam;
  }
  return `From: ${datesParam}`;
}

function parseFeeNumber(raw, fallback = 1000) {
  const cleaned = String(raw ?? "").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Shared ECAS Institute 21-field Course Registration Form.
 * Used identically on the public Course Registration page (/register) and Msimamizi New Manual Registration page.
 */
export default function CourseRegistrationForm({
  mode = "public", // 'public' | 'admin'
  initialCourseTitle = "",
  initialCourseSlug = "",
  initialScheduleId = "400827",
  initialDates = "",
  initialVenue = "Nairobi, Kenya",
  initialFormat = "Classroom",
  initialFee = 1000,
  courses = [],
  cohortPresets = DEFAULT_COHORT_PRESETS,
  onSubmitRegistration,
  onBack,
  backLabel = "Back",
  submitLabel = "Complete Registration",
}) {
  const isAdmin = mode === "admin";
  const defaultFirstCourse = isAdmin && courses.length > 0 ? courses[0] : null;

  const [formData, setFormData] = useState(INITIAL_COURSE_REGISTRATION_STATE);
  const [courseFilter, setCourseFilter] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(
    initialCourseSlug || defaultFirstCourse?.slug || ""
  );
  const [eventTitle, setEventTitle] = useState(
    initialCourseTitle ||
      defaultFirstCourse?.title ||
      "Executive Training Programme"
  );
  const [scheduleId, setScheduleId] = useState(initialScheduleId || "400827");
  const [datesText, setDatesText] = useState(
    initialDates ||
      (defaultFirstCourse?.dates?.[0] || cohortPresets[0] || "16 - 27 March 2026")
  );
  const [venue, setVenue] = useState(initialVenue || "Nairobi, Kenya");
  const [format, setFormat] = useState(initialFormat || "Classroom");
  const [unitFee, setUnitFee] = useState(() =>
    parseFeeNumber(
      initialFee ??
        defaultFirstCourse?.discountPrice ??
        defaultFirstCourse?.fee ??
        (isAdmin ? 1200 : 1000),
      isAdmin ? 1200 : 1000
    )
  );
  const [adminStatus, setAdminStatus] = useState("Pending");
  const [adminPaymentStatus, setAdminPaymentStatus] = useState("Unpaid");
  const [adminNotes, setAdminNotes] = useState(
    "Manually entered by administrator."
  );

  const [notARobot, setNotARobot] = useState(false);
  const [robotLoading, setRobotLoading] = useState(false);
  const [robotError, setRobotError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const formOpenedAtRef = useRef(Date.now());
  const [otpState, setOtpState] = useState({
    sent: false,
    sending: false,
    verifying: false,
    verified: false,
    code: "",
    token: "",
    feedback: "",
  });

  const handleSendEmailOtp = async () => {
    const targetEmail = (formData.officialEmail || formData.personalEmail || "").trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setOtpState((s) => ({ ...s, feedback: "Please enter a valid email address before requesting a verification code." }));
      return;
    }
    setOtpState((s) => ({ ...s, sending: true, feedback: "" }));
    try {
      const res = await fetch(getSyncUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_reg_otp", email: targetEmail }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setOtpState((s) => ({ ...s, sending: false, sent: true, feedback: json.message || "Verification code sent to your email." }));
      } else {
        setOtpState((s) => ({ ...s, sending: false, feedback: json?.error || "Could not send code right now. You may still complete registration." }));
      }
    } catch {
      setOtpState((s) => ({ ...s, sending: false, feedback: "Email OTP service offline in local mode. You may still submit registration." }));
    }
  };

  const handleVerifyEmailOtp = async () => {
    const targetEmail = (formData.officialEmail || formData.personalEmail || "").trim();
    if (!otpState.code.trim()) return;
    setOtpState((s) => ({ ...s, verifying: true, feedback: "" }));
    try {
      const res = await fetch(getSyncUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_reg_otp", email: targetEmail, code: otpState.code.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.verified) {
        setOtpState((s) => ({
          ...s,
          verifying: false,
          verified: true,
          token: json.emailVerifyToken || "",
          feedback: "Email address verified successfully!",
        }));
      } else {
        setOtpState((s) => ({ ...s, verifying: false, feedback: json?.error || "Invalid verification code." }));
      }
    } catch {
      setOtpState((s) => ({ ...s, verifying: false, feedback: "Verification check unavailable right now." }));
    }
  };

  const filteredCourseOptions = useMemo(() => {
    const q = courseFilter.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q)
    );
  }, [courses, courseFilter]);

  const selectedCourseObj = useMemo(() => {
    if (!selectedSlug) return null;
    return courses.find((c) => c.slug === selectedSlug) || null;
  }, [courses, selectedSlug]);

  const availableCohortOptions = useMemo(() => {
    const fromCourse = Array.isArray(selectedCourseObj?.dates)
      ? selectedCourseObj.dates
      : [];
    const merged = [...fromCourse, ...cohortPresets];
    return Array.from(new Set(merged.filter(Boolean)));
  }, [selectedCourseObj, cohortPresets]);

  const selectedCountryObj = useMemo(() => {
    return (
      COUNTRY_DIAL_CODES.find((c) => c.country === formData.country) ||
      COUNTRY_DIAL_CODES.find((c) => c.code === formData.dialCode) ||
      COUNTRY_DIAL_CODES[0]
    );
  }, [formData.country, formData.dialCode]);

  const selectedCountryFlagUrl =
    selectedCountryObj?.flagUrl || "https://flagcdn.com/w40/ke.png";

  const baseFeeNumber = useMemo(
    () =>
      isAdmin
        ? Math.max(0, Number(unitFee) || 0)
        : parseFeeNumber(initialFee, 1000),
    [isAdmin, unitFee, initialFee]
  );

  const totalTrainingFee =
    baseFeeNumber * (Number(formData.participantsCount) || 1);
  const durationLine = formatRegistrationDurationRange(
    isAdmin ? datesText : initialDates
  );

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

  const handleCourseSelectChange = (slugValue) => {
    setSelectedSlug(slugValue);
    if (slugValue === "__custom__") return;
    const found = courses.find((c) => c.slug === slugValue);
    if (found) {
      setEventTitle(found.title || "Executive Training Programme");
      const feeVal = parseFeeNumber(
        found.discountPrice && Number(found.discountPrice) > 0
          ? found.discountPrice
          : found.fee,
        1200
      );
      setUnitFee(feeVal);
      if (Array.isArray(found.dates) && found.dates.length > 0) {
        setDatesText(found.dates[0]);
      }
      if (found.scheduleId) {
        setScheduleId(String(found.scheduleId));
      }
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_COURSE_REGISTRATION_STATE);
    setNotARobot(false);
    setRobotError(false);
    setTurnstileToken("");
    setTurnstileResetKey((k) => k + 1);
    if (isAdmin) {
      setCourseFilter("");
      setAdminStatus("Pending");
      setAdminPaymentStatus("Unpaid");
      setAdminNotes("Manually entered by administrator.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const domToken =
      e.currentTarget?.querySelector?.('input[name="cf-turnstile-response"]')
        ?.value || "";
    const effectiveToken = turnstileToken || domToken;
    if (!notARobot && !effectiveToken) {
      setRobotError(true);
      return;
    }
    setRobotError(false);

    let turnstileStatus = "unverified";
    if (effectiveToken) {
      setRobotLoading(true);
      try {
        const verification = await verifyTurnstile(effectiveToken, "register");
        if (verification && verification.success === false) {
          turnstileStatus = "failed";
          setRobotError(true);
          setRobotLoading(false);
          return;
        }
        turnstileStatus = "verified";
      } catch (err) {
        console.warn("[Turnstile Registration Check]:", err);
      }
      setRobotLoading(false);
    }

    const activeSlug =
      isAdmin && selectedSlug !== "__custom__"
        ? selectedSlug
        : isAdmin
          ? ""
          : initialCourseSlug;
    const activeEventTitle = isAdmin
      ? eventTitle.trim() || "Executive Training Programme"
      : initialCourseTitle || "Executive Training Programme";
    const activeScheduleId = isAdmin
      ? scheduleId || "400827"
      : initialScheduleId || "400827";
    const generatedRef = `ECAS-${activeScheduleId}-${Math.floor(1000 + Math.random() * 9000)}`;

    const submissionRecord = {
      ...formData,
      referenceNo: generatedRef,
      eventTitle: activeEventTitle,
      courseSlug: activeSlug,
      scheduleId: activeScheduleId,
      venue: isAdmin ? venue : initialVenue,
      format: isAdmin ? format : initialFormat,
      durationText: durationLine,
      totalFee: totalTrainingFee,
      submittedAt: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      status: isAdmin ? adminStatus : "Pending",
      paymentStatus: isAdmin ? adminPaymentStatus : "Unpaid",
      adminNotes: isAdmin
        ? adminNotes.trim() || "Manually entered by administrator."
        : "Submitted via public online registration portal.",
    };

    const securityMeta = {
      honeypot,
      dwellMs: Math.max(0, Date.now() - formOpenedAtRef.current),
      turnstileStatus,
      emailVerifyToken: otpState.token || "",
      emailOtpVerified: otpState.verified,
    };

    onSubmitRegistration?.(submissionRecord, securityMeta);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Admin Mode Only: Programme, Cohort Schedule, Venue & Fee Selection */}
      {isAdmin && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 mb-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <h2
              className="text-[14px] font-bold text-[#032e42]"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
            >
              Course &amp; Cohort Selection
            </h2>
            <span className="text-[11px] font-semibold text-[#008000]">
              {courses.length} Catalog Courses Linked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[13px] font-medium text-[#334155]">
                Select Executive Course <span className="text-[#d83030]">*</span>
              </label>
              <div className="relative mb-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  placeholder="Filter courses by title or category..."
                  className="w-full h-[34px] pl-8 pr-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[12.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
                />
              </div>
              <select
                value={selectedSlug}
                onChange={(e) => handleCourseSelectChange(e.target.value)}
                required={selectedSlug !== "__custom__"}
                className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              >
                {filteredCourseOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title} (${parseFeeNumber(c.discountPrice || c.fee, 1200)})
                  </option>
                ))}
                <option value="__custom__">-- Enter Custom Course Title --</option>
              </select>
              {selectedSlug === "__custom__" && (
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter custom course title"
                  className="mt-1.5 w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
                />
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1">
                Cohort Schedule / Dates
              </label>
              <select
                value={availableCohortOptions.includes(datesText) ? datesText : "__custom_date__"}
                onChange={(e) => {
                  if (e.target.value !== "__custom_date__") {
                    setDatesText(e.target.value);
                  }
                }}
                className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              >
                {availableCohortOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="__custom_date__">Custom Dates...</option>
              </select>
              <input
                type="text"
                value={datesText}
                onChange={(e) => setDatesText(e.target.value)}
                placeholder="e.g. 16 - 27 March 2026"
                className="mt-1.5 w-full h-[34px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[12.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1">
                Training Venue
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              >
                <option value="Nairobi, Kenya">Nairobi, Kenya</option>
                <option value="Mombasa, Kenya">Mombasa, Kenya</option>
                <option value="Diani, Kenya">Diani, Kenya</option>
                <option value="Zanzibar, Tanzania">Zanzibar, Tanzania</option>
                <option value="Kigali, Rwanda">Kigali, Rwanda</option>
                <option value="Dubai, UAE">Dubai, UAE</option>
                <option value="Kuala Lumpur, Malaysia">Kuala Lumpur, Malaysia</option>
                <option value="Online / Virtual">Online / Virtual</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1">
                Delivery Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              >
                <option value="Classroom">Classroom</option>
                <option value="Online / Live Virtual">Online / Live Virtual</option>
                <option value="Hybrid">Hybrid</option>
                <option value="In-House">In-House</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1">
                Unit Fee per Delegate (USD)
              </label>
              <input
                type="number"
                min={0}
                value={unitFee}
                onChange={(e) => setUnitFee(Math.max(0, Number(e.target.value) || 0))}
                className="w-full h-[38px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13.5px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              />
            </div>
          </div>
        </div>
      )}

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

      {/* 6b. Optional Organization Verification Details (Helps speed up institutional admissions verification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
            Organisation Website <span className="text-slate-400 text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            name="organisationWebsite"
            placeholder="e.g. https://yourorganization.org"
            value={formData.organisationWebsite}
            onChange={handleFieldChange}
            className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#334155] mb-1.5">
            Business / Institutional Reg. No. <span className="text-slate-400 text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            name="organisationRegNo"
            placeholder="e.g. NGO / Ministry / Company Reg No."
            value={formData.organisationRegNo}
            onChange={handleFieldChange}
            className="w-full h-[38px] px-3 rounded-[4px] border border-transparent bg-[#f5f6f8] text-[13.5px] text-[#1e293b] placeholder-[#64748b] focus:bg-white focus:border-[#008000] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Invisible Anti-Bot Honeypot Field (Do not fill — hidden from humans) */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="ecas_website_fax_hp">Leave blank</label>
        <input
          id="ecas_website_fax_hp"
          type="text"
          name="faxNumber"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* 7. Country * */}
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

      {/* 8. Phone Number * */}
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
                e.currentTarget.style.display = "none";
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
          <option value="Search Engine (Google, Bing)">
            Search Engine (Google, Bing)
          </option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Facebook / X / Instagram">
            Facebook / X / Instagram
          </option>
          <option value="Colleague / Referral">Colleague / Referral</option>
          <option value="Email Newsletter">Email Newsletter</option>
          <option value="Previous ECAS Institute Training">
            Previous ECAS Institute Training
          </option>
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
          <option value="Yes - 4 Star Hotel">
            Yes - 4 Star Hotel (Nairobi / Mombasa / Diani / Zanzibar / Kigali / Dubai / Kuala Lumpur)
          </option>
          <option value="Yes - 5 Star Hotel">Yes - 5 Star Luxury Hotel</option>
          <option value="Yes - Standard Executive Guest House">
            Yes - Standard Executive Guest House
          </option>
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
          <option value="Yes - Round Trip (Airport Pickup & Drop-off)">
            Yes - Round Trip (Airport Pickup &amp; Drop-off)
          </option>
          <option value="Yes - Airport Pickup Only">
            Yes - Airport Pickup Only
          </option>
          <option value="Yes - Airport Drop-off Only">
            Yes - Airport Drop-off Only
          </option>
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
          <option value="Yes - Nairobi National Park Half-Day Game Drive">
            Yes - Nairobi National Park Half-Day Game Drive
          </option>
          <option value="Yes - Giraffe Centre & Daphne Sheldrick Elephant Orphanage">
            Yes - Giraffe Centre &amp; Elephant Orphanage
          </option>
          <option value="Yes - Lake Naivasha & Hell's Gate Weekend Excursion">
            Yes - Lake Naivasha &amp; Hell&apos;s Gate Excursion
          </option>
          <option value="Yes - Maasai Mara 3-Day Executive Safari Tour">
            Yes - Maasai Mara 3-Day Executive Safari Tour
          </option>
        </select>
      </div>

      {/* Divider before Summary */}
      <hr className="border-t border-gray-300 my-6" />

      {/* Summary Section */}
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

        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Initial Admission Status
              </label>
              <select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
                className="w-full h-[36px] px-2.5 rounded-[4px] border border-[#cbd5e1] bg-white text-[13px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Payment Status
              </label>
              <select
                value={adminPaymentStatus}
                onChange={(e) => setAdminPaymentStatus(e.target.value)}
                className="w-full h-[36px] px-2.5 rounded-[4px] border border-[#cbd5e1] bg-white text-[13px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Invoiced">Invoiced</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Internal Admin Notes
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Manually entered following LPO or telephone booking..."
                className="w-full h-[36px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[13px] text-[#1e293b] focus:outline-none focus:border-[#008000]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Optional Fast-Track Email Verification OTP + Anti-Phishing Notice (Public Mode Only) */}
      {!isAdmin && (
        <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-[#032e42]">
              <Mail className="w-4 h-4 text-[#008000]" />
              <span>Email Verification (Recommended for Faster Clearance)</span>
            </div>
            {otpState.verified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#008000] font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
              </span>
            ) : (
              <button
                type="button"
                disabled={otpState.sending}
                onClick={handleSendEmailOtp}
                className="px-3 py-1.5 rounded-md bg-[#032e42] hover:bg-[#008000] text-white font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
              >
                {otpState.sending ? "Sending..." : otpState.sent ? "Resend 6-Digit Code" : "Send Verification Code"}
              </button>
            )}
          </div>
          {otpState.sent && !otpState.verified && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpState.code}
                onChange={(e) => setOtpState((s) => ({ ...s, code: e.target.value }))}
                placeholder="Enter 6-digit code"
                className="h-9 px-3 rounded border border-slate-300 bg-white text-xs font-mono w-44"
              />
              <button
                type="button"
                disabled={otpState.verifying}
                onClick={handleVerifyEmailOtp}
                className="h-9 px-3.5 rounded bg-[#008000] hover:bg-[#006600] text-white font-bold text-xs cursor-pointer"
              >
                {otpState.verifying ? "Checking..." : "Verify Email"}
              </button>
            </div>
          )}
          {otpState.feedback && (
            <p className={`text-[11px] font-medium ${otpState.verified ? "text-[#008000]" : "text-slate-600"}`}>
              {otpState.feedback}
            </p>
          )}
          <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#008000] shrink-0 mt-0.5" />
            <p>
              <strong>Official ECAS Security &amp; Privacy Notice:</strong> All registrations undergo automated verification. Official invoices are issued solely from <strong className="font-mono">@ecasiafrica.org</strong>.{' '}
              <Link to="/security-notice" className="text-[#1e73be] font-semibold hover:underline">
                Verify invoices or report phishing →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Divider after Summary */}
      <hr className="border-t border-gray-300 my-6" />

      {/* Cloudflare Turnstile Verification + Action Buttons (Back | Complete Registration | Reset) */}
      <div className="space-y-3 pt-1">
        <div className="space-y-2">
          <TurnstileWidget
            key={turnstileResetKey}
            action="register"
            onVerify={(token) => {
              setTurnstileToken(token);
              setNotARobot(true);
              setRobotError(false);
            }}
            onExpire={() => {
              setTurnstileToken("");
              setNotARobot(false);
            }}
            onError={(_errCode, fallbackToken) => {
              setTurnstileToken(
                fallbackToken || `dev-turnstile-fallback-${Date.now()}`
              );
              setNotARobot(true);
              setRobotError(false);
            }}
          />
        </div>

        {robotError && (
          <p className="text-xs text-[#d83030] font-medium">
            Please confirm that you are not a robot before completing registration.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 bg-[#1e73be] hover:bg-[#032e42] text-white text-[12px] font-semibold px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </button>

          <button
            type="submit"
            disabled={robotLoading}
            className="inline-flex items-center justify-center bg-[#008000] hover:bg-[#006600] disabled:opacity-60 text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-[3px] transition-colors cursor-pointer"
          >
            {robotLoading ? "Verifying..." : submitLabel}
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

      {!isAdmin && <hr className="border-t border-gray-300 mt-8" />}
    </form>
  );
}
