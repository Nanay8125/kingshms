
import { authService } from './services/authService';
import { dbService } from './services/mysqlDbService';
import { StaffMember } from './types';

// Mock Browser APIs for Node environment
if (typeof window === 'undefined') {
    (global as any).window = {
        localStorage: {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { }
        }
    };
    (global as any).localStorage = (global as any).window.localStorage;
    (global as any).navigator = { userAgent: 'test-agent' };
    
    // Polyfill Web Crypto API
    const { webcrypto } = require('node:crypto');
    (global as any).crypto = webcrypto;
}

async function testLogin() {
    console.log('🔍 Fetching staff from DB...');
    const staff = await dbService.getAll<StaffMember>('staff');
    console.log('✅ Fetched ' + staff.length + ' staff members.');
    
    const manager = staff.find(s => s.email === 'manager@luxestay.com');
    if (!manager) {
        console.error('❌ Manager not found in DB!');
        return;
    }
    console.log('👤 Manager found:', manager.email);
    console.log('🔑 Password hash from DB:', manager.password);

    console.log('🔐 Attempting login with SecurePass123!...');
    try {
        const result = await authService.login('manager@luxestay.com', 'SecurePass123!', staff);
        console.log('📝 Login Result:', JSON.stringify(result, null, 2));
        
        if (result.success) {
             console.log('✅ Login SUCCESSFUL!');
        } else {
             console.log('❌ Login FAILED:', result.error);
             const isValid = await authService.verifyPassword('SecurePass123!', manager.password || '');
             console.log('🔍 Direct verifyPassword check:', isValid);
        }
    } catch (e) {
        console.error('❌ Login threw error:', e);
    }
}

testLogin();

