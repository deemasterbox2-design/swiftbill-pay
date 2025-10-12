<?php
/**
 * Export Transactions to CSV
 * GET /transactions/export.php
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId = getCurrentUserId();

if (!$userId) {
    sendJsonResponse(['success' => false, 'message' => 'User not logged in'], 401);
}

$db = Database::getInstance()->getConnection();

$stmt = $db->prepare("
    SELECT 
        request_id,
        service_name,
        biller_code,
        amount,
        convenience_fee,
        total_amount,
        currency,
        payment_method,
        status,
        created_at
    FROM transactions 
    WHERE user_id = ?
    ORDER BY created_at DESC
");
$stmt->execute([$userId]);
$transactions = $stmt->fetchAll();

// Generate CSV
$filename = 'transactions_' . date('Y-m-d') . '.csv';
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');

// CSV headers
fputcsv($output, ['Transaction ID', 'Service', 'Biller Code', 'Amount', 'Convenience Fee', 'Total Amount', 'Currency', 'Payment Method', 'Status', 'Date']);

// CSV data
foreach ($transactions as $txn) {
    fputcsv($output, [
        $txn['request_id'],
        $txn['service_name'],
        $txn['biller_code'],
        $txn['amount'],
        $txn['convenience_fee'],
        $txn['total_amount'],
        $txn['currency'],
        $txn['payment_method'],
        $txn['status'],
        $txn['created_at']
    ]);
}

fclose($output);
exit;
