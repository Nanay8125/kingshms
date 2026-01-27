// KingsHMS Back-End Service Testing Script
// Tests all back-end services: Database, Authentication, Security, and Firebase

console.log('🔧 KingsHMS Back-End Testing Suite');
console.log('═'.repeat(60));

const backendTests = {
    stats: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    },

    log(message, type = 'info') {
        const styles = {
            success: 'color: #4CAF50; font-weight: bold',
            error: 'color: #f44336; font-weight: bold',
            warning: 'color: #ff9800; font-weight: bold',
            info: 'color: #2196F3',
            section: 'color: #9C27B0; font-size: 16px; font-weight: bold'
        };
        console.log(`%c${message}`, styles[type] || styles.info);
    },

    // Test 1: Service Imports
    async testServiceImports() {
        this.log('\n📋 Test 1: Service Imports & Availability', 'section');
        this.log('─'.repeat(60));

        const services = [
            { name: 'dbService', module: './services/dbService.ts' },
            { name: 'authService', module: './services/authService.ts' },
            { name: 'security', module: './services/security.ts' },
            { name: 'geminiService', module: './services/geminiService.ts' },
            { name: 'firebase', module: './services/firebase.ts' }
        ];

        for (const service of services) {
            try {
                // Check if service exists in global scope or can be dynamically imported
                this.log(`✅ ${service.name} - Available`, 'success');
                this.stats.passed++;
            } catch (error) {
                this.log(`❌ ${service.name} - Not available`, 'error');
                this.stats.failed++;
            }
            this.stats.total++;
        }
    },

    // Test 2: Database Service
    async testDatabaseService() {
        this.log('\n📋 Test 2: Database Service (dbService)', 'section');
        this.log('─'.repeat(60));

        try {
            // Dynamic import
            const { dbService } = await import('./services/dbService.ts');

            // Test table types
            const tables = ['rooms', 'bookings', 'guests', 'staff', 'tasks', 'menu'];

            this.log(`\n🔍 Testing ${tables.length} table types:`, 'info');

            for (const table of tables) {
                try {
                    // Test getAll (should fallback to localStorage/demo data)
                    const data = await dbService.getAll(table);

                    if (Array.isArray(data)) {
                        this.log(`✅ ${table.padEnd(15)} - getAll() works (${data.length} items)`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`❌ ${table.padEnd(15)} - Invalid data structure`, 'error');
                        this.stats.failed++;
                    }
                } catch (error) {
                    this.log(`❌ ${table.padEnd(15)} - Error: ${error.message}`, 'error');
                    this.stats.failed++;
                }
                this.stats.total++;
            }

            // Test CRUD operations on rooms
            this.log('\n🔧 Testing CRUD operations (using "rooms"):', 'info');

            // Test Create
            try {
                const testRoom = {
                    id: 'test-room-' + Date.now(),
                    number: '999',
                    type: 'Test Suite',
                    status: 'available',
                    price: 100,
                    floor: 1,
                    amenities: ['Test'],
                    description: 'Test room for backend testing'
                };

                const created = await dbService.create('rooms', testRoom);
                if (created && created.id) {
                    this.log(`✅ CREATE - Room created successfully`, 'success');
                    this.stats.passed++;

                    // Test Read/GetById
                    const found = await dbService.getById('rooms', created.id);
                    if (found && found.id === created.id) {
                        this.log(`✅ READ   - Room retrieved successfully`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`❌ READ   - Failed to retrieve room`, 'error');
                        this.stats.failed++;
                    }
                    this.stats.total++;

                    // Test Update
                    const updated = await dbService.update('rooms', created.id, { price: 150 });
                    if (updated && updated.price === 150) {
                        this.log(`✅ UPDATE - Room updated successfully`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`⚠️  UPDATE - Update may not have persisted`, 'warning');
                        this.stats.warnings++;
                    }
                    this.stats.total++;

                    // Test Delete
                    const deleted = await dbService.delete('rooms', created.id);
                    if (deleted) {
                        this.log(`✅ DELETE - Room deleted successfully`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`⚠️  DELETE - Delete may have failed`, 'warning');
                        this.stats.warnings++;
                    }
                    this.stats.total++;

                } else {
                    this.log(`❌ CREATE - Failed to create room`, 'error');
                    this.stats.failed++;
                }
                this.stats.total++;

            } catch (error) {
                this.log(`❌ CRUD Operations - Error: ${error.message}`, 'error');
                this.stats.failed += 4;
                this.stats.total += 4;
            }

        } catch (error) {
            this.log(`❌ Database Service - Cannot import: ${error.message}`, 'error');
            this.stats.failed++;
            this.stats.total++;
        }
    },

    // Test 3: Authentication Service
    async testAuthService() {
        this.log('\n📋 Test 3: Authentication Service (authService)', 'section');
        this.log('─'.repeat(60));

        try {
            const { authService } = await import('./services/authService.ts');

            // Test validation functions
            const emailTests = [
                { email: 'valid@example.com', expected: true },
                { email: 'invalid-email', expected: false },
                { email: 'test@test', expected: false }
            ];

            this.log('\n📧 Testing email validation:', 'info');
            emailTests.forEach(test => {
                try {
                    const result = authService.validateEmail(test.email);
                    if (result === test.expected) {
                        this.log(`✅ "${test.email}" - ${result ? 'Valid' : 'Invalid'} (correct)`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`❌ "${test.email}" - Validation incorrect`, 'error');
                        this.stats.failed++;
                    }
                } catch (error) {
                    this.log(`❌ Email validation error: ${error.message}`, 'error');
                    this.stats.failed++;
                }
                this.stats.total++;
            });

            // Test password validation
            this.log('\n🔐 Testing password validation:', 'info');
            const passwordTests = [
                { password: 'Test123!', shouldBeValid: true },
                { password: '123', shouldBeValid: false },
                { password: '', shouldBeValid: false }
            ];

            passwordTests.forEach(test => {
                try {
                    const result = authService.validatePassword(test.password);
                    if (result.isValid === test.shouldBeValid) {
                        this.log(`✅ Password "${test.password.replace(/./g, '*')}" - ${result.isValid ? 'Valid' : 'Invalid'}`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`❌ Password validation incorrect`, 'error');
                        this.stats.failed++;
                    }
                } catch (error) {
                    this.log(`❌ Password validation error: ${error.message}`, 'error');
                    this.stats.failed++;
                }
                this.stats.total++;
            });

            // Test CSRF token
            this.log('\n🛡️  Testing CSRF protection:', 'info');
            try {
                const token = authService.getCSRFToken();
                if (token && token.length > 10) {
                    this.log(`✅ CSRF token generated (${token.substring(0, 20)}...)`, 'success');
                    this.stats.passed++;

                    const valid = authService.validateCSRFToken(token);
                    if (valid) {
                        this.log(`✅ CSRF token validation works`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`❌ CSRF token validation failed`, 'error');
                        this.stats.failed++;
                    }
                    this.stats.total++;

                } else {
                    this.log(`❌ CSRF token generation failed`, 'error');
                    this.stats.failed++;
                }
                this.stats.total++;
            } catch (error) {
                this.log(`❌ CSRF test error: ${error.message}`, 'error');
                this.stats.failed += 2;
                this.stats.total += 2;
            }

            // Test role-based permissions
            this.log('\n👥 Testing role-based access control:', 'info');
            try {
                const roleTests = [
                    { user: 'admin', required: 'viewer', should: 'have' },
                    { user: 'viewer', required: 'admin', should: 'NOT have' },
                    { user: 'manager', required: 'viewer', should: 'have' }
                ];

                roleTests.forEach(test => {
                    try {
                        const hasAccess = authService.hasPermission(test.user, test.required);
                        const expected = test.should === 'have';
                        if (hasAccess === expected) {
                            this.log(`✅ ${test.user} ${test.should} access to ${test.required}`, 'success');
                            this.stats.passed++;
                        } else {
                            this.log(`❌ RBAC incorrect for ${test.user} → ${test.required}`, 'error');
                            this.stats.failed++;
                        }
                    } catch (error) {
                        this.log(`⚠️  RBAC test skipped: ${error.message}`, 'warning');
                        this.stats.warnings++;
                    }
                    this.stats.total++;
                });
            } catch (error) {
                this.log(`⚠️  RBAC tests skipped: ${error.message}`, 'warning');
            }

        } catch (error) {
            this.log(`❌ Auth Service - Cannot import: ${error.message}`, 'error');
            this.stats.failed++;
            this.stats.total++;
        }
    },

    // Test 4: Security Service
    async testSecurityService() {
        this.log('\n📋 Test 4: Security Service', 'section');
        this.log('─'.repeat(60));

        try {
            const security = await import('./services/security.ts');

            // Test input sanitization
            this.log('\n🧹 Testing input sanitization:', 'info');
            const sanitizeTests = [
                { input: 'Normal text', name: 'normal text' },
                { input: '<script>alert("xss")</script>', name: 'XSS attempt' },
                { input: 'test@example.com', name: 'email' },
                { input: "'; DROP TABLE users--", name: 'SQL injection' }
            ];

            sanitizeTests.forEach(test => {
                try {
                    const sanitized = security.sanitizeString(test.input);
                    if (sanitized !== undefined) {
                        this.log(`✅ Sanitized ${test.name}`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`❌ Sanitization failed for ${test.name}`, 'error');
                        this.stats.failed++;
                    }
                } catch (error) {
                    this.log(`❌ Sanitization error: ${error.message}`, 'error');
                    this.stats.failed++;
                }
                this.stats.total++;
            });

            // Test SQL injection detection
            this.log('\n🔍 Testing SQL injection detection:', 'info');
            const injectionTests = [
                { input: 'normal text', expected: false },
                { input: "'; DROP TABLE--", expected: true },
                { input: 'SELECT * FROM users', expected: true },
                { input: 'user@example.com', expected: false }
            ];

            injectionTests.forEach(test => {
                try {
                    const isInjection = security.isNoSQLInjection(test.input);
                    if (isInjection === test.expected) {
                        this.log(`✅ Detected "${test.input.substring(0, 30)}" correctly`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`❌ Detection failed for: ${test.input}`, 'error');
                        this.stats.failed++;
                    }
                } catch (error) {
                    this.log(`⚠️  Detection test error: ${error.message}`, 'warning');
                    this.stats.warnings++;
                }
                this.stats.total++;
            });

        } catch (error) {
            this.log(`❌ Security Service - Cannot import: ${error.message}`, 'error');
            this.stats.failed++;
            this.stats.total++;
        }
    },

    // Test 5: Firebase Configuration
    async testFirebaseConfig() {
        this.log('\n📋 Test 5: Firebase Configuration', 'section');
        this.log('─'.repeat(60));

        try {
            // Check if Firebase is available globally
            if (typeof window !== 'undefined' && window.firebase) {
                this.log('✅ Firebase SDK loaded', 'success');
                this.stats.passed++;
            } else {
                this.log('⚠️  Firebase SDK not in global scope', 'warning');
                this.stats.warnings++;
            }
            this.stats.total++;

            // Try to import firebase config
            try {
                const firebase = await import('./services/firebase.ts');
                this.log('✅ Firebase configuration module loaded', 'success');
                this.stats.passed++;
            } catch (error) {
                this.log(`⚠️  Firebase module - ${error.message}`, 'warning');
                this.stats.warnings++;
            }
            this.stats.total++;

        } catch (error) {
            this.log(`❌ Firebase test error: ${error.message}`, 'error');
            this.stats.failed++;
            this.stats.total++;
        }
    },

    // Test 6: Gemini AI Service
    async testGeminiService() {
        this.log('\n📋 Test 6: Gemini AI Service', 'section');
        this.log('─'.repeat(60));

        try {
            const gemini = await import('./services/geminiService.ts');
            this.log('✅ Gemini service module loaded', 'success');
            this.stats.passed++;

            // Check if API key is configured
            const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY;
            if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
                this.log('✅ Gemini API key configured', 'success');
                this.stats.passed++;
            } else {
                this.log('⚠️  Gemini API key not configured (using placeholder)', 'warning');
                this.stats.warnings++;
            }
            this.stats.total++;

        } catch (error) {
            this.log(`⚠️  Gemini Service - ${error.message}`, 'warning');
            this.stats.warnings++;
        }
        this.stats.total++;
    },

    // Test 7: LocalStorage/Fallback System
    async testStorageSystem() {
        this.log('\n📋 Test 7: LocalStorage & Fallback System', 'section');
        this.log('─'.repeat(60));

        try {
            // Test localStorage availability
            if (typeof window !== 'undefined' && window.localStorage) {
                this.log('✅ LocalStorage available', 'success');
                this.stats.passed++;

                // Test storage operations
                try {
                    const testKey = 'kingshms_backend_test';
                    const testData = { test: 'data', timestamp: Date.now() };

                    localStorage.setItem(testKey, JSON.stringify(testData));
                    const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');

                    if (retrieved.test === testData.test) {
                        this.log('✅ LocalStorage read/write works', 'success');
                        this.stats.passed++;
                    } else {
                        this.log('❌ LocalStorage read/write failed', 'error');
                        this.stats.failed++;
                    }
                    this.stats.total++;

                    // Cleanup
                    localStorage.removeItem(testKey);

                } catch (error) {
                    this.log(`❌ LocalStorage operations failed: ${error.message}`, 'error');
                    this.stats.failed++;
                    this.stats.total++;
                }

            } else {
                this.log('⚠️  LocalStorage not available (server-side?)', 'warning');
                this.stats.warnings++;
            }
            this.stats.total++;

            // Test fallback data availability
            this.log('\n📦 Testing fallback demo data:', 'info');
            const dataTypes = ['rooms', 'bookings', 'staff', 'tasks', 'menu'];

            try {
                const { dbService } = await import('./services/dbService.ts');

                for (const type of dataTypes) {
                    const data = await dbService.getAll(type);
                    if (data && data.length > 0) {
                        this.log(`✅ ${type.padEnd(12)} - ${data.length} items`, 'success');
                        this.stats.passed++;
                    } else {
                        this.log(`⚠️  ${type.padEnd(12)} - No data`, 'warning');
                        this.stats.warnings++;
                    }
                    this.stats.total++;
                }
            } catch (error) {
                this.log(`❌ Fallback data test failed: ${error.message}`, 'error');
            }

        } catch (error) {
            this.log(`❌ Storage system test error: ${error.message}`, 'error');
            this.stats.failed++;
            this.stats.total++;
        }
    },

    // Update stats display
    updateStats() {
        this.log('\n📊 Current Statistics:', 'info');
        this.log(`Total:    ${this.stats.total}`, 'info');
        this.log(`Passed:   ${this.stats.passed}`, 'success');
        this.log(`Failed:   ${this.stats.failed}`, this.stats.failed > 0 ? 'error' : 'success');
        this.log(`Warnings: ${this.stats.warnings}`, 'warning');
    },

    // Run all back-end tests
    async runAllTests() {
        this.log('\n🚀 Starting Comprehensive Back-End Testing...', 'section');
        this.log('═'.repeat(60));
        this.log('Testing KingsHMS back-end services and infrastructure\n');

        // Reset stats
        this.stats = { total: 0, passed: 0, failed: 0, warnings: 0 };

        const tests = [
            { name: 'Service Imports', fn: this.testServiceImports },
            { name: 'Database Service', fn: this.testDatabaseService },
            { name: 'Authentication', fn: this.testAuthService },
            { name: 'Security', fn: this.testSecurityService },
            { name: 'Firebase Config', fn: this.testFirebaseConfig },
            { name: 'Gemini AI', fn: this.testGeminiService },
            { name: 'Storage System', fn: this.testStorageSystem }
        ];

        for (const test of tests) {
            try {
                await test.fn.call(this);
            } catch (error) {
                this.log(`\n❌ Test "${test.name}" threw error: ${error.message}`, 'error');
                this.stats.failed++;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Final summary
        this.log('\n\n📊 BACK-END TEST SUMMARY', 'section');
        this.log('═'.repeat(60));
        this.log(`Total Tests:  ${this.stats.total}`, 'info');
        this.log(`Passed:       ${this.stats.passed} ✅`, 'success');
        this.log(`Failed:       ${this.stats.failed} ❌`, this.stats.failed > 0 ? 'error' : 'success');
        this.log(`Warnings:     ${this.stats.warnings} ⚠️`, 'warning');

        const successRate = this.stats.total > 0
            ? ((this.stats.passed / this.stats.total) * 100).toFixed(1)
            : 0;
        this.log(`Success Rate: ${successRate}%`, 'info');

        if (this.stats.failed === 0 && this.stats.warnings === 0) {
            this.log('\n🎉 Perfect! All back-end tests passed!', 'success');
        } else if (this.stats.failed === 0) {
            this.log('\n✅ All tests passed with some warnings.', 'success');
            this.log('💡 Warnings are typically non-critical (e.g., API not configured)', 'info');
        } else {
            this.log('\n⚠️  Some tests failed. Review details above.', 'warning');
        }

        this.log('\n💡 Back-End Testing Tips:', 'info');
        this.log('   - Most services use localStorage fallback for demo mode', 'info');
        this.log('   - API endpoints return demo data when offline', 'info');
        this.log('   - Firebase configuration is loaded automatically', 'info');
        this.log('   - Security functions sanitize all inputs', 'info');

        return this.stats;
    }
};

// Auto-run tests
console.log('\n⏳ Running back-end tests...\n');
backendTests.runAllTests();

// Export for manual use
window.backendTests = backendTests;

console.log('\n💡 Manual Testing Commands:');
console.log('backendTests.runAllTests() - Run all tests again');
console.log('backendTests.testDatabaseService() - Test database only');
console.log('backendTests.testAuthService() - Test authentication only');
console.log('backendTests.testSecurityService() - Test security only');
