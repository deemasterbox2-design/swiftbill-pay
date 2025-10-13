<?php
/**
 * Flutterwave Payment Verification
 * GET /payment/flutterwave-verify.php?transaction_id=xxx
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$transaction_id = sanitizeInput($_GET['transaction_id'] ?? '');

if (empty($transaction_id)) {
    sendJsonResponse(['success' => false, 'message' => 'Transaction ID is required'], 400);
}

// Flutterwave API credentials
$secret_key = 'FLWSECK_TEST-efdcdc55d003b7991a2d770e2bb6946e-X';
$url = "https://api.flutterwave.com/v3/transactions/{$transaction_id}/verify";

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $secret_key,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    error_log("Flutterwave Verify cURL Error: $error");
    sendJsonResponse([
        'success' => false,
        'message' => 'Payment verification failed'
    ], 500);
}

$data = json_decode($response, true);
error_log("Flutterwave Verify Response: " . json_encode($data));

$db = Database::getInstance()->getConnection();

if ($data['status'] === 'success' && $data['data']['status'] === 'successful') {
    $amount = floatval($data['data']['amount']);
    $tx_ref = $data['data']['tx_ref'];
    $currency = $data['data']['currency'];
    $user_id = $data['data']['meta']['user_id'] ?? null;
    
    // Update transaction status
    $stmt = $db->prepare("
        UPDATE transactions 
        SET status = 'success', 
            response_data = ? 
        WHERE request_id = ?
    ");
    $stmt->execute([json_encode($data), $tx_ref]);
    
    // Credit user wallet
    if ($user_id) {
        $stmt = $db->prepare("
            UPDATE wallets 
            SET naira_balance = naira_balance + ? 
            WHERE user_id = ?
        ");
        $stmt->execute([$amount, $user_id]);
    }
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Payment verified successfully',
        'data' => [
            'amount' => $amount,
            'currency' => $currency,
            'reference' => $tx_ref,
            'transaction_id' => $transaction_id
        ]
    ]);
} else {
    // Update transaction as failed
    $tx_ref = $data['data']['tx_ref'] ?? '';
    if ($tx_ref) {
        $stmt = $db->prepare("
            UPDATE transactions 
            SET status = 'failed', 
                response_data = ? 
            WHERE request_id = ?
        ");
        $stmt->execute([json_encode($data), $tx_ref]);
    }
    
    sendJsonResponse([
        'success' => false,
        'message' => 'Payment verification failed',
        'data' => $data
    ], 400);
}
