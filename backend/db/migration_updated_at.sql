-- Add updated_at to break_types if it doesn't exist
ALTER TABLE break_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Also ensure we have a trigger to auto-update it (optional but good practice)
-- For now, we'll just handle it in the service as requested.
