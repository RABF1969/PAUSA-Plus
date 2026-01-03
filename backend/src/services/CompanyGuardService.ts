import { supabase } from '../lib/supabase';
import { AppError } from '../utils/AppError';

/**
 * Company Guard Service
 * Centralizes validation logic for company access control
 */
export class CompanyGuardService {
    /**
     * Validates if a company can perform a specific action
     * @param companyId - The company ID to validate
     * @param action - The action being attempted (e.g., 'START_BREAK')
     * @throws AppError if validation fails
     */
    static async validateCompanyAccess(
        companyId: string,
        action: 'START_BREAK' | 'CREATE_EMPLOYEE' | 'CREATE_PLATE'
    ): Promise<void> {
        // Fetch company with plan details
        const { data: company, error } = await supabase
            .from('companies')
            .select(`
                id,
                name,
                status,
                plan_id,
                plans (
                    id,
                    name,
                    is_active,
                    employee_limit,
                    plate_limit
                )
            `)
            .eq('id', companyId)
            .single();

        if (error || !company) {
            throw new AppError(
                'Empresa não encontrada.',
                404,
                'COMPANY_NOT_FOUND'
            );
        }

        // Validate company status
        if (company.status !== 'active') {
            throw new AppError(
                'Empresa suspensa. Contate o administrador.',
                403,
                'COMPANY_SUSPENDED'
            );
        }

        // Validate plan exists
        if (!company.plan_id) {
            throw new AppError(
                'Empresa sem plano ativo.',
                403,
                'COMPANY_NO_PLAN'
            );
        }

        // Validate plan is active
        const plan = company.plans as any;
        if (plan && plan.is_active === false) {
            throw new AppError(
                'Plano inativo. Entre em contato com o suporte.',
                403,
                'PLAN_INACTIVE'
            );
        }

        // Action-specific validations
        if (action === 'CREATE_EMPLOYEE') {
            await this.validateEmployeeLimit(companyId, plan);
        } else if (action === 'CREATE_PLATE') {
            await this.validatePlateLimit(companyId, plan);
        }
        // START_BREAK doesn't require additional limit checks
    }

    /**
     * Validates employee limit for the company's plan
     */
    private static async validateEmployeeLimit(companyId: string, plan: any): Promise<void> {
        try {
            // Get current employee count
            const { count, error } = await supabase
                .from('employees')
                .select('id', { count: 'exact', head: true })
                .eq('company_id', companyId);

            if (error) {
                console.error('Error checking employee count:', error);
                throw new AppError(
                    'Erro ao verificar limite de funcionários.',
                    500,
                    'LIMIT_CHECK_ERROR'
                );
            }

            const currentCount = count || 0;
            const limit = plan?.employee_limit;

            if (!limit) {
                console.warn(`Plan ${plan?.id} missing employee_limit field`);
                return; // Don't block if limit field doesn't exist
            }

            if (currentCount >= limit) {
                throw new AppError(
                    `Limite de funcionários do plano atingido (${currentCount}/${limit}).`,
                    403,
                    'EMPLOYEE_LIMIT_REACHED'
                );
            }
        } catch (err) {
            if (err instanceof AppError) throw err;
            console.error('Unexpected error in validateEmployeeLimit:', err);
            throw new AppError(
                'Erro ao validar limite de funcionários.',
                500,
                'VALIDATION_ERROR'
            );
        }
    }

    /**
     * Validates plate limit for the company's plan
     */
    private static async validatePlateLimit(companyId: string, plan: any): Promise<void> {
        try {
            // Get current active plate count
            const { count, error } = await supabase
                .from('operational_plates')
                .select('id', { count: 'exact', head: true })
                .eq('company_id', companyId)
                .eq('active', true);

            if (error) {
                console.error('Error checking plate count:', error);
                throw new AppError(
                    'Erro ao verificar limite de placas.',
                    500,
                    'LIMIT_CHECK_ERROR'
                );
            }

            const currentCount = count || 0;
            const limit = plan?.plate_limit;

            if (!limit) {
                console.warn(`Plan ${plan?.id} missing plate_limit field`);
                return; // Don't block if limit field doesn't exist
            }

            if (currentCount >= limit) {
                throw new AppError(
                    `Limite de placas do plano atingido (${currentCount}/${limit}).`,
                    403,
                    'PLATE_LIMIT_REACHED'
                );
            }
        } catch (err) {
            if (err instanceof AppError) throw err;
            console.error('Unexpected error in validatePlateLimit:', err);
            throw new AppError(
                'Erro ao validar limite de placas.',
                500,
                'VALIDATION_ERROR'
            );
        }
    }
}
