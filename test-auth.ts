import { validatePassword } from './services/authService.js';
import { isNoSQLInjection } from './services/security.js';


const password = "SecurePass123!";
console.log(`Testing password: "${password}"`);

const nosqlCheck = isNoSQLInjection(password);
console.log(`isNoSQLInjection: ${nosqlCheck}`);

const validation = validatePassword(password);
console.log(`Validation result:`, validation);

// Test individual regexes if validation failed
if (!validation.isValid) {
    console.log('Length < 8:', password.length < 8);
    console.log('Length > 128:', password.length > 128);
    console.log('No Uppercase:', !/[A-Z]/.test(password));
    console.log('No Lowercase:', !/[a-z]/.test(password));
    console.log('No Number:', !/\d/.test(password));
    console.log('No Special:', !/[!@#$%^&*]/.test(password));
}
