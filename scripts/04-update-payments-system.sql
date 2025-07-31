-- Update payments table to support recurring payments and attachments
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
  (2, '2025-02-05', 59.99, 'monthly');

-- Insert sample payments (including future pending ones)
INSERT INTO payments (client_subscription_id, payment_date, due_date, amount, status, payment_method)
VALUES 
  (1, '2024-01-01', '2024-01-15', 29.99, 'paid', 'Cash'),
  (1, '2025-01-01', '2025-01-15', 29.99, 'pending', NULL),
  (1, '2025-02-01', '2025-02-15', 29.99, 'pending', NULL),
  (2, '2024-01-05', '2024-01-20', 59.99, 'paid', 'Bank Transfer'),
  (2, '2025-01-05', '2025-01-20', 59.99, 'pending', NULL);
