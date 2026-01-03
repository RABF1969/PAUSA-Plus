import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Global Error Handler Middleware
 * Handles AppError instances and generic errors
 * Returns standardized format: { error: { code, message, details? } }
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const isDev = process.env.NODE_ENV !== 'production';

    // Check if it's our custom AppError
    if (err instanceof AppError) {
        if (isDev) {
            console.error(`[AppError] ${err.code}: ${err.message}`, err.details || '');
        }
        
        const errorResponse: any = {
            error: {
                code: err.code,
                message: err.message
            }
        };
        
        if (err.details) {
            errorResponse.error.details = err.details;
        }
        
        return res.status(err.statusCode).json(errorResponse);
    }

    // Handle errors with status property (legacy format)
    if ((err as any).status) {
        if (isDev) {
            console.error('[Legacy Error]:', err.message, err.stack);
        }
        
        return res.status((err as any).status).json({
            error: {
                code: 'ERROR',
                message: err.message
            }
        });
    }

    // Log unexpected errors (always log these, even in production)
    console.error('[Unexpected Error]:', err);
    if (isDev && err.stack) {
        console.error('Stack trace:', err.stack);
    }

    // Generic 500 error
    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno. Tente novamente.'
        }
    });
};
