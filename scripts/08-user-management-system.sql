-- User Management System with Roles
-- This script creates the user management system with role-based access control

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id) DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES 
('admin', 'Administrator with full system access', '{"users": {"create": true, "read": true, "update": true, "delete": true}, "settings": {"manage": true}, "invoices": {"create": true, "read": true, "update": true, "delete": true}, "payments": {"create": true, "read": true, "update": true, "delete": true}}'),
('manager', 'Manager with limited administrative access', '{"users": {"create": false, "read": true, "update": false, "delete": false}, "settings": {"manage": false}, "invoices": {"create": true, "read": true, "update": true, "delete": false}, "payments": {"create": true, "read": true, "update": true, "delete": false}}'),
('user', 'Standard user with basic access', '{"users": {"create": false, "read": false, "update": false, "delete": false}, "settings": {"manage": false}, "invoices": {"create": true, "read": true, "update": false, "delete": false}, "payments": {"create": true, "read": true, "update": false, "delete": false}}')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role_id) VALUES 
('admin@company.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'System', 'Administrator', 1),
('manager@company.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'John', 'Manager', 2),
('user@company.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Jane', 'User', 3)
ON CONFLICT (email) DO NOTHING;

-- Create user activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Update trigger for users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id INTEGER,
    p_action VARCHAR(100),
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activity_log (user_id, action, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql;

-- Function to get user with role information
CREATE OR REPLACE FUNCTION get_user_with_role(p_email VARCHAR(255))
RETURNS TABLE (
    id INTEGER,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id INTEGER,
    role_name VARCHAR(50),
    role_permissions JSONB,
    is_active BOOLEAN,
    last_login TIMESTAMP,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.password_hash,
        u.first_name,
        u.last_name,
        u.role_id,
        r.name as role_name,
        r.permissions as role_permissions,
        u.is_active,
        u.last_login,
        u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = p_email AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;
