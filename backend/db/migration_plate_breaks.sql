-- Create plate_break_types pivot table
CREATE TABLE IF NOT EXISTS plate_break_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_id UUID NOT NULL REFERENCES operational_plates(id) ON DELETE CASCADE,
    break_type_id UUID NOT NULL REFERENCES break_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plate_id, break_type_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plate_break_types_plate ON plate_break_types(plate_id);
CREATE INDEX IF NOT EXISTS idx_plate_break_types_break_type ON plate_break_types(break_type_id);
