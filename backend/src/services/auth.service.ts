import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase } from '../lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface UserPayload {
    id: string;
    email: string;
    company_id: string;
    role: string;
    name: string;
}

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (payload: UserPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): UserPayload => {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
};

export const login = async (email: string, password: string) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();

    if (error || !user) {
        throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
    }

    const payload: UserPayload = {
        id: user.id,
        email: user.email,
        company_id: user.company_id,
        role: user.role,
        name: user.name
    };

    const token = generateToken(payload);

    return {
        user: payload,
        token
    };
};
