<?php
/**
 * Flutterwave Payment Initiation
 * POST /payment/flutterwave-initiate.php
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$amount = floatval($input['amount'] ?? 0);
$email = sanitizeInput($input['email'] ?? '');
$name = sanitizeInput($input['name'] ?? 'Customer');
$phone = sanitizeInput($input['phone'] ?? '');
$userId = getCurrentUserId();

if ($amount < 100) {
    sendJsonResponse(['success' => false, 'message' => 'Minimum amount is ₦100'], 400);
}

if (!$email) {
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
    sendJsonResponse([
        'success' => false,
        'message' => $response_data['message'] ?? 'Failed to initiate payment',
        'error' => $response_data
    ], 400);
}
