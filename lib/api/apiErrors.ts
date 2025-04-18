/**
 * Custom error classes for API operations
 */

export enum ErrorCode {
  // Database errors
  DB_CONNECTION_ERROR = 'db_connection_error',
  DB_QUERY_ERROR = 'db_query_error',
  
  // Authentication errors
  AUTH_REQUIRED = 'auth_required',
  UNAUTHORIZED = 'unauthorized',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'resource_not_found',
  RESOURCE_ALREADY_EXISTS = 'resource_already_exists',
  
  // Validation errors
  VALIDATION_ERROR = 'validation_error',
  
  // General errors
  UNKNOWN_ERROR = 'unknown_error'
}

export class ApiError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, code: ErrorCode = ErrorCode.DB_QUERY_ERROR, details?: Record<string, any>) {
    super(message, code, details);
    this.name = 'DatabaseError';
  }
}

export class AuthError extends ApiError {
  constructor(message: string, code: ErrorCode = ErrorCode.AUTH_REQUIRED, details?: Record<string, any>) {
    super(message, code, details);
    this.name = 'AuthError';
  }
}

export class ResourceNotFoundError extends ApiError {
  constructor(resource: string, id?: string, details?: Record<string, any>) {
    const message = id 
      ? `${resource} with ID ${id} not found` 
      : `${resource} not found`;
    super(message, ErrorCode.RESOURCE_NOT_FOUND, details);
    this.name = 'ResourceNotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

/**
 * Helper function to parse Supabase errors into our custom error types
 */
export function parseSupabaseError(error: any, resource: string): ApiError {
  // No error
  if (!error) return new ApiError('Unknown error occurred');
  
  // Handle Supabase PostgreSQL error codes
  if (error.code) {
    // Auth errors
    if (error.code === '42501' || error.code === '28000') {
      return new AuthError('You do not have permission to perform this action', ErrorCode.UNAUTHORIZED);
    }
    
    // Not found (no rows returned by query)
    if (error.code === 'PGRST116') {
      return new ResourceNotFoundError(resource);
    }
    
    // Foreign key violation
    if (error.code === '23503') {
      return new ValidationError(`Referenced ${resource} does not exist`, { details: error.details });
    }
    
    // Unique constraint violation
    if (error.code === '23505') {
      return new ValidationError(`This ${resource} already exists`, { details: error.details });
    }
    
    // Check constraint violation
    if (error.code === '23514') {
      return new ValidationError(`Invalid ${resource} data`, { details: error.details });
    }
  }
  
  // Handle specific Supabase error messages
  if (error.message) {
    if (error.message.includes('not found')) {
      return new ResourceNotFoundError(resource);
    }
    
    if (error.message.includes('JWT')) {
      return new AuthError('Authentication token is invalid or expired', ErrorCode.UNAUTHORIZED);
    }
  }
  
  // Default to database error for other cases
  return new DatabaseError(
    error.message || `Error while performing operation on ${resource}`,
    ErrorCode.DB_QUERY_ERROR,
    { originalError: error }
  );
} 