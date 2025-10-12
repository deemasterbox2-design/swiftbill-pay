<?php
/**
 * Get Wallet Balance
 * GET /wallet/balance.php
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
$stmt = $db->prepare("SELECT naira_balance, espees_balance FROM wallets WHERE user_id = ?");
$stmt->execute([$userId]);
$wallet = $stmt->fetch();

if (!$wallet) {
    // Create wallet if doesn't exist
    $stmt = $db->prepare("INSERT INTO wallets (user_id) VALUES (?)");
    $stmt->execute([$userId]);
    
    $wallet = [
        'naira_balance' => 0.00,
        'espees_balance' => 0.00
    ];
}

sendJsonResponse([
    'success' => true,
    'data' => [
        'naira_balance' => floatval($wallet['naira_balance']),
        'espees_balance' => floatval($wallet['espees_balance'])
    ]
]);
