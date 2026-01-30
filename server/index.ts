import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { dbService } from '../services/mysqlDbService.js';
import { v4 as uuidv4 } from 'uuid';

// --- Environment Validation ---
const REQUIRED_ENV = ['VITE_DB_HOST', 'VITE_DB_USER', 'VITE_DB_NAME'];
const missingEnv = REQUIRED_ENV.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

const app = express();
const port = 3001;

// --- Security Middleware ---
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors());
app.use(express.json());

// Rate Limiting: 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// --- Error Handling Utility ---
class APIError extends Error {
    constructor(public message: string, public statusCode: number = 500) {
        super(message);
    }
}

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// --- API Router (v1) ---
const v1Router = express.Router();

// GET All
v1Router.get('/:table', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const companyId = req.query.companyId as string;

    const results = await dbService.getAll(table, companyId);
    res.json(results);
}));

// GET By ID
v1Router.get('/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const id = req.params.id;
    const companyId = req.query.companyId as string;

    const result = await dbService.getById(table, id, companyId);
    if (!result) {
        throw new APIError('Item not found', 404);
    }
    res.json(result);
}));

// CREATE
v1Router.post('/:table', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const item = req.body;
    const companyId = req.query.companyId as string;

    const result = await dbService.create(table, item, companyId);
    res.status(201).json(result);
}));

// UPDATE
v1Router.put('/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const id = req.params.id;
    const updates = req.body;

    const result = await dbService.update(table, id, updates);
    res.json(result);
}));

// DELETE
v1Router.delete('/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const id = req.params.id;

    await dbService.delete(table, id);
    res.json({ success: true });
}));

// Mount API Versions
app.use('/api/v1', v1Router);
// Maintain backward compatibility for now
app.use('/api', v1Router);

// --- Centralized Error Handling Middleware ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${err.message}`);
    const statusCode = err instanceof APIError ? err.statusCode : 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;
    
    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start Server
app.listen(port, () => {
    console.log(`✅ API Server running on port ${port}`);
});
