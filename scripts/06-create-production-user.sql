-- Create a new user with a strong password (replace 'your_secure_password' with an actual strong password)
-- This user will be used by the application to connect to the database.
CREATE USER app_user WITH PASSWORD 'your_secure_password';

-- Grant necessary privileges to the new user
-- This grants all privileges on tables, sequences, and functions in the public schema.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- Optionally, set default privileges for future tables/sequences/functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO app_user;

-- Revoke some privileges from the public role if desired for stricter security
-- REVOKE ALL ON DATABASE your_database_name FROM PUBLIC;
-- REVOKE ALL ON SCHEMA public FROM PUBLIC;
-- GRANT CONNECT ON DATABASE your_database_name TO PUBLIC;
-- GRANT USAGE ON SCHEMA public TO PUBLIC;
