<?php
/**
 * CORS Test Endpoint
 * GET/POST /test-cors.php
 */

// Include CORS handler FIRST - before any other code
require_once __DIR__ . '/cors.php';

// Now set content type
header('Content-Type: application/json; charset=utf-8');

// Test response
$response = [
    'success' => true,
    'message' => 'CORS is working correctly!',
    'data' => [
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'No origin header',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'No user agent',
        'timestamp' => date('Y-m-d H:i:s'),
        'headers_sent' => [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
            'Content-Type' => 'application/json'
        ]
    ]
];

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);
exit;
