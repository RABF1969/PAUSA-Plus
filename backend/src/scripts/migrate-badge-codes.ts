import { supabase } from '../lib/supabase';

const migrate = async () => {
    console.log('🚀 Starting Badge Code Migration...');

    // 1. Fetch all employees
    const { data: employees, error } = await supabase
        .from('employees')
        .select('id, badge_code, company_id, name');

    if (error) {
        console.error('❌ Error fetching employees:', error.message);
        return;
    }

    console.log(`📋 Found ${employees?.length} employees to check.`);

    let updatedCount = 0;
    let collisionCount = 0;

    for (const emp of employees || []) {
        // Extract only digits and pad to 4
        const numericPart = emp.badge_code.replace(/\D/g, '');
        const newBadgeCode = numericPart.padStart(4, '0');

        // Check if change is needed (Idempotency)
        if (newBadgeCode === emp.badge_code) {
            continue;
        }

        console.log(`🔄 Migrating [${emp.name}]: ${emp.badge_code} -> ${newBadgeCode}`);

        // 2. Collision Check within the same company
        const { data: collision } = await supabase
            .from('employees')
            .select('id')
            .eq('badge_code', newBadgeCode)
            .eq('company_id', emp.company_id)
            .neq('id', emp.id)
            .single();

        if (collision) {
            console.warn(`⚠️ Collision detected for ${emp.name} (Code: ${newBadgeCode}). Skipping update.`);
            collisionCount++;
            continue;
        }

        // 3. Update the record
        const { error: updateError } = await supabase
            .from('employees')
            .update({ badge_code: newBadgeCode })
            .eq('id', emp.id);

        if (updateError) {
            console.error(`❌ Failed to update ${emp.name}:`, updateError.message);
        } else {
            updatedCount++;
        }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`⚠️ Collisions skipped: ${collisionCount}`);
    console.log('✨ Migration completed!');
};

migrate().catch(err => console.error('💥 Unexpected error:', err));
