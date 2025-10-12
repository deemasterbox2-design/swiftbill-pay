-- SuperBills Database Schema
CREATE DATABASE IF NOT EXISTS superbills CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE superbills;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    google_id VARCHAR(255) DEFAULT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
) ENGINE=InnoDB;

-- Wallets table (Naira and Espees in single row)
CREATE TABLE wallets (
    user_id INT PRIMARY KEY,
    naira_balance DECIMAL(12,2) DEFAULT 0.00,
    espees_balance DECIMAL(12,2) DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Service configuration (fees and enabled payment methods per service)
CREATE TABLE service_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id VARCHAR(100) UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    convenience_fee DECIMAL(10,2) DEFAULT 0.00,
    convenience_fee_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
    allow_naira TINYINT(1) DEFAULT 1,
    allow_espees TINYINT(1) DEFAULT 1,
    allow_wallet TINYINT(1) DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Payment gateway settings (Monnify, Flutterwave, Paystack)
CREATE TABLE payment_gateway_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gateway_name ENUM('monnify', 'flutterwave', 'paystack') UNIQUE NOT NULL,
    is_enabled TINYINT(1) DEFAULT 0,
    api_key TEXT,
    secret_key TEXT,
    public_key TEXT,
    webhook_url VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Payment type settings (Naira/Espees global enable/disable)
CREATE TABLE payment_type_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_type ENUM('naira', 'espees') UNIQUE NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    service_id VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) DEFAULT NULL,
    biller_code VARCHAR(100) DEFAULT NULL,
    variation_code VARCHAR(100) DEFAULT NULL,
    amount DECIMAL(12,2) NOT NULL,
    convenience_fee DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    currency ENUM('Naira', 'Espees') NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT NULL,
    status VARCHAR(50) NOT NULL,
    response_data TEXT,
    token VARCHAR(255) DEFAULT NULL,
    recipient_email VARCHAR(100) DEFAULT NULL,
    recipient_phone VARCHAR(20) DEFAULT NULL,
    user_ip VARCHAR(45) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_request_id (request_id)
) ENGINE=InnoDB;

-- User details suggestions (track frequently used details)
CREATE TABLE user_details_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    detail_type ENUM('phone', 'email', 'meter', 'smartcard', 'decoder') NOT NULL,
    detail_value VARCHAR(255) NOT NULL,
    usage_count INT DEFAULT 1,
    last_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_detail (user_id, detail_type, detail_value),
    INDEX idx_user_id (user_id),
    INDEX idx_usage_count (usage_count DESC)
) ENGINE=InnoDB;

-- Loyalty points table
CREATE TABLE loyalty_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_id INT NOT NULL,
    points DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- Admin settings table
CREATE TABLE admin_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default settings
INSERT INTO admin_settings (setting_key, setting_value) VALUES
('loyalty_enabled', '1'),
('loyalty_percentage', '1.0'),
('guest_purchase_enabled', '1'),
('brevo_api_key', ''),
('brevo_sender_email', 'noreply@superbills.org'),
('brevo_sender_name', 'SuperBills');

-- Insert default payment type settings
INSERT INTO payment_type_settings (payment_type, is_enabled) VALUES
('naira', 1),
('espees', 1);

-- Insert default payment gateway settings
INSERT INTO payment_gateway_settings (gateway_name, is_enabled) VALUES
('monnify', 0),
('flutterwave', 0),
('paystack', 0);

-- Espees payment sessions (for tracking Espees transactions)
CREATE TABLE espees_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    payment_ref VARCHAR(255) UNIQUE NOT NULL,
    tab_instance VARCHAR(20) NOT NULL,
    invoice_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'approved', 'failed') DEFAULT 'pending',
    response_data TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_payment_ref (payment_ref),
    INDEX idx_tab_instance (tab_instance)
) ENGINE=InnoDB;
