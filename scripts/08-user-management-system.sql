-- Add a new table for user roles if not already present (though 'role' column is in 'users' table)
-- This table could be used for more granular permissions in the future.
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert default roles if they don't exist
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('user') ON CONFLICT (name) DO NOTHING;

-- Add a column to users table to store the role ID instead of role name directly
-- This creates a foreign key relationship to the 'roles' table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL;

-- Update existing users to link them to the new roles table based on their current 'role' name
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = users.role)
WHERE role_id IS NULL;

-- Make the 'role_id' column NOT NULL if all existing users have been migrated
-- ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- Optionally, remove the old 'role' column if it's no longer needed
-- ALTER TABLE users DROP COLUMN role;

-- Create a table for user activity logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(255) NOT NULL, -- e.g., 'login', 'logout', 'client_created', 'invoice_paid'
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_ip_address VARCHAR(45) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activity_logs (user_id, activity_type, description, ip_address, user_agent)
    VALUES (p_user_id, p_activity_type, p_description, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql;

-- Example of how to use the logging function (can be called from application logic)
-- SELECT log_user_activity('user_uuid_here', 'login', 'User logged in successfully', '192.168.1.1', 'Mozilla/5.0...');
