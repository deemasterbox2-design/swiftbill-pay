<?php
// File: verify.php | Path: php-backend/espees/verify.php
// Function: Verify Espees payment completion and update transaction status
/**
 * Verify Espees Payment (Callback endpoint)
 * GET/POST /espees/verify.php?invoice_id={id}&tab_instance={instance}
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$invoiceId = sanitizeInput($_GET['invoice_id'] ?? '');
$tabInstance = sanitizeInput($_GET['tab_instance'] ?? '');

if (empty($invoiceId) || empty($tabInstance)) {
    sendJsonResponse(['success' => false, 'message' => 'Missing verification parameters'], 400);
}

// Get payment reference from database
$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT payment_ref, amount, user_id FROM espees_sessions WHERE tab_instance = ? AND invoice_id = ?");
$stmt->execute([$tabInstance, $invoiceId]);
$session = $stmt->fetch();

if (!$session) {
    sendJsonResponse(['success' => false, 'message' => 'Payment session not found'], 404);
}

$paymentRef = $session['payment_ref'];

// Verify with Espees API
$headers = [
    'Content-Type: application/json',
    'x-api-key: ' . ESPEES_API_KEY
];

$response = makeApiRequest(
    ESPEES_BASE_URL . '/payment/confirm/',
    'POST',
    ['payment_ref' => $paymentRef],
    $headers
);

$isApproved = isset($response['transaction_status']) && 
              $response['transaction_status'] === 'APPROVED' &&
              isset($response['status_details']) &&
              $response['status_details'] === 'Successfully Done';

if ($isApproved) {
    // Update session status
    $stmt = $db->prepare("UPDATE espees_sessions SET status = 'approved', response_data = ?, updated_at = NOW() WHERE payment_ref = ?");
    $stmt->execute([json_encode($response), $paymentRef]);
    
    // Check if transaction already exists
    $stmt = $db->prepare("SELECT id FROM transactions WHERE request_id = ?");
    $stmt->execute([$paymentRef]);
    
    if (!$stmt->fetch()) {
        // Log transaction
        $transactionData = [
            'user_id' => $session['user_id'],
            'request_id' => $paymentRef,
            'service_id' => 'espees_payment',
            'service_name' => 'Espees Payment',
            'amount' => $session['amount'],
            'currency' => 'Espees',
            'status' => 'success',
            'response' => $response
        ];
        logTransaction($db, $transactionData);
    }
    
    // Redirect to success page
    header('Location: ' . APP_URL . '/payment/success?ref=' . urlencode($paymentRef));
    exit;
} else {
    $stmt = $db->prepare("UPDATE espees_sessions SET status = 'failed', response_data = ?, updated_at = NOW() WHERE payment_ref = ?");
    $stmt->execute([json_encode($response), $paymentRef]);
    
    sendJsonResponse([
        'success' => false,
        'message' => 'Payment not confirmed',
        'status' => $response['transaction_status'] ?? 'unknown',
        'details' => $response['status_details'] ?? 'Unknown error'
    ], 400);
}
