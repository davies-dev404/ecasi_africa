<?php
// Secure Authentication API for ECASI Africa Admin Portal
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Enforce HTTPS for administrative traffic
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
         || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
         || $_SERVER['SERVER_PORT'] == 443;

if (!$is_https) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "HTTPS is required for all administrative traffic."]);
    exit();
}

// Initialize secure session cookies
// Set cookie lifetime to 1 hour, secure, HTTP-only, and SameSite=Strict
if (session_status() === PHP_SESSION_NONE) {
    session_name('__Secure-ECASI-Session');
    session_start([
        'cookie_lifetime' => 3600,
        'cookie_path' => '/',
        'cookie_secure' => true,
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

// Helper to decode Base32 (for TOTP secret)
function base32_decode($base32) {
    $base32 = strtoupper($base32);
    if (!preg_match('/^[A-Z2-7=]+$/', $base32)) return false;
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $base32 = str_replace('=', '', $base32);
    $binary = '';
    for ($i = 0; $i < strlen($base32); $i++) {
        $val = strpos($alphabet, $base32[$i]);
        if ($val === false) return false;
        $binary .= sprintf('%05b', $val);
    }
    $bytes = '';
    $len = strlen($binary);
    for ($i = 0; $i < $len; $i += 8) {
        if ($i + 8 <= $len) {
            $bytes .= chr(bindec(substr($binary, $i, 8)));
        }
    }
    return $bytes;
}

// Helper to verify TOTP code
function verify_totp($secret, $code, $range = 1) {
    $key = base32_decode($secret);
    if ($key === false) return false;
    $time = floor(time() / 30);
    for ($i = -$range; $i <= $range; $i++) {
        $step = $time + $i;
        // Pack step as a 64-bit integer (big-endian)
        $time_bytes = pack('N*', 0, $step);
        $hash = hash_hmac('sha1', $time_bytes, $key, true);
        $offset = ord($hash[19]) & 0xf;
        $value = (
            ((ord($hash[$offset]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        );
        $calculated = str_pad($value % 1000000, 6, '0', STR_PAD_LEFT);
        if ($calculated === $code) {
            return true;
        }
    }
    return false;
}

// Get raw post data
$input = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------------
// Action: Check Status
// -------------------------------------------------------------
if ($action === 'status') {
    // Check if session is logged in and not expired
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
            "two_factor_enabled" => (bool)$_SESSION['two_factor_enabled']
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
    $captcha_token = isset($input['captcha_token']) ? trim($input['captcha_token']) : '';
    $ip = $_SERVER['REMOTE_ADDR'] ?: '0.0.0.0';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Username and password are required."]);
        exit();
    }

    // 1. Check Rate Limiting & Lockout (5 failed attempts in last 15 mins)
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM failed_logins WHERE (username = ? OR ip_address = ?) AND attempted_at > SUBDATE(NOW(), INTERVAL 15 MINUTE)");
    $stmt->bind_param("ss", $username, $ip);
    $stmt->execute();
    $failed_res = $stmt->get_result()->fetch_assoc();
    $failed_count = $failed_res['count'];
    $stmt->close();

    if ($failed_count >= 5) {
        http_response_code(429);
        echo json_encode(["status" => "error", "message" => "Too many failed login attempts. Locked out for 15 minutes."]);
        exit();
    }

    // 2. Require CAPTCHA if failed attempts >= 3
    if ($failed_count >= 3) {
        $captcha_secret = getenv('CAPTCHA_SECRET_KEY');
        if (!empty($captcha_secret)) {
            if (empty($captcha_token)) {
                http_response_code(400);
                echo json_encode(["status" => "captcha_required", "message" => "CAPTCHA verification is required."]);
                exit();
            }
            // Verify token with provider (Cloudflare Turnstile or Google reCAPTCHA)
            $verify_url = getenv('CAPTCHA_VERIFY_URL') ?: 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $verify_url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'secret' => $captcha_secret,
                'response' => $captcha_token,
                'remoteip' => $ip
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $captcha_res = json_decode(curl_exec($ch), true);
            curl_close($ch);

            if (!$captcha_res || !$captcha_res['success']) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "CAPTCHA verification failed."]);
                exit();
            }
        }
    }

    // 3. Authenticate User
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
            
            echo json_encode([
                "status" => "2fa_required",
                "message" => "Please enter your 2FA code."
            ]);
            exit();
        } else {
            // Login immediately
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $user['username'];
            $_SESSION['admin_role'] = $user['role'];
            $_SESSION['two_factor_enabled'] = false;
            $_SESSION['last_activity'] = time();

            // Clear temporary sessions
            unset($_SESSION['temp_admin_username']);
            unset($_SESSION['temp_admin_role']);
            unset($_SESSION['temp_two_factor_secret']);
            unset($_SESSION['temp_two_factor_enabled']);

            logAdminAction($conn, $user['username'], "Login", "Successful login");
            
            echo json_encode([
                "status" => "authenticated",
                "username" => $user['username'],
                "role" => $user['role'],
                "two_factor_enabled" => false
            ]);
            exit();
        }
    } else {
        // Failed Login: log attempt
        $stmt = $conn->prepare("INSERT INTO failed_logins (username, ip_address) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $ip);
        $stmt->execute();
        $stmt->close();
        
        $attempts_left = 5 - ($failed_count + 1);
        http_response_code(401);
        echo json_encode([
            "status" => "error", 
            "message" => "Incorrect username or password. " . ($attempts_left > 0 ? "($attempts_left attempts remaining)" : "Locked out.")
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
        unset($_SESSION['temp_admin_username']);
        unset($_SESSION['temp_admin_role']);
        unset($_SESSION['temp_two_factor_secret']);
        unset($_SESSION['temp_two_factor_enabled']);

        logAdminAction($conn, $username, "Login", "Successful login with 2FA");

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
    
    // If this is the first admin account, force it to be a Super Admin.
    // Otherwise, allow setting a role (Admin or Super Admin).
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

http_response_code(404);
echo json_encode(["status" => "error", "message" => "Authentication endpoint action not found."]);
?>
