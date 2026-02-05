/**
 * Integration test for Sync API Endpoints
 * 
 * To run:
 * 1. Ensure server is running (npm run dev)
 * 2. Run: npx tsx test-sync-endpoints.ts
 */

const API_URL = 'http://localhost:3001/api/v1';

async function runTests() {
    console.log('🧪 Starting Sync API Integration Tests...\n');

    try {
        // 1. Create a non-conflicting queued booking
        console.log('1️⃣ Creating a queued booking (non-conflicting)...');
        const bookingData = {
            companyId: 'luxestay',
            roomId: '1',
            guestId: 'g1',
            checkIn: '2025-12-01',
            checkOut: '2025-12-05',
            totalPrice: 500,
            source: 'Direct',
            status: 'queued'
        };

        const res1 = await fetch(`${API_URL}/sync/bookings?companyId=luxestay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const queuedBooking = await res1.json();
        
        if (res1.status !== 201) {
            console.error('❌ Failed to create queued booking:', res1.status, queuedBooking);
            return;
        }
        console.log('✅ Success:', res1.status, queuedBooking.id);

        // 2. Try to create a conflicting booking
        console.log('\n2️⃣ Creating a conflicting booking (should fail)...');
        const conflictData = {
            companyId: 'luxestay',
            roomId: '1',
            guestId: 'g2',
            checkIn: '2025-12-02',
            checkOut: '2025-12-06',
            totalPrice: 600,
            source: 'Expedia'
        };

        const res2 = await fetch(`${API_URL}/sync/bookings?companyId=luxestay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(conflictData)
        });
        const conflictResult = await res2.json();
        
        if (res2.status !== 409) {
            console.error('❌ Conflict detection failed:', res2.status, conflictResult);
            return;
        }
        console.log('✅ Success (Caught Conflict):', res2.status, conflictResult.error);

        // 3. Confirm the queued booking
        console.log('\n3️⃣ Confirming the queued booking...');
        const res3 = await fetch(`${API_URL}/sync/bookings/${queuedBooking.id}/confirm`, {
            method: 'POST'
        });
        const confirmResult = await res3.json();
        
        if (res3.status !== 200) {
            console.error('❌ Failed to confirm booking:', res3.status, confirmResult);
            return;
        }
        console.log('✅ Success:', res3.status, confirmResult.message);

        // 4. Create a payment for the booking
        console.log('\n4️⃣ Creating a payment for the booking...');
        const paymentData = {
            bookingId: queuedBooking.id,
            amount: 500,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN_TEST_' + Date.now()
        };

        const res4 = await fetch(`${API_URL}/sync/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        const paymentResult = await res4.json();
        
        if (res4.status !== 201) {
            console.error('❌ Failed to create payment:', res4.status, paymentResult);
            return;
        }
        console.log('✅ Success:', res4.status, paymentResult.id);

        console.log('\n🎉 All Sync API Integration tests passed!');
    } catch (error) {
        console.error('\n❌ Test execution failed:', error);
    }
}

runTests();
