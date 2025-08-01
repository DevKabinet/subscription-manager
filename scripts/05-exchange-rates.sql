CREATE TABLE IF NOT EXISTS exchange_rates (
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(18, 8) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_manual BOOLEAN DEFAULT FALSE,
    manual_updated_at TIMESTAMP WITH TIME ZONE,
    manual_updated_by VARCHAR(255),
    PRIMARY KEY (base_currency, target_currency)
);

CREATE TABLE IF NOT EXISTS exchange_rate_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    old_rate DECIMAL(18, 8) NOT NULL,
    new_rate DECIMAL(18, 8) NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- 'manual_update', 'api_update', 'new_entry'
    updated_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial exchange rates if the table is empty
INSERT INTO exchange_rates (base_currency, target_currency, rate, is_manual) VALUES
('USD', 'USD', 1.0, FALSE),
('USD', 'EUR', 0.92, FALSE),
('USD', 'GBP', 0.79, FALSE),
('USD', 'JPY', 155.00, FALSE),
('USD', 'CAD', 1.37, FALSE),
('USD', 'AUD', 1.50, FALSE),
('USD', 'CHF', 0.90, FALSE),
('USD', 'CNY', 7.25, FALSE),
('USD', 'INR', 83.50, FALSE)
ON CONFLICT (base_currency, target_currency) DO NOTHING;
