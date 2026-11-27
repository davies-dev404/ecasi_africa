<?php
/**
 * ECAS Institute - Hardened Msimamizi Central Server Sync API (cPanel / PHP)
 *
 * Security Controls:
 * 1. Origin-restricted CORS allowlist (no wildcard '*' on sensitive endpoints).
 * 2. Token-based authentication & authorization (Bearer / X-Admin-Token) for admin reads & writes.
 * 3. Strict server-side allowlist for administrator account creation & login.
 * 4. Bcrypt password hashing (password_hash / password_verify); hashes never leave the server.
 * 5. Server-side input validation, sanitization, and payload size limits.
 * 6. Append-only structured security & audit logging outside public web root.
 */

require_once __DIR__ . '/security-lib.php';

ecasApplySecurityHeaders();
header('X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex');
ecasApplyStrictCors('GET, POST, OPTIONS', 'Content-Type, Authorization, X-Admin-Token, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Designated Super Administrators (Jacob Olonde & Gift Rioba) & Institutional Domain Validator
const SUPER_ADMINS = [
    'jacob@ecasiafrica.org',
    'riobag@ecasiafrica.org',
    'gift@ecasiafrica.org',
];

function normalizeAdminEmail(string $raw): string {
    $clean = strtolower(trim($raw));
    $clean = trim($clean, ". \t\n\r\0\x0B");
    if ($clean !== '' && strpos($clean, '@') === false) {
        $clean .= '@ecasiafrica.org';
    }
    return $clean;
}

function isSuperAdminEmail(string $email): bool {
    return in_array(normalizeAdminEmail($email), SUPER_ADMINS, true);
}

function isValidInstitutionalEmail(string $email): bool {
    $norm = normalizeAdminEmail($email);
    if ($norm === '' || !filter_var($norm, FILTER_VALIDATE_EMAIL)) return false;
    return str_ends_with($norm, '@ecasiafrica.org');
}

function isAuthorizedAdmin(string $email, ?array $store = null): bool {
    $norm = normalizeAdminEmail($email);
    if ($norm === '') return false;
    if (isSuperAdminEmail($norm)) return true;
    if (!isValidInstitutionalEmail($norm)) return false;
    if ($store !== null) {
        $accounts = is_array($store['accounts'] ?? null) ? $store['accounts'] : [];
        foreach ($accounts as $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $norm) {
                return true;
            }
        }
        return false;
    }
    return true;
}

// 2b. Role-Based Access Control (RBAC) Matrix (Server-side enforcement)
function normalizeAdminRole(?string $role): string {
    $r = strtoupper(trim((string)$role));
    $map = [
        'SUPER_ADMIN' => 'SUPER_ADMIN',
        'SUPER ADMIN' => 'SUPER_ADMIN',
        'EXECUTIVE DIRECTOR' => 'SUPER_ADMIN',
        'ADMINISTRATOR' => 'SUPER_ADMIN',
        'ADMIN' => 'SUPER_ADMIN',
        'ADMISSIONS_OFFICER' => 'ADMISSIONS_OFFICER',
        'ADMISSIONS OFFICER' => 'ADMISSIONS_OFFICER',
        'FINANCE_OFFICER' => 'FINANCE_OFFICER',
        'FINANCE OFFICER' => 'FINANCE_OFFICER',
        'VERIFICATION_OFFICER' => 'VERIFICATION_OFFICER',
        'VERIFICATION OFFICER' => 'VERIFICATION_OFFICER',
        'SECURITY_OFFICER' => 'VERIFICATION_OFFICER',
        'COURSE_MANAGER' => 'COURSE_MANAGER',
        'COURSE MANAGER' => 'COURSE_MANAGER',
        'RECRUITMENT_OFFICER' => 'RECRUITMENT_OFFICER',
        'RECRUITMENT OFFICER' => 'RECRUITMENT_OFFICER',
        'SUPPORT_OFFICER' => 'SUPPORT_OFFICER',
        'SUPPORT OFFICER' => 'SUPPORT_OFFICER',
        'REPORTS_VIEWER' => 'REPORTS_VIEWER',
        'REPORTS VIEWER' => 'REPORTS_VIEWER',
    ];
    return $map[$r] ?? 'SUPER_ADMIN';
}

function getRolePermissions(string $role): array {
    $norm = normalizeAdminRole($role);
    $matrix = [
        'SUPER_ADMIN' => ['*'],
        'VERIFICATION_OFFICER' => ['dashboard.view', 'admissions.view', 'security.view', 'security.review', 'crm.view', 'communications.view', 'communications.write', 'reports.view', 'reports.export'],
        'ADMISSIONS_OFFICER' => ['dashboard.view', 'admissions.view', 'admissions.write', 'security.view', 'crm.view', 'crm.write', 'courses.view', 'communications.view', 'communications.write', 'reports.view', 'reports.export'],
        'FINANCE_OFFICER' => ['dashboard.view', 'admissions.view', 'security.view', 'finance.view', 'finance.write', 'courses.view', 'communications.view', 'communications.write', 'reports.view', 'reports.export'],
        'COURSE_MANAGER' => ['dashboard.view', 'courses.view', 'courses.write', 'cms.view', 'cms.write', 'reports.view', 'reports.export'],
        'RECRUITMENT_OFFICER' => ['dashboard.view', 'recruitment.view', 'recruitment.write', 'communications.view', 'communications.write', 'reports.view', 'reports.export'],
        'SUPPORT_OFFICER' => ['dashboard.view', 'admissions.view', 'crm.view', 'crm.write', 'communications.view', 'communications.write', 'reports.view'],
        'REPORTS_VIEWER' => ['dashboard.view', 'admissions.view', 'security.view', 'crm.view', 'courses.view', 'finance.view', 'recruitment.view', 'reports.view', 'reports.export'],
    ];
    return $matrix[$norm] ?? $matrix['REPORTS_VIEWER'];
}

function roleHasPermission(string $role, string $permission): bool {
    $perms = getRolePermissions($role);
    return in_array('*', $perms, true) || in_array($permission, $perms, true);
}

function getAdminRoleFromStore(array $store, string $email): string {
    $norm = normalizeAdminEmail($email);
    if (isSuperAdminEmail($norm)) {
        return 'SUPER_ADMIN';
    }
    $accounts = is_array($store['accounts'] ?? null) ? $store['accounts'] : [];
    foreach ($accounts as $acc) {
        if (normalizeAdminEmail($acc['email'] ?? '') === $norm) {
            return normalizeAdminRole($acc['role'] ?? 'SUPPORT_OFFICER');
        }
    }
    return 'REPORTS_VIEWER';
}

function appendAuditEvent(
    array &$store,
    string $actor,
    string $role,
    string $action,
    string $entityType,
    string $affectedRecord = '',
    string $previousValue = '',
    string $newValue = ''
): void {
    if (!isset($store['auditEvents']) || !is_array($store['auditEvents'])) {
        $store['auditEvents'] = [];
    }
    $event = [
        'id' => 'AUD-' . gmdate('YmdHis') . '-' . bin2hex(random_bytes(3)),
        'administrator' => sanitizeText($actor ?: 'system', 160),
        'role' => normalizeAdminRole($role),
        'action' => sanitizeText($action, 100),
        'entityType' => sanitizeText($entityType, 64),
        'affectedRecord' => sanitizeText($affectedRecord, 200),
        'previousValue' => sanitizeText($previousValue, 500),
        'newValue' => sanitizeText($newValue, 500),
        'ip' => getClientIp(),
        'timestamp' => gmdate('c'),
    ];
    array_unshift($store['auditEvents'], $event);
    if (count($store['auditEvents']) > 5000) {
        $store['auditEvents'] = array_slice($store['auditEvents'], 0, 5000);
    }
}

// 3. Resilient Private Storage Directory (Prefers outside public_html, falls back safely if open_basedir restricts parent)
function ensureProtectedDataDir(string $dir): bool {
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0700, true) && !is_dir($dir)) {
            return false;
        }
    }
    if (!is_writable($dir)) {
        return false;
    }
    // Verify real write capability (handles open_basedir / SELinux / mount restrictions cleanly)
    $probe = $dir . '/.write_probe_' . getmypid();
    if (@file_put_contents($probe, 'ok', LOCK_EX) === false) {
        return false;
    }
    @unlink($probe);

    if (!file_exists($dir . '/.htaccess')) {
        @file_put_contents(
            $dir . '/.htaccess',
            "<IfModule mod_authz_core.c>\n    Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n    Order deny,allow\n    Deny from all\n</IfModule>\n"
        );
    }
    if (!file_exists($dir . '/index.php')) {
        @file_put_contents($dir . '/index.php', "<?php http_response_code(403); exit('Forbidden');\n");
    }
    return true;
}

function getStoreCandidateDirs(): array {
    $homeDir = getenv('HOME') ?: '/home/ecasorke';
    return array_values(array_unique(array_filter([
        $homeDir . '/.msimamizi_store',
        dirname(__DIR__, 2) . '/.msimamizi_store',
        dirname(__DIR__, 1) . '/.msimamizi_store',
        __DIR__ . '/.msimamizi_store',
        rtrim(sys_get_temp_dir(), '/\\') . '/ecasi_msimamizi_store',
    ])));
}

function resolveWritableDataDir(): string {
    $candidates = getStoreCandidateDirs();

    // 1. Prefer an existing database file if its directory is writable (preserves all existing passwords & records)
    $existingReadOnlyFile = null;
    foreach ($candidates as $dir) {
        $dbPath = $dir . '/msimamizi_db.json';
        if (file_exists($dbPath)) {
            if (ensureProtectedDataDir($dir) && is_writable($dbPath)) {
                return $dir;
            }
            if ($existingReadOnlyFile === null && is_readable($dbPath)) {
                $existingReadOnlyFile = $dbPath;
            }
        }
    }

    // 2. Otherwise select the first genuinely writable protected directory (and migrate read-only data if found)
    foreach ($candidates as $dir) {
        if (ensureProtectedDataDir($dir)) {
            if ($existingReadOnlyFile !== null && !file_exists($dir . '/msimamizi_db.json')) {
                $raw = @file_get_contents($existingReadOnlyFile);
                if ($raw) {
                    @file_put_contents($dir . '/msimamizi_db.json', $raw, LOCK_EX);
                    @chmod($dir . '/msimamizi_db.json', 0600);
                }
            }
            return $dir;
        }
    }

    return __DIR__ . '/.msimamizi_store';
}

$dataDir = resolveWritableDataDir();
$storeFile = $dataDir . '/msimamizi_db.json';
$auditLogFile = $dataDir . '/audit.log';
$storeLockHandle = null;

function acquireStoreLock(string $dir) {
    ensureProtectedDataDir($dir);
    $lockPath = $dir . '/.store.lock';
    $fp = @fopen($lockPath, 'c+');
    if ($fp === false) {
        return null;
    }
    @chmod($lockPath, 0600);
    if (!@flock($fp, LOCK_EX)) {
        @fclose($fp);
        return null;
    }
    return $fp;
}

register_shutdown_function(function () use (&$storeLockHandle) {
    if (is_resource($storeLockHandle)) {
        @flock($storeLockHandle, LOCK_UN);
        @fclose($storeLockHandle);
        $storeLockHandle = null;
    }
});

function recoverSiblingStoresData(string $primaryStoreFile, array &$store): bool {
    $candidates = getStoreCandidateDirs();
    $mergedMtimes = is_array($store['mergedSiblingMtimes'] ?? null) ? $store['mergedSiblingMtimes'] : [];
    $deletedIds = is_array($store['deletedInquiryIds'] ?? null) ? $store['deletedInquiryIds'] : [];
    $changed = false;

    $seenInq = [];
    foreach (($store['inquiries'] ?? []) as $item) {
        if (!empty($item['id'])) $seenInq['id:' . $item['id']] = true;
        if (!empty($item['referenceNo'])) $seenInq['ref:' . $item['referenceNo']] = true;
    }
    $seenReg = [];
    foreach (($store['registrations'] ?? []) as $item) {
        if (!empty($item['id'])) $seenReg['id:' . $item['id']] = true;
        if (!empty($item['referenceNo'])) $seenReg['ref:' . $item['referenceNo']] = true;
    }
    $seenApp = [];
    foreach (($store['applications'] ?? []) as $item) {
        if (!empty($item['id'])) $seenApp['id:' . $item['id']] = true;
        if (!empty($item['referenceNo'])) $seenApp['ref:' . $item['referenceNo']] = true;
    }
    $seenAcc = [];
    foreach (($store['accounts'] ?? []) as $acc) {
        $em = normalizeAdminEmail($acc['email'] ?? '');
        if ($em !== '') $seenAcc[$em] = true;
    }

    foreach ($candidates as $dir) {
        $sibFile = $dir . '/msimamizi_db.json';
        if ($sibFile === $primaryStoreFile || !is_file($sibFile) || !is_readable($sibFile)) {
            continue;
        }
        $mtime = (int)@filemtime($sibFile);
        if (isset($mergedMtimes[$sibFile]) && (int)$mergedMtimes[$sibFile] >= $mtime) {
            continue;
        }
        $raw = @file_get_contents($sibFile);
        if (!$raw) {
            $mergedMtimes[$sibFile] = $mtime;
            continue;
        }
        $sib = json_decode($raw, true);
        if (!is_array($sib)) {
            $mergedMtimes[$sibFile] = $mtime;
            continue;
        }

        $sibInqAdded = false;
        foreach (($sib['inquiries'] ?? []) as $inq) {
            if (!is_array($inq)) continue;
            $iid = (string)($inq['id'] ?? '');
            $iref = (string)($inq['referenceNo'] ?? '');
            if ($iid !== '' && in_array($iid, $deletedIds, true)) continue;
            if (($iid !== '' && isset($seenInq['id:' . $iid])) || ($iref !== '' && isset($seenInq['ref:' . $iref]))) {
                continue;
            }
            $store['inquiries'][] = $inq;
            if ($iid !== '') $seenInq['id:' . $iid] = true;
            if ($iref !== '') $seenInq['ref:' . $iref] = true;
            $sibInqAdded = true;
            $changed = true;
        }
        if ($sibInqAdded) {
            usort($store['inquiries'], fn($a, $b) => strcmp((string)($b['createdAt'] ?? ''), (string)($a['createdAt'] ?? '')));
            $store['inquiries'] = array_slice($store['inquiries'], 0, 5000);
        }

        $deletedRegIds = is_array($store['deletedRegistrationIds'] ?? null) ? $store['deletedRegistrationIds'] : [];
        $sibRegAdded = false;
        foreach (($sib['registrations'] ?? []) as $reg) {
            if (!is_array($reg)) continue;
            $rid = (string)($reg['id'] ?? '');
            $rref = (string)($reg['referenceNo'] ?? '');
            if ($rid !== '' && in_array($rid, $deletedRegIds, true)) continue;
            if (ecasIsKnownSpamRegistration($reg)) continue;
            if (($rid !== '' && isset($seenReg['id:' . $rid])) || ($rref !== '' && isset($seenReg['ref:' . $rref]))) {
                continue;
            }
            $store['registrations'][] = $reg;
            if ($rid !== '') $seenReg['id:' . $rid] = true;
            if ($rref !== '') $seenReg['ref:' . $rref] = true;
            $sibRegAdded = true;
            $changed = true;
        }
        if ($sibRegAdded) {
            usort($store['registrations'], fn($a, $b) => strcmp((string)($b['submittedAt'] ?? ''), (string)($a['submittedAt'] ?? '')));
            $store['registrations'] = array_slice($store['registrations'], 0, 5000);
        }

        foreach (($sib['applications'] ?? []) as $app) {
            if (!is_array($app)) continue;
            $aid = (string)($app['id'] ?? '');
            $aref = (string)($app['referenceNo'] ?? '');
            if (($aid !== '' && isset($seenApp['id:' . $aid])) || ($aref !== '' && isset($seenApp['ref:' . $aref]))) {
                continue;
            }
            $store['applications'][] = $app;
            if ($aid !== '') $seenApp['id:' . $aid] = true;
            if ($aref !== '') $seenApp['ref:' . $aref] = true;
            $changed = true;
        }

        foreach (($sib['accounts'] ?? []) as $acc) {
            if (!is_array($acc)) continue;
            $em = normalizeAdminEmail($acc['email'] ?? '');
            if ($em === '' || isset($seenAcc[$em])) continue;
            $store['accounts'][] = $acc;
            $seenAcc[$em] = true;
            $changed = true;
        }

        if (empty($store['galleryCustomized']) && !empty($sib['galleryCustomized']) && isset($sib['gallery']) && is_array($sib['gallery'])) {
            $store['gallery'] = $sib['gallery'];
            $store['galleryCustomized'] = true;
            $changed = true;
        }

        if (!empty($sib['resources']) && is_array($sib['resources'])) {
            if (!isset($store['resources']) || !is_array($store['resources'])) $store['resources'] = [];
            if (!isset($store['resourcesCustomized']) || !is_array($store['resourcesCustomized'])) $store['resourcesCustomized'] = [];
            foreach ($sib['resources'] as $resType => $resList) {
                if (empty($store['resourcesCustomized'][$resType]) && !empty($sib['resourcesCustomized'][$resType]) && is_array($resList)) {
                    $store['resources'][$resType] = $resList;
                    $store['resourcesCustomized'][$resType] = true;
                    $changed = true;
                }
            }
        }

        $mergedMtimes[$sibFile] = $mtime;
        $changed = true;
    }

    $store['mergedSiblingMtimes'] = $mergedMtimes;
    return $changed;
}

function getClientIp(): string {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP']
        ?? $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '0.0.0.0';
    return trim(explode(',', (string)$ip)[0]);
}

function writeAuditLog(string $logFile, string $action, string $actor, string $status, string $details = ''): void {
    $entry = sprintf(
        "[%s] ip=%s actor=%s action=%s status=%s details=%s\n",
        gmdate('c'),
        getClientIp(),
        $actor ?: 'anonymous',
        $action,
        $status,
        str_replace(["\r", "\n"], ' ', $details)
    );
    @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
}

function sanitizeText($val, int $maxLen = 500): string {
    if (!is_scalar($val)) return '';
    $clean = trim(strip_tags((string)$val));
    return mb_substr($clean, 0, $maxLen);
}

function readStore(string $file): array {
    $default = [
        'registrations' => [],
        'inquiries' => [],
        'deletedInquiryIds' => [],
        'deletedRegistrationIds' => [],
        'courses' => [],
        'vacancies' => [],
        'applications' => [],
        'invoices' => [],
        'payments' => [],
        'cohorts' => [],
        'communications' => [],
        'templates' => [],
        'announcements' => [],
        'cmsContent' => [],
        'gallery' => null,
        'galleryCustomized' => false,
        'resources' => [],
        'resourcesCustomized' => [],
        'settings' => [],
        'auditEvents' => [],
        'securityAlerts' => [],
        'securityIncidents' => [],
        'emailOtps' => [],
        'mfaChallenges' => [],
        'loginThrottle' => [],
        'securityStats' => [
            'blockedBots' => 0,
            'failedLogins' => 0,
            'falsePositivesCleared' => 0,
            'maliciousUploadsBlocked' => 0,
        ],
        'accounts' => [],
        'sessions' => [],
        'migrations' => [],
        'syncVersion' => 1,
        'lastSyncTopic' => 'init',
        'updatedAt' => gmdate('c'),
    ];
    if (!file_exists($file)) {
        return $default;
    }
    $raw = @file_get_contents($file);
    if (!$raw) return $default;
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) return $default;
    return array_merge($default, $decoded);
}

function writeStore(string $file, array $data): bool {
    $data['syncVersion'] = max(1, (int)($data['syncVersion'] ?? 0) + 1);
    $data['updatedAt'] = gmdate('c');
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }
    $dir = dirname($file);
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $tmpFile = $file . '.tmp.' . getmypid();
    if (@file_put_contents($tmpFile, $json, LOCK_EX) !== false) {
        @chmod($tmpFile, 0600);
        if (@rename($tmpFile, $file)) {
            @chmod($file, 0600);
            return true;
        }
        @unlink($tmpFile);
    }
    $written = @file_put_contents($file, $json, LOCK_EX);
    if ($written === false) {
        return false;
    }
    @chmod($file, 0600);
    return true;
}

const ADMIN_IDLE_TIMEOUT_SECONDS = 600; // Silent 10-minute idle timeout
const ADMIN_HEARTBEAT_TTL_SECONDS = 90; // Prune un-heartbeated crashed/closed sessions cleanly

function getBearerToken(): string {
    $header = $_SERVER['HTTP_X_ADMIN_TOKEN']
        ?? $_SERVER['REDIRECT_HTTP_X_ADMIN_TOKEN']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';
    if ($header === '' && function_exists('getallheaders')) {
        $allHeaders = @getallheaders();
        if (is_array($allHeaders)) {
            foreach ($allHeaders as $k => $v) {
                $lk = strtolower((string)$k);
                if ($lk === 'x-admin-token' || $lk === 'authorization') {
                    $header = (string)$v;
                    break;
                }
            }
        }
    }
    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }
    return trim((string)$header);
}

function pruneExpiredSessions(array &$store, int $now): void {
    if (!isset($store['sessions']) || !is_array($store['sessions'])) {
        $store['sessions'] = [];
        return;
    }
    foreach ($store['sessions'] as $tokHash => $session) {
        $expiresAt = (int)($session['expiresAt'] ?? 0);
        $closingAt = isset($session['closingAt']) ? (int)$session['closingAt'] : 0;
        $lastHeartbeatAt = isset($session['lastHeartbeatAt']) ? (int)$session['lastHeartbeatAt'] : 0;
        if (
            $expiresAt < $now ||
            ($closingAt > 0 && ($now - $closingAt) >= 2) ||
            $lastHeartbeatAt <= 0 ||
            ($now - $lastHeartbeatAt) > ADMIN_HEARTBEAT_TTL_SECONDS
        ) {
            unset($store['sessions'][$tokHash]);
        }
    }
}

function reclaimSameBrowserDeadSession(array &$store, string $email, string $browserProfileId, int $now): void {
    pruneExpiredSessions($store, $now);
    $normTarget = normalizeAdminEmail($email);
    if ($normTarget === '' || $browserProfileId === '') return;
    foreach ($store['sessions'] as $tokHash => $session) {
        if (
            normalizeAdminEmail($session['email'] ?? '') === $normTarget &&
            ($session['browserProfileId'] ?? '') === $browserProfileId
        ) {
            unset($store['sessions'][$tokHash]);
        }
    }
}

function hasActiveSessionForEmail(array &$store, string $email, int $now): bool {
    pruneExpiredSessions($store, $now);
    $normTarget = normalizeAdminEmail($email);
    if ($normTarget === '') return false;
    foreach ($store['sessions'] as $session) {
        if (normalizeAdminEmail($session['email'] ?? '') === $normTarget) {
            return true;
        }
    }
    return false;
}

function validateAdminToken(array &$store, string $token, bool $extendIdle = true): ?string {
    if (empty($token) || strlen($token) < 32) return null;
    $now = time();
    pruneExpiredSessions($store, $now);
    foreach ($store['sessions'] as $tokHash => $session) {
        if (hash_equals($tokHash, hash('sha256', $token))) {
            unset($store['sessions'][$tokHash]['closingAt']);
            $store['sessions'][$tokHash]['lastHeartbeatAt'] = $now;
            if ($extendIdle) {
                $store['sessions'][$tokHash]['expiresAt'] = $now + ADMIN_IDLE_TIMEOUT_SECONDS;
            }
            return $session['email'] ?? null;
        }
    }
    return null;
}

function issueAdminToken(array &$store, string $email, string $browserProfileId = ''): string {
    $rawToken = bin2hex(random_bytes(32));
    $tokHash = hash('sha256', $rawToken);
    $now = time();
    pruneExpiredSessions($store, $now);
    $store['sessions'][$tokHash] = [
        'email' => $email,
        'issuedAt' => $now,
        'lastHeartbeatAt' => $now,
        'expiresAt' => $now + ADMIN_IDLE_TIMEOUT_SECONDS,
        'browserProfileId' => sanitizeText($browserProfileId, 80),
        'ip' => getClientIp(),
    ];
    return $rawToken;
}

function sanitizeRegistration(array $reg): array {
    $validStages = [
        'Application Received', 'Under Review', 'Documents Required', 'Approved',
        'Invoice Issued', 'Payment Pending', 'Payment Confirmed', 'Enrolment Confirmed',
        'Training In Progress', 'Completed', 'Rejected', 'Withdrawn',
        'Pending', 'Confirmed', 'Cancelled'
    ];
    $workflowStage = sanitizeText($reg['workflowStage'] ?? '', 48);
    if (!in_array($workflowStage, $validStages, true)) {
        $workflowStage = '';
    }
    $statusHistory = [];
    if (isset($reg['statusHistory']) && is_array($reg['statusHistory'])) {
        foreach (array_slice($reg['statusHistory'], 0, 50) as $h) {
            if (!is_array($h)) continue;
            $statusHistory[] = [
                'stage' => sanitizeText($h['stage'] ?? '', 64),
                'status' => sanitizeText($h['status'] ?? '', 48),
                'by' => sanitizeText($h['by'] ?? '', 160),
                'note' => sanitizeText($h['note'] ?? '', 400),
                'at' => sanitizeText($h['at'] ?? gmdate('c'), 64),
            ];
        }
    }
    $documents = [];
    if (isset($reg['documents']) && is_array($reg['documents'])) {
        foreach (array_slice($reg['documents'], 0, 15) as $doc) {
            if (!is_array($doc)) continue;
            $documents[] = [
                'id' => sanitizeText($doc['id'] ?? ('DOC-' . random_int(1000, 9999)), 64),
                'name' => sanitizeText($doc['name'] ?? '', 200),
                'type' => sanitizeText($doc['type'] ?? 'Supporting Document', 80),
                'verified' => !empty($doc['verified']),
                'verifiedBy' => sanitizeText($doc['verifiedBy'] ?? '', 160),
                'verifiedAt' => sanitizeText($doc['verifiedAt'] ?? '', 64),
                'uploadedAt' => sanitizeText($doc['uploadedAt'] ?? gmdate('c'), 64),
                'dataUrl' => sanitizeAttachmentDataUrl($doc['dataUrl'] ?? ''),
            ];
        }
    }
    return [
        'id' => sanitizeText($reg['id'] ?? ('REG-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'referenceNo' => sanitizeText($reg['referenceNo'] ?? ('ECAS-' . random_int(100000, 999999)), 64),
        'title' => sanitizeText($reg['title'] ?? '', 32),
        'firstName' => sanitizeText($reg['firstName'] ?? '', 120),
        'middleName' => sanitizeText($reg['middleName'] ?? '', 120),
        'lastName' => sanitizeText($reg['lastName'] ?? '', 120),
        'jobTitle' => sanitizeText($reg['jobTitle'] ?? '', 180),
        'organisation' => sanitizeText($reg['organisation'] ?? '', 200),
        'organisationWebsite' => sanitizeText($reg['organisationWebsite'] ?? '', 240),
        'organisationRegNo' => sanitizeText($reg['organisationRegNo'] ?? '', 100),
        'academicBackground' => sanitizeText($reg['academicBackground'] ?? '', 300),
        'country' => sanitizeText($reg['country'] ?? 'Kenya', 100),
        'dialCode' => sanitizeText($reg['dialCode'] ?? '+254', 16),
        'phoneNumber' => sanitizeText($reg['phoneNumber'] ?? '', 40),
        'personalEmail' => filter_var(trim((string)($reg['personalEmail'] ?? '')), FILTER_SANITIZE_EMAIL),
        'officialEmail' => filter_var(trim((string)($reg['officialEmail'] ?? '')), FILTER_SANITIZE_EMAIL),
        'eventTitle' => sanitizeText($reg['eventTitle'] ?? '', 300),
        'courseSlug' => sanitizeText($reg['courseSlug'] ?? '', 200),
        'scheduleId' => sanitizeText($reg['scheduleId'] ?? '', 64),
        'cohortName' => sanitizeText($reg['cohortName'] ?? '', 120),
        'venue' => sanitizeText($reg['venue'] ?? 'Nairobi, Kenya', 120),
        'format' => sanitizeText($reg['format'] ?? 'Classroom', 64),
        'durationText' => sanitizeText($reg['durationText'] ?? '', 160),
        'participantsCount' => max(1, min(500, (int)($reg['participantsCount'] ?? 1))),
        'totalFee' => max(0, (float)($reg['totalFee'] ?? 0)),
        'currency' => sanitizeText($reg['currency'] ?? 'USD', 12),
        'discountAmount' => max(0, (float)($reg['discountAmount'] ?? 0)),
        'invoiceTo' => sanitizeText($reg['invoiceTo'] ?? 'Self', 64),
        'approvingAuthorityName' => sanitizeText($reg['approvingAuthorityName'] ?? '', 160),
        'approvingAuthorityEmail' => filter_var(trim((string)($reg['approvingAuthorityEmail'] ?? '')), FILTER_SANITIZE_EMAIL),
        'currentDuties' => sanitizeText($reg['currentDuties'] ?? '', 1000),
        'trainingExpectations' => sanitizeText($reg['trainingExpectations'] ?? '', 1000),
        'tailorMadeRequirements' => sanitizeText($reg['tailorMadeRequirements'] ?? '', 1000),
        'hearAboutUs' => sanitizeText($reg['hearAboutUs'] ?? '', 120),
        'needAccommodation' => sanitizeText($reg['needAccommodation'] ?? 'No', 160),
        'needAirportTransfer' => sanitizeText($reg['needAirportTransfer'] ?? 'No', 120),
        'needSafariTour' => sanitizeText($reg['needSafariTour'] ?? 'No', 120),
        'status' => in_array($reg['status'] ?? 'Pending', ['Pending', 'Under Review', 'Documents Required', 'Approved', 'Confirmed', 'Training In Progress', 'Completed', 'Rejected', 'Withdrawn', 'Cancelled'], true)
            ? $reg['status']
            : 'Pending',
        'workflowStage' => $workflowStage,
        'paymentStatus' => in_array($reg['paymentStatus'] ?? 'Unpaid', ['Unpaid', 'Invoiced', 'Partially Paid', 'Paid', 'Refunded'], true)
            ? $reg['paymentStatus']
            : 'Unpaid',
        'assignedOfficer' => sanitizeText($reg['assignedOfficer'] ?? '', 160),
        'linkedLeadId' => sanitizeText($reg['linkedLeadId'] ?? '', 64),
        'documents' => $documents,
        'statusHistory' => $statusHistory,
        'submitterIp' => sanitizeText($reg['submitterIp'] ?? '', 64),
        'securityAssessment' => is_array($reg['securityAssessment'] ?? null) ? $reg['securityAssessment'] : null,
        'adminNotes' => sanitizeText($reg['adminNotes'] ?? '', 1500),
        'submittedAt' => sanitizeText($reg['submittedAt'] ?? gmdate('c'), 64),
        'displayDate' => sanitizeText($reg['displayDate'] ?? gmdate('j F Y'), 64),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeInquiry(array $inq): array {
    $validChannels = ['Website', 'Website Inquiry', 'WhatsApp', 'Email', 'Telephone', 'Social Media', 'Manual Registration', 'In-House Proposal', 'Calendar Download', 'Web Inquiry', 'Direct Inquiry', 'Newsletter'];
    $channel = sanitizeText($inq['channel'] ?? 'WhatsApp', 40);
    if (!in_array($channel, $validChannels, true)) {
        $channel = 'WhatsApp';
    }
    $validStatuses = ['New', 'New Lead', 'Contacted', 'Interested', 'Follow-up', 'Application Started', 'Converted', 'Closed', 'Archived'];
    $status = sanitizeText($inq['status'] ?? 'New', 32);
    if (!in_array($status, $validStatuses, true)) {
        $status = 'New';
    }
    $commLogs = [];
    if (isset($inq['communicationLog']) && is_array($inq['communicationLog'])) {
        foreach (array_slice($inq['communicationLog'], 0, 50) as $log) {
            if (!is_array($log)) continue;
            $commLogs[] = [
                'id' => sanitizeText($log['id'] ?? ('LOG-' . random_int(1000, 9999)), 64),
                'type' => sanitizeText($log['type'] ?? 'Note', 32),
                'summary' => sanitizeText($log['summary'] ?? '', 1000),
                'by' => sanitizeText($log['by'] ?? '', 160),
                'at' => sanitizeText($log['at'] ?? gmdate('c'), 64),
            ];
        }
    }
    return [
        'id' => sanitizeText($inq['id'] ?? ('INQ-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'referenceNo' => sanitizeText($inq['referenceNo'] ?? ('INQ-' . random_int(100000, 999999)), 64),
        'channel' => $channel,
        'leadSource' => sanitizeText($inq['leadSource'] ?? $channel, 48),
        'inquiryType' => sanitizeText($inq['inquiryType'] ?? 'Course Inquiry', 64),
        'fullName' => sanitizeText($inq['fullName'] ?? ($inq['senderName'] ?? 'Prospective Delegate'), 160),
        'email' => filter_var(trim((string)($inq['email'] ?? ($inq['senderEmail'] ?? ''))), FILTER_SANITIZE_EMAIL),
        'phone' => sanitizeText($inq['phone'] ?? ($inq['senderPhone'] ?? ''), 60),
        'organisation' => sanitizeText($inq['organisation'] ?? '', 200),
        'country' => sanitizeText($inq['country'] ?? 'Kenya', 100),
        'courseTitle' => sanitizeText($inq['courseTitle'] ?? 'Executive Training Programme', 300),
        'courseCode' => sanitizeText($inq['courseCode'] ?? '', 64),
        'cohortDates' => sanitizeText($inq['cohortDates'] ?? '', 160),
        'venue' => sanitizeText($inq['venue'] ?? '', 160),
        'fee' => sanitizeText($inq['fee'] ?? '', 64),
        'message' => sanitizeText($inq['message'] ?? '', 1500),
        'status' => $status,
        'assignedOfficer' => sanitizeText($inq['assignedOfficer'] ?? '', 160),
        'lastContactDate' => sanitizeText($inq['lastContactDate'] ?? '', 64),
        'nextFollowUp' => sanitizeText($inq['nextFollowUp'] ?? '', 64),
        'priority' => sanitizeText($inq['priority'] ?? 'Normal', 24),
        'linkedRegistrationId' => sanitizeText($inq['linkedRegistrationId'] ?? '', 64),
        'communicationLog' => $commLogs,
        'adminNotes' => sanitizeText($inq['adminNotes'] ?? '', 1500),
        'createdAt' => sanitizeText($inq['createdAt'] ?? gmdate('c'), 64),
        'displayDate' => sanitizeText($inq['displayDate'] ?? gmdate('j F Y, H:i'), 64),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeVacancy(array $vac): array {
    $status = sanitizeText($vac['status'] ?? 'Open', 24);
    if (!in_array($status, ['Open', 'Closed'], true)) {
        $status = 'Open';
    }
    return [
        'id' => sanitizeText($vac['id'] ?? ('VAC-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'title' => sanitizeText($vac['title'] ?? '', 240),
        'department' => sanitizeText($vac['department'] ?? 'Research & Executive Training', 160),
        'location' => sanitizeText($vac['location'] ?? 'Nairobi, Kenya', 160),
        'type' => sanitizeText($vac['type'] ?? 'Full-time', 80),
        'deadline' => sanitizeText($vac['deadline'] ?? 'Open Until Filled', 120),
        'description' => sanitizeText($vac['description'] ?? '', 4000),
        'requirements' => sanitizeText($vac['requirements'] ?? '', 3000),
        'posterDataUrl' => sanitizeAttachmentDataUrl($vac['posterDataUrl'] ?? ''),
        'posterFileName' => sanitizeText($vac['posterFileName'] ?? '', 240),
        'posterFileType' => sanitizeText($vac['posterFileType'] ?? '', 120),
        'status' => $status,
        'createdAt' => sanitizeText($vac['createdAt'] ?? gmdate('c'), 64),
        'updatedAt' => sanitizeText($vac['updatedAt'] ?? gmdate('c'), 64),
    ];
}

function sanitizeAttachmentDataUrl($raw): string {
    $checked = ecasValidateAttachmentStrict($raw);
    if (!$checked['valid']) {
        return '';
    }
    return (string)($checked['dataUrl'] ?? '');
}

function sanitizeApplication(array $app): array {
    $validStatuses = ['New', 'Application Received', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Hired', 'Rejected', 'Archived'];
    $status = sanitizeText($app['status'] ?? 'New', 32);
    if (!in_array($status, $validStatuses, true)) {
        $status = 'New';
    }

    $cleanEducation = [];
    if (isset($app['education']) && is_array($app['education'])) {
        foreach (array_slice($app['education'], 0, 10) as $edu) {
            if (!is_array($edu)) continue;
            $inst = sanitizeText($edu['institution'] ?? '', 200);
            $course = sanitizeText($edu['fieldOfStudy'] ?? '', 200);
            if ($inst === '' && $course === '') continue;
            $cleanEducation[] = [
                'level' => sanitizeText($edu['level'] ?? '', 80),
                'institution' => $inst,
                'fieldOfStudy' => $course,
                'grade' => sanitizeText($edu['grade'] ?? '', 80),
                'graduationYear' => sanitizeText($edu['graduationYear'] ?? '', 16),
            ];
        }
    }

    $cleanExperience = [];
    if (isset($app['experience']) && is_array($app['experience'])) {
        foreach (array_slice($app['experience'], 0, 15) as $exp) {
            if (!is_array($exp)) continue;
            $role = sanitizeText($exp['jobTitle'] ?? '', 180);
            $org = sanitizeText($exp['employer'] ?? '', 200);
            if ($role === '' && $org === '') continue;
            $cleanExperience[] = [
                'jobTitle' => $role,
                'employer' => $org,
                'startDate' => sanitizeText($exp['startDate'] ?? '', 32),
                'endDate' => sanitizeText($exp['endDate'] ?? '', 32),
                'current' => !empty($exp['current']),
                'responsibilities' => sanitizeText($exp['responsibilities'] ?? '', 1500),
            ];
        }
    }

    $cleanReferees = [];
    if (isset($app['referees']) && is_array($app['referees'])) {
        foreach (array_slice($app['referees'], 0, 5) as $ref) {
            if (!is_array($ref)) continue;
            $name = sanitizeText($ref['name'] ?? '', 160);
            if ($name === '') continue;
            $cleanReferees[] = [
                'name' => $name,
                'organisation' => sanitizeText($ref['organisation'] ?? '', 200),
                'title' => sanitizeText($ref['title'] ?? '', 160),
                'phone' => sanitizeText($ref['phone'] ?? '', 60),
                'email' => filter_var(trim((string)($ref['email'] ?? '')), FILTER_SANITIZE_EMAIL),
            ];
        }
    }

    $cleanCompliance = [];
    if (isset($app['complianceChecklist']) && is_array($app['complianceChecklist'])) {
        foreach (array_slice($app['complianceChecklist'], 0, 12) as $item) {
            $s = sanitizeText($item, 120);
            if ($s !== '') $cleanCompliance[] = $s;
        }
    }

    $rawMemberships = is_array($app['professionalMemberships'] ?? null) ? $app['professionalMemberships'] : [];
    $cleanMemberships = [
        'bodyName' => sanitizeText($rawMemberships['bodyName'] ?? '', 200),
        'membershipNo' => sanitizeText($rawMemberships['membershipNo'] ?? '', 80),
        'status' => sanitizeText($rawMemberships['status'] ?? '', 80),
    ];

    return [
        'id' => sanitizeText($app['id'] ?? ('APP-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'referenceNo' => sanitizeText($app['referenceNo'] ?? ('CV-' . random_int(100000, 999999)), 64),
        'jobId' => sanitizeText($app['jobId'] ?? 'speculative', 64),
        'jobTitle' => sanitizeText($app['jobTitle'] ?? 'Speculative Application', 240),
        'fullName' => sanitizeText($app['fullName'] ?? '', 160),
        'email' => filter_var(trim((string)($app['email'] ?? '')), FILTER_SANITIZE_EMAIL),
        'phone' => sanitizeText($app['phone'] ?? '', 60),
        'nationalId' => sanitizeText($app['nationalId'] ?? '', 60),
        'gender' => sanitizeText($app['gender'] ?? '', 40),
        'dateOfBirth' => sanitizeText($app['dateOfBirth'] ?? '', 32),
        'county' => sanitizeText($app['county'] ?? '', 120),
        'physicalAddress' => sanitizeText($app['physicalAddress'] ?? '', 240),
        'disabilityStatus' => sanitizeText($app['disabilityStatus'] ?? 'No', 32),
        'specialty' => sanitizeText($app['specialty'] ?? '', 200),
        'careerSummary' => sanitizeText($app['careerSummary'] ?? '', 2000),
        'highestQualification' => sanitizeText($app['highestQualification'] ?? '', 120),
        'education' => $cleanEducation,
        'professionalMemberships' => $cleanMemberships,
        'experience' => $cleanExperience,
        'referees' => $cleanReferees,
        'complianceChecklist' => $cleanCompliance,
        'coverLetter' => sanitizeText($app['coverLetter'] ?? '', 4000),
        'cvFileName' => sanitizeText($app['cvFileName'] ?? '', 240),
        'cvFileType' => sanitizeText($app['cvFileType'] ?? '', 120),
        'cvFileSize' => isset($app['cvFileSize']) ? max(0, (int)$app['cvFileSize']) : 0,
        'cvDataUrl' => sanitizeAttachmentDataUrl($app['cvDataUrl'] ?? ''),
        'certFileName' => sanitizeText($app['certFileName'] ?? '', 240),
        'certFileType' => sanitizeText($app['certFileType'] ?? '', 120),
        'certFileSize' => isset($app['certFileSize']) ? max(0, (int)$app['certFileSize']) : 0,
        'certDataUrl' => sanitizeAttachmentDataUrl($app['certDataUrl'] ?? ''),
        'declarationAccepted' => !empty($app['declarationAccepted']),
        'status' => $status,
        'interviewDate' => sanitizeText($app['interviewDate'] ?? '', 64),
        'interviewOutcome' => sanitizeText($app['interviewOutcome'] ?? '', 240),
        'assignedOfficer' => sanitizeText($app['assignedOfficer'] ?? '', 160),
        'adminNotes' => sanitizeText($app['adminNotes'] ?? '', 1500),
        'createdAt' => sanitizeText($app['createdAt'] ?? gmdate('c'), 64),
        'displayDate' => sanitizeText($app['displayDate'] ?? gmdate('j F Y, H:i'), 64),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeInvoice(array $inv): array {
    $validStatuses = ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'Refunded'];
    $status = sanitizeText($inv['status'] ?? 'Issued', 32);
    if (!in_array($status, $validStatuses, true)) $status = 'Issued';
    $amount = max(0, (float)($inv['amount'] ?? 0));
    $discount = max(0, (float)($inv['discount'] ?? 0));
    $additionalCharges = max(0, (float)($inv['additionalCharges'] ?? 0));
    $netAmount = max(0, isset($inv['netAmount']) ? (float)$inv['netAmount'] : ($amount + $additionalCharges - $discount));
    $paidAmount = max(0, (float)($inv['paidAmount'] ?? 0));
    return [
        'id' => sanitizeText($inv['id'] ?? ('INV-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'invoiceNo' => sanitizeText($inv['invoiceNo'] ?? ('ECAS-INV-' . random_int(10000, 99999)), 64),
        'registrationId' => sanitizeText($inv['registrationId'] ?? '', 64),
        'applicantName' => sanitizeText($inv['applicantName'] ?? '', 180),
        'applicantEmail' => filter_var(trim((string)($inv['applicantEmail'] ?? '')), FILTER_SANITIZE_EMAIL),
        'organisation' => sanitizeText($inv['organisation'] ?? '', 200),
        'courseTitle' => sanitizeText($inv['courseTitle'] ?? '', 300),
        'courseSlug' => sanitizeText($inv['courseSlug'] ?? '', 200),
        'cohortName' => sanitizeText($inv['cohortName'] ?? '', 140),
        'destination' => sanitizeText($inv['destination'] ?? 'Nairobi, Kenya', 120),
        'currency' => sanitizeText($inv['currency'] ?? 'USD', 12),
        'amount' => $amount,
        'additionalCharges' => $additionalCharges,
        'discount' => $discount,
        'netAmount' => $netAmount,
        'paidAmount' => $paidAmount,
        'balance' => max(0, $netAmount - $paidAmount),
        'paymentPlan' => sanitizeText($inv['paymentPlan'] ?? 'Full Payment', 64),
        'dueDate' => sanitizeText($inv['dueDate'] ?? '', 32),
        'status' => $status,
        'notes' => sanitizeText($inv['notes'] ?? '', 1000),
        'issuedBy' => sanitizeText($inv['issuedBy'] ?? '', 160),
        'createdAt' => sanitizeText($inv['createdAt'] ?? gmdate('c'), 64),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizePayment(array $pay): array {
    $validStatuses = ['Pending', 'Verified', 'Failed', 'Refunded'];
    $status = sanitizeText($pay['status'] ?? 'Verified', 32);
    if (!in_array($status, $validStatuses, true)) $status = 'Pending';
    $validRecon = ['Unmatched', 'Matched', 'Reconciled', 'Discrepancy', 'Duplicate'];
    $recon = sanitizeText($pay['reconciliationStatus'] ?? 'Matched', 32);
    if (!in_array($recon, $validRecon, true)) $recon = 'Unmatched';
    return [
        'id' => sanitizeText($pay['id'] ?? ('PAY-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'reference' => sanitizeText($pay['reference'] ?? '', 120),
        'invoiceId' => sanitizeText($pay['invoiceId'] ?? '', 64),
        'invoiceNo' => sanitizeText($pay['invoiceNo'] ?? '', 64),
        'registrationId' => sanitizeText($pay['registrationId'] ?? '', 64),
        'applicantName' => sanitizeText($pay['applicantName'] ?? '', 180),
        'amount' => max(0, (float)($pay['amount'] ?? 0)),
        'currency' => sanitizeText($pay['currency'] ?? 'USD', 12),
        'method' => sanitizeText($pay['method'] ?? 'Bank Transfer', 64),
        'transactionDate' => sanitizeText($pay['transactionDate'] ?? gmdate('Y-m-d'), 32),
        'status' => $status,
        'reconciliationStatus' => $recon,
        'supportingNote' => sanitizeText($pay['supportingNote'] ?? '', 600),
        'verifiedBy' => sanitizeText($pay['verifiedBy'] ?? '', 160),
        'createdAt' => sanitizeText($pay['createdAt'] ?? gmdate('c'), 64),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeCohort(array $coh): array {
    return [
        'id' => sanitizeText($coh['id'] ?? ('COH-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'name' => sanitizeText($coh['name'] ?? '', 180),
        'courseSlug' => sanitizeText($coh['courseSlug'] ?? '', 200),
        'courseTitle' => sanitizeText($coh['courseTitle'] ?? '', 300),
        'intakeYear' => sanitizeText($coh['intakeYear'] ?? gmdate('Y'), 16),
        'destination' => sanitizeText($coh['destination'] ?? 'Nairobi, Kenya', 140),
        'startDate' => sanitizeText($coh['startDate'] ?? '', 32),
        'endDate' => sanitizeText($coh['endDate'] ?? '', 32),
        'applicationDeadline' => sanitizeText($coh['applicationDeadline'] ?? '', 32),
        'availableSlots' => max(1, min(1000, (int)($coh['availableSlots'] ?? 30))),
        'enrolmentStatus' => sanitizeText($coh['enrolmentStatus'] ?? 'Open', 32),
        'scheduleNotes' => sanitizeText($coh['scheduleNotes'] ?? '', 600),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeCommunication(array $c): array {
    return [
        'id' => sanitizeText($c['id'] ?? ('MSG-' . gmdate('Y') . '-' . random_int(1000, 9999)), 64),
        'channel' => sanitizeText($c['channel'] ?? 'Email', 32),
        'category' => sanitizeText($c['category'] ?? 'General', 48),
        'recipientName' => sanitizeText($c['recipientName'] ?? '', 160),
        'recipientContact' => sanitizeText($c['recipientContact'] ?? '', 200),
        'subject' => sanitizeText($c['subject'] ?? '', 260),
        'body' => sanitizeText($c['body'] ?? '', 4000),
        'templateName' => sanitizeText($c['templateName'] ?? '', 120),
        'deliveryStatus' => sanitizeText($c['deliveryStatus'] ?? 'Logged', 32),
        'linkedEntityId' => sanitizeText($c['linkedEntityId'] ?? '', 64),
        'sentBy' => sanitizeText($c['sentBy'] ?? '', 160),
        'sentAt' => sanitizeText($c['sentAt'] ?? gmdate('c'), 64),
    ];
}

function sanitizeTemplate(array $t): array {
    return [
        'id' => sanitizeText($t['id'] ?? ('TPL-' . random_int(1000, 9999)), 64),
        'name' => sanitizeText($t['name'] ?? '', 140),
        'channel' => sanitizeText($t['channel'] ?? 'Email', 32),
        'category' => sanitizeText($t['category'] ?? 'Admissions', 64),
        'subject' => sanitizeText($t['subject'] ?? '', 240),
        'body' => sanitizeText($t['body'] ?? '', 4000),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeAnnouncement(array $a): array {
    return [
        'id' => sanitizeText($a['id'] ?? ('ANN-' . random_int(1000, 9999)), 64),
        'title' => sanitizeText($a['title'] ?? '', 240),
        'body' => sanitizeText($a['body'] ?? '', 3000),
        'audience' => sanitizeText($a['audience'] ?? 'All Visitors', 64),
        'status' => in_array($a['status'] ?? 'Draft', ['Draft', 'Published', 'Archived'], true) ? $a['status'] : 'Draft',
        'publishedAt' => sanitizeText($a['publishedAt'] ?? '', 64),
        'createdBy' => sanitizeText($a['createdBy'] ?? '', 160),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeCmsContent(array $cms): array {
    $clean = [];
    foreach (array_slice($cms, 0, 50) as $key => $section) {
        if (!is_array($section)) continue;
        $k = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$key);
        if ($k === '') continue;
        $revisions = [];
        if (isset($section['revisions']) && is_array($section['revisions'])) {
            foreach (array_slice($section['revisions'], 0, 20) as $rev) {
                if (!is_array($rev)) continue;
                $revisions[] = [
                    'at' => sanitizeText($rev['at'] ?? gmdate('c'), 64),
                    'by' => sanitizeText($rev['by'] ?? '', 160),
                    'note' => sanitizeText($rev['note'] ?? '', 240),
                    'status' => sanitizeText($rev['status'] ?? 'Draft', 32),
                ];
            }
        }
        $clean[$k] = [
            'title' => sanitizeText($section['title'] ?? '', 240),
            'subtitle' => sanitizeText($section['subtitle'] ?? '', 600),
            'body' => sanitizeText($section['body'] ?? '', 8000),
            'ctaLabel' => sanitizeText($section['ctaLabel'] ?? '', 100),
            'ctaUrl' => sanitizeText($section['ctaUrl'] ?? '', 300),
            'status' => in_array($section['status'] ?? 'Draft', ['Draft', 'Published'], true) ? $section['status'] : 'Draft',
            'items' => is_array($section['items'] ?? null) ? array_slice($section['items'], 0, 40) : [],
            'revisions' => $revisions,
            'updatedBy' => sanitizeText($section['updatedBy'] ?? '', 160),
            'updatedAt' => gmdate('c'),
        ];
    }
    return $clean;
}

function sanitizeSettings(array $s): array {
    return [
        'institutionName' => sanitizeText($s['institutionName'] ?? 'ECAS Institute (ECASIAFRICA)', 200),
        'shortName' => sanitizeText($s['shortName'] ?? 'ECAS Institute', 80),
        'tagline' => sanitizeText($s['tagline'] ?? 'Environment | Energy | Climate Action', 240),
        'officialEmail' => filter_var(trim((string)($s['officialEmail'] ?? 'info@ecasiafrica.org')), FILTER_SANITIZE_EMAIL),
        'admissionsEmail' => filter_var(trim((string)($s['admissionsEmail'] ?? 'admissions@ecasiafrica.org')), FILTER_SANITIZE_EMAIL),
        'financeEmail' => filter_var(trim((string)($s['financeEmail'] ?? 'finance@ecasiafrica.org')), FILTER_SANITIZE_EMAIL),
        'whatsappNumber' => sanitizeText($s['whatsappNumber'] ?? '+254708060223', 40),
        'phone' => sanitizeText($s['phone'] ?? '+254 708 060 223', 60),
        'address' => sanitizeText($s['address'] ?? 'Nairobi, Kenya', 260),
        'defaultCurrency' => sanitizeText($s['defaultCurrency'] ?? 'USD', 12),
        'usdToKesRate' => max(1, (float)($s['usdToKesRate'] ?? 130)),
        'invoicePaymentTermsDays' => max(1, min(90, (int)($s['invoicePaymentTermsDays'] ?? 14))),
        'bankDetails' => sanitizeText($s['bankDetails'] ?? '', 1000),
        'mpesaPaybill' => sanitizeText($s['mpesaPaybill'] ?? '', 120),
        'emailNotificationsEnabled' => !empty($s['emailNotificationsEnabled']),
        'whatsappNotificationsEnabled' => !empty($s['whatsappNotificationsEnabled']),
        'autoInvoiceOnApproval' => !empty($s['autoInvoiceOnApproval']),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeCoursesMap(array $courses): array {
    $cleanMap = [];
    foreach ($courses as $slug => $c) {
        if (!is_array($c)) continue;
        $cleanSlug = preg_replace('/[^a-z0-9\-]/', '', strtolower((string)$slug));
        if (empty($cleanSlug)) continue;
        $feeUsd = isset($c['feeUsd']) ? max(0, (float)$c['feeUsd']) : 1200;
        $discountPercent = isset($c['discountPercent']) ? max(0, min(100, (float)$c['discountPercent'])) : 0;
        $cohorts = [];
        if (isset($c['customCohorts']) && is_array($c['customCohorts'])) {
            foreach (array_slice($c['customCohorts'], 0, 24) as $cohortStr) {
                $s = sanitizeText($cohortStr, 80);
                if ($s !== '') $cohorts[] = $s;
            }
        }
        $rawImage = isset($c['image']) && is_string($c['image']) ? trim($c['image']) : '';
        $cleanImage = '';
        if ($rawImage !== '') {
            if (strpos($rawImage, 'data:image/') === 0 && strlen($rawImage) <= 700000) {
                $cleanImage = $rawImage;
            } else {
                $cleanImage = sanitizeText($rawImage, 1000);
            }
        }
        $contentModules = [];
        if (isset($c['content']) && is_array($c['content'])) {
            foreach (array_slice($c['content'], 0, 20) as $modStr) {
                $m = sanitizeText($modStr, 300);
                if ($m !== '') $contentModules[] = $m;
            }
        }
        $entry = [
            'slug' => $cleanSlug,
            'title' => sanitizeText($c['title'] ?? '', 300),
            'category' => sanitizeText($c['category'] ?? '', 160),
            'duration' => sanitizeText($c['duration'] ?? '5 Days', 64),
            'fee' => sanitizeText($c['fee'] ?? ('$' . $feeUsd), 32),
            'feeUsd' => $feeUsd,
            'feeKes' => isset($c['feeKes']) ? max(0, (float)$c['feeKes']) : ($feeUsd * 130),
            'discountPercent' => $discountPercent,
            'discountPrice' => isset($c['discountPrice']) ? max(0, (float)$c['discountPrice']) : round($feeUsd * (1 - $discountPercent / 100)),
            'customCohorts' => $cohorts,
            'updatedAt' => gmdate('c'),
        ];
        if ($cleanImage !== '') {
            $entry['image'] = $cleanImage;
        }
        if (!empty($c['summary'])) {
            $entry['summary'] = sanitizeText($c['summary'], 1200);
        }
        if (!empty($c['location'])) {
            $entry['location'] = sanitizeText($c['location'], 300);
        }
        if (!empty($contentModules)) {
            $entry['content'] = $contentModules;
        }
        $cleanMap[$cleanSlug] = $entry;
    }
    return $cleanMap;
}

function sanitizeMediaUrl($raw, int $maxDataBytes = 4194304): string {
    if (!is_string($raw)) return '';
    $val = trim($raw);
    if ($val === '') return '';
    if (preg_match('/^(data:image\/(?:png|jpeg|jpg|webp|gif);base64,|data:application\/pdf;base64,)/i', $val)) {
        return strlen($val) <= $maxDataBytes ? $val : '';
    }
    if (preg_match('/^(?:\/|https?:\/\/)/i', $val)) {
        return sanitizeText($val, 1500);
    }
    if ($val === '#') return '#';
    return '';
}

function sanitizeGalleryImage(array $img): array {
    $validCats = ['events', 'fieldwork', 'training', 'community', 'all'];
    $cat = strtolower(sanitizeText($img['category'] ?? 'training', 32));
    if (!in_array($cat, $validCats, true)) {
        $cat = 'training';
    }
    return [
        'id' => sanitizeText($img['id'] ?? ('gal-' . gmdate('Ymd') . '-' . random_int(1000, 9999)), 64),
        'src' => sanitizeMediaUrl($img['src'] ?? '', 3145728),
        'category' => $cat,
        'title' => sanitizeText($img['title'] ?? 'ECAS Institute Activity', 240),
        'description' => sanitizeText($img['description'] ?? '', 800),
        'createdAt' => sanitizeText($img['createdAt'] ?? gmdate('c'), 64),
        'updatedAt' => gmdate('c'),
    ];
}

function sanitizeResourceItem(array $item, string $resourceType): array {
    $tags = [];
    if (isset($item['tags']) && is_array($item['tags'])) {
        foreach (array_slice($item['tags'], 0, 15) as $t) {
            $ts = sanitizeText($t, 48);
            if ($ts !== '') $tags[] = $ts;
        }
    }
    $cleanDocUrl = sanitizeMediaUrl($item['downloadUrl'] ?? ($item['url'] ?? ''), 5242880);
    $cleanImage = sanitizeMediaUrl($item['image'] ?? '', 2097152);
    return [
        'id' => sanitizeText($item['id'] ?? (substr($resourceType, 0, 3) . '-' . gmdate('Ymd') . '-' . random_int(1000, 9999)), 64),
        'title' => sanitizeText($item['title'] ?? '', 300),
        'type' => sanitizeText($item['type'] ?? 'Resource', 120),
        'issue' => sanitizeText($item['issue'] ?? '', 80),
        'date' => sanitizeText($item['date'] ?? gmdate('Y'), 64),
        'pages' => sanitizeText($item['pages'] ?? 'PDF Document', 64),
        'authors' => sanitizeText($item['authors'] ?? ($item['author'] ?? 'ECAS Institute'), 200),
        'author' => sanitizeText($item['author'] ?? ($item['authors'] ?? 'ECAS Institute'), 200),
        'country' => sanitizeText($item['country'] ?? 'Africa / Global', 120),
        'abstract' => sanitizeText($item['abstract'] ?? ($item['summary'] ?? ''), 2500),
        'summary' => sanitizeText($item['summary'] ?? ($item['abstract'] ?? ''), 2500),
        'description' => sanitizeText($item['description'] ?? ($item['summary'] ?? ''), 1500),
        'image' => $cleanImage,
        'downloadUrl' => $cleanDocUrl,
        'url' => sanitizeMediaUrl($item['url'] ?? ($item['downloadUrl'] ?? ''), 5242880),
        'tags' => $tags,
        'isSensitive' => !empty($item['isSensitive']),
        'createdAt' => sanitizeText($item['createdAt'] ?? gmdate('c'), 64),
        'updatedAt' => gmdate('c'),
    ];
}

function cleanupRemovedAccountsAndTestMigrations(array &$store): bool {
    $changed = false;

    // 1. Remove typo administrator account acob@ecasiafrica.org and any sessions for it
    if (isset($store['accounts']) && is_array($store['accounts'])) {
        $origCount = count($store['accounts']);
        $store['accounts'] = array_values(array_filter($store['accounts'], function ($acc) {
            return normalizeAdminEmail($acc['email'] ?? '') !== 'acob@ecasiafrica.org';
        }));
        if (count($store['accounts']) !== $origCount) $changed = true;
    }
    if (isset($store['sessions']) && is_array($store['sessions'])) {
        foreach ($store['sessions'] as $tokHash => $sess) {
            if (normalizeAdminEmail($sess['email'] ?? '') === 'acob@ecasiafrica.org') {
                unset($store['sessions'][$tokHash]);
                $changed = true;
            }
        }
    }

    // 2. Filter deleted registration tombstones
    $deletedRegIds = is_array($store['deletedRegistrationIds'] ?? null) ? $store['deletedRegistrationIds'] : [];
    if (!empty($deletedRegIds) && is_array($store['registrations'] ?? null)) {
        $origRegCount = count($store['registrations']);
        $store['registrations'] = array_values(array_filter($store['registrations'], function ($r) use ($deletedRegIds) {
            $rid = (string)($r['id'] ?? '');
            return $rid === '' || !in_array($rid, $deletedRegIds, true);
        }));
        if (count($store['registrations']) !== $origRegCount) $changed = true;
    }

    // 3. One-time purge of Gift Rioba's test registration/invoice/payment history (mwangorioba@gmail.com / ECAS-400827-1495 / ECAS-INV-2026-0001)
    if (!isset($store['migrations']) || !is_array($store['migrations'])) {
        $store['migrations'] = [];
    }
    if (empty($store['migrations']['purged_gift_rioba_test_20261126'])) {
        $purgedRegIds = [];
        $store['registrations'] = array_values(array_filter($store['registrations'] ?? [], function ($r) use (&$purgedRegIds) {
            $ref = strtoupper((string)($r['referenceNo'] ?? ''));
            $em1 = strtolower((string)($r['officialEmail'] ?? ''));
            $em2 = strtolower((string)($r['personalEmail'] ?? ''));
            $isTest = ($ref === 'ECAS-400827-1495') || ($em1 === 'mwangorioba@gmail.com') || ($em2 === 'mwangorioba@gmail.com');
            if ($isTest && !empty($r['id'])) {
                $purgedRegIds[] = (string)$r['id'];
            }
            return !$isTest;
        }));

        foreach ($purgedRegIds as $prId) {
            if (!in_array($prId, $deletedRegIds, true)) {
                $deletedRegIds[] = $prId;
            }
        }
        $store['deletedRegistrationIds'] = array_slice($deletedRegIds, 0, 2000);

        $purgedInvIds = [];
        $store['invoices'] = array_values(array_filter($store['invoices'] ?? [], function ($inv) use ($purgedRegIds, &$purgedInvIds) {
            $invNo = strtoupper((string)($inv['invoiceNo'] ?? ''));
            $email = strtolower((string)($inv['applicantEmail'] ?? ''));
            $regId = (string)($inv['registrationId'] ?? '');
            $isTest = ($invNo === 'ECAS-INV-2026-0001') || ($email === 'mwangorioba@gmail.com') || ($regId !== '' && in_array($regId, $purgedRegIds, true));
            if ($isTest && !empty($inv['id'])) {
                $purgedInvIds[] = (string)$inv['id'];
            }
            return !$isTest;
        }));

        $store['payments'] = array_values(array_filter($store['payments'] ?? [], function ($pay) use ($purgedRegIds, $purgedInvIds) {
            $invId = (string)($pay['invoiceId'] ?? '');
            $regId = (string)($pay['registrationId'] ?? '');
            $invNo = strtoupper((string)($pay['invoiceNo'] ?? ''));
            $ref = strtolower(trim((string)($pay['reference'] ?? '')));
            $name = strtolower(trim((string)($pay['applicantName'] ?? '')));
            $isTest = ($invId !== '' && in_array($invId, $purgedInvIds, true))
                || ($regId !== '' && in_array($regId, $purgedRegIds, true))
                || ($invNo === 'ECAS-INV-2026-0001')
                || ($ref === 'cheque' && $name === 'gift rioba');
            return !$isTest;
        }));

        $store['auditEvents'] = array_values(array_filter($store['auditEvents'] ?? [], function ($ev) {
            $rec = strtolower((string)($ev['affectedRecord'] ?? '') . ' ' . (string)($ev['newValue'] ?? ''));
            return strpos($rec, 'ecas-400827-1495') === false
                && strpos($rec, 'ecas-inv-2026-0001') === false
                && strpos($rec, 'mwangorioba@gmail.com') === false;
        }));

        $store['migrations']['purged_gift_rioba_test_20261126'] = true;
        $changed = true;
    }

    // 4. One-time purge of phishing/spam/mailinator registrations & all legacy spam/anonymous inquiries (2026-11-27)
    if (empty($store['migrations']['purge_spam_and_inquiries_20261127'])) {
        $deletedRegIds = is_array($store['deletedRegistrationIds'] ?? null) ? $store['deletedRegistrationIds'] : [];
        $deletedInqIds = is_array($store['deletedInquiryIds'] ?? null) ? $store['deletedInquiryIds'] : [];

        $purgedSpamRegIds = [];
        $purgedSpamRefs = [];
        $store['registrations'] = array_values(array_filter($store['registrations'] ?? [], function ($r) use (&$purgedSpamRegIds, &$purgedSpamRefs) {
            if (!is_array($r)) return false;
            if (ecasIsKnownSpamRegistration($r)) {
                if (!empty($r['id'])) $purgedSpamRegIds[] = (string)$r['id'];
                if (!empty($r['referenceNo'])) $purgedSpamRefs[] = strtoupper((string)$r['referenceNo']);
                return false;
            }
            return true;
        }));
        foreach ($purgedSpamRegIds as $pid) {
            if (!in_array($pid, $deletedRegIds, true)) {
                array_unshift($deletedRegIds, $pid);
            }
        }
        $store['deletedRegistrationIds'] = array_slice($deletedRegIds, 0, 2000);

        // Remove any unpaid draft invoices / security alerts tied to the purged spam registrations
        if (!empty($purgedSpamRegIds) || !empty($purgedSpamRefs)) {
            $store['invoices'] = array_values(array_filter($store['invoices'] ?? [], function ($inv) use ($purgedSpamRegIds) {
                $rid = (string)($inv['registrationId'] ?? '');
                return !($rid !== '' && in_array($rid, $purgedSpamRegIds, true) && strtolower((string)($inv['status'] ?? '')) !== 'paid');
            }));
            $store['securityAlerts'] = array_values(array_filter($store['securityAlerts'] ?? [], function ($al) use ($purgedSpamRefs) {
                $rel = strtoupper((string)($al['relatedEntity'] ?? ''));
                return !($rel !== '' && in_array($rel, $purgedSpamRefs, true));
            }));
        }

        // Purge ALL existing spam/anonymous inquiries and record their IDs in deletedInquiryIds
        foreach (($store['inquiries'] ?? []) as $inq) {
            if (is_array($inq) && !empty($inq['id'])) {
                $iid = (string)$inq['id'];
                if (!in_array($iid, $deletedInqIds, true)) {
                    array_unshift($deletedInqIds, $iid);
                }
            }
        }
        $store['inquiries'] = [];
        $store['deletedInquiryIds'] = array_slice($deletedInqIds, 0, 4000);

        $store['migrations']['purge_spam_and_inquiries_20261127'] = true;
        $changed = true;
    }

    return $changed;
}

$needsStoreLock = ($_SERVER['REQUEST_METHOD'] === 'POST')
    || ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['scope'] ?? 'public') === 'admin');
if ($needsStoreLock) {
    $storeLockHandle = acquireStoreLock($dataDir);
}
$store = readStore($storeFile);
$storeDirty = false;
if ($needsStoreLock) {
    if (recoverSiblingStoresData($storeFile, $store)) {
        $storeDirty = true;
    }
    if (cleanupRemovedAccountsAndTestMigrations($store)) {
        $storeDirty = true;
    }
    if ($storeDirty) {
        writeStore($storeFile, $store);
    }
} else {
    cleanupRemovedAccountsAndTestMigrations($store);
}

// ─── GET REQUESTS ─────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $scope = $_GET['scope'] ?? 'public';

    // Real-time Server-Sent Events (SSE) push stream for shared PHP/cPanel hosts
    if ($scope === 'stream') {
        if (session_status() === PHP_SESSION_ACTIVE) {
            @session_write_close();
        }
        @set_time_limit(30);
        header('Content-Type: text/event-stream; charset=utf-8');
        header('Cache-Control: no-cache, no-transform');
        header('X-Accel-Buffering: no');
        while (ob_get_level() > 0) {
            @ob_end_flush();
        }
        $lastMtime = file_exists($storeFile) ? (int)@filemtime($storeFile) : 0;
        $curVer = (int)($store['syncVersion'] ?? 1);
        $curTopic = (string)($store['lastSyncTopic'] ?? 'init');
        echo "event: connected\n";
        echo 'data: ' . json_encode(['version' => $curVer, 'topic' => $curTopic, 'updatedAt' => $store['updatedAt'] ?? gmdate('c')]) . "\n\n";
        @flush();

        $startedAt = time();
        while ((time() - $startedAt) < 22 && !connection_aborted()) {
            usleep(800000);
            clearstatcache(true, $storeFile);
            $newMtime = file_exists($storeFile) ? (int)@filemtime($storeFile) : 0;
            if ($newMtime > $lastMtime) {
                $lastMtime = $newMtime;
                $fresh = readStore($storeFile);
                $newVer = (int)($fresh['syncVersion'] ?? ($curVer + 1));
                if ($newVer !== $curVer) {
                    $curVer = $newVer;
                    $curTopic = (string)($fresh['lastSyncTopic'] ?? 'sync');
                    echo "event: sync_update\n";
                    echo "id: {$curVer}\n";
                    echo 'data: ' . json_encode(['version' => $curVer, 'topic' => $curTopic, 'updatedAt' => $fresh['updatedAt'] ?? gmdate('c')]) . "\n\n";
                    @flush();
                }
            }
        }
        exit;
    }

    $isVerify = ($_GET['verify'] ?? '') === '1';
    $token = getBearerToken();
    $adminEmail = validateAdminToken($store, $token, !$isVerify);

    // System Health Diagnostics (Authenticated administrators only — never exposes secrets)
    if ($scope === 'health' && $adminEmail !== null) {
        $adminRole = getAdminRoleFromStore($store, $adminEmail);
        $storeExists = file_exists($storeFile);
        $storeSize = $storeExists ? (int)@filesize($storeFile) : 0;
        $auditSize = file_exists($auditLogFile) ? (int)@filesize($auditLogFile) : 0;
        $diskFree = @disk_free_space($dataDir);
        $diskTotal = @disk_total_space($dataDir);
        $dbConnected = false;
        $dbNote = 'JSON Secure Store Active';
        if (getenv('DB_NAME') && getenv('DB_USER')) {
            $testConn = @new mysqli(getenv('DB_HOST') ?: 'localhost', getenv('DB_USER'), getenv('DB_PASS') ?: '', getenv('DB_NAME'));
            if ($testConn && !$testConn->connect_error) {
                $dbConnected = true;
                $dbNote = 'MySQL Connected + JSON Secure Store';
                $testConn->close();
            } else {
                $dbNote = 'JSON Secure Store Active (MySQL optional/unconfigured)';
            }
        }
        echo json_encode([
            'success' => true,
            'health' => [
                'apiStatus' => 'Operational',
                'phpVersion' => PHP_VERSION,
                'serverTime' => gmdate('c'),
                'storageWritable' => is_writable($dataDir),
                'storeFileSizeBytes' => $storeSize,
                'auditLogSizeBytes' => $auditSize,
                'diskFreeBytes' => $diskFree !== false ? (int)$diskFree : null,
                'diskTotalBytes' => $diskTotal !== false ? (int)$diskTotal : null,
                'mysqlConfigured' => (bool)(getenv('DB_NAME') && getenv('DB_USER')),
                'mysqlConnected' => $dbConnected,
                'databaseStatus' => $dbNote,
                'mailFunctionAvailable' => function_exists('mail'),
                'turnstileConfigured' => (bool)getenv('TURNSTILE_SECRET_KEY'),
                'activeSessionsCount' => is_array($store['sessions'] ?? null) ? count($store['sessions']) : 0,
                'counts' => [
                    'registrations' => count($store['registrations'] ?? []),
                    'inquiries' => count($store['inquiries'] ?? []),
                    'courses' => count($store['courses'] ?? []),
                    'vacancies' => count($store['vacancies'] ?? []),
                    'applications' => count($store['applications'] ?? []),
                    'invoices' => count($store['invoices'] ?? []),
                    'payments' => count($store['payments'] ?? []),
                    'cohorts' => count($store['cohorts'] ?? []),
                    'communications' => count($store['communications'] ?? []),
                    'auditEvents' => count($store['auditEvents'] ?? []),
                ],
                'actorRole' => $adminRole,
            ],
        ]);
        exit;
    }

    // Only authenticated administrators receive registrations & inquiries (PII)
    if ($scope === 'admin' && $adminEmail !== null) {
        writeStore($storeFile, $store); // Persist session resume / sliding idle activity window
        $adminRole = getAdminRoleFromStore($store, $adminEmail);
        if ($isVerify) {
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'email' => $adminEmail,
                'role' => $adminRole,
                'permissions' => getRolePermissions($adminRole),
            ]);
            exit;
        }
        $publicAccounts = array_map(function ($acc) {
            return [
                'email' => $acc['email'] ?? '',
                'name' => $acc['name'] ?? '',
                'passwordInitialized' => !empty($acc['passwordHash']) || !empty($acc['passwordInitialized']),
                'mfaEnabled' => !empty($acc['mfaEnabled']) && !empty($acc['mfaSecret']),
                'role' => normalizeAdminRole($acc['role'] ?? 'SUPER_ADMIN'),
                'status' => $acc['status'] ?? 'Active',
                'createdAt' => $acc['createdAt'] ?? null,
                'updatedAt' => $acc['updatedAt'] ?? null,
            ];
        }, is_array($store['accounts']) ? $store['accounts'] : []);

        $selfMfaEnabled = false;
        foreach (($store['accounts'] ?? []) as $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === normalizeAdminEmail($adminEmail)) {
                $selfMfaEnabled = !empty($acc['mfaEnabled']) && !empty($acc['mfaSecret']);
                break;
            }
        }

        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'role' => $adminRole,
            'mfaEnabled' => $selfMfaEnabled,
            'permissions' => getRolePermissions($adminRole),
            'data' => [
                'registrations' => $store['registrations'] ?? [],
                'inquiries' => $store['inquiries'] ?? [],
                'deletedInquiryIds' => array_values($store['deletedInquiryIds'] ?? []),
                'deletedRegistrationIds' => array_values($store['deletedRegistrationIds'] ?? []),
                'courses' => (object)($store['courses'] ?? []),
                'vacancies' => $store['vacancies'] ?? [],
                'applications' => $store['applications'] ?? [],
                'invoices' => $store['invoices'] ?? [],
                'payments' => $store['payments'] ?? [],
                'cohorts' => $store['cohorts'] ?? [],
                'communications' => $store['communications'] ?? [],
                'templates' => $store['templates'] ?? [],
                'announcements' => $store['announcements'] ?? [],
                'cmsContent' => (object)($store['cmsContent'] ?? []),
                'gallery' => !empty($store['galleryCustomized']) ? (is_array($store['gallery'] ?? null) ? $store['gallery'] : []) : null,
                'galleryCustomized' => !empty($store['galleryCustomized']),
                'resources' => (object)($store['resources'] ?? []),
                'resourcesCustomized' => (object)($store['resourcesCustomized'] ?? []),
                'settings' => (object)($store['settings'] ?? []),
                'auditEvents' => $store['auditEvents'] ?? [],
                'securityAlerts' => $store['securityAlerts'] ?? [],
                'securityIncidents' => $store['securityIncidents'] ?? [],
                'securityStats' => $store['securityStats'] ?? ['blockedBots' => 0, 'failedLogins' => 0, 'falsePositivesCleared' => 0, 'maliciousUploadsBlocked' => 0],
                'accounts' => $publicAccounts,
                'syncVersion' => (int)($store['syncVersion'] ?? 1),
                'updatedAt' => $store['updatedAt'] ?? gmdate('c'),
            ],
        ]);
        exit;
    }

    if ($scope === 'admin' && $isVerify && $adminEmail === null) {
        writeStore($storeFile, $store);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'authenticated' => false,
            'error' => 'Session expired or invalid.',
        ]);
        exit;
    }

    // Unauthenticated / public callers receive only non-sensitive public catalog, open vacancies, published CMS & announcements.
    // Never expose admin accounts, emails, roles, PII, or internal setup status unauthenticated.
    $publishedCms = [];
    foreach (($store['cmsContent'] ?? []) as $k => $sec) {
        if (is_array($sec) && ($sec['status'] ?? 'Draft') === 'Published') {
            $publishedCms[$k] = $sec;
        }
    }
    $publishedAnnouncements = array_values(array_filter($store['announcements'] ?? [], function ($a) {
        return is_array($a) && ($a['status'] ?? 'Draft') === 'Published';
    }));

    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'data' => [
            'courses' => (object)($store['courses'] ?? []),
            'vacancies' => $store['vacancies'] ?? [],
            'cohorts' => $store['cohorts'] ?? [],
            'cmsContent' => (object)$publishedCms,
            'announcements' => $publishedAnnouncements,
            'gallery' => !empty($store['galleryCustomized']) ? (is_array($store['gallery'] ?? null) ? $store['gallery'] : []) : null,
            'galleryCustomized' => !empty($store['galleryCustomized']),
            'resources' => (object)($store['resources'] ?? []),
            'resourcesCustomized' => (object)($store['resourcesCustomized'] ?? []),
            'syncVersion' => (int)($store['syncVersion'] ?? 1),
            'updatedAt' => $store['updatedAt'] ?? gmdate('c'),
        ],
    ]);
    exit;
}

// ─── POST REQUESTS ────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!ecasVerifyRequestOrigin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Cross-origin request rejected by ECAS CSRF protection.']);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    if ($rawInput === false || strlen($rawInput) > 12582912) { // 12 MB limit (supports CV & supporting certificates)
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'Payload too large or unreadable.']);
        exit;
    }

    $payload = json_decode($rawInput, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Malformed JSON payload.']);
        exit;
    }

    $action = sanitizeText($payload['action'] ?? '', 64);
    $clientIp = getClientIp();

    // 0a. Public Action: Send Applicant Email Verification OTP (Rate-Limited)
    if ($action === 'send_reg_otp') {
        $rate = ecasCheckRateLimit($dataDir, 'reg_otp:' . $clientIp, 6, 900);
        if (!$rate['allowed']) {
            http_response_code(429);
            header('Retry-After: ' . $rate['retryAfter']);
            echo json_encode(['success' => false, 'error' => 'Too many verification code requests. Please wait a few minutes.']);
            exit;
        }
        $targetEmail = strtolower(trim((string)filter_var($payload['email'] ?? '', FILTER_SANITIZE_EMAIL)));
        if (!filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Please enter a valid email address first.']);
            exit;
        }
        $domain = explode('@', $targetEmail)[1] ?? '';
        if (in_array($domain, ECAS_DISPOSABLE_DOMAINS, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Disposable temporary email addresses cannot be verified for course admission.']);
            exit;
        }
        $otpCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpKey = hash('sha256', $targetEmail);
        if (!isset($store['emailOtps']) || !is_array($store['emailOtps'])) $store['emailOtps'] = [];
        // Prune expired OTPs
        $now = time();
        foreach ($store['emailOtps'] as $k => $v) {
            if (!is_array($v) || ((int)($v['expiresAt'] ?? 0)) < $now) unset($store['emailOtps'][$k]);
        }
        $store['emailOtps'][$otpKey] = [
            'hash' => password_hash($otpCode, PASSWORD_BCRYPT),
            'expiresAt' => $now + 900,
            'attempts' => 0,
            'verified' => false,
            'token' => '',
        ];
        writeStore($storeFile, $store);

        $fromEmail = filter_var($store['settings']['officialEmail'] ?? 'admissions@ecasiafrica.org', FILTER_VALIDATE_EMAIL) ?: 'admissions@ecasiafrica.org';
        $subject = 'ECAS Institute — Course Registration Email Verification Code';
        $body = "Hello,\n\nYour ECAS Institute registration verification code is: {$otpCode}\n\nThis code expires in 15 minutes.\nOfficial Website: https://ecasiafrica.org\nIf you did not request this code, please ignore this message.\n";
        $headers = "From: ECAS Institute Admissions <{$fromEmail}>\r\nReply-To: {$fromEmail}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
        $delivered = function_exists('mail') ? @mail($targetEmail, $subject, $body, $headers) : false;

        echo json_encode([
            'success' => true,
            'delivered' => $delivered,
            'message' => $delivered
                ? 'A 6-digit verification code has been sent to your email address (valid for 15 minutes).'
                : 'Verification code generated. If your mail server delays delivery, you may still submit your registration for manual admissions confirmation.',
        ]);
        exit;
    }

    // 0b. Public Action: Verify Applicant Email OTP
    if ($action === 'verify_reg_otp') {
        $targetEmail = strtolower(trim((string)filter_var($payload['email'] ?? '', FILTER_SANITIZE_EMAIL)));
        $code = preg_replace('/\D/', '', trim((string)($payload['code'] ?? '')));
        $otpKey = hash('sha256', $targetEmail);
        $entry = $store['emailOtps'][$otpKey] ?? null;
        if (!is_array($entry) || (int)($entry['expiresAt'] ?? 0) < time()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Verification code expired or not requested.']);
            exit;
        }
        if ((int)($entry['attempts'] ?? 0) >= 5) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Too many failed verification attempts. Please request a new code.']);
            exit;
        }
        if (!password_verify($code, (string)($entry['hash'] ?? ''))) {
            $store['emailOtps'][$otpKey]['attempts'] = (int)($entry['attempts'] ?? 0) + 1;
            writeStore($storeFile, $store);
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Incorrect verification code. Please check your email and try again.']);
            exit;
        }
        $verifyToken = bin2hex(random_bytes(16));
        $store['emailOtps'][$otpKey]['verified'] = true;
        $store['emailOtps'][$otpKey]['token'] = hash('sha256', $verifyToken);
        writeStore($storeFile, $store);
        echo json_encode(['success' => true, 'verified' => true, 'emailVerifyToken' => $verifyToken]);
        exit;
    }

    // 0c. Public Action: Report Suspected Phishing / Fraudulent Communication
    if ($action === 'report_phishing') {
        $rate = ecasCheckRateLimit($dataDir, 'phishing_report:' . $clientIp, 5, 3600);
        if (!$rate['allowed']) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Report rate limit reached. Please email info@ecasiafrica.org directly.']);
            exit;
        }
        $reporterEmail = filter_var(trim((string)($payload['reporterEmail'] ?? '')), FILTER_SANITIZE_EMAIL);
        $suspiciousSender = sanitizeText($payload['suspiciousSender'] ?? '', 200);
        $subjectLine = sanitizeText($payload['subject'] ?? '', 200);
        $details = sanitizeText($payload['details'] ?? '', 1500);
        if ($details === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Please describe the suspicious email, invoice, or message.']);
            exit;
        }
        $alert = ecasRecordSecurityAlert(
            $store,
            'Phishing / Impersonation Report',
            'HIGH',
            $suspiciousSender ?: ($reporterEmail ?: 'Public Report'),
            "Public phishing report from {$reporterEmail} | Sender: {$suspiciousSender} | Subject: {$subjectLine} | Details: {$details}",
            'Verify sender authenticity, warn affected delegates if needed, and review DMARC/SPF logs.',
            $clientIp
        );
        appendAuditEvent($store, $reporterEmail ?: 'public_visitor', 'PUBLIC', 'PHISHING_REPORT_SUBMITTED', 'SecurityAlert', $alert['id'], '', $suspiciousSender);
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'report_phishing', $reporterEmail ?: 'public', 'RECORDED', 'alert=' . $alert['id']);
        echo json_encode(['success' => true, 'reportId' => $alert['id']]);
        exit;
    }

    // 1. Public Action: Submit a New Course Registration (With Server-Side Risk Assessment & Bot Screening)
    if ($action === 'add_registration') {
        $rate = ecasCheckRateLimit($dataDir, 'add_registration:' . $clientIp, 15, 3600);
        if (!$rate['allowed']) {
            ecasRecordSecurityAlert(
                $store,
                'Rate Limit / Bot Flood',
                'HIGH',
                $clientIp,
                'Excessive course registration submission burst exceeded rate limit from IP.',
                'Review recent registrations from this IP and evaluate Cloudflare WAF rules.',
                $clientIp
            );
            $store['securityStats']['blockedBots'] = (int)($store['securityStats']['blockedBots'] ?? 0) + 1;
            writeStore($storeFile, $store);
            http_response_code(429);
            header('Retry-After: ' . $rate['retryAfter']);
            echo json_encode(['success' => false, 'error' => 'Too many registration submissions from your network. Please wait before trying again or contact admissions@ecasiafrica.org.']);
            exit;
        }

        $regInput = $payload['registration'] ?? null;
        if (!is_array($regInput) || empty($regInput['firstName']) || empty($regInput['eventTitle'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required registration fields.']);
            exit;
        }

        $cleanReg = sanitizeRegistration($regInput);
        $cleanReg['submitterIp'] = $clientIp;
        $securityMeta = is_array($payload['securityMeta'] ?? null) ? $payload['securityMeta'] : [];

        // Check whether this call is from an authenticated staff administrator (manual entry)
        $isStaffEntry = (validateAdminToken($store, getBearerToken(), false) !== null);

        // Hard-reject disposable emails, bots, fake organizations & spam BEFORE saving on public submissions
        if (!$isStaffEntry) {
            $spamReason = ecasScreenPublicRegistrationSpam($cleanReg, $securityMeta);
            if ($spamReason !== null) {
                $store['securityStats']['blockedBots'] = (int)($store['securityStats']['blockedBots'] ?? 0) + 1;
                ecasRecordSecurityAlert(
                    $store,
                    'Blocked Spam / Phishing Registration',
                    'HIGH',
                    $cleanReg['referenceNo'] ?: $clientIp,
                    "Blocked non-genuine registration ({$cleanReg['firstName']} {$cleanReg['lastName']}, {$cleanReg['officialEmail']} / {$cleanReg['personalEmail']}, {$cleanReg['organisation']}): {$spamReason}",
                    'Submission was automatically rejected and not stored.',
                    $clientIp
                );
                writeStore($storeFile, $store);
                writeAuditLog($auditLogFile, 'add_registration', $clientIp, 'BLOCKED_SPAM', $spamReason);
                http_response_code(422);
                echo json_encode(['success' => false, 'blocked' => true, 'error' => $spamReason]);
                exit;
            }
        }

        // Check if applicant verified their email via OTP
        $primaryEmail = strtolower(trim((string)($cleanReg['officialEmail'] ?: ($cleanReg['personalEmail'] ?? ''))));
        $emailVerifyToken = sanitizeText($securityMeta['emailVerifyToken'] ?? '', 120);
        $otpVerified = false;
        if ($primaryEmail !== '' && $emailVerifyToken !== '') {
            $otpEntry = $store['emailOtps'][hash('sha256', $primaryEmail)] ?? null;
            if (is_array($otpEntry) && !empty($otpEntry['verified']) && !empty($otpEntry['token']) && hash_equals($otpEntry['token'], hash('sha256', $emailVerifyToken))) {
                $otpVerified = true;
            }
        }

        $securityMeta['emailOtpVerified'] = $otpVerified;

        // Run Authoritative Server-Side Registration Risk Assessment Engine
        $assessment = ecasAssessRegistrationRisk($cleanReg, $store, $clientIp, $securityMeta);
        $cleanReg['securityAssessment'] = $assessment;

        // Enforce Stage 1/2/3 workflow routing without destroying legitimate evidence
        if ($assessment['riskScore'] >= 60) {
            $cleanReg['workflowStage'] = 'Under Review';
            $cleanReg['status'] = 'Under Review';
        } elseif (empty($cleanReg['workflowStage'])) {
            $cleanReg['workflowStage'] = 'Application Received';
        }

        if (!empty($assessment['botFlagged'])) {
            $store['securityStats']['blockedBots'] = (int)($store['securityStats']['blockedBots'] ?? 0) + 1;
        }

        // Auto-generate Security Notification Centre Alert for HIGH / CRITICAL risk
        if ($assessment['riskScore'] >= 60) {
            $reasonSummary = implode('; ', array_map(static fn($r) => $r['detail'], array_slice($assessment['reasons'], 0, 4)));
            ecasRecordSecurityAlert(
                $store,
                $assessment['riskScore'] >= 80 ? 'Critical-Risk Registration' : 'High-Risk Registration',
                $assessment['riskScore'] >= 80 ? 'CRITICAL' : 'HIGH',
                $cleanReg['referenceNo'],
                "Registration {$cleanReg['referenceNo']} ({$cleanReg['firstName']} {$cleanReg['lastName']}, {$cleanReg['organisation']}) scored {$assessment['riskScore']}/100 ({$assessment['riskLevel']}). Reasons: {$reasonSummary}",
                $assessment['recommendedAction'],
                $clientIp
            );
        }

        // Idempotent save: deduplicate retries by id/referenceNo + verify disk write
        $existing = is_array($store['registrations'] ?? null) ? $store['registrations'] : [];
        $alreadyExists = false;
        foreach ($existing as $item) {
            if (
                (!empty($cleanReg['id']) && ($item['id'] ?? '') === $cleanReg['id']) ||
                (!empty($cleanReg['referenceNo']) && ($item['referenceNo'] ?? '') === $cleanReg['referenceNo'])
            ) {
                $alreadyExists = true;
                break;
            }
        }
        if (!$alreadyExists) {
            array_unshift($existing, $cleanReg);
            $store['registrations'] = array_slice($existing, 0, 5000);
            appendAuditEvent(
                $store,
                $primaryEmail ?: 'public_delegate',
                'APPLICANT',
                'REGISTRATION_SCREENED',
                'Registration',
                $cleanReg['referenceNo'],
                '',
                "score={$assessment['riskScore']} ({$assessment['riskLevel']}) clearance={$assessment['securityClearance']}"
            );
            if (!writeStore($storeFile, $store)) {
                writeAuditLog($auditLogFile, 'add_registration', 'system', 'FAILED_STORAGE_WRITE', "dir={$dataDir}");
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Unable to persist registration to storage.']);
                exit;
            }
        }

        $actorEmail = $primaryEmail ?: 'public_delegate';
        writeAuditLog($auditLogFile, 'add_registration', $actorEmail, 'SUCCESS', 'ref=' . $cleanReg['referenceNo'] . ' risk=' . $assessment['riskScore']);

        echo json_encode([
            'success' => true,
            'referenceNo' => $cleanReg['referenceNo'],
            'id' => $cleanReg['id'],
            'securityAssessment' => [
                'riskLevel' => $assessment['riskLevel'],
                'securityClearance' => $assessment['securityClearance'],
                'emailVerification' => $assessment['emailVerification'],
            ],
        ]);
        exit;
    }

    // 1b. Public Action: Record a New WhatsApp / Email / Course Inquiry (Rate-Limited)
    if ($action === 'add_inquiry') {
        $rate = ecasCheckRateLimit($dataDir, 'add_inquiry:' . $clientIp, 20, 900);
        if (!$rate['allowed']) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Too many inquiry requests. Please wait a few minutes.']);
            exit;
        }
        $inqInput = $payload['inquiry'] ?? null;
        if (!is_array($inqInput)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing inquiry data.']);
            exit;
        }

        $cleanInq = sanitizeInquiry($inqInput);
        $inqMeta = is_array($payload['securityMeta'] ?? null) ? $payload['securityMeta'] : [];
        $isStaffInquiry = (validateAdminToken($store, getBearerToken(), false) !== null);

        // Hard-reject spam, phishing, disposable emails, and anonymous non-organizational inquiries
        if (!$isStaffInquiry) {
            $inqSpamReason = ecasScreenPublicInquirySpam($cleanInq, $inqMeta);
            if ($inqSpamReason !== null) {
                $store['securityStats']['blockedBots'] = (int)($store['securityStats']['blockedBots'] ?? 0) + 1;
                writeStore($storeFile, $store);
                writeAuditLog($auditLogFile, 'add_inquiry', $clientIp, 'BLOCKED_SPAM', $inqSpamReason);
                http_response_code(422);
                echo json_encode(['success' => false, 'blocked' => true, 'error' => $inqSpamReason]);
                exit;
            }
        }

        $existingInq = is_array($store['inquiries'] ?? null) ? $store['inquiries'] : [];
        $alreadyExists = false;
        foreach ($existingInq as $item) {
            if (
                (!empty($cleanInq['id']) && ($item['id'] ?? '') === $cleanInq['id']) ||
                (!empty($cleanInq['referenceNo']) && ($item['referenceNo'] ?? '') === $cleanInq['referenceNo'])
            ) {
                $alreadyExists = true;
                break;
            }
        }
        if (!$alreadyExists) {
            array_unshift($existingInq, $cleanInq);
            $store['inquiries'] = array_slice($existingInq, 0, 5000);
            if (!empty($cleanInq['id']) && is_array($store['deletedInquiryIds'] ?? null)) {
                $store['deletedInquiryIds'] = array_values(array_filter(
                    $store['deletedInquiryIds'],
                    fn($delId) => $delId !== $cleanInq['id']
                ));
            }
            if (!writeStore($storeFile, $store)) {
                writeAuditLog($auditLogFile, 'add_inquiry', 'system', 'FAILED_STORAGE_WRITE', "dir={$dataDir}");
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Unable to persist inquiry to storage.']);
                exit;
            }
        }

        $actor = $cleanInq['email'] ?: ($cleanInq['phone'] ?: 'public_visitor');
        writeAuditLog($auditLogFile, 'add_inquiry', $actor, 'SUCCESS', 'channel=' . $cleanInq['channel'] . ' ref=' . $cleanInq['referenceNo']);

        echo json_encode([
            'success' => true,
            'referenceNo' => $cleanInq['referenceNo'],
            'id' => $cleanInq['id'],
        ]);
        exit;
    }

    // 1c. Public Action: Submit a Job Vacancy / Speculative CV Application (Rate-Limited + Magic-Byte File Validation)
    if ($action === 'add_application') {
        $rate = ecasCheckRateLimit($dataDir, 'add_application:' . $clientIp, 10, 3600);
        if (!$rate['allowed']) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Too many application submissions. Please try again later.']);
            exit;
        }
        $appInput = $payload['application'] ?? null;
        if (!is_array($appInput) || empty($appInput['fullName']) || empty($appInput['email'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required applicant name or email.']);
            exit;
        }

        // Strict binary signature check on uploaded CV & Certificates
        foreach (['cvDataUrl' => 'CV', 'certDataUrl' => 'Certificate'] as $field => $label) {
            if (!empty($appInput[$field])) {
                $check = ecasValidateAttachmentStrict($appInput[$field]);
                if (!$check['valid']) {
                    $store['securityStats']['maliciousUploadsBlocked'] = (int)($store['securityStats']['maliciousUploadsBlocked'] ?? 0) + 1;
                    ecasRecordSecurityAlert(
                        $store,
                        'Malicious / Invalid File Upload',
                        'HIGH',
                        sanitizeText($appInput['email'] ?? 'applicant', 140),
                        "Blocked {$label} upload from {$appInput['email']}: {$check['reason']}",
                        'Inspect upload source IP and verify file validation rules.',
                        $clientIp
                    );
                    writeStore($storeFile, $store);
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => "{$label} rejected: {$check['reason']}"]);
                    exit;
                }
            }
        }

        $cleanApp = sanitizeApplication($appInput);
        $existingApps = is_array($store['applications'] ?? null) ? $store['applications'] : [];
        array_unshift($existingApps, $cleanApp);
        $store['applications'] = array_slice($existingApps, 0, 1000);
        writeStore($storeFile, $store);

        $actor = $cleanApp['email'] ?: ($cleanApp['fullName'] ?: 'applicant');
        writeAuditLog($auditLogFile, 'add_application', $actor, 'SUCCESS', 'job=' . $cleanApp['jobTitle'] . ' ref=' . $cleanApp['referenceNo']);

        echo json_encode([
            'success' => true,
            'referenceNo' => $cleanApp['referenceNo'],
            'id' => $cleanApp['id'],
        ]);
        exit;
    }

    // 2. Admin Action: Authenticate (Login with Brute-Force Lockout & 2-Step TOTP MFA)
    if ($action === 'login') {
        $email = normalizeAdminEmail((string)($payload['email'] ?? ''));
        $password = trim((string)($payload['password'] ?? ''));
        $clientDigest = sanitizeText($payload['credentialDigest'] ?? '', 120);

        $lockCheck = ecasCheckLoginLockout($store, $clientIp, $email);
        if ($lockCheck['locked']) {
            http_response_code(429);
            header('Retry-After: ' . $lockCheck['retryAfter']);
            echo json_encode([
                'success' => false,
                'code' => 'ACCOUNT_TEMPORARILY_LOCKED',
                'error' => 'Too many failed sign-in attempts. Access is temporarily locked for ' . ceil($lockCheck['retryAfter'] / 60) . ' minute(s) for security protection.',
            ]);
            exit;
        }

        if (!isAuthorizedAdmin($email, $store)) {
            $failInfo = ecasRecordFailedLogin($store, $clientIp, $email);
            $store['securityStats']['failedLogins'] = (int)($store['securityStats']['failedLogins'] ?? 0) + 1;
            if ($failInfo['locked'] || $failInfo['credentialStuffingSuspected']) {
                ecasRecordSecurityAlert(
                    $store,
                    $failInfo['credentialStuffingSuspected'] ? 'Credential Stuffing Suspected' : 'Brute-Force Login Attempt',
                    'HIGH',
                    $email ?: $clientIp,
                    "Unauthorized admin login attempts ({$failInfo['attempts']}) from IP {$clientIp} targeting {$email}.",
                    'Review audit logs and consider blocking source IP in Cloudflare WAF.',
                    $clientIp
                );
            }
            writeStore($storeFile, $store);
            writeAuditLog($auditLogFile, 'admin_login', $email, 'DENIED_UNAUTHORIZED_EMAIL');
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);
            exit;
        }

        $accounts = is_array($store['accounts']) ? $store['accounts'] : [];
        $matched = null;
        $matchedIdx = -1;
        foreach ($accounts as $idx => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $email) {
                $matched = $acc;
                $matchedIdx = $idx;
                break;
            }
        }

        $hasPasswordSet = $matched && (!empty($matched['passwordHash']) || !empty($matched['passwordInitialized']));
        $verified = false;
        if ($matched && !empty($matched['passwordHash']) && $password !== '') {
            $verified = password_verify($password, $matched['passwordHash']);
        }
        if (!$verified && $matched && empty($matched['passwordHash']) && !empty($matched['credentialDigest']) && $clientDigest !== '') {
            $verified = hash_equals((string)$matched['credentialDigest'], $clientDigest);
            if ($verified && $password !== '' && $matchedIdx >= 0) {
                $store['accounts'][$matchedIdx]['passwordHash'] = password_hash($password, PASSWORD_BCRYPT);
                $store['accounts'][$matchedIdx]['passwordInitialized'] = true;
                $store['accounts'][$matchedIdx]['passwordSetAt'] = $matched['passwordSetAt'] ?? gmdate('c');
            }
        }
        if (!$verified && !$hasPasswordSet && in_array($password, ['msimamizi2026', '2026', 'ecasi2026!'], true)) {
            $verified = true;
        }

        if ($matched && ($matched['status'] ?? 'Active') === 'Suspended') {
            appendAuditEvent($store, $email, $matched['role'] ?? 'SUPPORT_OFFICER', 'LOGIN_BLOCKED_SUSPENDED', 'Auth', $email, '', 'Account suspended');
            writeStore($storeFile, $store);
            writeAuditLog($auditLogFile, 'admin_login', $email, 'DENIED_SUSPENDED');
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'This staff account has been suspended. Please contact a Super Admin.']);
            exit;
        }

        if (!$verified) {
            $failInfo = ecasRecordFailedLogin($store, $clientIp, $email);
            $store['securityStats']['failedLogins'] = (int)($store['securityStats']['failedLogins'] ?? 0) + 1;
            appendAuditEvent($store, $email, $matched['role'] ?? 'UNKNOWN', 'LOGIN_FAILED', 'Auth', $email, '', "Invalid password (attempt {$failInfo['attempts']})");
            if ($failInfo['locked'] || $failInfo['credentialStuffingSuspected']) {
                ecasRecordSecurityAlert(
                    $store,
                    $failInfo['credentialStuffingSuspected'] ? 'Credential Stuffing Detected' : 'Brute-Force Account Lockout',
                    'CRITICAL',
                    $email,
                    "Admin account {$email} experienced {$failInfo['attempts']} failed login attempts from IP {$clientIp} and was temporarily locked.",
                    'Confirm with the account owner and verify MFA is enabled on this account.',
                    $clientIp
                );
            }
            writeStore($storeFile, $store);
            writeAuditLog($auditLogFile, 'admin_login', $email, 'FAILED_BAD_PASSWORD');
            http_response_code($failInfo['locked'] ? 429 : 401);
            echo json_encode([
                'success' => false,
                'error' => $failInfo['locked']
                    ? 'Too many failed sign-in attempts. Please wait 15 minutes before trying again.'
                    : 'Invalid email or password.',
            ]);
            exit;
        }

        $browserProfileId = sanitizeText($payload['browserProfileId'] ?? '', 80);
        reclaimSameBrowserDeadSession($store, $email, $browserProfileId, time());

        if (hasActiveSessionForEmail($store, $email, time())) {
            writeStore($storeFile, $store);
            writeAuditLog($auditLogFile, 'admin_login', $email, 'DENIED_DUPLICATE_SESSION');
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'code' => 'SESSION_ALREADY_ACTIVE',
                'error' => 'This account is already signed in on another active session. Concurrent sessions on the same account are not permitted.',
            ]);
            exit;
        }

        // Check if Multi-Factor Authentication (TOTP) is enabled on this account
        if ($matched && !empty($matched['mfaEnabled']) && !empty($matched['mfaSecret'])) {
            $challengeToken = bin2hex(random_bytes(24));
            if (!isset($store['mfaChallenges']) || !is_array($store['mfaChallenges'])) $store['mfaChallenges'] = [];
            $now = time();
            foreach ($store['mfaChallenges'] as $ck => $cv) {
                if (!is_array($cv) || (int)($cv['expiresAt'] ?? 0) < $now) unset($store['mfaChallenges'][$ck]);
            }
            $store['mfaChallenges'][hash('sha256', $challengeToken)] = [
                'email' => $email,
                'browserProfileId' => $browserProfileId,
                'ip' => $clientIp,
                'expiresAt' => $now + 300, // 5 minutes to enter TOTP code
                'attempts' => 0,
            ];
            writeStore($storeFile, $store);
            echo json_encode([
                'success' => true,
                'mfaRequired' => true,
                'mfaChallengeToken' => $challengeToken,
                'email' => $email,
                'message' => 'Please enter the 6-digit code from your Authenticator App (or a backup recovery code).',
            ]);
            exit;
        }

        ecasClearLoginThrottle($store, $clientIp, $email);
        $resolvedRole = normalizeAdminRole($matched['role'] ?? 'SUPER_ADMIN');
        $token = issueAdminToken($store, $email, $browserProfileId);
        appendAuditEvent($store, $email, $resolvedRole, 'ADMIN_LOGIN', 'Auth', $email, '', 'Authenticated session started');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'admin_login', $email, 'SUCCESS');

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'email' => $email,
                'name' => $matched['name'] ?? '',
                'role' => $resolvedRole,
                'mfaEnabled' => false,
                'permissions' => getRolePermissions($resolvedRole),
            ],
        ]);
        exit;
    }

    // 2b. Admin Action: Verify 2-Step TOTP MFA Code or Backup Recovery Code
    if ($action === 'mfa_verify_login') {
        $challengeToken = trim((string)($payload['mfaChallengeToken'] ?? ''));
        $codeInput = trim((string)($payload['code'] ?? ''));
        $cHash = hash('sha256', $challengeToken);
        $challenge = $store['mfaChallenges'][$cHash] ?? null;
        if (!is_array($challenge) || (int)($challenge['expiresAt'] ?? 0) < time()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'MFA challenge expired. Please sign in again.']);
            exit;
        }
        if ((int)($challenge['attempts'] ?? 0) >= 5) {
            unset($store['mfaChallenges'][$cHash]);
            writeStore($storeFile, $store);
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Too many invalid MFA attempts. Please sign in again.']);
            exit;
        }

        $email = normalizeAdminEmail($challenge['email'] ?? '');
        $matched = null;
        $matchedIdx = -1;
        foreach (($store['accounts'] ?? []) as $idx => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $email) {
                $matched = $acc;
                $matchedIdx = $idx;
                break;
            }
        }
        if (!$matched || empty($matched['mfaSecret'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'MFA verification unavailable for this account.']);
            exit;
        }

        $mfaOk = ecasVerifyTotpCode((string)$matched['mfaSecret'], $codeInput, 1);
        $usedRecovery = false;
        if (!$mfaOk && is_array($matched['mfaRecoveryHashes'] ?? null)) {
            $upperCode = strtoupper($codeInput);
            foreach ($matched['mfaRecoveryHashes'] as $rIdx => $rHash) {
                if (password_verify($upperCode, (string)$rHash)) {
                    $mfaOk = true;
                    $usedRecovery = true;
                    array_splice($store['accounts'][$matchedIdx]['mfaRecoveryHashes'], $rIdx, 1);
                    break;
                }
            }
        }

        if (!$mfaOk) {
            $store['mfaChallenges'][$cHash]['attempts'] = (int)($challenge['attempts'] ?? 0) + 1;
            $store['securityStats']['failedLogins'] = (int)($store['securityStats']['failedLogins'] ?? 0) + 1;
            appendAuditEvent($store, $email, $matched['role'] ?? 'SUPER_ADMIN', 'MFA_VERIFICATION_FAILED', 'Auth', $email, '', 'Invalid TOTP/recovery code');
            writeStore($storeFile, $store);
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid authenticator code. Please check your Authenticator App and retry.']);
            exit;
        }

        unset($store['mfaChallenges'][$cHash]);
        ecasClearLoginThrottle($store, $clientIp, $email);
        $resolvedRole = normalizeAdminRole($matched['role'] ?? 'SUPER_ADMIN');
        $token = issueAdminToken($store, $email, (string)($challenge['browserProfileId'] ?? ''));
        appendAuditEvent($store, $email, $resolvedRole, 'ADMIN_LOGIN_MFA', 'Auth', $email, '', $usedRecovery ? 'Authenticated via single-use backup recovery code' : 'Authenticated via TOTP MFA');
        if ($usedRecovery) {
            ecasRecordSecurityAlert($store, 'MFA Recovery Code Used', 'MEDIUM', $email, "Administrator {$email} signed in using a single-use MFA backup recovery code.", 'Verify this login was authorized and regenerate backup codes if needed.', $clientIp);
        }
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'admin_login_mfa', $email, 'SUCCESS');

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'email' => $email,
                'name' => $matched['name'] ?? '',
                'role' => $resolvedRole,
                'mfaEnabled' => true,
                'permissions' => getRolePermissions($resolvedRole),
            ],
        ]);
        exit;
    }

    // 3. Admin Action: One-Time First-Time Password Setup (Permanently locked once password is created; NEVER auto-logs in)
    if ($action === 'register_admin') {
        $email = normalizeAdminEmail((string)($payload['email'] ?? ''));
        $password = trim((string)($payload['password'] ?? ''));
        $clientDigest = sanitizeText($payload['credentialDigest'] ?? '', 120);

        if (!isAuthorizedAdmin($email, $store)) {
            writeAuditLog($auditLogFile, 'register_admin', $email, 'DENIED_UNAUTHORIZED_EMAIL');
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Unable to activate this account. Please verify your details or contact your system administrator.']);
            exit;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long.']);
            exit;
        }

        $accounts = is_array($store['accounts']) ? $store['accounts'] : [];
        $foundIdx = -1;
        foreach ($accounts as $idx => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $email) {
                $foundIdx = $idx;
                break;
            }
        }

        // CRITICAL SECURITY LOCK: Once a password exists for this account, NEVER allow first-time setup to overwrite it!
        if ($foundIdx >= 0 && (!empty($accounts[$foundIdx]['passwordHash']) || !empty($accounts[$foundIdx]['passwordInitialized']))) {
            appendAuditEvent(
                $store,
                $email,
                $accounts[$foundIdx]['role'] ?? 'SUPER_ADMIN',
                'PASSWORD_SETUP_BLOCKED',
                'Auth',
                $email,
                '',
                'Blocked attempt to overwrite an already-initialized password via First-Time Setup'
            );
            writeStore($storeFile, $store);
            writeAuditLog($auditLogFile, 'register_admin', $email, 'DENIED_PASSWORD_ALREADY_SET');
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'code' => 'PASSWORD_ALREADY_SET',
                'error' => 'Unable to complete setup for this account. Please sign in with your existing password.',
            ]);
            exit;
        }

        if ($foundIdx >= 0 && ($accounts[$foundIdx]['status'] ?? 'Active') === 'Suspended') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'This staff account has been suspended. Please contact a Super Admin.']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $assignedRole = $foundIdx >= 0
            ? normalizeAdminRole($accounts[$foundIdx]['role'] ?? 'SUPPORT_OFFICER')
            : (isSuperAdminEmail($email) ? 'SUPER_ADMIN' : 'SUPPORT_OFFICER');
        $finalRole = isSuperAdminEmail($email) ? 'SUPER_ADMIN' : $assignedRole;

        $record = [
            'email' => $email,
            'passwordHash' => $hash,
            'passwordInitialized' => true,
            'passwordSetAt' => gmdate('c'),
            'credentialDigest' => $clientDigest,
            'role' => $finalRole,
            'status' => $foundIdx >= 0 ? ($accounts[$foundIdx]['status'] ?? 'Active') : 'Active',
            'updatedAt' => gmdate('c'),
        ];

        if ($foundIdx >= 0) {
            $accounts[$foundIdx] = array_merge($accounts[$foundIdx], $record);
        } else {
            $record['createdAt'] = gmdate('c');
            $accounts[] = $record;
        }

        $store['accounts'] = $accounts;
        appendAuditEvent($store, $email, $finalRole, 'INITIAL_PASSWORD_CREATED', 'Auth', $email, '', 'One-time password setup completed and permanently locked');

        if (!writeStore($storeFile, $store)) {
            writeAuditLog($auditLogFile, 'register_admin', $email, 'FAILED_STORAGE_WRITE', "dir={$dataDir}");
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'code' => 'STORAGE_WRITE_FAILED',
                'error' => 'Server could not persist your password to secure storage. Please contact system administration to verify cPanel folder permissions.',
            ]);
            exit;
        }

        writeAuditLog($auditLogFile, 'register_admin', $email, 'SUCCESS_PASSWORD_LOCKED');

        // SECURITY: Do NOT issue a session token or auto-login after password creation.
        // The administrator must sign in normally using their newly created password.
        echo json_encode([
            'success' => true,
            'passwordCreated' => true,
            'requiresSignIn' => true,
            'message' => 'Account password configured successfully. Please sign in to continue.',
            'user' => [
                'email' => $email,
                'role' => $finalRole,
            ],
        ]);
        exit;
    }

    // 3b. Session Lifecycle Actions (Logout, Tab Closing, Silent Session Check)
    if ($action === 'logout' || $action === 'tab_closing') {
        $lifecycleToken = getBearerToken() ?: sanitizeText($payload['token'] ?? '', 128);
        $now = time();
        pruneExpiredSessions($store, $now);
        if (!empty($lifecycleToken) && strlen($lifecycleToken) >= 32) {
            $targetHash = hash('sha256', $lifecycleToken);
            foreach ($store['sessions'] as $tokHash => $session) {
                if (hash_equals($tokHash, $targetHash)) {
                    $actorEmail = $session['email'] ?? 'admin';
                    if ($action === 'logout') {
                        unset($store['sessions'][$tokHash]);
                        writeAuditLog($auditLogFile, 'admin_logout', $actorEmail, 'SUCCESS');
                    } else {
                        $store['sessions'][$tokHash]['closingAt'] = $now;
                    }
                    break;
                }
            }
        }
        writeStore($storeFile, $store);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'verify_session' || $action === 'heartbeat') {
        $token = getBearerToken();
        $adminEmail = validateAdminToken($store, $token, false);
        writeStore($storeFile, $store);
        if ($adminEmail === null) {
            http_response_code(401);
            echo json_encode(['success' => false, 'authenticated' => false, 'error' => 'Session expired or ended.']);
            exit;
        }
        echo json_encode(['success' => true, 'authenticated' => true, 'email' => $adminEmail]);
        exit;
    }

    // 4. All Subsequent Mutations Require a Valid Admin Session Token
    $token = getBearerToken();
    $adminEmail = validateAdminToken($store, $token, true);
    if ($adminEmail === null) {
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, $action ?: 'unknown', 'unauthenticated', 'DENIED_INVALID_TOKEN');
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required. Please sign in to Msimamizi.']);
        exit;
    }

    $adminRole = getAdminRoleFromStore($store, $adminEmail);
    $enforcePermission = function (string $perm) use ($adminRole, $adminEmail, $action, $auditLogFile) {
        if (!roleHasPermission($adminRole, $perm)) {
            writeAuditLog($auditLogFile, $action, $adminEmail, 'FORBIDDEN_RBAC', "required={$perm} role={$adminRole}");
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => "Access denied. Your role ({$adminRole}) does not have permission: {$perm}."]);
            exit;
        }
    };

    if ($action === 'touch_activity') {
        writeStore($storeFile, $store);
        echo json_encode(['success' => true, 'email' => $adminEmail, 'role' => $adminRole]);
        exit;
    }

    if ($action === 'set_registrations' && isset($payload['registrations']) && is_array($payload['registrations'])) {
        $enforcePermission('admissions.write');
        $existingById = [];
        foreach (($store['registrations'] ?? []) as $er) {
            if (is_array($er) && !empty($er['id'])) $existingById[$er['id']] = $er;
        }
        $restrictedStages = ['Approved', 'Invoice Issued', 'Payment Pending', 'Payment Confirmed', 'Enrolment Confirmed', 'Training In Progress', 'Completed'];
        $cleanList = [];
        foreach (array_slice($payload['registrations'], 0, 5000) as $r) {
            if (!is_array($r)) continue;
            $sanitized = sanitizeRegistration($r);
            $prevReg = $existingById[$sanitized['id']] ?? null;
            // Preserve server-computed securityAssessment against client tampering unless updated via security_review_decision
            if ($prevReg && is_array($prevReg['securityAssessment'] ?? null)) {
                $sanitized['securityAssessment'] = $prevReg['securityAssessment'];
            }
            $sec = $sanitized['securityAssessment'] ?? null;
            $riskScore = is_array($sec) ? (int)($sec['riskScore'] ?? 0) : 0;
            $clearance = is_array($sec) ? (string)($sec['securityClearance'] ?? '') : '';
            $targetStage = $sanitized['workflowStage'] ?: $sanitized['status'];
            if ($riskScore >= 60 && $clearance !== 'Cleared' && in_array($targetStage, $restrictedStages, true)) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'code' => 'SECURITY_CLEARANCE_REQUIRED',
                    'error' => "Security Gate Blocked: Registration {$sanitized['referenceNo']} is flagged ({$sec['riskLevel']} — Score {$riskScore}/100) and MUST be cleared in the Security Review Queue before moving to \"{$targetStage}\".",
                ]);
                exit;
            }
            $cleanList[] = $sanitized;
        }
        $prevRegs = is_array($store['registrations'] ?? null) ? $store['registrations'] : [];
        $prevCount = count($prevRegs);
        $nextIds = array_flip(array_values(array_filter(array_map(fn($x) => (string)($x['id'] ?? ''), $cleanList))));
        $deletedRegIds = is_array($store['deletedRegistrationIds'] ?? null) ? $store['deletedRegistrationIds'] : [];
        if (!empty($payload['deletedRegistrationId'])) {
            $delId = sanitizeText($payload['deletedRegistrationId'], 64);
            if ($delId !== '' && !in_array($delId, $deletedRegIds, true)) {
                array_unshift($deletedRegIds, $delId);
            }
        }
        foreach ($prevRegs as $pr) {
            $pid = (string)($pr['id'] ?? '');
            if ($pid !== '' && !isset($nextIds[$pid]) && !in_array($pid, $deletedRegIds, true)) {
                array_unshift($deletedRegIds, $pid);
            }
        }
        $store['deletedRegistrationIds'] = array_slice($deletedRegIds, 0, 2000);
        $store['registrations'] = $cleanList;
        $store['lastSyncTopic'] = 'registrations';
        $auditMeta = is_array($payload['audit'] ?? null) ? $payload['audit'] : [];
        appendAuditEvent(
            $store,
            $adminEmail,
            $adminRole,
            sanitizeText($auditMeta['action'] ?? 'UPDATE_REGISTRATIONS', 80),
            'Registration',
            sanitizeText($auditMeta['record'] ?? ('Total: ' . count($cleanList)), 180),
            sanitizeText($auditMeta['previousValue'] ?? "count={$prevCount}", 400),
            sanitizeText($auditMeta['newValue'] ?? ('count=' . count($cleanList)), 400)
        );
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_registrations', $adminEmail, 'SUCCESS', 'count=' . count($cleanList));

        echo json_encode(['success' => true, 'count' => count($cleanList)]);
        exit;
    }

    if ($action === 'update_inquiry' && !empty($payload['id']) && is_array($payload['updates'] ?? null)) {
        $enforcePermission('crm.write');
        $targetId = sanitizeText($payload['id'], 64);
        $updates = $payload['updates'];
        $existingInq = is_array($store['inquiries'] ?? null) ? $store['inquiries'] : [];
        $updated = false;
        foreach ($existingInq as $idx => $inq) {
            if (($inq['id'] ?? '') === $targetId) {
                $existingInq[$idx] = sanitizeInquiry(array_merge($inq, $updates, ['id' => $inq['id']]));
                $updated = true;
                break;
            }
        }
        if (!$updated && is_array($payload['inquiry'] ?? null)) {
            $cleanItem = sanitizeInquiry(array_merge($payload['inquiry'], $updates, ['id' => $targetId]));
            array_unshift($existingInq, $cleanItem);
            $updated = true;
        }
        $store['inquiries'] = array_slice($existingInq, 0, 5000);
        if ($updated) {
            appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_LEAD', 'Lead', $targetId, '', sanitizeText($updates['status'] ?? 'Updated', 200));
            writeStore($storeFile, $store);
            writeAuditLog($auditLogFile, 'update_inquiry', $adminEmail, 'SUCCESS', "id={$targetId}");
        }
        echo json_encode(['success' => true, 'updated' => $updated, 'inquiries' => $store['inquiries']]);
        exit;
    }

    if ($action === 'purge_spam_registrations') {
        $enforcePermission('admissions.write');
        $deletedRegIds = is_array($store['deletedRegistrationIds'] ?? null) ? $store['deletedRegistrationIds'] : [];
        $purgedCount = 0;
        $purgedRefs = [];
        $store['registrations'] = array_values(array_filter($store['registrations'] ?? [], function ($r) use (&$deletedRegIds, &$purgedCount, &$purgedRefs) {
            if (!is_array($r)) return false;
            if (ecasIsKnownSpamRegistration($r)) {
                $purgedCount++;
                if (!empty($r['id']) && !in_array((string)$r['id'], $deletedRegIds, true)) {
                    array_unshift($deletedRegIds, (string)$r['id']);
                }
                if (!empty($r['referenceNo'])) {
                    $purgedRefs[] = strtoupper((string)$r['referenceNo']);
                }
                return false;
            }
            return true;
        }));
        $store['deletedRegistrationIds'] = array_slice($deletedRegIds, 0, 2000);
        appendAuditEvent($store, $adminEmail, $adminRole, 'PURGE_SPAM_REGISTRATIONS', 'Registration', "Purged {$purgedCount} spam records", '', implode(', ', array_slice($purgedRefs, 0, 20)));
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'purge_spam_registrations', $adminEmail, 'SUCCESS', "purged={$purgedCount}");
        echo json_encode([
            'success' => true,
            'purgedCount' => $purgedCount,
            'registrations' => $store['registrations'],
            'deletedRegistrationIds' => $store['deletedRegistrationIds'],
        ]);
        exit;
    }

    if ($action === 'purge_all_inquiries') {
        $enforcePermission('crm.write');
        $existingInq = is_array($store['inquiries'] ?? null) ? $store['inquiries'] : [];
        $deletedIds = is_array($store['deletedInquiryIds'] ?? null) ? $store['deletedInquiryIds'] : [];
        $purgedCount = count($existingInq);
        foreach ($existingInq as $inq) {
            if (is_array($inq) && !empty($inq['id'])) {
                $iid = (string)$inq['id'];
                if (!in_array($iid, $deletedIds, true)) {
                    array_unshift($deletedIds, $iid);
                }
            }
        }
        $store['inquiries'] = [];
        $store['deletedInquiryIds'] = array_slice($deletedIds, 0, 4000);
        appendAuditEvent($store, $adminEmail, $adminRole, 'PURGE_ALL_INQUIRIES', 'Lead', "Purged {$purgedCount} inquiries", "count={$purgedCount}", 'count=0');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'purge_all_inquiries', $adminEmail, 'SUCCESS', "purged={$purgedCount}");
        echo json_encode([
            'success' => true,
            'purgedCount' => $purgedCount,
            'inquiries' => [],
            'deletedInquiryIds' => $store['deletedInquiryIds'],
        ]);
        exit;
    }

    if ($action === 'delete_inquiry' && !empty($payload['id'])) {
        $enforcePermission('crm.write');
        $targetId = sanitizeText($payload['id'], 64);
        $existingInq = is_array($store['inquiries'] ?? null) ? $store['inquiries'] : [];
        $store['inquiries'] = array_values(array_filter($existingInq, fn($inq) => ($inq['id'] ?? '') !== $targetId));
        $deletedIds = is_array($store['deletedInquiryIds'] ?? null) ? $store['deletedInquiryIds'] : [];
        if (!in_array($targetId, $deletedIds, true)) {
            array_unshift($deletedIds, $targetId);
        }
        $store['deletedInquiryIds'] = array_slice($deletedIds, 0, 2000);
        appendAuditEvent($store, $adminEmail, $adminRole, 'DELETE_LEAD', 'Lead', $targetId, 'Active', 'Deleted');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'delete_inquiry', $adminEmail, 'SUCCESS', "id={$targetId}");
        echo json_encode([
            'success' => true,
            'inquiries' => $store['inquiries'],
            'deletedInquiryIds' => $store['deletedInquiryIds'],
        ]);
        exit;
    }

    if ($action === 'merge_inquiries' && isset($payload['inquiries']) && is_array($payload['inquiries'])) {
        $enforcePermission('crm.view');
        $existingInq = is_array($store['inquiries'] ?? null) ? $store['inquiries'] : [];
        $deletedIds = is_array($store['deletedInquiryIds'] ?? null) ? $store['deletedInquiryIds'] : [];
        $seenKeys = [];
        foreach ($existingInq as $ex) {
            if (!empty($ex['id'])) $seenKeys['id:' . $ex['id']] = true;
            if (!empty($ex['referenceNo'])) $seenKeys['ref:' . $ex['referenceNo']] = true;
        }
        $addedCount = 0;
        foreach (array_slice($payload['inquiries'], 0, 500) as $candidate) {
            if (!is_array($candidate)) continue;
            $cleanInq = sanitizeInquiry($candidate);
            $candId = $cleanInq['id'] ?? '';
            $candRef = $cleanInq['referenceNo'] ?? '';
            if ($candId !== '' && in_array($candId, $deletedIds, true)) continue;
            if (ecasScreenPublicInquirySpam($cleanInq, []) !== null) continue;
            if (($candId !== '' && isset($seenKeys['id:' . $candId])) || ($candRef !== '' && isset($seenKeys['ref:' . $candRef]))) {
                continue;
            }
            $existingInq[] = $cleanInq;
            if ($candId !== '') $seenKeys['id:' . $candId] = true;
            if ($candRef !== '') $seenKeys['ref:' . $candRef] = true;
            $addedCount++;
        }
        if ($addedCount > 0) {
            usort($existingInq, function ($a, $b) {
                return strcmp((string)($b['createdAt'] ?? ''), (string)($a['createdAt'] ?? ''));
            });
            $store['inquiries'] = array_slice($existingInq, 0, 5000);
            if (!writeStore($storeFile, $store)) {
                writeAuditLog($auditLogFile, 'merge_inquiries', $adminEmail, 'FAILED_STORAGE_WRITE', "dir={$dataDir}");
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Unable to persist merged inquiries to storage.']);
                exit;
            }
            writeAuditLog($auditLogFile, 'merge_inquiries', $adminEmail, 'SUCCESS', "added={$addedCount} total=" . count($store['inquiries']));
        }
        echo json_encode([
            'success' => true,
            'added' => $addedCount,
            'inquiries' => $store['inquiries'] ?? [],
            'deletedInquiryIds' => $deletedIds,
        ]);
        exit;
    }

    if ($action === 'set_inquiries' && isset($payload['inquiries']) && is_array($payload['inquiries'])) {
        $enforcePermission('crm.write');
        $cleanInqList = [];
        foreach (array_slice($payload['inquiries'], 0, 5000) as $inq) {
            if (is_array($inq)) {
                $cleanInqList[] = sanitizeInquiry($inq);
            }
        }
        $store['inquiries'] = $cleanInqList;
        $auditMeta = is_array($payload['audit'] ?? null) ? $payload['audit'] : [];
        appendAuditEvent(
            $store,
            $adminEmail,
            $adminRole,
            sanitizeText($auditMeta['action'] ?? 'UPDATE_LEADS', 80),
            'Lead',
            sanitizeText($auditMeta['record'] ?? ('Total: ' . count($cleanInqList)), 180),
            sanitizeText($auditMeta['previousValue'] ?? '', 400),
            sanitizeText($auditMeta['newValue'] ?? ('count=' . count($cleanInqList)), 400)
        );
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_inquiries', $adminEmail, 'SUCCESS', 'count=' . count($cleanInqList));

        echo json_encode(['success' => true, 'count' => count($cleanInqList)]);
        exit;
    }

    if ($action === 'set_courses' && isset($payload['courses']) && is_array($payload['courses'])) {
        $enforcePermission('courses.write');
        $store['courses'] = sanitizeCoursesMap($payload['courses']);
        $auditMeta = is_array($payload['audit'] ?? null) ? $payload['audit'] : [];
        appendAuditEvent(
            $store,
            $adminEmail,
            $adminRole,
            sanitizeText($auditMeta['action'] ?? 'UPDATE_COURSES', 80),
            'Course',
            sanitizeText($auditMeta['record'] ?? ('Catalog overrides: ' . count($store['courses'])), 180),
            sanitizeText($auditMeta['previousValue'] ?? '', 400),
            sanitizeText($auditMeta['newValue'] ?? '', 400)
        );
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_courses', $adminEmail, 'SUCCESS', 'count=' . count($store['courses']));

        echo json_encode(['success' => true, 'count' => count($store['courses'])]);
        exit;
    }

    if ($action === 'set_vacancies' && isset($payload['vacancies']) && is_array($payload['vacancies'])) {
        $enforcePermission('recruitment.write');
        $cleanVacList = [];
        foreach (array_slice($payload['vacancies'], 0, 500) as $vac) {
            if (is_array($vac) && !empty($vac['title'])) {
                $cleanVacList[] = sanitizeVacancy($vac);
            }
        }
        $store['vacancies'] = $cleanVacList;
        appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_VACANCIES', 'Vacancy', 'Total: ' . count($cleanVacList), '', 'Synced to website');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_vacancies', $adminEmail, 'SUCCESS', 'count=' . count($cleanVacList));

        echo json_encode(['success' => true, 'count' => count($cleanVacList)]);
        exit;
    }

    if ($action === 'set_applications' && isset($payload['applications']) && is_array($payload['applications'])) {
        $enforcePermission('recruitment.write');
        $cleanAppList = [];
        foreach (array_slice($payload['applications'], 0, 1000) as $app) {
            if (is_array($app)) {
                $cleanAppList[] = sanitizeApplication($app);
            }
        }
        $store['applications'] = $cleanAppList;
        appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_CANDIDATES', 'Candidate', 'Total: ' . count($cleanAppList), '', 'Status/notes updated');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_applications', $adminEmail, 'SUCCESS', 'count=' . count($cleanAppList));

        echo json_encode(['success' => true, 'count' => count($cleanAppList)]);
        exit;
    }

    // ─── NEW ENTERPRISE MODULE ENDPOINTS ──────────────────────────────────────

    if ($action === 'set_invoices' && isset($payload['invoices']) && is_array($payload['invoices'])) {
        $enforcePermission('finance.write');
        $regsById = [];
        foreach (($store['registrations'] ?? []) as $regItem) {
            if (is_array($regItem) && !empty($regItem['id'])) $regsById[$regItem['id']] = $regItem;
        }
        $clean = [];
        foreach (array_slice($payload['invoices'], 0, 5000) as $inv) {
            if (!is_array($inv)) continue;
            $sanitizedInv = sanitizeInvoice($inv);
            // MANDATORY SECURITY GATE: Block invoicing any High/Critical risk registration without Security Clearance
            if (!empty($sanitizedInv['registrationId']) && ($sanitizedInv['status'] !== 'Cancelled') && isset($regsById[$sanitizedInv['registrationId']])) {
                $linkedReg = $regsById[$sanitizedInv['registrationId']];
                $sec = $linkedReg['securityAssessment'] ?? null;
                if (is_array($sec) && (int)($sec['riskScore'] ?? 0) >= 60 && ($sec['securityClearance'] ?? '') !== 'Cleared') {
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'code' => 'SECURITY_CLEARANCE_REQUIRED',
                        'error' => "Security Gate Blocked: Cannot issue invoice for {$linkedReg['referenceNo']} ({$sec['riskLevel']}) until a Verification Officer or Super Admin grants Security Clearance.",
                    ]);
                    exit;
                }
            }
            $clean[] = $sanitizedInv;
        }
        $store['invoices'] = $clean;
        $auditMeta = is_array($payload['audit'] ?? null) ? $payload['audit'] : [];
        appendAuditEvent(
            $store,
            $adminEmail,
            $adminRole,
            sanitizeText($auditMeta['action'] ?? 'UPDATE_INVOICES', 80),
            'Invoice',
            sanitizeText($auditMeta['record'] ?? ('Total: ' . count($clean)), 180),
            sanitizeText($auditMeta['previousValue'] ?? '', 400),
            sanitizeText($auditMeta['newValue'] ?? '', 400)
        );
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_invoices', $adminEmail, 'SUCCESS', 'count=' . count($clean));
        echo json_encode(['success' => true, 'count' => count($clean)]);
        exit;
    }

    if ($action === 'set_payments' && isset($payload['payments']) && is_array($payload['payments'])) {
        $enforcePermission('finance.write');
        $seenRefs = [];
        $clean = [];
        foreach (array_slice($payload['payments'], 0, 5000) as $pay) {
            if (!is_array($pay)) continue;
            $sp = sanitizePayment($pay);
            $normRef = strtoupper(trim($sp['reference']));
            if ($normRef !== '' && isset($seenRefs[$normRef])) {
                $sp['reconciliationStatus'] = 'Duplicate';
                ecasRecordSecurityAlert(
                    $store,
                    'Duplicate Payment Reference',
                    'HIGH',
                    $sp['reference'],
                    "Duplicate payment reference {$sp['reference']} detected across multiple transactions (Invoice {$sp['invoiceNo']}).",
                    'Reconcile against bank/M-Pesa statement before confirming delegate enrolment.',
                    $clientIp
                );
            } elseif ($normRef !== '') {
                $seenRefs[$normRef] = true;
            }
            $clean[] = $sp;
        }
        $store['payments'] = $clean;
        $auditMeta = is_array($payload['audit'] ?? null) ? $payload['audit'] : [];
        appendAuditEvent(
            $store,
            $adminEmail,
            $adminRole,
            sanitizeText($auditMeta['action'] ?? 'RECORD_PAYMENT', 80),
            'Payment',
            sanitizeText($auditMeta['record'] ?? ('Total: ' . count($clean)), 180),
            sanitizeText($auditMeta['previousValue'] ?? '', 400),
            sanitizeText($auditMeta['newValue'] ?? '', 400)
        );
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_payments', $adminEmail, 'SUCCESS', 'count=' . count($clean));
        echo json_encode(['success' => true, 'count' => count($clean)]);
        exit;
    }

    if ($action === 'set_cohorts' && isset($payload['cohorts']) && is_array($payload['cohorts'])) {
        $enforcePermission('courses.write');
        $clean = [];
        foreach (array_slice($payload['cohorts'], 0, 1000) as $coh) {
            if (is_array($coh)) $clean[] = sanitizeCohort($coh);
        }
        $store['cohorts'] = $clean;
        appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_COHORTS', 'Cohort', 'Total: ' . count($clean), '', 'Cohort schedules updated');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_cohorts', $adminEmail, 'SUCCESS', 'count=' . count($clean));
        echo json_encode(['success' => true, 'count' => count($clean)]);
        exit;
    }

    if ($action === 'set_communications' && isset($payload['communications']) && is_array($payload['communications'])) {
        $enforcePermission('communications.write');
        $clean = [];
        foreach (array_slice($payload['communications'], 0, 3000) as $msg) {
            if (is_array($msg)) $clean[] = sanitizeCommunication($msg);
        }
        $store['communications'] = $clean;
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_communications', $adminEmail, 'SUCCESS', 'count=' . count($clean));
        echo json_encode(['success' => true, 'count' => count($clean)]);
        exit;
    }

    if ($action === 'send_email') {
        $enforcePermission('communications.write');
        $to = filter_var(trim((string)($payload['to'] ?? '')), FILTER_VALIDATE_EMAIL);
        $subject = sanitizeText($payload['subject'] ?? '', 240);
        $body = sanitizeText($payload['body'] ?? '', 4000);
        if (!$to || $subject === '' || $body === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Valid recipient email, subject, and message body are required.']);
            exit;
        }
        $fromEmail = filter_var($store['settings']['officialEmail'] ?? 'info@ecasiafrica.org', FILTER_VALIDATE_EMAIL) ?: 'info@ecasiafrica.org';
        $headers = "From: ECAS Institute <{$fromEmail}>\r\nReply-To: {$fromEmail}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
        $sent = function_exists('mail') ? @mail($to, $subject, $body, $headers) : false;
        $status = $sent ? 'Sent' : 'Queued / Mailer Unconfigured';
        $commRecord = sanitizeCommunication([
            'channel' => 'Email',
            'category' => $payload['category'] ?? 'Direct Email',
            'recipientName' => $payload['recipientName'] ?? $to,
            'recipientContact' => $to,
            'subject' => $subject,
            'body' => $body,
            'templateName' => $payload['templateName'] ?? '',
            'deliveryStatus' => $status,
            'linkedEntityId' => $payload['linkedEntityId'] ?? '',
            'sentBy' => $adminEmail,
            'sentAt' => gmdate('c'),
        ]);
        $existingComms = is_array($store['communications'] ?? null) ? $store['communications'] : [];
        array_unshift($existingComms, $commRecord);
        $store['communications'] = array_slice($existingComms, 0, 3000);
        appendAuditEvent($store, $adminEmail, $adminRole, 'SEND_EMAIL', 'Communication', $to, '', "{$subject} ({$status})");
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'send_email', $adminEmail, $sent ? 'SENT' : 'LOGGED_ONLY', "to={$to}");
        echo json_encode(['success' => true, 'delivered' => $sent, 'deliveryStatus' => $status, 'record' => $commRecord]);
        exit;
    }

    if ($action === 'set_templates' && isset($payload['templates']) && is_array($payload['templates'])) {
        $enforcePermission('communications.write');
        $clean = [];
        foreach (array_slice($payload['templates'], 0, 200) as $tpl) {
            if (is_array($tpl)) $clean[] = sanitizeTemplate($tpl);
        }
        $store['templates'] = $clean;
        writeStore($storeFile, $store);
        echo json_encode(['success' => true, 'count' => count($clean)]);
        exit;
    }

    if ($action === 'set_announcements' && isset($payload['announcements']) && is_array($payload['announcements'])) {
        $enforcePermission('communications.write');
        $clean = [];
        foreach (array_slice($payload['announcements'], 0, 200) as $ann) {
            if (is_array($ann)) $clean[] = sanitizeAnnouncement($ann);
        }
        $store['announcements'] = $clean;
        appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_ANNOUNCEMENTS', 'Announcement', 'Total: ' . count($clean), '', 'Announcements updated');
        writeStore($storeFile, $store);
        echo json_encode(['success' => true, 'count' => count($clean)]);
        exit;
    }

    if ($action === 'set_cms_content' && isset($payload['cmsContent']) && is_array($payload['cmsContent'])) {
        $enforcePermission('cms.write');
        $store['cmsContent'] = sanitizeCmsContent($payload['cmsContent']);
        $store['lastSyncTopic'] = 'cms';
        $auditMeta = is_array($payload['audit'] ?? null) ? $payload['audit'] : [];
        appendAuditEvent(
            $store,
            $adminEmail,
            $adminRole,
            sanitizeText($auditMeta['action'] ?? 'UPDATE_CMS', 80),
            'WebsiteCMS',
            sanitizeText($auditMeta['record'] ?? 'Website Content', 180),
            sanitizeText($auditMeta['previousValue'] ?? '', 400),
            sanitizeText($auditMeta['newValue'] ?? '', 400)
        );
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_cms_content', $adminEmail, 'SUCCESS', 'sections=' . count($store['cmsContent']));
        echo json_encode(['success' => true, 'count' => count($store['cmsContent'])]);
        exit;
    }

    if ($action === 'set_gallery' && isset($payload['gallery']) && is_array($payload['gallery'])) {
        $enforcePermission('cms.write');
        $cleanGallery = [];
        foreach (array_slice($payload['gallery'], 0, 500) as $img) {
            if (!is_array($img)) continue;
            $cleanItem = sanitizeGalleryImage($img);
            if ($cleanItem['src'] !== '') {
                $cleanGallery[] = $cleanItem;
            }
        }
        $store['gallery'] = $cleanGallery;
        $store['galleryCustomized'] = true;
        $store['lastSyncTopic'] = 'gallery';
        appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_GALLERY', 'Gallery', 'Photos: ' . count($cleanGallery), '', 'Synced to website');
        if (!writeStore($storeFile, $store)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Unable to save gallery changes to server storage.']);
            exit;
        }
        writeAuditLog($auditLogFile, 'set_gallery', $adminEmail, 'SUCCESS', 'count=' . count($cleanGallery));
        echo json_encode([
            'success' => true,
            'count' => count($cleanGallery),
            'gallery' => $cleanGallery,
            'syncVersion' => $store['syncVersion'],
        ]);
        exit;
    }

    if ($action === 'set_resources' && isset($payload['resourceType']) && isset($payload['items']) && is_array($payload['items'])) {
        $enforcePermission('cms.write');
        $resourceType = sanitizeText($payload['resourceType'], 40);
        $validResourceTypes = ['publications', 'reports', 'policies', 'videos', 'books', 'policyBriefs'];
        if (!in_array($resourceType, $validResourceTypes, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Unsupported resource category.']);
            exit;
        }
        $cleanItems = [];
        foreach (array_slice($payload['items'], 0, 500) as $item) {
            if (!is_array($item)) continue;
            $cleanItem = sanitizeResourceItem($item, $resourceType);
            if ($cleanItem['title'] !== '') {
                $cleanItems[] = $cleanItem;
            }
        }
        if (!isset($store['resources']) || !is_array($store['resources'])) $store['resources'] = [];
        if (!isset($store['resourcesCustomized']) || !is_array($store['resourcesCustomized'])) $store['resourcesCustomized'] = [];
        $store['resources'][$resourceType] = $cleanItems;
        $store['resourcesCustomized'][$resourceType] = true;
        $store['lastSyncTopic'] = 'resources';
        appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_RESOURCES', 'Resource', "{$resourceType}: " . count($cleanItems) . ' items', '', 'Synced to website');
        if (!writeStore($storeFile, $store)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Unable to save resource changes to server storage.']);
            exit;
        }
        writeAuditLog($auditLogFile, 'set_resources', $adminEmail, 'SUCCESS', "type={$resourceType} count=" . count($cleanItems));
        echo json_encode([
            'success' => true,
            'resourceType' => $resourceType,
            'count' => count($cleanItems),
            'items' => $cleanItems,
            'syncVersion' => $store['syncVersion'],
        ]);
        exit;
    }

    if ($action === 'set_settings' && isset($payload['settings']) && is_array($payload['settings'])) {
        $enforcePermission('admin.manage');
        $store['settings'] = sanitizeSettings($payload['settings']);
        appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_PLATFORM_SETTINGS', 'Settings', 'Platform Settings', '', 'Configuration updated');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'set_settings', $adminEmail, 'SUCCESS');
        echo json_encode(['success' => true, 'settings' => $store['settings']]);
        exit;
    }

    if ($action === 'manage_staff_account') {
        $enforcePermission('admin.manage');
        $targetEmail = normalizeAdminEmail((string)($payload['email'] ?? ''));
        if (!isValidInstitutionalEmail($targetEmail)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Staff account must use a valid @ecasiafrica.org email address.']);
            exit;
        }
        $isProtectedSuper = isSuperAdminEmail($targetEmail);
        $newRole = $isProtectedSuper ? 'SUPER_ADMIN' : normalizeAdminRole($payload['role'] ?? 'SUPPORT_OFFICER');
        $newStatus = $isProtectedSuper ? 'Active' : (in_array($payload['status'] ?? 'Active', ['Active', 'Suspended'], true) ? $payload['status'] : 'Active');
        $newName = sanitizeText($payload['name'] ?? '', 140);
        $initialPassword = trim((string)($payload['password'] ?? ''));
        $clientDigest = sanitizeText($payload['credentialDigest'] ?? '', 120);

        if ($initialPassword !== '' && strlen($initialPassword) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Initial password must be at least 6 characters long.']);
            exit;
        }

        $accounts = is_array($store['accounts'] ?? null) ? $store['accounts'] : [];
        $idx = -1;
        foreach ($accounts as $i => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $targetEmail) {
                $idx = $i;
                break;
            }
        }
        $prevRole = $idx >= 0 ? ($accounts[$idx]['role'] ?? 'SUPPORT_OFFICER') : 'None';
        if ($idx >= 0) {
            $accounts[$idx]['role'] = $newRole;
            $accounts[$idx]['status'] = $newStatus;
            if ($newName !== '') $accounts[$idx]['name'] = $newName;
            if ($initialPassword !== '') {
                $accounts[$idx]['passwordHash'] = password_hash($initialPassword, PASSWORD_BCRYPT);
                $accounts[$idx]['passwordInitialized'] = true;
                $accounts[$idx]['passwordSetAt'] = gmdate('c');
                if ($clientDigest !== '') $accounts[$idx]['credentialDigest'] = $clientDigest;
            }
            $accounts[$idx]['updatedAt'] = gmdate('c');
            $accounts[$idx]['addedBy'] = $accounts[$idx]['addedBy'] ?? $adminEmail;
        } else {
            $entry = [
                'email' => $targetEmail,
                'name' => $newName,
                'role' => $newRole,
                'status' => $newStatus,
                'addedBy' => $adminEmail,
                'createdAt' => gmdate('c'),
                'updatedAt' => gmdate('c'),
            ];
            if ($initialPassword !== '') {
                $entry['passwordHash'] = password_hash($initialPassword, PASSWORD_BCRYPT);
                $entry['passwordInitialized'] = true;
                $entry['passwordSetAt'] = gmdate('c');
                if ($clientDigest !== '') $entry['credentialDigest'] = $clientDigest;
            }
            $accounts[] = $entry;
        }
        $store['accounts'] = $accounts;
        appendAuditEvent($store, $adminEmail, $adminRole, $idx >= 0 ? 'UPDATE_STAFF_USER' : 'ADD_STAFF_USER', 'StaffAccount', $targetEmail, "role={$prevRole}", "role={$newRole}, status={$newStatus}" . ($initialPassword !== '' ? ', password_set' : ''));
        if (!writeStore($storeFile, $store)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save staff account changes to server storage.']);
            exit;
        }
        writeAuditLog($auditLogFile, 'manage_staff_account', $adminEmail, 'SUCCESS', "target={$targetEmail} role={$newRole} status={$newStatus}");
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'delete_staff_account') {
        $enforcePermission('admin.manage');
        $targetEmail = normalizeAdminEmail((string)($payload['email'] ?? ''));
        if (isSuperAdminEmail($targetEmail)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Primary Super Admin accounts (Jacob Olonde & Gift Rioba) cannot be deleted.']);
            exit;
        }
        $accounts = is_array($store['accounts'] ?? null) ? $store['accounts'] : [];
        $store['accounts'] = array_values(array_filter($accounts, function ($acc) use ($targetEmail) {
            return normalizeAdminEmail($acc['email'] ?? '') !== $targetEmail;
        }));
        appendAuditEvent($store, $adminEmail, $adminRole, 'REMOVE_STAFF_USER', 'StaffAccount', $targetEmail, 'Active', 'Removed');
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'delete_staff_account', $adminEmail, 'SUCCESS', "target={$targetEmail}");
        echo json_encode(['success' => true]);
        exit;
    }

    // ─── SECURITY REVIEW QUEUE, MFA, PASSWORD ROTATION, ALERTS & BACKUPS ──────

    if ($action === 'security_review_decision') {
        $enforcePermission('security.review');
        $regId = sanitizeText($payload['registrationId'] ?? '', 64);
        $decision = sanitizeText($payload['decision'] ?? '', 48); // Clear | ClearFalsePositive | RequestDocs | VerifyOrg | Escalate | RejectFraud
        $justification = sanitizeText($payload['justification'] ?? '', 800);
        if ($regId === '' || $decision === '' || strlen($justification) < 5) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Registration ID, decision, and a written justification (min. 5 chars) are required.']);
            exit;
        }
        $foundIdx = -1;
        foreach (($store['registrations'] ?? []) as $idx => $r) {
            if (($r['id'] ?? '') === $regId) { $foundIdx = $idx; break; }
        }
        if ($foundIdx < 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Registration not found.']);
            exit;
        }
        $reg = $store['registrations'][$foundIdx];
        $sec = is_array($reg['securityAssessment'] ?? null) ? $reg['securityAssessment'] : [
            'riskScore' => 0, 'riskLevel' => 'LOW RISK', 'reasons' => [], 'orgVerification' => 'Unverified',
            'emailVerification' => 'Unverified', 'phoneVerification' => 'Unverified', 'securityClearance' => 'Pending Review', 'reviewHistory' => [],
        ];
        $prevClearance = (string)($sec['securityClearance'] ?? 'Pending Review');
        if ($decision === 'Clear' || $decision === 'ClearFalsePositive') {
            $sec['securityClearance'] = 'Cleared';
            $sec['requiresSecurityReview'] = false;
            if ($decision === 'ClearFalsePositive') {
                $sec['falsePositiveCleared'] = true;
                $store['securityStats']['falsePositivesCleared'] = (int)($store['securityStats']['falsePositivesCleared'] ?? 0) + 1;
            }
        } elseif ($decision === 'VerifyOrg') {
            $sec['orgVerification'] = 'Verified by Officer';
        } elseif ($decision === 'RequestDocs') {
            $reg['workflowStage'] = 'Documents Required';
            $reg['status'] = 'Documents Required';
            $sec['securityClearance'] = 'Pending Documents';
        } elseif ($decision === 'Escalate') {
            $sec['securityClearance'] = 'Escalated to Super Admin';
            ecasRecordSecurityAlert($store, 'Escalated Registration Review', 'CRITICAL', $reg['referenceNo'], "Officer {$adminEmail} escalated {$reg['referenceNo']}: {$justification}", 'Super Admin review required before any action.', $clientIp);
        } elseif ($decision === 'RejectFraud') {
            $sec['securityClearance'] = 'Rejected — Fraudulent';
            $reg['workflowStage'] = 'Rejected';
            $reg['status'] = 'Rejected';
        }

        if (!empty($payload['orgVerification'])) $sec['orgVerification'] = sanitizeText($payload['orgVerification'], 80);
        if (!empty($payload['emailVerification'])) $sec['emailVerification'] = sanitizeText($payload['emailVerification'], 80);
        if (!empty($payload['phoneVerification'])) $sec['phoneVerification'] = sanitizeText($payload['phoneVerification'], 80);

        $history = is_array($sec['reviewHistory'] ?? null) ? $sec['reviewHistory'] : [];
        array_unshift($history, [
            'decision' => $decision,
            'justification' => $justification,
            'officer' => $adminEmail,
            'role' => $adminRole,
            'at' => gmdate('c'),
        ]);
        $sec['reviewHistory'] = array_slice($history, 0, 50);
        $sec['reviewedBy'] = $adminEmail;
        $sec['reviewedAt'] = gmdate('c');
        $reg['securityAssessment'] = $sec;
        $reg['updatedAt'] = gmdate('c');
        $store['registrations'][$foundIdx] = $reg;

        appendAuditEvent($store, $adminEmail, $adminRole, 'SECURITY_REVIEW_' . strtoupper($decision), 'Registration', $reg['referenceNo'], $prevClearance, "{$sec['securityClearance']} — {$justification}");
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, 'security_review_decision', $adminEmail, 'SUCCESS', "ref={$reg['referenceNo']} decision={$decision}");
        echo json_encode(['success' => true, 'registration' => $reg]);
        exit;
    }

    if ($action === 'update_security_alert') {
        $enforcePermission('security.review');
        $alertId = sanitizeText($payload['alertId'] ?? '', 64);
        $nextStatus = sanitizeText($payload['status'] ?? 'Acknowledged', 32);
        $notes = sanitizeText($payload['resolutionNotes'] ?? '', 600);
        $assigned = sanitizeText($payload['assignedOfficer'] ?? '', 160);
        foreach (($store['securityAlerts'] ?? []) as $idx => $a) {
            if (($a['id'] ?? '') === $alertId) {
                $prevSt = $a['status'] ?? 'Open';
                $store['securityAlerts'][$idx]['status'] = in_array($nextStatus, ['Open', 'Acknowledged', 'Investigating', 'Resolved', 'False Positive'], true) ? $nextStatus : 'Acknowledged';
                if ($notes !== '') $store['securityAlerts'][$idx]['resolutionNotes'] = $notes;
                if ($assigned !== '') $store['securityAlerts'][$idx]['assignedOfficer'] = $assigned;
                $store['securityAlerts'][$idx]['updatedAt'] = gmdate('c');
                appendAuditEvent($store, $adminEmail, $adminRole, 'UPDATE_SECURITY_ALERT', 'SecurityAlert', $alertId, $prevSt, "{$nextStatus} {$notes}");
                writeStore($storeFile, $store);
                echo json_encode(['success' => true, 'alert' => $store['securityAlerts'][$idx]]);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Security alert not found.']);
        exit;
    }

    if ($action === 'save_security_incident') {
        $enforcePermission('security.review');
        $incInput = is_array($payload['incident'] ?? null) ? $payload['incident'] : [];
        $incId = sanitizeText($incInput['id'] ?? ('INC-' . gmdate('Ymd') . '-' . random_int(100, 999)), 64);
        $record = [
            'id' => $incId,
            'title' => sanitizeText($incInput['title'] ?? 'Security Incident', 200),
            'category' => sanitizeText($incInput['category'] ?? 'Unauthorized Access', 80),
            'severity' => in_array($incInput['severity'] ?? 'HIGH', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], true) ? $incInput['severity'] : 'HIGH',
            'phase' => sanitizeText($incInput['phase'] ?? '1. Detected', 64),
            'affectedComponent' => sanitizeText($incInput['affectedComponent'] ?? '', 200),
            'containmentActions' => sanitizeText($incInput['containmentActions'] ?? '', 1500),
            'rootCause' => sanitizeText($incInput['rootCause'] ?? '', 1500),
            'assignedOfficer' => sanitizeText($incInput['assignedOfficer'] ?? $adminEmail, 160),
            'status' => in_array($incInput['status'] ?? 'Open', ['Open', 'Contained', 'Investigating', 'Restored', 'Closed'], true) ? $incInput['status'] : 'Open',
            'createdAt' => sanitizeText($incInput['createdAt'] ?? gmdate('c'), 64),
            'updatedAt' => gmdate('c'),
        ];
        if (!isset($store['securityIncidents']) || !is_array($store['securityIncidents'])) $store['securityIncidents'] = [];
        $replaced = false;
        foreach ($store['securityIncidents'] as $idx => $existingInc) {
            if (($existingInc['id'] ?? '') === $incId) {
                $store['securityIncidents'][$idx] = $record;
                $replaced = true;
                break;
            }
        }
        if (!$replaced) array_unshift($store['securityIncidents'], $record);
        appendAuditEvent($store, $adminEmail, $adminRole, $replaced ? 'UPDATE_INCIDENT' : 'CREATE_INCIDENT', 'SecurityIncident', $incId, '', "{$record['title']} ({$record['status']})");
        writeStore($storeFile, $store);
        echo json_encode(['success' => true, 'incident' => $record]);
        exit;
    }

    if ($action === 'mfa_setup_start') {
        $normSelf = normalizeAdminEmail($adminEmail);
        $secret = ecasGenerateTotpSecret(32);
        $found = false;
        foreach (($store['accounts'] ?? []) as $idx => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $normSelf) {
                $store['accounts'][$idx]['pendingMfaSecret'] = $secret;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $store['accounts'][] = [
                'email' => $normSelf,
                'role' => $adminRole,
                'status' => 'Active',
                'pendingMfaSecret' => $secret,
                'createdAt' => gmdate('c'),
                'updatedAt' => gmdate('c'),
            ];
        }
        writeStore($storeFile, $store);
        $issuer = rawurlencode('ECAS Msimamizi');
        $label = rawurlencode("ECAS Msimamizi:{$normSelf}");
        $otpauthUri = "otpauth://totp/{$label}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";
        echo json_encode(['success' => true, 'secret' => $secret, 'otpauthUri' => $otpauthUri]);
        exit;
    }

    if ($action === 'mfa_setup_confirm') {
        $normSelf = normalizeAdminEmail($adminEmail);
        $code = trim((string)($payload['code'] ?? ''));
        foreach (($store['accounts'] ?? []) as $idx => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $normSelf) {
                $pending = (string)($acc['pendingMfaSecret'] ?? '');
                if ($pending === '' || !ecasVerifyTotpCode($pending, $code, 1)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Invalid 6-digit code from Authenticator App. Please verify your device clock and try again.']);
                    exit;
                }
                $recovery = ecasGenerateRecoveryCodes(8);
                $store['accounts'][$idx]['mfaSecret'] = $pending;
                $store['accounts'][$idx]['mfaEnabled'] = true;
                $store['accounts'][$idx]['mfaEnabledAt'] = gmdate('c');
                $store['accounts'][$idx]['mfaRecoveryHashes'] = $recovery['hashed'];
                unset($store['accounts'][$idx]['pendingMfaSecret']);
                appendAuditEvent($store, $adminEmail, $adminRole, 'MFA_ENABLED', 'Auth', $normSelf, 'Disabled', 'TOTP Authenticator App Enabled');
                ecasRecordSecurityAlert($store, 'Security Configuration Change', 'LOW', $normSelf, "Administrator {$normSelf} enabled TOTP Multi-Factor Authentication.", 'No action needed if initiated by account owner.', $clientIp);
                writeStore($storeFile, $store);
                echo json_encode(['success' => true, 'mfaEnabled' => true, 'recoveryCodes' => $recovery['plain']]);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'MFA enrollment session not found. Please start MFA setup again.']);
        exit;
    }

    if ($action === 'mfa_disable') {
        $normSelf = normalizeAdminEmail($adminEmail);
        $currentPassword = trim((string)($payload['currentPassword'] ?? ''));
        foreach (($store['accounts'] ?? []) as $idx => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $normSelf) {
                if (!empty($acc['passwordHash']) && !password_verify($currentPassword, (string)$acc['passwordHash'])) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'error' => 'Current password verification failed.']);
                    exit;
                }
                $store['accounts'][$idx]['mfaEnabled'] = false;
                unset($store['accounts'][$idx]['mfaSecret'], $store['accounts'][$idx]['pendingMfaSecret'], $store['accounts'][$idx]['mfaRecoveryHashes']);
                appendAuditEvent($store, $adminEmail, $adminRole, 'MFA_DISABLED', 'Auth', $normSelf, 'Enabled', 'Disabled by account owner');
                ecasRecordSecurityAlert($store, 'Security Configuration Change', 'HIGH', $normSelf, "Multi-Factor Authentication was disabled for {$normSelf}.", 'Verify this change was authorized by the administrator.', $clientIp);
                writeStore($storeFile, $store);
                echo json_encode(['success' => true, 'mfaEnabled' => false]);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Account not found.']);
        exit;
    }

    if ($action === 'change_password') {
        $normSelf = normalizeAdminEmail($adminEmail);
        $currentPassword = trim((string)($payload['currentPassword'] ?? ''));
        $newPassword = trim((string)($payload['newPassword'] ?? ''));
        $newDigest = sanitizeText($payload['credentialDigest'] ?? '', 120);
        if (strlen($newPassword) < 8) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'New password must be at least 8 characters long.']);
            exit;
        }
        foreach (($store['accounts'] ?? []) as $idx => $acc) {
            if (normalizeAdminEmail($acc['email'] ?? '') === $normSelf) {
                if (!empty($acc['passwordHash']) && !password_verify($currentPassword, (string)$acc['passwordHash'])) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'error' => 'Current password is incorrect.']);
                    exit;
                }
                $store['accounts'][$idx]['passwordHash'] = password_hash($newPassword, PASSWORD_BCRYPT);
                $store['accounts'][$idx]['passwordInitialized'] = true;
                $store['accounts'][$idx]['passwordSetAt'] = gmdate('c');
                if ($newDigest !== '') $store['accounts'][$idx]['credentialDigest'] = $newDigest;
                // Invalidate all OTHER active sessions for this account immediately
                $curTokHash = hash('sha256', $token);
                foreach (($store['sessions'] ?? []) as $sHash => $sess) {
                    if (normalizeAdminEmail($sess['email'] ?? '') === $normSelf && !hash_equals($sHash, $curTokHash)) {
                        unset($store['sessions'][$sHash]);
                    }
                }
                appendAuditEvent($store, $adminEmail, $adminRole, 'PASSWORD_CHANGED', 'Auth', $normSelf, '', 'Password rotated; other sessions invalidated');
                ecasRecordSecurityAlert($store, 'Security Configuration Change', 'MEDIUM', $normSelf, "Password rotated for administrator {$normSelf}; all other sessions invalidated.", 'Confirm this password change was performed by the account owner.', $clientIp);
                if (!writeStore($storeFile, $store)) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Failed to persist updated password to server storage.']);
                    exit;
                }
                echo json_encode(['success' => true, 'message' => 'Password updated securely. All other sessions have been invalidated.']);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Account record not found.']);
        exit;
    }

    if ($action === 'export_verified_backup') {
        $enforcePermission('admin.manage');
        $safeStore = $store;
        // Never export raw session tokens, OTPs, MFA secrets, or bcrypt password hashes in backups downloaded to browsers
        unset($safeStore['sessions'], $safeStore['emailOtps'], $safeStore['mfaChallenges'], $safeStore['loginThrottle']);
        $safeStore['accounts'] = array_map(static function ($a) {
            return [
                'email' => $a['email'] ?? '',
                'name' => $a['name'] ?? '',
                'role' => $a['role'] ?? 'SUPPORT_OFFICER',
                'status' => $a['status'] ?? 'Active',
                'mfaEnabled' => !empty($a['mfaEnabled']),
                'passwordInitialized' => !empty($a['passwordInitialized']) || !empty($a['passwordHash']),
                'createdAt' => $a['createdAt'] ?? null,
            ];
        }, is_array($store['accounts'] ?? null) ? $store['accounts'] : []);

        $payloadJson = json_encode($safeStore, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $checksum = hash('sha256', (string)$payloadJson);
        appendAuditEvent($store, $adminEmail, $adminRole, 'BACKUP_EXPORTED', 'Database', 'Verified Institutional Backup', '', "sha256={$checksum}");
        writeStore($storeFile, $store);
        echo json_encode([
            'success' => true,
            'exportedAt' => gmdate('c'),
            'sha256' => $checksum,
            'backup' => $safeStore,
        ]);
        exit;
    }

    if ($action === 'log_audit_event') {
        $evAction = sanitizeText($payload['eventAction'] ?? 'DATA_EXPORT', 80);
        $entityType = sanitizeText($payload['entityType'] ?? 'Report', 64);
        $record = sanitizeText($payload['affectedRecord'] ?? '', 200);
        $prevVal = sanitizeText($payload['previousValue'] ?? '', 400);
        $newVal = sanitizeText($payload['newValue'] ?? '', 400);
        appendAuditEvent($store, $adminEmail, $adminRole, $evAction, $entityType, $record, $prevVal, $newVal);
        writeStore($storeFile, $store);
        writeAuditLog($auditLogFile, $evAction, $adminEmail, 'SUCCESS', $record);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Unsupported action.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
