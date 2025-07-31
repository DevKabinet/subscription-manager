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
FROM users WHERE email = 'tester@example.com';

INSERT INTO subscriptions (user_id, name, description, price, billing_cycle)
SELECT id, 'Premium Plan', 'Premium subscription with advanced features', 59.99, 'monthly'
FROM users WHERE email = 'tester@example.com';

-- Insert sample clients
INSERT INTO clients (user_id, name, email, phone, address)
SELECT id, 'John Doe', 'john@example.com', '+1 (555) 987-6543', '456 Client Ave, City, State 12345'
FROM users WHERE email = 'tester@example.com';

INSERT INTO clients (user_id, name, email, phone, address)
SELECT id, 'Jane Smith', 'jane@example.com', '+1 (555) 456-7890', '789 Customer Blvd, City, State 12345'
FROM users WHERE email = 'tester@example.com';
