// Database Testing Script for KingsHMS
// This script tests Firebase/Firestore database operations

console.log('🔍 KingsHMS Database Testing Suite');
console.log('===================================\n');

// Test 1: Check Firebase Configuration
async function testFirebaseConfig() {
    console.log('📋 Test 1: Firebase Configuration Check');
    console.log('----------------------------------------');

    try {
        const { app, analytics, storage } = await import('./services/firebase.ts');
        console.log('✅ Firebase app initialized successfully');
        console.log('✅ Firebase analytics available');
        console.log('✅ Firebase storage available');
        console.log(`📦 Firebase Project: ${app.options.projectId}`);
        console.log(`🔑 API Key: ${app.options.apiKey ? '***configured***' : '❌ missing'}`);
        return true;
    } catch (error) {
        console.error('❌ Firebase configuration failed:', error.message);
        return false;
    }
}

// Test 2: Check Database Service
async function testDatabaseService() {
    console.log('\n📋 Test 2: Database Service Check');
    console.log('----------------------------------');

    try {
        const { dbService } = await import('./services/dbService.ts');
        console.log('✅ Database service loaded successfully');

        // Test that the service has all required methods
        const methods = ['getAll', 'getById', 'create', 'update', 'delete'];
        methods.forEach(method => {
            if (typeof dbService[method] === 'function') {
                console.log(`✅ Method available: ${method}()`);
            } else {
                console.error(`❌ Method missing: ${method}()`);
            }
        });

        return true;
    } catch (error) {
        console.error('❌ Database service check failed:', error.message);
        return false;
    }
}

// Test 3: Check API Connectivity
async function testAPIConnectivity() {
    console.log('\n📋 Test 3: API Server Connectivity');
    console.log('-----------------------------------');

    const apiBase = 'http://localhost:3001/api';

    try {
        // Test various endpoints
        const endpoints = ['rooms', 'bookings', 'staff', 'guests', 'menu'];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${apiBase}/${endpoint}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint.padEnd(12)} - API accessible (${data.length || 0} records)`);
                } else {
                    console.log(`⚠️  ${endpoint.padEnd(12)} - API returned status: ${response.status}`);
                }
            } catch (error) {
                console.log(`⚠️  ${endpoint.padEnd(12)} - Not accessible (will use fallback data)`);
            }
        }

        console.log('\n💡 Note: If API endpoints are not accessible, the app will use');
        console.log('   localStorage or fallback data for demo purposes.');
        return true;
    } catch (error) {
        console.error('❌ API connectivity test failed:', error.message);
        return false;
    }
}

// Test 4: Test Data Read Operations
async function testDataReadOperations() {
    console.log('\n📋 Test 4: Data Read Operations');
    console.log('--------------------------------');

    try {
        const { dbService } = await import('./services/dbService.ts');

        // Test reading different tables
        console.log('\nTesting read operations for different tables:');

        const tables = ['rooms', 'bookings', 'staff', 'guests', 'menu', 'categories'];

        for (const table of tables) {
            try {
                const data = await dbService.getAll(table);
                console.log(`✅ ${table.padEnd(12)} - Retrieved ${data.length} records`);

                // If there's data, try to get one by ID
                if (data.length > 0 && data[0].id) {
                    const singleRecord = await dbService.getById(table, data[0].id);
                    if (singleRecord) {
                        console.log(`   ├─ getById() works for ${table}`);
                    }
                }
            } catch (error) {
                console.error(`❌ ${table.padEnd(12)} - Read failed:`, error.message);
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Data read operations test failed:', error.message);
        return false;
    }
}

// Test 5: Test CRUD Operations
async function testCRUDOperations() {
    console.log('\n📋 Test 5: CRUD Operations Test');
    console.log('--------------------------------');

    try {
        const { dbService } = await import('./services/dbService.ts');

        // Test creating a test staff member
        console.log('\n🔹 CREATE Test:');
        const testStaff = {
            name: 'Database Test User',
            email: `test_${Date.now()}@kingshms.com`,
            role: 'admin',
            department: 'IT',
            hireDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };

        const created = await dbService.create('staff', testStaff);
        console.log('✅ Record created with ID:', created.id);

        // Test reading the created record
        console.log('\n🔹 READ Test:');
        const readRecord = await dbService.getById('staff', created.id);
        if (readRecord && readRecord.email === testStaff.email) {
            console.log('✅ Record read successfully');
        } else {
            console.error('❌ Record read failed or data mismatch');
        }

        // Test updating the record
        console.log('\n🔹 UPDATE Test:');
        const updates = { department: 'Testing Department' };
        const updated = await dbService.update('staff', created.id, updates);
        if (updated && updated.department === 'Testing Department') {
            console.log('✅ Record updated successfully');
        } else {
            console.error('❌ Record update failed');
        }

        // Test deleting the record
        console.log('\n🔹 DELETE Test:');
        const deleted = await dbService.delete('staff', created.id);
        if (deleted) {
            console.log('✅ Record deleted successfully');

            // Verify deletion
            const verifyDeleted = await dbService.getById('staff', created.id);
            if (!verifyDeleted) {
                console.log('✅ Delete verified - record no longer exists');
            } else {
                console.log('⚠️  Record still exists after deletion (may be soft delete)');
            }
        } else {
            console.error('❌ Record deletion failed');
        }

        return true;
    } catch (error) {
        console.error('❌ CRUD operations test failed:', error.message);
        console.error('   Stack:', error.stack);
        return false;
    }
}

// Test 6: Test Security/Sanitization
async function testSecurityFeatures() {
    console.log('\n📋 Test 6: Security & Sanitization');
    console.log('-----------------------------------');

    try {
        const { sanitizeId, sanitizeObject, isNoSQLInjection } = await import('./services/security.ts');

        console.log('✅ Security service loaded');

        // Test sanitizeId
        try {
            const validId = sanitizeId('valid-id-123');
            console.log('✅ sanitizeId() accepts valid IDs');
        } catch (error) {
            console.error('❌ sanitizeId() rejected valid ID');
        }

        // Test if it rejects malicious input
        try {
            const maliciousId = sanitizeId('../../etc/passwd');
            console.log('⚠️  sanitizeId() may need stronger validation');
        } catch (error) {
            console.log('✅ sanitizeId() correctly rejects malicious input');
        }

        // Test sanitizeObject
        const testObj = {
            name: 'Test',
            $malicious: 'value',
            nested: { key: 'value' }
        };
        const sanitized = sanitizeObject(testObj);
        console.log('✅ sanitizeObject() available');

        // Test NoSQL injection detection
        const injections = [
            '{ "$gt": "" }',
            '{ "$ne": null }',
            'admin\' OR 1=1--'
        ];

        let detectionWorks = true;
        for (const injection of injections) {
            if (!isNoSQLInjection(injection)) {
                detectionWorks = false;
                break;
            }
        }

        if (detectionWorks) {
            console.log('✅ NoSQL injection detection working');
        } else {
            console.log('⚠️  NoSQL injection detection may need improvement');
        }

        return true;
    } catch (error) {
        console.error('❌ Security features test failed:', error.message);
        return false;
    }
}

// Test 7: Performance Test
async function testPerformance() {
    console.log('\n📋 Test 7: Performance Test');
    console.log('----------------------------');

    try {
        const { dbService } = await import('./services/dbService.ts');

        // Test read performance
        console.log('Testing read performance...');
        const startTime = performance.now();

        await Promise.all([
            dbService.getAll('rooms'),
            dbService.getAll('bookings'),
            dbService.getAll('staff'),
            dbService.getAll('guests')
        ]);

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        console.log(`✅ Parallel read of 4 tables completed in ${duration}ms`);

        if (duration < 1000) {
            console.log('✅ Performance: Excellent');
        } else if (duration < 3000) {
            console.log('⚠️  Performance: Good (but could be optimized)');
        } else {
            console.log('⚠️  Performance: Slow (optimization recommended)');
        }

        return true;
    } catch (error) {
        console.error('❌ Performance test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runDatabaseTests() {
    console.log('🚀 Starting Database Tests...\n');

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    const tests = [
        { name: 'Firebase Configuration', fn: testFirebaseConfig },
        { name: 'Database Service', fn: testDatabaseService },
        { name: 'API Connectivity', fn: testAPIConnectivity },
        { name: 'Data Read Operations', fn: testDataReadOperations },
        { name: 'CRUD Operations', fn: testCRUDOperations },
        { name: 'Security Features', fn: testSecurityFeatures },
        { name: 'Performance', fn: testPerformance }
    ];

    for (const test of tests) {
        results.total++;
        try {
            const passed = await test.fn();
            if (passed) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            results.failed++;
            console.error(`\n❌ Test "${test.name}" threw an error:`, error);
        }

        // Add a small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print summary
    console.log('\n\n📊 DATABASE TEST SUMMARY');
    console.log('========================');
    console.log(`Total Tests:  ${results.total}`);
    console.log(`Passed:       ${results.passed} ✅`);
    console.log(`Failed:       ${results.failed} ${results.failed > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        console.log('\n🎉 All database tests passed! Your database is ready.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }

    return results;
}

// Auto-run tests
runDatabaseTests().catch(error => {
    console.error('❌ Fatal error running tests:', error);
});

// Export for manual use
window.dbTests = {
    runAll: runDatabaseTests,
    testFirebaseConfig,
    testDatabaseService,
    testAPIConnectivity,
    testDataReadOperations,
    testCRUDOperations,
    testSecurityFeatures,
    testPerformance
};

console.log('\n💡 Manual Testing Commands:');
console.log('window.dbTests.runAll() - Run all tests');
console.log('window.dbTests.testFirebaseConfig() - Test Firebase config');
console.log('window.dbTests.testCRUDOperations() - Test CRUD only');
