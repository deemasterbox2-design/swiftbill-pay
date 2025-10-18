<?php
// File: initiate.php | Path: php-backend/espees/initiate.php
// Function: Initiate Espees cryptocurrency payment and generate payment URL
/**
 * Initiate Espees Payment
 * POST /espees/initiate.php
 * Body: {
 *   "amount": number,
 *   "invoice_id": "string",
 *   "narration": "string"
 * }
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
$invoiceId = sanitizeInput($input['invoice_id'] ?? '');
$narration = sanitizeInput($input['narration'] ?? 'SuperBills Payment');

if ($amount <= 0 || empty($invoiceId)) {
    sendJsonResponse(['success' => false, 'message' => 'Invalid amount or invoice ID'], 400);
}

$userId = getCurrentUserId();
$tabInstance = substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 10);

$headers = [
    'Content-Type: application/json',
    'x-api-key: ' . ESPEES_API_KEY
];

$paymentData = [
    'product_sku' => $invoiceId,
    'narration' => $narration,
    'price' => $amount,
    'merchant_wallet' => ESPEES_MERCHANT_WALLET,
    'success_url' => API_URL . '/espees/verify.php?invoice_id=' . urlencode($invoiceId) . '&tab_instance=' . $tabInstance,
    'fail_url' => APP_URL . '/payment/failed',
    'user_data' => [
        'user_id' => $userId,
        'invoice_id' => $invoiceId
    ]
];

$response = makeApiRequest(
    ESPEES_BASE_URL . '/payment/product',
    'POST',
    $paymentData,
    $headers
);

if (isset($response['payment_ref'])) {
    $paymentRef = $response['payment_ref'];
    
    // Store session in database
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("
        INSERT INTO espees_sessions (user_id, payment_ref, tab_instance, invoice_id, amount, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([$userId, $paymentRef, $tabInstance, $invoiceId, $amount]);
    
    sendJsonResponse([
        'success' => true,
        'payment_url' => ESPEES_PAYMENT_URL . '/' . $paymentRef,
        'payment_ref' => $paymentRef,
        'tab_instance' => $tabInstance
    ]);
} else {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to initiate Espees payment',
        'error' => $response
    ], 500);
}
