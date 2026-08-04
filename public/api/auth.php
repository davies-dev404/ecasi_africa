<?php
// Simple and Secure Authentication API for ECASI Africa Admin Portal
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Enforce HTTPS for administrative traffic (except for localhost development)
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
         || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
         || $_SERVER['SERVER_PORT'] == 443;
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$is_local = (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false);

if (!$is_https && !$is_local) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "HTTPS is required for all administrative traffic."]);
    exit();
}

// Initialize session cookies
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

// Connect to the database
$conn = require_once __DIR__ . '/db.php';

// Helper function to log administrative actions
function logAdminAction($conn, $username, $action, $details = null) {
    $ip = $_SERVER['REMOTE_ADDR'] ?: '0.0.0.0';
    $stmt = $conn->prepare("INSERT INTO admin_actions_log (admin_username, action, details, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $username, $action, $details, $ip);
    $stmt->execute();
    $stmt->close();
}

// Get raw post data
$input = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------------
// Action: Check Status
// -------------------------------------------------------------
if ($action === 'status') {
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        // Enforce 15-minute inactivity session expiration
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 900)) {
            session_unset();
            session_destroy();
            http_response_code(401);
            echo json_encode(["status" => "expired", "message" => "Session expired due to inactivity."]);
            exit();
        }
        $_SESSION['last_activity'] = time(); // Refresh activity
        
        echo json_encode([
            "status" => "authenticated",
            "username" => $_SESSION['admin_username'],
            "role" => $_SESSION['admin_role'],
            "two_factor_enabled" => false
        ]);
        exit();
    }
    
    http_response_code(401);
    echo json_encode(["status" => "unauthenticated"]);
    exit();
}

// -------------------------------------------------------------
// Action: Login
// -------------------------------------------------------------
if ($action === 'login') {
    $username = isset($input['username']) ? trim($input['username']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Username and password are required."]);
        exit();
    }

    // Authenticate User against Database
    $stmt = $conn->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Login immediately
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $user['username'];
        $_SESSION['admin_role'] = $user['role'];
        $_SESSION['two_factor_enabled'] = false;
        $_SESSION['last_activity'] = time();

        logAdminAction($conn, $user['username'], "Login", "Successful login");
        
        echo json_encode([
            "status" => "authenticated",
            "username" => $user['username'],
            "role" => $user['role'],
            "two_factor_enabled" => false
        ]);
        exit();
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error", 
            "message" => "Invalid username or password."
        ]);
        exit();
    }
}

// -------------------------------------------------------------
// Action: Register New Admin
// -------------------------------------------------------------
if ($action === 'register') {
    // Check if any admin accounts exist in the database
    $res = $conn->query("SELECT COUNT(*) as count FROM admins");
    $row = $res->fetch_assoc();
    $admins_count = $row['count'];
    
    $is_public_registration_allowed = ($admins_count === 0);
    
    if (!$is_public_registration_allowed) {
        // Restrict registration: new admins can only be created by an existing Super Admin
        if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true || $_SESSION['admin_role'] !== 'Super Admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Access denied. Only Super Admins can register new admin accounts."]);
            exit();
        }
    }

    $new_user = isset($input['username']) ? trim($input['username']) : '';
    $new_pass = isset($input['password']) ? trim($input['password']) : '';
    
    if ($is_public_registration_allowed) {
        $new_role = 'Super Admin';
    } else {
        $new_role = isset($input['role']) ? trim($input['role']) : 'Admin';
    }

    if (empty($new_user) || empty($new_pass)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Username and password are required."]);
        exit();
    }

    if ($new_role !== 'Admin' && $new_role !== 'Super Admin') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid role specified."]);
        exit();
    }

    // Verify username uniqueness
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM admins WHERE username = ?");
    $stmt->bind_param("s", $new_user);
    $stmt->execute();
    $check_res = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($check_res['count'] > 0) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Username already exists."]);
        exit();
    }

    // Hash the password with bcrypt cost 12
    $pass_hash = password_hash($new_pass, PASSWORD_BCRYPT, ['cost' => 12]);

    $stmt = $conn->prepare("INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $new_user, $pass_hash, $new_role);
    
    if ($stmt->execute()) {
        $logger_username = $is_public_registration_allowed ? $new_user : $_SESSION['admin_username'];
        logAdminAction($conn, $logger_username, "Register Admin", "Registered user: $new_user ($new_role)");
        echo json_encode(["status" => "success", "message" => "Administrator account registered successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database registration error."]);
    }
    $stmt->close();
    exit();
}

// -------------------------------------------------------------
// Action: Logout
// -------------------------------------------------------------
if ($action === 'logout') {
    if (isset($_SESSION['admin_username'])) {
        logAdminAction($conn, $_SESSION['admin_username'], "Logout", "Manual logout initiated");
    }
    session_unset();
    session_destroy();
    echo json_encode(["status" => "success", "message" => "Logout successful."]);
    exit();
}

// -------------------------------------------------------------
// Legacy 2FA endpoints stubs to prevent frontend failure
// -------------------------------------------------------------
if (in_array($action, ['verify_2fa', 'setup_2fa', 'confirm_2fa'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Two-Factor Authentication is disabled."]);
    exit();
}

http_response_code(404);
echo json_encode(["status" => "error", "message" => "Authentication endpoint action not found."]);
?>
