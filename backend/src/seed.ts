import { supabase } from './lib/supabase';

const seed = async () => {
    console.log('🌱 Starting seed...');

    // 1. Create Company
    const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
            name: 'Pausa SaaS Demo Corp'
        })
        .select()
        .single();

    if (companyError) {
        console.error('Error creating company:', companyError);
        return;
    }
    console.log('✅ Company created:', company.name, `(ID: ${company.id})`);

    // 2. Create Employees
    const employeesData = [
        {
            company_id: company.id,
            name: 'João Silva',
            badge_code: 'FUNC001',
            role: 'operador',
            active: true
        },
        {
            company_id: company.id,
            name: 'Maria Santos',
            badge_code: 'FUNC002',
            role: 'gestor',
            active: true
        }
    ];

    const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .insert(employeesData)
        .select();

    if (employeesError) {
        console.error('Error creating employees:', employeesError);
        return;
    }
    console.log('✅ Employees created:', employees.map(e => `${e.name} (${e.badge_code})`).join(', '));

    // 3. Create Break Types
    const breakTypesData = [
        {
            company_id: company.id,
            name: 'Banheiro',
            max_minutes: 10,
            active: true
        },
        {
            company_id: company.id,
            name: 'Lanche',
            max_minutes: 15,
            active: true
        }
    ];

    const { data: breakTypes, error: breakTypesError } = await supabase
        .from('break_types')
        .insert(breakTypesData)
        .select();

    if (breakTypesError) {
        console.error('Error creating break types:', breakTypesError);
        return;
    }
    console.log('✅ Break Types created:', breakTypes.map(b => `${b.name} (${b.max_minutes} min) - ID: ${b.id}`).join(', '));

    console.log('✨ Seed completed successfully!');
};

seed().catch(err => console.error('Unexpected error:', err));
