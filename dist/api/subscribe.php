<?php
// Allow requests from any origin (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get JSON POST data
$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : '';

// Validate email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email address."]);
    exit();
}

// =====================================================================
// Database connection (credentials loaded from .env via db.php)
// =====================================================================

$conn = require_once __DIR__ . '/db.php';

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit();
}

// Auto-create table if it doesn't exist
$conn->query("CREATE TABLE IF NOT EXISTS subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$stmt = $conn->prepare("INSERT INTO subscribers (email) VALUES (?)");
$stmt->bind_param("s", $email);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Thanks for subscribing!"]);
} else {
    // Handle duplicate entry gracefully
    if ($conn->errno == 1062) {
        echo json_encode(["status" => "success", "message" => "You are already subscribed!"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error."]);
    }
}
$stmt->close();
$conn->close();
exit();


// =====================================================================
// OPTION 2: Send Email Notification to Admin (DISABLED)
// =====================================================================
/*
$admin_email = "info@ecasiafrica.org"; // CHANGE THIS to your email
$subject = "New Newsletter Subscriber!";
$message = "You have a new subscriber to the ECASI newsletter:\n\nEmail: " . $email;
$headers = "From: noreply@yourdomain.com"; // CHANGE THIS to a valid email on your cPanel

if (mail($admin_email, $subject, $message, $headers)) {
    echo json_encode(["status" => "success", "message" => "Thanks for subscribing!"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to process subscription."]);
}
*/
?>
