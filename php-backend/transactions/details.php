<?php
/**
 * Get Transaction Details
 * GET /transactions/details.php?request_id=xxx
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$requestId = sanitizeInput($_GET['request_id'] ?? '');

if (empty($requestId)) {
    sendJsonResponse(['success' => false, 'message' => 'Request ID required'], 400);
}

$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT * FROM transactions WHERE request_id = ?");
$stmt->execute([$requestId]);
$transaction = $stmt->fetch();

if (!$transaction) {
    sendJsonResponse(['success' => false, 'message' => 'Transaction not found'], 404);
}

// Parse response data
if (!empty($transaction['response_data'])) {
    $responseData = json_decode($transaction['response_data'], true);
    if (isset($responseData['content']['token'])) {
        $transaction['token'] = $responseData['content']['token'];
    }
}

sendJsonResponse([
    'success' => true,
    'data' => $transaction
]);
