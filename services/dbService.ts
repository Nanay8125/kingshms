import {
    sanitizeId,
    sanitizeObject,
    isNoSQLInjection
} from './security';
import { logError, trackEvent } from './monitoringService';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog, AuditAction } from '../types';
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
    | 'notifications' | 'conversations' | 'menu' | 'audit_logs' | 'security_logs';

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
            'rooms', 'bookings', 'guests', 'categories', 'tasks', 'staff', 'feedback', 'emails', 'notifications', 'conversations', 'menu'
        ];
        return companyScopedTables.includes(table);
    }

    private getLocalData(table: TableName): any[] {
        if (typeof window === 'undefined' || !window.localStorage) {
            return getFallbackData(table);
        }
        const data = localStorage.getItem(`kingshms_${table}`);
        return data ? JSON.parse(data) : getFallbackData(table);
    }

    private setLocalData(table: TableName, data: any[]): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(`kingshms_${table}`, JSON.stringify(data));
        }
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
            logError(error as Error, { table, companyId, action: 'getAll' });
            // Return local data or fallback data for demo when API is not available
            return this.getLocalData(table) as T[];
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
            // Fallback to local data
            const localData = this.getLocalData(table);
            return localData.find(item => item.id === id) as T | undefined;
        }
    }

    async create<T>(table: TableName, item: any, companyId?: string): Promise<T> {
        // Sanitize locally
        const sanitized = sanitizeObject(item);

        let url = `${API_Base}/${table}`;
        if (companyId && this.isCompanyScoped(table)) {
            url += `?companyId=${encodeURIComponent(companyId)}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitized)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Creation failed');
            }
            const result = await response.json();
            trackEvent('resource_created', { table, companyId });
            return result;
        } catch (error) {
            logError(error as Error, { table, action: 'create', item: sanitized });
            // For demo purposes, persist to localStorage when API is not available
            const localData = this.getLocalData(table);
            const newItem = { ...sanitized, id: sanitized.id || uuidv4() };
            localData.push(newItem);
            this.setLocalData(table, localData);
            trackEvent('resource_created_local', { table, companyId });
            return newItem as T;
        }
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
            // For demo purposes, persist to localStorage when API is not available
            const localData = this.getLocalData(table);
            const index = localData.findIndex(item => item.id === id);
            if (index !== -1) {
                const updatedItem = { ...localData[index], ...sanitized };
                localData[index] = updatedItem;
                this.setLocalData(table, localData);
                return updatedItem as T;
            }
            return undefined;
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
            // For demo purposes, persist to localStorage when API is not available
            const localData = this.getLocalData(table);
            const index = localData.findIndex(item => item.id === id);
            if (index !== -1) {
                localData.splice(index, 1);
                this.setLocalData(table, localData);
                return true;
            }
            return false;
        }
    }

    // kept for compatibility but implemented naively
    async updateCollection<T>(table: TableName, companyId: string, items: T[]): Promise<void> {
        // This is complex to support transactionally over simple REST API
        // For now, log warning
        console.warn('updateCollection not fully supported in API mode');
    }

    async addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
        const fullLog: AuditLog = {
            ...log,
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            ipAddress: 'detected-on-server', // In a real app, this would be from the request
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node.js'
        };

        try {
            await this.create('audit_logs', fullLog, log.companyId);
            trackEvent('audit_log_added', { action: log.action, resource: log.resource });
        } catch (error) {
            console.error("Failed to persist audit log:", error);
            // Fallback to local storage if API is down
            const localLogs = this.getLocalData('audit_logs');
            localLogs.push(fullLog);
            this.setLocalData('audit_logs', localLogs);
        }
    }
}

export const dbService = new DatabaseService();
export default dbService;
