<?php
// Secure Database Connection Helper

// Load .env file if it exists
$loadEnv = function($path) {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        if (strpos($line, '=') === false) {
            continue;
        }
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
};

// Check parent directories for .env (since API is inside public/api)
$loadEnv(__DIR__ . '/../../.env');
$loadEnv(__DIR__ . '/../.env');
$loadEnv(__DIR__ . '/.env');

// Retrieve DB configuration from environment variables with fallbacks
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: '';
$db_pass = getenv('DB_PASS') ?: '';
$db_name = getenv('DB_NAME') ?: '';

// Connect to MySQL
$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit();
}

// Enforce UTF-8 charset
$conn->set_charset("utf8mb4");

return $conn;
?>
