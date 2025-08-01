-- Run all migration files in order
-- This script combines all previous migrations for a fresh database setup

-- =====================================================
-- 01: Create base tables
-- =====================================================

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_tester BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  tax_number VARCHAR(100),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create client_subscriptions table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  invoice_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, subscription_id)
);

-- =====================================================
-- 02: Seed initial data
-- =====================================================

-- Insert a test user
INSERT INTO users (email, password_hash, is_tester) 
VALUES ('tester@example.com', 'hashed_password_here', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert default company settings for the test user
INSERT INTO company_settings (user_id, company_name, address, phone, email, tax_number)
SELECT id, 'Your Company Name', '123 Business St, City, State 12345', '+1 (555) 123-4567', 'contact@yourcompany.com', 'TAX123456789'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (user_id, name, description, price, billing_cycle)
SELECT id, 'Basic Plan', 'Basic subscription with essential features', 29.99, 'monthly'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO subscriptions (user_id, name, description, price, billing_cycle)
SELECT id, 'Premium Plan', 'Premium subscription with advanced features', 59.99, 'monthly'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO subscriptions (user_id, name, description, price, billing_cycle)
SELECT id, 'Enterprise Plan', 'Enterprise subscription with all features', 99.99, 'monthly'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

-- Insert sample clients
INSERT INTO clients (user_id, name, email, phone, address)
SELECT id, 'John Doe', 'john@example.com', '+1 (555) 987-6543', '456 Client Ave, City, State 12345'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO clients (user_id, name, email, phone, address)
SELECT id, 'Jane Smith', 'jane@example.com', '+1 (555) 456-7890', '789 Customer Blvd, City, State 12345'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO clients (user_id, name, email, phone, address)
SELECT id, 'Alice Johnson', 'alice@example.com', '+1 (555) 321-9876', '321 Business St, City, State 12345'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO clients (user_id, name, email, phone, address)
SELECT id, 'Bob Wilson', 'bob@example.com', '+1 (555) 654-3210', '654 Commerce Ave, City, State 12345'
FROM users WHERE email = 'tester@example.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 03: Insert sample client subscriptions
-- =====================================================

-- Insert sample client subscriptions
INSERT INTO client_subscriptions (client_id, subscription_id, start_date, invoice_number)
SELECT 1, 1, '2024-01-01', 'INV-2024-001'
WHERE NOT EXISTS (SELECT 1 FROM client_subscriptions WHERE client_id = 1 AND subscription_id = 1);

INSERT INTO client_subscriptions (client_id, subscription_id, start_date, invoice_number)
SELECT 2, 2, '2024-01-05', 'INV-2024-002'
WHERE NOT EXISTS (SELECT 1 FROM client_subscriptions WHERE client_id = 2 AND subscription_id = 2);

INSERT INTO client_subscriptions (client_id, subscription_id, start_date, invoice_number)
SELECT 3, 1, '2024-01-10', 'INV-2024-003'
WHERE NOT EXISTS (SELECT 1 FROM client_subscriptions WHERE client_id = 3 AND subscription_id = 1);

INSERT INTO client_subscriptions (client_id, subscription_id, start_date, invoice_number)
SELECT 4, 2, '2024-01-15', 'INV-2024-004'
WHERE NOT EXISTS (SELECT 1 FROM client_subscriptions WHERE client_id = 4 AND subscription_id = 2);

-- =====================================================
-- 04: Create payments system
-- =====================================================

-- Drop and recreate payments table with enhanced features
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  client_subscription_id INTEGER REFERENCES client_subscriptions(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100), -- bank transfer reference, check number, etc.
  notes TEXT,
  attachment_url TEXT, -- URL to uploaded receipt/proof
  attachment_name VARCHAR(255), -- original filename
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create recurring_payment_schedule table
CREATE TABLE IF NOT EXISTS recurring_payment_schedule (
  id SERIAL PRIMARY KEY,
  client_subscription_id INTEGER REFERENCES client_subscriptions(id) ON DELETE CASCADE,
  next_payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample recurring schedules
INSERT INTO recurring_payment_schedule (client_subscription_id, next_payment_date, amount, billing_cycle)
VALUES 
  (1, '2025-02-01', 29.99, 'monthly'),
  (2, '2025-02-05', 59.99, 'monthly'),
  (3, '2025-02-10', 29.99, 'monthly'),
  (4, '2025-02-15', 59.99, 'monthly')
ON CONFLICT DO NOTHING;

-- Insert sample payments (including future pending ones)
INSERT INTO payments (client_subscription_id, payment_date, due_date, amount, status, payment_method)
VALUES 
  (1, '2024-01-01', '2024-01-15', 29.99, 'paid', 'Cash'),
  (1, '2025-01-01', '2025-01-15', 29.99, 'pending', NULL),
  (1, '2025-02-01', '2025-02-15', 29.99, 'pending', NULL),
  (2, '2024-01-05', '2024-01-20', 59.99, 'paid', 'Bank Transfer'),
  (2, '2025-01-05', '2025-01-20', 59.99, 'pending', NULL),
  (3, '2024-01-10', '2024-01-25', 29.99, 'paid', 'Cash'),
  (3, '2025-01-10', '2025-01-25', 29.99, 'overdue', NULL),
  (4, '2024-01-15', '2024-01-30', 59.99, 'paid', 'Credit Card'),
  (4, '2025-01-15', '2025-01-30', 59.99, 'pending', NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 05: Create exchange rates system
-- =====================================================

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_manual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index to prevent duplicate currency pairs
CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rates_currencies 
ON exchange_rates(base_currency, target_currency);

-- Insert initial exchange rates (will be updated by API)
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_manual) 
VALUES 
  ('USD', 'USD', 1.000000, false),
  ('USD', 'EUR', 0.850000, false),
  ('USD', 'SRD', 35.500000, false)
ON CONFLICT (base_currency, target_currency) DO NOTHING;

-- Create exchange_rate_history table for tracking changes
CREATE TABLE IF NOT EXISTS exchange_rate_history (
  id SERIAL PRIMARY KEY,
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  old_rate DECIMAL(10,6),
  new_rate DECIMAL(10,6) NOT NULL,
  change_type VARCHAR(20) NOT NULL, -- 'api_update', 'manual_update'
  changed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 06: Create indexes for performance
-- =====================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client_id ON client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_subscription_id ON client_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_subscription_id ON payments(client_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_recurring_payment_schedule_client_subscription_id ON recurring_payment_schedule(client_subscription_id);

-- =====================================================
-- Migration completed successfully
-- =====================================================

-- Insert migration log
CREATE TABLE IF NOT EXISTS migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migration_log (migration_name) VALUES ('00-run-all-migrations.sql');

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE 'Database migration completed successfully!';
  RAISE NOTICE 'Tables created: users, company_settings, clients, subscriptions, client_subscriptions, payments, recurring_payment_schedule, exchange_rates, exchange_rate_history, migration_log';
  RAISE NOTICE 'Sample data inserted for testing';
  RAISE NOTICE 'Indexes created for performance optimization';
END $$;
