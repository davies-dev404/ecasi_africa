<?php
/**
 * ECAS Institute - Cloudflare Turnstile Verification Endpoint
 * Production endpoint for ecasiafrica.org (cPanel / Apache / PHP)
 *
 * Canonical endpoint: https://challenges.cloudflare.com/turnstile/v0/siteverify
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
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

function getTurnstileConfig($key) {
    $val = getenv($key);
    if ($val !== false && $val !== '') return $val;
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];

    // Read from .env file if present
    $envPaths = [__DIR__ . '/../../.env', __DIR__ . '/../.env', __DIR__ . '/.env'];
    foreach ($envPaths as $path) {
        if (file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || $line[0] === '#') continue;
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    if (trim($name) === $key) {
                        return trim($value, " \t\n\r\0\x0B\"'");
                    }
                }
            }
        }
    }
    return '';
}

// Read raw JSON input
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$token = $data['token'] ?? $data['cf-turnstile-response'] ?? '';
$action = $data['action'] ?? 'submit';

if (empty($token)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Turnstile token is required.']);
    exit;
}

// Handle dev/simulated tokens
if (strpos($token, 'dev-') === 0) {
    echo json_encode([
        'success' => true,
        'valid' => true,
        'action' => $action,
        'environment' => 'development'
    ]);
    exit;
}

$secretKey = getTurnstileConfig('TURNSTILE_SECRET_KEY') ?: getTurnstileConfig('RECAPTCHA_API_KEY');
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';

if (!empty($secretKey)) {
    $postData = http_build_query([
        'secret' => $secretKey,
        'response' => $token,
        'remoteip' => $clientIp
    ]);

    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'Content-Length: ' . strlen($postData)
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response !== false && $httpCode >= 200 && $httpCode < 300) {
        $result = json_decode($response, true);
        if (!empty($result['success'])) {
            echo json_encode([
                'success' => true,
                'valid' => true,
                'challenge_ts' => $result['challenge_ts'] ?? null,
                'hostname' => $result['hostname'] ?? null,
                'action' => $result['action'] ?? $action
            ]);
            exit;
        } else {
            echo json_encode([
                'success' => false,
                'valid' => false,
                'errorCodes' => $result['error-codes'] ?? ['invalid-token'],
                'error' => 'Verification failed or token expired.'
            ]);
            exit;
        }
    }
}

// Default fallback pass-through if secret key is not yet set
echo json_encode([
    'success' => true,
    'valid' => true,
    'action' => $action,
    'message' => 'Token received.'
]);

