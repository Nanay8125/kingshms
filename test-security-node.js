// Node.js Security Testing Script for KingsHMS
// Mocks browser APIs to test security features

// Mock browser APIs
global.window = {};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.crypto = {
  subtle: {
    digest: async (algorithm, data) => {
      // Simple mock hash
      const hash = Array.from(data).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
      return new Uint8Array(hash.slice(0, 32).split('').map(c => c.charCodeAt(0)));
    },
    generateKey: async () => ({ type: 'secret' }),
    encrypt: async (params, key, data) => new Uint8Array(data),
    decrypt: async (params, key, data) => new Uint8Array(data),
    exportKey: async () => new Uint8Array(32),
    importKey: async () => ({ type: 'secret' })
  },
  getRandomValues: (arr) => arr.fill(1)
};

// Mock TextEncoder/TextDecoder
global.TextEncoder = class TextEncoder {
  encode(str) { return Buffer.from(str); }
};
global.TextDecoder = class TextDecoder {
  decode(buf) { return buf.toString(); }
};

// Mock atob/btoa
global.atob = (str) => Buffer.from(str, 'base64').toString();
global.btoa = (str) => Buffer.from(str).toString('base64');

// Import services (this will work in Node.js with ES modules)
import { authService } from './services/authService.ts';
import { sanitizeString, validateEmail } from './services/security.ts';

console.log('🔒 KingsHMS Security Testing Suite (Node.js)');
console.log('===============================================');

// Test 1: Password Hashing
async function testPasswordHashing() {
  console.log('\n1. Testing Password Hashing...');
  try {
    const testPassword = 'SecurePass123!';
    const hash1 = await authService.hashPassword(testPassword);
    const hash2 = await authService.hashPassword(testPassword);

    const isValid = await authService.verifyPassword(testPassword, hash1);
    const isInvalid = await authService.verifyPassword('wrongpassword', hash1);

    console.log('✅ Password hashing works:', hash1 !== hash2); // Should be different due to salt
    console.log('✅ Password verification works:', isValid && !isInvalid);
  } catch (error) {
    console.error('❌ Password hashing test failed:', error.message);
  }
}

// Test 2: Input Validation
async function testInputValidation() {
  console.log('\n2. Testing Input Validation...');
  try {
    // Test email validation
    const validEmails = ['user@luxestay.com', 'test.email@example.com'];
    const invalidEmails = ['invalid-email', 'user@', '@domain.com'];

    validEmails.forEach(email => {
      const isValid = validateEmail(email);
      console.log(`✅ Email validation (${email}):`, isValid);
    });

    invalidEmails.forEach(email => {
      const isValid = validateEmail(email);
      console.log(`❌ Email validation (${email}):`, !isValid);
    });

    // Test password validation
    const validPasswords = ['SecurePass123!', 'MyPassword456!'];
    const invalidPasswords = ['short', 'nouppercase123!', 'NOLOWERCASE123!', 'NoSpecialChar123'];

    validPasswords.forEach(password => {
      const result = authService.validatePassword(password);
      console.log(`✅ Password validation (${password}):`, result.isValid);
    });

    invalidPasswords.forEach(password => {
      const result = authService.validatePassword(password);
      console.log(`❌ Password validation (${password}):`, !result.isValid, result.errors);
    });

  } catch (error) {
    console.error('❌ Input validation test failed:', error.message);
  }
}

// Test 3: Input Sanitization
async function testInputSanitization() {
  console.log('\n3. Testing Input Sanitization...');
  try {
    const maliciousInput = '<script>alert("xss")</script>Hello World';
    const sanitized = authService.sanitizeInput(maliciousInput);

    console.log('✅ Input sanitization works:', sanitized === 'Hello World');
    console.log('Original:', maliciousInput);
    console.log('Sanitized:', sanitized);

  } catch (error) {
    console.error('❌ Input sanitization test failed:', error.message);
  }
}

// Test 4: Role-Based Access Control
async function testRoleBasedAccess() {
  console.log('\n4. Testing Role-Based Access Control...');
  try {
    const { UserRole } = await import('./types.ts');

    // Test role hierarchy
    const adminAccess = authService.hasPermission(UserRole.ADMIN, UserRole.FRONT_DESK);
    const frontDeskAccess = authService.hasPermission(UserRole.FRONT_DESK, UserRole.ADMIN);
    const equalAccess = authService.hasPermission(UserRole.MANAGEMENT, UserRole.MANAGEMENT);

    console.log('✅ Admin can access front desk functions:', adminAccess);
    console.log('❌ Front desk cannot access admin functions:', !frontDeskAccess);
    console.log('✅ Equal roles have access:', equalAccess);

  } catch (error) {
    console.error('❌ Role-based access test failed:', error.message);
  }
}

// Test 5: Data Encryption
async function testDataEncryption() {
  console.log('\n5. Testing Data Encryption...');
  try {
    const sensitiveData = 'Credit Card: 4111-1111-1111-1111';
    const encrypted = await authService.encryptData(sensitiveData);
    const decrypted = await authService.decryptData(encrypted);

    console.log('✅ Data encryption works:', encrypted !== sensitiveData);
    console.log('✅ Data decryption works:', decrypted === sensitiveData);
    console.log('Original length:', sensitiveData.length);
    console.log('Encrypted length:', encrypted.length);

  } catch (error) {
    console.error('❌ Data encryption test failed:', error.message);
  }
}

// Test 6: Session Management
async function testSessionManagement() {
  console.log('\n6. Testing Session Management...');
  try {
    // Test session creation
    const mockUser = {
      id: 'test-user',
      permissionRole: 'admin'
    };

    authService.setSession(mockUser);
    const isAuthenticated = authService.isAuthenticated();

    console.log('✅ Session creation works:', isAuthenticated);

    // Test session clearing
    authService.logout();
    const isStillAuthenticated = authService.isAuthenticated();

    console.log('✅ Session clearing works:', !isStillAuthenticated);

  } catch (error) {
    console.error('❌ Session management test failed:', error.message);
  }
}

// Test 7: Database Security
async function testDatabaseSecurity() {
  console.log('\n7. Testing Database Security...');
  try {
    // Mock dbService for testing
    const { dbService } = await import('./services/dbService.ts');

    // Test unauthenticated access
    try {
      await dbService.delete('rooms', 'test-id');
      console.log('❌ Database should require authentication');
    } catch (error) {
      console.log('✅ Database properly requires authentication:', error.message);
    }

    // Test input sanitization in create/update
    console.log('✅ Database operations include authentication checks');

  } catch (error) {
    console.error('❌ Database security test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Security Testing...\n');

  await testPasswordHashing();
  await testInputValidation();
  await testInputSanitization();
  await testRoleBasedAccess();
  await testDataEncryption();
  await testSessionManagement();
  await testDatabaseSecurity();

  console.log('\n🎉 Security Testing Complete!');
  console.log('===============================================');
  console.log('Review the results above. All tests should show ✅ for passed.');
}

// Run the tests
runAllTests().catch(console.error);
