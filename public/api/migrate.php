<?php
// Database Migration & Table Initialization Script
header("Content-Type: application/json");

// Connect to the database
$conn = require_once __DIR__ . '/db.php';

$response = ["status" => "success", "messages" => []];

// 1. Create Admins Table
$sql_admins = "CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Admin',
    two_factor_secret VARCHAR(100) DEFAULT NULL,
    two_factor_enabled TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql_admins)) {
    $response["messages"][] = "Table 'admins' checked/created.";
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to create admins table: " . $conn->error]);
    exit();
}

// 2. Create Admin Actions Log Table (Audit Logging)
$sql_logs = "CREATE TABLE IF NOT EXISTS admin_actions_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_username VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql_logs)) {
    $response["messages"][] = "Table 'admin_actions_log' checked/created.";
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to create audit logs table: " . $conn->error]);
    exit();
}

// 3. Create Failed Logins Tracking Table (Brute Force Monitoring)
$sql_failed = "CREATE TABLE IF NOT EXISTS failed_logins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql_failed)) {
    $response["messages"][] = "Table 'failed_logins' checked/created.";
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to create failed_logins table: " . $conn->error]);
    exit();
}

// 4. Create Site Content Table (Key-Value JSON Store)
$sql_content = "CREATE TABLE IF NOT EXISTS site_content (
    category_name VARCHAR(50) PRIMARY KEY,
    content_json LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
if ($conn->query($sql_content)) {
    $response["messages"][] = "Table 'site_content' checked/created.";
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to create site_content table: " . $conn->error]);
    exit();
}

// 5. Seed default Super Admin if none exists
$result = $conn->query("SELECT COUNT(*) as count FROM admins WHERE username = 'ecasike'");
$row = $result->fetch_assoc();
if ($row['count'] == 0) {
    // Clear all other admin accounts to ensure ONLY the default Super Admin exists after installation
    $conn->query("DELETE FROM admins");
    
    $initial_user = 'ecasike';
    $initial_pass = 'Ecasi2016@kisii';
    
    // Hash password with bcrypt cost 12
    $options = ['cost' => 12];
    $pass_hash = password_hash($initial_pass, PASSWORD_BCRYPT, $options);
    
    // Seed with 2FA enabled and a default secret key for Google Authenticator setup
    $default_secret = 'JBSWY3DPEHPK3PXP';
    $stmt = $conn->prepare("INSERT INTO admins (username, password_hash, role, two_factor_secret, two_factor_enabled) VALUES (?, ?, 'Super Admin', ?, 1)");
    $stmt->bind_param("sss", $initial_user, $pass_hash, $default_secret);
    if ($stmt->execute()) {
        $response["messages"][] = "Seeded initial Super Admin account: '$initial_user' with 2FA enabled.";
    } else {
        $response["messages"][] = "Warning: Failed to seed initial Super Admin: " . $stmt->error;
    }
    $stmt->close();
}

// 6. Prepopulate site_content categories if they are empty
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

foreach ($categories as $cat => $default_json) {
    $check = $conn->query("SELECT COUNT(*) as count FROM site_content WHERE category_name = '$cat'");
    $check_row = $check->fetch_assoc();
    if ($check_row['count'] == 0) {
        // Try to load initial JSON data from files if they exist
        // Note: During local building or cPanel running, the relative path to src/data might vary, so we fallback to defaults
        $file_path = __DIR__ . "/../../src/data/{$cat}Data.json";
        if ($cat === 'courses_links') $file_path = __DIR__ . "/../../src/data/coursesLinks.json";
        
        if (file_exists($file_path)) {
            $json_data = file_get_contents($file_path);
            // Verify if valid JSON
            if (json_decode($json_data) !== null) {
                $default_json = $json_data;
            }
        }
        
        $stmt = $conn->prepare("INSERT INTO site_content (category_name, content_json) VALUES (?, ?)");
        $stmt->bind_param("ss", $cat, $default_json);
        $stmt->execute();
        $stmt->close();
        $response["messages"][] = "Prepopulated category '$cat' with default JSON data.";
    }
}

$conn->close();
echo json_encode($response);
?>
