import { query, queryOne } from './mysqlClient';
import {
    sanitizeId,
    sanitizeObject,
    isNoSQLInjection
} from './security';
import { v4 as uuidv4 } from 'uuid';

// Table name mapping (TypeScript to MySQL)
type TableName =
    | 'companies' | 'rooms' | 'bookings' | 'guests' | 'categories'
    | 'tasks' | 'templates' | 'staff' | 'feedback' | 'emails'
    | 'notifications' | 'conversations' | 'menu';

const TABLE_MAP: Record<TableName, string> = {
    companies: 'companies',
    rooms: 'rooms',
    bookings: 'bookings',
    guests: 'guests',
    categories: 'room_categories',
    tasks: 'tasks',
    templates: 'task_templates',
    staff: 'staff_members',
    feedback: 'feedback',
    emails: 'staff_emails',
    notifications: 'notifications',
    conversations: 'conversations',
    menu: 'menu_items'
};

// MySQL database service
class DatabaseService {
    private isCompanyScoped(table: TableName): boolean {
        const companyScopedTables: TableName[] = [
            'rooms', 'bookings', 'guests', 'tasks', 'staff', 'feedback', 'emails', 'notifications', 'conversations', 'menu'
        ];
        return companyScopedTables.includes(table);
    }

    async getAll<T>(table: TableName, companyId?: string): Promise<T[]> {
        const mysqlTable = TABLE_MAP[table];
        let sql = `SELECT * FROM ${mysqlTable}`;
        const params: any[] = [];

        // Filter by companyId for tenant-specific tables
        if (companyId && this.isCompanyScoped(table)) {
            sql += ' WHERE company_id = ?';
            params.push(companyId);
        }

        sql += ' ORDER BY created_at DESC';

        const results = await query<T>(sql, params);
        return this.convertFromDB(results);
    }

    async getById<T>(table: TableName, id: string, companyId?: string): Promise<T | undefined> {
        // Validate and sanitize ID
        let sanitizedId: string;
        try {
            sanitizedId = sanitizeId(id);
        } catch (error) {
            console.error('Invalid ID provided:', error);
            return undefined;
        }

        // Check for NoSQL injection attempts
        if (isNoSQLInjection(id)) {
            throw new Error('Potential injection detected');
        }

        const mysqlTable = TABLE_MAP[table];
        let sql = `SELECT * FROM ${mysqlTable} WHERE id = ?`;
        const params: any[] = [sanitizedId];

        // Add company filter if needed
        if (companyId && this.isCompanyScoped(table)) {
            sql += ' AND company_id = ?';
            params.push(companyId);
        }

        const result = await queryOne<T>(sql, params);
        return result ? this.convertFromDB([result])[0] : undefined;
    }

    async create<T>(table: TableName, item: any, companyId?: string): Promise<T> {
        // Sanitize the entire object
        let sanitized: any;
        try {
            sanitized = sanitizeObject(item);
        } catch (error: any) {
            throw new Error(`Validation failed: ${error.message}`);
        }

        // Add company ID if needed
        if (companyId && this.isCompanyScoped(table)) {
            sanitized.companyId = companyId;
        }

        // Generate ID if not provided
        if (!sanitized.id) {
            sanitized.id = uuidv4();
        }

        // Convert to DB format
        const dbData = this.convertToDB(sanitized);
        const mysqlTable = TABLE_MAP[table];

        // Build INSERT query
        const columns = Object.keys(dbData);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(dbData);

        const sql = `INSERT INTO ${mysqlTable} (${columns.join(', ')}) VALUES (${placeholders})`;

        await query(sql, values);

        // Return the created item
        return this.getById<T>(table, sanitized.id, companyId) as Promise<T>;
    }

    async update<T>(table: TableName, id: string, updates: any): Promise<T | undefined> {
        // Validate and sanitize ID
        let sanitizedId: string;
        try {
            sanitizedId = sanitizeId(id);
        } catch (error) {
            throw new Error('Invalid ID format');
        }

        // Sanitize updates
        const sanitized = sanitizeObject(updates);
        const dbData = this.convertToDB(sanitized);

        // Remove id from updates
        delete dbData.id;

        if (Object.keys(dbData).length === 0) {
            throw new Error('No valid fields to update');
        }

        const mysqlTable = TABLE_MAP[table];
        const setClause = Object.keys(dbData).map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(dbData), sanitizedId];

        const sql = `UPDATE ${mysqlTable} SET ${setClause} WHERE id = ?`;

        await query(sql, values);

        // Return the updated item
        return this.getById<T>(table, sanitizedId);
    }

    async delete(table: TableName, id: string): Promise<boolean> {
        // Validate and sanitize ID
        let sanitizedId: string;
        try {
            sanitizedId = sanitizeId(id);
        } catch (error) {
            throw new Error('Invalid ID format');
        }

        const mysqlTable = TABLE_MAP[table];
        const sql = `DELETE FROM ${mysqlTable} WHERE id = ?`;

        await query(sql, [sanitizedId]);
        return true;
    }

    // Convert camelCase to snake_case for MySQL
    private convertToDB(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        if (Array.isArray(obj)) return obj;
        if (typeof obj !== 'object') return obj;

        const converted: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                const value = obj[key];

                // Convert JSON fields
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    converted[snakeKey] = JSON.stringify(value);
                } else if (Array.isArray(value)) {
                    converted[snakeKey] = JSON.stringify(value);
                } else {
                    converted[snakeKey] = value;
                }
            }
        }
        return converted;
    }

    // Convert snake_case to camelCase from MySQL
    private convertFromDB(rows: any[]): any[] {
        return rows.map(row => {
            const converted: any = {};
            for (const key in row) {
                if (row.hasOwnProperty(key)) {
                    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    const value = row[key];

                    // Parse JSON fields
                    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                        try {
                            converted[camelKey] = JSON.parse(value);
                        } catch {
                            converted[camelKey] = value;
                        }
                    } else {
                        converted[camelKey] = value;
                    }
                }
            }
            return converted;
        });
    }

    async updateCollection<T>(table: TableName, companyId: string, items: T[]): Promise<void> {
        // This method is used by components - we'll need to handle it differently
        // For now, we'll delete all items for this company and re-insert
        const mysqlTable = TABLE_MAP[table];

        // Delete existing items
        await query(`DELETE FROM ${mysqlTable} WHERE company_id = ?`, [companyId]);

        // Insert new items
        for (const item of items) {
            await this.create(table, item, companyId);
        }
    }
}

export const dbService = new DatabaseService();
export default dbService;
