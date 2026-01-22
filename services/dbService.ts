import {
    sanitizeId,
    sanitizeObject,
    isNoSQLInjection
} from './security';
import { v4 as uuidv4 } from 'uuid';

// Table name type definition
export type TableName =
    | 'companies' | 'rooms' | 'bookings' | 'guests' | 'categories'
    | 'tasks' | 'templates' | 'staff' | 'feedback' | 'emails'
    | 'notifications' | 'conversations' | 'menu';

const API_Base = 'http://localhost:3001/api';

class DatabaseService {
    private isCompanyScoped(table: TableName): boolean {
        const companyScopedTables: TableName[] = [
            'rooms', 'bookings', 'guests', 'tasks', 'staff', 'feedback', 'emails', 'notifications', 'conversations', 'menu'
        ];
        return companyScopedTables.includes(table);
    }

    async getAll<T>(table: TableName, companyId?: string): Promise<T[]> {
        let url = `${API_Base}/${table}`;
        if (companyId && this.isCompanyScoped(table)) {
            url += `?companyId=${encodeURIComponent(companyId)}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    }

    async getById<T>(table: TableName, id: string, companyId?: string): Promise<T | undefined> {
        // Validate ID locally first
        try {
            sanitizeId(id);
        } catch (error) {
            console.error('Invalid ID:', error);
            return undefined;
        }

        let url = `${API_Base}/${table}/${id}`;
        if (companyId && this.isCompanyScoped(table)) {
            url += `?companyId=${encodeURIComponent(companyId)}`;
        }

        try {
            const response = await fetch(url);
            if (response.status === 404) return undefined;
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return undefined;
        }
    }

    async create<T>(table: TableName, item: any, companyId?: string): Promise<T> {
        // Sanitize locally
        const sanitized = sanitizeObject(item);

        let url = `${API_Base}/${table}`;
        if (companyId && this.isCompanyScoped(table)) {
            url += `?companyId=${encodeURIComponent(companyId)}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitized)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Creation failed');
        }
        return await response.json();
    }

    async update<T>(table: TableName, id: string, updates: any): Promise<T | undefined> {
        const sanitized = sanitizeObject(updates);

        const response = await fetch(`${API_Base}/${table}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitized)
        });

        if (!response.ok) {
            throw new Error('Update failed');
        }
        return await response.json();
    }

    async delete(table: TableName, id: string): Promise<boolean> {
        const response = await fetch(`${API_Base}/${table}/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    }

    // kept for compatibility but implemented naively
    async updateCollection<T>(table: TableName, companyId: string, items: T[]): Promise<void> {
        // This is complex to support transactionally over simple REST API
        // For now, log warning
        console.warn('updateCollection not fully supported in API mode');
    }
}

export const dbService = new DatabaseService();
export default dbService;
