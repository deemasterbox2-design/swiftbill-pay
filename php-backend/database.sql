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

-- Wallets table (Naira and Espees)
CREATE TABLE wallets (
    user_id INT NOT NULL,
    currency ENUM('Naira', 'Espees') NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, currency),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    amount DECIMAL(10,2) NOT NULL,
    currency ENUM('Naira', 'Espees') NOT NULL,
    payment_method ENUM('naira', 'espees', 'wallet') NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_data TEXT,
    user_ip VARCHAR(45) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
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

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value) VALUES
('naira_payment_enabled', '1'),
('espees_payment_enabled', '1'),
('wallet_payment_enabled', '1'),
('loyalty_enabled', '1'),
('loyalty_percentage', '1.0'),
('guest_purchase_enabled', '1');

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
