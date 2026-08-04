<?php
// Admin Actions API for CRUD Operations and Audit Logging
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Connect to the database
$conn = require_once __DIR__ . '/db.php';

// Check HTTPS and local status
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
         || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
         || $_SERVER['SERVER_PORT'] == 443;
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$is_local = (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false);

// Initialize session
if (session_status() === PHP_SESSION_NONE) {
    session_name('__Secure-ECASI-Session');
    session_start([
        'cookie_lifetime' => 3600,
        'cookie_path' => '/',
        'cookie_secure' => $is_https,
        'cookie_httponly' => true,
        'cookie_samesite' => 'Strict',
        'use_strict_mode' => true
    ]);
}

// Retrieve action & category parameters
$action = isset($_GET['action']) ? $_GET['action'] : 'get';
$category = isset($_GET['category']) ? $_GET['category'] : '';

// Helper to log admin actions
function logAdminAction($conn, $username, $action, $details = null) {
    $ip = $_SERVER['REMOTE_ADDR'] ?: '0.0.0.0';
    $stmt = $conn->prepare("INSERT INTO admin_actions_log (admin_username, action, details, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $username, $action, $details, $ip);
    $stmt->execute();
    $stmt->close();
}

// -------------------------------------------------------------
// Read Operations (Publicly accessible)
// -------------------------------------------------------------
if ($action === 'get') {
    if (empty($category)) {
        // Fetch list of all categories or return error
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Category is required."]);
        exit();
    }
    
    $stmt = $conn->prepare("SELECT content_json FROM site_content WHERE category_name = ?");
    $stmt->bind_param("s", $category);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if ($res) {
        // Output raw JSON of category content
        echo $res['content_json'];
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Category not found."]);
    }
    exit();
}

// -------------------------------------------------------------
// Write Operations (Require Valid HTTPS and Administrator Session)
// -------------------------------------------------------------

// Enforce HTTPS (except on localhost for development)
if (!$is_https && !$is_local) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "HTTPS is required for all administrative traffic."]);
    exit();
}

// Authenticate session
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Authentication required."]);
    exit();
}

// Check session expiration (15 minutes of inactivity)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 900)) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Session expired due to inactivity."]);
    exit();
}
$_SESSION['last_activity'] = time(); // Refresh session activity timer

if ($action === 'save') {
    if (empty($category)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Category name is required."]);
        exit();
    }

    $input = json_decode(file_get_contents("php://input"), true);
    if ($input === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON payload."]);
        exit();
    }

    $json_content = json_encode($input);

    // Save to DB
    $stmt = $conn->prepare("INSERT INTO site_content (category_name, content_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_json = ?");
    $stmt->bind_param("sss", $category, $json_content, $json_content);
    
    if ($stmt->execute()) {
        logAdminAction($conn, $_SESSION['admin_username'], "Update Content", "Updated category '$category'. Payload size: " . strlen($json_content) . " bytes.");
        echo json_encode(["status" => "success", "message" => "Content updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update database content: " . $stmt->error]);
    }
    $stmt->close();
    exit();
}

if ($action === 'reset_all') {
    // Resetting to default data is a high-impact task
    if ($_SESSION['admin_role'] !== 'Super Admin') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Only Super Admins can reset the site content database."]);
        exit();
    }

    // Loop through defaults and reset site_content table
    $categories = [
        'publications' => '[]',
        'reports' => '[]',
        'gallery' => '[]',
        'policies' => '[]',
        'vacancies' => '[]',
        'videos' => '[]',
        'books' => '[]',
        'briefs' => '[]',
        'events' => '[]',
        'courses' => '{}',
        'courses_links' => '[]',
        'news' => '[]'
    ];

    $success = true;
    foreach ($categories as $cat => $default_json) {
        $file_path = __DIR__ . "/../../src/data/{$cat}Data.json";
        if ($cat === 'courses_links') $file_path = __DIR__ . "/../../src/data/coursesLinks.json";
        
        if (file_exists($file_path)) {
            $json_data = file_get_contents($file_path);
            if (json_decode($json_data) !== null) {
                $default_json = $json_data;
            }
        }
        
        $stmt = $conn->prepare("INSERT INTO site_content (category_name, content_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_json = ?");
        $stmt->bind_param("sss", $cat, $default_json, $default_json);
        if (!$stmt->execute()) {
            $success = false;
        }
        $stmt->close();
    }

    if ($success) {
        logAdminAction($conn, $_SESSION['admin_username'], "Reset Database", "Reset all categories to JSON source files");
        echo json_encode(["status" => "success", "message" => "All site contents reset to default."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error occurred during reset."]);
    }
    exit();
}

http_response_code(404);
echo json_encode(["status" => "error", "message" => "Endpoint action not found."]);
?>
