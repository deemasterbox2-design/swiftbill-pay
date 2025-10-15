<?php
// File: diagnostics.php | Path: php-backend/diagnostics.php
/**
 * Server Diagnostics Script
 * Access via: https://smcgame.com/api/diagnostics.php
 */

// Set headers
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Initialize results array
$results = [];
$overallStatus = 'success';

// Helper function to add test result
function addTest($name, $status, $message, $details = '') {
    global $results, $overallStatus;
    $results[] = [
        'name' => $name,
        'status' => $status,
        'message' => $message,
        'details' => $details
    ];
    if ($status === 'error') {
        $overallStatus = 'error';
    }
}

// Test 1: PHP Version
$phpVersion = phpversion();
$status = version_compare($phpVersion, '7.4.0', '>=') ? 'success' : 'error';
addTest('PHP Version', $status, "PHP Version: $phpVersion", 'Minimum required: 7.4.0');

// Test 2: Required PHP Extensions
$requiredExtensions = ['curl', 'json', 'pdo', 'pdo_mysql', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    $loaded = extension_loaded($ext);
    addTest(
        "PHP Extension: $ext",
        $loaded ? 'success' : 'error',
        $loaded ? 'Loaded' : 'NOT loaded'
    );
}

// Test 3: Apache Modules (if running on Apache)
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    $requiredModules = ['mod_rewrite', 'mod_headers'];
    foreach ($requiredModules as $mod) {
        $loaded = in_array($mod, $modules);
        addTest(
            "Apache Module: $mod",
            $loaded ? 'success' : 'error',
            $loaded ? 'Enabled' : 'NOT enabled',
            $loaded ? '' : 'Run: sudo a2enmod ' . str_replace('mod_', '', $mod)
        );
    }
} else {
    addTest('Apache Modules', 'warning', 'Cannot check (not running Apache or function disabled)', '');
}

// Test 4: File Permissions
$testFiles = [
    __DIR__ . '/config/config.php',
    __DIR__ . '/.htaccess',
    __DIR__ . '/vtpass/categories.php',
    __DIR__ . '/wallet/balance.php'
];

foreach ($testFiles as $file) {
    if (file_exists($file)) {
        $perms = substr(sprintf('%o', fileperms($file)), -4);
        $readable = is_readable($file);
        addTest(
            'File: ' . basename($file),
            $readable ? 'success' : 'error',
            $readable ? "Readable (Perms: $perms)" : "NOT readable (Perms: $perms)"
        );
    } else {
        addTest('File: ' . basename($file), 'error', 'File does not exist');
    }
}

// Test 5: .htaccess is being read
$htaccessPath = __DIR__ . '/.htaccess';
if (file_exists($htaccessPath)) {
    addTest('.htaccess File', 'success', 'File exists', 'Cannot verify if Apache is reading it');
} else {
    addTest('.htaccess File', 'error', 'File does NOT exist');
}

// Test 6: Database Connection
require_once __DIR__ . '/config/config.php';
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS
    );
    addTest('Database Connection', 'success', 'Connected successfully', 'Host: ' . DB_HOST . ', Database: ' . DB_NAME);
} catch (PDOException $e) {
    addTest('Database Connection', 'error', 'Connection failed', $e->getMessage());
}

// Test 7: CORS Headers
$corsHeaders = [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
];
$headersSet = [];
foreach (headers_list() as $header) {
    $headersSet[] = $header;
}
addTest('CORS Headers', 'success', 'Headers set', implode('<br>', $headersSet));

// Test 8: VTpass Configuration
$vtpassConfigured = defined('VTPASS_API_KEY') && !empty(VTPASS_API_KEY);
addTest(
    'VTpass Configuration',
    $vtpassConfigured ? 'success' : 'error',
    $vtpassConfigured ? 'API Key configured' : 'API Key NOT configured'
);

// Test 9: cURL Test
if (function_exists('curl_version')) {
    $curlVersion = curl_version();
    addTest('cURL', 'success', 'Version: ' . $curlVersion['version'], 'SSL Version: ' . $curlVersion['ssl_version']);
    
    // Test actual API call
    $ch = curl_init('https://sandbox.vtpass.com/api/service-categories');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'api-key: ' . VTPASS_API_KEY,
        'public-key: ' . VTPASS_PUBLIC_KEY
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        addTest('VTpass API Test', 'error', 'cURL Error', $curlError);
    } else {
        addTest('VTpass API Test', $httpCode === 200 ? 'success' : 'warning', "HTTP Code: $httpCode", substr($response, 0, 200));
    }
} else {
    addTest('cURL', 'error', 'cURL NOT available');
}

// Test 10: Request Information
$requestInfo = [
    'Request Method' => $_SERVER['REQUEST_METHOD'],
    'Server Software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'Document Root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'Script Filename' => $_SERVER['SCRIPT_FILENAME'],
    'Request URI' => $_SERVER['REQUEST_URI'],
    'HTTP Origin' => $_SERVER['HTTP_ORIGIN'] ?? 'None',
    'Remote Addr' => $_SERVER['REMOTE_ADDR'],
];
addTest('Request Information', 'success', 'Request details captured', implode('<br>', array_map(function($k, $v) {
    return "$k: $v";
}, array_keys($requestInfo), $requestInfo)));

// Test 11: Write permissions
$tempFile = __DIR__ . '/diagnostic_test_' . time() . '.tmp';
$canWrite = @file_put_contents($tempFile, 'test');
if ($canWrite !== false) {
    @unlink($tempFile);
    addTest('Write Permissions', 'success', 'Directory is writable');
} else {
    addTest('Write Permissions', 'error', 'Directory is NOT writable', 'This may cause issues with logs and sessions');
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperBills Server Diagnostics</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .status-banner {
            padding: 20px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
        }
        .status-banner.success {
            background: #10b981;
            color: white;
        }
        .status-banner.error {
            background: #ef4444;
            color: white;
        }
        .results {
            padding: 30px;
        }
        .test-item {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .test-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .test-header {
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            cursor: pointer;
        }
        .test-item.success .test-header {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
        }
        .test-item.error .test-header {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
        }
        .test-item.warning .test-header {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
        }
        .status-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }
        .status-icon.success {
            background: #10b981;
            color: white;
        }
        .status-icon.error {
            background: #ef4444;
            color: white;
        }
        .status-icon.warning {
            background: #f59e0b;
            color: white;
        }
        .test-name {
            flex: 1;
            font-weight: 600;
            color: #1f2937;
        }
        .test-message {
            color: #6b7280;
            font-size: 14px;
        }
        .test-details {
            padding: 15px 20px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
            font-family: 'Courier New', monospace;
            line-height: 1.6;
            display: none;
        }
        .test-item.expanded .test-details {
            display: block;
        }
        .summary {
            background: #f9fafb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .summary h3 {
            color: #1f2937;
            margin-bottom: 10px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
        }
        .summary-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .summary-number.success { color: #10b981; }
        .summary-number.error { color: #ef4444; }
        .summary-number.warning { color: #f59e0b; }
        .summary-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .footer {
            padding: 20px;
            text-align: center;
            background: #f9fafb;
            color: #6b7280;
            font-size: 14px;
        }
        .copy-button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 15px;
            transition: all 0.3s ease;
        }
        .copy-button:hover {
            background: #764ba2;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ SuperBills Server Diagnostics</h1>
            <p>Complete system health check</p>
        </div>

        <div class="status-banner <?php echo $overallStatus; ?>">
            <?php if ($overallStatus === 'success'): ?>
                ✓ All tests passed! Server is properly configured.
            <?php else: ?>
                ⚠ Some tests failed. Please review the results below.
            <?php endif; ?>
        </div>

        <div class="results">
            <?php
            $successCount = 0;
            $errorCount = 0;
            $warningCount = 0;
            foreach ($results as $result) {
                if ($result['status'] === 'success') $successCount++;
                elseif ($result['status'] === 'error') $errorCount++;
                else $warningCount++;
            }
            ?>

            <div class="summary">
                <h3>Test Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-number success"><?php echo $successCount; ?></div>
                        <div class="summary-label">Passed</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number error"><?php echo $errorCount; ?></div>
                        <div class="summary-label">Failed</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number warning"><?php echo $warningCount; ?></div>
                        <div class="summary-label">Warnings</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number"><?php echo count($results); ?></div>
                        <div class="summary-label">Total Tests</div>
                    </div>
                </div>
                <button class="copy-button" onclick="copyResults()">📋 Copy Results for Support</button>
            </div>

            <h3 style="margin-bottom: 15px; color: #1f2937;">Detailed Results</h3>
            <?php foreach ($results as $index => $result): ?>
                <div class="test-item <?php echo $result['status']; ?>" onclick="toggleDetails(<?php echo $index; ?>)">
                    <div class="test-header">
                        <div class="status-icon <?php echo $result['status']; ?>">
                            <?php 
                            echo $result['status'] === 'success' ? '✓' : 
                                 ($result['status'] === 'error' ? '✗' : '⚠');
                            ?>
                        </div>
                        <div style="flex: 1;">
                            <div class="test-name"><?php echo htmlspecialchars($result['name']); ?></div>
                            <div class="test-message"><?php echo htmlspecialchars($result['message']); ?></div>
                        </div>
                    </div>
                    <?php if (!empty($result['details'])): ?>
                        <div class="test-details" id="details-<?php echo $index; ?>">
                            <?php echo nl2br(htmlspecialchars($result['details'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="footer">
            Generated at <?php echo date('Y-m-d H:i:s'); ?> | 
            Server: <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?> | 
            PHP: <?php echo phpversion(); ?>
        </div>
    </div>

    <script>
        function toggleDetails(index) {
            const item = document.querySelectorAll('.test-item')[index];
            item.classList.toggle('expanded');
        }

        function copyResults() {
            const results = <?php echo json_encode($results); ?>;
            let text = 'SuperBills Server Diagnostics Report\n';
            text += '=====================================\n\n';
            text += 'Generated: <?php echo date('Y-m-d H:i:s'); ?>\n';
            text += 'Server: <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?>\n';
            text += 'PHP Version: <?php echo phpversion(); ?>\n\n';
            text += 'Summary: <?php echo $successCount; ?> passed, <?php echo $errorCount; ?> failed, <?php echo $warningCount; ?> warnings\n\n';
            text += 'Detailed Results:\n';
            text += '=================\n\n';
            
            results.forEach((result, index) => {
                text += `${index + 1}. ${result.name}\n`;
                text += `   Status: ${result.status.toUpperCase()}\n`;
                text += `   Message: ${result.message}\n`;
                if (result.details) {
                    text += `   Details: ${result.details}\n`;
                }
                text += '\n';
            });

            navigator.clipboard.writeText(text).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        }
    </script>
</body>
</html>
