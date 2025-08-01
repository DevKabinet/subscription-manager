-- Create a new user for the application with limited privileges
CREATE USER app_user WITH PASSWORD 'your_secure_password';

-- Grant connect privilege to the database
GRANT CONNECT ON DATABASE postgres TO app_user;

-- Grant usage privilege on schemas
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant SELECT, INSERT, UPDATE, DELETE privileges on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant usage on sequences (for UUIDs or auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Optionally, set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- IMPORTANT: Replace 'your_secure_password' with a strong, unique password.
-- In a production environment, manage this password securely (e.g., using environment variables).
