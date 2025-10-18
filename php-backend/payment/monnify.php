<?php
// File: monnify.php | Path: php-backend/payment/monnify.php
// Function: Monnify payment gateway integration
/**
 * Monnify Payment Gateway Integration
 * POST /payment/monnify.php
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
$reference = sanitizeInput($input['reference'] ?? generateRequestId());

if ($amount < 100) {
    sendJsonResponse(['success' => false, 'message' => 'Minimum amount is ₦100'], 400);
}

// Get Monnify settings
$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT * FROM payment_gateway_settings WHERE gateway_name = 'monnify' AND is_enabled = 1");
$stmt->execute();
$settings = $stmt->fetch();

if (!$settings) {
    sendJsonResponse(['success' => false, 'message' => 'Monnify payment gateway not enabled'], 400);
}

// Initialize payment
$url = 'https://api.monnify.com/api/v1/merchant/transactions/init-transaction';

$data = [
    'amount' => $amount,
    'customerName' => $name,
    'customerEmail' => $email,
    'paymentReference' => $reference,
    'paymentDescription' => 'SuperBills Payment',
    'currencyCode' => 'NGN',
    'redirectUrl' => APP_URL . '/payment/confirm',
    'paymentMethods' => ['CARD', 'ACCOUNT_TRANSFER']
];

$headers = [
    'Authorization: Bearer ' . $settings['api_key'],
    'Content-Type: application/json'
];

$response = makeApiRequest($url, 'POST', $data, $headers);

if (isset($response['responseBody']['checkoutUrl'])) {
    sendJsonResponse([
        'success' => true,
        'data' => [
            'checkout_url' => $response['responseBody']['checkoutUrl'],
            'reference' => $reference
        ]
    ]);
} else {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to initialize payment',
        'error' => $response
    ], 400);
}
