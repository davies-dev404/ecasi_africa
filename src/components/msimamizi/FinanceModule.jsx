import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Receipt,
  CreditCard,
  AlertTriangle,
  Scale,
  Plus,
  Printer,
  Mail,
  CheckCircle2,
  X,
  Download,
  ShieldAlert,
  Search,
  Clock,
  XCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  PAYMENT_METHODS,
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

export default function FinanceModule({
  activeTab,
  registrations = [],
  courses = [],
  invoices = [],
  payments = [],
  currentUser,
  onDataChange,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [invForm, setInvForm] = useState({
    registrationId: '',
    applicantName: '',
    applicantEmail: '',
    organisation: '',
    courseTitle: '',
    destination: 'Nairobi, Kenya',
    currency: 'USD',
    amount: 1200,
    additionalCharges: 0,
    discount: 0,
    paymentPlan: 'Full Payment',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const [payForm, setPayForm] = useState({
    invoiceId: '',
    reference: '',
    amount: '',
    currency: 'USD',
    method: PAYMENT_METHODS[0],
    transactionDate: new Date().toISOString().split('T')[0],
    status: 'Verified',
    supportingNote: '',
  });

  const canWrite = hasPermission(currentUser, 'finance.write');
  const todayStr = new Date().toISOString().split('T')[0];

  const metrics = useMemo(() => {
    const activeInvs = invoices.filter((i) => i.status !== 'Cancelled' && i.status !== 'Draft');
    const totalInvoiced = activeInvs.reduce((s, i) => s + (Number(i.netAmount) || 0), 0);
    const totalCollected = payments
      .filter((p) => p.status === 'Verified')
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const outstanding = activeInvs.reduce((s, i) => s + Math.max(0, (Number(i.netAmount) || 0) - (Number(i.paidAmount) || 0)), 0);
    const overdue = activeInvs.filter((i) => i.status !== 'Paid' && i.dueDate && i.dueDate < todayStr);
    const pendingTx = payments.filter((p) => p.status === 'Pending');
    const failedTx = payments.filter((p) => p.status === 'Failed');
    const refundedTx = payments.filter((p) => p.status === 'Refunded');
    return {
      totalInvoiced,
      totalCollected,
      outstanding,
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((s, i) => s + Math.max(0, (Number(i.netAmount) || 0) - (Number(i.paidAmount) || 0)), 0),
      pendingCount: pendingTx.length,
      failedCount: failedTx.length,
      refundedCount: refundedTx.length,
    };
  }, [invoices, payments, todayStr]);

  const reconciliation = useMemo(
    () => msimamiziEnterpriseService.runReconciliation(),
    [invoices, payments]
  );

  const monthlyRevenueChart = useMemo(() => {
    const map = {};
    payments
      .filter((p) => p.status === 'Verified')
      .forEach((p) => {
        const m = String(p.transactionDate || p.createdAt || '').slice(0, 7) || 'Unknown';
        if (!map[m]) map[m] = { month: m, collected: 0 };
        map[m].collected += Number(p.amount) || 0;
      });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }, [payments]);

  const handleSelectRegistrationForInvoice = (regId) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) {
      setInvForm((f) => ({ ...f, registrationId: '' }));
      return;
    }
    setInvForm((f) => ({
      ...f,
      registrationId: reg.id,
      applicantName: [reg.firstName, reg.middleName, reg.lastName].filter(Boolean).join(' '),
      applicantEmail: reg.officialEmail || reg.personalEmail || '',
      organisation: reg.organisation || '',
      courseTitle: reg.eventTitle || '',
      destination: reg.venue || 'Nairobi, Kenya',
      currency: reg.currency || 'USD',
      amount: Number(reg.totalFee) || 1200,
    }));
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!canWrite) return;
    if (!invForm.applicantName.trim() || !invForm.courseTitle.trim()) {
      alert('Please specify applicant name and course title.');
      return;
    }
    const created = msimamiziEnterpriseService.createInvoice(invForm, currentUser);
    setIsInvoiceModalOpen(false);
    onDataChange();
    showToast(`Invoice ${created.invoiceNo} generated (${created.currency} ${created.netAmount.toLocaleString()}).`);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!canWrite) return;
    const res = msimamiziEnterpriseService.recordPayment(payForm, currentUser);
    if (!res.success) {
      alert(res.error);
      return;
    }
    setIsPaymentModalOpen(false);
    setPayForm({
      invoiceId: '',
      reference: '',
      amount: '',
      currency: 'USD',
      method: PAYMENT_METHODS[0],
      transactionDate: todayStr,
      status: 'Verified',
      supportingNote: '',
    });
    onDataChange();
    showToast(
      res.isDuplicateRef
        ? `Payment recorded and flagged as DUPLICATE reference (${res.record.reference}) for reconciliation review.`
        : `Payment ${res.record.reference} verified and reconciled.`
    );
  };

  const handlePrintInvoice = (inv) => {
    const settings = msimamiziEnterpriseService.getSettings();
    const html = `
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
        <div>
          <h3 style="margin:0 0 6px 0;">Bill To:</h3>
          <div><strong>${inv.applicantName}</strong></div>
          <div>${inv.organisation || ''}</div>
          <div>${inv.applicantEmail || ''}</div>
        </div>
        <div style="text-align:right;">
          <div><strong>Invoice No:</strong> ${inv.invoiceNo}</div>
          <div><strong>Date Issued:</strong> ${new Date(inv.createdAt).toLocaleDateString()}</div>
          <div><strong>Due Date:</strong> ${inv.dueDate || 'On Receipt'}</div>
          <div><strong>Status:</strong> ${inv.status}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Description / Training Programme</th><th>Destination</th><th style="text-align:right;">Amount (${inv.currency})</th></tr></thead>
        <tbody>
          <tr><td>${inv.courseTitle} ${inv.cohortName ? `(${inv.cohortName})` : ''}</td><td>${inv.destination}</td><td style="text-align:right;">${Number(inv.amount).toLocaleString()}</td></tr>
          ${Number(inv.additionalCharges) > 0 ? `<tr><td>Additional Charges / Logistics</td><td>—</td><td style="text-align:right;">${Number(inv.additionalCharges).toLocaleString()}</td></tr>` : ''}
          ${Number(inv.discount) > 0 ? `<tr><td>Authorized Institutional Discount</td><td>—</td><td style="text-align:right;">-${Number(inv.discount).toLocaleString()}</td></tr>` : ''}
          <tr><td colspan="2" style="text-align:right;font-weight:bold;">Net Total Due</td><td style="text-align:right;font-weight:bold;">${inv.currency} ${Number(inv.netAmount).toLocaleString()}</td></tr>
          <tr><td colspan="2" style="text-align:right;">Amount Paid</td><td style="text-align:right;">${inv.currency} ${Number(inv.paidAmount || 0).toLocaleString()}</td></tr>
          <tr><td colspan="2" style="text-align:right;font-weight:bold;">Balance Outstanding</td><td style="text-align:right;font-weight:bold;">${inv.currency} ${Number(inv.balance || 0).toLocaleString()}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:18px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
        <strong>Payment Instructions:</strong><br/>
        <pre style="font-family:inherit;white-space:pre-wrap;margin:4px 0 0 0;">${settings.bankDetails || 'Contact finance@ecasiafrica.org for wire transfer details.'}</pre>
      </div>
    `;
    msimamiziEnterpriseService.printInstitutionalDocument(`Official Proforma Invoice ${inv.invoiceNo}`, html, currentUser);
  };

  const handleEmailInvoice = async (inv) => {
    if (!inv.applicantEmail) {
      alert('No recipient email address on this invoice.');
      return;
    }
    await msimamiziEnterpriseService.sendCommunication(
      {
        channel: 'Email',
        category: 'Invoice',
        recipientName: inv.applicantName,
        recipientContact: inv.applicantEmail,
        subject: `ECAS Institute — Official Invoice ${inv.invoiceNo}`,
        body: `Dear ${inv.applicantName},\n\nYour invoice ${inv.invoiceNo} for ${inv.courseTitle} is ready.\nNet Amount: ${inv.currency} ${Number(inv.netAmount).toLocaleString()}\nBalance Due: ${inv.currency} ${Number(inv.balance).toLocaleString()}\nDue Date: ${inv.dueDate}\n\nRegards,\nECAS Institute Finance Desk`,
        linkedEntityId: inv.id,
      },
      currentUser
    );
    onDataChange();
    showToast(`Invoice notification dispatched/logged for ${inv.applicantEmail}.`);
  };

  const filteredInvoices = useMemo(() => {
    let list = [...invoices];
    if (activeTab === 'outstanding-balances') {
      list = list.filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled' && i.status !== 'Draft' && Number(i.balance) > 0);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => `${i.invoiceNo} ${i.applicantName} ${i.organisation} ${i.courseTitle}`.toLowerCase().includes(q));
    }
    return list;
  }, [invoices, activeTab, search]);

  return (
    <div className="space-y-5">
      {/* Finance Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total Invoiced', val: `$${metrics.totalInvoiced.toLocaleString()}`, color: 'text-[#032e42]', icon: Receipt, iconBg: 'bg-slate-100 text-[#032e42]' },
          { label: 'Total Collected', val: `$${metrics.totalCollected.toLocaleString()}`, color: 'text-[#16A36A]', icon: CheckCircle2, iconBg: 'bg-emerald-50 text-[#16A36A]' },
          { label: 'Outstanding', val: `$${metrics.outstanding.toLocaleString()}`, color: 'text-[#F0A020]', icon: Wallet, iconBg: 'bg-amber-50 text-[#F0A020]' },
          { label: 'Overdue Invoices', val: metrics.overdueCount, color: 'text-[#DC4545]', icon: AlertTriangle, iconBg: 'bg-red-50 text-[#DC4545]' },
          { label: 'Pending Tx', val: metrics.pendingCount, color: 'text-amber-700', icon: Clock, iconBg: 'bg-amber-50 text-amber-700' },
          { label: 'Failed Tx', val: metrics.failedCount, color: 'text-[#DC4545]', icon: XCircle, iconBg: 'bg-red-50 text-[#DC4545]' },
          { label: 'Refunded Tx', val: metrics.refundedCount, color: 'text-slate-600', icon: RotateCcw, iconBg: 'bg-slate-100 text-slate-600' },
        ].map((card) => {
          const CardIcon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#718096] truncate">{card.label}</p>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <CardIcon className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className={`text-lg font-black truncate ${card.color}`}>{card.val}</p>
            </div>
          );
        })}
      </div>

      {/* Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
            {activeTab === 'payment-reconciliation' ? <Scale className="w-5 h-5 text-[#008000]" /> :
             activeTab === 'payments' ? <CreditCard className="w-5 h-5 text-[#008000]" /> :
             activeTab === 'outstanding-balances' ? <AlertTriangle className="w-5 h-5 text-[#DC4545]" /> :
             <Wallet className="w-5 h-5 text-[#008000]" />}
            {activeTab === 'finance-overview' && 'Financial Overview'}
            {activeTab === 'invoices' && 'Invoice Management'}
            {activeTab === 'payments' && 'Payment Records & Verification'}
            {activeTab === 'outstanding-balances' && 'Outstanding & Overdue Balances'}
            {activeTab === 'payment-reconciliation' && 'Payment Reconciliation Desk'}
          </h2>
          <p className="text-xs text-[#718096]">All totals reflect verified invoices and payments with mandatory supporting references.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canWrite && (
            <>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008000] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Generate Invoice
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A36A] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <CreditCard className="w-4 h-4" /> Record Payment
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              const headers = ['Invoice No', 'Applicant', 'Course', 'Currency', 'Net Amount', 'Paid', 'Balance', 'Due Date', 'Status'];
              const rows = invoices.map((i) => [i.invoiceNo, i.applicantName, i.courseTitle, i.currency, i.netAmount, i.paidAmount, i.balance, i.dueDate, i.status]);
              msimamiziEnterpriseService.exportCSV(headers, rows, `ECAS_Invoices_${todayStr}.csv`, currentUser);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#032e42] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Sub-view 1: Financial Overview Chart */}
      {activeTab === 'finance-overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-[#032e42] mb-3">Monthly Collected Revenue (Verified Payments)</h3>
          {monthlyRevenueChart.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center bg-[#F5F8FC] rounded-xl border border-dashed border-slate-200 text-xs text-[#718096]">
              No verified payment transactions recorded yet. Record verified payments to view revenue trends.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Bar dataKey="collected" name="Collected" fill="#16A36A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Sub-view 2: Payment Reconciliation */}
      {activeTab === 'payment-reconciliation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase text-[#718096]">Expected (Active Invoices)</p>
              <p className="text-xl font-black text-[#032e42] mt-1">${reconciliation.totalExpected.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase text-[#718096]">Actual Verified Payments</p>
              <p className="text-xl font-black text-[#16A36A] mt-1">${reconciliation.totalCollected.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase text-[#718096]">Duplicate References Detected</p>
              <p className="text-xl font-black text-[#DC4545] mt-1">{reconciliation.duplicates.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase text-[#718096]">Unmatched / Discrepancies</p>
              <p className="text-xl font-black text-[#F0A020] mt-1">{reconciliation.unmatched.length + reconciliation.discrepancies.length}</p>
            </div>
          </div>

          {(reconciliation.duplicates.length > 0 || reconciliation.unmatched.length > 0 || reconciliation.discrepancies.length > 0) && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-[#DC4545] shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">Reconciliation Exceptions Require Review</p>
                <p className="mt-0.5">
                  {reconciliation.duplicates.length} duplicate reference(s), {reconciliation.unmatched.length} unmatched transaction(s), and {reconciliation.discrepancies.length} invoice amount discrepancy(ies) detected.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#032e42] text-white text-[11px] uppercase">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Invoice / Applicant</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method &amp; Date</th>
                    <th className="py-3 px-4">Reconciliation</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr><td colSpan={6} className="py-10 text-center text-[#718096]">No payment records to reconcile yet.</td></tr>
                  ) : (
                    payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-[#F5F8FC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#032e42]">{pay.reference}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#032e42]">{pay.invoiceNo || 'Unmatched Direct Payment'}</p>
                          <p className="text-[11px] text-[#718096]">{pay.applicantName || '—'}</p>
                        </td>
                        <td className="py-3 px-4 font-black text-[#16A36A]">{pay.currency} {Number(pay.amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-[#718096]">{pay.method} • {pay.transactionDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pay.reconciliationStatus === 'Reconciled' || pay.reconciliationStatus === 'Matched'
                              ? 'bg-emerald-100 text-[#16A36A]'
                              : pay.reconciliationStatus === 'Duplicate' || pay.reconciliationStatus === 'Discrepancy'
                              ? 'bg-red-100 text-[#DC4545]'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pay.reconciliationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canWrite && pay.reconciliationStatus !== 'Reconciled' && (
                            <button
                              type="button"
                              onClick={() => {
                                msimamiziEnterpriseService.updatePayment(pay.id, { reconciliationStatus: 'Reconciled' }, currentUser);
                                onDataChange();
                                showToast(`Payment ${pay.reference} marked as Reconciled.`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#032e42] text-white text-[11px] font-bold cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3 text-[#4ade80]" /> Mark Reconciled
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-view 3: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#032e42] text-white text-[11px] uppercase">
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4">Applicant / Invoice</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date &amp; Verified By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-[#718096]">No payment transactions recorded yet.</td></tr>
                ) : (
                  payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-[#F5F8FC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#032e42]">{pay.reference}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#032e42]">{pay.applicantName || '—'}</p>
                        <p className="text-[11px] text-[#718096]">{pay.invoiceNo || 'Direct'}</p>
                      </td>
                      <td className="py-3 px-4 font-black text-[#16A36A]">{pay.currency} {Number(pay.amount).toLocaleString()}</td>
                      <td className="py-3 px-4">{pay.method}</td>
                      <td className="py-3 px-4 text-[11px] text-[#718096]">
                        {pay.transactionDate}
                        <span className="block">{pay.verifiedBy}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.status === 'Verified' ? 'bg-emerald-100 text-[#16A36A]' :
                          pay.status === 'Failed' ? 'bg-red-100 text-[#DC4545]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const html = `
                              <h3>Official Payment Receipt</h3>
                              <table>
                                <tr><th>Payment Reference</th><td>${pay.reference}</td><th>Transaction Date</th><td>${pay.transactionDate}</td></tr>
                                <tr><th>Received From</th><td>${pay.applicantName || 'Delegate'}</td><th>Invoice No</th><td>${pay.invoiceNo || 'Direct Payment'}</td></tr>
                                <tr><th>Amount Verified</th><td><strong>${pay.currency} ${Number(pay.amount).toLocaleString()}</strong></td><th>Payment Method</th><td>${pay.method}</td></tr>
                                <tr><th>Verified By</th><td>${pay.verifiedBy}</td><th>Status</th><td>${pay.status}</td></tr>
                              </table>
                              ${pay.supportingNote ? `<p><strong>Reference Notes:</strong> ${pay.supportingNote}</p>` : ''}
                            `;
                            msimamiziEnterpriseService.printInstitutionalDocument(`Official Receipt - ${pay.reference}`, html, currentUser);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#032e42] text-white text-[11px] font-bold cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-[#4ade80]" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-view 4: Invoices & Outstanding Balances Table */}
      {(activeTab === 'invoices' || activeTab === 'outstanding-balances' || activeTab === 'finance-overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-extrabold text-[#032e42]">
              {activeTab === 'outstanding-balances' ? 'Unpaid & Overdue Invoices' : 'Institutional Invoices'} ({filteredInvoices.length})
            </h3>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice, applicant, course..."
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#032e42] text-white text-[11px] uppercase">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Applicant / Org</th>
                  <th className="py-3 px-4">Course Programme</th>
                  <th className="py-3 px-4">Net / Paid / Balance</th>
                  <th className="py-3 px-4">Due Date &amp; Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-[#718096]">No invoices in this view yet.</td></tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isOverdue = inv.status !== 'Paid' && inv.status !== 'Cancelled' && inv.dueDate && inv.dueDate < todayStr;
                    return (
                      <tr key={inv.id} className="hover:bg-[#F5F8FC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#032e42]">{inv.invoiceNo}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#032e42]">{inv.applicantName}</p>
                          <p className="text-[11px] text-[#718096]">{inv.organisation || inv.applicantEmail || '—'}</p>
                        </td>
                        <td className="py-3 px-4 max-w-[220px] truncate font-medium">{inv.courseTitle}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-black text-[#032e42]">{inv.currency} {Number(inv.netAmount).toLocaleString()}</p>
                          <p className="text-[10.5px] text-[#718096]">
                            Paid: <span className="text-[#16A36A] font-bold">{Number(inv.paidAmount || 0).toLocaleString()}</span> • Bal: <span className="text-[#DC4545] font-bold">{Number(inv.balance || 0).toLocaleString()}</span>
                          </p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className={`text-[11px] font-semibold ${isOverdue ? 'text-[#DC4545]' : 'text-slate-600'}`}>
                            {inv.dueDate || '—'} {isOverdue ? '(Overdue)' : ''}
                          </p>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-[#16A36A]' :
                            isOverdue ? 'bg-red-100 text-[#DC4545]' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button type="button" onClick={() => handlePrintInvoice(inv)} className="px-2.5 py-1.5 rounded-lg bg-[#032e42] text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1">
                              <Printer className="w-3 h-3 text-[#4ade80]" /> PDF
                            </button>
                            <button type="button" onClick={() => handleEmailInvoice(inv)} title="Email Invoice" className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            {canWrite && inv.status !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPayForm((f) => ({
                                    ...f,
                                    invoiceId: inv.id,
                                    amount: String(inv.balance || inv.netAmount),
                                    currency: inv.currency || 'USD',
                                  }));
                                  setIsPaymentModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#16A36A] text-white text-[11px] font-bold cursor-pointer"
                              >
                                Pay
                              </button>
                            )}
                            {canWrite && inv.status !== 'Paid' && Number(inv.paidAmount || 0) === 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete unpaid invoice ${inv.invoiceNo}?`)) {
                                    const res = msimamiziEnterpriseService.deleteInvoice(inv.id, currentUser);
                                    if (!res.success) {
                                      alert(res.error);
                                      return;
                                    }
                                    onDataChange();
                                    showToast(`Deleted unpaid invoice ${inv.invoiceNo}.`);
                                  }
                                }}
                                title="Delete Unpaid Invoice"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC4545] hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateInvoice} className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#032e42] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2"><Receipt className="w-4 h-4 text-[#4ade80]" /> Generate Official Invoice</h3>
              <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#032e42] mb-1">Link to Registered Applicant (Optional)</label>
                <select value={invForm.registrationId} onChange={(e) => handleSelectRegistrationForInvoice(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                  <option value="">— Manual Invoice Entry —</option>
                  {registrations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.referenceNo} — {[r.firstName, r.lastName].filter(Boolean).join(' ')} ({r.eventTitle})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Applicant / Client Name *</label>
                <input required value={invForm.applicantName} onChange={(e) => setInvForm({ ...invForm, applicantName: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Email</label>
                <input type="email" value={invForm.applicantEmail} onChange={(e) => setInvForm({ ...invForm, applicantEmail: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#032e42] mb-1">Course / Programme *</label>
                <input required list="fin-courses" value={invForm.courseTitle} onChange={(e) => setInvForm({ ...invForm, courseTitle: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
                <datalist id="fin-courses">
                  {courses.slice(0, 100).map((c) => <option key={c.slug} value={c.title} />)}
                </datalist>
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Currency</label>
                <select value={invForm.currency} onChange={(e) => setInvForm({ ...invForm, currency: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                  <option value="USD">USD</option>
                  <option value="KES">KES</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Course Fee Amount *</label>
                <input type="number" min={0} required value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: Number(e.target.value) })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Authorized Discount</label>
                <input type="number" min={0} value={invForm.discount} onChange={(e) => setInvForm({ ...invForm, discount: Number(e.target.value) })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Payment Due Date</label>
                <input type="date" value={invForm.dueDate} onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
            </div>
            <div className="px-5 py-3.5 bg-[#F5F8FC] border-t border-slate-100 flex items-center justify-between">
              <span className="font-extrabold text-[#032e42]">
                Net Payable: {invForm.currency} {Math.max(0, (Number(invForm.amount) || 0) + (Number(invForm.additionalCharges) || 0) - (Number(invForm.discount) || 0)).toLocaleString()}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#008000] text-white font-bold cursor-pointer">Issue Invoice</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Record Verified Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRecordPayment} className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#032e42] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#4ade80]" /> Record &amp; Verify Payment</h3>
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#032e42] mb-1">Apply to Invoice</label>
                <select
                  value={payForm.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i.id === e.target.value);
                    setPayForm((f) => ({
                      ...f,
                      invoiceId: e.target.value,
                      amount: inv ? String(inv.balance || inv.netAmount) : f.amount,
                      currency: inv ? inv.currency : f.currency,
                    }));
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">— Unmatched / Direct Deposit —</option>
                  {invoices.filter((i) => i.status !== 'Cancelled').map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNo} — {inv.applicantName} (Bal: {inv.currency} {Number(inv.balance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Bank / M-Pesa Reference *</label>
                <input required value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} placeholder="e.g. MPESA-QWE8912 / SWIFT-8821" className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono" />
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Amount Received *</label>
                <input type="number" min={0.01} step="0.01" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Payment Method</label>
                <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Transaction Date</label>
                <input type="date" value={payForm.transactionDate} onChange={(e) => setPayForm({ ...payForm, transactionDate: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#032e42] mb-1">Supporting Verification Note *</label>
                <input required value={payForm.supportingNote} onChange={(e) => setPayForm({ ...payForm, supportingNote: e.target.value })} placeholder="Confirm bank statement / remittance advice / receipt verification details..." className="w-full h-9 px-3 rounded-xl border border-slate-300" />
              </div>
            </div>
            <div className="px-5 py-3.5 bg-[#F5F8FC] border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#16A36A] text-white font-bold cursor-pointer">Verify &amp; Post Payment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
