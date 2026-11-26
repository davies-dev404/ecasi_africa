import { jsPDF } from 'jspdf';

async function loadLogoBase64() {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawEcasiLetterhead(doc, logoDataUrl, docTitle, docRightLines = [], settings = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  // Top accent strip
  doc.setFillColor(3, 46, 66); // #032e42
  doc.rect(0, 0, pageW, 6, 'F');
  doc.setFillColor(0, 128, 0); // #008000
  doc.rect(0, 6, pageW, 2, 'F');

  let textStartX = 15;
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 15, 13, 28, 16);
      textStartX = 47;
    } catch {
      // skip if image decode fails
    }
  }

  doc.setTextColor(3, 46, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ECAS INSTITUTE', textStartX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Environmental Capacities and Sustainability Institute', textStartX, 23);
  doc.text(settings.address || 'P.O. Box 37193-00100, Nairobi, Kenya', textStartX, 27.5);
  doc.text(
    `Tel / WhatsApp: +254 708 060 223 / 0708 060 223  |  ${settings.officialEmail || 'info@ecasiafrica.org'}  |  ecasiafrica.org`,
    textStartX,
    32
  );

  // Right side Document Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 128, 0);
  doc.text(docTitle, pageW - 15, 19, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  let ry = 24.5;
  docRightLines.forEach((line) => {
    doc.text(String(line), pageW - 15, ry, { align: 'right' });
    ry += 4.3;
  });

  doc.setDrawColor(3, 46, 66);
  doc.setLineWidth(0.5);
  doc.line(15, 37.5, pageW - 15, 37.5);
  return 44;
}

function drawFooter(doc, settings = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(15, pageH - 18, pageW - 15, pageH - 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `ECAS Institute • ${settings.address || 'P.O. Box 37193-00100, Nairobi, Kenya'} • Tel/WhatsApp: +254 708 060 223`,
    15,
    pageH - 12
  );
  doc.text('https://ecasiafrica.org', pageW - 15, pageH - 12, { align: 'right' });
}

export async function downloadInvoicePdf({ invoice, registration, settings = {} }) {
  if (!invoice) return;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const logoDataUrl = await loadLogoBase64();
  const pageW = doc.internal.pageSize.getWidth();

  const issueDate = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
  const titleLabel = invoice.status === 'Paid' ? 'OFFICIAL TAX / TRAINING INVOICE' : 'OFFICIAL PROFORMA INVOICE';

  let y = drawEcasiLetterhead(
    doc,
    logoDataUrl,
    titleLabel,
    [
      `Invoice No: ${invoice.invoiceNo}`,
      `Date Issued: ${issueDate}`,
      `Due Date: ${invoice.dueDate || 'On Receipt'}`,
      `Status: ${(invoice.status || 'Issued').toUpperCase()}`,
    ],
    settings
  );

  // Bill To & Programme boxes
  const boxW = (pageW - 36) / 2;
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(15, y, boxW, 34, 2, 2, 'F');
  doc.roundedRect(15 + boxW + 6, y, boxW, 34, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 128, 0);
  doc.text('BILL TO / CLIENT DETAILS', 19, y + 6.5);
  doc.text('TRAINING & INVOICE SUMMARY', 19 + boxW + 6, y + 6.5);

  doc.setTextColor(3, 46, 66);
  doc.setFontSize(10);
  doc.text(String(invoice.applicantName || 'Delegate'), 19, y + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const clientPhone = registration ? `${registration.dialCode || ''} ${registration.phoneNumber || ''}`.trim() : '';
  const billLines = [
    invoice.organisation || registration?.organisation || 'Individual / Corporate Delegate',
    invoice.applicantEmail || registration?.officialEmail || registration?.personalEmail || '',
    clientPhone ? `Tel: ${clientPhone}` : (registration?.country || ''),
  ].filter(Boolean);
  let ly = y + 17.5;
  billLines.slice(0, 3).forEach((ln) => {
    doc.text(String(ln).slice(0, 52), 19, ly);
    ly += 4.5;
  });

  const rx = 19 + boxW + 6;
  const metaLines = [
    `Destination: ${invoice.destination || registration?.venue || 'Nairobi, Kenya'}`,
    `Cohort: ${invoice.cohortName || registration?.cohortName || registration?.durationText || '2026 Intake'}`,
    registration?.referenceNo ? `Registration Ref: ${registration.referenceNo}` : '',
    `Payment Plan: ${invoice.paymentPlan || 'Full Payment'}`,
  ].filter(Boolean);
  let rly = y + 12.5;
  metaLines.forEach((ln) => {
    doc.text(String(ln).slice(0, 52), rx, rly);
    rly += 4.8;
  });

  y += 42;

  // Table Header
  doc.setFillColor(3, 46, 66);
  doc.rect(15, y, pageW - 30, 8.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DESCRIPTION / TRAINING PROGRAMME', 18, y + 5.7);
  doc.text('DESTINATION', 115, y + 5.7);
  doc.text(`AMOUNT (${invoice.currency || 'USD'})`, pageW - 18, y + 5.7, { align: 'right' });

  y += 11;
  doc.setTextColor(3, 46, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const descLines = doc.splitTextToSize(`${invoice.courseTitle || 'Executive Training Programme'}${invoice.cohortName ? ` (${invoice.cohortName})` : ''}`, 90);
  doc.text(descLines, 18, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(String(invoice.destination || 'Nairobi, Kenya').slice(0, 28), 115, y + 2);
  doc.text(`${Number(invoice.amount || 0).toLocaleString()}`, pageW - 18, y + 2, { align: 'right' });
  y += Math.max(8, descLines.length * 4.5 + 3);
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, pageW - 15, y);

  if (Number(invoice.additionalCharges) > 0) {
    y += 6;
    doc.text('Additional Logistics / Materials Charges', 18, y);
    doc.text('—', 115, y);
    doc.text(`${Number(invoice.additionalCharges).toLocaleString()}`, pageW - 18, y, { align: 'right' });
    y += 4;
    doc.line(15, y, pageW - 15, y);
  }

  if (Number(invoice.discount) > 0) {
    y += 6;
    doc.setTextColor(0, 128, 0);
    doc.text('Authorized Institutional Discount', 18, y);
    doc.text('—', 115, y);
    doc.text(`-${Number(invoice.discount).toLocaleString()}`, pageW - 18, y, { align: 'right' });
    y += 4;
    doc.line(15, y, pageW - 15, y);
  }

  // Totals Summary Right Aligned
  y += 10;
  const sumX = 112;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(3, 46, 66);
  doc.text('Net Total Payable:', sumX, y);
  doc.text(`${invoice.currency || 'USD'} ${Number(invoice.netAmount || 0).toLocaleString()}`, pageW - 18, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Amount Paid to Date:', sumX, y);
  doc.text(`${invoice.currency || 'USD'} ${Number(invoice.paidAmount || 0).toLocaleString()}`, pageW - 18, y, { align: 'right' });

  y += 7;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(sumX - 3, y - 4.5, pageW - 15 - (sumX - 3), 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 128, 0);
  doc.text('Balance Outstanding:', sumX, y + 1.5);
  doc.text(`${invoice.currency || 'USD'} ${Number(invoice.balance || 0).toLocaleString()}`, pageW - 18, y + 1.5, { align: 'right' });

  // Payment Instructions Box
  y += 18;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  const bankText = settings.bankDetails || 'Account Name: Environmental Capacities and Sustainability Institute (ECAS)\nCurrency: USD / KES\nContact finance@ecasiafrica.org or +254 708 060 223 for wire & M-Pesa remittance details.';
  const bankLines = doc.splitTextToSize(
    settings.mpesaPaybill ? `${bankText}\nM-Pesa Paybill / Till: ${settings.mpesaPaybill}` : bankText,
    pageW - 38
  );
  const boxH = 12 + bankLines.length * 4.5;
  doc.roundedRect(15, y, pageW - 30, boxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(3, 46, 66);
  doc.text('REMITTANCE & PAYMENT INSTRUCTIONS', 19, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(bankLines, 19, y + 11.5);

  y += boxH + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(3, 46, 66);
  doc.text('ECAS Institute Finance & Admissions Office', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for partnering with Environmental Capacities and Sustainability Institute (ECAS Institute).', 15, y + 4.5);

  drawFooter(doc, settings);
  doc.save(`ECAS_Invoice_${invoice.invoiceNo || invoice.id}.pdf`);
}

export async function downloadPaymentReceiptPdf({ payment, invoice, registration, settings = {} }) {
  if (!payment) return;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const logoDataUrl = await loadLogoBase64();
  const pageW = doc.internal.pageSize.getWidth();

  const receiptNo = payment.receiptNo || `RCP-${String(payment.id || '').replace(/^PAY-/, '')}`;

  let y = drawEcasiLetterhead(
    doc,
    logoDataUrl,
    'OFFICIAL PAYMENT RECEIPT',
    [
      `Receipt No: ${receiptNo}`,
      `Date Received: ${payment.transactionDate || new Date().toLocaleDateString('en-GB')}`,
      `Payment Ref: ${payment.reference || '—'}`,
      `Status: ${(payment.status || 'Verified').toUpperCase()}`,
    ],
    settings
  );

  // Green Verified Seal Strip
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(15, y, pageW - 30, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(22, 163, 106);
  doc.text('PAYMENT RECEIVED & OFFICIALLY VERIFIED', 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Received with thanks: ${payment.currency || 'USD'} ${Number(payment.amount || 0).toLocaleString()} via ${payment.method || 'Bank Transfer'}`,
    20,
    y + 11
  );

  y += 20;
  const boxW = (pageW - 36) / 2;
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(15, y, boxW, 34, 2, 2, 'F');
  doc.roundedRect(15 + boxW + 6, y, boxW, 34, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 128, 0);
  doc.text('RECEIVED FROM', 19, y + 6.5);
  doc.text('PROGRAMME & INVOICE REFERENCE', 19 + boxW + 6, y + 6.5);

  const clientName = payment.applicantName || invoice?.applicantName || (registration ? `${registration.firstName || ''} ${registration.lastName || ''}`.trim() : 'Delegate');
  const org = invoice?.organisation || registration?.organisation || '';
  const email = invoice?.applicantEmail || registration?.officialEmail || registration?.personalEmail || '';
  const phone = registration ? `${registration.dialCode || ''} ${registration.phoneNumber || ''}`.trim() : '';

  doc.setTextColor(3, 46, 66);
  doc.setFontSize(10);
  doc.text(String(clientName), 19, y + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  [org, email, phone ? `Tel: ${phone}` : ''].filter(Boolean).slice(0, 3).forEach((ln, i) => {
    doc.text(String(ln).slice(0, 50), 19, y + 17.5 + i * 4.5);
  });

  const rx = 19 + boxW + 6;
  const progLines = [
    invoice?.courseTitle || registration?.eventTitle || 'Executive Training Programme',
    `Invoice No: ${payment.invoiceNo || invoice?.invoiceNo || 'Direct Payment'}`,
    `Destination: ${invoice?.destination || registration?.venue || 'Nairobi, Kenya'}`,
    registration?.referenceNo ? `Registration Ref: ${registration.referenceNo}` : '',
  ].filter(Boolean);
  progLines.slice(0, 4).forEach((ln, i) => {
    doc.text(String(ln).slice(0, 50), rx, y + 12.5 + i * 4.8);
  });

  y += 42;
  doc.setFillColor(3, 46, 66);
  doc.rect(15, y, pageW - 30, 8.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PAYMENT DETAILS & RECONCILIATION', 18, y + 5.7);
  doc.text(`AMOUNT (${payment.currency || 'USD'})`, pageW - 18, y + 5.7, { align: 'right' });

  const tableRows = [
    ['Payment Method & Channel', payment.method || 'Bank Transfer'],
    ['Transaction Reference No.', payment.reference || '—'],
    ['Payment Verification Status', `${payment.status || 'Verified'} (${payment.verifiedBy || 'ECAS Finance'})`],
    ['Total Invoice Amount', invoice ? `${invoice.currency || 'USD'} ${Number(invoice.netAmount || 0).toLocaleString()}` : 'N/A'],
    ['Amount Received (This Receipt)', `${payment.currency || 'USD'} ${Number(payment.amount || 0).toLocaleString()}`],
    ['Remaining Invoice Balance', invoice ? `${invoice.currency || 'USD'} ${Number(invoice.balance || 0).toLocaleString()}` : `${payment.currency || 'USD'} 0`],
  ];

  y += 8.5;
  tableRows.forEach(([label, val], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, pageW - 30, 8, 'F');
    }
    doc.setFont('helvetica', idx === 4 ? 'bold' : 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(idx === 4 ? 0 : 51, idx === 4 ? 128 : 65, idx === 4 ? 0 : 85);
    doc.text(label, 18, y + 5.4);
    doc.text(String(val), pageW - 18, y + 5.4, { align: 'right' });
    y += 8;
  });

  if (payment.supportingNote) {
    y += 8;
    doc.setFillColor(245, 248, 252);
    doc.roundedRect(15, y, pageW - 30, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(3, 46, 66);
    doc.text('VERIFICATION NOTES:', 18, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(payment.supportingNote).slice(0, 110), 18, y + 10.5);
    y += 16;
  }

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(3, 46, 66);
  doc.text('Official Finance Confirmation', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This receipt confirms official verification of funds received by ECAS Institute.', 15, y + 4.8);
  doc.text('Your seat in the respective executive training programme is confirmed.', 15, y + 9.3);

  drawFooter(doc, settings);
  doc.save(`ECAS_Receipt_${(payment.reference || receiptNo).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}

export async function downloadInstitutionalTablePdf({ title, headers = [], rows = [], kpis = [], settings = {} }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const logoDataUrl = await loadLogoBase64();
  const pageW = doc.internal.pageSize.getWidth();

  let y = drawEcasiLetterhead(
    doc,
    logoDataUrl,
    'INSTITUTIONAL REPORT',
    [title.slice(0, 38), `Generated: ${new Date().toLocaleDateString('en-GB')}`],
    settings
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(3, 46, 66);
  doc.text(title, 15, y);
  y += 8;

  if (Array.isArray(kpis) && kpis.length > 0) {
    kpis.slice(0, 6).forEach((k) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`${k.label}:`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(k.value), 68, y);
      y += 5;
    });
    y += 4;
  }

  if (headers.length > 0) {
    const colW = (pageW - 30) / headers.length;
    doc.setFillColor(3, 46, 66);
    doc.rect(15, y, pageW - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    headers.forEach((h, i) => {
      doc.text(String(h).slice(0, 18), 16.5 + i * colW, y + 5.2);
    });
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(3, 46, 66);
    rows.slice(0, 35).forEach((r, idx) => {
      if (y > 265) {
        drawFooter(doc, settings);
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, pageW - 30, 6.8, 'F');
      }
      r.forEach((cell, i) => {
        doc.text(String(cell ?? '').slice(0, 20), 16.5 + i * colW, y + 4.8);
      });
      y += 6.8;
    });
  }

  drawFooter(doc, settings);
  doc.save(`ECAS_${title.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`);
}
