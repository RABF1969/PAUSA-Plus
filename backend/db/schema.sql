-- Enable UUID extension (usually enabled by default in Supabase, but good practice to include)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES ENUM
CREATE TYPE employee_role AS ENUM ('operador', 'gestor', 'rh');

-- BREAK STATUS ENUM
CREATE TYPE break_status AS ENUM ('active', 'finished', 'exceeded');

-- 1. COMPANIES (Tenant)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EMPLOYEES
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    badge_code TEXT NOT NULL,
    role employee_role NOT NULL DEFAULT 'operador',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure badge_code is unique within the company
    UNIQUE(company_id, badge_code)
);

-- 3. BREAK TYPES (Configuration per company)
CREATE TABLE break_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    max_minutes INTEGER NOT NULL DEFAULT 15,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BREAK EVENTS (Operational Data)
CREATE TABLE break_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    break_type_id UUID NOT NULL REFERENCES break_types(id) ON DELETE RESTRICT, -- Don't delete history if type is deleted
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Can be calculated, but requested as column
    status break_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_break_events_employee ON break_events(employee_id);
CREATE INDEX idx_break_events_status ON break_events(status);
CREATE INDEX idx_break_events_dates ON break_events(started_at);
