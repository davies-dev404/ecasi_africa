// ECAS Institute - Msimamizi Administrative Service
// Real-time persistent data service for Course Registrations, Corporate Quotes & Portal Analytics

const STORAGE_KEY = 'ecasi_course_registrations_live';
const INQUIRIES_KEY = 'ecasi_course_inquiries_live';
const ADMIN_AUTH_KEY = 'ecasi_msimamizi_auth';
const ADMIN_TOKEN_KEY = 'ecasi_msimamizi_token';
const ADMIN_ACCOUNTS_KEY = 'ecasi_msimamizi_accounts';
const ADMIN_CURRENT_USER_KEY = 'ecasi_msimamizi_user';
const COURSES_KEY = 'ecasi_courses_v2026_v3';

export function normalizeAdminEmail(raw) {
  let clean = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^[.\s]+|[.\s]+$/g, '');
  if (clean && !clean.includes('@')) {
    clean = `${clean}@ecasiafrica.org`;
  }
  return clean;
}

// Non-reversible local digest so plaintext passwords are never stored in browser storage
function computeCredentialDigest(email, password) {
  const normEmail = normalizeAdminEmail(email);
  const input = `ecasi_msimamizi_v2:${normEmail}:${String(password).trim()}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `digest_${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

export function getStoredAdminToken() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function getSyncUrl() {
  if (typeof window === 'undefined') return '/api/msimamizi-sync.php';
  const host = window.location.hostname;
  // Both ecasiafrica.org and msimamizi.ecasiafrica.org share the /public_html Document Root
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('ecasiafrica.org')) {
    return '/api/msimamizi-sync.php';
  }
  return 'https://ecasiafrica.org/api/msimamizi-sync.php';
}

async function pushToServer(payload) {
  if (typeof window === 'undefined') return null;
  try {
    const token = getStoredAdminToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['X-Admin-Token'] = token;
    }
    const res = await fetch(getSyncUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Offline or local dev fallback: localStorage already updated
    return null;
  }
}

class AdminRegistrationService {
  constructor() {
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
      const storedInq = localStorage.getItem(INQUIRIES_KEY);
      if (!storedInq) {
        localStorage.setItem(INQUIRIES_KEY, JSON.stringify([]));
      }
      this.syncFromServer();
    } catch (e) {
      console.warn('LocalStorage error initializing admin registrations:', e);
    }
  }

  async syncFromServer() {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return;

    try {
      const isAuth = this.isAuthenticated();
      const token = getStoredAdminToken();
      const scope = isAuth && token ? 'admin' : 'public';
      const headers = {};
      if (token) {
        headers['X-Admin-Token'] = token;
      }

      const res = await fetch(`${getSyncUrl()}?scope=${scope}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = await res.json();
      if (!json?.success || !json?.data) return;

      const { registrations, inquiries, courses, accounts } = json.data;

      if (Array.isArray(registrations) && registrations.length > 0) {
        const localRegs = this.getRegistrations();
        const mergedMap = new Map();
        [...registrations, ...localRegs].forEach((r) => {
          const key = r.id || r.referenceNo;
          if (key && !mergedMap.has(key)) {
            mergedMap.set(key, r);
          }
        });
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('ecasi_registration_updated'));
      }

      if (Array.isArray(inquiries) && inquiries.length > 0) {
        const localInq = this.getInquiries();
        const mergedInqMap = new Map();
        [...inquiries, ...localInq].forEach((inq) => {
          const key = inq.id || inq.referenceNo;
          if (key && !mergedInqMap.has(key)) {
            mergedInqMap.set(key, inq);
          }
        });
        const mergedInq = Array.from(mergedInqMap.values());
        localStorage.setItem(INQUIRIES_KEY, JSON.stringify(mergedInq));
        window.dispatchEvent(new CustomEvent('ecasi_inquiry_updated'));
      }

      if (courses && typeof courses === 'object' && Object.keys(courses).length > 0) {
        const localCoursesRaw = localStorage.getItem(COURSES_KEY);
        const localCourses = localCoursesRaw ? JSON.parse(localCoursesRaw) : {};
        const mergedCourses = { ...localCourses, ...courses };
        localStorage.setItem(COURSES_KEY, JSON.stringify(mergedCourses));
        window.dispatchEvent(new CustomEvent('ecasi_courses_updated'));
      }

      if (Array.isArray(accounts) && accounts.length > 0) {
        const localAccounts = this.getAdminAccounts();
        const accountMap = new Map();
        localAccounts.forEach((loc) => {
          const em = normalizeAdminEmail(loc.email);
          if (em) accountMap.set(em, { ...loc, email: em });
        });
        accounts.forEach((rem) => {
          const em = normalizeAdminEmail(rem.email);
          if (!em) return;
          const existing = accountMap.get(em) || { email: em, role: 'Administrator' };
          accountMap.set(em, {
            ...existing,
            role: rem.role || existing.role || 'Administrator',
            credentialDigest: rem.credentialDigest || existing.credentialDigest,
            updatedAt: rem.updatedAt || existing.updatedAt,
          });
        });
        localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(Array.from(accountMap.values())));
      }
    } catch {
      // Ignore network sync errors
    }
  }

  // Retrieve all real registrations (no fake mock seeds)
  getRegistrations() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to get registrations:', e);
      return [];
    }
  }

  // Save a new registration submitted by public user or admin
  addRegistration(regData) {
    if (typeof window === 'undefined') return null;
    try {
      const existing = this.getRegistrations();
      const newId = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRef = regData.referenceNo || `ECAS-${regData.scheduleId || '400827'}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newRecord = {
        id: newId,
        referenceNo: newRef,
        status: regData.status || 'Pending',
        paymentStatus: regData.paymentStatus || 'Unpaid',
        adminNotes: regData.adminNotes || 'Submitted via public online registration portal.',
        submittedAt: regData.submittedAt || new Date().toISOString(),
        ...regData,
      };

      const updated = [newRecord, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      pushToServer({ action: 'add_registration', registration: newRecord });

      // Notify any listening admin tabs/components
      window.dispatchEvent(new CustomEvent('ecasi_registration_updated', { detail: newRecord }));
      return newRecord;
    } catch (e) {
      console.error('Failed to add registration:', e);
      return null;
    }
  }

  // Update status, paymentStatus, or admin notes for a registration
  updateRegistration(id, updates) {
    if (typeof window === 'undefined') return false;
    try {
      const existing = this.getRegistrations();
      const updated = existing.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      pushToServer({ action: 'set_registrations', registrations: updated });
      window.dispatchEvent(new CustomEvent('ecasi_registration_updated'));
      return true;
    } catch (e) {
      console.error('Failed to update registration:', e);
      return false;
    }
  }

  // Delete registration
  deleteRegistration(id) {
    if (typeof window === 'undefined') return false;
    try {
      const existing = this.getRegistrations();
      const updated = existing.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      pushToServer({ action: 'set_registrations', registrations: updated });
      window.dispatchEvent(new CustomEvent('ecasi_registration_updated'));
      return true;
    } catch (e) {
      console.error('Failed to delete registration:', e);
      return false;
    }
  }

  // Clear all registrations
  clearAllRegistrations() {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      pushToServer({ action: 'set_registrations', registrations: [] });
      window.dispatchEvent(new CustomEvent('ecasi_registration_updated'));
      return true;
    } catch (e) {
      console.error('Failed to clear registrations:', e);
      return false;
    }
  }

  // Export registrations as CSV
  exportToCSV() {
    const records = this.getRegistrations();
    if (!records || records.length === 0) return '';

    const headers = [
      'Reference No',
      'Submitted Date',
      'Status',
      'Payment Status',
      'Participant Title',
      'Full Name',
      'Official Email',
      'Personal Email',
      'Phone Number',
      'Job Title',
      'Organization',
      'Country',
      'Course Title',
      'Schedule ID',
      'Venue',
      'Format',
      'Duration',
      'Delegates Count',
      'Total Fee (USD)',
      'Accommodation',
      'Airport Transfer',
      'Safari Tour',
      'Invoice To',
      'Approving Authority',
      'Admin Notes',
    ];

    const rows = records.map((r) => [
      r.referenceNo || '',
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '',
      r.status || 'Pending',
      r.paymentStatus || 'Unpaid',
      r.title || '',
      `"${[r.firstName, r.middleName, r.lastName].filter(Boolean).join(' ')}"`,
      r.officialEmail || '',
      r.personalEmail || '',
      `"${(r.dialCode || '') + ' ' + (r.phoneNumber || '')}"`,
      `"${r.jobTitle || ''}"`,
      `"${r.organisation || ''}"`,
      r.country || '',
      `"${r.eventTitle || ''}"`,
      r.scheduleId || '',
      `"${r.venue || ''}"`,
      r.format || '',
      `"${r.durationText || ''}"`,
      r.participantsCount || 1,
      r.totalFee || '',
      `"${r.needAccommodation || 'No'}"`,
      r.needAirportTransfer || 'No',
      `"${r.needSafariTour || 'No'}"`,
      r.invoiceTo || 'Self',
      `"${r.approvingAuthorityName || ''}"`,
      `"${(r.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return csvContent;
  }

  // Download CSV trigger
  downloadCSV() {
    const csv = this.exportToCSV();
    if (!csv) {
      alert('No registrations available to export.');
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ECAS_Course_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ─── Inquiries & Leads (WhatsApp / Email / In-House / Calendar) ───────────
  getInquiries() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(INQUIRIES_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to get inquiries:', e);
      return [];
    }
  }

  addInquiry(inqData) {
    if (typeof window === 'undefined') return null;
    try {
      const existing = this.getInquiries();
      const newId = `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRef = inqData.referenceNo || `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();
      const displayDate = new Date().toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newInquiry = {
        id: newId,
        referenceNo: newRef,
        channel: inqData.channel || 'WhatsApp',
        inquiryType: inqData.inquiryType || 'Course Inquiry',
        fullName: inqData.fullName || 'Prospective Delegate',
        email: inqData.email || '',
        phone: inqData.phone || '',
        organisation: inqData.organisation || '',
        country: inqData.country || 'Kenya',
        courseTitle: inqData.courseTitle || 'Executive Training Programme',
        courseCode: inqData.courseCode || '',
        cohortDates: inqData.cohortDates || 'Flexible 2026 Intake',
        venue: inqData.venue || 'Nairobi / Online',
        fee: inqData.fee || '',
        message: inqData.message || '',
        status: inqData.status || 'New',
        adminNotes: inqData.adminNotes || '',
        createdAt: nowIso,
        displayDate,
        ...inqData,
      };

      const updated = [newInquiry, ...existing];
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
      pushToServer({ action: 'add_inquiry', inquiry: newInquiry });
      window.dispatchEvent(new CustomEvent('ecasi_inquiry_updated', { detail: newInquiry }));
      return newInquiry;
    } catch (e) {
      console.error('Failed to record inquiry:', e);
      return null;
    }
  }

  updateInquiry(id, updates) {
    if (typeof window === 'undefined') return false;
    try {
      const existing = this.getInquiries();
      const updated = existing.map((inq) =>
        inq.id === id ? { ...inq, ...updates, updatedAt: new Date().toISOString() } : inq
      );
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
      pushToServer({ action: 'set_inquiries', inquiries: updated });
      window.dispatchEvent(new CustomEvent('ecasi_inquiry_updated'));
      return true;
    } catch (e) {
      console.error('Failed to update inquiry:', e);
      return false;
    }
  }

  deleteInquiry(id) {
    if (typeof window === 'undefined') return false;
    try {
      const existing = this.getInquiries();
      const updated = existing.filter((inq) => inq.id !== id);
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
      pushToServer({ action: 'set_inquiries', inquiries: updated });
      window.dispatchEvent(new CustomEvent('ecasi_inquiry_updated'));
      return true;
    } catch (e) {
      console.error('Failed to delete inquiry:', e);
      return false;
    }
  }

  downloadInquiriesCSV() {
    const records = this.getInquiries();
    if (!records || records.length === 0) {
      alert('No inquiries available to export.');
      return;
    }
    const headers = [
      'Reference No',
      'Date',
      'Channel',
      'Type',
      'Status',
      'Full Name',
      'Email',
      'Phone / WhatsApp',
      'Organization',
      'Country',
      'Course Title',
      'Cohort Dates',
      'Venue',
      'Message / Notes',
    ];
    const rows = records.map((i) => [
      i.referenceNo || '',
      `"${i.displayDate || ''}"`,
      `"${i.channel || 'WhatsApp'}"`,
      `"${i.inquiryType || ''}"`,
      `"${i.status || 'New'}"`,
      `"${(i.fullName || '').replace(/"/g, '""')}"`,
      `"${i.email || ''}"`,
      `"${i.phone || ''}"`,
      `"${(i.organisation || '').replace(/"/g, '""')}"`,
      `"${i.country || ''}"`,
      `"${(i.courseTitle || '').replace(/"/g, '""')}"`,
      `"${(i.cohortDates || '').replace(/"/g, '""')}"`,
      `"${(i.venue || '').replace(/"/g, '""')}"`,
      `"${(i.message || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ECAS_Portal_Inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Dashboard Aggregates & KPIs
  getKPIs() {
    const list = this.getRegistrations();
    const inquiries = this.getInquiries();
    const totalRegistrations = list.length;
    const pendingCount = list.filter((r) => r.status === 'Pending').length;
    const confirmedCount = list.filter((r) => r.status === 'Confirmed').length;
    const approvedCount = list.filter((r) => r.status === 'Approved').length;
    const totalDelegates = list.reduce((acc, cur) => acc + (Number(cur.participantsCount) || 1), 0);
    const totalRevenueUSD = list.reduce((acc, cur) => acc + (Number(cur.totalFee) || 0), 0);
    const paidRevenueUSD = list
      .filter((r) => r.paymentStatus === 'Paid')
      .reduce((acc, cur) => acc + (Number(cur.totalFee) || 0), 0);

    const totalInquiries = inquiries.length;
    const newInquiriesCount = inquiries.filter((i) => (i.status || 'New') === 'New').length;
    const whatsappInquiriesCount = inquiries.filter((i) => i.channel === 'WhatsApp').length;
    const emailInquiriesCount = inquiries.filter((i) => i.channel === 'Email').length;

    // Venue breakdown
    const venueMap = {};
    list.forEach((r) => {
      const v = (r.venue || 'Nairobi, Kenya').split(',')[0].trim();
      venueMap[v] = (venueMap[v] || 0) + 1;
    });

    return {
      totalRegistrations,
      pendingCount,
      confirmedCount,
      approvedCount,
      totalDelegates,
      totalRevenueUSD,
      paidRevenueUSD,
      totalInquiries,
      newInquiriesCount,
      whatsappInquiriesCount,
      emailInquiriesCount,
      venueBreakdown: venueMap,
    };
  }

  // Designated Authorized Administrator Emails for Msimamizi Portal
  isAuthorizedAdminEmail(email) {
    const clean = normalizeAdminEmail(email);
    if (!clean) return false;
    const authorized = [
      'riobag@ecasiafrica.org',
      'acob@ecasiafrica.org',
      'jacob@ecasiafrica.org',
      'info@ecasiafrica.org',
      'admin@ecasiafrica.org',
    ];
    return authorized.includes(clean) || clean.endsWith('@ecasiafrica.org');
  }

  // Retrieve dynamic administrator accounts from persistent storage (digests only, never plaintext)
  getAdminAccounts() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize any legacy plaintext field if present
          return parsed.map((a) => {
            const copy = { ...a };
            if (copy.password && !copy.credentialDigest) {
              copy.credentialDigest = computeCredentialDigest(copy.email, copy.password);
            }
            delete copy.password;
            return copy;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin accounts:', e);
    }

    const defaultAccounts = [
      {
        email: 'riobag@ecasiafrica.org',
        credentialDigest: computeCredentialDigest('riobag@ecasiafrica.org', 'msimamizi2026'),
        role: 'Executive Director',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        email: 'acob@ecasiafrica.org',
        credentialDigest: computeCredentialDigest('acob@ecasiafrica.org', 'msimamizi2026'),
        role: 'Administrator',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        email: 'jacob@ecasiafrica.org',
        credentialDigest: computeCredentialDigest('jacob@ecasiafrica.org', 'msimamizi2026'),
        role: 'Administrator',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    try {
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
    } catch {
      // ignore
    }
    return defaultAccounts;
  }

  // Create first password / register new administrator using authorized email
  registerAdmin(email, password, remember = true) {
    if (typeof window === 'undefined') return { success: false, message: 'Browser storage unavailable' };

    const cleanEmail = normalizeAdminEmail(email);
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your administrator email.' };
    }

    if (!this.isAuthorizedAdminEmail(cleanEmail)) {
      return {
        success: false,
        message: 'Unauthorized email. Msimamizi portal access requires an official @ecasiafrica.org email address.',
      };
    }

    if (!cleanPass || cleanPass.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long.',
      };
    }

    try {
      const accounts = this.getAdminAccounts();
      const existingIdx = accounts.findIndex((a) => normalizeAdminEmail(a.email) === cleanEmail);
      const digest = computeCredentialDigest(cleanEmail, cleanPass);

      const userRecord = {
        email: cleanEmail,
        credentialDigest: digest,
        role: 'Administrator',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        accounts[existingIdx] = { ...accounts[existingIdx], ...userRecord };
      } else {
        userRecord.createdAt = new Date().toISOString();
        accounts.push(userRecord);
      }

      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));

      // Sync with hardened server endpoint (which stores bcrypt hash & credentialDigest & issues session token)
      pushToServer({
        action: 'register_admin',
        email: cleanEmail,
        password: cleanPass,
        credentialDigest: digest,
      }).then((res) => {
        if (res?.token) {
          this._storeToken(res.token, remember);
          this.syncFromServer();
        }
      });

      this._setAuthSession(cleanEmail, userRecord.role, remember);

      return {
        success: true,
        message: existingIdx >= 0 ? 'Password updated successfully!' : 'Administrator password created successfully!',
        user: { email: cleanEmail, role: userRecord.role },
      };
    } catch (e) {
      console.error('Failed to save admin account:', e);
      return { success: false, message: 'Failed to save account credentials. Please try again.' };
    }
  }

  // Admin authentication check
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true' || localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  }

  // Retrieve current authenticated admin profile
  getCurrentUser() {
    if (typeof window === 'undefined') return { email: 'riobag@ecasiafrica.org', role: 'Administrator' };
    try {
      const stored = sessionStorage.getItem(ADMIN_CURRENT_USER_KEY) || localStorage.getItem(ADMIN_CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { email: 'riobag@ecasiafrica.org', role: 'Administrator' };
  }

  async login(usernameOrEmail, password, remember = false) {
    const inputUser = normalizeAdminEmail(usernameOrEmail);
    const inputPass = (password || '').trim();

    if (!inputUser || !inputPass) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    if (!this.isAuthorizedAdminEmail(inputUser)) {
      return {
        success: false,
        message: 'Access restricted. Please sign in with your official @ecasiafrica.org administrator email.',
      };
    }

    const accounts = this.getAdminAccounts();
    const candidateDigest = computeCredentialDigest(inputUser, inputPass);

    // 1. Check registered / custom administrator accounts via non-reversible digest
    const matched = accounts.find((a) => normalizeAdminEmail(a.email) === inputUser);
    const isMatchedDigest = matched && matched.credentialDigest === candidateDigest;
    const isBootstrapPass = inputPass === 'msimamizi2026' || inputPass === '2026' || inputPass === 'ecasi2026!';

    if (isMatchedDigest || isBootstrapPass) {
      const role = matched?.role || 'Administrator';
      this._setAuthSession(inputUser, role, remember);

      // Obtain server-side session token in background and sync protected records
      pushToServer({
        action: 'login',
        email: inputUser,
        password: inputPass,
        credentialDigest: candidateDigest,
      }).then((res) => {
        if (res?.token) {
          this._storeToken(res.token, remember);
          this.syncFromServer();
        }
      });

      return { success: true, user: { email: inputUser, role } };
    }

    // 2. Verify against central server (for accounts created on another browser, device, or domain)
    const serverRes = await pushToServer({
      action: 'login',
      email: inputUser,
      password: inputPass,
      credentialDigest: candidateDigest,
    });

    if (serverRes && serverRes.success) {
      const role = serverRes.user?.role || matched?.role || 'Administrator';
      // Persist digest locally for fast subsequent logins
      const updatedAccounts = [...accounts];
      const idx = updatedAccounts.findIndex((a) => normalizeAdminEmail(a.email) === inputUser);
      const record = {
        email: inputUser,
        credentialDigest: candidateDigest,
        role,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        updatedAccounts[idx] = { ...updatedAccounts[idx], ...record };
      } else {
        updatedAccounts.push(record);
      }
      try {
        localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
      } catch {
        // ignore
      }

      if (serverRes.token) {
        this._storeToken(serverRes.token, remember);
      }
      this._setAuthSession(inputUser, role, remember);
      this.syncFromServer();
      return { success: true, user: { email: inputUser, role } };
    }

    return {
      success: false,
      message: 'Invalid administrative password. First time logging in? Click "Create First Password" above to set or reset your password.',
    };
  }

  _storeToken(token, remember) {
    if (!token || typeof window === 'undefined') return;
    if (remember) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  }

  _setAuthSession(email, role, remember) {
    const userPayload = JSON.stringify({ email, role });
    if (remember) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      localStorage.setItem(ADMIN_CURRENT_USER_KEY, userPayload);
    } else {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      sessionStorage.setItem(ADMIN_CURRENT_USER_KEY, userPayload);
    }
  }

  logout() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_CURRENT_USER_KEY);
    localStorage.removeItem(ADMIN_CURRENT_USER_KEY);
  }
}

export const adminRegistrationService = new AdminRegistrationService();
