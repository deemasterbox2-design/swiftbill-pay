<?php
/**
 * Shared Utility Functions
 */

/**
 * Set CORS headers for React frontend
 */
function setCorsHeaders() {
    // Get the origin from the request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Allowed origins
    $allowedOrigins = [
        'https://superbills.lovable.app',
        'https://5a5d2ef9-10ad-4d4a-b4cc-1a7f749a5f4a.lovableproject.com',
        'https://id-preview--5a5d2ef9-10ad-4d4a-b4cc-1a7f749a5f4a.lovable.app'
    ];
    
    // Check if origin is allowed
    if (in_array($origin, $allowedOrigins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    header('Content-Type: application/json');

    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Generate unique request ID for VTpass (YYYYMMDDHHMM + random)
 */
function generateRequestId() {
    return date('YmdHi') . rand(1000, 9999);
}

/**
 * Make API request using cURL
 */
function makeApiRequest($url, $method = 'GET', $data = [], $headers = []) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log("cURL Error: $error");
        return ['success' => false, 'message' => 'API request failed', 'error' => $error];
    }

    $result = json_decode($response, true);
    error_log("API Response [$url]: " . json_encode($result));

    return $result;
}

/**
 * Send JSON response
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Validate phone number (Nigerian format)
 */
function validatePhone($phone) {
    return preg_match('/^0[789]\d{9}$/', $phone);
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Get current user ID from session
 */
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isLoggedIn()) {
        sendJsonResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
}

/**
 * Log transaction to database
 */
function logTransaction($db, $data) {
    $stmt = $db->prepare("
        INSERT INTO transactions 
        (user_id, request_id, service_id, service_name, biller_code, amount, currency, status, response_data, user_ip, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    return $stmt->execute([
        $data['user_id'] ?? null,
        $data['request_id'],
        $data['service_id'],
        $data['service_name'] ?? '',
        $data['biller_code'] ?? '',
        $data['amount'],
        $data['currency'] ?? 'Naira',
        $data['status'],
        json_encode($data['response'] ?? []),
        $_SERVER['REMOTE_ADDR']
    ]);
}
