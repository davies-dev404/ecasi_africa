// ECAS Institute - Msimamizi Administrative Service
// Real-time persistent data service for Course Registrations, Corporate Quotes & Portal Analytics

import { dataService } from '@/lib/dataService';
import { realtimeService } from '@/services/realtimeService';

const STORAGE_KEY = 'ecasi_course_registrations_live';
const INQUIRIES_KEY = 'ecasi_course_inquiries_live';
const DELETED_INQUIRIES_KEY = 'ecasi_deleted_inquiries_v1';
const PENDING_INQUIRIES_KEY = 'ecasi_pending_inquiry_sync_v1';
const PENDING_REGS_KEY = 'ecasi_pending_reg_sync_v1';
const APPLICATIONS_KEY = 'ecasi_vacancy_applications_live';
const VACANCIES_KEY = 'ecasi_vacancies';
const ADMIN_AUTH_KEY = 'ecasi_msimamizi_auth';
const ADMIN_TOKEN_KEY = 'ecasi_msimamizi_token';
const ADMIN_ACCOUNTS_KEY = 'ecasi_msimamizi_accounts';
const ADMIN_CURRENT_USER_KEY = 'ecasi_msimamizi_user';
const ADMIN_LAST_ACTIVITY_KEY = 'ecasi_msimamizi_last_activity';
const ADMIN_TAB_ID_KEY = 'ecasi_msimamizi_tab_id';
const ADMIN_BROWSER_PROFILE_KEY = 'ecasi_msimamizi_browser_id';
const ADMIN_ACTIVE_SESSIONS_KEY = 'ecasi_msimamizi_active_sessions';
const COURSES_KEY = 'ecasi_courses_v2026_v3';

export const ADMIN_SESSION_IDLE_TIMEOUT_MS = 10 * 60 * 1000; // Silent 10-minute idle timeout

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

export const SUPER_ADMIN_EMAILS = [
  'jacob@ecasiafrica.org',
  'acob@ecasiafrica.org',
  'riobag@ecasiafrica.org',
  'gift@ecasiafrica.org',
];

export function isSuperAdminEmail(email) {
  return SUPER_ADMIN_EMAILS.includes(normalizeAdminEmail(email));
}

export function isValidInstitutionalEmail(email) {
  const clean = normalizeAdminEmail(email);
  return Boolean(clean && clean.endsWith('@ecasiafrica.org') && /^[^\s@]+@ecasiafrica\.org$/.test(clean));
}

// Non-reversible local digest so plaintext passwords are never stored in browser storage
export function computeCredentialDigest(email, password) {
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
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

function getOrCreateTabSessionId() {
  if (typeof window === 'undefined') return 'tab_ssr';
  try {
    let tabId = sessionStorage.getItem(ADMIN_TAB_ID_KEY);
    if (!tabId) {
      tabId = `tab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(ADMIN_TAB_ID_KEY, tabId);
    }
    return tabId;
  } catch {
    return `tab_${Date.now().toString(36)}`;
  }
}

function getOrCreateBrowserProfileId() {
  if (typeof window === 'undefined') return 'bp_ssr';
  try {
    let bpId = localStorage.getItem(ADMIN_BROWSER_PROFILE_KEY);
    if (!bpId) {
      bpId = `bp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(ADMIN_BROWSER_PROFILE_KEY, bpId);
    }
    return bpId;
  } catch {
    return `bp_mem_${Date.now().toString(36)}`;
  }
}

function readLocalActiveSessions() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ADMIN_ACTIVE_SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object') return {};
    const now = Date.now();
    const cleaned = {};
    Object.entries(parsed).forEach(([em, lock]) => {
      if (!lock || typeof lock !== 'object') return;
      const expired = (lock.expiresAt || 0) <= now;
      const closed = lock.closingAt && now - lock.closingAt >= 2000;
      if (!expired && !closed) {
        cleaned[em] = lock;
      }
    });
    if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
      localStorage.setItem(ADMIN_ACTIVE_SESSIONS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return {};
  }
}

function writeLocalActiveSessions(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_ACTIVE_SESSIONS_KEY, JSON.stringify(map || {}));
  } catch {
    // ignore storage errors
  }
}

function clearLegacyPersistentAuth() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_CURRENT_USER_KEY);
    localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
  } catch {
    // ignore storage errors
  }
}

export function getSyncUrl() {
  if (typeof window === 'undefined') return '/api/msimamizi-sync.php';
  const host = window.location.hostname;
  const port = String(window.location.port || '');
  // Both ecasiafrica.org and msimamizi.ecasiafrica.org share the /public_html Document Root;
  // local Vite dev proxies /api/msimamizi-sync.php to server/realtime.js
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('ecasiafrica.org') ||
    port === '5173' ||
    port === '4173' ||
    port === '8080'
  ) {
    return '/api/msimamizi-sync.php';
  }
  return 'https://ecasiafrica.org/api/msimamizi-sync.php';
}

function sendKeepaliveLifecycle(action, explicitToken = '') {
  if (typeof window === 'undefined') return;
  const token = explicitToken || getStoredAdminToken();
  if (!token) return;
  const payloadStr = JSON.stringify({ action, token });
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const queued = navigator.sendBeacon(
        getSyncUrl(),
        new Blob([payloadStr], { type: 'text/plain;charset=UTF-8' })
      );
      if (queued) return;
    }
    fetch(getSyncUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
      },
      body: payloadStr,
      keepalive: true,
    }).catch(() => { });
  } catch {
    // ignore unload fetch failures
  }
}

// Enforce fresh password login whenever the user clicks/navigates to the portal URL (including same-tab URL entry)
if (typeof window !== 'undefined') {
  clearLegacyPersistentAuth();
  try {
    const navEntries = window.performance?.getEntriesByType?.('navigation');
    const navType = Array.isArray(navEntries) && navEntries.length > 0 ? navEntries[0].type : '';
    const isAdminHostOrRoute =
      window.location.hostname.startsWith('msimamizi.') ||
      window.location.hostname.includes('msimamizi') ||
      window.location.pathname.startsWith('/msimamizi') ||
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/portal');
    if (isAdminHostOrRoute && (navType === 'navigate' || navType === 'back_forward')) {
      const staleToken = sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
      const staleUserRaw = sessionStorage.getItem(ADMIN_CURRENT_USER_KEY) || '';
      const tabId = sessionStorage.getItem(ADMIN_TAB_ID_KEY) || '';
      if (staleToken) {
        sendKeepaliveLifecycle('logout', staleToken);
      }
      if (staleUserRaw && tabId) {
        try {
          const parsedUser = JSON.parse(staleUserRaw);
          const em = normalizeAdminEmail(parsedUser?.email || '');
          const locks = readLocalActiveSessions();
          if (em && locks[em]?.tabId === tabId) {
            delete locks[em];
            writeLocalActiveSessions(locks);
          }
        } catch {
          // ignore
        }
      }
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_CURRENT_USER_KEY);
      sessionStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
    }
  } catch {
    // ignore performance API fallback issues
  }
}

function readPendingSyncIds(storageKey) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string' && id) : [];
  } catch {
    return [];
  }
}

function enqueuePendingSyncId(storageKey, id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const ids = readPendingSyncIds(storageKey);
    if (!ids.includes(id)) {
      ids.unshift(id);
      localStorage.setItem(storageKey, JSON.stringify(ids.slice(0, 200)));
    }
  } catch {
    // ignore storage errors
  }
}

function dequeuePendingSyncId(storageKey, id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const ids = readPendingSyncIds(storageKey);
    const next = ids.filter((item) => item !== id);
    if (next.length !== ids.length) {
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
  } catch {
    // ignore storage errors
  }
}

function trySendBeacon(payloadStr) {
  if (
    payloadStr.length >= 60000 ||
    typeof navigator === 'undefined' ||
    typeof navigator.sendBeacon !== 'function'
  ) {
    return false;
  }
  try {
    return navigator.sendBeacon(
      getSyncUrl(),
      new Blob([payloadStr], { type: 'text/plain;charset=UTF-8' })
    );
  } catch {
    return false;
  }
}

async function pushToServerWithStatus(payload, options = {}) {
  if (typeof window === 'undefined') return { unreachable: true, status: 0, data: null };
  let payloadStr = '';
  try {
    payloadStr = JSON.stringify(payload);
  } catch {
    return { unreachable: true, status: 0, data: null };
  }
  const canKeepalive = payloadStr.length < 60000;
  if (options.beaconFirst && trySendBeacon(payloadStr)) {
    return { unreachable: false, status: 202, ok: true, beaconQueued: true, data: { success: true } };
  }
  try {
    const token = getStoredAdminToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['X-Admin-Token'] = token;
    }
    const res = await fetch(getSyncUrl(), {
      method: 'POST',
      headers,
      body: payloadStr,
      ...(canKeepalive ? { keepalive: true } : {}),
    });
    if ([502, 503, 504].includes(res.status)) {
      return { unreachable: true, status: res.status, data: null };
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (options.beaconFallback) {
        trySendBeacon(payloadStr);
      }
      return { unreachable: true, status: res.status, data: null };
    }
    const data = await res.json();
    if (!res.ok && options.beaconFallback) {
      trySendBeacon(payloadStr);
    }
    return { unreachable: false, status: res.status, ok: res.ok, data };
  } catch {
    if (options.beaconFallback) {
      trySendBeacon(payloadStr);
    }
    return { unreachable: true, status: 0, data: null };
  }
}

async function pushToServer(payload, options = {}) {
  const result = await pushToServerWithStatus(payload, options);
  if (result.unreachable || !result.ok) return null;
  return result.data;
}

class AdminRegistrationService {
  constructor() {
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    this._tabId = getOrCreateTabSessionId();
    this._lastServerTouchAt = 0;
    this._initSessionCoordination();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
      const storedInq = localStorage.getItem(INQUIRIES_KEY);
      if (!storedInq) {
        localStorage.setItem(INQUIRIES_KEY, JSON.stringify([]));
      }
      const storedApps = localStorage.getItem(APPLICATIONS_KEY);
      if (!storedApps) {
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([]));
      }
      if (this.isAuthenticated()) {
        this._resumeLocalSessionLock();
      }
      this.syncFromServer();
    } catch (e) {
      console.warn('LocalStorage error initializing admin registrations:', e);
    }
  }

  _initSessionCoordination() {
    if (typeof window === 'undefined') return;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this._channel = new BroadcastChannel('ecasi_msimamizi_session');
        this._channel.onmessage = (ev) => {
          const msg = ev?.data;
          if (!msg || typeof msg !== 'object') return;
          if (msg.type === 'PING_ACTIVE_SESSION') {
            if (!this.isAuthenticated()) return;
            const cur = this.getCurrentUser();
            const curEmail = normalizeAdminEmail(cur?.email || '');
            const targetEmail = normalizeAdminEmail(msg.email || '');
            if (curEmail && curEmail === targetEmail && msg.senderTabId !== this._tabId) {
              this._channel.postMessage({
                type: 'PONG_ACTIVE_SESSION',
                email: curEmail,
                ownerTabId: this._tabId,
                pingId: msg.pingId,
              });
            }
          }
        };
      } catch {
        this._channel = null;
      }
    }

    const markClosing = () => {
      if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== 'true') return;
      const cur = this.getCurrentUser();
      const email = normalizeAdminEmail(cur?.email || '');
      if (email) {
        const locks = readLocalActiveSessions();
        if (locks[email]?.tabId === this._tabId) {
          locks[email].closingAt = Date.now();
          writeLocalActiveSessions(locks);
        }
      }
      sendKeepaliveLifecycle('tab_closing');
    };

    window.addEventListener('pagehide', markClosing);
  }

  _hasLiveTabViaBroadcast(email) {
    const normEmail = normalizeAdminEmail(email);
    if (!normEmail || !this._channel || typeof window === 'undefined') {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      const pingId = `${this._tabId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      let settled = false;
      const handleMsg = (ev) => {
        const d = ev?.data;
        if (
          d?.type === 'PONG_ACTIVE_SESSION' &&
          d.pingId === pingId &&
          normalizeAdminEmail(d.email || '') === normEmail &&
          d.ownerTabId !== this._tabId
        ) {
          if (!settled) {
            settled = true;
            this._channel.removeEventListener('message', handleMsg);
            window.clearTimeout(timer);
            resolve(true);
          }
        }
      };
      this._channel.addEventListener('message', handleMsg);
      const timer = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          this._channel.removeEventListener('message', handleMsg);
          resolve(false);
        }
      }, 120);
      try {
        this._channel.postMessage({
          type: 'PING_ACTIVE_SESSION',
          email: normEmail,
          senderTabId: this._tabId,
          pingId,
        });
      } catch {
        window.clearTimeout(timer);
        resolve(false);
      }
    });
  }

  async _isAccountLockedInBrowser(email) {
    const normEmail = normalizeAdminEmail(email);
    if (!normEmail) return false;
    if (this._channel) {
      const liveTabOpen = await this._hasLiveTabViaBroadcast(normEmail);
      if (liveTabOpen) return true;
      // BroadcastChannel verified zero live open tabs in this browser -> purge any orphaned lock
      const locks = readLocalActiveSessions();
      if (locks[normEmail]) {
        delete locks[normEmail];
        writeLocalActiveSessions(locks);
      }
      return false;
    }
    const locks = readLocalActiveSessions();
    const lock = locks[normEmail];
    if (!lock || lock.tabId === this._tabId) return false;
    return (lock.expiresAt || 0) > Date.now() && (!lock.closingAt || Date.now() - lock.closingAt < 2000);
  }

  _setLocalSessionLock(email) {
    const normEmail = normalizeAdminEmail(email);
    if (!normEmail || typeof window === 'undefined') return;
    const locks = readLocalActiveSessions();
    locks[normEmail] = {
      email: normEmail,
      tabId: this._tabId || getOrCreateTabSessionId(),
      expiresAt: Date.now() + ADMIN_SESSION_IDLE_TIMEOUT_MS,
      closingAt: null,
    };
    writeLocalActiveSessions(locks);
  }

  _resumeLocalSessionLock() {
    const cur = this.getCurrentUser();
    const normEmail = normalizeAdminEmail(cur?.email || '');
    if (!normEmail) return;
    const locks = readLocalActiveSessions();
    if (locks[normEmail] && locks[normEmail].tabId === this._tabId) {
      delete locks[normEmail].closingAt;
      locks[normEmail].expiresAt = Date.now() + ADMIN_SESSION_IDLE_TIMEOUT_MS;
      writeLocalActiveSessions(locks);
    } else if (!locks[normEmail]) {
      this._setLocalSessionLock(normEmail);
    }
  }

  _clearLocalSessionLock(email) {
    const normEmail = normalizeAdminEmail(email);
    if (!normEmail || typeof window === 'undefined') return;
    const locks = readLocalActiveSessions();
    if (locks[normEmail] && locks[normEmail].tabId === this._tabId) {
      delete locks[normEmail];
      writeLocalActiveSessions(locks);
    }
  }

  async _flushPendingPublicWrites() {
    if (typeof window === 'undefined') return;

    const pendingInqIds = readPendingSyncIds(PENDING_INQUIRIES_KEY);
    if (pendingInqIds.length > 0) {
      const localInq = this.getInquiries();
      for (const id of pendingInqIds) {
        const item = localInq.find((inq) => inq.id === id);
        if (!item) {
          dequeuePendingSyncId(PENDING_INQUIRIES_KEY, id);
          continue;
        }
        const res = await pushToServerWithStatus({ action: 'add_inquiry', inquiry: item });
        if (res?.ok && res.data?.success) {
          dequeuePendingSyncId(PENDING_INQUIRIES_KEY, id);
        }
      }
    }

    const pendingRegIds = readPendingSyncIds(PENDING_REGS_KEY);
    if (pendingRegIds.length > 0) {
      const localRegs = this.getRegistrations();
      for (const id of pendingRegIds) {
        const item = localRegs.find((reg) => reg.id === id);
        if (!item) {
          dequeuePendingSyncId(PENDING_REGS_KEY, id);
          continue;
        }
        const res = await pushToServerWithStatus({ action: 'add_registration', registration: item });
        if (res?.ok && res.data?.success) {
          dequeuePendingSyncId(PENDING_REGS_KEY, id);
        }
      }
    }
  }

  async syncFromServer() {
    if (typeof window === 'undefined') return { ok: false, error: 'SSR' };

    const requestedScope = this.isAuthenticated() && getStoredAdminToken() ? 'admin' : 'public';
    if (this._activeSyncPromise) {
      if (this._activeSyncScope === requestedScope || requestedScope === 'public') {
        return this._activeSyncPromise;
      }
      try {
        await this._activeSyncPromise;
      } catch {
        // Proceed with authenticated admin sync after public sync settles
      }
    }

    let currentPromise = null;
    this._activeSyncScope = requestedScope;
    currentPromise = (async () => {
      try {
        await this._flushPendingPublicWrites();
        const isAuth = this.isAuthenticated();
        const token = getStoredAdminToken();
        const scope = isAuth && token ? 'admin' : 'public';
        const headers = {};
        if (token) {
          headers['X-Admin-Token'] = token;
        }

        const res = await fetch(`${getSyncUrl()}?scope=${scope}&t=${Date.now()}`, {
          method: 'GET',
          headers,
          cache: 'no-store',
        });
        if (!res.ok) {
          return { ok: false, scope, status: res.status, error: `Server returned HTTP ${res.status}` };
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          return { ok: false, scope, error: 'Sync endpoint returned non-JSON response' };
        }
        const json = await res.json();
        if (scope === 'admin' && json?.authenticated === false) {
          this.logout();
          window.dispatchEvent(new CustomEvent('ecasi_session_invalidated'));
          return { ok: false, scope, authenticated: false, error: 'Administrator session expired' };
        }
        if (!json?.success || !json?.data) {
          return { ok: false, scope, error: json?.error || 'Invalid sync payload' };
        }

        const {
          registrations,
          inquiries,
          deletedInquiryIds,
          courses,
          vacancies,
          applications,
          accounts,
          invoices,
          payments,
          cohorts,
          communications,
          templates,
          announcements,
          cmsContent,
          gallery,
          galleryCustomized,
          resources,
          resourcesCustomized,
          settings,
          auditEvents,
        } = json.data;

        try {
          dataService.applyServerMediaSnapshot({ gallery, galleryCustomized, resources, resourcesCustomized });
        } catch {
          // ignore
        }

        try {
          if (Array.isArray(invoices)) localStorage.setItem('ecasi_msimamizi_invoices_v1', JSON.stringify(invoices));
          if (Array.isArray(payments)) localStorage.setItem('ecasi_msimamizi_payments_v1', JSON.stringify(payments));
          if (Array.isArray(cohorts)) localStorage.setItem('ecasi_msimamizi_cohorts_v1', JSON.stringify(cohorts));
          if (Array.isArray(communications)) localStorage.setItem('ecasi_msimamizi_communications_v1', JSON.stringify(communications));
          if (Array.isArray(templates) && templates.length > 0) localStorage.setItem('ecasi_msimamizi_templates_v1', JSON.stringify(templates));
          if (Array.isArray(announcements)) localStorage.setItem('ecasi_msimamizi_announcements_v1', JSON.stringify(announcements));
          if (cmsContent && typeof cmsContent === 'object' && Object.keys(cmsContent).length > 0) {
            localStorage.setItem('ecasi_msimamizi_cms_v1', JSON.stringify(cmsContent));
          }
          if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
            localStorage.setItem('ecasi_msimamizi_settings_v1', JSON.stringify(settings));
          }
          if (Array.isArray(auditEvents)) localStorage.setItem('ecasi_msimamizi_audit_events_v1', JSON.stringify(auditEvents));
          window.dispatchEvent(new CustomEvent('ecasi_enterprise_updated', { detail: { topic: 'server_sync' } }));
        } catch {
          // ignore storage quota errors on secondary cache
        }

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

        if (scope === 'admin' && Array.isArray(inquiries)) {
          let localDeletedIds = [];
          try {
            const rawDel = localStorage.getItem(DELETED_INQUIRIES_KEY);
            localDeletedIds = rawDel ? JSON.parse(rawDel) : [];
          } catch {
            localDeletedIds = [];
          }
          const deletedSet = new Set([
            ...(Array.isArray(deletedInquiryIds) ? deletedInquiryIds : []),
            ...(Array.isArray(localDeletedIds) ? localDeletedIds : []),
          ]);
          try {
            localStorage.setItem(DELETED_INQUIRIES_KEY, JSON.stringify(Array.from(deletedSet).slice(0, 2000)));
          } catch {
            // ignore
          }

          const serverKeys = new Set();
          inquiries.forEach((inq) => {
            if (inq?.id) serverKeys.add(`id:${inq.id}`);
            if (inq?.referenceNo) serverKeys.add(`ref:${inq.referenceNo}`);
          });

          const localInq = this.getInquiries();
          const unsyncedLocal = localInq
            .filter((inq) => {
              if (!inq || (inq.id && deletedSet.has(inq.id))) return false;
              const hasId = inq.id && serverKeys.has(`id:${inq.id}`);
              const hasRef = inq.referenceNo && serverKeys.has(`ref:${inq.referenceNo}`);
              return !hasId && !hasRef;
            })
            .map((inq) => ({
              ...inq,
              id: inq.id || (inq.referenceNo ? `INQ-${String(inq.referenceNo).replace(/[^a-zA-Z0-9_-]/g, '')}` : `INQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`),
            }));

          let mergedAdded = 0;
          let finalInquiries = inquiries.filter((inq) => !inq?.id || !deletedSet.has(inq.id));
          if (unsyncedLocal.length > 0) {
            const mergeRes = await pushToServer({ action: 'merge_inquiries', inquiries: unsyncedLocal });
            if (mergeRes?.success && Array.isArray(mergeRes.inquiries)) {
              finalInquiries = mergeRes.inquiries;
              mergedAdded = Number(mergeRes.added || 0);
              if (mergedAdded > 0) {
                realtimeService.publish('inquiries', { action: 'merge_inquiries', added: mergedAdded });
              }
            } else {
              finalInquiries = [...unsyncedLocal, ...finalInquiries];
            }
          }

          localStorage.setItem(INQUIRIES_KEY, JSON.stringify(finalInquiries));
          window.dispatchEvent(new CustomEvent('ecasi_inquiry_updated'));
          this._lastSyncStats = {
            scope,
            inquiriesCount: finalInquiries.length,
            mergedAdded,
            registrationsCount: Array.isArray(registrations) ? registrations.length : this.getRegistrations().length,
          };
        } else {
          this._lastSyncStats = {
            scope,
            inquiriesCount: this.getInquiries().length,
            mergedAdded: 0,
            registrationsCount: Array.isArray(registrations) ? registrations.length : this.getRegistrations().length,
          };
        }

        if (Array.isArray(vacancies)) {
          localStorage.setItem(VACANCIES_KEY, JSON.stringify(vacancies));
          window.dispatchEvent(new CustomEvent('ecasi_vacancies_updated'));
        }

        if (Array.isArray(applications) && applications.length > 0) {
          const localApps = this.getApplications();
          const mergedAppsMap = new Map();
          [...applications, ...localApps].forEach((app) => {
            const key = app.id || app.referenceNo;
            if (key && !mergedAppsMap.has(key)) {
              mergedAppsMap.set(key, app);
            }
          });
          const mergedApps = Array.from(mergedAppsMap.values());
          localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(mergedApps));
          window.dispatchEvent(new CustomEvent('ecasi_applications_updated'));
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
              name: rem.name || existing.name || '',
              role: rem.role || existing.role || 'Administrator',
              status: rem.status || existing.status || 'Active',
              passwordInitialized: Boolean(rem.passwordInitialized || existing.passwordInitialized),
              credentialDigest: rem.credentialDigest || existing.credentialDigest,
              updatedAt: rem.updatedAt || existing.updatedAt,
            });
          });
          localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(Array.from(accountMap.values())));
          window.dispatchEvent(new CustomEvent('ecasi_accounts_updated'));
        }
        return { ok: true, ...(this._lastSyncStats || { scope }) };
      } catch (err) {
        return { ok: false, error: err?.message || 'Network sync error' };
      } finally {
        if (this._activeSyncPromise === currentPromise) {
          this._activeSyncPromise = null;
          this._activeSyncScope = null;
        }
      }
    })();

    this._activeSyncPromise = currentPromise;
    return currentPromise;
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
      enqueuePendingSyncId(PENDING_REGS_KEY, newRecord.id);
      pushToServerWithStatus({ action: 'add_registration', registration: newRecord }, { beaconFallback: true }).then((res) => {
        if (res?.ok && res.data?.success) {
          dequeuePendingSyncId(PENDING_REGS_KEY, newRecord.id);
        }
        realtimeService.publish('registrations', { action: 'add_registration', id: newRecord.id });
      });

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
      pushToServer({ action: 'set_registrations', registrations: updated }).then(() => realtimeService.publish('registrations'));
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
      pushToServer({ action: 'set_registrations', registrations: updated }).then(() => realtimeService.publish('registrations'));
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

  addInquiry(inqData, options = {}) {
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

      const resolvedChannel = inqData.channel || 'WhatsApp';
      const standardSources = ['Website', 'WhatsApp', 'Email', 'Telephone', 'Social Media', 'Manual Registration'];
      const resolvedSource = inqData.leadSource || (standardSources.includes(resolvedChannel) ? resolvedChannel : 'Website');

      const newInquiry = {
        id: newId,
        referenceNo: newRef,
        channel: resolvedChannel,
        leadSource: resolvedSource,
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
      enqueuePendingSyncId(PENDING_INQUIRIES_KEY, newInquiry.id);
      pushToServerWithStatus(
        { action: 'add_inquiry', inquiry: newInquiry },
        { beaconFallback: true, beaconFirst: Boolean(options.beaconFirst) }
      ).then((res) => {
        if (res?.ok && res.data?.success) {
          dequeuePendingSyncId(PENDING_INQUIRIES_KEY, newInquiry.id);
        }
        realtimeService.publish('inquiries', { action: 'add_inquiry', id: newInquiry.id });
      });
      realtimeService.publish('inquiries', { action: 'add_inquiry', id: newInquiry.id });
      window.dispatchEvent(new CustomEvent('ecasi_inquiry_updated', { detail: newInquiry }));
      return newInquiry;
    } catch (e) {
      console.error('Failed to record inquiry:', e);
      return null;
    }
  }

  trackOutboundChannel(channel, label, extra = {}) {
    if (typeof window === 'undefined') return null;
    try {
      const pagePath = window.location.pathname || '/';
      const cooldownKey = `ecasi_track_${channel}_${extra.courseTitle || pagePath}`;
      const last = Number(sessionStorage.getItem(cooldownKey) || 0);
      const now = Date.now();
      if (now - last < 5 * 60 * 1000) return null;
      sessionStorage.setItem(cooldownKey, String(now));
      return this.addInquiry(
        {
          channel,
          leadSource: ['Website', 'WhatsApp', 'Email', 'Telephone', 'Social Media'].includes(channel) ? channel : 'Website',
          inquiryType: extra.inquiryType || `${label} Inquiry`,
          fullName: extra.fullName || `Website Visitor (${label})`,
          courseTitle: extra.courseTitle || 'General Institutional Inquiry',
          venue: extra.venue || 'Nairobi / Online',
          message: extra.message || `Visitor initiated ${label} from ${pagePath}.`,
        },
        { beaconFirst: true }
      );
    } catch {
      return null;
    }
  }

  updateInquiry(id, updates) {
    if (typeof window === 'undefined') return false;
    try {
      const existing = this.getInquiries();
      const target = existing.find((inq) => inq.id === id);
      const updated = existing.map((inq) =>
        inq.id === id ? { ...inq, ...updates, updatedAt: new Date().toISOString() } : inq
      );
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
      pushToServer({
        action: 'update_inquiry',
        id,
        updates,
        ...(target ? { inquiry: target } : {}),
      }, { beaconFallback: true }).then(() => realtimeService.publish('inquiries', { action: 'update_inquiry', id }));
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
      try {
        const rawDel = localStorage.getItem(DELETED_INQUIRIES_KEY);
        const delList = rawDel ? JSON.parse(rawDel) : [];
        if (id && Array.isArray(delList) && !delList.includes(id)) {
          delList.unshift(id);
          localStorage.setItem(DELETED_INQUIRIES_KEY, JSON.stringify(delList.slice(0, 2000)));
        }
      } catch {
        // ignore tombstone write failure
      }
      pushToServer({ action: 'delete_inquiry', id }, { beaconFallback: true }).then(() => realtimeService.publish('inquiries', { action: 'delete_inquiry', id }));
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
    this.triggerCSVDownload(csv, `ECAS_Portal_Inquiries_${new Date().toISOString().split('T')[0]}.csv`);
  }

  triggerCSVDownload(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ─── Job Vacancies & CV Applications (Website <-> Msimamizi) ────────────
  getApplications() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(APPLICATIONS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to get vacancy applications:', e);
      return [];
    }
  }

  async addApplication(appData) {
    if (typeof window === 'undefined') return null;
    try {
      const existing = this.getApplications();
      const newId = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRef = appData.referenceNo || `CV-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();
      const displayDate = new Date().toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newApp = {
        id: newId,
        referenceNo: newRef,
        jobId: appData.jobId || 'speculative',
        jobTitle: appData.jobTitle || 'Speculative Application',
        fullName: appData.fullName || '',
        email: appData.email || '',
        phone: appData.phone || '',
        nationalId: appData.nationalId || '',
        gender: appData.gender || '',
        dateOfBirth: appData.dateOfBirth || '',
        county: appData.county || '',
        physicalAddress: appData.physicalAddress || '',
        disabilityStatus: appData.disabilityStatus || 'No',
        specialty: appData.specialty || '',
        careerSummary: appData.careerSummary || '',
        highestQualification: appData.highestQualification || '',
        education: Array.isArray(appData.education) ? appData.education : [],
        professionalMemberships: appData.professionalMemberships || {},
        experience: Array.isArray(appData.experience) ? appData.experience : [],
        referees: Array.isArray(appData.referees) ? appData.referees : [],
        complianceChecklist: Array.isArray(appData.complianceChecklist) ? appData.complianceChecklist : [],
        coverLetter: appData.coverLetter || '',
        cvFileName: appData.cvFileName || '',
        cvFileType: appData.cvFileType || '',
        cvFileSize: Number(appData.cvFileSize) || 0,
        cvDataUrl: appData.cvDataUrl || '',
        certFileName: appData.certFileName || '',
        certFileType: appData.certFileType || '',
        certFileSize: Number(appData.certFileSize) || 0,
        certDataUrl: appData.certDataUrl || '',
        declarationAccepted: Boolean(appData.declarationAccepted),
        status: appData.status || 'New',
        adminNotes: appData.adminNotes || '',
        createdAt: nowIso,
        displayDate,
      };

      const updated = [newApp, ...existing];
      try {
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
      } catch {
        // Keep metadata locally if large base64 attachments hit localStorage quota; full files upload to server
        const slim = [{ ...newApp, cvDataUrl: '', certDataUrl: '' }, ...existing];
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(slim));
      }
      await pushToServer({ action: 'add_application', application: newApp });
      window.dispatchEvent(new CustomEvent('ecasi_applications_updated', { detail: newApp }));
      return newApp;
    } catch (e) {
      console.error('Failed to record vacancy application:', e);
      return null;
    }
  }

  updateApplication(id, updates) {
    if (typeof window === 'undefined') return false;
    try {
      const existing = this.getApplications();
      const updated = existing.map((app) =>
        app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
      );
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
      pushToServer({ action: 'set_applications', applications: updated });
      window.dispatchEvent(new CustomEvent('ecasi_applications_updated'));
      return true;
    } catch (e) {
      console.error('Failed to update application:', e);
      return false;
    }
  }

  deleteApplication(id) {
    if (typeof window === 'undefined') return false;
    try {
      const existing = this.getApplications();
      const updated = existing.filter((app) => app.id !== id);
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
      pushToServer({ action: 'set_applications', applications: updated });
      window.dispatchEvent(new CustomEvent('ecasi_applications_updated'));
      return true;
    } catch (e) {
      console.error('Failed to delete application:', e);
      return false;
    }
  }

  downloadApplicationsCSV() {
    const records = this.getApplications();
    if (!records || records.length === 0) {
      alert('No CV applications available to export.');
      return;
    }
    const headers = [
      'Reference No',
      'Date',
      'Position / Vacancy',
      'Status',
      'Applicant Name',
      'National ID / Passport',
      'Email',
      'Phone',
      'County / Location',
      'Area of Expertise',
      'Highest Qualification',
      'Experience Count',
      'Statutory Clearances',
      'CV File Name',
      'Certificates File',
      'Cover Letter',
    ];
    const rows = records.map((a) => [
      a.referenceNo || '',
      `"${a.displayDate || ''}"`,
      `"${(a.jobTitle || 'Speculative Application').replace(/"/g, '""')}"`,
      `"${a.status || 'New'}"`,
      `"${(a.fullName || '').replace(/"/g, '""')}"`,
      `"${(a.nationalId || '').replace(/"/g, '""')}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${(a.county || '').replace(/"/g, '""')}"`,
      `"${(a.specialty || '').replace(/"/g, '""')}"`,
      `"${(a.highestQualification || a.education?.[0]?.level || '').replace(/"/g, '""')}"`,
      Array.isArray(a.experience) ? a.experience.length : 0,
      `"${(Array.isArray(a.complianceChecklist) ? a.complianceChecklist.join('; ') : '').replace(/"/g, '""')}"`,
      `"${(a.cvFileName || '').replace(/"/g, '""')}"`,
      `"${(a.certFileName || '').replace(/"/g, '""')}"`,
      `"${(a.coverLetter || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.triggerCSVDownload(csv, `ECAS_Vacancy_Applications_${new Date().toISOString().split('T')[0]}.csv`);
  }

  // Dashboard Aggregates & KPIs
  getKPIs() {
    const list = this.getRegistrations();
    const inquiries = this.getInquiries();
    const applications = this.getApplications();
    const totalRegistrations = list.length;
    const pendingCount = list.filter((r) => r.status === 'Pending').length;
    const confirmedCount = list.filter((r) => r.status === 'Confirmed' && r.paymentStatus === 'Paid').length;
    const approvedCount = list.filter((r) => r.status === 'Approved').length;
    const totalDelegates = list
      .filter((r) => r.status === 'Confirmed' && r.paymentStatus === 'Paid')
      .reduce((acc, cur) => acc + (Number(cur.participantsCount) || 1), 0);
    const paidRevenueUSD = list
      .filter((r) => r.paymentStatus === 'Paid' && (r.status === 'Confirmed' || r.status === 'Completed' || r.workflowStage === 'Enrolment Confirmed' || r.workflowStage === 'Payment Confirmed'))
      .reduce((acc, cur) => acc + (Number(cur.totalFee) || 0), 0);
    const totalRevenueUSD = paidRevenueUSD;

    const totalInquiries = inquiries.length;
    const newInquiriesCount = inquiries.filter((i) => (i.status || 'New') === 'New').length;
    const whatsappInquiriesCount = inquiries.filter((i) => i.channel === 'WhatsApp').length;
    const emailInquiriesCount = inquiries.filter((i) => i.channel === 'Email').length;

    const totalApplications = applications.length;
    const newApplicationsCount = applications.filter((a) => (a.status || 'New') === 'New').length;
    const shortlistedApplicationsCount = applications.filter((a) => a.status === 'Shortlisted' || a.status === 'Interview').length;

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
      totalApplications,
      newApplicationsCount,
      shortlistedApplicationsCount,
      venueBreakdown: venueMap,
    };
  }

  // Designated Authorized Administrator Emails for Msimamizi Portal
  // Super Admins (Jacob Olonde & Gift Rioba) + any @ecasiafrica.org staff provisioned by them
  isAuthorizedAdminEmail(email) {
    const clean = normalizeAdminEmail(email);
    if (!clean) return false;
    if (isSuperAdminEmail(clean)) return true;
    if (!isValidInstitutionalEmail(clean)) return false;
    const accounts = this.getAdminAccounts();
    return accounts.some((a) => normalizeAdminEmail(a.email) === clean);
  }

  // Retrieve dynamic administrator accounts from persistent storage (digests only, never plaintext)
  getAdminAccounts() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize any legacy plaintext field & ensure Jacob & Gift always remain Super Admins
          const sanitized = parsed.map((a) => {
            const copy = { ...a };
            if (copy.password && !copy.credentialDigest) {
              copy.credentialDigest = computeCredentialDigest(copy.email, copy.password);
            }
            delete copy.password;
            const norm = normalizeAdminEmail(copy.email);
            if (isSuperAdminEmail(norm)) {
              copy.role = 'SUPER_ADMIN';
              copy.status = 'Active';
              if (!copy.name) {
                copy.name = norm.includes('jacob') || norm.includes('acob') ? 'Jacob Olonde' : 'Gift Rioba';
              }
            }
            return copy;
          });
          return sanitized;
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin accounts:', e);
    }

    const defaultAccounts = [
      {
        email: 'jacob@ecasiafrica.org',
        name: 'Jacob Olonde',
        credentialDigest: computeCredentialDigest('jacob@ecasiafrica.org', 'msimamizi2026'),
        role: 'SUPER_ADMIN',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        email: 'riobag@ecasiafrica.org',
        name: 'Gift Rioba',
        credentialDigest: computeCredentialDigest('riobag@ecasiafrica.org', 'msimamizi2026'),
        role: 'SUPER_ADMIN',
        status: 'Active',
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

  isPasswordInitialized(email) {
    const clean = normalizeAdminEmail(email);
    if (!clean) return false;
    const accounts = this.getAdminAccounts();
    const matched = accounts.find((a) => normalizeAdminEmail(a.email) === clean);
    return Boolean(matched?.passwordInitialized);
  }

  // One-time initial password creation (permanently locked once set; NEVER auto-logs in)
  async registerAdmin(email, password) {
    if (typeof window === 'undefined') return { success: false, message: 'Browser storage unavailable' };

    const cleanEmail = normalizeAdminEmail(email);
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your administrator email.' };
    }

    if (!this.isAuthorizedAdminEmail(cleanEmail)) {
      return {
        success: false,
        message: 'Unable to activate this account. Please verify your email or contact your system administrator.',
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

      // Local fast-guard: if password is already known to be initialized, block immediately
      if (existingIdx >= 0 && accounts[existingIdx].passwordInitialized) {
        return {
          success: false,
          code: 'PASSWORD_ALREADY_SET',
          message: 'Unable to complete setup for this account. Please sign in with your existing password.',
        };
      }

      const digest = computeCredentialDigest(cleanEmail, cleanPass);

      const serverRes = await pushToServerWithStatus({
        action: 'register_admin',
        email: cleanEmail,
        password: cleanPass,
        credentialDigest: digest,
        browserProfileId: getOrCreateBrowserProfileId(),
      });

      if (!serverRes.unreachable) {
        if (serverRes.status === 409 && serverRes.data?.code === 'PASSWORD_ALREADY_SET') {
          if (existingIdx >= 0) {
            accounts[existingIdx] = { ...accounts[existingIdx], passwordInitialized: true };
          } else {
            accounts.push({
              email: cleanEmail,
              role: isSuperAdminEmail(cleanEmail) ? 'SUPER_ADMIN' : 'SUPPORT_OFFICER',
              status: 'Active',
              passwordInitialized: true,
              updatedAt: new Date().toISOString(),
            });
          }
          localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
          return {
            success: false,
            code: 'PASSWORD_ALREADY_SET',
            message:
              serverRes.data?.error ||
              'Unable to complete setup for this account. Please sign in with your existing password.',
          };
        }
        if (!serverRes.ok || !serverRes.data?.success) {
          return {
            success: false,
            message: serverRes.data?.error || 'Unable to create administrator password. Please try again.',
          };
        }
      }

      const resolvedRole =
        serverRes.data?.user?.role ||
        (isSuperAdminEmail(cleanEmail) ? 'SUPER_ADMIN' : accounts[existingIdx]?.role || 'SUPPORT_OFFICER');

      const userRecord = {
        email: cleanEmail,
        credentialDigest: digest,
        passwordInitialized: true,
        role: resolvedRole,
        status: 'Active',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        accounts[existingIdx] = { ...accounts[existingIdx], ...userRecord };
      } else {
        userRecord.createdAt = new Date().toISOString();
        accounts.push(userRecord);
      }

      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent('ecasi_accounts_updated'));

      // SECURITY: Never auto-login after password creation. Require explicit Sign In.
      return {
        success: true,
        requiresSignIn: true,
        message:
          serverRes.data?.message ||
          'Account password configured successfully. Please sign in to continue.',
        user: { email: cleanEmail, role: resolvedRole },
      };
    } catch (e) {
      console.error('Failed to save admin account:', e);
      return { success: false, message: 'Failed to save account credentials. Please try again.' };
    }
  }

  // Touch current active session timestamp
  touchSessionActivity() {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== 'true') return;
    const now = Date.now();
    try {
      sessionStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(now));
      this._resumeLocalSessionLock();
    } catch {
      // ignore
    }
    if (now - (this._lastServerTouchAt || 0) >= 45000 && getStoredAdminToken()) {
      this._lastServerTouchAt = now;
      pushToServerWithStatus({ action: 'touch_activity' }).then((res) => {
        if (!res.unreachable && res.status === 401) {
          this.logout();
          window.dispatchEvent(new CustomEvent('ecasi_session_invalidated'));
        }
      });
    }
  }

  async verifyServerSession() {
    if (typeof window === 'undefined') return true;
    const token = getStoredAdminToken();
    if (!token) {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return this.isAuthenticated();
      }
      return false;
    }
    const res = await pushToServerWithStatus({ action: 'heartbeat' });
    if (!res.unreachable && res.status === 401) {
      this.logout();
      window.dispatchEvent(new CustomEvent('ecasi_session_invalidated'));
      return false;
    }
    return true;
  }

  getRemainingIdleMs() {
    if (typeof window === 'undefined') return 0;
    const rawLast = Number(sessionStorage.getItem(ADMIN_LAST_ACTIVITY_KEY) || 0);
    if (!rawLast) return ADMIN_SESSION_IDLE_TIMEOUT_MS;
    return Math.max(0, ADMIN_SESSION_IDLE_TIMEOUT_MS - (Date.now() - rawLast));
  }

  isSessionIdleExpired() {
    if (typeof window === 'undefined') return true;
    const rawLast = Number(sessionStorage.getItem(ADMIN_LAST_ACTIVITY_KEY) || 0);
    if (!rawLast) return false;
    return Date.now() - rawLast >= ADMIN_SESSION_IDLE_TIMEOUT_MS;
  }

  // Admin authentication check (strict per-tab session + silent 10-minute idle expiry; never auto-logs in via localStorage)
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    clearLegacyPersistentAuth();
    if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== 'true') return false;
    if (this.isSessionIdleExpired()) {
      this.logout();
      return false;
    }
    return true;
  }

  // Retrieve current authenticated admin profile
  getCurrentUser() {
    if (typeof window === 'undefined') return { email: 'riobag@ecasiafrica.org', role: 'Administrator' };
    try {
      const stored = sessionStorage.getItem(ADMIN_CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { email: 'riobag@ecasiafrica.org', role: 'Administrator' };
  }

  async login(usernameOrEmail, password) {
    const inputUser = normalizeAdminEmail(usernameOrEmail);
    const inputPass = (password || '').trim();

    if (!inputUser || !inputPass) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    if (!this.isAuthorizedAdminEmail(inputUser)) {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    // 1. Same-browser check: prevent 2nd / 3rd active tab/window session on the same account
    const lockedInBrowser = await this._isAccountLockedInBrowser(inputUser);
    if (lockedInBrowser) {
      return {
        success: false,
        message: 'This account is already signed in on another active session. Concurrent sessions on the same account are not permitted.',
      };
    }

    const accounts = this.getAdminAccounts();
    const candidateDigest = computeCredentialDigest(inputUser, inputPass);
    const matched = accounts.find((a) => normalizeAdminEmail(a.email) === inputUser);

    // 2. Authenticate strictly against central server when reachable (enforces cross-browser/cross-device single session)
    const serverRes = await pushToServerWithStatus({
      action: 'login',
      email: inputUser,
      password: inputPass,
      credentialDigest: candidateDigest,
      browserProfileId: getOrCreateBrowserProfileId(),
    });

    if (!serverRes.unreachable) {
      if (serverRes.status === 409 || serverRes.data?.code === 'SESSION_ALREADY_ACTIVE') {
        return {
          success: false,
          message:
            serverRes.data?.error ||
            'This account is already signed in on another active session. Concurrent sessions on the same account are not permitted.',
        };
      }
      if (!serverRes.ok || !serverRes.data?.success) {
        if (serverRes.data?.passwordInitialized && matched) {
          const updated = accounts.map((a) =>
            normalizeAdminEmail(a.email) === inputUser ? { ...a, passwordInitialized: true } : a
          );
          try {
            localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
        return {
          success: false,
          message:
            serverRes.data?.error ||
            'Invalid email or password. Please verify your credentials and try again.',
        };
      }

      const role = serverRes.data.user?.role || matched?.role || (isSuperAdminEmail(inputUser) ? 'SUPER_ADMIN' : 'SUPPORT_OFFICER');
      const updatedAccounts = [...accounts];
      const idx = updatedAccounts.findIndex((a) => normalizeAdminEmail(a.email) === inputUser);
      const record = {
        email: inputUser,
        credentialDigest: candidateDigest,
        passwordInitialized: true,
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

      if (serverRes.data.token) {
        this._storeToken(serverRes.data.token);
      }
      this._setAuthSession(inputUser, role);
      await this.syncFromServer();
      return { success: true, user: { email: inputUser, role } };
    }

    // 3. Offline / localhost fallback when PHP backend is unavailable
    const isMatchedDigest = matched && matched.credentialDigest === candidateDigest;
    const isBootstrapPass =
      !matched?.passwordInitialized &&
      (inputPass === 'msimamizi2026' || inputPass === '2026' || inputPass === 'ecasi2026!');

    if (isMatchedDigest || isBootstrapPass) {
      const role = matched?.role || (isSuperAdminEmail(inputUser) ? 'SUPER_ADMIN' : 'SUPPORT_OFFICER');
      this._setAuthSession(inputUser, role);
      return { success: true, user: { email: inputUser, role } };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please verify your credentials and try again.',
    };
  }

  _storeToken(token) {
    if (!token || typeof window === 'undefined') return;
    clearLegacyPersistentAuth();
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  _setAuthSession(email, role) {
    if (typeof window === 'undefined') return;
    clearLegacyPersistentAuth();
    getOrCreateTabSessionId();
    const userPayload = JSON.stringify({ email, role });
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    sessionStorage.setItem(ADMIN_CURRENT_USER_KEY, userPayload);
    sessionStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
    this._lastServerTouchAt = Date.now();
    this._setLocalSessionLock(email);
  }

  logout() {
    if (typeof window === 'undefined') return;
    const token = getStoredAdminToken();
    const cur = this.getCurrentUser();
    const email = normalizeAdminEmail(cur?.email || '');
    if (token) {
      sendKeepaliveLifecycle('logout', token);
    }
    if (email) {
      this._clearLocalSessionLock(email);
    }
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_CURRENT_USER_KEY);
    sessionStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
    clearLegacyPersistentAuth();
  }
}

export const adminRegistrationService = new AdminRegistrationService();
