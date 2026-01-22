import {
    sanitizeId,
    sanitizeObject,
    isNoSQLInjection
} from './security';
import { v4 as uuidv4 } from 'uuid';
import {
    INITIAL_ROOMS,
    INITIAL_BOOKINGS,
    INITIAL_GUESTS,
    INITIAL_CATEGORIES,
    INITIAL_TASKS,
    INITIAL_TEMPLATES,
    INITIAL_STAFF,
    INITIAL_FEEDBACK,
    INITIAL_CONVERSATIONS,
    INITIAL_MENU
} from '../constants';

// Table name type definition
export type TableName =
    | 'companies' | 'rooms' | 'bookings' | 'guests' | 'categories'
    | 'tasks' | 'templates' | 'staff' | 'feedback' | 'emails'
    | 'notifications' | 'conversations' | 'menu';

const API_Base = 'http://localhost:3001/api';

// Fallback data for demo when API is not available
const getFallbackData = (table: TableName): any[] => {
    switch (table) {
        case 'rooms': return INITIAL_ROOMS;
        case 'bookings': return INITIAL_BOOKINGS;
        case 'guests': return INITIAL_GUESTS;
        case 'categories': return INITIAL_CATEGORIES;
        case 'tasks': return INITIAL_TASKS;
        case 'templates': return INITIAL_TEMPLATES;
        case 'staff': return INITIAL_STAFF;
        case 'feedback': return INITIAL_FEEDBACK;
        case 'conversations': return INITIAL_CONVERSATIONS;
        case 'menu': return INITIAL_MENU;
        default: return [];
    }
};

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
            // Return fallback data for demo when API is not available
            return getFallbackData(table) as T[];
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

        try {
            const response = await fetch(`${API_Base}/${table}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitized)
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
            // For demo purposes, return the updates with the ID when API is not available
            return { ...sanitized, id } as T;
        }
    }

    async delete(table: TableName, id: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_Base}/${table}/${id}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Delete error:', error);
            // For demo purposes, return true when API is not available
            return true;
        }
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
