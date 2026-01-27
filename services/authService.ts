import { StaffMember, UserRole, RESTCredential, APIService } from '../types.ts';
export { UserRole } from '../types.ts';
import {
  sanitizeString,
  validateEmail as secureValidateEmail,
  isNoSQLInjection,
} from './security';
import { dbService } from './dbService';
import { trackEvent, identifyUser, clearUserIdentity } from './monitoringService';
import { AuditAction } from '../types';

// Password hashing helpers
// v1 format: v1$<saltHex>$<hashHex>
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const pwd = encoder.encode(password);
  const combined = new Uint8Array(salt.length + pwd.length);
  combined.set(salt, 0);
  combined.set(pwd, salt.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const saltHex = Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `v1$${saltHex}$${hashHex}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  try {
    if (storedHash.startsWith('v1$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 3) return false;
      const saltHex = parts[1];
      const expectedHashHex = parts[2];

      const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(h => parseInt(h, 16)));
      const encoder = new TextEncoder();
      const pwd = encoder.encode(password);
      const combined = new Uint8Array(salt.length + pwd.length);
      combined.set(salt, 0);
      combined.set(pwd, salt.length);

      const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return hashHex === expectedHashHex;
    }

    // Legacy deterministic (no version marker)
    const encoder = new TextEncoder();
    const legacyData = encoder.encode(password + 'luxestay_salt_2024');
    const legacyHashBuffer = await crypto.subtle.digest('SHA-256', legacyData);
    const legacyHashHex = Array.from(new Uint8Array(legacyHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return legacyHashHex === storedHash;
  } catch {
    return false;
  }
};

// Input validation functions
export const validateEmail = (email: string): boolean => secureValidateEmail(email);

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    return { isValid: false, errors: ['Password must be a string'] };
  }

  if (isNoSQLInjection(password)) {
    errors.push('Invalid password format');
    return { isValid: false, errors };
  }

  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (password.length > 128) errors.push('Password must be less than 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain at least one special character (!@#$%^&*)');

  return { isValid: errors.length === 0, errors };
};

export const sanitizeInput = (input: string): string => sanitizeString(input, { allowHTML: false, maxLength: 10000 });

// Role-based access control
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.FRONT_DESK]: 1,
    [UserRole.HOUSEKEEPING]: 1,
    [UserRole.MAINTENANCE]: 1,
    [UserRole.MANAGEMENT]: 2,
    [UserRole.ADMIN]: 3,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// CSRF token generation
const generateCSRFToken = (): string =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

class AuthService {
  private currentUser: StaffMember | null = null;
  private currentCompanyId: string | null = null;
  private sessionTimeout: number = 8 * 60 * 60 * 1000; // 8 hours
  private csrfToken: string = generateCSRFToken();

  async login(
    email: string,
    password: string,
    staffMembers: StaffMember[]
  ): Promise<{ success: boolean; user?: StaffMember; error?: string }> {
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: 'Password does not meet security requirements' };
    }

    const user = staffMembers.find(s => s.email === email);
    if (!user || !user.password) {
      return { success: false, error: 'Invalid credentials' };
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      trackEvent('auth_failure', { email, reason: 'invalid_credentials' });
      return { success: false, error: 'Invalid credentials' };
    }

    this.currentUser = user;
    this.setSession(user);

    // Monitoring
    identifyUser(user.id, {
      email: user.email,
      name: user.name,
      role: user.permissionRole,
      companyId: user.companyId
    });
    trackEvent('auth_success', { userId: user.id });

    // Audit Log
    dbService.addAuditLog({
      userId: user.id,
      userName: user.name,
      companyId: user.companyId,
      action: AuditAction.LOGIN,
      resource: 'auth',
      details: `User logged in from ${navigator.userAgent}`
    });

    return { success: true, user };
  }

  logout(): void {
    if (this.currentUser) {
      // Audit Log
      dbService.addAuditLog({
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        companyId: this.currentUser.companyId,
        action: AuditAction.LOGOUT,
        resource: 'auth',
        details: 'User logged out'
      });
      trackEvent('auth_logout', { userId: this.currentUser.id });
    }
    this.currentUser = null;
    this.clearSession();
    clearUserIdentity();
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

  // Public for tests
  setSession(user: StaffMember): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const session = { userId: user.id, timestamp: Date.now(), role: user.permissionRole };
    localStorage.setItem('luxestay_session', JSON.stringify(session));
  }

  private getSession(): { userId: string; timestamp: number; role: UserRole } | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const sessionStr = localStorage.getItem('luxestay_session');
    if (!sessionStr) return null;
    try { return JSON.parse(sessionStr); } catch { return null; }
  }

  private clearSession(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
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

  // Expose utilities as instance methods (for tests)
  async hashPassword(password: string): Promise<string> { return hashPassword(password); }
  async verifyPassword(password: string, storedHash: string): Promise<boolean> { return verifyPassword(password, storedHash); }
  validatePassword(password: string) { return validatePassword(password); }
  sanitizeInput(input: string) { return sanitizeInput(input); }
  hasPermission(userRole: UserRole, requiredRole: UserRole) { return hasPermission(userRole, requiredRole); }

  // CSRF protection methods
  getCSRFToken(): string { return this.csrfToken; }
  validateCSRFToken(token: string): boolean { return this.csrfToken === token; }
  refreshCSRFToken(): void { this.csrfToken = generateCSRFToken(); }
}

export const authService = new AuthService();
