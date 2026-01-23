// CRUD Testing Script for KingsHMS
// Run this in the browser console at http://localhost:3000

console.log('🧪 KingsHMS CRUD Testing Suite');
console.log('===============================');

// Import services
async function importServices() {
  try {
    const { dbService } = await import('./services/dbService.ts');
    const { authService } = await import('./services/authService.ts');
    return { dbService, authService };
  } catch (error) {
    console.error('❌ Failed to import services:', error);
    return null;
  }
}

// Test Room CRUD
async function testRoomCRUD(dbService) {
  console.log('\n🏨 Testing Room CRUD Operations...');

  try {
    // CREATE: Add a new room
    const newRoom = {
      number: '999',
      floor: 9,
      categoryId: 'standard', // Assuming this category exists
      status: 'available'
    };

    console.log('Creating room:', newRoom);
    const createdRoom = await dbService.create('rooms', newRoom);
    console.log('✅ Room created:', createdRoom);

    // READ: Get all rooms
    const allRooms = await dbService.getAll('rooms');
    console.log('✅ Retrieved all rooms:', allRooms.length, 'rooms');

    // READ: Get specific room by ID
    if (createdRoom.id) {
      const room = await dbService.getById('rooms', createdRoom.id);
      console.log('✅ Retrieved room by ID:', room);
    }

    // UPDATE: Update the room
    if (createdRoom.id) {
      const updates = { status: 'maintenance' };
      const updatedRoom = await dbService.update('rooms', createdRoom.id, updates);
      console.log('✅ Room updated:', updatedRoom);
    }

    // DELETE: Delete the room
    if (createdRoom.id) {
      const deleted = await dbService.delete('rooms', createdRoom.id);
      console.log('✅ Room deleted:', deleted);
    }

  } catch (error) {
    console.error('❌ Room CRUD test failed:', error);
  }
}

// Test Staff CRUD
async function testStaffCRUD(dbService) {
  console.log('\n👥 Testing Staff CRUD Operations...');

  try {
    // CREATE: Add a new staff member
    const newStaff = {
      name: 'Test Staff',
      email: 'test@luxestay.com',
      role: 'front_desk',
      department: 'Operations',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    console.log('Creating staff:', newStaff);
    const createdStaff = await dbService.create('staff', newStaff);
    console.log('✅ Staff created:', createdStaff);

    // READ: Get all staff
    const allStaff = await dbService.getAll('staff');
    console.log('✅ Retrieved all staff:', allStaff.length, 'members');

    // READ: Get specific staff by ID
    if (createdStaff.id) {
      const staff = await dbService.getById('staff', createdStaff.id);
      console.log('✅ Retrieved staff by ID:', staff);
    }

    // UPDATE: Update the staff
    if (createdStaff.id) {
      const updates = { department: 'Management' };
      const updatedStaff = await dbService.update('staff', createdStaff.id, updates);
      console.log('✅ Staff updated:', updatedStaff);
    }

    // DELETE: Delete the staff
    if (createdStaff.id) {
      const deleted = await dbService.delete('staff', createdStaff.id);
      console.log('✅ Staff deleted:', deleted);
    }

  } catch (error) {
    console.error('❌ Staff CRUD test failed:', error);
  }
}

// Test Booking CRUD
async function testBookingCRUD(dbService) {
  console.log('\n📅 Testing Booking CRUD Operations...');

  try {
    // CREATE: Add a new booking
    const newBooking = {
      guestId: 'guest-1', // Assuming guest exists
      roomId: 'room-1', // Assuming room exists
      checkIn: '2024-12-01',
      checkOut: '2024-12-03',
      status: 'confirmed',
      totalAmount: 200,
      paymentStatus: 'pending'
    };

    console.log('Creating booking:', newBooking);
    const createdBooking = await dbService.create('bookings', newBooking);
    console.log('✅ Booking created:', createdBooking);

    // READ: Get all bookings
    const allBookings = await dbService.getAll('bookings');
    console.log('✅ Retrieved all bookings:', allBookings.length, 'bookings');

    // READ: Get specific booking by ID
    if (createdBooking.id) {
      const booking = await dbService.getById('bookings', createdBooking.id);
      console.log('✅ Retrieved booking by ID:', booking);
    }

    // UPDATE: Update the booking
    if (createdBooking.id) {
      const updates = { status: 'checked-in' };
      const updatedBooking = await dbService.update('bookings', createdBooking.id, updates);
      console.log('✅ Booking updated:', updatedBooking);
    }

    // DELETE: Delete the booking
    if (createdBooking.id) {
      const deleted = await dbService.delete('bookings', createdBooking.id);
      console.log('✅ Booking deleted:', deleted);
    }

  } catch (error) {
    console.error('❌ Booking CRUD test failed:', error);
  }
}

// Test Menu CRUD
async function testMenuCRUD(dbService) {
  console.log('\n🍽️ Testing Menu CRUD Operations...');

  try {
    // CREATE: Add a new menu item
    const newMenuItem = {
      name: 'Test Pizza',
      description: 'A delicious test pizza',
      price: 15.99,
      category: 'Main Course',
      image: 'https://picsum.photos/seed/test-pizza/400/300',
      available: true
    };

    console.log('Creating menu item:', newMenuItem);
    const createdItem = await dbService.create('menu', newMenuItem);
    console.log('✅ Menu item created:', createdItem);

    // READ: Get all menu items
    const allMenuItems = await dbService.getAll('menu');
    console.log('✅ Retrieved all menu items:', allMenuItems.length, 'items');

    // READ: Get specific menu item by ID
    if (createdItem.id) {
      const menuItem = await dbService.getById('menu', createdItem.id);
      console.log('✅ Retrieved menu item by ID:', menuItem);
    }

    // UPDATE: Update the menu item
    if (createdItem.id) {
      const updates = { price: 18.99, description: 'An even more delicious test pizza' };
      const updatedItem = await dbService.update('menu', createdItem.id, updates);
      console.log('✅ Menu item updated:', updatedItem);
    }

    // DELETE: Delete the menu item
    if (createdItem.id) {
      const deleted = await dbService.delete('menu', createdItem.id);
      console.log('✅ Menu item deleted:', deleted);
    }

  } catch (error) {
    console.error('❌ Menu CRUD test failed:', error);
  }
}

// Run all CRUD tests
async function runCRUDTests() {
  console.log('🚀 Starting CRUD Testing...\n');

  const services = await importServices();
  if (!services) return;

  const { dbService } = services;

  await testRoomCRUD(dbService);
  await testStaffCRUD(dbService);
  await testBookingCRUD(dbService);
  await testMenuCRUD(dbService);

  console.log('\n🎉 CRUD Testing Complete!');
  console.log('===============================');
  console.log('Review the results above. All operations should show ✅ for success.');
}

// Auto-run tests when script loads
runCRUDTests();

// Export for manual testing
window.crudTests = {
  testRoomCRUD,
  testStaffCRUD,
  testBookingCRUD,
  runCRUDTests
};

console.log('\n💡 Manual Testing Commands:');
console.log('window.crudTests.testRoomCRUD()');
console.log('window.crudTests.testStaffCRUD()');
console.log('window.crudTests.testBookingCRUD()');
console.log('window.crudTests.runCRUDTests()');
