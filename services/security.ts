/**
 * Security Utilities Module
 * Provides comprehensive protection against injection attacks including:
 * - NoSQL injection
 * - XSS (Cross-Site Scripting)
 * - Command injection
 * - Invalid data inputs
 */

// Dangerous NoSQL operators that should be blocked
const NOSQL_OPERATORS = [
    '$gt', '$gte', '$lt', '$lte', '$ne', '$eq',
    '$in', '$nin', '$and', '$or', '$not', '$nor',
    '$exists', '$type', '$mod', '$regex', '$where',
    '$text', '$search', '$near', '$geoWithin'
];

// Dangerous characters for various contexts
const SQL_SPECIAL_CHARS = /[';""\\/*-]/g;
const XSS_PATTERNS = /<script|<iframe|<object|<embed|javascript:|data:|vbscript:|on[a-zA-Z]+=/gi;
const COMMAND_INJECTION_CHARS = /[;&|`$(){}[\]<>]/g;

/**
 * Enhanced input sanitization with multiple layers of protection
 */
export const sanitizeString = (input: string, options: {
    allowHTML?: boolean;
    maxLength?: number;
    allowSpecialChars?: boolean;
} = {}): string => {
    const {
        allowHTML = false,
        maxLength = 10000,
        allowSpecialChars = false
    } = options;

    // Type validation
    if (typeof input !== 'string') {
        return '';
    }

    // Length validation (prevent DoS)
    let sanitized = input.substring(0, maxLength).trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove HTML tags unless explicitly allowed
    if (!allowHTML) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove XSS patterns
    sanitized = sanitized.replace(XSS_PATTERNS, '');

    // Remove SQL special characters unless allowed
    if (!allowSpecialChars) {
        sanitized = sanitized.replace(SQL_SPECIAL_CHARS, '');
    }

    // Encode HTML entities for safe display
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return sanitized;
};

/**
 * Sanitize search queries to prevent injection in .includes() and regex operations
 */
export const sanitizeSearchQuery = (query: string): string => {
    if (typeof query !== 'string') {
        return '';
    }

    // Limit length
    const sanitized = query.substring(0, 200).trim();

    // Escape regex special characters
    return sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate and sanitize object IDs
 */
export const sanitizeId = (id: string): string => {
    if (typeof id !== 'string') {
        throw new Error('Invalid ID: must be a string');
    }

    // Remove any special characters, only allow alphanumeric, hyphens, and underscores
    const sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '');

    if (sanitized.length === 0) {
        throw new Error('Invalid ID: cannot be empty after sanitization');
    }

    if (sanitized.length > 100) {
        throw new Error('Invalid ID: too long');
    }

    return sanitized;
};

/**
 * Validate email addresses
 */
export const validateEmail = (email: string): boolean => {
    if (typeof email !== 'string') {
        return false;
    }

    // Length check
    if (email.length > 254) {
        return false;
    }

    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email);
};

/**
 * Validate and sanitize URLs
 */
export const sanitizeUrl = (url: string): string => {
    if (typeof url !== 'string') {
        return '';
    }

    const trimmed = url.trim();

    // Block dangerous protocols
    const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
    if (dangerousProtocols.test(trimmed)) {
        return '';
    }

    // Only allow http, https, and relative URLs
    const validProtocols = /^(https?:)?\/\//i;
    if (trimmed.length > 0 && !validProtocols.test(trimmed)) {
        return '';
    }

    // Length validation
    if (trimmed.length > 2048) {
        return '';
    }

    return trimmed;
};

/**
 * Validate numeric input with range checking
 */
export const validateNumber = (value: any, options: {
    min?: number;
    max?: number;
    integer?: boolean;
} = {}): number => {
    const {
        min = -Infinity,
        max = Infinity,
        integer = false
    } = options;

    const num = Number(value);

    // Check if valid number
    if (isNaN(num) || !isFinite(num)) {
        throw new Error('Invalid number');
    }

    // Integer validation
    if (integer && !Number.isInteger(num)) {
        throw new Error('Must be an integer');
    }

    // Range validation
    if (num < min) {
        throw new Error(`Number must be at least ${min}`);
    }

    if (num > max) {
        throw new Error(`Number must be at most ${max}`);
    }

    return num;
};

/**
 * Detect and prevent NoSQL injection attempts
 */
export const isNoSQLInjection = (input: any): boolean => {
    // Check if input is an object (potential NoSQL operator injection)
    if (typeof input === 'object' && input !== null) {
        const keys = Object.keys(input);

        // Check for NoSQL operators
        for (const key of keys) {
            if (NOSQL_OPERATORS.includes(key)) {
                return true;
            }

            // Recursively check nested objects
            if (typeof input[key] === 'object') {
                if (isNoSQLInjection(input[key])) {
                    return true;
                }
            }
        }
    }

    // Check string inputs for serialized NoSQL operators
    if (typeof input === 'string') {
        for (const operator of NOSQL_OPERATORS) {
            if (input.includes(operator)) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Sanitize an entire object recursively
 */
export const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Check for NoSQL injection first
    if (isNoSQLInjection(obj)) {
        throw new Error('Potential NoSQL injection detected');
    }

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Sanitize the key as well
                const sanitizedKey = sanitizeString(key, { maxLength: 100 });
                sanitized[sanitizedKey] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
    if (typeof phone !== 'string') {
        return false;
    }

    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-().+]/g, '');

    // Check if it's a valid phone number (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(cleaned);
};

/**
 * Validate date inputs
 */
export const validateDate = (date: any): Date => {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
    }

    // Reasonable date range (1900 - 2100)
    const year = parsedDate.getFullYear();
    if (year < 1900 || year > 2100) {
        throw new Error('Date out of valid range');
    }

    return parsedDate;
};

/**
 * Create parameterized query pattern for future SQL migration
 * This helps establish good practices even with in-memory storage
 */
export const createParameterizedQuery = (
    baseQuery: string,
    params: Record<string, any>
): { query: string; sanitizedParams: Record<string, any> } => {
    const sanitizedParams: Record<string, any> = {};

    // Sanitize all parameters
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            sanitizedParams[key] = sanitizeObject(params[key]);
        }
    }

    return {
        query: baseQuery,
        sanitizedParams
    };
};

/**
 * Rate limiting helper (simple token bucket implementation)
 */
export class RateLimiter {
    private tokens: Map<string, { count: number; lastRefill: number }> = new Map();
    private maxTokens: number;
    private refillRate: number; // tokens per second

    constructor(maxTokens: number = 100, refillRate: number = 10) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
    }

    isAllowed(identifier: string): boolean {
        const now = Date.now();
        const bucket = this.tokens.get(identifier) || { count: this.maxTokens, lastRefill: now };

        // Refill tokens based on time elapsed
        const timePassed = (now - bucket.lastRefill) / 1000;
        const tokensToAdd = timePassed * this.refillRate;
        bucket.count = Math.min(this.maxTokens, bucket.count + tokensToAdd);
        bucket.lastRefill = now;

        // Check if request is allowed
        if (bucket.count >= 1) {
            bucket.count -= 1;
            this.tokens.set(identifier, bucket);
            return true;
        }

        this.tokens.set(identifier, bucket);
        return false;
    }

    reset(identifier: string): void {
        this.tokens.delete(identifier);
    }
}

// Export singleton rate limiter instance
export const globalRateLimiter = new RateLimiter(100, 10);
