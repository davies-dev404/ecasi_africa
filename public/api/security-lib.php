<?php
/**
 * ECAS Africa — Core Backend Cybersecurity, Fraud Detection, TOTP MFA & Validation Library
 * Shared across msimamizi-sync.php, verify-turnstile.php, and subscribe.php.
 *
 * Security Controls Implemented:
 * 1. Strict CORS allowlist + Origin/Referer CSRF enforcement.
 * 2. Persistent sliding-window Rate Limiter & Brute-Force Lockout (IP + Account).
 * 3. RFC 6238 TOTP Multi-Factor Authentication (Authenticator App) + Bcrypt Recovery Codes.
 * 4. Binary Magic-Byte File Signature Verification & Active-Payload Scanning.
 * 5. Server-Side Registration Fraud & Risk Scoring Engine (0-100: LOW/MEDIUM/HIGH/CRITICAL).
 * 6. Hashed Email OTP Verification for Applicants.
 * 7. Structured Security Alerts & Incident Logging.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

const ECAS_ALLOWED_ORIGINS = [
    'https://ecasiafrica.org',
    'https://www.ecasiafrica.org',
    'https://msimamizi.ecasiafrica.org',
    'https://msimamiziecasi.vercel.app',
    'http://localhost:5173',
    'http://localhost:8080',
];

function ecasApplySecurityHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, private, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
}

function ecasApplyStrictCors(string $methods = 'GET, POST, OPTIONS', string $headers = 'Content-Type, Authorization, X-Admin-Token, X-Requested-With'): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && in_array($origin, ECAS_ALLOWED_ORIGINS, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    } else {
        header('Access-Control-Allow-Origin: https://ecasiafrica.org');
        header('Vary: Origin');
    }
    header("Access-Control-Allow-Methods: $methods");
    header("Access-Control-Allow-Headers: $headers");
}

function ecasIsLocalHost(): bool {
    $host = strtolower($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '');
    return str_starts_with($host, 'localhost') || str_starts_with($host, '127.0.0.1');
}

/**
 * CSRF / Cross-Origin Protection for State-Changing Requests.
 * Rejects requests coming from untrusted third-party Origin/Referer headers.
 */
function ecasVerifyRequestOrigin(): bool {
    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin !== '') {
        return in_array($origin, ECAS_ALLOWED_ORIGINS, true);
    }
    $referer = trim((string)($_SERVER['HTTP_REFERER'] ?? ''));
    if ($referer !== '') {
        $parsed = parse_url($referer);
        if (!is_array($parsed) || empty($parsed['scheme']) || empty($parsed['host'])) {
            return false;
        }
        $refOrigin = $parsed['scheme'] . '://' . $parsed['host'] . (!empty($parsed['port']) ? ':' . $parsed['port'] : '');
        return in_array($refOrigin, ECAS_ALLOWED_ORIGINS, true);
    }
    // Allow direct server-to-server / Beacon requests without Origin when same-site
    return true;
}

/**
 * Persistent Sliding-Window Rate Limiter (stored in private data directory).
 * Returns ['allowed' => bool, 'remaining' => int, 'retryAfter' => int, 'count' => int].
 */
function ecasCheckRateLimit(string $dataDir, string $bucketKey, int $maxRequests, int $windowSeconds): array {
    $rateFile = rtrim($dataDir, '/\\') . '/rate_limits.json';
    $now = time();
    $state = [];

    if (file_exists($rateFile)) {
        $raw = @file_get_contents($rateFile);
        $decoded = $raw ? json_decode($raw, true) : null;
        if (is_array($decoded)) {
            $state = $decoded;
        }
    }

    // Prune stale buckets periodically
    foreach ($state as $k => $timestamps) {
        if (!is_array($timestamps)) {
            unset($state[$k]);
            continue;
        }
        $filtered = array_values(array_filter($timestamps, static fn($ts) => is_int($ts) && ($now - $ts) < 3600));
        if (empty($filtered)) {
            unset($state[$k]);
        } else {
            $state[$k] = $filtered;
        }
    }

    $hashKey = hash('sha256', $bucketKey);
    $hits = $state[$hashKey] ?? [];
    $windowHits = array_values(array_filter($hits, static fn($ts) => ($now - (int)$ts) < $windowSeconds));

    if (count($windowHits) >= $maxRequests) {
        $oldest = (int)min($windowHits);
        $retryAfter = max(1, $windowSeconds - ($now - $oldest));
        @file_put_contents($rateFile, json_encode($state), LOCK_EX);
        @chmod($rateFile, 0600);
        return [
            'allowed' => false,
            'remaining' => 0,
            'retryAfter' => $retryAfter,
            'count' => count($windowHits),
        ];
    }

    $windowHits[] = $now;
    $state[$hashKey] = $windowHits;
    @file_put_contents($rateFile, json_encode($state), LOCK_EX);
    @chmod($rateFile, 0600);

    return [
        'allowed' => true,
        'remaining' => max(0, $maxRequests - count($windowHits)),
        'retryAfter' => 0,
        'count' => count($windowHits),
    ];
}

/**
 * Record / Check Brute-Force Login Lockout State (stored in $store['loginThrottle']).
 */
function ecasCheckLoginLockout(array &$store, string $ip, string $email): array {
    $now = time();
    if (!isset($store['loginThrottle']) || !is_array($store['loginThrottle'])) {
        $store['loginThrottle'] = [];
    }
    // Prune entries older than 1 hour
    foreach ($store['loginThrottle'] as $k => $entry) {
        if (!is_array($entry) || ($now - (int)($entry['lastAttemptAt'] ?? 0)) > 3600) {
            unset($store['loginThrottle'][$k]);
        }
    }

    $keys = [
        'ip:' . hash('sha256', $ip),
        'acct:' . hash('sha256', strtolower(trim($email))),
    ];
    foreach ($keys as $k) {
        $entry = $store['loginThrottle'][$k] ?? null;
        if (is_array($entry) && !empty($entry['lockedUntil']) && (int)$entry['lockedUntil'] > $now) {
            return [
                'locked' => true,
                'retryAfter' => (int)$entry['lockedUntil'] - $now,
                'attempts' => (int)($entry['attempts'] ?? 0),
            ];
        }
    }
    return ['locked' => false, 'retryAfter' => 0, 'attempts' => 0];
}

function ecasRecordFailedLogin(array &$store, string $ip, string $email): array {
    $now = time();
    if (!isset($store['loginThrottle']) || !is_array($store['loginThrottle'])) {
        $store['loginThrottle'] = [];
    }
    $ipKey = 'ip:' . hash('sha256', $ip);
    $acctKey = 'acct:' . hash('sha256', strtolower(trim($email)));

    $maxAttemptsBeforeLock = 5;
    $lockDurationSec = 900; // 15 minutes
    $lockedNow = false;
    $highestAttempts = 0;

    foreach ([$ipKey, $acctKey] as $k) {
        $entry = $store['loginThrottle'][$k] ?? ['attempts' => 0, 'firstAttemptAt' => $now, 'lastAttemptAt' => $now, 'emails' => []];
        if (($now - (int)($entry['firstAttemptAt'] ?? $now)) > 900) {
            $entry = ['attempts' => 0, 'firstAttemptAt' => $now, 'lastAttemptAt' => $now, 'emails' => []];
        }
        $entry['attempts'] = (int)$entry['attempts'] + 1;
        $entry['lastAttemptAt'] = $now;
        if ($k === $ipKey && $email !== '') {
            $emails = is_array($entry['emails'] ?? null) ? $entry['emails'] : [];
            if (!in_array($email, $emails, true)) {
                $emails[] = $email;
            }
            $entry['emails'] = array_slice($emails, -10);
        }
        if ($entry['attempts'] >= $maxAttemptsBeforeLock) {
            $entry['lockedUntil'] = $now + $lockDurationSec;
            $lockedNow = true;
        }
        $highestAttempts = max($highestAttempts, $entry['attempts']);
        $store['loginThrottle'][$k] = $entry;
    }

    $distinctEmailsFromIp = count($store['loginThrottle'][$ipKey]['emails'] ?? []);
    return [
        'locked' => $lockedNow,
        'attempts' => $highestAttempts,
        'credentialStuffingSuspected' => $distinctEmailsFromIp >= 3,
    ];
}

function ecasClearLoginThrottle(array &$store, string $ip, string $email): void {
    if (!isset($store['loginThrottle']) || !is_array($store['loginThrottle'])) return;
    unset($store['loginThrottle']['acct:' . hash('sha256', strtolower(trim($email)))]);
    unset($store['loginThrottle']['ip:' . hash('sha256', $ip)]);
}

/**
 * RFC 6238 TOTP Multi-Factor Authentication (Google Authenticator / Microsoft Authenticator / Authy)
 */
const ECAS_BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function ecasGenerateTotpSecret(int $length = 32): string {
    $secret = '';
    $bytes = random_bytes($length);
    for ($i = 0; $i < $length; $i++) {
        $secret .= ECAS_BASE32_ALPHABET[ord($bytes[$i]) & 31];
    }
    return $secret;
}

function ecasBase32Decode(string $b32): string {
    $b32 = strtoupper(preg_replace('/[^A-Z2-7]/', '', $b32));
    $binary = '';
    $buffer = 0;
    $bitsLeft = 0;
    $len = strlen($b32);
    for ($i = 0; $i < $len; $i++) {
        $val = strpos(ECAS_BASE32_ALPHABET, $b32[$i]);
        if ($val === false) continue;
        $buffer = ($buffer << 5) | $val;
        $bitsLeft += 5;
        if ($bitsLeft >= 8) {
            $bitsLeft -= 8;
            $binary .= chr(($buffer >> $bitsLeft) & 0xFF);
        }
    }
    return $binary;
}

function ecasComputeTotpCode(string $secret, ?int $timestamp = null, int $period = 30, int $digits = 6): string {
    $time = $timestamp ?? time();
    $counter = (int)floor($time / $period);
    $key = ecasBase32Decode($secret);
    $binCounter = pack('N*', 0) . pack('N*', $counter);
    $hash = hash_hmac('sha1', $binCounter, $key, true);
    $offset = ord(substr($hash, -1)) & 0x0F;
    $part = substr($hash, $offset, 4);
    $val = unpack('N', $part)[1] & 0x7FFFFFFF;
    $mod = 10 ** $digits;
    return str_pad((string)($val % $mod), $digits, '0', STR_PAD_LEFT);
}

function ecasVerifyTotpCode(string $secret, string $code, int $window = 1): bool {
    $clean = preg_replace('/\D/', '', trim($code));
    if (strlen($clean) !== 6 || $secret === '') return false;
    $now = time();
    for ($offset = -$window; $offset <= $window; $offset++) {
        $expected = ecasComputeTotpCode($secret, $now + ($offset * 30));
        if (hash_equals($expected, $clean)) {
            return true;
        }
    }
    return false;
}

function ecasGenerateRecoveryCodes(int $count = 8): array {
    $plain = [];
    $hashed = [];
    for ($i = 0; $i < $count; $i++) {
        $code = strtoupper(bin2hex(random_bytes(2)) . '-' . bin2hex(random_bytes(3)));
        $plain[] = $code;
        $hashed[] = password_hash($code, PASSWORD_BCRYPT);
    }
    return ['plain' => $plain, 'hashed' => $hashed];
}

/**
 * Binary Magic-Byte File Signature Validation & Active Payload Detection.
 * Prevents polyglot / disguised script / XSS / PHP uploads masquerading as PDF/DOCX/Images.
 */
function ecasValidateAttachmentStrict($raw, int $maxBytes = 3670016): array {
    if (!is_string($raw) || trim($raw) === '') {
        return ['valid' => true, 'dataUrl' => '', 'reason' => 'empty'];
    }
    $trimmed = trim($raw);
    if (strlen($trimmed) > 5200000) {
        return ['valid' => false, 'dataUrl' => '', 'reason' => 'File exceeds maximum permitted upload size (3.5 MB).'];
    }

    if (!preg_match('/^data:(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+\/=\r\n]+)$/', $trimmed, $m)) {
        return ['valid' => false, 'dataUrl' => '', 'reason' => 'Unsupported file MIME type. Allowed: PDF, DOC, DOCX, PNG, JPG, WEBP.'];
    }

    $declaredMime = strtolower($m[1]);
    $b64 = preg_replace('/\s+/', '', $m[4]);
    $bytes = base64_decode($b64, true);
    if ($bytes === false || strlen($bytes) < 8 || strlen($bytes) > $maxBytes) {
        return ['valid' => false, 'dataUrl' => '', 'reason' => 'Invalid or oversized file payload.'];
    }

    $head8 = substr($bytes, 0, 8);
    $head12 = substr($bytes, 0, 12);
    $signatureOk = false;

    if ($declaredMime === 'application/pdf') {
        $signatureOk = str_starts_with($head8, '%PDF-');
    } elseif ($declaredMime === 'image/png') {
        $signatureOk = str_starts_with($head8, "\x89PNG\r\n\x1A\n");
    } elseif ($declaredMime === 'image/jpeg' || $declaredMime === 'image/jpg') {
        $signatureOk = str_starts_with($head8, "\xFF\xD8\xFF");
    } elseif ($declaredMime === 'image/webp') {
        $signatureOk = substr($head12, 0, 4) === 'RIFF' && substr($head12, 8, 4) === 'WEBP';
    } elseif ($declaredMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        $signatureOk = str_starts_with($head8, "PK\x03\x04");
    } elseif ($declaredMime === 'application/msword') {
        $signatureOk = str_starts_with($head8, "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1");
    }

    if (!$signatureOk) {
        return ['valid' => false, 'dataUrl' => '', 'reason' => 'File binary signature does not match declared file type (possible spoofed file).'];
    }

    // Active script / malware / polyglot payload scan
    $sampleLower = strtolower(substr($bytes, 0, 131072));
    $forbiddenPatterns = ['<?php', '<script', 'javascript:', 'eval(', 'onerror=', 'onload=', '/javascript', '/openaction'];
    foreach ($forbiddenPatterns as $pat) {
        if (strpos($sampleLower, $pat) !== false) {
            return ['valid' => false, 'dataUrl' => '', 'reason' => 'Suspicious active script content detected inside uploaded file. Upload blocked.'];
        }
    }

    return [
        'valid' => true,
        'dataUrl' => 'data:' . $declaredMime . ';base64,' . $b64,
        'mime' => $declaredMime,
        'sizeBytes' => strlen($bytes),
        'sha256' => hash('sha256', $bytes),
    ];
}

/**
 * Push a structured Security Alert into $store['securityAlerts'].
 */
function ecasRecordSecurityAlert(
    array &$store,
    string $category,
    string $severity,
    string $relatedEntity,
    string $description,
    string $recommendedAction,
    string $ip = ''
): array {
    if (!isset($store['securityAlerts']) || !is_array($store['securityAlerts'])) {
        $store['securityAlerts'] = [];
    }
    $alert = [
        'id' => 'SEC-' . gmdate('YmdHis') . '-' . bin2hex(random_bytes(2)),
        'category' => $category,
        'severity' => in_array($severity, ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], true) ? $severity : 'MEDIUM',
        'relatedEntity' => substr(trim(strip_tags($relatedEntity)), 0, 180),
        'description' => substr(trim(strip_tags($description)), 0, 600),
        'recommendedAction' => substr(trim(strip_tags($recommendedAction)), 0, 300),
        'assignedOfficer' => '',
        'status' => 'Open', // Open | Acknowledged | Investigating | Resolved | False Positive
        'ip' => $ip,
        'resolutionNotes' => '',
        'createdAt' => gmdate('c'),
        'updatedAt' => gmdate('c'),
    ];
    array_unshift($store['securityAlerts'], $alert);
    if (count($store['securityAlerts']) > 2000) {
        $store['securityAlerts'] = array_slice($store['securityAlerts'], 0, 2000);
    }
    return $alert;
}

/**
 * Disposable & Free Email Domain Reference Lists
 * Note: Free email providers are NEVER treated as fraud alone — only combined with multiple risk signals.
 */
const ECAS_DISPOSABLE_DOMAINS = [
    'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator2.com', 'mailin8r.com',
    'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamail.de',
    'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
    '10minutemail.com', '10minutemail.net', '10minemail.com',
    'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempail.com', 'tempinbox.com', 'tempomail.fr',
    'throwawaymail.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.org',
    'trashmail.com', 'trashmail.net', 'trashmail.org', 'mytrashmail.com',
    'getnada.com', 'nada.email', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com',
    'fakemailgenerator.com', 'mintemail.com', 'mytemp.email', 'mohmal.com', 'mailnesia.com',
    'burnermail.io', 'emailondeck.com', '33mail.com', 'inboxbear.com', 'mailcatch.com',
    'harakirimail.com', 'crazymailing.com', 'dropmail.me', 'mailexpire.com', 'mailtothis.com',
    'noclickemail.com', 'nowmymail.com', 'pookmail.com', 'quickinbox.com', 'rcpt.at',
    'sogetthis.com', 'spambox.us', 'spamex.com', 'spamfree24.org', 'spamgourmet.com',
    'spamherelots.com', 'spamhole.com', 'spammotel.com', 'temporaryemail.net',
    'temporaryinbox.com', 'thisisnotmyrealemail.com', 'tmailinator.com',
    'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'zippymail.info',
    'example.com', 'example.org', 'test.com', 'invalid.com', 'localhost.localdomain',
];

const ECAS_FREE_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'outlook.com', 'hotmail.com',
    'live.com', 'icloud.com', 'proton.me', 'protonmail.com', 'aol.com', 'zoho.com',
];

function ecasIsDisposableEmail(string $email): bool {
    $clean = strtolower(trim($email));
    if ($clean === '' || !str_contains($clean, '@')) return false;
    $domain = substr($clean, strrpos($clean, '@') + 1);
    if ($domain === '') return false;
    foreach (ECAS_DISPOSABLE_DOMAINS as $d) {
        if ($domain === $d || str_ends_with($domain, '.' . $d)) {
            return true;
        }
    }
    return false;
}

function ecasIsPlaceholderText(string $val): bool {
    $clean = trim($val);
    if ($clean === '') return true;
    if (preg_match('/^(test|testing|asdf|qwerty|abc|xyz|aaa|xxx|fake|spam|none|n\/a|na|null|undefined|unknown|sample|demo|admin|root|lorem|ipsum|website visitor)$/i', $clean)) {
        return true;
    }
    if (preg_match('#https?://|www\.#i', $clean)) return true;
    $letters = preg_replace('/[^a-zA-Z0-9]/', '', $clean);
    if (strlen($letters) < 2) return true;
    if (preg_match('/^(.)\1{3,}$/i', $letters)) return true;
    return false;
}

function ecasHasSpamKeywords(string $text): bool {
    return (bool)preg_match('/(viagra|cialis|casino|porn|crypto\s*giveaway|bitcoin\s*doubler|seo\s*backlink|buy\s*followers|whatsapp\s*hack|t\.me\/|bit\.ly\/|tinyurl\.com\/)/i', $text);
}

/**
 * Hard-block obvious spam, phishing, disposable-email, and automated bot registrations
 * before they can ever enter the institutional database.
 * Returns null if genuine/allowed, or an error string if rejected.
 */
function ecasScreenPublicRegistrationSpam(array $reg, array $meta = []): ?string {
    if (!empty($meta['honeypot'])) {
        return 'Automated bot submission blocked.';
    }
    $dwellMs = isset($meta['dwellMs']) ? (int)$meta['dwellMs'] : null;
    if ($dwellMs !== null && $dwellMs > 0 && $dwellMs < 2500) {
        return 'Submission rejected: form was completed abnormally fast. Please review your details and try again.';
    }

    $firstName = trim((string)($reg['firstName'] ?? ''));
    $lastName = trim((string)($reg['lastName'] ?? ''));
    $orgName = trim((string)($reg['organisation'] ?? ''));
    $personalEmail = strtolower(trim((string)($reg['personalEmail'] ?? '')));
    $officialEmail = strtolower(trim((string)($reg['officialEmail'] ?? '')));
    $primaryEmail = $officialEmail !== '' ? $officialEmail : $personalEmail;
    $phoneDigits = preg_replace('/\D/', '', trim((string)(($reg['dialCode'] ?? '') . ($reg['phoneNumber'] ?? ''))));
    $participants = (int)($reg['participantsCount'] ?? 1);

    if (ecasIsPlaceholderText($firstName) || ecasIsPlaceholderText($lastName)) {
        return 'Please enter your genuine first and last name.';
    }
    if (strlen($orgName) < 3 || ecasIsPlaceholderText($orgName)) {
        return 'Please provide the genuine name of your organization, ministry, NGO, or institution.';
    }
    if ($primaryEmail === '' || !filter_var($primaryEmail, FILTER_VALIDATE_EMAIL)) {
        return 'Please enter a valid email address.';
    }
    if (ecasIsDisposableEmail($personalEmail) || ecasIsDisposableEmail($officialEmail)) {
        return 'Disposable or temporary email addresses (e.g. Mailinator, YOPmail, TempMail) are not permitted. Please use your real institutional or personal email.';
    }
    // Live DNS MX/A validation for primary email domain on production
    if (function_exists('checkdnsrr') && !ecasIsLocalHost()) {
        $domain = substr($primaryEmail, strrpos($primaryEmail, '@') + 1);
        if ($domain !== '' && !@checkdnsrr($domain, 'MX') && !@checkdnsrr($domain, 'A')) {
            return 'The email domain provided cannot receive mail (no valid DNS record). Please enter a real email address.';
        }
    }
    if (strlen($phoneDigits) < 8 || strlen($phoneDigits) > 15 || preg_match('/^(\d)\1{6,}$/', $phoneDigits) || str_contains($phoneDigits, '1234567') || str_contains($phoneDigits, '0000000')) {
        return 'Please enter a valid international telephone / WhatsApp number (8–15 digits).';
    }
    if ($participants < 1 || $participants > 30) {
        return 'For group bookings exceeding 30 delegates, please contact admissions@ecasiafrica.org directly.';
    }
    $bundle = trim((string)($reg['currentDuties'] ?? '') . ' ' . (string)($reg['trainingExpectations'] ?? '') . ' ' . (string)($reg['tailorMadeRequirements'] ?? ''));
    if ($bundle !== '' && ecasHasSpamKeywords($bundle)) {
        return 'Submission blocked by ECAS anti-spam protection.';
    }
    return null;
}

/**
 * Hard-block spam, phishing, anonymous link-click, and disposable-email inquiries.
 * Only permits genuine inquiries from real people and real organizations.
 */
function ecasScreenPublicInquirySpam(array $inq, array $meta = []): ?string {
    if (!empty($meta['honeypot'])) {
        return 'Automated bot inquiry blocked.';
    }
    $fullName = trim((string)($inq['fullName'] ?? ''));
    $email = strtolower(trim((string)($inq['email'] ?? '')));
    $phone = trim((string)($inq['phone'] ?? ''));
    $org = trim((string)($inq['organisation'] ?? ''));
    $msg = trim((string)($inq['message'] ?? ''));
    $phoneDigits = preg_replace('/\D/', '', $phone);

    // Block anonymous link-click tracking pseudo-inquiries ("Website Visitor (...)")
    if ($fullName === '' || stripos($fullName, 'website visitor') !== false || stripos($fullName, 'prospective delegate') !== false || ecasIsPlaceholderText($fullName)) {
        return 'Please provide your real full name to submit an inquiry.';
    }
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return 'Please provide a valid email address.';
    }
    if (ecasIsDisposableEmail($email)) {
        return 'Temporary or disposable email addresses are blocked. Please use your real institutional or personal email.';
    }
    if (function_exists('checkdnsrr') && !ecasIsLocalHost()) {
        $domain = substr($email, strrpos($email, '@') + 1);
        if ($domain !== '' && !@checkdnsrr($domain, 'MX') && !@checkdnsrr($domain, 'A')) {
            return 'The email domain provided is not valid. Please use a real email address.';
        }
    }
    if (strlen($org) < 3 || ecasIsPlaceholderText($org)) {
        return 'Please enter your genuine organization, ministry, NGO, or institution name.';
    }
    if (strlen($phoneDigits) < 8 || strlen($phoneDigits) > 15 || preg_match('/^(\d)\1{6,}$/', $phoneDigits) || str_contains($phoneDigits, '1234567')) {
        return 'Please enter a valid phone or WhatsApp number (8–15 digits).';
    }
    if (ecasHasSpamKeywords($fullName . ' ' . $org . ' ' . $msg)) {
        return 'Inquiry blocked by ECAS anti-spam & anti-phishing protection.';
    }
    return null;
}

/**
 * Identifies known spam/phishing/disposable/bot registrations for automated & manual purge.
 * Preserves all legitimate registrations (e.g. real institutional/personal delegates).
 */
function ecasIsKnownSpamRegistration(array $reg): bool {
    $ref = strtoupper(trim((string)($reg['referenceNo'] ?? '')));
    $em1 = strtolower(trim((string)($reg['officialEmail'] ?? '')));
    $em2 = strtolower(trim((string)($reg['personalEmail'] ?? '')));
    $fullName = strtolower(trim((string)($reg['firstName'] ?? '') . ' ' . (string)($reg['lastName'] ?? '')));
    $org = strtolower(trim((string)($reg['organisation'] ?? '')));
    $sec = is_array($reg['securityAssessment'] ?? null) ? $reg['securityAssessment'] : [];

    // Known disposable email domains (mailinator.com, yopmail, guerrillamail, etc.)
    if (ecasIsDisposableEmail($em1) || ecasIsDisposableEmail($em2)) {
        return true;
    }
    // Known Fake Filler / spam references & records reported by administrator
    if (in_array($ref, ['ECAS-400829-2539', 'ECAS-400840-2208'], true)) {
        return true;
    }
    if (in_array($fullName, ['kitra carson', 'amity hurst'], true)) {
        return true;
    }
    if (in_array($org, ['acevedo mcconnell associates', 'edwards cunningham inc'], true)) {
        return true;
    }
    // Explicitly flagged bot / rejected fraudulent registrations
    if (!empty($sec['botFlagged']) || stripos((string)($sec['securityClearance'] ?? ''), 'Rejected') !== false) {
        return true;
    }
    if (ecasHasSpamKeywords($fullName . ' ' . $org . ' ' . (string)($reg['trainingExpectations'] ?? ''))) {
        return true;
    }
    return false;
}

/**
 * Server-Side Registration Fraud & Risk Assessment Engine (0-100)
 * Evaluates multiple independent signals fairly:
 * - Never classifies as fraudulent solely due to international country, free email, shared IP, or missing Google/website presence.
 * - Produces explainable indicators, verification statuses, and recommended action.
 */
function ecasAssessRegistrationRisk(array $reg, array $store, string $clientIp, array $meta = []): array {
    $score = 0;
    $reasons = [];

    $primaryEmail = strtolower(trim((string)($reg['officialEmail'] ?: ($reg['personalEmail'] ?? ''))));
    $personalEmail = strtolower(trim((string)($reg['personalEmail'] ?? '')));
    $officialEmail = strtolower(trim((string)($reg['officialEmail'] ?? '')));
    $phoneRaw = trim((string)(($reg['dialCode'] ?? '') . ' ' . ($reg['phoneNumber'] ?? '')));
    $phoneDigits = preg_replace('/\D/', '', $phoneRaw);
    $orgName = trim((string)($reg['organisation'] ?? ''));
    $orgWebsite = trim((string)($reg['organisationWebsite'] ?? ''));
    $orgRegNo = trim((string)($reg['organisationRegNo'] ?? ''));
    $participants = max(1, (int)($reg['participantsCount'] ?? 1));
    $submittedFee = (float)($reg['totalFee'] ?? 0);
    $courseSlug = trim((string)($reg['courseSlug'] ?? ''));
    $fullName = trim((string)(($reg['firstName'] ?? '') . ' ' . ($reg['lastName'] ?? '')));

    // 1. Automated Bot & Behavioral Checks
    $honeypotFilled = !empty($meta['honeypot']);
    $dwellMs = isset($meta['dwellMs']) ? (int)$meta['dwellMs'] : null;
    $turnstileStatus = (string)($meta['turnstileStatus'] ?? 'unverified');

    if ($honeypotFilled) {
        $score += 55;
        $reasons[] = ['signal' => 'BOT_HONEYPOT', 'weight' => 55, 'detail' => 'Hidden anti-bot honeypot field was populated by automated submission.'];
    }
    if ($dwellMs !== null && $dwellMs > 0 && $dwellMs < 3500) {
        $score += 25;
        $reasons[] = ['signal' => 'FAST_BOT_SUBMIT', 'weight' => 25, 'detail' => "Form completed abnormally fast ({$dwellMs}ms), indicating automated script submission."];
    }
    if ($turnstileStatus === 'failed') {
        $score += 35;
        $reasons[] = ['signal' => 'TURNSTILE_FAILED', 'weight' => 35, 'detail' => 'Cloudflare Turnstile human verification challenge failed.'];
    }

    // 2. Email Verification (Syntax, Disposable Domain, DNS MX Check, OTP Verification Status)
    $emailStatus = 'Unverified';
    $emailDomain = '';
    if (!filter_var($primaryEmail, FILTER_VALIDATE_EMAIL)) {
        $score += 35;
        $emailStatus = 'Invalid';
        $reasons[] = ['signal' => 'INVALID_EMAIL', 'weight' => 35, 'detail' => 'Submitted primary email address failed syntax validation.'];
    } else {
        $parts = explode('@', $primaryEmail);
        $emailDomain = strtolower($parts[1] ?? '');

        if (in_array($emailDomain, ECAS_DISPOSABLE_DOMAINS, true)) {
            $score += 40;
            $emailStatus = 'Disposable / High Risk';
            $reasons[] = ['signal' => 'DISPOSABLE_EMAIL', 'weight' => 40, 'detail' => "Email uses a known disposable/temporary provider ({$emailDomain})."];
        } else {
            // Live DNS MX / A verification (best-effort; never crashes if DNS resolver is offline)
            $hasDns = true;
            if (function_exists('checkdnsrr') && !ecasIsLocalHost()) {
                $hasDns = @checkdnsrr($emailDomain, 'MX') || @checkdnsrr($emailDomain, 'A');
            }
            if (!$hasDns) {
                $score += 30;
                $emailStatus = 'Domain Unresolvable';
                $reasons[] = ['signal' => 'EMAIL_NO_DNS_MX', 'weight' => 30, 'detail' => "Email domain ({$emailDomain}) has no resolvable DNS MX or A mail record."];
            } else {
                $emailStatus = !empty($meta['emailOtpVerified']) ? 'Verified (OTP)' : 'DNS Valid (Pending OTP)';
            }
        }
    }

    // 3. Phone Verification (International E.164 length & pattern check — never penalizes international country codes)
    $phoneStatus = 'Unverified';
    if (strlen($phoneDigits) < 8 || strlen($phoneDigits) > 15) {
        $score += 20;
        $phoneStatus = 'Invalid Format';
        $reasons[] = ['signal' => 'INVALID_PHONE_LENGTH', 'weight' => 20, 'detail' => 'Phone number does not conform to valid international E.164 digit length (8–15 digits).'];
    } elseif (preg_match('/^(\d)\1{6,}$/', $phoneDigits) || str_contains($phoneDigits, '1234567')) {
        $score += 25;
        $phoneStatus = 'Suspicious Pattern';
        $reasons[] = ['signal' => 'SYNTHETIC_PHONE', 'weight' => 25, 'detail' => 'Phone number contains repetitive or sequential synthetic digits.'];
    } else {
        $phoneStatus = 'Valid International Format';
    }

    // 4. Organization Assessment (Fair — never flags missing Google/website as fraud alone)
    $orgStatus = 'Unverified';
    $websiteDomain = '';
    if ($orgWebsite !== '') {
        $normUrl = preg_match('#^https?://#i', $orgWebsite) ? $orgWebsite : ('https://' . $orgWebsite);
        $parsedHost = parse_url($normUrl, PHP_URL_HOST);
        if (!$parsedHost || !str_contains($parsedHost, '.')) {
            $score += 12;
            $reasons[] = ['signal' => 'INVALID_ORG_WEBSITE', 'weight' => 12, 'detail' => 'Submitted organization website URL format is invalid.'];
        } else {
            $websiteDomain = preg_replace('/^www\./i', '', strtolower($parsedHost));
            if ($emailDomain !== '' && !in_array($emailDomain, ECAS_FREE_EMAIL_DOMAINS, true)) {
                if ($emailDomain === $websiteDomain || str_ends_with($emailDomain, '.' . $websiteDomain)) {
                    $orgStatus = 'Domain Consistent (Pending Manual Check)';
                } else {
                    $score += 15;
                    $orgStatus = 'Domain Mismatch — Review';
                    $reasons[] = ['signal' => 'ORG_EMAIL_DOMAIN_MISMATCH', 'weight' => 15, 'detail' => "Official email domain ({$emailDomain}) does not match organization website ({$websiteDomain})."];
                }
            }
        }
    }
    if ($orgName === '' || strlen($orgName) < 2) {
        $orgStatus = 'Self-Sponsored / Unspecified';
    } elseif (preg_match('/^(test|asdf|qwerty|aaa|xxx|fake|spam|none|n\/a)$/i', $orgName)) {
        $score += 25;
        $orgStatus = 'Suspicious Name';
        $reasons[] = ['signal' => 'PLACEHOLDER_ORG_NAME', 'weight' => 25, 'detail' => "Organization name appears to be placeholder/gibberish text (\"{$orgName}\")."];
    } elseif ($orgRegNo !== '' && $orgStatus === 'Unverified') {
        $orgStatus = 'Reg. No. Provided (Pending Check)';
    }

    if (preg_match('/^(test|asdf|qwerty|fake|spam)\b/i', $fullName)) {
        $score += 20;
        $reasons[] = ['signal' => 'PLACEHOLDER_NAME', 'weight' => 20, 'detail' => 'Applicant name contains test/placeholder patterns.'];
    }

    // 5. Duplicate & Behavioral Velocity Monitoring (Accounting for legitimate shared corporate networks)
    $existingRegs = is_array($store['registrations'] ?? null) ? $store['registrations'] : [];
    $now = time();
    $exactDuplicate = false;
    $sameEmailRecentCount = 0;
    $samePhoneCount = 0;
    $sameIpLastHourCount = 0;

    foreach ($existingRegs as $prev) {
        if (!is_array($prev)) continue;
        $prevEmail = strtolower(trim((string)($prev['officialEmail'] ?: ($prev['personalEmail'] ?? ''))));
        $prevPhone = preg_replace('/\D/', '', trim((string)(($prev['dialCode'] ?? '') . ($prev['phoneNumber'] ?? ''))));
        $prevTime = !empty($prev['submittedAt']) ? strtotime((string)$prev['submittedAt']) : 0;
        $isRecent24h = $prevTime > 0 && ($now - $prevTime) < 86400;
        $isRecent1h = $prevTime > 0 && ($now - $prevTime) < 3600;

        if ($primaryEmail !== '' && $prevEmail === $primaryEmail) {
            if ($isRecent24h) $sameEmailRecentCount++;
            if (
                $isRecent24h &&
                strtolower(trim((string)($prev['eventTitle'] ?? ''))) === strtolower(trim((string)($reg['eventTitle'] ?? '')))
            ) {
                $exactDuplicate = true;
            }
        }
        if ($phoneDigits !== '' && strlen($phoneDigits) >= 8 && $prevPhone === $phoneDigits && $isRecent24h) {
            $samePhoneCount++;
        }
        if ($clientIp !== '' && ($prev['submitterIp'] ?? '') === $clientIp && $isRecent1h) {
            $sameIpLastHourCount++;
        }
    }

    $isDuplicate = false;
    if ($exactDuplicate) {
        $isDuplicate = true;
        $score += 30;
        $reasons[] = ['signal' => 'DUPLICATE_BOOKING', 'weight' => 30, 'detail' => 'Identical email & course registration already submitted within the last 24 hours.'];
    } elseif ($sameEmailRecentCount >= 2) {
        $isDuplicate = true;
        $score += 20;
        $reasons[] = ['signal' => 'REPEATED_EMAIL_SUBMISSIONS', 'weight' => 20, 'detail' => "Same email submitted {$sameEmailRecentCount} other registrations in the last 24 hours."];
    }
    if ($samePhoneCount >= 2) {
        $isDuplicate = true;
        $score += 15;
        $reasons[] = ['signal' => 'DUPLICATE_PHONE', 'weight' => 15, 'detail' => "Same phone number used in {$samePhoneCount} other recent registrations."];
    }
    // Shared corporate offices can submit 2-4 delegates legitimately; flag only high burst (>5/hour)
    if ($sameIpLastHourCount >= 5) {
        $score += 20;
        $reasons[] = ['signal' => 'HIGH_IP_VELOCITY', 'weight' => 20, 'detail' => "High burst of {$sameIpLastHourCount} registrations from same IP within 1 hour."];
    }

    // 6. Booking & Fee Consistency Check (Server-Side Calculation)
    $expectedUnitFee = 1000.0;
    if ($courseSlug !== '' && isset($store['courses'][$courseSlug]) && is_array($store['courses'][$courseSlug])) {
        $c = $store['courses'][$courseSlug];
        $expectedUnitFee = (!empty($c['discountPrice']) && (float)$c['discountPrice'] > 0)
            ? (float)$c['discountPrice']
            : (float)($c['feeUsd'] ?? 1200);
    }
    $expectedMinTotal = max(500.0, ($expectedUnitFee * 0.5) * $participants);
    if ($submittedFee > 0 && $submittedFee < $expectedMinTotal) {
        $score += 25;
        $reasons[] = ['signal' => 'FEE_TAMPERING_SUSPECTED', 'weight' => 25, 'detail' => "Submitted fee (USD {$submittedFee}) is abnormally lower than expected minimum for {$participants} participant(s)."];
    }
    if ($participants >= 25) {
        $score += 15;
        $reasons[] = ['signal' => 'LARGE_DELEGATE_GROUP', 'weight' => 15, 'detail' => "Unusually large delegate count ({$participants}) requires institutional verification before invoicing."];
    }

    // Note: Free email combined with institutional "Invoice To: Organisation" and missing website adds mild review weight (10), never fraud alone
    if (
        $emailDomain !== '' &&
        in_array($emailDomain, ECAS_FREE_EMAIL_DOMAINS, true) &&
        strtolower((string)($reg['invoiceTo'] ?? 'Self')) !== 'self' &&
        $orgWebsite === ''
    ) {
        $score += 10;
        $reasons[] = ['signal' => 'FREE_EMAIL_ORG_INVOICE', 'weight' => 10, 'detail' => 'Organization-billed registration uses a free email provider with no website; manual contact verification recommended.'];
    }

    $score = max(0, min(100, (int)$score));

    if ($score >= 80) {
        $riskLevel = 'CRITICAL RISK';
        $recommendedAction = 'Block progression to invoicing & confirmation. Mandatory Verification Officer investigation required.';
        $securityClearance = 'Blocked — Review Required';
    } elseif ($score >= 60) {
        $riskLevel = 'HIGH RISK';
        $recommendedAction = 'Route to Security Review Queue. Verify organization & contact details before approval or invoicing.';
        $securityClearance = 'Pending Review';
    } elseif ($score >= 30) {
        $riskLevel = 'MEDIUM RISK';
        $recommendedAction = 'Perform quick contact/organization check during standard admissions review.';
        $securityClearance = 'Additional Check Recommended';
    } else {
        $riskLevel = 'LOW RISK';
        $recommendedAction = 'Proceed through standard 12-stage admissions workflow.';
        $securityClearance = 'Auto-Cleared (Low Risk)';
    }

    return [
        'riskScore' => $score,
        'riskLevel' => $riskLevel,
        'reasons' => $reasons,
        'isDuplicate' => $isDuplicate,
        'botFlagged' => $honeypotFilled || ($dwellMs !== null && $dwellMs > 0 && $dwellMs < 3500) || $turnstileStatus === 'failed',
        'orgVerification' => $orgStatus,
        'emailVerification' => $emailStatus,
        'phoneVerification' => $phoneStatus,
        'securityClearance' => $securityClearance,
        'requiresSecurityReview' => $score >= 60,
        'recommendedAction' => $recommendedAction,
        'assessedAt' => gmdate('c'),
        'reviewHistory' => [],
    ];
}
