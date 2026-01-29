import { testConnection } from './services/mysqlClient.js';
console.log('Testing connection...');
testConnection().then(res => console.log('Result:', res));
