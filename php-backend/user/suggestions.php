<?php
// File: suggestions.php | Path: php-backend/user/suggestions.php
// Function: Get user's frequently used phone numbers, emails, meters, smartcards for autocomplete
/**
 * Get User Detail Suggestions
 * GET /user/suggestions.php?type=phone|email|meter|smartcard|decoder
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

$type = sanitizeInput($_GET['type'] ?? '');

if (empty($type)) {
    sendJsonResponse(['success' => false, 'message' => 'Detail type required'], 400);
}

$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("
    SELECT detail_value, usage_count, last_used_at 
    FROM user_details_suggestions 
    WHERE user_id = ? AND detail_type = ? 
    ORDER BY usage_count DESC, last_used_at DESC 
    LIMIT 5
");
$stmt->execute([$userId, $type]);
$suggestions = $stmt->fetchAll();

sendJsonResponse([
    'success' => true,
    'data' => $suggestions
]);
