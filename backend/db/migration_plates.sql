-- Create operational_plates table
CREATE TABLE IF NOT EXISTS operational_plates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Add plate_id to break_events if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'break_events' AND column_name = 'plate_id') THEN
        ALTER TABLE break_events ADD COLUMN plate_id UUID REFERENCES operational_plates(id);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_operational_plates_company ON operational_plates(company_id);
CREATE INDEX IF NOT EXISTS idx_break_events_plate ON break_events(plate_id);
