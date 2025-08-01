-- Add new columns to the clients table
ALTER TABLE clients
ADD COLUMN company_name VARCHAR(255),
ADD COLUMN contact_person VARCHAR(255),
ADD COLUMN industry VARCHAR(255),
ADD COLUMN website VARCHAR(255),
ADD COLUMN notes TEXT;

-- Add new columns to the subscriptions table
ALTER TABLE subscriptions
ADD COLUMN next_billing_date DATE,
ADD COLUMN trial_end_date DATE,
ADD COLUMN auto_renew BOOLEAN DEFAULT TRUE,
ADD COLUMN cancellation_date DATE,
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN payment_method_details TEXT;

-- Add new columns to the invoices table
ALTER TABLE invoices
ADD COLUMN tax_rate DECIMAL(5, 4) DEFAULT 0.00,
ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Add new columns to the payments table
ALTER TABLE payments
ADD COLUMN reference_number VARCHAR(255),
ADD COLUMN fees DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN notes TEXT;

-- Create a table for audit logs (optional but good for tracking changes)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(255), -- User who made the change
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
