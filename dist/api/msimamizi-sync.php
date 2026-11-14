<?php
/**
 * ECAS Institute - Msimamizi Central Server Sync API (cPanel / PHP)
 * Synchronizes course registrations, course catalog pricing/cohorts, and admin accounts
 * across ecasiafrica.org, msimamizi.ecasiafrica.org, and msimamiziecasi.vercel.app.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Persistent storage outside public web root when possible, fallback to local protected directory
$homeDir = getenv('HOME') ?: '/home/ecasorke';
$dataDir = is_dir($homeDir) && is_writable($homeDir)
    ? $homeDir . '/.msimamizi_store'
    : __DIR__ . '/.msimamizi_store';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Deny from all\n");
}

$storeFile = $dataDir . '/msimamizi_db.json';

function readStore($file) {
    $default = [
        'registrations' => [],
        'courses' => new stdClass(),
        'accounts' => [],
        'updatedAt' => gmdate('c')
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

function writeStore($file, $data) {
    $data['updatedAt'] = gmdate('c');
    @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

$store = readStore($storeFile);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => $store
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $action = $payload['action'] ?? 'sync';

    if ($action === 'add_registration' && !empty($payload['registration'])) {
        $reg = $payload['registration'];
        $existing = is_array($store['registrations']) ? $store['registrations'] : [];
        // Prepend or update by id/referenceNo
        $found = false;
        foreach ($existing as $idx => $item) {
            if (($item['id'] ?? '') === ($reg['id'] ?? '') || ($item['referenceNo'] ?? '') === ($reg['referenceNo'] ?? '')) {
                $existing[$idx] = array_merge($item, $reg);
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($existing, $reg);
        }
        $store['registrations'] = $existing;
        writeStore($storeFile, $store);
    } elseif ($action === 'set_registrations' && isset($payload['registrations']) && is_array($payload['registrations'])) {
        $store['registrations'] = $payload['registrations'];
        writeStore($storeFile, $store);
    } elseif ($action === 'set_courses' && isset($payload['courses']) && is_array($payload['courses'])) {
        $store['courses'] = $payload['courses'];
        writeStore($storeFile, $store);
    } elseif ($action === 'set_accounts' && isset($payload['accounts']) && is_array($payload['accounts'])) {
        $store['accounts'] = $payload['accounts'];
        writeStore($storeFile, $store);
    }

    echo json_encode([
        'success' => true,
        'data' => $store
    ]);
    exit;
}

