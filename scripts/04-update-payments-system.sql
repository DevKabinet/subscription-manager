-- Add a 'status_history' column to the payments table to track status changes
ALTER TABLE payments
ADD COLUMN status_history JSONB DEFAULT '[]'::jsonb;

-- Update existing payments to include initial status in history
UPDATE payments
SET status_history = jsonb_build_array(jsonb_build_object(
    'status', status,
    'timestamp', created_at,
    'notes', 'Initial status'
));

-- Create a function to update status and log to history
CREATE OR REPLACE FUNCTION update_payment_status_and_history()
RETURNS TRIGGER AS $$
BEGIN
    NEW.status_history = OLD.status_history || jsonb_build_object(
        'status', NEW.status,
        'timestamp', NOW(),
        'notes', 'Status updated'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before update on payments
CREATE OR TRIGGER payment_status_update_trigger
BEFORE UPDATE OF status ON payments
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION update_payment_status_and_history();

-- Add a 'payment_gateway' column to payments table
ALTER TABLE payments
ADD COLUMN payment_gateway VARCHAR(255);

-- Add a column to payments to store the payment gateway's customer ID
ALTER TABLE payments
ADD COLUMN customer_id VARCHAR(255);

-- Add a column to payments to store the payment gateway's subscription ID
ALTER TABLE payments
ADD COLUMN subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Add a column to payments to store the payment gateway's charge ID
ALTER TABLE payments
ADD COLUMN charge_id VARCHAR(255);

-- Add a column to payments to store the payment gateway's refund ID
ALTER TABLE payments
ADD COLUMN refund_id VARCHAR(255);

-- Add a column to payments to store the payment gateway's status
ALTER TABLE payments
ADD COLUMN gateway_status VARCHAR(50);

-- Add a column to payments to store any metadata from the payment gateway
ALTER TABLE payments
ADD COLUMN metadata JSONB;

-- Add a 'next_payment_due_date' to subscriptions for better tracking
ALTER TABLE subscriptions
ADD COLUMN next_payment_due_date DATE;

-- Update existing subscriptions with a dummy next_payment_due_date for active ones
UPDATE subscriptions
SET next_payment_due_date = start_date + INTERVAL '1 month'
WHERE status = 'active' AND billing_cycle = 'monthly';

UPDATE subscriptions
SET next_payment_due_date = start_date + INTERVAL '1 year'
WHERE status = 'active' AND billing_cycle = 'annually';

-- Create a new table for payment methods (e.g., credit cards, bank accounts)
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL, -- e.g., 'card', 'bank_account'
    last_four VARCHAR(4),
    brand VARCHAR(50), -- e.g., 'Visa', 'MasterCard'
    expiration_month INTEGER,
    expiration_year INTEGER,
    customer_payment_method_id VARCHAR(255) UNIQUE NOT NULL, -- ID from payment gateway
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a column to invoices to store the payment method used for that invoice
ALTER TABLE invoices
ADD COLUMN payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;

-- Add a column to subscriptions to store the default payment method for recurring payments
ALTER TABLE subscriptions
ADD COLUMN default_payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;

-- Add a column to track the next billing date for subscriptions
ALTER TABLE subscriptions
ADD COLUMN next_billing_date DATE;

-- Update existing subscriptions to set a dummy next_billing_date
UPDATE subscriptions
SET next_billing_date = (start_date + INTERVAL '1 month')::date
WHERE billing_cycle = 'monthly' AND status = 'active';

UPDATE subscriptions
SET next_billing_date = (start_date + INTERVAL '1 year')::date
WHERE billing_cycle = 'annually' AND status = 'active';
