/**
 * Extracts error message and code from API error responses
 * Supports both new nested format and legacy flat format
 */
export interface ApiErrorInfo {
    code?: string;
    message: string;
}

export function getApiErrorMessage(err: any): ApiErrorInfo {
    // Check for new nested format: { error: { code, message } }
    if (err?.response?.data?.error) {
        const errorData = err.response.data.error;
        
        // New format: error is an object
        if (typeof errorData === 'object') {
            return {
                code: errorData.code,
                message: errorData.message || 'Erro na operação'
            };
        }
        
        // Legacy format: error is a string
        if (typeof errorData === 'string') {
            return {
                code: err.response.data.code,
                message: errorData
            };
        }
    }

    // Fallback to error message
    return {
        message: err?.message || 'Erro na operação'
    };
}

/**
 * Optional: Log error details in development mode
 */
export function logErrorInDev(err: any, context?: string): void {
    if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
        console.error(`[API Error${context ? ` - ${context}` : ''}]:`, {
            status: err?.response?.status,
            data: err?.response?.data,
            message: err?.message
        });
    }
}
