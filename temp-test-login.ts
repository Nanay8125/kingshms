
import { authService } from './services/authService';
import { StaffMember, UserRole, StaffStatus } from './types';

const DEMO_PASSWORD_HASH = 'efe5e46562838eb6afd1cb753f27a7616bf474188899dc69e0e733aa4c3d3de0';

const mockStaff: StaffMember[] = [
  {
    id: 's5',
    companyId: 'luxestay',
    name: 'Elena Rodriguez',
    email: 'manager@luxestay.com',
    password: DEMO_PASSWORD_HASH,
    role: 'General Manager',
    department: 'Management',
    permissionRole: UserRole.ADMIN,
    status: StaffStatus.AVAILABLE,
    avatar: 'https://picsum.photos/seed/s5/100',
    phone: '555-0105',
  }
];

async function test() {
    console.log('Testing login...');
    try {
        const result = await authService.login('manager@luxestay.com', 'SecurePass123!', mockStaff);
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
