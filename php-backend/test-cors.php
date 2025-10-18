<?php
/**
 * CORS Test Endpoint
 * GET/POST /test-cors.php
 */

// Include dependencies
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

// Use centralized CORS handler
setCorsHeaders();

// Test response
$response = [
    'success' => true,
    'message' => 'CORS is working correctly!',
    'data' => [
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'No origin header',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'No user agent',
        'timestamp' => date('Y-m-d H:i:s')
    ]
];

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);
exit;
