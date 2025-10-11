<?php
/**
 * Verify Customer Details (Meter, Smartcard, etc.)
 * POST /vtpass/verify.php
 * Body: { "serviceID": "string", "billersCode": "string", "type": "string" (optional) }
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
$type = sanitizeInput($input['type'] ?? '');

if (empty($serviceID) || empty($billersCode)) {
    sendJsonResponse(['success' => false, 'message' => 'Service ID and biller code required'], 400);
}

$headers = [
    'api-key: ' . VTPASS_API_KEY,
    'secret-key: ' . VTPASS_SECRET_KEY,
    'Content-Type: application/json'
];

$data = [
    'billersCode' => $billersCode,
    'serviceID' => $serviceID
];

if (!empty($type)) {
    $data['type'] = $type;
}

$response = makeApiRequest(
    VTPASS_BASE_URL . '/merchant-verify',
    'POST',
    $data,
    $headers
);

if (isset($response['code']) && $response['code'] === '000') {
    sendJsonResponse([
        'success' => true,
        'data' => $response['content'] ?? [],
        'message' => 'Customer verified successfully'
    ]);
} else {
    $errorMessage = $response['response_description'] ?? 'Verification failed';
    sendJsonResponse([
        'success' => false,
        'message' => $errorMessage,
        'error' => $response
    ], 400);
}
