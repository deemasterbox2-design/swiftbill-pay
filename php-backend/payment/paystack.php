<?php
// File: paystack.php | Path: php-backend/payment/paystack.php
// Function: Paystack payment gateway integration
/**
 * Paystack Payment Gateway Integration
 * POST /payment/paystack.php
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
$reference = sanitizeInput($input['reference'] ?? generateRequestId());

if ($amount < 100) {
    sendJsonResponse(['success' => false, 'message' => 'Minimum amount is ₦100'], 400);
}

// Get Paystack settings
$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT * FROM payment_gateway_settings WHERE gateway_name = 'paystack' AND is_enabled = 1");
$stmt->execute();
$settings = $stmt->fetch();

if (!$settings) {
    sendJsonResponse(['success' => false, 'message' => 'Paystack payment gateway not enabled'], 400);
}

// Initialize payment
$url = 'https://api.paystack.co/transaction/initialize';

$data = [
    'reference' => $reference,
    'amount' => $amount * 100, // Paystack expects amount in kobo
    'email' => $email,
    'currency' => 'NGN',
    'callback_url' => APP_URL . '/payment/confirm',
    'channels' => ['card', 'bank', 'ussd', 'bank_transfer']
];

$headers = [
    'Authorization: Bearer ' . $settings['secret_key'],
    'Content-Type: application/json'
];

$response = makeApiRequest($url, 'POST', $data, $headers);

if (isset($response['data']['authorization_url'])) {
    sendJsonResponse([
        'success' => true,
        'data' => [
            'checkout_url' => $response['data']['authorization_url'],
            'reference' => $reference,
            'access_code' => $response['data']['access_code']
        ]
    ]);
} else {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to initialize payment',
        'error' => $response
    ], 400);
}
