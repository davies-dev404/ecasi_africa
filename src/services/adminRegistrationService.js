// ECAS Institute - Msimamizi Administrative Service
// Real-time persistent data service for Course Registrations, Corporate Quotes & Portal Analytics

const STORAGE_KEY = 'ecasi_course_registrations_live';
const ADMIN_AUTH_KEY = 'ecasi_msimamizi_auth';
const ADMIN_ACCOUNTS_KEY = 'ecasi_msimamizi_accounts';
const ADMIN_CURRENT_USER_KEY = 'ecasi_msimamizi_user';

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
    } catch (e) {
      console.warn('LocalStorage error initializing admin registrations:', e);
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

  // Dashboard Aggregates & KPIs
  getKPIs() {
    const list = this.getRegistrations();
    const totalRegistrations = list.length;
    const pendingCount = list.filter((r) => r.status === 'Pending').length;
    const confirmedCount = list.filter((r) => r.status === 'Confirmed').length;
    const approvedCount = list.filter((r) => r.status === 'Approved').length;
    const totalDelegates = list.reduce((acc, cur) => acc + (Number(cur.participantsCount) || 1), 0);
    const totalRevenueUSD = list.reduce((acc, cur) => acc + (Number(cur.totalFee) || 0), 0);
    const paidRevenueUSD = list
      .filter((r) => r.paymentStatus === 'Paid')
      .reduce((acc, cur) => acc + (Number(cur.totalFee) || 0), 0);

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
      venueBreakdown: venueMap,
    };
  }

  // Retrieve dynamic administrator accounts from persistent storage
  getAdminAccounts() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse admin accounts:', e);
    }

    // Default pre-initialized test accounts for rapid testing
    const defaultAccounts = [
      {
        email: 'admin@ecasiafrica.org',
        password: 'msimamizi2026',
        role: 'Super Administrator',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        email: 'msimamizi@ecasiafrica.org',
        password: 'msimamizi2026',
        role: 'Registrar',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        email: 'director@ecasiafrica.org',
        password: 'msimamizi2026',
        role: 'Executive Director',
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

  // Create first password / register new administrator using @ecasiafrica.org email
  registerAdmin(email, password, remember = true) {
    if (typeof window === 'undefined') return { success: false, message: 'Browser storage unavailable' };

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your administrator email.' };
    }

    // Institutional Email Validation: Must end with @ecasiafrica.org or @ecasi.org
    if (!cleanEmail.endsWith('@ecasiafrica.org') && !cleanEmail.endsWith('@ecasi.org')) {
      return {
        success: false,
        message: 'Unauthorized domain. You must use an official institutional email ending with @ecasiafrica.org',
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
      const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);

      const userRecord = {
        email: cleanEmail,
        password: cleanPass,
        role: 'Administrator',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        // Update password for existing administrator
        accounts[existingIdx] = { ...accounts[existingIdx], ...userRecord };
      } else {
        // Register new administrator account
        userRecord.createdAt = new Date().toISOString();
        accounts.push(userRecord);
      }

      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));

      // Authenticate session immediately
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
    if (typeof window === 'undefined') return { email: 'admin@ecasiafrica.org', role: 'Administrator' };
    try {
      const stored = sessionStorage.getItem(ADMIN_CURRENT_USER_KEY) || localStorage.getItem(ADMIN_CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { email: 'admin@ecasiafrica.org', role: 'Administrator' };
  }

  login(usernameOrEmail, password, remember = false) {
    const inputUser = (usernameOrEmail || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    if (!inputUser || !inputPass) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    const accounts = this.getAdminAccounts();

    // 1. Check dynamically registered / custom administrator accounts
    const matched = accounts.find((a) => a.email.toLowerCase() === inputUser);
    if (matched && matched.password === inputPass) {
      this._setAuthSession(matched.email, matched.role || 'Administrator', remember);
      return { success: true, user: { email: matched.email, role: matched.role } };
    }

    // 2. Fallback testing logins (allows rapid testing with existing credentials)
    const testUsers = [
      'admin@ecasiafrica.org',
      'msimamizi@ecasiafrica.org',
      'director@ecasiafrica.org',
      'admin@ecasi.org',
      'msimamizi@ecasi.org',
      'admin',
    ];
    const testPasswords = ['msimamizi2026', '2026', 'ecasi2026!', 'admin123'];

    if (testUsers.includes(inputUser) && testPasswords.includes(inputPass)) {
      const activeEmail = inputUser.includes('@') ? inputUser : `${inputUser}@ecasiafrica.org`;
      this._setAuthSession(activeEmail, 'Administrator', remember);
      return { success: true, user: { email: activeEmail, role: 'Administrator' } };
    }

    return {
      success: false,
      message: 'Invalid administrative email or password. First time logging in? Click "Create First Password" below.',
    };
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
    sessionStorage.removeItem(ADMIN_CURRENT_USER_KEY);
    localStorage.removeItem(ADMIN_CURRENT_USER_KEY);
  }
}

export const adminRegistrationService = new AdminRegistrationService();
