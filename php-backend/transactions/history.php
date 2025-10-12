<?php
/**
 * Get Transaction History
 * GET /transactions/history.php?status=success&dateRange=7days
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

$status = sanitizeInput($_GET['status'] ?? '');
$dateRange = sanitizeInput($_GET['dateRange'] ?? '7days');

$db = Database::getInstance()->getConnection();

// Build date filter
$dateCondition = "";
switch ($dateRange) {
    case 'today':
        $dateCondition = "AND DATE(created_at) = CURDATE()";
        break;
    case '7days':
        $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        break;
    case '30days':
        $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        break;
    default:
        $dateCondition = "";
}

// Build status filter
$statusCondition = "";
if (!empty($status)) {
    $statusCondition = "AND status = ?";
}

$sql = "
    SELECT 
        request_id as id,
        service_name as service,
        total_amount as amount,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as date,
        recipient_phone as phone,
        biller_code as meter,
        biller_code as smartcard
    FROM transactions 
    WHERE user_id = ? 
    $dateCondition 
    $statusCondition
    ORDER BY created_at DESC
    LIMIT 100
";

$params = [$userId];
if (!empty($status)) {
    $params[] = $status;
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
$transactions = $stmt->fetchAll();

sendJsonResponse([
    'success' => true,
    'data' => $transactions
]);
