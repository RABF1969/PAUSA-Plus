import { supabase } from '../lib/supabase';
import { hashPassword } from './auth.service';
import { AppError } from '../utils/AppError';

export interface User {
    id: string;
    company_id: string;
    name: string;
    email: string;
    role: 'admin' | 'gestor' | 'rh';
    active: boolean;
    must_change_password: boolean;
    created_at: string;
}

export interface CreateUserData {
    company_id: string;
    name: string;
    email: string;
    role: 'admin' | 'gestor' | 'rh';
}

export interface UpdateUserData {
    name?: string;
    role?: 'admin' | 'gestor' | 'rh';
    active?: boolean;
}

/**
 * Generate a secure temporary password
 * Format: 8 characters minimum with letters and numbers
 */
export const generateTempPassword = (): string => {
    const length = 10;
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allChars = lowercase + uppercase + numbers;
    
    let password = '';
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Validate password strength
 * Minimum 8 characters, at least 1 letter and 1 number
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Senha deve ter no mínimo 8 caracteres' };
    }
    
    if (!/[a-zA-Z]/.test(password)) {
        return { valid: false, message: 'Senha deve conter pelo menos uma letra' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Senha deve conter pelo menos um número' };
    }
    
    return { valid: true };
};

/**
 * List all users in a company
 */
export const listUsers = async (companyId: string): Promise<User[]> => {
    const { data, error } = await supabase
        .from('users')
        .select('id, company_id, name, email, role, active, must_change_password, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new AppError('Erro ao listar usuários', 500, 'DATABASE_ERROR');
    }

    return data || [];
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string, companyId: string): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .select('id, company_id, name, email, role, active, must_change_password, created_at')
        .eq('id', userId)
        .eq('company_id', companyId)
        .single();

    if (error || !data) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return data;
};

/**
 * Create a new user with temporary password
 */
export const createUser = async (userData: CreateUserData): Promise<{ user: User; tempPassword: string }> => {
    // Check if email already exists in this company
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', userData.company_id)
        .eq('email', userData.email)
        .single();

    if (existing) {
        throw new AppError('Email já cadastrado nesta empresa', 409, 'USER_EMAIL_EXISTS');
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Create user
    const { data, error } = await supabase
        .from('users')
        .insert({
            company_id: userData.company_id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            password_hash: passwordHash,
            must_change_password: true,
            active: true
        })
        .select('id, company_id, name, email, role, active, must_change_password, created_at')
        .single();

    if (error || !data) {
        throw new AppError('Erro ao criar usuário', 500, 'DATABASE_ERROR');
    }

    return {
        user: data,
        tempPassword
    };
};

/**
 * Update user information
 */
export const updateUser = async (userId: string, companyId: string, updateData: UpdateUserData): Promise<User> => {
    // Verify user exists and belongs to company
    await getUserById(userId, companyId);

    const { data, error } = await supabase
        .from('users')
        .update({
            ...updateData,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('company_id', companyId)
        .select('id, company_id, name, email, role, active, must_change_password, created_at')
        .single();

    if (error || !data) {
        throw new AppError('Erro ao atualizar usuário', 500, 'DATABASE_ERROR');
    }

    return data;
};

/**
 * Change user password (for authenticated user changing their own password)
 */
export const changeUserPassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
        throw new AppError(validation.message || 'Senha inválida', 400, 'INVALID_PASSWORD');
    }

    // Get user with password hash
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('password_hash, active')
        .eq('id', userId)
        .single();

    if (fetchError || !user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    if (!user.active) {
        throw new AppError('Usuário inativo', 403, 'USER_INACTIVE');
    }

    // Verify current password
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
        throw new AppError('Senha atual incorreta', 400, 'INVALID_PASSWORD');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and clear must_change_password flag
    const { error: updateError } = await supabase
        .from('users')
        .update({
            password_hash: newPasswordHash,
            must_change_password: false,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (updateError) {
        throw new AppError('Erro ao alterar senha', 500, 'DATABASE_ERROR');
    }
};
