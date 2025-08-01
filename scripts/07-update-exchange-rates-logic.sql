-- Function to log exchange rate changes to history table
CREATE OR REPLACE FUNCTION log_exchange_rate_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO exchange_rate_history (
            base_currency,
            target_currency,
            old_rate,
            new_rate,
            change_type,
            updated_by,
            notes
        ) VALUES (
            NEW.base_currency,
            NEW.target_currency,
            OLD.rate,
            NEW.rate,
            CASE
                WHEN NEW.is_manual = TRUE AND OLD.is_manual = FALSE THEN 'manual_update'
                WHEN NEW.is_manual = FALSE AND OLD.is_manual = TRUE THEN 'api_revert'
                ELSE 'api_update' -- Assuming non-manual updates are API updates
            END,
            NEW.manual_updated_by,
            CASE
                WHEN NEW.is_manual = TRUE AND OLD.is_manual = FALSE THEN 'Rate manually updated from ' || OLD.rate || ' to ' || NEW.rate
                WHEN NEW.is_manual = FALSE AND OLD.is_manual = TRUE THEN 'Manual rate reverted to API rate from ' || OLD.rate || ' to ' || NEW.rate
                ELSE 'Rate updated by API from ' || OLD.rate || ' to ' || NEW.rate
            END
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO exchange_rate_history (
            base_currency,
            target_currency,
            old_rate,
            new_rate,
            change_type,
            updated_by,
            notes
        ) VALUES (
            NEW.base_currency,
            NEW.target_currency,
            0, -- No old rate for new entries
            NEW.rate,
            'new_entry',
            NEW.manual_updated_by,
            'New exchange rate added: ' || NEW.base_currency || ' to ' || NEW.target_currency || ' at ' || NEW.rate
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid conflicts during re-creation
DROP TRIGGER IF EXISTS exchange_rates_audit_trigger ON exchange_rates;

-- Create a trigger to call the function after INSERT or UPDATE on exchange_rates
CREATE TRIGGER exchange_rates_audit_trigger
AFTER INSERT OR UPDATE ON exchange_rates
FOR EACH ROW
WHEN (NEW.rate IS DISTINCT FROM OLD.rate OR TG_OP = 'INSERT') -- Only trigger if rate changes or it's a new insert
EXECUTE FUNCTION log_exchange_rate_change();

-- Add a column to store the API source if needed
ALTER TABLE exchange_rates
ADD COLUMN api_source VARCHAR(255);

-- Update existing rates to mark them as non-manual if they were seeded
UPDATE exchange_rates
SET is_manual = FALSE, manual_updated_at = NULL, manual_updated_by = NULL
WHERE is_manual IS NULL; -- Or any other condition that identifies seeded data
