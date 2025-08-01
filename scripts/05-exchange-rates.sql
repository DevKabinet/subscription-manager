CREATE TABLE IF NOT EXISTS exchange_rates (
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(18, 8) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_manual BOOLEAN DEFAULT FALSE,
    manual_updated_at TIMESTAMP WITH TIME ZONE,
    manual_updated_by VARCHAR(255),
    PRIMARY KEY (base_currency, target_currency)
);

CREATE TABLE IF NOT EXISTS exchange_rate_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    old_rate DECIMAL(18, 8) NOT NULL,
    new_rate DECIMAL(18, 8) NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- 'manual_update', 'api_update', 'new_entry'
    updated_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial exchange rates (example, replace with real data or API fetch)
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_manual) VALUES
('USD', 'EUR', 0.92),
('USD', 'GBP', 0.79),
('USD', 'JPY', 150.00),
('USD', 'CAD', 1.35),
('USD', 'AUD', 1.52),
('USD', 'CHF', 0.90),
('USD', 'CNY', 7.20),
('USD', 'INR', 83.00),
('USD', 'SRD', 36.00); -- Example for SRD

-- Add a self-referencing rate for USD to USD
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_manual) VALUES
('USD', 'USD', 1.00)
ON CONFLICT (base_currency, target_currency) DO NOTHING;
