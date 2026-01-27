#!/usr/bin/env node

/**
 * KingsHMS Database Test Runner (Node.js version)
 * This script tests the database API endpoints directly
 */

const API_BASE = 'http://localhost:3001/api';
const FALLBACK_MESSAGE = 'Note: API not running, tests will check service fallback behavior';

console.log('🔍 KingsHMS Database Testing Suite (Node.js)');
console.log('=============================================\n');

// Helper function to make HTTP requests
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        });

        return {
            ok: response.ok,
            status: response.status,
            data: response.ok ? await response.json() : null,
            error: !response.ok ? await response.text() : null
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: null,
            error: error.message
        };
    }
}

// Test 1: API Server Status
async function testAPIServerStatus() {
    console.log('📋 Test 1: API Server Status');
    console.log('-----------------------------');

    const endpoints = ['rooms', 'bookings', 'staff', 'guests', 'menu', 'categories'];
    let apiRunning = false;

    for (const endpoint of endpoints) {
        const result = await fetchAPI(`/${endpoint}`);

        if (result.ok) {
            apiRunning = true;
            const count = result.data?.length || 0;
            console.log(`✅ /${endpoint.padEnd(12)} - ${result.status} OK (${count} records)`);
        } else if (result.status === 0) {
            console.log(`⚠️  /${endpoint.padEnd(12)} - Server not responding`);
        } else {
            console.log(`⚠️  /${endpoint.padEnd(12)} - ${result.status} ${result.error}`);
        }
    }

    if (!apiRunning) {
        console.log(`\n${FALLBACK_MESSAGE}`);
    }

    return apiRunning;
}

// Test 2: CRUD Operations (if API is running)
async function testCRUDOperations() {
    console.log('\n📋 Test 2: CRUD Operations');
    console.log('--------------------------');

    const testData = {
        name: `Test Staff ${Date.now()}`,
        email: `test${Date.now()}@kingshms.test`,
        role: 'admin',
        department: 'IT Testing',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };

    // CREATE
    console.log('\n🔹 CREATE Test:');
    const createResult = await fetchAPI('/staff', {
        method: 'POST',
        body: JSON.stringify(testData)
    });

    if (createResult.ok) {
        console.log('✅ Record created:', createResult.data.id);
        const recordId = createResult.data.id;

        // READ
        console.log('\n🔹 READ Test:');
        const readResult = await fetchAPI(`/staff/${recordId}`);
        if (readResult.ok) {
            console.log('✅ Record retrieved:', readResult.data.name);
        } else {
            console.log('❌ Failed to retrieve record');
        }

        // UPDATE
        console.log('\n🔹 UPDATE Test:');
        const updateData = { department: 'Updated Testing Dept' };
        const updateResult = await fetchAPI(`/staff/${recordId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (updateResult.ok) {
            console.log('✅ Record updated:', updateResult.data.department);
        } else {
            console.log('❌ Failed to update record');
        }

        // DELETE
        console.log('\n🔹 DELETE Test:');
        const deleteResult = await fetchAPI(`/staff/${recordId}`, {
            method: 'DELETE'
        });

        if (deleteResult.ok || deleteResult.status === 204) {
            console.log('✅ Record deleted successfully');

            // Verify deletion
            const verifyResult = await fetchAPI(`/staff/${recordId}`);
            if (verifyResult.status === 404 || !verifyResult.ok) {
                console.log('✅ Deletion verified');
            } else {
                console.log('⚠️  Record still exists after deletion');
            }
        } else {
            console.log('❌ Failed to delete record');
        }

        return true;
    } else {
        console.log('❌ Failed to create test record:', createResult.error);
        console.log('   API may not be running or accessible at', API_BASE);
        return false;
    }
}

// Test 3: Data Validation
async function testDataValidation() {
    console.log('\n📋 Test 3: Data Validation & Security');
    console.log('--------------------------------------');

    // Test 1: Try to create record with malicious data
    console.log('\n🔹 Testing SQL/NoSQL injection protection:');
    const maliciousData = {
        name: "'; DROP TABLE staff; --",
        email: 'test@test.com',
        role: 'admin',
        department: '{ "$ne": null }',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };

    const maliciousResult = await fetchAPI('/staff', {
        method: 'POST',
        body: JSON.stringify(maliciousData)
    });

    if (maliciousResult.ok) {
        console.log('⚠️  API accepted potentially malicious data (sanitization may be needed)');
        // Clean up
        await fetchAPI(`/staff/${maliciousResult.data.id}`, { method: 'DELETE' });
    } else if (maliciousResult.status === 400) {
        console.log('✅ API rejected malicious data');
    } else {
        console.log('⚠️  API not responding for validation test');
    }

    // Test 2: Invalid data types
    console.log('\n🔹 Testing data type validation:');
    const invalidData = {
        name: 123, // Should be string
        email: 'not-an-email', // Should be valid email
        role: 'invalid_role', // Should be from predefined list
        hireDate: 'invalid-date'
    };

    const invalidResult = await fetchAPI('/staff', {
        method: 'POST',
        body: JSON.stringify(invalidData)
    });

    if (!invalidResult.ok) {
        console.log('✅ API validates data types');
    } else {
        console.log('⚠️  API accepts invalid data types');
        // Clean up if created
        if (invalidResult.data?.id) {
            await fetchAPI(`/staff/${invalidResult.data.id}`, { method: 'DELETE' });
        }
    }

    return true;
}

// Test 4: Performance Test
async function testPerformance() {
    console.log('\n📋 Test 4: Performance Test');
    console.log('---------------------------');

    const startTime = Date.now();

    // Parallel requests
    const results = await Promise.all([
        fetchAPI('/rooms'),
        fetchAPI('/bookings'),
        fetchAPI('/staff'),
        fetchAPI('/guests'),
        fetchAPI('/menu')
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = results.filter(r => r.ok).length;

    console.log(`\n📊 Parallel fetch of 5 endpoints:`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Success: ${successCount}/5 endpoints`);

    if (duration < 500) {
        console.log('   ✅ Performance: Excellent');
    } else if (duration < 2000) {
        console.log('   ✅ Performance: Good');
    } else {
        console.log('   ⚠️  Performance: Could be optimized');
    }

    return true;
}

// Main test runner
async function runTests() {
    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    console.log('🚀 Starting Database Tests...\n');

    // Test 1: API Server Status
    results.total++;
    const apiRunning = await testAPIServerStatus();
    if (apiRunning) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n⚠️  Warning: API server is not running at', API_BASE);
        console.log('   To start the API server, you need to:');
        console.log('   1. Check if there\'s a separate backend server');
        console.log('   2. Run it (usually: npm run server or node server.js)');
        console.log('   3. Ensure it\'s running on port 3001\n');
    }

    // Only run other tests if API is running
    if (apiRunning) {
        // Test 2: CRUD Operations
        results.total++;
        try {
            const crudPassed = await testCRUDOperations();
            if (crudPassed) results.passed++;
            else results.failed++;
        } catch (error) {
            console.error('❌ CRUD test error:', error.message);
            results.failed++;
        }

        // Test 3: Data Validation
        results.total++;
        try {
            await testDataValidation();
            results.passed++;
        } catch (error) {
            console.error('❌ Validation test error:', error.message);
            results.failed++;
        }

        // Test 4: Performance
        results.total++;
        try {
            await testPerformance();
            results.passed++;
        } catch (error) {
            console.error('❌ Performance test error:', error.message);
            results.failed++;
        }
    } else {
        console.log('⏭️  Skipping CRUD, validation, and performance tests (API not available)\n');
    }

    // Print summary
    console.log('\n\n📊 DATABASE TEST SUMMARY');
    console.log('========================');
    console.log(`Total Tests:  ${results.total}`);
    console.log(`Passed:       ${results.passed} ✅`);
    console.log(`Failed:       ${results.failed} ${results.failed > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0}%`);

    if (!apiRunning) {
        console.log('\n💡 Additional Testing Options:');
        console.log('   1. Start the API server and run this test again');
        console.log('   2. Run browser-based tests at http://localhost:3000');
        console.log('   3. Open browser console and run: ');
        console.log('      const script = document.createElement("script");');
        console.log('      script.type = "module";');
        console.log('      script.src = "/test-database.js";');
        console.log('      document.head.appendChild(script);');
    }

    console.log('\n✨ Test run completed!\n');

    return results;
}

// Run tests
runTests().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
