<?php
// File: receipt.php | Path: php-backend/transactions/receipt.php
// Function: Generate HTML receipt for a transaction with optional electricity token
/**
 * Generate Transaction Receipt (PDF)
 * GET /transactions/receipt.php?request_id=xxx
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$requestId = sanitizeInput($_GET['request_id'] ?? '');

if (empty($requestId)) {
    sendJsonResponse(['success' => false, 'message' => 'Request ID required'], 400);
}

$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT * FROM transactions WHERE request_id = ?");
$stmt->execute([$requestId]);
$transaction = $stmt->fetch();

if (!$transaction) {
    sendJsonResponse(['success' => false, 'message' => 'Transaction not found'], 404);
}

// Parse response data for token if exists
$token = '';
if (!empty($transaction['response_data'])) {
    $responseData = json_decode($transaction['response_data'], true);
    if (isset($responseData['content']['token'])) {
        $token = $responseData['content']['token'];
    }
}

// Generate HTML receipt
$html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - {$transaction['request_id']}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0 0 10px 0;
        }
        .receipt-info {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            text-align: right;
        }
        .token-box {
            background: white;
            border: 2px dashed #667eea;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border-radius: 8px;
        }
        .token {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 2px;
            font-family: monospace;
        }
        .total-row {
            background: #667eea;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
            font-size: 12px;
        }
        .success-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚡ SUPERBILLS</h1>
        <p>Payment Receipt</p>
        <span class="success-badge">✓ SUCCESSFUL</span>
    </div>
    
    <div class="receipt-info">
        <h2 style="margin-top: 0;">Transaction Details</h2>
        
        <div class="row">
            <span class="label">Transaction ID:</span>
            <span class="value">{$transaction['request_id']}</span>
        </div>
        
        <div class="row">
            <span class="label">Service:</span>
            <span class="value">{$transaction['service_name']}</span>
        </div>
        
        <div class="row">
            <span class="label">Date & Time:</span>
            <span class="value">{$transaction['created_at']}</span>
        </div>
        
        <div class="row">
            <span class="label">Status:</span>
            <span class="value" style="color: #10b981; font-weight: bold;">SUCCESS</span>
        </div>
    </div>
    
    <div class="receipt-info">
        <h2 style="margin-top: 0;">Payment Information</h2>
        
        {$transaction['biller_code'] ? "<div class=\"row\">
            <span class=\"label\">" . (strpos($transaction['service_id'], 'electricity') !== false ? 'Meter Number:' : (strpos($transaction['service_id'], 'tv') !== false ? 'Smartcard:' : 'Phone Number:')) . "</span>
            <span class=\"value\">{$transaction['biller_code']}</span>
        </div>" : ''}
        
        <div class="row">
            <span class="label">Amount:</span>
            <span class="value">₦" . number_format($transaction['amount'], 2) . "</span>
        </div>
        
        {$transaction['convenience_fee'] > 0 ? "<div class=\"row\">
            <span class=\"label\">Convenience Fee:</span>
            <span class=\"value\">₦" . number_format($transaction['convenience_fee'], 2) . "</span>
        </div>" : ''}
        
        <div class="row">
            <span class=\"label\">Payment Method:</span>
            <span class=\"value\" style=\"text-transform: capitalize;\">{$transaction['payment_method']}</span>
        </div>
        
        <div class="row">
            <span class=\"label\">Currency:</span>
            <span class=\"value\">{$transaction['currency']}</span>
        </div>
    </div>
    
    {$token ? "<div class=\"token-box\">
        <p style=\"margin: 0 0 10px 0; color: #666; font-size: 14px;\">ELECTRICITY TOKEN</p>
        <p class=\"token\">{$token}</p>
        <p style=\"margin: 10px 0 0 0; color: #666; font-size: 12px;\">Please load this token on your meter</p>
    </div>" : ''}
    
    <div class="total-row">
        <div style=\"display: flex; justify-content: space-between; align-items: center;\">
            <span style=\"font-size: 18px;\">TOTAL PAID</span>
            <span style=\"font-size: 24px; font-weight: bold;\">₦" . number_format($transaction['total_amount'], 2) . "</span>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>SuperBills - Making Bill Payments Easy</strong></p>
        <p>This is a computer-generated receipt and does not require a signature.</p>
        <p>For inquiries, contact support@superbills.org</p>
        <p>© " . date('Y') . " SuperBills. All rights reserved.</p>
    </div>
</body>
</html>
HTML;

// For now, return HTML. In production, you'd use a library like TCPDF or DomPDF to generate PDF
header('Content-Type: text/html; charset=utf-8');
echo $html;
exit;
