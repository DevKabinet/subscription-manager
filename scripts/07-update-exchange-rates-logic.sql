-- Function to update or insert exchange rates
CREATE OR REPLACE FUNCTION upsert_exchange_rate(
    p_base_currency VARCHAR(3),
    p_target_currency VARCHAR(3),
    p_rate DECIMAL(18, 8),
    p_is_manual BOOLEAN,
    p_updated_by VARCHAR(255) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    old_rate_val DECIMAL(18, 8);
    change_type_val VARCHAR(50);
BEGIN
    -- Get the old rate if it exists
    SELECT rate INTO old_rate_val
    FROM exchange_rates
    WHERE base_currency = p_base_currency AND target_currency = p_target_currency;

    IF old_rate_val IS NOT NULL THEN
        -- Update existing rate
        UPDATE exchange_rates
        SET
            rate = p_rate,
            last_updated = CURRENT_TIMESTAMP,
            is_manual = p_is_manual,
            manual_updated_at = CASE WHEN p_is_manual THEN CURRENT_TIMESTAMP ELSE NULL END,
            manual_updated_by = CASE WHEN p_is_manual THEN p_updated_by ELSE NULL END
        WHERE base_currency = p_base_currency AND target_currency = p_target_currency;

        -- Determine change type for history
        IF p_is_manual THEN
            change_type_val := 'manual_update';
        ELSE
            change_type_val := 'api_update';
        END IF;

        -- Insert into history
        INSERT INTO exchange_rate_history (base_currency, target_currency, old_rate, new_rate, change_type, updated_by, notes)
        VALUES (p_base_currency, p_target_currency, old_rate_val, p_rate, change_type_val, p_updated_by,
                CASE WHEN p_is_manual THEN 'Manual update' ELSE 'API update' END);
    ELSE
        -- Insert new rate
        INSERT INTO exchange_rates (base_currency, target_currency, rate, is_manual, manual_updated_at, manual_updated_by)
        VALUES (p_base_currency, p_target_currency, p_rate, p_is_manual,
                CASE WHEN p_is_manual THEN CURRENT_TIMESTAMP ELSE NULL END,
                CASE WHEN p_is_manual THEN p_updated_by ELSE NULL END);

        -- Insert into history for new entry
        INSERT INTO exchange_rate_history (base_currency, target_currency, old_rate, new_rate, change_type, updated_by, notes)
        VALUES (p_base_currency, p_target_currency, 0, p_rate, 'new_entry', p_updated_by, 'New rate added');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Example of how to call the function (for testing/manual updates)
-- SELECT upsert_exchange_rate('USD', 'EUR', 0.93, TRUE, 'Admin User');
-- SELECT upsert_exchange_rate('USD', 'JPY', 151.23, FALSE);
