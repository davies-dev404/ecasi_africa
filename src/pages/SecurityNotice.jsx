import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Mail,
  Globe,
  Phone,
  FileCheck2,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSyncUrl } from '@/services/adminRegistrationService';

export default function SecurityNotice() {
  const [form, setForm] = useState({
    reporterEmail: '',
    suspiciousSender: '',
    subject: '',
    details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(getSyncUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report_phishing',
          ...form,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setResult(json.reportId || 'SEC-REPORTED');
        setForm({ reporterEmail: '', suspiciousSender: '', subject: '', details: '' });
      } else {
        setError(json?.error || 'Could not submit report online. Please forward the suspicious email directly to info@ecasiafrica.org.');
      }
    } catch {
      setError('Network unavailable. Please forward the suspicious email directly to info@ecasiafrica.org or call +254 708 060 223.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fc] text-[#10243E]">
      <SEO
        title="Official Security, Anti-Phishing & Invoice Verification Notice | ECAS Institute"
        description="Verify official ECAS Africa domains, email channels, course invoices, and report suspected phishing or impersonation."
      />
      <Header />

      <section className="bg-gradient-to-br from-[#071C2D] via-[#0d2e4a] to-[#032e42] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#4ade80]">
            <ShieldCheck className="w-4 h-4" />
            Official ECAS Africa Security &amp; Verification Desk
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Security Notice, Anti-Phishing &amp; Invoice Verification
          </h1>
          <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto">
            Protect yourself and your institution from impersonation, fake training invitations, and fraudulent payment requests.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Official Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00B8B0] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-black text-[#10243E]">Official Website Domains</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              ECAS Institute operates exclusively over HTTPS on:
            </p>
            <ul className="text-xs font-mono space-y-1 text-[#032e42] font-bold">
              <li>• https://ecasiafrica.org</li>
              <li>• https://msimamizi.ecasiafrica.org</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-black text-[#10243E]">Official Communication Channels</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official admissions, invitations, and invoices come strictly from <strong className="font-mono">@ecasiafrica.org</strong> addresses (e.g., <span className="font-mono">info@ecasiafrica.org</span>, <span className="font-mono">admissions@ecasiafrica.org</span>, <span className="font-mono">finance@ecasiafrica.org</span>).
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-[#008000]" />
              <strong>Official Desk / WhatsApp:</strong> +254 708 060 223
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F0A020] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-black text-[#10243E]">How to Verify an Invoice</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every genuine ECAS proforma invoice bears an official <strong className="font-mono">ECAS-INV-XXXXX</strong> reference linked to your registration number (<strong className="font-mono">ECAS-XXXXXX</strong>). Always confirm bank or M-Pesa payment details via <span className="font-mono">finance@ecasiafrica.org</span> or <span className="font-mono">+254 708 060 223</span> before wiring funds.
            </p>
          </div>
        </div>

        {/* How to Recognize Phishing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-[#10243E] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F0A020]" />
            How to Recognize Suspicious Emails &amp; Impersonation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-slate-200/70">
              <strong className="text-[#10243E] block mb-1">1. Check the Sender Domain Carefully</strong>
              ECAS never sends official proforma invoices or admission letters from free Gmail/Yahoo/Hotmail accounts or misspelled domains (e.g., <span className="font-mono">ecasi-africa.com</span>).
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-slate-200/70">
              <strong className="text-[#10243E] block mb-1">2. Never Share Passwords or OTPs</strong>
              ECAS staff will never ask for your email password, banking PIN, or one-time security codes by phone, WhatsApp, or ordinary email.
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-slate-200/70">
              <strong className="text-[#10243E] block mb-1">3. Verify Changed Bank Details</strong>
              Treat any urgent email claiming ECAS has &ldquo;updated bank account details&rdquo; as suspicious until confirmed directly by phone on +254 708 060 223.
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-slate-200/70">
              <strong className="text-[#10243E] block mb-1">4. Data Protection &amp; Privacy</strong>
              All registration records and applicant documents are processed securely in compliance with the Kenya Data Protection Act (2019) and international privacy standards.
            </div>
          </div>
        </div>

        {/* Report Suspected Phishing Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#071C2D] text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00B8B0]" /> Report Suspected Phishing or Fake Invoice
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Reports are logged directly into the ECAS Security Notification Centre for immediate investigation.
              </p>
            </div>
          </div>
          <div className="p-6">
            {result ? (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                <p className="font-black flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#16A36A]" />
                  Security Report Logged ({result})
                </p>
                <p>
                  Thank you for helping protect the ECAS Africa community. Our Security &amp; Verification team has received your report and will investigate promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#071C2D] text-white font-bold cursor-pointer"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.reporterEmail}
                    onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
                    placeholder="you@organization.org"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#10243E] mb-1">Suspicious Sender Email / Phone / URL *</label>
                  <input
                    type="text"
                    required
                    value={form.suspiciousSender}
                    onChange={(e) => setForm({ ...form, suspiciousSender: e.target.value })}
                    placeholder="e.g. fake-invoice@example.com"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#10243E] mb-1">Email Subject or Invoice Reference</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Urgent Training Invoice Payment Request"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#10243E] mb-1">Incident Details *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    placeholder="Describe the suspicious message, requested payment details, or impersonated course..."
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                {error && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
                    {error}
                  </div>
                )}
                <div className="sm:col-span-2 flex items-center justify-between pt-2">
                  <Link to="/institute-overview" className="text-[#1e73be] font-bold hover:underline">
                    ← Return to Executive Courses
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Submitting...' : 'Submit Security Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
