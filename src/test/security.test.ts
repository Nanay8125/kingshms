import { 
  sanitizeId, 
  sanitizeObject, 
  isNoSQLInjection, 
  validateEmail, 
  sanitizeString 
} from '../../services/security';

describe('Security Utilities', () => {
  describe('sanitizeId', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeId('<script>alert("1")</script>')).toBe('scriptalert(1)/script');
    });

    it('should throw error for non-string input', () => {
      expect(() => sanitizeId(123 as any)).toThrow('ID must be a string');
    });

    it('should throw error if empty after sanitization', () => {
      expect(() => sanitizeId('<>"&')).toThrow('ID cannot be empty after sanitization');
    });
  });

  describe('sanitizeObject', () => {
    it('should remove MongoDB operators', () => {
      const input = {
        name: 'Normal',
        '$gt': 10,
        'nested.prop': 'value'
      };
      const result = sanitizeObject(input);
      expect(result).toEqual({ name: 'Normal' });
      expect(result).not.toHaveProperty('$gt');
      expect(result).not.toHaveProperty('nested.prop');
    });
  });

  describe('isNoSQLInjection', () => {
    it('should detect MongoDB operator injection', () => {
      expect(isNoSQLInjection('{$gt: 1}')).toBe(true);
      expect(isNoSQLInjection('normal text')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should invalidate incorrect email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should respect maxLength', () => {
      expect(sanitizeString('12345', { maxLength: 3 })).toBe('123');
    });
  });
});
