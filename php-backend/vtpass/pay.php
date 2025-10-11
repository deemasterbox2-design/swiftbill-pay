<?php
/**
 * Execute VTpass Payment
 * POST /vtpass/pay.php
 * Body: {
 *   "serviceID": "string",
 *   "billersCode": "string",
 *   "variation_code": "string" (optional),
 *   "amount": number,
 *   "phone": "string",
 *   "paymentMethod": "naira|espees|wallet"
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
$serviceID = sanitizeInput($input['serviceID'] ?? '');
$billersCode = sanitizeInput($input['billersCode'] ?? '');
$variationCode = sanitizeInput($input['variation_code'] ?? '');
$amount = floatval($input['amount'] ?? 0);
$phone = sanitizeInput($input['phone'] ?? '');
$paymentMethod = sanitizeInput($input['paymentMethod'] ?? 'naira');

// Validation
if (empty($serviceID) || empty($billersCode) || empty($phone)) {
    sendJsonResponse(['success' => false, 'message' => 'Missing required fields'], 400);
}

if (!validatePhone($phone)) {
    sendJsonResponse(['success' => false, 'message' => 'Invalid phone number'], 400);
}

// Check wallet balance if paying with wallet
$db = Database::getInstance()->getConnection();
$userId = getCurrentUserId();

if ($paymentMethod === 'wallet' && $userId) {
    $stmt = $db->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = 'Naira'");
    $stmt->execute([$userId]);
    $wallet = $stmt->fetch();
    
    if (!$wallet || $wallet['balance'] < $amount) {
        sendJsonResponse(['success' => false, 'message' => 'Insufficient wallet balance'], 400);
    }
}

// Generate request ID
$requestId = generateRequestId();

// Prepare VTpass payment request
$headers = [
    'api-key: ' . VTPASS_API_KEY,
    'secret-key: ' . VTPASS_SECRET_KEY,
    'Content-Type: application/json'
];

$paymentData = [
    'request_id' => $requestId,
    'serviceID' => $serviceID,
    'billersCode' => $billersCode,
    'phone' => $phone
];

if (!empty($variationCode)) {
    $paymentData['variation_code'] = $variationCode;
}

if ($amount > 0) {
    $paymentData['amount'] = $amount;
}

$response = makeApiRequest(
    VTPASS_BASE_URL . '/pay',
    'POST',
    $paymentData,
    $headers
);

// Log transaction
$transactionData = [
    'user_id' => $userId,
    'request_id' => $requestId,
    'service_id' => $serviceID,
    'biller_code' => $billersCode,
    'amount' => $amount,
    'currency' => $paymentMethod === 'espees' ? 'Espees' : 'Naira',
    'status' => $response['code'] ?? 'failed',
    'response' => $response
];

logTransaction($db, $transactionData);

// Deduct from wallet if successful
if (isset($response['code']) && $response['code'] === '000' && $paymentMethod === 'wallet' && $userId) {
    $stmt = $db->prepare("UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ? AND currency = 'Naira'");
    $stmt->execute([$amount, $userId]);
}

if (isset($response['code']) && ($response['code'] === '000' || $response['code'] === '002')) {
    sendJsonResponse([
        'success' => true,
        'data' => $response['content'] ?? [],
        'message' => $response['response_description'] ?? 'Payment processed',
        'request_id' => $requestId,
        'status' => $response['code']
    ]);
} else {
    $errorMessage = $response['response_description'] ?? 'Payment failed';
    sendJsonResponse([
        'success' => false,
        'message' => $errorMessage,
        'error' => $response,
        'request_id' => $requestId
    ], 400);
}
