/**
 * Custom error class that preserves HTTP status codes from API responses.
 * This allows error handlers to distinguish between different types of errors
 * (404 Not Found, 429 Rate Limit, 500 Server Error, etc.)
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'ApiError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }
}
