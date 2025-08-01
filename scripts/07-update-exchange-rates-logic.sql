-- Update exchange rates table to better track manual changes
-- Add a column to track when manual changes were made

ALTER TABLE exchange_rates 
ADD COLUMN IF NOT EXISTS manual_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS manual_updated_by VARCHAR(255);

-- Update exchange_rate_history to include more details
ALTER TABLE exchange_rate_history 
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create a function to check if a rate was manually updated recently
CREATE OR REPLACE FUNCTION is_manually_updated_recently(
  p_base_currency VARCHAR(3),
  p_target_currency VARCHAR(3),
  p_hours_threshold INTEGER DEFAULT 24
) RETURNS BOOLEAN AS $$
DECLARE
  manual_update_time TIMESTAMP;
BEGIN
  SELECT manual_updated_at INTO manual_update_time
  FROM exchange_rates 
  WHERE base_currency = p_base_currency 
    AND target_currency = p_target_currency 
    AND is_manual = TRUE;
  
  -- If no manual update time, return false
  IF manual_update_time IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if manual update was within the threshold
  RETURN (manual_update_time > NOW() - INTERVAL '1 hour' * p_hours_threshold);
END;
$$ LANGUAGE plpgsql;

-- Log the migration
INSERT INTO migration_log (migration_name) VALUES ('07-update-exchange-rates-logic.sql');

DO $$
BEGIN
  RAISE NOTICE 'Exchange rates logic updated successfully!';
  RAISE NOTICE 'Added manual tracking columns and protection function';
END $$;
