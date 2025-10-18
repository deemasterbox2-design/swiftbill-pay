<?php
// File: google-callback.php | Path: php-backend/auth/google-callback.php
// Function: Handle Google OAuth callback, exchange code for token, and create/login user
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

setCorsHeaders();

// Google OAuth Configuration
define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');
define('GOOGLE_REDIRECT_URI', API_URL . '/auth/google-callback.php');

try {
    $code = $_GET['code'] ?? null;
    
    if (!$code) {
        throw new Exception('Authorization code not received');
    }
    
    // Exchange code for access token
    $tokenUrl = 'https://oauth2.googleapis.com/token';
    $tokenParams = [
        'code' => $code,
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'grant_type' => 'authorization_code'
    ];
    
    $ch = curl_init($tokenUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenParams));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $tokenResponse = curl_exec($ch);
    curl_close($ch);
    
    $tokenData = json_decode($tokenResponse, true);
    
    if (!isset($tokenData['access_token'])) {
        throw new Exception('Failed to obtain access token');
    }
    
    // Get user info
    $userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    $ch = curl_init($userInfoUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $tokenData['access_token']
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $userInfoResponse = curl_exec($ch);
    curl_close($ch);
    
    $userInfo = json_decode($userInfoResponse, true);
    
    if (!isset($userInfo['email'])) {
        throw new Exception('Failed to get user information');
    }
    
    $db = getDbConnection();
    
    // Check if user exists
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? OR google_id = ?");
    $stmt->execute([$userInfo['email'], $userInfo['id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        // Create new user
        $stmt = $db->prepare("
            INSERT INTO users (name, email, google_id, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([
            $userInfo['name'] ?? $userInfo['email'],
            $userInfo['email'],
            $userInfo['id']
        ]);
        $userId = $db->lastInsertId();
    } else {
        $userId = $user['id'];
        
        // Update google_id if not set
        if (!$user['google_id']) {
            $stmt = $db->prepare("UPDATE users SET google_id = ? WHERE id = ?");
            $stmt->execute([$userInfo['id'], $userId]);
        }
    }
    
    // Create session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $userInfo['email'];
    $_SESSION['user_name'] = $userInfo['name'] ?? $userInfo['email'];
    
    // Redirect to app
    header('Location: ' . APP_URL . '/?login=success');
    exit;
    
} catch (Exception $e) {
    error_log("Google callback error: " . $e->getMessage());
    header('Location: ' . APP_URL . '/auth?error=google_login_failed');
    exit;
}
