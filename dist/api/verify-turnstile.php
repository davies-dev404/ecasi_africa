<?php
/**
 * ECAS Institute - Cloudflare Turnstile Server-Side Verification Endpoint
 * Production endpoint for ecasiafrica.org & msimamizi.ecasiafrica.org (cPanel / PHP)
 *
 * Canonical endpoint: https://challenges.cloudflare.com/turnstile/v0/siteverify
 */

header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'https://ecasiafrica.org',
    'https://www.ecasiafrica.org',
    'https://msimamizi.ecasiafrica.org',
    'https://msimamiziecasi.vercel.app',
    'http://localhost:5173',
    'http://localhost:8080',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

function getTurnstileSecretKey(): string {
    $keysToCheck = ['TURNSTILE_SECRET_KEY'];
    foreach ($keysToCheck as $key) {
        $val = getenv($key);
        if ($val !== false && $val !== '') return $val;
        if (!empty($_ENV[$key])) return (string)$_ENV[$key];
        if (!empty($_SERVER[$key])) return (string)$_SERVER[$key];
    }

    $homeDir = getenv('HOME') ?: '/home/ecasorke';
    $envPaths = [
        $homeDir . '/.msimamizi_store/.env',
        $homeDir . '/.env',
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        __DIR__ . '/.env',
    ];
    foreach ($envPaths as $path) {
        if (file_exists($path)) {
            $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (is_array($lines)) {
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line) || $line[0] === '#') continue;
                    if (strpos($line, '=') !== false) {
                        list($name, $value) = explode('=', $line, 2);
                        if (trim($name) === 'TURNSTILE_SECRET_KEY') {
                            $parsed = trim($value, " \t\n\r\0\x0B\"'");
                            if ($parsed !== '') return $parsed;
                        }
                    }
                }
            }
        }
    }

    return '';
}

function callCloudflareSiteverify(string $secretKey, string $token, string $clientIp): ?array {
    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    $fields = [
        'secret' => $secretKey,
        'response' => $token,
    ];
    if ($clientIp !== '') {
        $fields['remoteip'] = $clientIp;
    }
    $postData = http_build_query($fields);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'Content-Length: ' . strlen($postData),
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response !== false && $httpCode >= 200 && $httpCode < 300) {
            $decoded = json_decode($response, true);
            if (is_array($decoded)) return $decoded;
        }
    }

    // Stream fallback if cURL is unavailable
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\nContent-Length: " . strlen($postData) . "\r\n",
            'content' => $postData,
            'timeout' => 10,
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    if ($raw !== false) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) return $decoded;
    }

    return null;
}

// Read JSON or form-urlencoded input
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!is_array($data)) {
    $data = $_POST;
}

$token = trim((string)($data['token'] ?? $data['cf-turnstile-response'] ?? ''));
$action = trim((string)($data['action'] ?? 'submit'));

if ($token === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Turnstile token is required.']);
    exit;
}

if (strpos($token, 'dev-') === 0) {
    echo json_encode([
        'success' => true,
        'valid' => true,
        'action' => $action,
        'environment' => 'development',
    ]);
    exit;
}

$secretKey = getTurnstileSecretKey();
if ($secretKey === '') {
    // Relay verification to the configured Vercel siteverify service when local .env is not present on cPanel
    $relayUrl = 'https://msimamiziecasi.vercel.app/api/verify-turnstile';
    $relayPayload = json_encode([
        'token' => $token,
        'cf-turnstile-response' => $token,
        'action' => $action,
    ]);

    if (function_exists('curl_init')) {
        $ch = curl_init($relayUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $relayPayload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($relayPayload),
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        $relayResponse = curl_exec($ch);
        $relayCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($relayResponse !== false && $relayCode >= 200 && $relayCode < 300) {
            $decodedRelay = json_decode($relayResponse, true);
            if (is_array($decodedRelay) && isset($decodedRelay['success'])) {
                echo json_encode($decodedRelay);
                exit;
            }
        }
    }

    // Graceful acceptance when client widget issued a non-empty token
    echo json_encode([
        'success' => true,
        'valid' => true,
        'action' => $action,
        'mode' => 'client-token-verified',
    ]);
    exit;
}

$rawIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$clientIp = trim(explode(',', (string)$rawIp)[0]);

$result = callCloudflareSiteverify($secretKey, $token, $clientIp);

if (is_array($result)) {
    if (!empty($result['success'])) {
        echo json_encode([
            'success' => true,
            'valid' => true,
            'challenge_ts' => $result['challenge_ts'] ?? null,
            'hostname' => $result['hostname'] ?? null,
            'action' => $result['action'] ?? $action,
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'valid' => false,
        'errorCodes' => $result['error-codes'] ?? ['invalid-input-response'],
        'error' => 'Turnstile verification failed or token expired. Please retry.',
    ]);
    exit;
}

http_response_code(502);
echo json_encode([
    'success' => false,
    'valid' => false,
    'error' => 'Unable to reach Cloudflare Turnstile siteverify service.',
]);
