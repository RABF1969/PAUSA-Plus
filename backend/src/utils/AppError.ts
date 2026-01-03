/**
 * Custom Application Error with status code and error code
 * Used for consistent error handling across the API
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;

    constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}
