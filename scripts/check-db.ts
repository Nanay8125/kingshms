import { testConnection } from '../services/mysqlClient';

async function check() {
  console.log('Testing MySQL Connection...');
  const success = await testConnection();
  if (success) {
    console.log('✅ Connection successful!');
    process.exit(0);
  } else {
    console.log('❌ Connection failed.');
    process.exit(1);
  }
}

check();
