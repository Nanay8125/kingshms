import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getPool, query, queryOne } from '../services/mysqlClient.js';
import {
    sanitizeId,
    sanitizeObject,
    isNoSQLInjection
} from '../services/security.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Helpers (Duplicated from dbService for now, or imported if aligned)
// Since this is the server, we can use the mysqlClient directly.

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

// Helper to check company scope
const isCompanyScoped = (table: TableName): boolean => {
    const companyScopedTables: TableName[] = [
        'rooms', 'guests', 'tasks', 'staff', 'menu'
    ];
    return companyScopedTables.includes(table);
};

// Conversion Helpers
const convertToDB = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== 'object') return obj;

    const converted: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            const value = obj[key];

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
};

const convertFromDB = (rows: any[]): any[] => {
    return rows.map(row => {
        const converted: any = {};
        for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                const value = row[key];

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
};

// --- API Endpoints ---

// Helper for error handling
const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// GET All
app.get('/api/:table', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as TableName;
    const companyId = req.query.companyId as string;

    if (!TABLE_MAP[table]) {
        return res.status(400).json({ error: 'Invalid table name' });
    }

    const mysqlTable = TABLE_MAP[table];
    let sql = `SELECT * FROM ${mysqlTable}`;
    const params: any[] = [];

    if (companyId && isCompanyScoped(table)) {
        sql += ' WHERE company_id = ?';
        params.push(companyId);
    }

    sql += ' ORDER BY created_at DESC';

    const results = await query(sql, params);
    res.json(convertFromDB(results));
}));

// GET By ID
app.get('/api/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as TableName;
    const id = req.params.id;
    const companyId = req.query.companyId as string;

    if (!TABLE_MAP[table]) {
        return res.status(400).json({ error: 'Invalid table name' });
    }

    try {
        sanitizeId(id as string);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const mysqlTable = TABLE_MAP[table];
    let sql = `SELECT * FROM ${mysqlTable} WHERE id = ?`;
    const params: any[] = [id];

    if (companyId && isCompanyScoped(table)) {
        sql += ' AND company_id = ?';
        params.push(companyId);
    }

    const result = await queryOne(sql, params);
    if (!result) {
        return res.status(404).json({ error: 'Item not found' });
    }
    res.json(convertFromDB([result])[0]);
}));

// CREATE
app.post('/api/:table', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as TableName;
    const item = req.body;
    const companyId = req.query.companyId as string;

    if (!TABLE_MAP[table]) {
        return res.status(400).json({ error: 'Invalid table name' });
    }

    let sanitized: any;
    try {
        sanitized = sanitizeObject(item);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }

    if (companyId && isCompanyScoped(table)) {
        sanitized.companyId = companyId;
    }

    if (!sanitized.id) {
        sanitized.id = uuidv4();
    }

    const dbData = convertToDB(sanitized);
    const mysqlTable = TABLE_MAP[table];

    const columns = Object.keys(dbData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(dbData);

    const sql = `INSERT INTO ${mysqlTable} (${columns.join(', ')}) VALUES (${placeholders})`;

    await query(sql, values);

    // Fetch and return the clean object
    const fetchSql = `SELECT * FROM ${mysqlTable} WHERE id = ?`;
    const result = await queryOne(fetchSql, [sanitized.id]);
    res.status(201).json(convertFromDB([result])[0]);
}));

// UPDATE
app.put('/api/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as TableName;
    const id = req.params.id;
    const updates = req.body;

    if (!TABLE_MAP[table]) {
        return res.status(400).json({ error: 'Invalid table name' });
    }

    try {
        sanitizeId(id as string);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const sanitized = sanitizeObject(updates);
    const dbData = convertToDB(sanitized);
    delete dbData.id; // Don't allow ID update

    if (Object.keys(dbData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }

    const mysqlTable = TABLE_MAP[table];
    const setClause = Object.keys(dbData).map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(dbData), id];

    const sql = `UPDATE ${mysqlTable} SET ${setClause} WHERE id = ?`;
    await query(sql, values);

    const fetchSql = `SELECT * FROM ${mysqlTable} WHERE id = ?`;
    const result = await queryOne(fetchSql, [id]);
    res.json(convertFromDB([result])[0]);
}));

// DELETE
app.delete('/api/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as TableName;
    const id = req.params.id;

    if (!TABLE_MAP[table]) {
        return res.status(400).json({ error: 'Invalid table name' });
    }

    try {
        sanitizeId(id as string);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const mysqlTable = TABLE_MAP[table];
    const sql = `DELETE FROM ${mysqlTable} WHERE id = ?`;
    await query(sql, [id]);

    res.json({ success: true });
}));

// Start Server
app.listen(port, () => {
    console.log(`✅ API Server running on port ${port}`);
});
