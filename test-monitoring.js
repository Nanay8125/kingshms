// KingsHMS Monitoring & Audit Log Testing Script
// Validates Sentry, PostHog, and Audit Logging integration

console.log('🛡️ KingsHMS Monitoring & Audit Test Suite');
console.log('═'.repeat(60));

const testMonitoring = {
    stats: { total: 0, passed: 0, failed: 0 },

    log(msg, success = true) {
        console.log(`${success ? '✅' : '❌'} ${msg}`);
        this.stats.total++;
        if (success) this.stats.passed++;
        else this.stats.failed++;
    },

    async runTests() {
        console.log('\n🔍 Phase 1: Service Availability');

        // 1. Check if monitoringService is exported and accessible via index.tsx/App.tsx flow
        // Since we're in the browser, we'll try to import the service
        try {
            const monitoring = await import('./services/monitoringService.ts');
            this.log('Monitoring Service module loaded successfully');

            // 2. Test Error Logging
            try {
                monitoring.logError(new Error('Test Error for Monitoring Suite'), { testSession: true });
                this.log('logError function executed without crashing');
            } catch (e) {
                this.log('logError function failed: ' + e.message, false);
            }

            // 3. Test Event Tracking
            try {
                monitoring.trackEvent('test_suite_run', { timestamp: Date.now() });
                this.log('trackEvent function executed without crashing');
            } catch (e) {
                this.log('trackEvent function failed: ' + e.message, false);
            }

        } catch (e) {
            this.log('Failed to import monitoringService: ' + e.message, false);
        }

        console.log('\n🔍 Phase 2: Audit Logging');

        try {
            const { dbService } = await import('./services/dbService.ts');
            const { AuditAction } = await import('./types.ts');

            // 4. Test adding an audit log
            const testLog = {
                userId: 'test-user-id',
                userName: 'Test Auditor',
                companyId: 'test-company-1',
                action: AuditAction.ACCESS,
                resource: 'test_suite',
                details: 'Running automated monitoring tests'
            };

            await dbService.addAuditLog(testLog);
            this.log('Audit log entry created via dbService');

            // 5. Verify persistence in localStorage (since we're likely in demo mode)
            const localLogs = JSON.parse(localStorage.getItem('kingshms_audit_logs') || '[]');
            const found = localLogs.find(l => l.userName === 'Test Auditor' && l.resource === 'test_suite');

            if (found) {
                this.log('Audit log successfully persisted to localStorage');
                console.log('   ↳ Entry:', found);
            } else {
                this.log('Audit log not found in localStorage', false);
            }

        } catch (e) {
            this.log('Audit Logging test failed: ' + e.message, false);
        }

        console.log('\n🔍 Phase 3: Auth Integration Check');

        try {
            const { authService } = await import('./services/authService.ts');

            if (authService.login && authService.logout) {
                this.log('AuthService has login/logout methods for integration');
            } else {
                this.log('AuthService methods missing', false);
            }
        } catch (e) {
            this.log('Auth integration check failed: ' + e.message, false);
        }

        // Summary
        console.log('\n' + '═'.repeat(60));
        console.log(`📊 TEST SUMMARY: ${this.stats.passed}/${this.stats.total} Passed`);
        if (this.stats.failed === 0) {
            console.log('🎉 Monitoring & Audit system is correctly integrated!');
        } else {
            console.log('⚠️ Some integration tests failed. Check console for details.');
        }
    }
};

// Run tests
testMonitoring.runTests();
