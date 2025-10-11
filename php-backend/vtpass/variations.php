<?php
/**
 * Get VTpass Service Variations (Plans)
 * GET /vtpass/variations.php?serviceID={id}
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$serviceID = sanitizeInput($_GET['serviceID'] ?? '');

if (empty($serviceID)) {
    sendJsonResponse(['success' => false, 'message' => 'Service ID required'], 400);
}

$headers = [
    'api-key: ' . VTPASS_API_KEY,
    'public-key: ' . VTPASS_PUBLIC_KEY
];

$response = makeApiRequest(
    VTPASS_BASE_URL . '/service-variations?serviceID=' . urlencode($serviceID),
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
        'message' => 'Failed to fetch variations',
        'error' => $response
    ], 500);
}
