
import { dbService } from './services/mysqlDbService';

async function checkAdmin() {
    try {
        const staff = await dbService.getAll('staff', 'luxestay');
        const admin = staff.find((u: any) => u.email === 'manager@luxestay.com');
        console.log('Manager User:', JSON.stringify(admin, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkAdmin();
