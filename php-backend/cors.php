<?php
// File: cors.php | Path: php-backend/cors.php
// Function: Centralized CORS header handler for all API requests
/**
 * CORS Handler - Must be included FIRST in all API files
 * This ensures CORS headers are sent before any other processing
 */

// Set CORS headers IMMEDIATELY
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400'); // 24 hours

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Return success for preflight
    http_response_code(200);
    exit(0);
}
