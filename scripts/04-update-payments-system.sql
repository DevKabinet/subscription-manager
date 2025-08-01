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
