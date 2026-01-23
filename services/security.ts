/**
 * Security utilities for input sanitization and injection protection
 */

/**
 * Sanitizes an ID string to prevent injection attacks
 * @param id - The ID to sanitize
 * @returns The sanitized ID
 * @throws Error if ID is invalid
 */
export function sanitizeId(id: string): string {
  if (typeof id !== 'string') {
    throw new Error('ID must be a string');
  }

  // Remove any potentially dangerous characters
  const sanitized = id.replace(/[<>'"&]/g, '');

  if (sanitized.length === 0) {
    throw new Error('ID cannot be empty after sanitization');
  }

  return sanitized;
}

/**
 * Sanitizes an object by removing potentially dangerous properties
 * @param obj - The object to sanitize
 * @returns The sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  // Remove any properties that start with $ or contain dots (MongoDB operators)
  Object.keys(sanitized).forEach(key => {
    if (key.startsWith('$') || key.includes('.')) {
      delete sanitized[key];
    }
  });

  return sanitized;
}

/**
 * Checks if input contains NoSQL injection patterns
 * @param input - The input to check
 * @returns True if injection detected, false otherwise
 */
export function isNoSQLInjection(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  // Common NoSQL injection patterns
  const patterns = [
    /\$\w+\s*:/,  // MongoDB operators like $gt:
    /\{\s*\$/,     // Objects starting with $
    /\}\s*\$/,     // Objects ending with $
  ];

  return patterns.some(pattern => pattern.test(input));
}

/**
 * Sanitizes a search query to prevent injection attacks
 * @param query - The search query to sanitize
 * @returns The sanitized query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters and limit length
  return query.replace(/[<>'"&]/g, '').substring(0, 100);
}

/**
 * Validates if a string represents a valid number
 * @param value - The value to validate
 * @returns True if valid number, false otherwise
 */
export function validateNumber(value: string): boolean;
export function validateNumber(value: number | string, options: { min?: number, max?: number }): number;
export function validateNumber(value: number | string, options?: { min?: number, max?: number }): boolean | number {
  const num = Number(value);
  // Check if it's a valid number. For strings, ensure it's not empty string which Number() converts to 0.
  const isValid = !isNaN(num) && (typeof value === 'number' || value.trim() !== '');

  if (!options) {
    return isValid;
  }

  if (!isValid) {
    throw new Error('Invalid number');
  }

  if (options.min !== undefined && num < options.min) {
    throw new Error(`Number must be at least ${options.min}`);
  }
  if (options.max !== undefined && num > options.max) {
    throw new Error(`Number must be at most ${options.max}`);
  }

  return num;
}

/**
 * Sanitizes a URL to prevent injection attacks
 * @param url - The URL to sanitize
 * @returns The sanitized URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  // Basic URL sanitization: remove dangerous characters
  return url.replace(/[<>'"&]/g, '');
}

/**
 * Sanitizes a string input to prevent injection attacks
 * @param input - The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input.replace(/[<>'"&]/g, '');
}

/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns True if valid email, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
