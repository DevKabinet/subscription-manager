-- Create a production user (non-tester)
-- This script creates a regular user account for production use

INSERT INTO users (email, password_hash, is_tester) 
VALUES ('admin@company.com', 'production_password_hash', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Insert default company settings for the production user
INSERT INTO company_settings (user_id, company_name, address, phone, email, tax_number)
SELECT id, 'Your Company Name', '123 Business St, City, State 12345', '+1 (555) 123-4567', 'contact@yourcompany.com', 'TAX123456789'
FROM users WHERE email = 'admin@company.com'
ON CONFLICT DO NOTHING;

-- Create some basic subscription plans for the production user
INSERT INTO subscriptions (user_id, name, description, price, billing_cycle)
SELECT id, 'Starter Plan', 'Perfect for small businesses getting started', 19.99, 'monthly'
FROM users WHERE email = 'admin@company.com';

INSERT INTO subscriptions (user_id, name, description, price, billing_cycle)
SELECT id, 'Professional Plan', 'Ideal for growing businesses', 49.99, 'monthly'
FROM users WHERE email = 'admin@company.com';

INSERT INTO subscriptions (user_id, name, description, price, billing_cycle)
SELECT id, 'Enterprise Plan', 'Full-featured plan for large organizations', 99.99, 'monthly'
FROM users WHERE email = 'admin@company.com';

-- Log the creation
INSERT INTO migration_log (migration_name) VALUES ('06-create-production-user.sql');

DO $$
BEGIN
  RAISE NOTICE 'Production user created successfully!';
  RAISE NOTICE 'Email: admin@company.com';
  RAISE NOTICE 'User type: Production (non-tester)';
  RAISE NOTICE 'Default subscription plans created';
END $$;
