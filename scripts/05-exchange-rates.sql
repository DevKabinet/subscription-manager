-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_manual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index to prevent duplicate currency pairs
CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rates_currencies 
ON exchange_rates(base_currency, target_currency);

-- Insert initial exchange rates (will be updated by API)
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_manual) 
VALUES 
  ('USD', 'USD', 1.000000, false),
  ('USD', 'EUR', 0.850000, false),
  ('USD', 'SRD', 35.500000, false)
ON CONFLICT (base_currency, target_currency) DO NOTHING;

-- Create exchange_rate_history table for tracking changes
CREATE TABLE IF NOT EXISTS exchange_rate_history (
  id SERIAL PRIMARY KEY,
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  old_rate DECIMAL(10,6),
  new_rate DECIMAL(10,6) NOT NULL,
  change_type VARCHAR(20) NOT NULL, -- 'api_update', 'manual_update'
  changed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
