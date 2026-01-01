-- Migration to add capacity to break_types
ALTER TABLE break_types ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 1;

-- Update existing records to ensure they have capacity 1 (already handled by DEFAULT but good for explicitness)
UPDATE break_types SET capacity = 1 WHERE capacity IS NULL;
