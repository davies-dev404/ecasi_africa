import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  downloadInvoicePdf,
  downloadPaymentReceiptPdf,
  downloadInstitutionalTablePdf,
} from '@/utils/documentPdf';
import { msimamiziEnterpriseService } from '@/services/msimamiziEnterpriseService';

function normalizeWhatsAppPhone(raw) {
  const digits = String(raw || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

export default function DocumentViewerPage({
  docSpec,
  onClose,
  registrations = [],
  invoices = [],
  settings,
  currentUser,
  onDataChange,
  showToast,
}) {
  const effectiveSettings = settings || msimamiziEnterpriseService.getSettings();
  const mode = docSpec?.mode || 'report';
  const invoice =
    docSpec?.invoice ||
    (docSpec?.payment?.invoiceId
      ? invoices.find((i) => i.id === docSpec.payment.invoiceId)
      : null);
  const payment = docSpec?.payment || null;
  const linkedRegId = invoice?.registrationId || payment?.registrationId || docSpec?.registrationId;
  const registration =
    docSpec?.registration ||
    (linkedRegId ? registrations.find((r) => r.id === linkedRegId) : null);

  const defaultClientPhone = registration
    ? `${registration.dialCode || ''}${registration.phoneNumber || ''}`.trim()
    : '';
  const [waOpen, setWaOpen] = useState(Boolean(docSpec?.initialWaOpen));
  const [waPhoneInput, setWaPhoneInput] = useState(defaultClientPhone || '');
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const clientName =
    invoice?.applicantName ||
    payment?.applicantName ||
    (registration ? [registration.firstName, registration.middleName, registration.lastName].filter(Boolean).join(' ') : 'Valued Client');
  const clientEmail =
    invoice?.applicantEmail ||
    registration?.officialEmail ||
    registration?.personalEmail ||
    '';

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (mode === 'invoice') {
        await downloadInvoicePdf({ invoice, registration, settings: effectiveSettings });
        showToast?.(`Downloaded official invoice ECAS_Invoice_${invoice.invoiceNo}.pdf`);
      } else if (mode === 'receipt') {
        await downloadPaymentReceiptPdf({ payment, invoice, registration, settings: effectiveSettings });
        showToast?.(`Downloaded official payment receipt for ${payment.reference}.pdf`);
      } else {
        await downloadInstitutionalTablePdf({
          title: docSpec?.title || 'ECAS Institutional Report',
          headers: docSpec?.headers || [],
          rows: docSpec?.rows || [],
          kpis: docSpec?.kpis || [],
          settings: effectiveSettings,
        });
        showToast?.('Downloaded official ECAS report PDF.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const dispatchEmailTo = async (recipient) => {
    if (!recipient || !recipient.includes('@')) {
      showToast?.('Please provide a valid email address.');
      return;
    }
    setIsSendingEmail(true);
    try {
      if (mode === 'invoice' && invoice) {
        await msimamiziEnterpriseService.sendCommunication(
          {
            channel: 'Email',
            category: 'Invoice',
            recipientName: clientName,
            recipientContact: recipient,
            subject: `ECAS Institute — Official Proforma Invoice ${invoice.invoiceNo}`,
            body: `Dear ${clientName},\n\nPlease find your official training invoice from ECAS Institute:\n\nInvoice No: ${invoice.invoiceNo}\nProgramme: ${invoice.courseTitle}\nDestination: ${invoice.destination || 'Nairobi, Kenya'}\nNet Payable: ${invoice.currency} ${Number(invoice.netAmount || 0).toLocaleString()}\nAmount Paid: ${invoice.currency} ${Number(invoice.paidAmount || 0).toLocaleString()}\nBalance Due: ${invoice.currency} ${Number(invoice.balance || 0).toLocaleString()}\nDue Date: ${invoice.dueDate || 'On Receipt'}\n\nPayment Details:\n${effectiveSettings.bankDetails || ''}\n\nWarm regards,\nECAS Institute Finance Office\nP.O. Box 37193-00100, Nairobi, Kenya\nTel/WhatsApp: +254 708 060 223 | 0708 060 223`,
            linkedEntityId: invoice.id,
          },
          currentUser
        );
        onDataChange?.();
        setEmailOpen(false);
        showToast?.(`Invoice email dispatched/logged for ${recipient}.`);
      } else if (mode === 'receipt' && payment) {
        const receiptNo = payment.receiptNo || `RCP-${String(payment.id || '').replace(/^PAY-/, '')}`;
        await msimamiziEnterpriseService.sendCommunication(
          {
            channel: 'Email',
            category: 'Receipt',
            recipientName: clientName,
            recipientContact: recipient,
            subject: `ECAS Institute — Official Payment Receipt (${receiptNo})`,
            body: `Dear ${clientName},\n\nThank you for your payment. Below is your verified official receipt from ECAS Institute:\n\nReceipt No: ${receiptNo}\nPayment Reference: ${payment.reference}\nAmount Verified: ${payment.currency} ${Number(payment.amount || 0).toLocaleString()}\nPayment Method: ${payment.method}\nTransaction Date: ${payment.transactionDate}\nInvoice No: ${payment.invoiceNo || invoice?.invoiceNo || 'Direct Payment'}\nProgramme: ${invoice?.courseTitle || 'Executive Training Programme'}\nStatus: ${payment.status}\n\nWarm regards,\nECAS Institute Finance Office\nP.O. Box 37193-00100, Nairobi, Kenya\nTel/WhatsApp: +254 708 060 223 | 0708 060 223`,
            linkedEntityId: payment.id,
          },
          currentUser
        );
        onDataChange?.();
        setEmailOpen(false);
        showToast?.(`Payment receipt email dispatched/logged for ${recipient}.`);
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendEmail = async () => {
    if (!clientEmail) {
      setEmailInput('');
      setEmailOpen((v) => !v);
      return;
    }
    await dispatchEmailTo(clientEmail);
  };

  const buildWhatsAppMessage = () => {
    if (mode === 'invoice' && invoice) {
      return [
        `*ECAS INSTITUTE — OFFICIAL PROFORMA INVOICE*`,
        `Invoice No: *${invoice.invoiceNo}*`,
        `Client: ${clientName}${invoice.organisation ? ` (${invoice.organisation})` : ''}`,
        `Programme: ${invoice.courseTitle}`,
        `Destination: ${invoice.destination || 'Nairobi, Kenya'}`,
        `Net Amount: *${invoice.currency} ${Number(invoice.netAmount || 0).toLocaleString()}*`,
        `Paid to Date: ${invoice.currency} ${Number(invoice.paidAmount || 0).toLocaleString()}`,
        `Balance Due: *${invoice.currency} ${Number(invoice.balance || 0).toLocaleString()}*`,
        `Due Date: ${invoice.dueDate || 'On Receipt'}`,
        ``,
        `Remittance Details:`,
        `${effectiveSettings.bankDetails || 'Contact finance@ecasiafrica.org for wire instructions.'}`,
        ``,
        `ECAS Institute • P.O. Box 37193-00100, Nairobi, Kenya`,
        `Tel/WhatsApp: +254 708 060 223 (0708 060 223) | https://ecasiafrica.org`,
      ].join('\n');
    }
    if (mode === 'receipt' && payment) {
      const receiptNo = payment.receiptNo || `RCP-${String(payment.id || '').replace(/^PAY-/, '')}`;
      return [
        `*ECAS INSTITUTE — OFFICIAL PAYMENT RECEIPT*`,
        `Receipt No: *${receiptNo}*`,
        `Received From: ${clientName}`,
        `Amount Verified: *${payment.currency} ${Number(payment.amount || 0).toLocaleString()}*`,
        `Payment Reference: ${payment.reference}`,
        `Payment Method: ${payment.method}`,
        `Transaction Date: ${payment.transactionDate}`,
        `Invoice No: ${payment.invoiceNo || invoice?.invoiceNo || 'Direct Payment'}`,
        `Remaining Balance: ${invoice ? `${invoice.currency} ${Number(invoice.balance || 0).toLocaleString()}` : `${payment.currency} 0`}`,
        ``,
        `Thank you! Your enrolment with ECAS Institute is confirmed.`,
        `P.O. Box 37193-00100, Nairobi, Kenya • +254 708 060 223 | https://ecasiafrica.org`,
      ].join('\n');
    }
    return `ECAS Institute Document: ${docSpec?.title || 'Institutional Report'}`;
  };

  const handleConfirmWhatsAppSend = async (e) => {
    e.preventDefault();
    const digits = normalizeWhatsAppPhone(waPhoneInput);
    if (!digits || digits.length < 9) {
      alert('Please enter a valid WhatsApp phone number (e.g. 0708060223 or +2547...).');
      return;
    }
    const text = buildWhatsAppMessage();
    await msimamiziEnterpriseService.sendCommunication(
      {
        channel: 'WhatsApp',
        category: mode === 'invoice' ? 'Invoice' : mode === 'receipt' ? 'Receipt' : 'Document',
        recipientName: clientName,
        recipientContact: `+${digits}`,
        subject: mode === 'invoice' ? `Invoice ${invoice?.invoiceNo} via WhatsApp` : `Receipt ${payment?.reference} via WhatsApp`,
        body: text,
        linkedEntityId: invoice?.id || payment?.id || '',
      },
      currentUser
    );
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setWaOpen(false);
    onDataChange?.();
    showToast?.(`Opened WhatsApp & logged ${mode} dispatch to +${digits}.`);
  };

  const receiptNo = payment ? payment.receiptNo || `RCP-${String(payment.id || '').replace(/^PAY-/, '')}` : '';

  return (
    <div className="space-y-4">
      {/* Document Page Action Toolbar (Hidden when printing) */}
      <div className="print:hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#032e42] text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h2 className="text-sm font-black text-[#032e42]">
              {mode === 'invoice'
                ? `Official Invoice — ${invoice?.invoiceNo}`
                : mode === 'receipt'
                  ? `Official Payment Receipt — ${receiptNo}`
                  : docSpec?.title || 'Official ECAS Document'}
            </h2>
            <p className="text-[11px] text-[#718096]">
              Client-ready ECAS Institute document page • Zero popups
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Generating PDF...' : mode === 'receipt' ? 'Download Receipt PDF' : 'Download PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#032e42] hover:bg-[#06405c] text-white font-bold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Print</span>
          </button>

          {(mode === 'invoice' || mode === 'receipt') && (
            <>
              <button
                type="button"
                onClick={() => setWaOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isSendingEmail ? 'Sending...' : mode === 'receipt' ? 'Email Receipt' : 'Email Invoice'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline WhatsApp Recipient Bar */}
      {waOpen && (
        <form
          onSubmit={handleConfirmWhatsAppSend}
          className="print:hidden bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            <MessageCircle className="w-4 h-4 text-[#008000] shrink-0" />
            <div className="flex-1">
              <label className="block font-bold text-[#032e42] mb-1">
                Recipient WhatsApp Phone Number (e.g. 0708060223 or +2547...)
              </label>
              <input
                type="tel"
                required
                value={waPhoneInput}
                onChange={(e) => setWaPhoneInput(e.target.value)}
                placeholder="+2547..."
                className="w-full max-w-xs h-9 px-3 rounded-xl border border-emerald-300 bg-white font-mono text-[#032e42]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setWaOpen(false)} className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008000] text-white font-bold cursor-pointer">
              <Send className="w-3.5 h-3.5" /> Send via WhatsApp
            </button>
          </div>
        </form>
      )}

      {/* Inline Email Recipient Bar */}
      {emailOpen && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await dispatchEmailTo(emailInput.trim());
          }}
          className="print:hidden bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            <Mail className="w-4 h-4 text-blue-700 shrink-0" />
            <div className="flex-1">
              <label className="block font-bold text-[#032e42] mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="client@organisation.org"
                className="w-full max-w-xs h-9 px-3 rounded-xl border border-blue-300 bg-white text-[#032e42]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setEmailOpen(false)} className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSendingEmail} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer">
              <Send className="w-3.5 h-3.5" /> Send Email
            </button>
          </div>
        </form>
      )}

      {/* A4 Official Institutional Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-4xl mx-auto overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        {/* Top Navy + Green Accent Strip */}
        <div className="h-2 bg-[#032e42]" />
        <div className="h-1 bg-[#008000]" />

        <div className="p-6 sm:p-10 space-y-6 text-xs text-[#032e42]">
          {/* Institutional Letterhead (NO Msimamizi text) */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b-2 border-[#032e42]">
            <div className="flex items-start gap-4">
              <img
                src="/logo.png"
                alt="ECAS Institute Official Logo"
                className="w-20 h-14 object-contain shrink-0"
              />
              <div className="space-y-1">
                <h1 className="text-xl font-black tracking-tight text-[#032e42] uppercase">
                  ECAS Institute
                </h1>
                <p className="text-[11px] font-bold text-[#008000]">
                  Environmental Capacities and Sustainability Institute
                </p>
                <p className="text-[11px] text-slate-600">
                  {effectiveSettings.address || 'P.O. Box 37193-00100, Nairobi, Kenya'}
                </p>
                <p className="text-[11px] text-slate-600">
                  Tel / WhatsApp: <strong>+254 708 060 223</strong> / <strong>0708 060 223</strong> &bull;{' '}
                  {effectiveSettings.officialEmail || 'info@ecasiafrica.org'}
                </p>
                <p className="text-[11px] text-slate-500">
                  https://ecasiafrica.org &bull; NITA &amp; NEMA Accredited Institution
                </p>
              </div>
            </div>

            <div className="sm:text-right space-y-1 shrink-0">
              <div className="inline-block px-3 py-1 rounded-lg bg-[#032e42] text-white font-black text-[11px] uppercase tracking-wider">
                {mode === 'invoice'
                  ? invoice?.status === 'Paid'
                    ? 'OFFICIAL TRAINING INVOICE'
                    : 'OFFICIAL PROFORMA INVOICE'
                  : mode === 'receipt'
                    ? 'OFFICIAL PAYMENT RECEIPT'
                    : 'INSTITUTIONAL REPORT'}
              </div>
              {mode === 'invoice' && invoice && (
                <div className="pt-2 space-y-0.5 text-[11.5px]">
                  <p><strong>Invoice No:</strong> <span className="font-mono">{invoice.invoiceNo}</span></p>
                  <p><strong>Date Issued:</strong> {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-GB') : '—'}</p>
                  <p><strong>Due Date:</strong> {invoice.dueDate || 'On Receipt'}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`font-extrabold ${invoice.status === 'Paid' ? 'text-[#16A36A]' : 'text-amber-700'}`}>
                      {invoice.status}
                    </span>
                  </p>
                </div>
              )}
              {mode === 'receipt' && payment && (
                <div className="pt-2 space-y-0.5 text-[11.5px]">
                  <p><strong>Receipt No:</strong> <span className="font-mono">{receiptNo}</span></p>
                  <p><strong>Payment Ref:</strong> <span className="font-mono">{payment.reference}</span></p>
                  <p><strong>Date Received:</strong> {payment.transactionDate}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="font-extrabold text-[#16A36A]">{payment.status}</span>
                  </p>
                </div>
              )}
              {mode === 'report' && (
                <div className="pt-2 space-y-0.5 text-[11.5px]">
                  <p><strong>Document:</strong> {docSpec?.title}</p>
                  <p><strong>Generated:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              )}
            </div>
          </div>

          {/* INVOICE BODY */}
          {mode === 'invoice' && invoice && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/80 p-4 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#008000]">Bill To / Client Details</p>
                  <p className="text-sm font-black text-[#032e42]">{clientName}</p>
                  <p className="text-slate-600">{invoice.organisation || registration?.organisation || 'Individual / Corporate Delegate'}</p>
                  {clientEmail && <p className="text-slate-600">{clientEmail}</p>}
                  {defaultClientPhone && <p className="text-slate-600">Tel: {defaultClientPhone}</p>}
                  {registration?.country && <p className="text-slate-500">{registration.country}</p>}
                </div>

                <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/80 p-4 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#008000]">Training &amp; Account Summary</p>
                  <p><strong>Programme:</strong> {invoice.courseTitle}</p>
                  <p><strong>Destination:</strong> {invoice.destination || registration?.venue || 'Nairobi, Kenya'}</p>
                  <p><strong>Cohort / Dates:</strong> {invoice.cohortName || registration?.cohortName || registration?.durationText || 'Standard 2026 Intake'}</p>
                  {registration?.referenceNo && <p><strong>Registration Ref:</strong> <span className="font-mono">{registration.referenceNo}</span></p>}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#032e42] text-white text-[10.5px] uppercase tracking-wider">
                      <th className="py-3 px-4">Description / Training Programme</th>
                      <th className="py-3 px-4">Delivery Hub</th>
                      <th className="py-3 px-4 text-right">Amount ({invoice.currency || 'USD'})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-[#032e42]">
                        {invoice.courseTitle}
                        {invoice.cohortName && <span className="block text-[11px] text-slate-500 font-normal">Cohort: {invoice.cohortName}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{invoice.destination || 'Nairobi, Kenya'}</td>
                      <td className="py-3.5 px-4 text-right font-bold">{Number(invoice.amount || 0).toLocaleString()}</td>
                    </tr>
                    {Number(invoice.additionalCharges) > 0 && (
                      <tr>
                        <td className="py-3 px-4">Additional Materials / Logistics</td>
                        <td className="py-3 px-4 text-slate-500">—</td>
                        <td className="py-3 px-4 text-right font-semibold">{Number(invoice.additionalCharges).toLocaleString()}</td>
                      </tr>
                    )}
                    {Number(invoice.discount) > 0 && (
                      <tr className="text-[#008000]">
                        <td className="py-3 px-4 font-semibold">Authorized Institutional Discount</td>
                        <td className="py-3 px-4">—</td>
                        <td className="py-3 px-4 text-right font-bold">-{Number(invoice.discount).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-80 space-y-2 rounded-xl border border-slate-200 bg-[#F5F8FC] p-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Net Payable:</span>
                    <strong className="text-[#032e42]">{invoice.currency} {Number(invoice.netAmount || 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Paid to Date:</span>
                    <strong className="text-[#16A36A]">{invoice.currency} {Number(invoice.paidAmount || 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-black">
                    <span>Balance Outstanding:</span>
                    <span className={Number(invoice.balance || 0) > 0 ? 'text-[#DC4545]' : 'text-[#16A36A]'}>
                      {invoice.currency} {Number(invoice.balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                <p className="font-black text-[#032e42] uppercase text-[10.5px] tracking-wider">Remittance &amp; Payment Instructions</p>
                <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                  {effectiveSettings.bankDetails || 'Account Name: Environmental Capacities and Sustainability Institute (ECAS)\nCurrency: USD / KES\nContact finance@ecasiafrica.org for official wire instructions.'}
                </p>
                {effectiveSettings.mpesaPaybill && (
                  <p className="text-slate-700 pt-1"><strong>M-Pesa Paybill / Till:</strong> {effectiveSettings.mpesaPaybill}</p>
                )}
              </div>
            </>
          )}

          {/* PAYMENT RECEIPT BODY */}
          {mode === 'receipt' && payment && (
            <>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#16A36A] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-[#16A36A] uppercase tracking-wider">Payment Received &amp; Verified</p>
                    <p className="text-sm font-bold text-[#032e42]">
                      Sum of <strong>{payment.currency} {Number(payment.amount || 0).toLocaleString()}</strong> received with thanks.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white border border-emerald-300 text-[#16A36A] font-black uppercase text-[11px]">
                  {invoice && Number(invoice.balance || 0) === 0 ? 'PAID IN FULL' : payment.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/80 p-4 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#008000]">Received From</p>
                  <p className="text-sm font-black text-[#032e42]">{clientName}</p>
                  {invoice?.organisation && <p className="text-slate-600">{invoice.organisation}</p>}
                  {clientEmail && <p className="text-slate-600">{clientEmail}</p>}
                  {defaultClientPhone && <p className="text-slate-600">Tel: {defaultClientPhone}</p>}
                </div>
                <div className="rounded-xl bg-[#F5F8FC] border border-slate-200/80 p-4 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#008000]">In Settlement Of</p>
                  <p><strong>Programme:</strong> {invoice?.courseTitle || registration?.eventTitle || 'ECAS Executive Training'}</p>
                  <p><strong>Invoice No:</strong> <span className="font-mono">{payment.invoiceNo || invoice?.invoiceNo || 'Direct Payment'}</span></p>
                  <p><strong>Payment Method:</strong> {payment.method}</p>
                  <p><strong>Verified By:</strong> {payment.verifiedBy}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#032e42] text-white text-[10.5px] uppercase tracking-wider">
                      <th className="py-3 px-4">Transaction Detail</th>
                      <th className="py-3 px-4 text-right">Record / Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-semibold">Official Receipt Number</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">{receiptNo}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Bank / M-Pesa Reference</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">{payment.reference}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Transaction Date</td>
                      <td className="py-3 px-4 text-right">{payment.transactionDate}</td>
                    </tr>
                    {invoice && (
                      <tr>
                        <td className="py-3 px-4 font-semibold">Total Invoice Amount</td>
                        <td className="py-3 px-4 text-right font-bold">{invoice.currency} {Number(invoice.netAmount || 0).toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50/70">
                      <td className="py-3.5 px-4 font-black text-[#16A36A]">Amount Paid &amp; Verified (This Receipt)</td>
                      <td className="py-3.5 px-4 text-right text-base font-black text-[#16A36A]">
                        {payment.currency} {Number(payment.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                    {invoice && (
                      <tr>
                        <td className="py-3 px-4 font-bold">Remaining Balance on Invoice</td>
                        <td className="py-3 px-4 text-right font-black">
                          {invoice.currency} {Number(invoice.balance || 0).toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {payment.supportingNote && (
                <div className="rounded-xl bg-[#F5F8FC] border border-slate-200 p-3.5">
                  <span className="font-bold text-[#032e42]">Verification Notes: </span>
                  <span className="text-slate-600">{payment.supportingNote}</span>
                </div>
              )}
            </>
          )}

          {/* GENERIC REPORT / BRIEF / PROFILE BODY */}
          {mode === 'report' && (
            <div className="space-y-4">
              {Array.isArray(docSpec?.kpis) && docSpec.kpis.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {docSpec.kpis.map((k, idx) => (
                    <div key={idx} className="rounded-xl bg-[#F5F8FC] border border-slate-200 p-3">
                      <p className="text-[10px] font-bold uppercase text-[#718096]">{k.label}</p>
                      <p className="text-base font-black text-[#032e42] mt-1">{k.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(docSpec?.headers) && docSpec.headers.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-[11.5px]">
                    <thead>
                      <tr className="bg-[#032e42] text-white uppercase tracking-wider text-[10px]">
                        {docSpec.headers.map((h, hi) => (
                          <th key={hi} className="py-2.5 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(docSpec.rows || []).map((row, ri) => (
                        <tr key={ri} className="hover:bg-[#F5F8FC]">
                          {row.map((cell, ci) => (
                            <td key={ci} className="py-2.5 px-3">{cell ?? '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : docSpec?.bodyHtml ? (
                <div
                  className="prose prose-sm max-w-none [&_table]:w-full [&_table]:border-collapse [&_th]:bg-[#032e42] [&_th]:text-white [&_th]:p-2 [&_th]:text-left [&_td]:p-2 [&_td]:border-b [&_td]:border-slate-200"
                  dangerouslySetInnerHTML={{ __html: docSpec.bodyHtml }}
                />
              ) : null}
            </div>
          )}

          {/* Authorized Stamp / Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <p className="font-black text-[#032e42]">Authorized Institutional Document — ECAS Institute</p>
              <p>Environmental Capacities and Sustainability Institute • P.O. Box 37193-00100, Nairobi, Kenya</p>
              <p>Tel/WhatsApp: +254 708 060 223 / 0708 060 223 &bull; finance@ecasiafrica.org &bull; https://ecasiafrica.org</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-dashed border-[#008000]/50 bg-emerald-50/50 text-[#008000] font-black text-[10.5px] uppercase tracking-wider shrink-0">
              <ShieldCheck className="w-4 h-4" /> Official ECAS Record
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
