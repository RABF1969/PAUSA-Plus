-- Migration: Add user management fields to users table
-- Run this in Supabase SQL Editor

-- Add must_change_password column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;

-- Add active column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add updated_at column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure unique constraint on company_id + email (drop if exists, then recreate)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_company_email_unique'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_company_email_unique 
        UNIQUE (company_id, email);
    END IF;
END $$;

-- Update existing users to have must_change_password = false (they already have passwords)
-- Only new users created via the system will have must_change_password = true
UPDATE users 
SET must_change_password = false 
WHERE must_change_password IS NULL OR must_change_password = true;

-- Ensure all existing users are active
UPDATE users 
SET active = true 
WHERE active IS NULL;

-- Create index on company_id for faster queries
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Create index on email for faster login queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add check constraint for role values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('admin', 'gestor', 'rh'));
    END IF;
END $$;

-- Success message
SELECT 'Migration completed successfully! Users table is ready for user management.' AS status;
