import { StaffMember, UserRole } from '../types';
import {
  sanitizeString,
  validateEmail as secureValidateEmail,
  sanitizeObject,
  isNoSQLInjection
} from './security';

// Simple password hashing (in production, use bcrypt on server)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'luxestay_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
};

// Input validation functions
export const validateEmail = (email: string): boolean => {
  // Use enhanced validation from security module
  return secureValidateEmail(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Additional security: prevent injection attempts in password
  if (isNoSQLInjection(password)) {
    errors.push('Invalid password format');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return { isValid: errors.length === 0, errors };
};

export const sanitizeInput = (input: string): string => {
  // Use enhanced sanitization from security module
  return sanitizeString(input, { allowHTML: false, maxLength: 10000 });
};

// Role-based access control
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.FRONT_DESK]: 1,
    [UserRole.HOUSEKEEPING]: 1,
    [UserRole.MAINTENANCE]: 1,
    [UserRole.MANAGEMENT]: 2,
    [UserRole.ADMIN]: 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// CSRF token generation
const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Authentication service
class AuthService {
  private currentUser: StaffMember | null = null;
  private currentCompanyId: string | null = null;
  private sessionTimeout: number = 8 * 60 * 60 * 1000; // 8 hours
  private csrfToken: string = generateCSRFToken();

  async login(email: string, password: string, staffMembers: StaffMember[]): Promise<{ success: boolean; user?: StaffMember; error?: string }> {
    // Validate inputs
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: 'Password does not meet security requirements' };
    }

    // Find user
    const user = staffMembers.find(s => s.email === email);
    if (!user || !user.password) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Set current user and session
    this.currentUser = user;
    this.setSession(user);

    return { success: true, user };
  }

  logout(): void {
    this.currentUser = null;
    this.clearSession();
  }

  getCurrentUser(): StaffMember | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const sessionAge = now - session.timestamp;

    if (sessionAge > this.sessionTimeout) {
      this.clearSession();
      return false;
    }

    return true;
  }

  private setSession(user: StaffMember): void {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const session = {
      userId: user.id,
      timestamp: Date.now(),
      role: user.permissionRole
    };
    localStorage.setItem('luxestay_session', JSON.stringify(session));
  }

  private getSession(): { userId: string; timestamp: number; role: UserRole } | null {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const sessionStr = localStorage.getItem('luxestay_session');
    if (!sessionStr) return null;

    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    localStorage.removeItem('luxestay_session');
  }

  // Data encryption for sensitive information
  async encryptData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );

    // Store key for demo purposes (in production, use proper key management)
    const keyData = await crypto.subtle.exportKey('raw', key);
    const keyArray = new Uint8Array(keyData);

    const combined = new Uint8Array(iv.length + keyArray.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(keyArray, iv.length);
    combined.set(new Uint8Array(encrypted), iv.length + keyArray.length);

    return btoa(String.fromCharCode(...combined));
  }

  async decryptData(encryptedData: string): Promise<string> {
    try {
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const keyArray = combined.slice(12, 44); // 32 bytes for AES-256 key
      const encrypted = combined.slice(44);

      const key = await crypto.subtle.importKey(
        'raw',
        keyArray,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }

  // CSRF protection methods
  getCSRFToken(): string {
    return this.csrfToken;
  }

  validateCSRFToken(token: string): boolean {
    return this.csrfToken === token;
  }

  refreshCSRFToken(): void {
    this.csrfToken = generateCSRFToken();
  }
}

export const authService = new AuthService();
