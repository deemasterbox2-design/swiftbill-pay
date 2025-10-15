<?php
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

setCorsHeaders();

// Google OAuth Configuration
define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');
define('GOOGLE_REDIRECT_URI', API_URL . '/auth/google-callback.php');

try {
    $db = getDbConnection();
    
    // Generate authorization URL
    $params = [
        'client_id' => GOOGLE_CLIENT_ID,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'response_type' => 'code',
        'scope' => 'email profile',
        'access_type' => 'offline',
        'prompt' => 'consent'
    ];
    
    $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    
    sendJsonResponse([
        'success' => true,
        'authUrl' => $authUrl
    ]);
    
} catch (Exception $e) {
    error_log("Google login error: " . $e->getMessage());
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to initialize Google login'
    ], 500);
}
