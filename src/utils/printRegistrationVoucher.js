/**
 * Official ECAS Institute Single-Page Printable Registration & Admission Voucher
 * Generates a clean, self-contained A4 printable document without website headers, footers, or UI clutter.
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function printRegistrationVoucher(reg) {
  if (!reg || typeof window === 'undefined') return;

  const fullName = [reg.title, reg.firstName, reg.middleName, reg.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Delegate';
  const referenceNo = reg.referenceNo || 'ECAS-2026-REG';
  const scheduleId = reg.scheduleId || '400827';
  const eventTitle = reg.eventTitle || 'Executive Training Programme';
  const durationText = reg.durationText || 'Scheduled 2026 Cohort';
  const venue = reg.venue || 'Nairobi, Kenya';
  const format = reg.format || 'Classroom';
  const organisation = reg.organisation || 'Independent / Self-Sponsored';
  const jobTitle = reg.jobTitle || 'Executive Delegate';
  const country = reg.country || 'Kenya';
  const personalEmail = reg.personalEmail || reg.officialEmail || 'N/A';
  const officialEmail = reg.officialEmail || reg.personalEmail || 'N/A';
  const phone = reg.phone || `${reg.dialCode || ''} ${reg.phoneNumber || ''}`.trim() || 'N/A';
  const invoiceTo = reg.invoiceTo || 'Organisation';
  const participantsCount = Number(reg.participantsCount) || 1;
  const totalFee = Number(reg.totalFee) || 1200;
  const unitFee = Math.round(totalFee / Math.max(1, participantsCount));
  const status = reg.status || 'Confirmed';
  const paymentStatus = reg.paymentStatus || 'Unpaid (Proforma Issued)';
  const displayDate =
    reg.displayDate ||
    new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const accommodation = reg.needAccommodation || reg.accommodation || 'No';
  const airportTransfer = reg.needAirportTransfer || reg.airportTransfer || 'No';
  const safariTour = reg.needSafariTour || reg.safariTour || 'No';
  const approvingName = reg.approvingAuthorityName || reg.approvingName || 'Direct Admission';
  const approvingEmail = reg.approvingAuthorityEmail || reg.approvingEmail || '';

  const logoUrl = `${window.location.origin}/logo.png`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ECAS Admission Registration Slip - ${escapeHtml(referenceNo)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.45;
    }
    .page-wrap {
      max-width: 780px;
      margin: 0 auto;
      padding: 18px 22px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      background: #ffffff;
    }
    .no-print-bar {
      max-width: 780px;
      margin: 14px auto;
      padding: 10px 16px;
      background: #032e42;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .no-print-bar button {
      background: #008000;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .no-print-bar button.close-btn {
      background: rgba(255,255,255,0.15);
      margin-left: 8px;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      .page-wrap {
        border: 1px solid #94a3b8;
        padding: 14px 18px;
        max-width: 100%;
      }
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 3px solid #008000;
      padding-bottom: 14px;
      margin-bottom: 16px;
      gap: 16px;
    }
    .brand-col {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 62px;
      height: 62px;
      object-fit: contain;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 4px;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #032e42;
      margin: 0 0 2px 0;
      letter-spacing: -0.2px;
    }
    .brand-sub {
      font-size: 10.5px;
      font-weight: 700;
      color: #008000;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 0 0 4px 0;
    }
    .brand-contact {
      font-size: 10px;
      color: #475569;
      margin: 0;
    }
    .voucher-badge {
      text-align: right;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #032e42;
      padding: 8px 12px;
      border-radius: 6px;
      min-width: 215px;
    }
    .voucher-badge .doc-type {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #008000;
      letter-spacing: 0.8px;
    }
    .voucher-badge .ref-no {
      font-size: 14px;
      font-weight: 900;
      color: #032e42;
      font-family: Consolas, monospace;
      margin: 2px 0;
    }
    .voucher-badge .meta {
      font-size: 10px;
      color: #475569;
    }
    .banner {
      background: #032e42;
      color: #ffffff;
      padding: 10px 14px;
      border-radius: 7px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .banner h2 {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .status-pill {
      background: #008000;
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #032e42;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin: 14px 0 8px 0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }
    .field {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
    }
    .field.full {
      grid-column: 1 / -1;
    }
    .field-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      display: block;
      margin-bottom: 1px;
    }
    .field-value {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .fee-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 11.5px;
    }
    .fee-table th {
      background: #f1f5f9;
      color: #032e42;
      text-align: left;
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      font-size: 10px;
      text-transform: uppercase;
    }
    .fee-table td {
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      font-weight: 600;
    }
    .fee-table tr.total-row td {
      background: #ecfdf5;
      color: #032e42;
      font-weight: 900;
      font-size: 13px;
    }
    .footer-sign {
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1.5px dashed #cbd5e1;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
    }
    .notes-box {
      font-size: 10px;
      color: #475569;
      max-width: 62%;
    }
    .stamp-box {
      text-align: center;
      min-width: 190px;
    }
    .stamp-seal {
      display: inline-block;
      border: 2px solid #008000;
      color: #008000;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .stamp-caption {
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span><strong>ECAS Official Registration Voucher</strong> &bull; ${escapeHtml(referenceNo)}</span>
    <div>
      <button onclick="window.print()">Print / Save as PDF</button>
      <button class="close-btn" onclick="window.close()">Close Window</button>
    </div>
  </div>

  <div class="page-wrap">
    <div class="header">
      <div class="brand-col">
        <img src="${escapeHtml(logoUrl)}" alt="ECAS Institute" class="brand-logo" onerror="this.style.display='none'" />
        <div>
          <p class="brand-sub">Environmental Capacities &amp; Sustainability Institute</p>
          <h1 class="brand-title">ECAS INSTITUTE AFRICA</h1>
          <p class="brand-contact">
            P.O. Box 37193-00100, Nairobi, Kenya &bull; Tel/WhatsApp: +254 728 925 306 / +254 796 356 738<br />
            Email: info@ecasiafrica.org &bull; Website: www.ecasiafrica.org
          </p>
        </div>
      </div>

      <div class="voucher-badge">
        <div class="doc-type">Registration Voucher</div>
        <div class="ref-no">${escapeHtml(referenceNo)}</div>
        <div class="meta">Schedule ID: #${escapeHtml(scheduleId)}</div>
        <div class="meta">Date: ${escapeHtml(displayDate)}</div>
      </div>
    </div>

    <div class="banner">
      <h2>Official Executive Training Registration &amp; Admission Summary</h2>
      <span class="status-pill">${escapeHtml(status)}</span>
    </div>

    <div class="section-title">1. Programme &amp; Cohort Schedule</div>
    <div class="grid-2">
      <div class="field full">
        <span class="field-label">Course / Programme Title</span>
        <span class="field-value" style="color: #008000; font-size: 13px;">${escapeHtml(eventTitle)}</span>
      </div>
      <div class="field">
        <span class="field-label">Training Dates / Duration</span>
        <span class="field-value">${escapeHtml(durationText)}</span>
      </div>
      <div class="field">
        <span class="field-label">Training Venue &amp; Format</span>
        <span class="field-value">${escapeHtml(venue)} (${escapeHtml(format)})</span>
      </div>
    </div>

    <div class="section-title">2. Nominated Delegate &amp; Sponsoring Organization</div>
    <div class="grid-2">
      <div class="field">
        <span class="field-label">Participant Full Name</span>
        <span class="field-value">${escapeHtml(fullName)}</span>
      </div>
      <div class="field">
        <span class="field-label">Job Title / Designation</span>
        <span class="field-value">${escapeHtml(jobTitle)}</span>
      </div>
      <div class="field">
        <span class="field-label">Sponsoring Organization</span>
        <span class="field-value">${escapeHtml(organisation)}</span>
      </div>
      <div class="field">
        <span class="field-label">Country of Origin</span>
        <span class="field-value">${escapeHtml(country)}</span>
      </div>
      <div class="field">
        <span class="field-label">Official / Personal Email</span>
        <span class="field-value">${escapeHtml(personalEmail)}${officialEmail && officialEmail !== personalEmail ? ' / ' + escapeHtml(officialEmail) : ''}</span>
      </div>
      <div class="field">
        <span class="field-label">Telephone / WhatsApp</span>
        <span class="field-value">${escapeHtml(phone)}</span>
      </div>
    </div>

    <div class="section-title">3. Hospitality, Travel &amp; Billing Directives</div>
    <div class="grid-2">
      <div class="field">
        <span class="field-label">Invoice Directed To</span>
        <span class="field-value">${escapeHtml(invoiceTo)} (${participantsCount} ${participantsCount > 1 ? 'Delegates' : 'Delegate'})</span>
      </div>
      <div class="field">
        <span class="field-label">Approving Authority</span>
        <span class="field-value">${escapeHtml(approvingName)}${approvingEmail ? ' (' + escapeHtml(approvingEmail) + ')' : ''}</span>
      </div>
      <div class="field full">
        <span class="field-label">Logistics &amp; Welfare Preferences</span>
        <span class="field-value">
          Hotel Accommodation: ${escapeHtml(accommodation)} &nbsp;|&nbsp;
          Airport Transfer: ${escapeHtml(airportTransfer)} &nbsp;|&nbsp;
          Safari / Excursion: ${escapeHtml(safariTour)}
        </span>
      </div>
    </div>

    <div class="section-title">4. Tuition Fee &amp; Proforma Summary</div>
    <table class="fee-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Delivery Mode</th>
          <th>Unit Fee (USD)</th>
          <th>Delegates</th>
          <th style="text-align: right;">Total Amount (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tuition &amp; Certification — ${escapeHtml(eventTitle)}</td>
          <td>${escapeHtml(format)}</td>
          <td>$${unitFee.toLocaleString()} USD</td>
          <td>${participantsCount}</td>
          <td style="text-align: right;">$${totalFee.toLocaleString()} USD</td>
        </tr>
        <tr class="total-row">
          <td colspan="4">TOTAL TRAINING FEE PAYABLE (${escapeHtml(paymentStatus)})</td>
          <td style="text-align: right; color: #008000;">$${totalFee.toLocaleString()} USD</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-sign">
      <div class="notes-box">
        <strong>Official Admissions Instructions:</strong><br />
        1. Our Training Admissions Coordinator will dispatch the formal Invitation Letter and Proforma Invoice to your registered email.<br />
        2. Please quote Reference <strong>${escapeHtml(referenceNo)}</strong> on all official correspondence and bank wire remittances.<br />
        3. Generated electronically via the ECAS Institute Executive Training Portal on ${escapeHtml(displayDate)}.
      </div>
      <div class="stamp-box">
        <div class="stamp-seal">ECAS ADMISSIONS VERIFIED</div>
        <div class="stamp-caption">Office of the Training Director<br />ECAS Institute Africa</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=900,height=850,scrollbars=yes');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  } else {
    window.print();
  }
}

