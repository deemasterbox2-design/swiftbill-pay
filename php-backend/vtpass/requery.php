<?php
/**
 * Requery Transaction Status
 * POST /vtpass/requery.php
 * Body: { "request_id": "string" }
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$requestId = sanitizeInput($input['request_id'] ?? '');

if (empty($requestId)) {
    sendJsonResponse(['success' => false, 'message' => 'Request ID required'], 400);
}

$headers = [
    'api-key: ' . VTPASS_API_KEY,
    'secret-key: ' . VTPASS_SECRET_KEY,
    'Content-Type: application/json'
];

$response = makeApiRequest(
    VTPASS_BASE_URL . '/requery',
    'POST',
    ['request_id' => $requestId],
    $headers
);

// Update transaction status in database
$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("UPDATE transactions SET status = ?, response_data = ?, updated_at = NOW() WHERE request_id = ?");
$stmt->execute([
    $response['code'] ?? 'unknown',
    json_encode($response),
    $requestId
]);

if (isset($response['code'])) {
    sendJsonResponse([
        'success' => true,
        'data' => $response['content'] ?? [],
        'message' => $response['response_description'] ?? 'Transaction status updated',
        'status' => $response['code']
    ]);
} else {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to requery transaction',
        'error' => $response
    ], 500);
}
