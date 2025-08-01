-- Run all migration files in order
-- This script combines all previous migrations for a fresh database setup

-- =====================================================
-- 01: Create base tables
-- =====================================================

-- Run 01-create-tables.sql
\i scripts/01-create-tables.sql

-- =====================================================
-- 02: Seed initial data
-- =====================================================

-- Run 02-seed-data.sql (seed data after tables are created and updated)
\i scripts/02-seed-data.sql

-- =====================================================
-- 03: Update tables
-- =====================================================

-- Run 03-update-tables.sql
\i scripts/03-update-tables.sql

-- =====================================================
-- 04: Update payments system
-- =====================================================

-- Run 04-update-payments-system.sql
\i scripts/04-update-payments-system.sql

-- =====================================================
-- 05: Create exchange rates system
-- =====================================================

-- Run 05-exchange-rates.sql
\i scripts/05-exchange-rates.sql

-- =====================================================
-- 06: Create production user
-- =====================================================

-- Run 06-create-production-user.sql
\i scripts/06-create-production-user.sql

-- =====================================================
-- 07: Update exchange rates logic
-- =====================================================

-- Run 07-update-exchange-rates-logic.sql
\i scripts/07-update-exchange-rates-logic.sql

-- =====================================================
-- 08: User management system
-- =====================================================

-- Run 08-user-management-system.sql
\i scripts/08-user-management-system.sql

-- =====================================================
-- Migration completed successfully
-- =====================================================

-- Insert migration log
CREATE TABLE IF NOT EXISTS migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migration_log (migration_name) VALUES ('00-run-all-migrations.sql');

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE 'Database migration completed successfully!';
  RAISE NOTICE 'Tables created and updated as per migration scripts';
  RAISE NOTICE 'Sample data inserted for testing';
  RAISE NOTICE 'Indexes created for performance optimization';
  RAISE NOTICE 'User management system and production user created';
END $$;
