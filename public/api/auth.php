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
        // Success: check if 2FA is enabled
        if ($user['two_factor_enabled'] == 1) {
            // Stage login but require 2FA code verification
            $_SESSION['temp_admin_username'] = $user['username'];
            $_SESSION['temp_admin_role'] = $user['role'];
            $_SESSION['temp_two_factor_secret'] = $user['two_factor_secret'];
            $_SESSION['temp_two_factor_enabled'] = true;
            
            // Check if this is the default initial admin requiring setup
            if ($user['username'] === 'ecasike' && $user['two_factor_secret'] === 'JBSWY3DPEHPK3PXP') {
                $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
                $temp_secret = '';
                for ($i = 0; $i < 16; $i++) {
                    $temp_secret .= $chars[rand(0, 31)];
                }
                $_SESSION['temp_two_factor_secret'] = $temp_secret;
                $_SESSION['temp_two_factor_enabled'] = false; // Setup in progress

                echo json_encode([
                    "status" => "setup_required",
                    "message" => "Initial administrator account setup is required.",
                    "secret" => $temp_secret
                ]);
                exit();
            }

            echo json_encode([
                "status" => "2fa_required",
                "message" => "Please enter your 2FA code."
            ]);
            exit();
        } else {
            // Force 2FA setup for standard admins who haven't enabled it yet
            $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            $secret = '';
            for ($i = 0; $i < 16; $i++) {
                $secret .= $chars[rand(0, 31)];
            }
            $db_username = urlencode($user['username']);
            $issuer = urlencode("ECASI Africa");
            $otpauth_url = "otpauth://totp/{$issuer}:{$db_username}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";
            
            $_SESSION['temp_admin_username'] = $user['username'];
            $_SESSION['temp_admin_role'] = $user['role'];
            $_SESSION['temp_two_factor_secret'] = $secret;
            $_SESSION['temp_two_factor_enabled'] = false; // Setup in progress
            
            echo json_encode([
                "status" => "2fa_setup_required",
                "message" => "Google Authenticator setup is required for your account.",
                "secret" => $secret,
                "otpauth_url" => $otpauth_url
            ]);
            exit();
        }
    } else {
        // Failed Login: log attempt
        $ip = $_SERVER['REMOTE_ADDR'] ?: '0.0.0.0';
        $stmt = $conn->prepare("INSERT INTO failed_logins (username, ip_address) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $ip);
        $stmt->execute();
        $stmt->close();

        http_response_code(401);
        echo json_encode([
            "status" => "error", 
            "message" => "Invalid username or password."
        ]);
        exit();
    }
}

// -------------------------------------------------------------
// Action: Verify 2FA
// -------------------------------------------------------------
if ($action === 'verify_2fa') {
    $code = isset($input['code']) ? trim($input['code']) : '';
    
    if (!isset($_SESSION['temp_admin_username']) || empty($_SESSION['temp_two_factor_secret'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No login session in progress."]);
        exit();
    }

    if (empty($code)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "2FA verification code is required."]);
        exit();
    }

    if (verify_totp($_SESSION['temp_two_factor_secret'], $code)) {
        // Complete the authentication process
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $_SESSION['temp_admin_username'];
        $_SESSION['admin_role'] = $_SESSION['temp_admin_role'];
        $_SESSION['two_factor_enabled'] = true;
        $_SESSION['last_activity'] = time();

        $username = $_SESSION['admin_username'];

        // If this was first-time 2FA setup, persist it to DB
        if (isset($_SESSION['temp_two_factor_enabled']) && $_SESSION['temp_two_factor_enabled'] === false) {
            $stmt = $conn->prepare("UPDATE admins SET two_factor_secret = ?, two_factor_enabled = 1 WHERE username = ?");
            $stmt->bind_param("ss", $_SESSION['temp_two_factor_secret'], $username);
            $stmt->execute();
            $stmt->close();
        }

        unset($_SESSION['temp_admin_username']);
        unset($_SESSION['temp_admin_role']);
        unset($_SESSION['temp_two_factor_secret']);
        unset($_SESSION['temp_two_factor_enabled']);

        logAdminAction($conn, $username, "Login", "Successful login with 2FA Setup");

        echo json_encode([
            "status" => "authenticated",
            "username" => $_SESSION['admin_username'],
            "role" => $_SESSION['admin_role'],
            "two_factor_enabled" => true
        ]);
        exit();
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid 2FA verification code."]);
        exit();
    }
}

// -------------------------------------------------------------
// Action: Enable 2FA (Setup Phase)
// -------------------------------------------------------------
if ($action === 'setup_2fa') {
    // Requires authenticated admin session
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
        exit();
    }

    // Generate a random 16-character Base32 secret key
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $secret = '';
    for ($i = 0; $i < 16; $i++) {
        $secret .= $chars[rand(0, 31)];
    }

    // Return the secret key and the parameters to generate a QR Code client-side
    $username = urlencode($_SESSION['admin_username']);
    $issuer = urlencode("ECASI Africa");
    $otpauth_url = "otpauth://totp/{$issuer}:{$username}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";

    // Store secret temporarily in session, wait for verification before saving to DB
    $_SESSION['pending_2fa_secret'] = $secret;

    echo json_encode([
        "status" => "success",
        "secret" => $secret,
        "otpauth_url" => $otpauth_url
    ]);
    exit();
}

// -------------------------------------------------------------
// Action: Confirm Enable 2FA
// -------------------------------------------------------------
if ($action === 'confirm_2fa') {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
        exit();
    }

    $code = isset($input['code']) ? trim($input['code']) : '';
    $secret = isset($_SESSION['pending_2fa_secret']) ? $_SESSION['pending_2fa_secret'] : '';

    if (empty($code) || empty($secret)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid request details."]);
        exit();
    }

    if (verify_totp($secret, $code)) {
        // Save to DB
        $stmt = $conn->prepare("UPDATE admins SET two_factor_secret = ?, two_factor_enabled = 1 WHERE username = ?");
        $stmt->bind_param("ss", $secret, $_SESSION['admin_username']);
        $stmt->execute();
        $stmt->close();

        $_SESSION['two_factor_enabled'] = true;
        unset($_SESSION['pending_2fa_secret']);

        logAdminAction($conn, $_SESSION['admin_username'], "Enable 2FA", "2FA setup complete");

        echo json_encode(["status" => "success", "message" => "Two-Factor Authentication enabled successfully."]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Verification failed. The code entered was incorrect."]);
        exit();
    }
}

// -------------------------------------------------------------
// Action: Initial Admin Setup (Default user customization)
// -------------------------------------------------------------
if ($action === 'initial_setup') {
    $new_username = isset($input['new_username']) ? trim($input['new_username']) : '';
    $new_password = isset($input['new_password']) ? trim($input['new_password']) : '';
    $code = isset($input['code']) ? trim($input['code']) : '';
    
    if (!isset($_SESSION['temp_admin_username']) || $_SESSION['temp_admin_username'] !== 'ecasike') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Initial setup is not active."]);
        exit();
    }
    
    if (empty($new_username) || empty($new_password) || empty($code)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit();
    }
    
    // Verify 2FA code
    if (!verify_totp($_SESSION['temp_two_factor_secret'], $code)) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid 2FA verification code."]);
        exit();
    }
    
    // Hash new password
    $pass_hash = password_hash($new_password, PASSWORD_BCRYPT, ['cost' => 12]);
    $new_secret = $_SESSION['temp_two_factor_secret'];
    
    // Update the default account 'ecasike' to the new username, password, and secret
    $stmt = $conn->prepare("UPDATE admins SET username = ?, password_hash = ?, two_factor_secret = ?, two_factor_enabled = 1 WHERE username = 'ecasike'");
    $stmt->bind_param("sss", $new_username, $pass_hash, $new_secret);
    
    if ($stmt->execute()) {
        $stmt->close();
        
        // Log them in
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $new_username;
        $_SESSION['admin_role'] = 'Super Admin';
        $_SESSION['two_factor_enabled'] = true;
        $_SESSION['last_activity'] = time();
        
        unset($_SESSION['temp_admin_username']);
        unset($_SESSION['temp_admin_role']);
        unset($_SESSION['temp_two_factor_secret']);
        unset($_SESSION['temp_two_factor_enabled']);
        
        logAdminAction($conn, $new_username, "Initial Setup", "Initial admin setup complete");
        
        echo json_encode([
            "status" => "authenticated",
            "username" => $new_username,
            "role" => "Super Admin",
            "two_factor_enabled" => true
        ]);
        exit();
    } else {
        $stmt->close();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update administrator account."]);
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
