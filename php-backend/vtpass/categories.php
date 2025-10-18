<?php
// File: categories.php | Path: php-backend/vtpass/categories.php
// Function: Fetch VTpass service categories
/**
 * Get VTpass Service Categories
 * GET /vtpass/categories.php
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$headers = [
    'api-key: ' . VTPASS_API_KEY,
    'public-key: ' . VTPASS_PUBLIC_KEY
];

$response = makeApiRequest(
    VTPASS_BASE_URL . '/service-categories',
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
        'message' => 'Failed to fetch categories',
        'error' => $response
    ], 500);
}
