// ECASIAFRICA Msimamizi — Enterprise Institutional Management Service
// Manages RBAC, Finance (Invoices, Payments, Reconciliation), Cohorts, Communications,
// Website CMS, Platform Settings, Audit Logs, System Health & Integrated Workflows.

import {
  adminRegistrationService,
  getStoredAdminToken,
  getSyncUrl,
  normalizeAdminEmail,
  isSuperAdminEmail,
  isValidInstitutionalEmail,
  computeCredentialDigest,
} from '@/services/adminRegistrationService';

export const ENTERPRISE_KEYS = {
  INVOICES: 'ecasi_msimamizi_invoices_v1',
  PAYMENTS: 'ecasi_msimamizi_payments_v1',
  COHORTS: 'ecasi_msimamizi_cohorts_v1',
  COMMUNICATIONS: 'ecasi_msimamizi_communications_v1',
  TEMPLATES: 'ecasi_msimamizi_templates_v1',
  ANNOUNCEMENTS: 'ecasi_msimamizi_announcements_v1',
  CMS: 'ecasi_msimamizi_cms_v1',
  SETTINGS: 'ecasi_msimamizi_settings_v1',
  AUDIT: 'ecasi_msimamizi_audit_events_v1',
};

// ─── Role-Based Access Control (RBAC) ─────────────────────────────────────────
export const ROLE_CATALOG = [
  {
    id: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Full institutional access across admissions, finance, academic, recruitment, CMS, staff permissions, and system health.',
    permissions: ['*'],
    badgeColor: 'bg-emerald-100 text-[#032e42] border-emerald-300',
  },
  {
    id: 'ADMISSIONS_OFFICER',
    label: 'Admissions Officer',
    description: 'Manage registrations, applicant profiles, 12-stage enrolment workflows, documents, leads, and admissions reports.',
    permissions: [
      'dashboard.view', 'admissions.view', 'admissions.write',
      'crm.view', 'crm.write', 'courses.view',
      'communications.view', 'communications.write', 'reports.view', 'reports.export',
    ],
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
  },
  {
    id: 'FINANCE_OFFICER',
    label: 'Finance Officer',
    description: 'Manage invoices, payment verification, outstanding balances, financial reconciliation, and financial reports.',
    permissions: [
      'dashboard.view', 'admissions.view', 'finance.view', 'finance.write',
      'courses.view', 'communications.view', 'communications.write',
      'reports.view', 'reports.export',
    ],
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  {
    id: 'COURSE_MANAGER',
    label: 'Course Manager',
    description: 'Manage courses, categories, training destinations, cohorts, fees/pricing, and public website academic content.',
    permissions: [
      'dashboard.view', 'courses.view', 'courses.write',
      'cms.view', 'cms.write', 'reports.view', 'reports.export',
    ],
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  },
  {
    id: 'RECRUITMENT_OFFICER',
    label: 'Recruitment Officer',
    description: 'Manage job vacancies, posters, candidate CVs, shortlisting, interviews, and recruitment reports.',
    permissions: [
      'dashboard.view', 'recruitment.view', 'recruitment.write',
      'communications.view', 'communications.write', 'reports.view', 'reports.export',
    ],
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    id: 'SUPPORT_OFFICER',
    label: 'Support Officer',
    description: 'Handle website/WhatsApp/email inquiries, CRM lead follow-ups, and delegate communications.',
    permissions: [
      'dashboard.view', 'admissions.view', 'crm.view', 'crm.write',
      'communications.view', 'communications.write', 'reports.view',
    ],
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200',
  },
  {
    id: 'REPORTS_VIEWER',
    label: 'Reports Viewer',
    description: 'Read-only access to institutional dashboards, analytics, and authorized report exports.',
    permissions: [
      'dashboard.view', 'admissions.view', 'crm.view', 'courses.view',
      'finance.view', 'recruitment.view', 'reports.view', 'reports.export',
    ],
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
];

export function normalizeRole(rawRole) {
  const r = String(rawRole || '').trim().toUpperCase();
  const map = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    'SUPER ADMIN': 'SUPER_ADMIN',
    'EXECUTIVE DIRECTOR': 'SUPER_ADMIN',
    ADMINISTRATOR: 'SUPER_ADMIN',
    ADMIN: 'SUPER_ADMIN',
    ADMISSIONS_OFFICER: 'ADMISSIONS_OFFICER',
    'ADMISSIONS OFFICER': 'ADMISSIONS_OFFICER',
    FINANCE_OFFICER: 'FINANCE_OFFICER',
    'FINANCE OFFICER': 'FINANCE_OFFICER',
    COURSE_MANAGER: 'COURSE_MANAGER',
    'COURSE MANAGER': 'COURSE_MANAGER',
    RECRUITMENT_OFFICER: 'RECRUITMENT_OFFICER',
    'RECRUITMENT OFFICER': 'RECRUITMENT_OFFICER',
    SUPPORT_OFFICER: 'SUPPORT_OFFICER',
    'SUPPORT OFFICER': 'SUPPORT_OFFICER',
    REPORTS_VIEWER: 'REPORTS_VIEWER',
    'REPORTS VIEWER': 'REPORTS_VIEWER',
  };
  return map[r] || 'SUPER_ADMIN';
}

export function getRoleDefinition(rawRole) {
  const id = normalizeRole(rawRole);
  return ROLE_CATALOG.find((r) => r.id === id) || ROLE_CATALOG[0];
}

export function hasPermission(user, permission) {
  if (!permission) return true;
  const def = getRoleDefinition(user?.role);
  return def.permissions.includes('*') || def.permissions.includes(permission);
}

// ─── Institutional Workflow Constants ─────────────────────────────────────────
export const ADMISSION_STAGES = [
  'Application Received',
  'Under Review',
  'Documents Required',
  'Approved',
  'Invoice Issued',
  'Payment Pending',
  'Payment Confirmed',
  'Enrolment Confirmed',
  'Training In Progress',
  'Completed',
  'Rejected',
  'Withdrawn',
];

export const LEAD_PIPELINE_STAGES = [
  'New Lead',
  'Contacted',
  'Interested',
  'Follow-up',
  'Application Started',
  'Converted',
  'Closed',
];

export const LEAD_SOURCES = [
  'Website',
  'WhatsApp',
  'Email',
  'Telephone',
  'Social Media',
  'Manual Registration',
];

export const RECRUITMENT_STAGES = [
  'Application Received',
  'Screening',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
];

export const PAYMENT_METHODS = [
  'Bank Transfer (SWIFT / RTGS)',
  'M-Pesa Paybill / Till',
  'Institutional LPO / Cheque',
  'Card / Online Gateway',
  'Cash Receipt',
];

export function mapWorkflowStageToLegacyStatus(stage) {
  const map = {
    'Application Received': 'Pending',
    'Under Review': 'Under Review',
    'Documents Required': 'Documents Required',
    Approved: 'Approved',
    'Invoice Issued': 'Approved',
    'Payment Pending': 'Approved',
    'Payment Confirmed': 'Confirmed',
    'Enrolment Confirmed': 'Confirmed',
    'Training In Progress': 'Training In Progress',
    Completed: 'Completed',
    Rejected: 'Rejected',
    Withdrawn: 'Withdrawn',
  };
  return map[stage] || 'Pending';
}

export function getEffectiveRegistrationStage(reg) {
  if (reg?.workflowStage && ADMISSION_STAGES.includes(reg.workflowStage)) {
    return reg.workflowStage;
  }
  const st = reg?.status || 'Pending';
  if (st === 'Confirmed') return 'Enrolment Confirmed';
  if (st === 'Completed') return 'Completed';
  if (st === 'Approved') return reg?.paymentStatus === 'Invoiced' ? 'Invoice Issued' : 'Approved';
  if (st === 'Cancelled') return 'Withdrawn';
  if (ADMISSION_STAGES.includes(st)) return st;
  return 'Application Received';
}

export function normalizeLeadStatus(rawStatus) {
  const s = String(rawStatus || 'New Lead').trim();
  if (s === 'New') return 'New Lead';
  if (s === 'Archived') return 'Closed';
  if (LEAD_PIPELINE_STAGES.includes(s)) return s;
  return 'New Lead';
}

export function normalizeCandidateStage(rawStatus) {
  const s = String(rawStatus || 'Application Received').trim();
  if (s === 'New') return 'Application Received';
  if (s === 'Hired') return 'Selected';
  if (s === 'Archived') return 'Rejected';
  if (RECRUITMENT_STAGES.includes(s)) return s;
  return 'Application Received';
}

// ─── Storage & Server Sync Helpers ────────────────────────────────────────────
function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Storage write failed for ${key}:`, e);
    return false;
  }
}

async function postEnterpriseAction(payload) {
  if (typeof window === 'undefined') return { unreachable: true };
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return { unreachable: true, localDev: true };
  }
  try {
    const token = getStoredAdminToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['X-Admin-Token'] = token;
    const res = await fetch(getSyncUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return { unreachable: true, status: res.status };
    const data = await res.json();
    return { unreachable: false, ok: res.ok, status: res.status, data };
  } catch {
    return { unreachable: true };
  }
}

function notifyEnterpriseUpdate(topic) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ecasi_enterprise_updated', { detail: { topic } }));
  }
}

// ─── Default Reusable Configurations (Never fake registrations/revenue) ───────
const DEFAULT_SETTINGS = {
  institutionName: 'ECAS Institute (ECASIAFRICA)',
  shortName: 'ECAS Institute',
  tagline: 'Environment | Energy | Climate Action',
  officialEmail: 'info@ecasiafrica.org',
  admissionsEmail: 'admissions@ecasiafrica.org',
  financeEmail: 'finance@ecasiafrica.org',
  whatsappNumber: '+254722000000',
  phone: '+254-722-000-000',
  address: 'Nairobi, Kenya',
  defaultCurrency: 'USD',
  usdToKesRate: 130,
  invoicePaymentTermsDays: 14,
  bankDetails: 'Account Name: Environmental Capacities and Sustainability Institute (ECAS)\nCurrency: USD / KES\nContact finance@ecasiafrica.org for official wire instructions.',
  mpesaPaybill: 'Contact finance desk for verified Paybill reference',
  emailNotificationsEnabled: true,
  whatsappNotificationsEnabled: true,
  autoInvoiceOnApproval: false,
};

const DEFAULT_TEMPLATES = [
  {
    id: 'TPL-ADM-CONF',
    name: 'Admission Confirmation & Welcome',
    channel: 'Email',
    category: 'Admissions',
    subject: 'ECAS Institute — Admission Confirmation ({{courseTitle}})',
    body: 'Dear {{name}},\n\nWe are pleased to confirm your admission to the ECAS Institute Executive Training Programme: {{courseTitle}}.\n\nCohort / Venue: {{venue}}\nReference Number: {{referenceNo}}\n\nOur admissions desk will share joining instructions and pre-course reading materials prior to commencement.\n\nWarm regards,\nAdmissions Office, ECAS Institute',
  },
  {
    id: 'TPL-FIN-INV',
    name: 'Proforma Invoice Issued',
    channel: 'Email',
    category: 'Finance',
    subject: 'ECAS Institute — Official Invoice {{invoiceNo}}',
    body: 'Dear {{name}},\n\nPlease find your official training invoice ({{invoiceNo}}) for {{courseTitle}}.\n\nNet Amount Due: {{currency}} {{amount}}\nPayment Due Date: {{dueDate}}\n\nKindly share your remittance advice once payment is completed so our Finance Desk can issue your official receipt.\n\nRegards,\nFinance Department, ECAS Institute',
  },
  {
    id: 'TPL-FIN-REC',
    name: 'Payment Confirmation & Enrolment Receipt',
    channel: 'Email',
    category: 'Finance',
    subject: 'ECAS Institute — Payment Confirmed ({{reference}})',
    body: 'Dear {{name}},\n\nThis confirms receipt and verification of your payment ({{currency}} {{amount}}, Ref: {{reference}}) towards {{courseTitle}}.\n\nYour enrolment is now confirmed. We look forward to welcoming you.\n\nRegards,\nFinance & Admissions, ECAS Institute',
  },
  {
    id: 'TPL-CRM-FUP',
    name: 'Lead Follow-up Reminder',
    channel: 'WhatsApp',
    category: 'CRM',
    subject: 'Follow-up on {{courseTitle}}',
    body: 'Hello {{name}}, greetings from ECAS Institute. Following up on your inquiry regarding {{courseTitle}} ({{venue}}). Let us know if you need a proforma invoice or tailored institutional proposal.',
  },
  {
    id: 'TPL-REC-INT',
    name: 'Candidate Shortlist & Interview Invitation',
    channel: 'Email',
    category: 'Recruitment',
    subject: 'ECAS Institute Careers — Interview Invitation ({{jobTitle}})',
    body: 'Dear {{name}},\n\nThank you for applying for the position of {{jobTitle}} at ECAS Institute. We are pleased to inform you that your application has been shortlisted.\n\nPlease reply with your availability for an interview panel session.\n\nBest regards,\nHuman Resources & Recruitment Desk, ECAS Institute',
  },
];

const DEFAULT_CMS_SECTIONS = {
  homepage: {
    title: 'Empowering Africa Through Executive Training & Policy Advisory',
    subtitle: 'NITA & NEMA accredited Pan-African institute delivering 200+ practical short courses across Climate Finance, PFM, ESG, Carbon Markets, Governance & AI.',
    body: 'ECAS Institute delivers executive capacity building across Nairobi, Mombasa, Kigali, Arusha, Dubai, Kuala Lumpur, and Interactive Online cohorts.',
    ctaLabel: 'Explore 2026 Programmes',
    ctaUrl: '/institute-overview',
    status: 'Published',
    items: [],
    revisions: [],
  },
  programmes: {
    title: 'Six Thematic Executive Training Faculties',
    subtitle: 'Practical, case-study driven capacity development designed for public sector leaders, DFIs, NGOs, and corporate teams.',
    body: '1. Climate Finance & Public Financial Management\n2. Governance, Leadership & Public Sector Transformation\n3. Carbon Markets, ESG & Corporate Sustainability\n4. Environment, Climate Change & Sustainability\n5. Data, AI, IT & Cybersecurity\n6. Project Management, Procurement & M&E',
    ctaLabel: 'Download Training Calendar',
    ctaUrl: '/institute-overview',
    status: 'Published',
    items: [],
    revisions: [],
  },
  application_instructions: {
    title: 'How to Register for ECAS Executive Training',
    subtitle: 'Simple institutional & individual online registration with instant proforma invoicing.',
    body: 'Step 1: Select your course and preferred destination/cohort.\nStep 2: Complete the online registration form at ecasiafrica.org/register.\nStep 3: Receive your official proforma invoice and confirm attendance.',
    ctaLabel: 'Register Online',
    ctaUrl: '/register',
    status: 'Published',
    items: [],
    revisions: [],
  },
  faqs: {
    title: 'Frequently Asked Questions',
    subtitle: 'Accreditation, NITA reimbursement, venues, and group sponsorship details.',
    body: 'Q: Is ECAS Institute NITA accredited?\nA: Yes, ECAS Institute is accredited by NITA and NEMA.\n\nQ: Can organizations request in-house training?\nA: Yes, we deliver tailored in-house programmes globally.',
    ctaLabel: 'Contact Admissions',
    ctaUrl: '/contact',
    status: 'Published',
    items: [],
    revisions: [],
  },
  contact_info: {
    title: 'ECAS Institute Admissions & Advisory Desk',
    subtitle: 'Reach our Nairobi headquarters for proforma invoices, corporate delegations, and advisory partnerships.',
    body: 'Email: info@ecasiafrica.org\nPhone: +254-722-000-000\nLocation: Nairobi, Kenya',
    ctaLabel: 'Send Inquiry',
    ctaUrl: '/contact',
    status: 'Published',
    items: [],
    revisions: [],
  },
};

// ─── Enterprise Service API ───────────────────────────────────────────────────
export const msimamiziEnterpriseService = {
  // Hydrate all new collections from server response (called by adminRegistrationService.syncFromServer)
  hydrateFromServerData(data) {
    if (!data || typeof data !== 'object') return;
    if (Array.isArray(data.invoices)) writeJson(ENTERPRISE_KEYS.INVOICES, data.invoices);
    if (Array.isArray(data.payments)) writeJson(ENTERPRISE_KEYS.PAYMENTS, data.payments);
    if (Array.isArray(data.cohorts)) writeJson(ENTERPRISE_KEYS.COHORTS, data.cohorts);
    if (Array.isArray(data.communications)) writeJson(ENTERPRISE_KEYS.COMMUNICATIONS, data.communications);
    if (Array.isArray(data.templates) && data.templates.length > 0) writeJson(ENTERPRISE_KEYS.TEMPLATES, data.templates);
    if (Array.isArray(data.announcements)) writeJson(ENTERPRISE_KEYS.ANNOUNCEMENTS, data.announcements);
    if (data.cmsContent && typeof data.cmsContent === 'object' && Object.keys(data.cmsContent).length > 0) {
      writeJson(ENTERPRISE_KEYS.CMS, { ...DEFAULT_CMS_SECTIONS, ...data.cmsContent });
    }
    if (data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0) {
      writeJson(ENTERPRISE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...data.settings });
    }
    if (Array.isArray(data.auditEvents)) writeJson(ENTERPRISE_KEYS.AUDIT, data.auditEvents);
    notifyEnterpriseUpdate('server_sync');
  },

  // ─── Immutable Audit Log (Append-Only) ──────────────────────────────────────
  getAuditEvents() {
    const list = readJson(ENTERPRISE_KEYS.AUDIT, []);
    return Array.isArray(list) ? list : [];
  },

  logAudit(actor, action, entityType, affectedRecord = '', previousValue = '', newValue = '', syncToServer = true) {
    const email = actor?.email || adminRegistrationService.getCurrentUser()?.email || 'system';
    const role = normalizeRole(actor?.role || adminRegistrationService.getCurrentUser()?.role);
    const event = {
      id: `AUD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      administrator: email,
      role,
      action,
      entityType,
      affectedRecord: String(affectedRecord || ''),
      previousValue: String(previousValue || ''),
      newValue: String(newValue || ''),
      ip: 'Client Session',
      timestamp: new Date().toISOString(),
    };
    const existing = this.getAuditEvents();
    const updated = [event, ...existing].slice(0, 5000);
    writeJson(ENTERPRISE_KEYS.AUDIT, updated);
    if (syncToServer) {
      postEnterpriseAction({
        action: 'log_audit_event',
        eventAction: action,
        entityType,
        affectedRecord: event.affectedRecord,
        previousValue: event.previousValue,
        newValue: event.newValue,
      });
    }
    notifyEnterpriseUpdate('audit');
    return event;
  },

  // ─── Invoices ───────────────────────────────────────────────────────────────
  getInvoices() {
    const list = readJson(ENTERPRISE_KEYS.INVOICES, []);
    return Array.isArray(list) ? list : [];
  },

  saveInvoices(list, auditMeta = null) {
    const clean = Array.isArray(list) ? list : [];
    writeJson(ENTERPRISE_KEYS.INVOICES, clean);
    postEnterpriseAction({ action: 'set_invoices', invoices: clean, audit: auditMeta });
    notifyEnterpriseUpdate('invoices');
    return clean;
  },

  createInvoice(invoiceInput, actor) {
    const existing = this.getInvoices();
    const year = new Date().getFullYear();
    const seq = String(existing.length + 1).padStart(4, '0');
    const amount = Math.max(0, Number(invoiceInput.amount) || 0);
    const additionalCharges = Math.max(0, Number(invoiceInput.additionalCharges) || 0);
    const discount = Math.max(0, Number(invoiceInput.discount) || 0);
    const netAmount = Math.max(0, amount + additionalCharges - discount);
    const settings = this.getSettings();
    const defaultDue = new Date(Date.now() + (Number(settings.invoicePaymentTermsDays) || 14) * 86400000)
      .toISOString()
      .split('T')[0];

    const record = {
      id: `INV-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNo: invoiceInput.invoiceNo || `ECAS-INV-${year}-${seq}`,
      registrationId: invoiceInput.registrationId || '',
      applicantName: (invoiceInput.applicantName || '').trim(),
      applicantEmail: (invoiceInput.applicantEmail || '').trim(),
      organisation: (invoiceInput.organisation || '').trim(),
      courseTitle: (invoiceInput.courseTitle || '').trim(),
      courseSlug: invoiceInput.courseSlug || '',
      cohortName: invoiceInput.cohortName || '',
      destination: invoiceInput.destination || 'Nairobi, Kenya',
      currency: invoiceInput.currency || settings.defaultCurrency || 'USD',
      amount,
      additionalCharges,
      discount,
      netAmount,
      paidAmount: 0,
      balance: netAmount,
      paymentPlan: invoiceInput.paymentPlan || 'Full Payment',
      dueDate: invoiceInput.dueDate || defaultDue,
      status: invoiceInput.status || 'Issued',
      notes: (invoiceInput.notes || '').trim(),
      issuedBy: actor?.email || adminRegistrationService.getCurrentUser()?.email || 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [record, ...existing];
    this.saveInvoices(updated, {
      action: 'CREATE_INVOICE',
      record: `${record.invoiceNo} (${record.applicantName})`,
      previousValue: '',
      newValue: `${record.currency} ${record.netAmount}`,
    });
    this.logAudit(actor, 'CREATE_INVOICE', 'Invoice', record.invoiceNo, '', `${record.currency} ${record.netAmount} for ${record.applicantName}`, false);

    // Integrated Workflow: automatically mark linked registration as Invoice Issued
    if (record.registrationId) {
      this.updateRegistrationWorkflow(
        record.registrationId,
        'Invoice Issued',
        `Invoice ${record.invoiceNo} issued (${record.currency} ${record.netAmount}).`,
        actor,
        { paymentStatus: 'Invoiced' }
      );
    }
    return record;
  },

  updateInvoice(id, updates, actor) {
    const existing = this.getInvoices();
    const prev = existing.find((i) => i.id === id);
    const updated = existing.map((inv) => {
      if (inv.id !== id) return inv;
      const merged = { ...inv, ...updates, updatedAt: new Date().toISOString() };
      const net = Math.max(0, (Number(merged.amount) || 0) + (Number(merged.additionalCharges) || 0) - (Number(merged.discount) || 0));
      const paid = Math.max(0, Number(merged.paidAmount) || 0);
      merged.netAmount = net;
      merged.balance = Math.max(0, net - paid);
      return merged;
    });
    this.saveInvoices(updated, {
      action: 'UPDATE_INVOICE',
      record: prev?.invoiceNo || id,
      previousValue: prev?.status || '',
      newValue: updates.status || 'Updated',
    });
    this.logAudit(actor, 'UPDATE_INVOICE', 'Invoice', prev?.invoiceNo || id, prev?.status || '', updates.status || 'Updated', false);
    return updated.find((i) => i.id === id);
  },

  // ─── Payments & Reconciliation ──────────────────────────────────────────────
  getPayments() {
    const list = readJson(ENTERPRISE_KEYS.PAYMENTS, []);
    return Array.isArray(list) ? list : [];
  },

  savePayments(list, auditMeta = null) {
    const clean = Array.isArray(list) ? list : [];
    writeJson(ENTERPRISE_KEYS.PAYMENTS, clean);
    postEnterpriseAction({ action: 'set_payments', payments: clean, audit: auditMeta });
    notifyEnterpriseUpdate('payments');
    return clean;
  },

  recordPayment(paymentInput, actor) {
    const ref = String(paymentInput.reference || '').trim();
    const amt = Math.max(0, Number(paymentInput.amount) || 0);
    if (!ref) {
      return { success: false, error: 'A supporting payment transaction reference is mandatory.' };
    }
    if (amt <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    const existingPayments = this.getPayments();
    const isDuplicateRef = existingPayments.some(
      (p) => p.reference && p.reference.toLowerCase() === ref.toLowerCase() && p.status !== 'Failed'
    );

    const invoices = this.getInvoices();
    const linkedInvoice = invoices.find((inv) => inv.id === paymentInput.invoiceId);

    let reconciliationStatus = 'Unmatched';
    if (isDuplicateRef) {
      reconciliationStatus = 'Duplicate';
    } else if (linkedInvoice) {
      reconciliationStatus = amt > linkedInvoice.balance + 0.01 ? 'Discrepancy' : 'Matched';
    }

    const record = {
      id: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      reference: ref,
      invoiceId: linkedInvoice?.id || paymentInput.invoiceId || '',
      invoiceNo: linkedInvoice?.invoiceNo || paymentInput.invoiceNo || '',
      registrationId: linkedInvoice?.registrationId || paymentInput.registrationId || '',
      applicantName: linkedInvoice?.applicantName || paymentInput.applicantName || '',
      amount: amt,
      currency: paymentInput.currency || linkedInvoice?.currency || 'USD',
      method: paymentInput.method || 'Bank Transfer (SWIFT / RTGS)',
      transactionDate: paymentInput.transactionDate || new Date().toISOString().split('T')[0],
      status: paymentInput.status || 'Verified',
      reconciliationStatus,
      supportingNote: (paymentInput.supportingNote || '').trim(),
      verifiedBy: actor?.email || adminRegistrationService.getCurrentUser()?.email || 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPayments = [record, ...existingPayments];
    this.savePayments(updatedPayments, {
      action: 'VERIFY_PAYMENT',
      record: `${record.reference} (${record.invoiceNo || 'Direct'})`,
      previousValue: '',
      newValue: `${record.currency} ${record.amount} [${record.status}]`,
    });
    this.logAudit(actor, 'VERIFY_PAYMENT', 'Payment', record.reference, '', `${record.currency} ${record.amount} via ${record.method} (${record.reconciliationStatus})`, false);

    // Recalculate linked invoice totals & advance integrated Admissions workflow
    if (linkedInvoice && record.status === 'Verified') {
      const totalPaidForInv = updatedPayments
        .filter((p) => p.invoiceId === linkedInvoice.id && p.status === 'Verified')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const isFullyPaid = totalPaidForInv >= linkedInvoice.netAmount && linkedInvoice.netAmount > 0;
      const newInvStatus = isFullyPaid ? 'Paid' : totalPaidForInv > 0 ? 'Partially Paid' : linkedInvoice.status;

      this.updateInvoice(
        linkedInvoice.id,
        {
          paidAmount: totalPaidForInv,
          balance: Math.max(0, linkedInvoice.netAmount - totalPaidForInv),
          status: newInvStatus,
        },
        actor
      );

      if (linkedInvoice.registrationId) {
        this.updateRegistrationWorkflow(
          linkedInvoice.registrationId,
          isFullyPaid ? 'Enrolment Confirmed' : 'Payment Pending',
          `Verified payment ${record.reference} (${record.currency} ${record.amount}).`,
          actor,
          { paymentStatus: isFullyPaid ? 'Paid' : 'Partially Paid' }
        );
      }
    }

    return { success: true, record, isDuplicateRef };
  },

  updatePayment(id, updates, actor) {
    const existing = this.getPayments();
    const prev = existing.find((p) => p.id === id);
    const updated = existing.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    this.savePayments(updated, {
      action: 'RECONCILE_PAYMENT',
      record: prev?.reference || id,
      previousValue: `${prev?.status || ''}/${prev?.reconciliationStatus || ''}`,
      newValue: `${updates.status || prev?.status || ''}/${updates.reconciliationStatus || prev?.reconciliationStatus || ''}`,
    });
    this.logAudit(actor, 'RECONCILE_PAYMENT', 'Payment', prev?.reference || id, prev?.reconciliationStatus || '', updates.reconciliationStatus || updates.status || '', false);
    return updated;
  },

  runReconciliation() {
    const invoices = this.getInvoices();
    const payments = this.getPayments();
    const refCounts = {};
    payments.forEach((p) => {
      const r = (p.reference || '').trim().toLowerCase();
      if (r) refCounts[r] = (refCounts[r] || 0) + 1;
    });

    const duplicates = payments.filter((p) => {
      const r = (p.reference || '').trim().toLowerCase();
      return r && refCounts[r] > 1;
    });
    const unmatched = payments.filter((p) => !p.invoiceId || !invoices.some((i) => i.id === p.invoiceId));
    const discrepancies = invoices.filter((inv) => {
      const paidSum = payments
        .filter((p) => p.invoiceId === inv.id && p.status === 'Verified')
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);
      return paidSum > inv.netAmount + 0.01 || Math.abs((Number(inv.paidAmount) || 0) - paidSum) > 0.01;
    });

    const totalExpected = invoices
      .filter((i) => i.status !== 'Cancelled' && i.status !== 'Draft')
      .reduce((s, i) => s + (Number(i.netAmount) || 0), 0);
    const totalCollected = payments
      .filter((p) => p.status === 'Verified')
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    return {
      totalExpected,
      totalCollected,
      variance: totalExpected - totalCollected,
      duplicates,
      unmatched,
      discrepancies,
      reconciledCount: payments.filter((p) => p.reconciliationStatus === 'Reconciled' || p.reconciliationStatus === 'Matched').length,
    };
  },

  // ─── Integrated Workflow: Admissions & CRM Conversion ───────────────────────
  updateRegistrationWorkflow(regId, newStage, note = '', actor = null, extraUpdates = {}) {
    const regs = adminRegistrationService.getRegistrations();
    const target = regs.find((r) => r.id === regId);
    if (!target) return false;
    const prevStage = getEffectiveRegistrationStage(target);
    const actorEmail = actor?.email || adminRegistrationService.getCurrentUser()?.email || 'admin';
    const historyEntry = {
      stage: newStage,
      status: mapWorkflowStageToLegacyStatus(newStage),
      by: actorEmail,
      note: note || `Stage updated from ${prevStage} to ${newStage}`,
      at: new Date().toISOString(),
    };
    const nextHistory = [historyEntry, ...(Array.isArray(target.statusHistory) ? target.statusHistory : [])].slice(0, 50);

    const ok = adminRegistrationService.updateRegistration(regId, {
      workflowStage: newStage,
      status: mapWorkflowStageToLegacyStatus(newStage),
      statusHistory: nextHistory,
      ...extraUpdates,
    });
    if (ok) {
      this.logAudit(actor, 'ADMISSION_STAGE_CHANGE', 'Registration', target.referenceNo || regId, prevStage, newStage);
    }
    return ok;
  },

  convertLeadToRegistration(lead, actor = null) {
    if (!lead) return { success: false, error: 'Invalid lead record.' };
    const existingRegs = adminRegistrationService.getRegistrations();
    const cleanEmail = (lead.email || '').trim().toLowerCase();
    const duplicate = cleanEmail
      ? existingRegs.find(
        (r) =>
          ((r.officialEmail || '').toLowerCase() === cleanEmail || (r.personalEmail || '').toLowerCase() === cleanEmail) &&
          (r.eventTitle || '').toLowerCase() === (lead.courseTitle || '').toLowerCase()
      )
      : null;

    if (duplicate) {
      adminRegistrationService.updateInquiry(lead.id, {
        status: 'Converted',
        linkedRegistrationId: duplicate.id,
        lastContactDate: new Date().toISOString().split('T')[0],
      });
      return { success: true, alreadyExisted: true, registration: duplicate };
    }

    const nameParts = String(lead.fullName || 'Prospective Delegate').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Delegate';
    const lastName = nameParts.slice(1).join(' ') || '';
    const numericFee = Number(String(lead.fee || '').replace(/[^0-9.]/g, '')) || 1200;
    const actorEmail = actor?.email || adminRegistrationService.getCurrentUser()?.email || 'admin';

    const newReg = adminRegistrationService.addRegistration({
      firstName,
      lastName,
      officialEmail: lead.email || '',
      personalEmail: lead.email || '',
      phoneNumber: lead.phone || '',
      organisation: lead.organisation || '',
      country: lead.country || 'Kenya',
      eventTitle: lead.courseTitle || 'Executive Training Programme',
      venue: lead.venue || 'Nairobi, Kenya',
      durationText: lead.cohortDates || 'Flexible 2026 Intake',
      totalFee: numericFee,
      currency: 'USD',
      participantsCount: 1,
      status: 'Pending',
      workflowStage: 'Application Received',
      paymentStatus: 'Unpaid',
      assignedOfficer: lead.assignedOfficer || actorEmail,
      linkedLeadId: lead.id,
      adminNotes: `Converted from CRM Lead ${lead.referenceNo || lead.id}. ${lead.message || ''}`.trim(),
      statusHistory: [
        {
          stage: 'Application Received',
          status: 'Pending',
          by: actorEmail,
          note: `Converted directly from CRM Lead ${lead.referenceNo || lead.id}`,
          at: new Date().toISOString(),
        },
      ],
    });

    if (newReg) {
      const logEntry = {
        id: `LOG-${Date.now()}`,
        type: 'Conversion',
        summary: `Lead converted to Registration ${newReg.referenceNo}`,
        by: actorEmail,
        at: new Date().toISOString(),
      };
      adminRegistrationService.updateInquiry(lead.id, {
        status: 'Converted',
        linkedRegistrationId: newReg.id,
        lastContactDate: new Date().toISOString().split('T')[0],
        communicationLog: [logEntry, ...(Array.isArray(lead.communicationLog) ? lead.communicationLog : [])],
      });
      this.logAudit(actor, 'CONVERT_LEAD_TO_REGISTRATION', 'Lead', lead.referenceNo || lead.id, lead.status || 'New Lead', `Converted -> ${newReg.referenceNo}`);
      return { success: true, alreadyExisted: false, registration: newReg };
    }
    return { success: false, error: 'Failed to create registration from lead.' };
  },

  // ─── Cohorts & Intakes ──────────────────────────────────────────────────────
  getCohorts() {
    const list = readJson(ENTERPRISE_KEYS.COHORTS, []);
    return Array.isArray(list) ? list : [];
  },

  saveCohort(cohortInput, actor) {
    const list = this.getCohorts();
    const id = cohortInput.id || `COH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      id,
      name: (cohortInput.name || '').trim(),
      courseSlug: cohortInput.courseSlug || '',
      courseTitle: (cohortInput.courseTitle || '').trim(),
      intakeYear: cohortInput.intakeYear || String(new Date().getFullYear()),
      destination: (cohortInput.destination || 'Nairobi, Kenya').trim(),
      startDate: cohortInput.startDate || '',
      endDate: cohortInput.endDate || '',
      applicationDeadline: cohortInput.applicationDeadline || '',
      availableSlots: Math.max(1, Number(cohortInput.availableSlots) || 30),
      enrolmentStatus: cohortInput.enrolmentStatus || 'Open',
      scheduleNotes: (cohortInput.scheduleNotes || '').trim(),
      updatedAt: new Date().toISOString(),
    };
    const exists = list.some((c) => c.id === id);
    const updated = exists ? list.map((c) => (c.id === id ? record : c)) : [record, ...list];
    writeJson(ENTERPRISE_KEYS.COHORTS, updated);
    postEnterpriseAction({ action: 'set_cohorts', cohorts: updated });
    this.logAudit(actor, exists ? 'UPDATE_COHORT' : 'CREATE_COHORT', 'Cohort', record.name, '', `${record.courseTitle} (${record.destination})`, false);
    notifyEnterpriseUpdate('cohorts');
    return record;
  },

  deleteCohort(id, actor) {
    const list = this.getCohorts();
    const target = list.find((c) => c.id === id);
    const updated = list.filter((c) => c.id !== id);
    writeJson(ENTERPRISE_KEYS.COHORTS, updated);
    postEnterpriseAction({ action: 'set_cohorts', cohorts: updated });
    this.logAudit(actor, 'DELETE_COHORT', 'Cohort', target?.name || id, 'Active', 'Deleted', false);
    notifyEnterpriseUpdate('cohorts');
  },

  // ─── Communications, Templates & Announcements ──────────────────────────────
  getCommunications() {
    const list = readJson(ENTERPRISE_KEYS.COMMUNICATIONS, []);
    return Array.isArray(list) ? list : [];
  },

  async sendCommunication(msgInput, actor) {
    const actorEmail = actor?.email || adminRegistrationService.getCurrentUser()?.email || 'admin';
    const channel = msgInput.channel || 'Email';
    let deliveryStatus = 'Logged';

    if (channel === 'Email' && msgInput.recipientContact) {
      const serverRes = await postEnterpriseAction({
        action: 'send_email',
        to: msgInput.recipientContact,
        recipientName: msgInput.recipientName,
        subject: msgInput.subject,
        body: msgInput.body,
        category: msgInput.category || 'Direct Email',
        templateName: msgInput.templateName || '',
        linkedEntityId: msgInput.linkedEntityId || '',
      });
      if (!serverRes.unreachable && serverRes.ok) {
        deliveryStatus = serverRes.data?.deliveryStatus || (serverRes.data?.delivered ? 'Sent' : 'Logged');
      } else {
        deliveryStatus = 'Logged (Open Mail Client to Send)';
      }
    }

    const record = {
      id: `MSG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      channel,
      category: msgInput.category || 'General',
      recipientName: (msgInput.recipientName || '').trim(),
      recipientContact: (msgInput.recipientContact || '').trim(),
      subject: (msgInput.subject || '').trim(),
      body: (msgInput.body || '').trim(),
      templateName: msgInput.templateName || '',
      deliveryStatus,
      linkedEntityId: msgInput.linkedEntityId || '',
      sentBy: actorEmail,
      sentAt: new Date().toISOString(),
    };
    const existing = this.getCommunications();
    const updated = [record, ...existing].slice(0, 3000);
    writeJson(ENTERPRISE_KEYS.COMMUNICATIONS, updated);
    if (channel !== 'Email') {
      postEnterpriseAction({ action: 'set_communications', communications: updated });
    }
    this.logAudit(actor, 'SEND_COMMUNICATION', 'Communication', record.recipientContact || record.recipientName, '', `[${channel}] ${record.subject} (${deliveryStatus})`, false);
    notifyEnterpriseUpdate('communications');
    return record;
  },

  getTemplates() {
    const stored = readJson(ENTERPRISE_KEYS.TEMPLATES, null);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    writeJson(ENTERPRISE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
    return DEFAULT_TEMPLATES;
  },

  saveTemplate(tplInput, actor) {
    const list = this.getTemplates();
    const id = tplInput.id || `TPL-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      id,
      name: (tplInput.name || '').trim(),
      channel: tplInput.channel || 'Email',
      category: tplInput.category || 'Admissions',
      subject: (tplInput.subject || '').trim(),
      body: (tplInput.body || '').trim(),
      updatedAt: new Date().toISOString(),
    };
    const exists = list.some((t) => t.id === id);
    const updated = exists ? list.map((t) => (t.id === id ? record : t)) : [record, ...list];
    writeJson(ENTERPRISE_KEYS.TEMPLATES, updated);
    postEnterpriseAction({ action: 'set_templates', templates: updated });
    this.logAudit(actor, 'SAVE_MESSAGE_TEMPLATE', 'Template', record.name, '', record.category);
    notifyEnterpriseUpdate('templates');
    return record;
  },

  deleteTemplate(id) {
    const updated = this.getTemplates().filter((t) => t.id !== id);
    writeJson(ENTERPRISE_KEYS.TEMPLATES, updated);
    postEnterpriseAction({ action: 'set_templates', templates: updated });
    notifyEnterpriseUpdate('templates');
  },

  getAnnouncements() {
    const list = readJson(ENTERPRISE_KEYS.ANNOUNCEMENTS, []);
    return Array.isArray(list) ? list : [];
  },

  saveAnnouncement(annInput, actor) {
    const list = this.getAnnouncements();
    const id = annInput.id || `ANN-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      id,
      title: (annInput.title || '').trim(),
      body: (annInput.body || '').trim(),
      audience: annInput.audience || 'All Website Visitors',
      status: annInput.status || 'Draft',
      publishedAt: annInput.status === 'Published' ? annInput.publishedAt || new Date().toISOString() : '',
      createdBy: annInput.createdBy || actor?.email || 'admin',
      updatedAt: new Date().toISOString(),
    };
    const exists = list.some((a) => a.id === id);
    const updated = exists ? list.map((a) => (a.id === id ? record : a)) : [record, ...list];
    writeJson(ENTERPRISE_KEYS.ANNOUNCEMENTS, updated);
    postEnterpriseAction({ action: 'set_announcements', announcements: updated });
    this.logAudit(actor, 'SAVE_ANNOUNCEMENT', 'Announcement', record.title, '', `Status: ${record.status}`, false);
    notifyEnterpriseUpdate('announcements');
    return record;
  },

  deleteAnnouncement(id, actor) {
    const list = this.getAnnouncements();
    const target = list.find((a) => a.id === id);
    const updated = list.filter((a) => a.id !== id);
    writeJson(ENTERPRISE_KEYS.ANNOUNCEMENTS, updated);
    postEnterpriseAction({ action: 'set_announcements', announcements: updated });
    this.logAudit(actor, 'DELETE_ANNOUNCEMENT', 'Announcement', target?.title || id, 'Active', 'Deleted', false);
    notifyEnterpriseUpdate('announcements');
  },

  // ─── Website Content Management (CMS) ───────────────────────────────────────
  getCmsContent() {
    const stored = readJson(ENTERPRISE_KEYS.CMS, null);
    if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
      return { ...DEFAULT_CMS_SECTIONS, ...stored };
    }
    writeJson(ENTERPRISE_KEYS.CMS, DEFAULT_CMS_SECTIONS);
    return DEFAULT_CMS_SECTIONS;
  },

  saveCmsSection(sectionKey, sectionData, revisionNote, actor) {
    const all = this.getCmsContent();
    const prev = all[sectionKey] || {};
    const actorEmail = actor?.email || adminRegistrationService.getCurrentUser()?.email || 'admin';
    const nextRev = {
      at: new Date().toISOString(),
      by: actorEmail,
      note: revisionNote || `Updated ${sectionKey} (${sectionData.status || 'Draft'})`,
      status: sectionData.status || 'Draft',
    };
    const updated = {
      ...all,
      [sectionKey]: {
        ...prev,
        ...sectionData,
        revisions: [nextRev, ...(Array.isArray(prev.revisions) ? prev.revisions : [])].slice(0, 20),
        updatedBy: actorEmail,
        updatedAt: new Date().toISOString(),
      },
    };
    writeJson(ENTERPRISE_KEYS.CMS, updated);
    postEnterpriseAction({
      action: 'set_cms_content',
      cmsContent: updated,
      audit: {
        action: 'UPDATE_CMS_SECTION',
        record: sectionKey,
        previousValue: prev.status || 'Draft',
        newValue: sectionData.status || 'Draft',
      },
    });
    this.logAudit(actor, 'UPDATE_CMS_SECTION', 'WebsiteCMS', sectionKey, prev.status || 'Draft', sectionData.status || 'Draft', false);
    notifyEnterpriseUpdate('cms');
    return updated[sectionKey];
  },

  // ─── Platform Settings ──────────────────────────────────────────────────────
  getSettings() {
    const stored = readJson(ENTERPRISE_KEYS.SETTINGS, null);
    return stored && typeof stored === 'object' ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
  },

  saveSettings(newSettings, actor) {
    const merged = { ...this.getSettings(), ...newSettings, updatedAt: new Date().toISOString() };
    writeJson(ENTERPRISE_KEYS.SETTINGS, merged);
    postEnterpriseAction({ action: 'set_settings', settings: merged });
    this.logAudit(actor, 'UPDATE_PLATFORM_SETTINGS', 'Settings', 'Institution Settings', '', `Default currency: ${merged.defaultCurrency}`, false);
    notifyEnterpriseUpdate('settings');
    return merged;
  },

  // ─── Staff Account & Role Management (Super Admin: Jacob Olonde & Gift Rioba) ─
  async manageStaffAccount({ email, name, role, status, password = '' }, actor) {
    if (!hasPermission(actor, 'admin.manage')) {
      return { success: false, error: 'Only Super Admins (Jacob Olonde & Gift Rioba) can add or manage staff accounts.' };
    }
    const cleanEmail = normalizeAdminEmail(email);
    if (!isValidInstitutionalEmail(cleanEmail)) {
      return { success: false, error: 'Staff email must be a valid @ecasiafrica.org address (e.g. name@ecasiafrica.org).' };
    }
    const cleanPassword = String(password || '').trim();
    if (cleanPassword && cleanPassword.length < 6) {
      return { success: false, error: 'Initial password must be at least 6 characters long.' };
    }

    const isProtectedSuper = isSuperAdminEmail(cleanEmail);
    const normRole = isProtectedSuper ? 'SUPER_ADMIN' : normalizeRole(role);
    const cleanStatus = isProtectedSuper ? 'Active' : (status === 'Suspended' ? 'Suspended' : 'Active');
    const digest = cleanPassword ? computeCredentialDigest(cleanEmail, cleanPassword) : '';

    const accounts = adminRegistrationService.getAdminAccounts();
    const idx = accounts.findIndex((a) => normalizeAdminEmail(a.email) === cleanEmail);
    const prevRole = idx >= 0 ? normalizeRole(accounts[idx].role) : 'None';

    const updatedAccounts = [...accounts];
    if (idx >= 0) {
      updatedAccounts[idx] = {
        ...updatedAccounts[idx],
        name: name || updatedAccounts[idx].name || '',
        role: normRole,
        status: cleanStatus,
        ...(digest ? { credentialDigest: digest } : {}),
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedAccounts.push({
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: normRole,
        status: cleanStatus,
        ...(digest ? { credentialDigest: digest } : {}),
        addedBy: actor?.email || 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    writeJson('ecasi_msimamizi_accounts', updatedAccounts);

    const serverRes = await postEnterpriseAction({
      action: 'manage_staff_account',
      email: cleanEmail,
      name: name || '',
      role: normRole,
      status: cleanStatus,
      ...(cleanPassword ? { password: cleanPassword, credentialDigest: digest } : {}),
    });
    if (!serverRes.unreachable && !serverRes.ok) {
      return { success: false, error: serverRes.data?.error || 'Server rejected staff permission update.' };
    }
    this.logAudit(
      actor,
      idx >= 0 ? 'UPDATE_STAFF_USER' : 'ADD_STAFF_USER',
      'StaffAccount',
      cleanEmail,
      prevRole,
      `${normRole} (${cleanStatus})${cleanPassword ? ' [Password Set]' : ''}`,
      false
    );
    notifyEnterpriseUpdate('staff');
    return { success: true, accounts: updatedAccounts, isNew: idx < 0 };
  },

  async deleteStaffAccount(email, actor) {
    if (!hasPermission(actor, 'admin.manage')) {
      return { success: false, error: 'Only Super Admins (Jacob Olonde & Gift Rioba) can remove staff accounts.' };
    }
    const cleanEmail = normalizeAdminEmail(email);
    if (isSuperAdminEmail(cleanEmail)) {
      return { success: false, error: 'Primary Super Admin accounts (Jacob Olonde & Gift Rioba) cannot be deleted.' };
    }
    const accounts = adminRegistrationService.getAdminAccounts();
    const updatedAccounts = accounts.filter((a) => normalizeAdminEmail(a.email) !== cleanEmail);
    writeJson('ecasi_msimamizi_accounts', updatedAccounts);

    const serverRes = await postEnterpriseAction({
      action: 'delete_staff_account',
      email: cleanEmail,
    });
    if (!serverRes.unreachable && !serverRes.ok) {
      return { success: false, error: serverRes.data?.error || 'Server rejected account removal.' };
    }
    this.logAudit(actor, 'REMOVE_STAFF_USER', 'StaffAccount', cleanEmail, 'Active', 'Removed', false);
    notifyEnterpriseUpdate('staff');
    return { success: true, accounts: updatedAccounts };
  },

  // ─── System Health Diagnostics ──────────────────────────────────────────────
  async fetchSystemHealth() {
    if (typeof window === 'undefined') return null;
    const host = window.location.hostname;
    const localSnapshot = {
      apiStatus: host === 'localhost' || host === '127.0.0.1' ? 'Local Dev Mode' : 'Checking...',
      phpVersion: 'N/A (Local Vite Dev)',
      serverTime: new Date().toISOString(),
      storageWritable: true,
      storeFileSizeBytes: null,
      auditLogSizeBytes: null,
      diskFreeBytes: null,
      diskTotalBytes: null,
      mysqlConfigured: false,
      mysqlConnected: false,
      databaseStatus: 'Browser LocalStorage + Central Sync Ready',
      mailFunctionAvailable: false,
      turnstileConfigured: Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY),
      activeSessionsCount: 1,
      counts: {
        registrations: adminRegistrationService.getRegistrations().length,
        inquiries: adminRegistrationService.getInquiries().length,
        vacancies: readJson('ecasi_vacancies', []).length,
        applications: adminRegistrationService.getApplications().length,
        invoices: this.getInvoices().length,
        payments: this.getPayments().length,
        cohorts: this.getCohorts().length,
        communications: this.getCommunications().length,
        auditEvents: this.getAuditEvents().length,
      },
    };

    if (host === 'localhost' || host === '127.0.0.1') {
      return { live: false, health: localSnapshot };
    }
    try {
      const token = getStoredAdminToken();
      const res = await fetch(`${getSyncUrl()}?scope=health`, {
        method: 'GET',
        headers: token ? { 'X-Admin-Token': token } : {},
        cache: 'no-store',
      });
      if (!res.ok) return { live: false, health: { ...localSnapshot, apiStatus: `HTTP ${res.status}` } };
      const json = await res.json();
      if (json?.success && json?.health) {
        return { live: true, health: json.health };
      }
      return { live: false, health: localSnapshot };
    } catch {
      return { live: false, health: { ...localSnapshot, apiStatus: 'Unreachable (Offline Fallback)' } };
    }
  },

  // ─── Real Data Exports (CSV, Excel .xls, Printable PDF) ─────────────────────
  exportCSV(headers, rows, filename, actor = null) {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.logAudit(actor, 'EXPORT_CSV', 'Export', filename, '', `${rows.length} rows exported`);
  },

  exportExcel(headers, rows, filename, sheetTitle = 'ECAS Report', actor = null) {
    const escHtml = (v) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const headerRow = `<tr>${headers.map((h) => `<th style="background:#032e42;color:#ffffff;font-weight:bold;padding:8px;border:1px solid #cbd5e1;">${escHtml(h)}</th>`).join('')}</tr>`;
    const bodyRows = rows
      .map((r) => `<tr>${r.map((c) => `<td style="padding:6px;border:1px solid #e2e8f0;">${escHtml(c)}</td>`).join('')}</tr>`)
      .join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escHtml(sheetTitle)}</title></head><body><h2>${escHtml(sheetTitle)}</h2><p>Generated: ${new Date().toLocaleString()} — ECAS Institute Msimamizi</p><table>${headerRow}${bodyRows}</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.logAudit(actor, 'EXPORT_EXCEL', 'Export', filename, '', `${rows.length} rows exported`);
  },

  printInstitutionalDocument(title, bodyHtml, actor = null) {
    const win = window.open('', '_blank', 'width=960,height=760');
    if (!win) {
      alert('Please allow pop-ups to generate printable PDF documents.');
      return;
    }
    const settings = this.getSettings();
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #032e42; margin: 32px; font-size: 12px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #032e42; padding-bottom: 14px; margin-bottom: 22px; }
    .brand { font-size: 20px; font-weight: 800; color: #032e42; }
    .brand span { color: #008000; }
    .meta { text-align: right; color: #718096; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    th { background: #032e42; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
    .kpi { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #F5F8FC; }
    .kpi-label { font-size: 10px; text-transform: uppercase; color: #718096; font-weight: 700; }
    .kpi-val { font-size: 18px; font-weight: 800; color: #032e42; margin-top: 2px; }
    .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #718096; display: flex; justify-content: space-between; }
    @media print { body { margin: 16px; } button { display: none !important; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${settings.institutionName} <span>Msimamizi</span></div>
      <div style="font-size:11px;color:#718096;">${settings.tagline} • ${settings.officialEmail}</div>
    </div>
    <div class="meta">
      <div><strong>${title}</strong></div>
      <div>Generated: ${new Date().toLocaleString()}</div>
    </div>
  </div>
  ${bodyHtml}
  <div class="footer">
    <span>Official Institutional Record — ${settings.institutionName}</span>
    <span>msimamizi.ecasiafrica.org</span>
  </div>
  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`);
    win.document.close();
    this.logAudit(actor, 'EXPORT_PDF_PRINT', 'Export', title, '', 'Generated printable PDF document');
  },
};
