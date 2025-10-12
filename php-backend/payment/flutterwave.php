<?php
/**
 * Flutterwave Payment Gateway Integration
 * POST /payment/flutterwave.php
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

// Get Flutterwave settings
$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT * FROM payment_gateway_settings WHERE gateway_name = 'flutterwave' AND is_enabled = 1");
$stmt->execute();
$settings = $stmt->fetch();

if (!$settings) {
    sendJsonResponse(['success' => false, 'message' => 'Flutterwave payment gateway not enabled'], 400);
}

// Initialize payment
$url = 'https://api.flutterwave.com/v3/payments';

$data = [
    'tx_ref' => $reference,
    'amount' => $amount,
    'currency' => 'NGN',
    'redirect_url' => APP_URL . '/payment/confirm',
    'payment_options' => 'card,banktransfer,ussd',
    'customer' => [
        'email' => $email,
        'name' => $name
    ],
    'customizations' => [
        'title' => 'SuperBills Payment',
        'description' => 'Payment for services',
        'logo' => APP_URL . '/logo.png'
    ]
];

$headers = [
    'Authorization: Bearer ' . $settings['secret_key'],
    'Content-Type: application/json'
];

$response = makeApiRequest($url, 'POST', $data, $headers);

if (isset($response['data']['link'])) {
    sendJsonResponse([
        'success' => true,
        'data' => [
            'checkout_url' => $response['data']['link'],
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
