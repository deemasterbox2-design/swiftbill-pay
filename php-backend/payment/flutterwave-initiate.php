<?php
/**
 * Flutterwave Payment Initiation
 * POST /payment/flutterwave-initiate.php
 */

// Set CORS headers first - before any includes
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Error logging function
function logToFile($message) {
    $logFile = __DIR__ . '/../lovable_error.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

logToFile("=== FLUTTERWAVE INITIATE REQUEST ===");
logToFile("Method: " . $_SERVER['REQUEST_METHOD']);
logToFile("Raw Input: " . file_get_contents('php://input'));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logToFile("ERROR: Method not allowed - " . $_SERVER['REQUEST_METHOD']);
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$amount = floatval($input['amount'] ?? 0);
$email = sanitizeInput($input['email'] ?? '');
$name = sanitizeInput($input['name'] ?? 'Customer');
$phone = sanitizeInput($input['phone'] ?? '');
$userId = getCurrentUserId();

logToFile("Parsed input - Amount: $amount, Email: $email, Name: $name, Phone: $phone, UserID: $userId");

if ($amount < 100) {
    logToFile("ERROR: Amount too low - $amount");
    sendJsonResponse(['success' => false, 'message' => 'Minimum amount is ₦100'], 400);
}

if (!$email) {
    logToFile("ERROR: Email is missing");
    sendJsonResponse(['success' => false, 'message' => 'Email is required'], 400);
}

// Flutterwave API credentials
$secret_key = 'FLWSECK_TEST-efdcdc55d003b7991a2d770e2bb6946e-X';
$api_url = 'https://api.flutterwave.com/v3/payments';

// Generate unique transaction reference
$tx_ref = generateRequestId();

// Payment payload
$payload = [
    'tx_ref' => $tx_ref,
    'amount' => $amount,
    'currency' => 'NGN',
    'redirect_url' => APP_URL . '/payment-confirm',
    'payment_options' => 'card,mobilemoney,ussd',
    'customer' => [
        'email' => $email,
        'phonenumber' => $phone ?: '+2341234567890',
        'name' => $name
    ],
    'customizations' => [
        'title' => 'SuperBills Wallet Funding',
        'description' => 'Wallet top-up payment',
        'logo' => APP_URL . '/logo.png'
    ],
    'meta' => [
        'user_id' => $userId,
        'payment_type' => 'wallet_funding'
    ]
];

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $secret_key,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    logToFile("=== FLUTTERWAVE INITIATE ERROR ===");
    logToFile("cURL Error: $error");
    logToFile("HTTP Code: $http_code");
    logToFile("Request URL: $api_url");
    logToFile("Request Payload: " . json_encode($payload));
    logToFile("=================================");
    error_log("=== FLUTTERWAVE INITIATE ERROR ===");
    error_log("cURL Error: $error");
    error_log("HTTP Code: $http_code");
    error_log("Request URL: $api_url");
    error_log("Request Payload: " . json_encode($payload));
    error_log("=================================");
    sendJsonResponse([
        'success' => false,
        'message' => 'Payment gateway connection failed: ' . $error
    ], 500);
}

$response_data = json_decode($response, true);
logToFile("=== FLUTTERWAVE INITIATE RESPONSE ===");
logToFile("HTTP Code: $http_code");
logToFile("Response: " . json_encode($response_data));
logToFile("Raw Response: " . $response);
logToFile("====================================");
error_log("=== FLUTTERWAVE INITIATE RESPONSE ===");
error_log("HTTP Code: $http_code");
error_log("Response: " . json_encode($response_data));
error_log("Raw Response: " . $response);
error_log("====================================");

if ($http_code === 200 && isset($response_data['status']) && $response_data['status'] === 'success') {
    $payment_url = $response_data['data']['link'];
    
    // Log transaction initiation
    $db = Database::getInstance()->getConnection();
    logTransaction($db, [
        'user_id' => $userId,
        'request_id' => $tx_ref,
        'service_id' => 'wallet_funding',
        'service_name' => 'Wallet Funding (Flutterwave)',
        'amount' => $amount,
        'currency' => 'Naira',
        'status' => 'pending',
        'response' => $response_data
    ]);
    
    sendJsonResponse([
        'success' => true,
        'data' => [
            'payment_url' => $payment_url,
            'reference' => $tx_ref
        ]
    ]);
} else {
    logToFile("ERROR: Payment initiation failed - " . json_encode($response_data));
    sendJsonResponse([
        'success' => false,
        'message' => $response_data['message'] ?? 'Failed to initiate payment',
        'error' => $response_data
    ], 400);
}
