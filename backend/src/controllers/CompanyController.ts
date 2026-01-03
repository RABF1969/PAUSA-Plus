import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { AppError } from '../utils/AppError';

export const CompanyController = {
    /**
     * GET /company/overview
     * Returns company plan details and current usage
     * Read-only endpoint for client visibility
     */
    async getOverview(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            
            if (!userId) {
                throw new AppError('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }

            // Get user's company_id from their profile
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('company_id')
                .eq('id', userId)
                .single();

            if (userError || !user || !user.company_id) {
                throw new AppError('Empresa não encontrada para este usuário', 404, 'COMPANY_NOT_FOUND');
            }

            const companyId = user.company_id;

            // Get company with plan details
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .select(`
                    name,
                    status,
                    plans (
                        name,
                        employee_limit,
                        plate_limit
                    )
                `)
                .eq('id', companyId)
                .single();

            if (companyError) {
                throw new AppError('Erro ao buscar dados da empresa', 500, 'DATABASE_ERROR');
            }

            // Get current employee count
            const { count: employeeCount, error: empError } = await supabase
                .from('employees')
                .select('id', { count: 'exact', head: true })
                .eq('company_id', companyId);

            // Get current active plate count
            const { count: plateCount, error: plateError } = await supabase
                .from('operational_plates')
                .select('id', { count: 'exact', head: true })
                .eq('company_id', companyId)
                .eq('active', true);

            // Build response with safe defaults
            const plan = company?.plans as any;
            
            const response = {
                company: {
                    name: company?.name || 'Empresa',
                    status: company?.status || 'active',
                    plan: plan ? {
                        name: plan.name || 'Sem plano',
                        employee_limit: plan.employee_limit || 0,
                        plate_limit: plan.plate_limit || 0
                    } : null
                },
                usage: {
                    employees: employeeCount || 0,
                    plates: plateCount || 0
                }
            };

            return res.json(response);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Unexpected error in getOverview:', error);
            throw new AppError('Erro ao buscar informações da empresa', 500, 'INTERNAL_ERROR');
        }
    }
};
