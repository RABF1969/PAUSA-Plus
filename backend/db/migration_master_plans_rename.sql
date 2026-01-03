-- Rename columns to match requested schema
ALTER TABLE plans RENAME COLUMN max_employees TO employee_limit;
ALTER TABLE plans RENAME COLUMN max_plates TO plate_limit;

-- Update companies table logic might need adjustment if it depended on old names in triggers (none exist yet for this)
