-- Add status, plan, and limits to companies table
-- Handling IF NOT EXISTS by checking columns or just using safe ALTER commands if supported, 
-- but Supabase/Postgres is stricter. We'll use DO block for safety.

DO $$
BEGIN
    -- 1. Status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'status') THEN
        ALTER TABLE companies ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
        -- Optional: Add check constraint
        ALTER TABLE companies ADD CONSTRAINT check_company_status CHECK (status IN ('active', 'suspended'));
    END IF;

    -- 2. Plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'plan') THEN
        ALTER TABLE companies ADD COLUMN plan TEXT NOT NULL DEFAULT 'basic';
        ALTER TABLE companies ADD CONSTRAINT check_company_plan CHECK (plan IN ('trial', 'basic', 'pro', 'enterprise'));
    END IF;

    -- 3. Limits
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'max_employees') THEN
        ALTER TABLE companies ADD COLUMN max_employees INTEGER NOT NULL DEFAULT 10;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'max_plates') THEN
        ALTER TABLE companies ADD COLUMN max_plates INTEGER NOT NULL DEFAULT 2;
    END IF;

END $$;

-- Update existing companies to have defaults if technically they were null (though DEFAULT handles new inserts)
-- This ensures any weird state is fixed.
UPDATE companies SET status = 'active' WHERE status IS NULL;
UPDATE companies SET plan = 'basic' WHERE plan IS NULL;
UPDATE companies SET max_employees = 10 WHERE max_employees IS NULL;
UPDATE companies SET max_plates = 2 WHERE max_plates IS NULL;
