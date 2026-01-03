-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  max_employees INT NOT NULL,
  max_plates INT NOT NULL,
  price_cents INT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alter companies table to link to plans
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'plan_id') THEN 
        ALTER TABLE companies ADD COLUMN plan_id UUID REFERENCES plans(id);
    END IF; 
END $$;

-- Seed initial plans
INSERT INTO plans (name, code, max_employees, max_plates, price_cents, billing_cycle)
VALUES 
  ('Trial', 'trial', 10, 1, 0, 'monthly'),
  ('Basic', 'basic', 50, 3, 9900, 'monthly'),
  ('Pro', 'pro', 200, 10, 19900, 'monthly')
ON CONFLICT (code) DO NOTHING;

-- Backfill existing companies to Trial plan if plan_id is null
UPDATE companies 
SET plan_id = (SELECT id FROM plans WHERE code = 'trial') 
WHERE plan_id IS NULL;
