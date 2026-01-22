import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// MySQL connection configuration
const config = {
    host: process.env.VITE_DB_HOST || 'localhost',
    port: parseInt(process.env.VITE_DB_PORT || '3306'),
    user: process.env.VITE_DB_USER || 'root',
    password: process.env.VITE_DB_PASSWORD || '',
    database: process.env.VITE_DB_NAME || 'kingshms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
    if (!pool) {
        pool = mysql.createPool(config);
    }
    return pool;
};

// Helper function to execute queries with prepared statements
export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    try {
        const connection = await getPool().getConnection();
        try {
            const [rows] = await connection.execute(sql, params);
            return rows as T[];
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Database error:', error);
        throw new Error(`Database query failed: ${error.message}`);
    }
};

// Helper for single row queries
export const queryOne = async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
    const results = await query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
    try {
        await query('SELECT 1');
        console.log('✅ MySQL connected successfully');
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error);
        return false;
    }
};

export default { getPool, query, queryOne, testConnection };
