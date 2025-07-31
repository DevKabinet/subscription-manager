-- Add client_subscriptions table for linking clients to subscriptions
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  invoice_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, subscription_id)
);

-- Insert sample client subscriptions
INSERT INTO client_subscriptions (client_id, subscription_id, start_date, invoice_number)
SELECT 1, 1, '2024-01-01', 'INV-2024-001'
WHERE NOT EXISTS (SELECT 1 FROM client_subscriptions WHERE client_id = 1 AND subscription_id = 1);

INSERT INTO client_subscriptions (client_id, subscription_id, start_date, invoice_number)
SELECT 2, 2, '2024-01-05', 'INV-2024-002'
WHERE NOT EXISTS (SELECT 1 FROM client_subscriptions WHERE client_id = 2 AND subscription_id = 2);
