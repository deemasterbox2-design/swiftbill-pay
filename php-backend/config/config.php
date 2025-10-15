<?php
// File: config.php | Path: php-backend/config/config.php
/**
 * SuperBills Backend Configuration
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'supeqczx_superbills');
define('DB_USER', 'supeqczx_prolificme');
define('DB_PASS', 'prolificme2@');

// VTpass API Configuration
define('VTPASS_API_KEY', '31c54d45509642bab3124964d58f1969');
define('VTPASS_PUBLIC_KEY', 'PK_518ea792eb1029f94b176a8809305822c85b028f54b');
define('VTPASS_SECRET_KEY', 'SK_718e844d0a90d172e392f7dc23c985a41eb6123bc82');
define('VTPASS_BASE_URL', 'https://sandbox.vtpass.com/api'); // Change to https://vtpass.com/api for production

// Espees API Configuration
define('ESPEES_API_KEY', 'P0MjFmXmPf3LknSJZKpNTac8BUPFt4Wk6aDOaU8d');
define('ESPEES_BASE_URL', 'https://api.espees.org/v2');
define('ESPEES_PAYMENT_URL', 'https://payment.espees.org/pay');
define('ESPEES_MERCHANT_WALLET', '0xf7c609f4a25244f7847cb4f7049e88e89424de8d');

// App Configuration
define('APP_URL', 'https://superbills.lovable.app'); // Your React app URL
define('API_URL', 'https://smcgame.com/api'); // This API URL
define('TIMEZONE', 'Africa/Lagos');

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 in production with HTTPS
session_start();

// Set timezone
date_default_timezone_set(TIMEZONE);

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
