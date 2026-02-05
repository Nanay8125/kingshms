
import { v4 as uuidv4 } from 'uuid';
import { TableName } from '../services/dbService';
import { Room } from '../types';

// Mock browser environment
const localStorageMock = new Map<string, string>();
const globalAny: any = global;

const mockStorage = {
    getItem: (key: string) => localStorageMock.get(key) || null,
    setItem: (key: string, value: string) => localStorageMock.set(key, value),
    removeItem: (key: string) => localStorageMock.delete(key),
    clear: () => localStorageMock.clear()
};

globalAny.window = {
    localStorage: mockStorage
};
globalAny.localStorage = mockStorage;

// Import service after mocking
import { dbService } from '../services/dbService';

async function runTests() {
    console.log('🚀 Starting DB Service Tests...');

    try {
        // 1. Test Room Creation
        console.log('\nTesting Room Creation...');
        const newRoom = {
            number: 'TEST-101',
            floor: 1,
            categoryId: 'standard',
            status: 'available',
            companyId: 'test-co'
        };
        const createdRoom = await dbService.create<Room>('rooms', newRoom);
        console.log('Created:', createdRoom);
        
        if (!createdRoom.id) throw new Error('Room ID missing');
        if (createdRoom.number !== 'TEST-101') throw new Error('Room number mismatch');

        // 2. Test Room Retrieval
        console.log('\nTesting Room Retrieval...');
        const fetchedRoom = await dbService.getById<Room>('rooms', createdRoom.id);
        console.log('Fetched:', fetchedRoom);
        if (!fetchedRoom) throw new Error('Room not found');

        // 3. Test Room Update
        console.log('\nTesting Room Update...');
        const updatedRoom = await dbService.update<Room>('rooms', createdRoom.id, { status: 'occupied' });
        console.log('Updated:', updatedRoom);
        if (updatedRoom?.status !== 'occupied') throw new Error('Update failed');

        // 4. Test Room Deletion
        console.log('\nTesting Room Deletion...');
        const deleted = await dbService.delete('rooms', createdRoom.id);
        console.log('Deleted:', deleted);
        if (!deleted) throw new Error('Delete failed');

        const verifyDelete = await dbService.getById('rooms', createdRoom.id);
        if (verifyDelete) throw new Error('Room still exists after delete');

        console.log('\n✅ All Tests Passed!');
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
}

runTests();
