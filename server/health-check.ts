import { testConnection } from '../services/mysqlClient.js';



async function checkHealth() {
    console.log('🔍 Starting Cloud Deployment Health Check...');


    // 1. Check Database Connectivity
    console.log('\n--- Database Check ---');
    const dbConnected = await testConnection();
    if (dbConnected) {
        console.log('✅ Database: Connected successfully');
    } else {
        console.log('❌ Database: Connection failed. Check VITE_DB_HOST/USER/PASSWORD/NAME');
    }

    // 2. Check Gemini API Key
    console.log('\n--- AI Service Check ---');
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PLACEHOLDER_API_KEY') {
        console.log('✅ Gemini API: Key is configured');
    } else {
        console.log('⚠️ Gemini API: Key is missing or using placeholder');
    }

    // 3. Environment Summary
    console.log('\n--- Environment Summary ---');
    console.log(`Node Version: ${process.version}`);
    console.log(`Port: ${process.env.PORT || 3001}`);
    console.log(`DB Host: ${process.env.VITE_DB_HOST || 'Not set'}`);

    if (dbConnected) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

checkHealth().catch(err => {
    console.error('💥 Health check failed with error:', err);
    process.exit(1);
});
