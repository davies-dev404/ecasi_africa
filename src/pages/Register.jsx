import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Printer, Mail } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { dataService } from "@/lib/dataService";
import { adminRegistrationService } from "@/services/adminRegistrationService";
import { printRegistrationVoucher } from "@/utils/printRegistrationVoucher";
import CourseRegistrationForm from "@/components/CourseRegistrationForm";

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

  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmitRegistration = async (submissionRecord, securityMeta = {}) => {
    const saved = await adminRegistrationService.addRegistration(submissionRecord, securityMeta);
    setSubmittedData(saved || submissionRecord);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1a202c]">
      <SEO
        title={`Registration - ${eventTitle} | ECAS Institute`}
        description={`Online registration form for ${eventTitle} (Schedule #${scheduleId}) at ECAS Institute.`}
      />
      <div className="print:hidden">
        <Header />
      </div>

      {/* Top Breadcrumb Strip in ECAS Brand Colors */}
      <div className="bg-[#032e42] text-white text-xs sm:text-[13px] py-2.5 border-b border-white/15 print:hidden">
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

              <div className="space-y-3 print:hidden">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/254708060223?text=${encodeURIComponent(
                      `Hello ECAS Institute, I have submitted course registration ref ${submittedData.referenceNo} for "${submittedData.eventTitle}". Participant: ${submittedData.title} ${submittedData.firstName} ${submittedData.lastName} (${submittedData.organisation}, ${submittedData.country}). Official Email: ${submittedData.personalEmail}. Please confirm our admission and send invoice.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      adminRegistrationService.addInquiry({
                        channel: "WhatsApp",
                        inquiryType: "Registration Follow-Up (WhatsApp)",
                        referenceNo: `${submittedData.referenceNo}-WA`,
                        fullName: `${submittedData.title || ""} ${submittedData.firstName || ""} ${submittedData.lastName || ""}`.trim(),
                        email: submittedData.officialEmail || submittedData.personalEmail || "",
                        phone: `${submittedData.dialCode || ""} ${submittedData.phoneNumber || ""}`.trim(),
                        organisation: submittedData.organisation || "",
                        country: submittedData.country || "Kenya",
                        courseTitle: submittedData.eventTitle || "",
                        courseCode: submittedData.scheduleId || "",
                        cohortDates: submittedData.durationText || "",
                        venue: `${submittedData.venue || ""} (${submittedData.format || ""})`,
                        fee: `$${(submittedData.totalFee || 1200).toLocaleString()} USD`,
                        message: `Registered delegate clicked "Send to WhatsApp" for Registration Ref ${submittedData.referenceNo} (${submittedData.participantsCount || 1} participant(s)).`,
                      });
                    }}
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.42-.101.825zM12.004 2C6.48 2 2 6.48 2 12.008c0 1.947.562 3.766 1.533 5.309L2 22.5l5.347-1.401A9.957 9.957 0 0012.004 22c5.523 0 10.004-4.48 10.004-9.992C22.008 6.48 11.527 2 12.004 2z" />
                    </svg>
                    Send to WhatsApp
                  </a>

                  <a
                    href={`mailto:info@ecasiafrica.org?subject=${encodeURIComponent(
                      `New Course Registration Ref: ${submittedData.referenceNo} - ${submittedData.eventTitle}`
                    )}&body=${encodeURIComponent(
                      `Registration Reference: ${submittedData.referenceNo}\nCourse: ${submittedData.eventTitle}\nParticipant: ${submittedData.title} ${submittedData.firstName} ${submittedData.middleName || ''} ${submittedData.lastName}\nJob Title: ${submittedData.jobTitle || 'N/A'}\nOrganisation: ${submittedData.organisation} (${submittedData.country})\nPhone: ${submittedData.dialCode || ''} ${submittedData.phoneNumber || ''}\nPersonal Email: ${submittedData.personalEmail}\nOfficial Email: ${submittedData.officialEmail || 'N/A'}\nInvoice To: ${submittedData.invoiceTo}\nNumber of Participants: ${submittedData.participantsCount}\nTotal Fee: $${submittedData.totalFee}\nAccommodation: ${submittedData.needAccommodation || 'No'}\nAirport Transfer: ${submittedData.needAirportTransfer || 'No'}\nSafari Tour: ${submittedData.needSafariTour || 'No'}\n\nPlease issue proforma invoice and letter of invitation.`
                    )}`}
                    onClick={() => {
                      adminRegistrationService.addInquiry({
                        channel: "Email",
                        inquiryType: "Registration Follow-Up (Email)",
                        referenceNo: `${submittedData.referenceNo}-EM`,
                        fullName: `${submittedData.title || ""} ${submittedData.firstName || ""} ${submittedData.lastName || ""}`.trim(),
                        email: submittedData.officialEmail || submittedData.personalEmail || "",
                        phone: `${submittedData.dialCode || ""} ${submittedData.phoneNumber || ""}`.trim(),
                        organisation: submittedData.organisation || "",
                        country: submittedData.country || "Kenya",
                        courseTitle: submittedData.eventTitle || "",
                        courseCode: submittedData.scheduleId || "",
                        cohortDates: submittedData.durationText || "",
                        venue: `${submittedData.venue || ""} (${submittedData.format || ""})`,
                        fee: `$${(submittedData.totalFee || 1200).toLocaleString()} USD`,
                        message: `Registered delegate clicked "Send via Email" for Registration Ref ${submittedData.referenceNo} (${submittedData.participantsCount || 1} participant(s)).`,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <Mail className="w-4 h-4 text-white" />
                    Send via Email
                  </a>

                  <button
                    type="button"
                    onClick={() => printRegistrationVoucher(submittedData)}
                    className="inline-flex items-center gap-1.5 bg-[#032e42] hover:bg-[#1e73be] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Registration Voucher
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
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

              <CourseRegistrationForm
                mode="public"
                initialCourseTitle={eventTitle}
                initialCourseSlug={courseSlug}
                initialScheduleId={scheduleId}
                initialDates={datesParam}
                initialVenue={venueParam}
                initialFormat={formatParam}
                initialFee={feeParam}
                onSubmitRegistration={handleSubmitRegistration}
                onBack={() => {
                  if (courseSlug) {
                    navigate(`/executive-training/${courseSlug}`);
                  } else {
                    navigate(-1);
                  }
                }}
                backLabel="Back"
                submitLabel="Complete Registration"
              />
            </div>
          )}
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
