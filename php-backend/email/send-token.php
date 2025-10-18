<?php
// File: send-token.php | Path: php-backend/email/send-token.php
// Function: Send electricity token to customer email via Brevo email service
/**
 * Send Electricity Token via Brevo Email
 * POST /email/send-token.php
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$recipientEmail = sanitizeInput($input['recipient_email'] ?? '');
$recipientName = sanitizeInput($input['recipient_name'] ?? 'Customer');
$meterNumber = sanitizeInput($input['meter_number'] ?? '');
$token = sanitizeInput($input['token'] ?? '');
$amount = floatval($input['amount'] ?? 0);
$disco = sanitizeInput($input['disco'] ?? '');
$transactionId = sanitizeInput($input['transaction_id'] ?? '');

if (!validateEmail($recipientEmail) || empty($token)) {
    sendJsonResponse(['success' => false, 'message' => 'Invalid email or token'], 400);
}

// Get Brevo settings
$db = Database::getInstance()->getConnection();
$stmt = $db->query("SELECT setting_value FROM admin_settings WHERE setting_key = 'brevo_api_key'");
$brevoApiKey = $stmt->fetchColumn();

$stmt = $db->query("SELECT setting_value FROM admin_settings WHERE setting_key = 'brevo_sender_email'");
$senderEmail = $stmt->fetchColumn();

$stmt = $db->query("SELECT setting_value FROM admin_settings WHERE setting_key = 'brevo_sender_name'");
$senderName = $stmt->fetchColumn();

if (empty($brevoApiKey)) {
    sendJsonResponse(['success' => false, 'message' => 'Email service not configured'], 500);
}

// Prepare email content
$htmlContent = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Electricity Token</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .token-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
        .token { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: monospace; }
        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ Electricity Token</h1>
            <p>Your electricity units have been purchased successfully</p>
        </div>
        <div class="content">
            <p>Dear {$recipientName},</p>
            <p>Your electricity token purchase was successful. Please find your token details below:</p>
            
            <div class="token-box">
                <p style="margin: 0; color: #666; font-size: 14px;">YOUR TOKEN</p>
                <p class="token">{$token}</p>
            </div>
            
            <div class="details">
                <p><strong>Meter Number:</strong> {$meterNumber}</p>
                <p><strong>DISCO:</strong> {$disco}</p>
                <p><strong>Amount Paid:</strong> ₦{$amount}</p>
                <p><strong>Transaction ID:</strong> {$transactionId}</p>
                <p><strong>Date:</strong> <?php echo date('F j, Y, g:i a'); ?></p>
            </div>
            
            <p><strong>How to load your token:</strong></p>
            <ol>
                <li>Locate your meter keypad</li>
                <li>Enter the 20-digit token code above</li>
                <li>Press the enter/accept button</li>
                <li>Your units will be credited immediately</li>
            </ol>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                <em>Please keep this email for your records. If you experience any issues loading your token, contact your DISCO customer service.</em>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated message from SuperBills</p>
            <p>© <?php echo date('Y'); ?> SuperBills. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;

// Send email via Brevo
$url = 'https://api.brevo.com/v3/smtp/email';

$headers = [
    'Accept: application/json',
    'api-key: ' . $brevoApiKey,
    'Content-Type: application/json'
];

$data = [
    'sender' => [
        'name' => $senderName,
        'email' => $senderEmail
    ],
    'to' => [
        ['email' => $recipientEmail, 'name' => $recipientName]
    ],
    'subject' => 'Your Electricity Token - SuperBills',
    'htmlContent' => $htmlContent
];

$response = makeApiRequest($url, 'POST', $data, $headers);

if (isset($response['messageId'])) {
    sendJsonResponse([
        'success' => true,
        'message' => 'Token sent to email successfully',
        'message_id' => $response['messageId']
    ]);
} else {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to send email',
        'error' => $response
    ], 500);
}
