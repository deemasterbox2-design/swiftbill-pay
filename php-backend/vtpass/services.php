<?php
// File: services.php | Path: php-backend/vtpass/services.php
// Function: Get VTpass services filtered by category identifier
/**
 * Get VTpass Services by Category
 * GET /vtpass/services.php?identifier={category}
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$identifier = sanitizeInput($_GET['identifier'] ?? '');

if (empty($identifier)) {
    sendJsonResponse(['success' => false, 'message' => 'Category identifier required'], 400);
}

$headers = [
    'api-key: ' . VTPASS_API_KEY,
    'public-key: ' . VTPASS_PUBLIC_KEY
];

$response = makeApiRequest(
    VTPASS_BASE_URL . '/services?identifier=' . urlencode($identifier),
    'GET',
    [],
    $headers
);

if (isset($response['response_description']) && $response['response_description'] === '000') {
    sendJsonResponse([
        'success' => true,
        'data' => $response['content'] ?? []
    ]);
} else {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to fetch services',
        'error' => $response
    ], 500);
}
