/* global process, Buffer */
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, '.local-data');
const STORE_FILE = path.join(DATA_DIR, 'msimamizi_db.json');

const REALTIME_PORT = Number(process.env.REALTIME_PORT || 3001);

const SUPER_ADMINS = new Set([
  'jacob@ecasiafrica.org',
  'acob@ecasiafrica.org',
  'riobag@ecasiafrica.org',
  'gift@ecasiafrica.org',
]);

const ROLE_MATRIX = {
  SUPER_ADMIN: ['*'],
  ADMISSIONS_OFFICER: ['dashboard.view', 'admissions.view', 'admissions.write', 'crm.view', 'crm.write', 'courses.view', 'communications.view', 'communications.write', 'reports.view', 'reports.export'],
  FINANCE_OFFICER: ['dashboard.view', 'admissions.view', 'finance.view', 'finance.write', 'courses.view', 'communications.view', 'communications.write', 'reports.view', 'reports.export'],
  COURSE_MANAGER: ['dashboard.view', 'courses.view', 'courses.write', 'cms.view', 'cms.write', 'reports.view', 'reports.export'],
  RECRUITMENT_OFFICER: ['dashboard.view', 'recruitment.view', 'recruitment.write', 'communications.view', 'communications.write', 'reports.view', 'reports.export'],
  SUPPORT_OFFICER: ['dashboard.view', 'admissions.view', 'crm.view', 'crm.write', 'communications.view', 'communications.write', 'reports.view'],
  REPORTS_VIEWER: ['dashboard.view', 'admissions.view', 'crm.view', 'courses.view', 'finance.view', 'recruitment.view', 'reports.view', 'reports.export'],
};

function normalizeEmail(raw) {
  let clean = String(raw || '').trim().toLowerCase().replace(/^[.\s]+|[.\s]+$/g, '');
  if (clean && !clean.includes('@')) clean = `${clean}@ecasiafrica.org`;
  return clean;
}

function normalizeRole(role) {
  const r = String(role || '').trim().toUpperCase();
  const map = {
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'SUPER ADMIN': 'SUPER_ADMIN',
    'EXECUTIVE DIRECTOR': 'SUPER_ADMIN',
    'ADMINISTRATOR': 'SUPER_ADMIN',
    'ADMIN': 'SUPER_ADMIN',
    'ADMISSIONS_OFFICER': 'ADMISSIONS_OFFICER',
    'ADMISSIONS OFFICER': 'ADMISSIONS_OFFICER',
    'FINANCE_OFFICER': 'FINANCE_OFFICER',
    'FINANCE OFFICER': 'FINANCE_OFFICER',
    'COURSE_MANAGER': 'COURSE_MANAGER',
    'COURSE MANAGER': 'COURSE_MANAGER',
    'RECRUITMENT_OFFICER': 'RECRUITMENT_OFFICER',
    'RECRUITMENT OFFICER': 'RECRUITMENT_OFFICER',
    'SUPPORT_OFFICER': 'SUPPORT_OFFICER',
    'SUPPORT OFFICER': 'SUPPORT_OFFICER',
    'REPORTS_VIEWER': 'REPORTS_VIEWER',
    'REPORTS VIEWER': 'REPORTS_VIEWER',
  };
  return map[r] || 'SUPPORT_OFFICER';
}

function rolePermissions(role) {
  return ROLE_MATRIX[normalizeRole(role)] || ROLE_MATRIX.REPORTS_VIEWER;
}

function hasPerm(role, perm) {
  const perms = rolePermissions(role);
  return perms.includes('*') || perms.includes(perm);
}

function ensureDefaultStore() {
  return {
    registrations: [],
    inquiries: [],
    deletedInquiryIds: [],
    courses: {},
    vacancies: [],
    applications: [],
    invoices: [],
    payments: [],
    cohorts: [],
    communications: [],
    templates: [],
    announcements: [],
    cmsContent: {},
    gallery: null,
    galleryCustomized: false,
    resources: {},
    resourcesCustomized: {},
    settings: {},
    auditEvents: [],
    accounts: [],
    sessions: {},
    syncVersion: 1,
    lastSyncTopic: 'init',
    updatedAt: new Date().toISOString(),
  };
}

function readStore() {
  const defaults = ensureDefaultStore();
  try {
    if (!fs.existsSync(STORE_FILE)) return defaults;
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function writeStore(store, topic = 'sync') {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  store.syncVersion = Math.max(1, Number(store.syncVersion || 0) + 1);
  store.lastSyncTopic = topic;
  store.updatedAt = new Date().toISOString();
  const tmpFile = `${STORE_FILE}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmpFile, STORE_FILE);
  return store;
}

function sha256(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

function pruneSessions(store, nowMs) {
  const sessions = store.sessions && typeof store.sessions === 'object' ? store.sessions : {};
  for (const [key, sess] of Object.entries(sessions)) {
    if (!sess || sess.expiresAt < nowMs || (sess.closingAt && nowMs - sess.closingAt >= 2000)) {
      delete sessions[key];
    }
  }
  store.sessions = sessions;
}

function getBearerToken(req) {
  const header = req.headers['x-admin-token'] || req.headers['authorization'] || '';
  const str = Array.isArray(header) ? header[0] : String(header);
  if (str.toLowerCase().startsWith('bearer ')) return str.slice(7).trim();
  return str.trim();
}

function validateToken(store, token, extendIdle = true) {
  if (!token) return null;
  const now = Date.now();
  pruneSessions(store, now);
  const hash = sha256(token);
  const sess = store.sessions?.[hash];
  if (!sess) return null;
  if (extendIdle) {
    sess.expiresAt = now + 600 * 1000;
    sess.lastHeartbeatAt = now;
    delete sess.closingAt;
  }
  return normalizeEmail(sess.email);
}

function appendAudit(store, actor, role, action, entityType, affectedRecord = '', prevVal = '', newVal = '') {
  if (!Array.isArray(store.auditEvents)) store.auditEvents = [];
  store.auditEvents.unshift({
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    administrator: actor || 'system',
    role: normalizeRole(role),
    action,
    entityType,
    affectedRecord,
    previousValue: String(prevVal || '').slice(0, 400),
    newValue: String(newVal || '').slice(0, 400),
    timestamp: new Date().toISOString(),
  });
  store.auditEvents = store.auditEvents.slice(0, 5000);
}

function buildPublicPayload(store) {
  const publishedCms = {};
  for (const [k, sec] of Object.entries(store.cmsContent || {})) {
    if (sec && sec.status === 'Published') publishedCms[k] = sec;
  }
  const publishedAnnouncements = (store.announcements || []).filter((a) => a && a.status === 'Published');
  return {
    courses: store.courses || {},
    vacancies: store.vacancies || [],
    cohorts: store.cohorts || [],
    cmsContent: publishedCms,
    announcements: publishedAnnouncements,
    gallery: store.galleryCustomized ? (Array.isArray(store.gallery) ? store.gallery : []) : null,
    galleryCustomized: Boolean(store.galleryCustomized),
    resources: store.resources || {},
    resourcesCustomized: store.resourcesCustomized || {},
    syncVersion: store.syncVersion || 1,
    updatedAt: store.updatedAt || new Date().toISOString(),
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > 15 * 1024 * 1024) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
};

const sseClients = new Set();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  // Preflight CORS for cross-port browser tests
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (url.pathname === '/health') {
    return sendJson(res, 200, { ok: true, service: 'ecasi-realtime-socketio', port: REALTIME_PORT });
  }

  if (url.pathname !== '/api/msimamizi-sync.php' && url.pathname !== '/api/msimamizi-sync') {
    return sendJson(res, 404, { success: false, error: 'Endpoint not found' });
  }

  const emitSync = (topic, extra = {}) => {
    const evt = {
      topic,
      ts: Date.now(),
      ...extra,
    };
    io.emit('realtime:event', evt);
    for (const clientRes of sseClients) {
      try {
        clientRes.write(`event: sync_update\ndata: ${JSON.stringify(evt)}\n\n`);
      } catch {
        sseClients.delete(clientRes);
      }
    }
  };

  if (req.method === 'GET') {
    const scope = url.searchParams.get('scope') || 'public';

    if (scope === 'stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });
      const current = readStore();
      res.write(`event: connected\ndata: ${JSON.stringify({ version: current.syncVersion, topic: current.lastSyncTopic })}\n\n`);
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    const store = readStore();
    const isVerify = url.searchParams.get('verify') === '1';
    const token = getBearerToken(req);
    const adminEmail = validateToken(store, token, !isVerify);

    if (scope === 'health' && adminEmail) {
      const role = SUPER_ADMINS.has(adminEmail)
        ? 'SUPER_ADMIN'
        : normalizeRole(store.accounts?.find((a) => normalizeEmail(a.email) === adminEmail)?.role);
      return sendJson(res, 200, {
        success: true,
        health: {
          apiStatus: 'Operational (Local Socket.IO + JSON Store)',
          serverTime: new Date().toISOString(),
          storageWritable: true,
          realtimeClients: io.engine.clientsCount,
          counts: {
            registrations: store.registrations.length,
            inquiries: store.inquiries.length,
            courses: Object.keys(store.courses || {}).length,
            vacancies: store.vacancies.length,
            applications: store.applications.length,
          },
          actorRole: role,
        },
      });
    }

    if (scope === 'admin' && adminEmail) {
      writeStore(store, store.lastSyncTopic || 'session');
      const role = SUPER_ADMINS.has(adminEmail)
        ? 'SUPER_ADMIN'
        : normalizeRole(store.accounts?.find((a) => normalizeEmail(a.email) === adminEmail)?.role);
      if (isVerify) {
        return sendJson(res, 200, {
          success: true,
          authenticated: true,
          email: adminEmail,
          role,
          permissions: rolePermissions(role),
        });
      }
      return sendJson(res, 200, {
        success: true,
        authenticated: true,
        role,
        permissions: rolePermissions(role),
        data: {
          registrations: store.registrations || [],
          inquiries: store.inquiries || [],
          deletedInquiryIds: store.deletedInquiryIds || [],
          courses: store.courses || {},
          vacancies: store.vacancies || [],
          applications: store.applications || [],
          invoices: store.invoices || [],
          payments: store.payments || [],
          cohorts: store.cohorts || [],
          communications: store.communications || [],
          templates: store.templates || [],
          announcements: store.announcements || [],
          cmsContent: store.cmsContent || {},
          gallery: store.galleryCustomized ? (Array.isArray(store.gallery) ? store.gallery : []) : null,
          galleryCustomized: Boolean(store.galleryCustomized),
          resources: store.resources || {},
          resourcesCustomized: store.resourcesCustomized || {},
          settings: store.settings || {},
          auditEvents: store.auditEvents || [],
          accounts: (store.accounts || []).map((a) => ({
            email: a.email,
            name: a.name || '',
            passwordInitialized: Boolean(a.passwordInitialized),
            role: normalizeRole(a.role),
            status: a.status || 'Active',
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          })),
          syncVersion: store.syncVersion || 1,
          updatedAt: store.updatedAt,
        },
      });
    }

    if (scope === 'admin' && isVerify && !adminEmail) {
      return sendJson(res, 401, { success: false, authenticated: false, error: 'Session expired or invalid.' });
    }

    return sendJson(res, 200, {
      success: true,
      authenticated: false,
      data: buildPublicPayload(store),
    });
  }

  if (req.method === 'POST') {
    let payload;
    try {
      payload = await readJsonBody(req);
    } catch (err) {
      return sendJson(res, err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, {
        success: false,
        error: err.message,
      });
    }

    const action = String(payload.action || '');
    const store = readStore();

    // Public actions
    if (action === 'add_registration' && payload.registration) {
      const reg = payload.registration;
      const exists = store.registrations.some(
        (r) => (reg.id && r.id === reg.id) || (reg.referenceNo && r.referenceNo === reg.referenceNo)
      );
      if (!exists) {
        store.registrations.unshift({ ...reg, updatedAt: new Date().toISOString() });
        store.registrations = store.registrations.slice(0, 5000);
        writeStore(store, 'registrations');
        emitSync('registrations', { action: 'add_registration', id: reg.id });
      }
      return sendJson(res, 200, { success: true, id: reg.id, referenceNo: reg.referenceNo });
    }

    if (action === 'add_inquiry' && payload.inquiry) {
      const inq = { ...payload.inquiry };
      if (!inq.id) inq.id = `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!inq.referenceNo) inq.referenceNo = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const exists = store.inquiries.some(
        (x) => (inq.id && x.id === inq.id) || (inq.referenceNo && x.referenceNo === inq.referenceNo)
      );
      if (!exists) {
        store.inquiries.unshift({ ...inq, updatedAt: new Date().toISOString() });
        store.inquiries = store.inquiries.slice(0, 5000);
        store.deletedInquiryIds = (store.deletedInquiryIds || []).filter((id) => id !== inq.id);
        writeStore(store, 'inquiries');
        emitSync('inquiries', { action: 'add_inquiry', id: inq.id });
      }
      return sendJson(res, 200, { success: true, id: inq.id, referenceNo: inq.referenceNo });
    }

    if (action === 'add_application' && payload.application) {
      const app = payload.application;
      store.applications.unshift({ ...app, updatedAt: new Date().toISOString() });
      store.applications = store.applications.slice(0, 1000);
      writeStore(store, 'applications');
      emitSync('applications', { action: 'add_application', id: app.id });
      return sendJson(res, 200, { success: true, id: app.id, referenceNo: app.referenceNo });
    }

    if (action === 'register_admin') {
      const email = normalizeEmail(payload.email);
      const pass = String(payload.password || '').trim();
      if (!email || !email.endsWith('@ecasiafrica.org') || pass.length < 6) {
        return sendJson(res, 400, { success: false, error: 'Valid @ecasiafrica.org email and 6+ char password required.' });
      }
      const idx = store.accounts.findIndex((a) => normalizeEmail(a.email) === email);
      if (idx >= 0 && store.accounts[idx].passwordInitialized) {
        return sendJson(res, 409, { success: false, code: 'PASSWORD_ALREADY_SET', error: 'Account already initialized.' });
      }
      const role = SUPER_ADMINS.has(email) ? 'SUPER_ADMIN' : (store.accounts[idx]?.role || 'SUPPORT_OFFICER');
      const rec = {
        email,
        name: store.accounts[idx]?.name || (email.includes('jacob') ? 'Jacob Olonde' : email.includes('rioba') || email.includes('gift') ? 'Gift Rioba' : email.split('@')[0]),
        credentialDigest: payload.credentialDigest || '',
        passwordInitialized: true,
        role: normalizeRole(role),
        status: 'Active',
        createdAt: store.accounts[idx]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) store.accounts[idx] = rec;
      else store.accounts.push(rec);
      writeStore(store, 'accounts');
      return sendJson(res, 200, { success: true, user: { email, role: rec.role } });
    }

    if (action === 'login') {
      const email = normalizeEmail(payload.email);
      const pass = String(payload.password || '').trim();
      const digest = String(payload.credentialDigest || '');
      const account = store.accounts.find((a) => normalizeEmail(a.email) === email);
      const isBootstrap = !account?.passwordInitialized && ['msimamizi2026', '2026', 'ecasi2026!'].includes(pass);
      const matchesDigest = Boolean(account?.credentialDigest && account.credentialDigest === digest);
      if (!email || !email.endsWith('@ecasiafrica.org') || (!matchesDigest && !isBootstrap)) {
        return sendJson(res, 401, { success: false, error: 'Invalid email or password.' });
      }
      const role = SUPER_ADMINS.has(email) ? 'SUPER_ADMIN' : normalizeRole(account?.role);
      const token = crypto.randomBytes(24).toString('hex');
      const now = Date.now();
      pruneSessions(store, now);
      store.sessions[sha256(token)] = {
        email,
        role,
        browserProfileId: payload.browserProfileId || '',
        expiresAt: now + 600 * 1000,
        lastHeartbeatAt: now,
      };
      writeStore(store, 'session');
      return sendJson(res, 200, { success: true, token, user: { email, role, permissions: rolePermissions(role) } });
    }

    if (action === 'logout' || action === 'tab_closing' || action === 'heartbeat') {
      const tok = payload.token || getBearerToken(req);
      if (tok) {
        const hash = sha256(tok);
        if (store.sessions?.[hash]) {
          if (action === 'logout') delete store.sessions[hash];
          else if (action === 'tab_closing') store.sessions[hash].closingAt = Date.now();
          else {
            store.sessions[hash].lastHeartbeatAt = Date.now();
            store.sessions[hash].expiresAt = Date.now() + 600 * 1000;
          }
          writeStore(store, 'session');
        }
      }
      return sendJson(res, 200, { success: true });
    }

    // Authenticated admin writes
    const token = getBearerToken(req);
    const adminEmail = validateToken(store, token, true);
    if (!adminEmail) {
      return sendJson(res, 401, { success: false, authenticated: false, error: 'Administrator session expired.' });
    }
    const adminRole = SUPER_ADMINS.has(adminEmail)
      ? 'SUPER_ADMIN'
      : normalizeRole(store.accounts.find((a) => normalizeEmail(a.email) === adminEmail)?.role);

    const deny = (perm) => {
      if (!hasPerm(adminRole, perm)) {
        sendJson(res, 403, { success: false, error: `Insufficient permissions (${perm})` });
        return true;
      }
      return false;
    };

    if (action === 'touch_activity') {
      writeStore(store, 'session');
      return sendJson(res, 200, { success: true, email: adminEmail, role: adminRole });
    }

    if (action === 'merge_inquiries' && Array.isArray(payload.inquiries)) {
      if (deny('crm.view')) return;
      const seen = new Set();
      store.inquiries.forEach((x) => {
        if (x?.id) seen.add(`id:${x.id}`);
        if (x?.referenceNo) seen.add(`ref:${x.referenceNo}`);
      });
      const deleted = new Set(store.deletedInquiryIds || []);
      let added = 0;
      for (const raw of payload.inquiries) {
        if (!raw || typeof raw !== 'object') continue;
        const cand = { ...raw };
        if (!cand.id) cand.id = `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        if (deleted.has(cand.id)) continue;
        if (seen.has(`id:${cand.id}`) || (cand.referenceNo && seen.has(`ref:${cand.referenceNo}`))) continue;
        store.inquiries.unshift(cand);
        seen.add(`id:${cand.id}`);
        if (cand.referenceNo) seen.add(`ref:${cand.referenceNo}`);
        added++;
      }
      if (added > 0) {
        store.inquiries.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        writeStore(store, 'inquiries');
        emitSync('inquiries', { action: 'merge_inquiries', added });
      }
      return sendJson(res, 200, { success: true, added, inquiries: store.inquiries, deletedInquiryIds: store.deletedInquiryIds });
    }

    if (action === 'update_inquiry' && payload.id && payload.updates) {
      if (deny('crm.write')) return;
      const idx = store.inquiries.findIndex((x) => x.id === payload.id);
      if (idx >= 0) store.inquiries[idx] = { ...store.inquiries[idx], ...payload.updates, updatedAt: new Date().toISOString() };
      else if (payload.inquiry) store.inquiries.unshift({ ...payload.inquiry, ...payload.updates, id: payload.id });
      writeStore(store, 'inquiries');
      emitSync('inquiries', { action: 'update_inquiry', id: payload.id });
      return sendJson(res, 200, { success: true, inquiries: store.inquiries });
    }

    if (action === 'delete_inquiry' && payload.id) {
      if (deny('crm.write')) return;
      store.inquiries = store.inquiries.filter((x) => x.id !== payload.id);
      if (!store.deletedInquiryIds.includes(payload.id)) store.deletedInquiryIds.unshift(payload.id);
      writeStore(store, 'inquiries');
      emitSync('inquiries', { action: 'delete_inquiry', id: payload.id });
      return sendJson(res, 200, { success: true, inquiries: store.inquiries, deletedInquiryIds: store.deletedInquiryIds });
    }

    if (action === 'set_inquiries' && Array.isArray(payload.inquiries)) {
      if (deny('crm.write')) return;
      store.inquiries = payload.inquiries;
      appendAudit(store, adminEmail, adminRole, 'UPDATE_LEADS', 'Lead', `Total: ${payload.inquiries.length}`);
      writeStore(store, 'inquiries');
      emitSync('inquiries', { action: 'set_inquiries' });
      return sendJson(res, 200, { success: true, count: store.inquiries.length });
    }

    if (action === 'set_registrations' && Array.isArray(payload.registrations)) {
      if (deny('admissions.write')) return;
      store.registrations = payload.registrations;
      appendAudit(store, adminEmail, adminRole, 'UPDATE_REGISTRATIONS', 'Registration', `Total: ${payload.registrations.length}`);
      writeStore(store, 'registrations');
      emitSync('registrations', { action: 'set_registrations' });
      return sendJson(res, 200, { success: true, count: store.registrations.length });
    }

    if (action === 'set_applications' && Array.isArray(payload.applications)) {
      if (deny('recruitment.write')) return;
      store.applications = payload.applications;
      writeStore(store, 'applications');
      emitSync('applications', { action: 'set_applications' });
      return sendJson(res, 200, { success: true, count: store.applications.length });
    }

    if (action === 'set_vacancies' && Array.isArray(payload.vacancies)) {
      if (deny('recruitment.write')) return;
      store.vacancies = payload.vacancies;
      writeStore(store, 'vacancies');
      emitSync('vacancies', { action: 'set_vacancies' });
      return sendJson(res, 200, { success: true, count: store.vacancies.length });
    }

    if (action === 'set_courses' && payload.courses && typeof payload.courses === 'object') {
      if (deny('courses.write')) return;
      store.courses = payload.courses;
      writeStore(store, 'courses');
      emitSync('courses', { action: 'set_courses' });
      return sendJson(res, 200, { success: true, count: Object.keys(store.courses).length });
    }

    if (action === 'set_gallery' && Array.isArray(payload.gallery)) {
      if (deny('cms.write')) return;
      store.gallery = payload.gallery;
      store.galleryCustomized = true;
      appendAudit(store, adminEmail, adminRole, 'UPDATE_GALLERY', 'Gallery', `Total images: ${payload.gallery.length}`, '', 'Synced to public gallery');
      writeStore(store, 'gallery');
      emitSync('gallery', { action: 'set_gallery', count: store.gallery.length });
      return sendJson(res, 200, { success: true, count: store.gallery.length, gallery: store.gallery, syncVersion: store.syncVersion });
    }

    if (action === 'set_resources' && typeof payload.resourceType === 'string' && Array.isArray(payload.items)) {
      if (deny('cms.write')) return;
      const validTypes = ['publications', 'reports', 'policies', 'videos', 'books', 'policyBriefs'];
      if (!validTypes.includes(payload.resourceType)) {
        return sendJson(res, 400, { success: false, error: 'Unsupported resourceType' });
      }
      if (!store.resources || typeof store.resources !== 'object') store.resources = {};
      if (!store.resourcesCustomized || typeof store.resourcesCustomized !== 'object') store.resourcesCustomized = {};
      store.resources[payload.resourceType] = payload.items;
      store.resourcesCustomized[payload.resourceType] = true;
      appendAudit(store, adminEmail, adminRole, 'UPDATE_RESOURCES', 'Resource', `${payload.resourceType}: ${payload.items.length} items`, '', 'Synced live');
      writeStore(store, 'resources');
      emitSync('resources', { action: 'set_resources', resourceType: payload.resourceType, count: payload.items.length });
      return sendJson(res, 200, {
        success: true,
        resourceType: payload.resourceType,
        count: payload.items.length,
        items: payload.items,
        syncVersion: store.syncVersion,
      });
    }

    if (action === 'set_cms_content' && payload.cmsContent) {
      if (deny('cms.write')) return;
      store.cmsContent = payload.cmsContent;
      writeStore(store, 'cms');
      emitSync('cms', { action: 'set_cms_content' });
      return sendJson(res, 200, { success: true });
    }

    if (action === 'set_announcements' && Array.isArray(payload.announcements)) {
      if (deny('communications.write')) return;
      store.announcements = payload.announcements;
      writeStore(store, 'announcements');
      emitSync('announcements', { action: 'set_announcements' });
      return sendJson(res, 200, { success: true });
    }

    if (action === 'set_cohorts' && Array.isArray(payload.cohorts)) {
      if (deny('courses.write')) return;
      store.cohorts = payload.cohorts;
      writeStore(store, 'cohorts');
      emitSync('cohorts', { action: 'set_cohorts' });
      return sendJson(res, 200, { success: true });
    }

    if (action === 'set_invoices' && Array.isArray(payload.invoices)) {
      if (deny('finance.write')) return;
      store.invoices = payload.invoices;
      writeStore(store, 'finance');
      emitSync('finance', { action: 'set_invoices' });
      return sendJson(res, 200, { success: true });
    }

    if (action === 'set_payments' && Array.isArray(payload.payments)) {
      if (deny('finance.write')) return;
      store.payments = payload.payments;
      writeStore(store, 'finance');
      emitSync('finance', { action: 'set_payments' });
      return sendJson(res, 200, { success: true });
    }

    if (action === 'set_communications' && Array.isArray(payload.communications)) {
      if (deny('communications.write')) return;
      store.communications = payload.communications;
      writeStore(store, 'communications');
      emitSync('communications', { action: 'set_communications' });
      return sendJson(res, 200, { success: true });
    }

    if (action === 'set_templates' && Array.isArray(payload.templates)) {
      if (deny('communications.write')) return;
      store.templates = payload.templates;
      writeStore(store, 'communications');
      return sendJson(res, 200, { success: true });
    }

    if (action === 'set_settings' && payload.settings) {
      if (deny('admin.manage')) return;
      store.settings = payload.settings;
      writeStore(store, 'settings');
      emitSync('settings', { action: 'set_settings' });
      return sendJson(res, 200, { success: true });
    }

    if (action === 'provision_staff' && payload.account) {
      if (deny('admin.manage')) return;
      const email = normalizeEmail(payload.account.email);
      const role = normalizeRole(payload.account.role);
      const idx = store.accounts.findIndex((a) => normalizeEmail(a.email) === email);
      if (idx >= 0) store.accounts[idx] = { ...store.accounts[idx], ...payload.account, email, role };
      else store.accounts.push({ ...payload.account, email, role });
      writeStore(store, 'accounts');
      return sendJson(res, 200, { success: true });
    }

    if (action === 'remove_staff' && payload.email) {
      if (deny('admin.manage')) return;
      const email = normalizeEmail(payload.email);
      if (SUPER_ADMINS.has(email)) return sendJson(res, 403, { success: false, error: 'Cannot remove Super Admin' });
      store.accounts = store.accounts.filter((a) => normalizeEmail(a.email) !== email);
      writeStore(store, 'accounts');
      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 400, { success: false, error: `Unsupported action: ${action}` });
  }

  return sendJson(res, 405, { success: false, error: 'Method not allowed' });
});

const io = new SocketIOServer(server, {
  path: '/socket.io',
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 5e6,
});

io.on('connection', (socket) => {
  socket.join('ecasi-global');
  const current = readStore();
  socket.emit('realtime:hello', {
    connected: true,
    version: current.syncVersion,
    topic: current.lastSyncTopic,
    serverTime: new Date().toISOString(),
  });

  socket.on('realtime:broadcast', (msg) => {
    if (!msg || typeof msg !== 'object') return;
    socket.broadcast.to('ecasi-global').emit('realtime:event', {
      topic: String(msg.topic || 'sync'),
      sourceId: msg.sourceId || socket.id,
      payload: msg.payload || null,
      ts: Date.now(),
    });
  });
});

server.listen(REALTIME_PORT, '0.0.0.0', () => {
  console.log(`[ECASI Socket.IO Realtime Server] listening on http://0.0.0.0:${REALTIME_PORT}`);
});
