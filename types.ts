
export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskType {
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  SERVICE = 'service',
  FRONT_DESK = 'front-desk',
  DINING = 'dining'
}

export enum StaffStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ON_BREAK = 'on-break'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGEMENT = 'management',
  FRONT_DESK = 'front_desk',
  HOUSEKEEPING = 'housekeeping',
  MAINTENANCE = 'maintenance'
}

export type Language = 'en' | 'fr';

export interface Company {
  id: string;
  name: string;
  subdomain: string; // For URL-based tenant identification
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  timezone: string;
  currency: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface MenuItem {
  id: string;
  companyId: string;
  name: string;
  description: string;
  price: number;
  category: 'Breakfast' | 'Main Course' | 'Drinks' | 'Desserts' | 'Snacks';
  image: string;
  available: boolean;
}

export interface AccessKey {
  id: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  description?: string;
  active: boolean;
}

export enum APIService {
  FIREBASE = 'firebase',
  GEMINI = 'gemini',
  PAYMENT = 'payment',
  EMAIL = 'email',
  SMS = 'sms'
}

export interface RESTCredential {
  id: string;
  service: APIService;
  apiKey?: string;
  secretKey?: string;
  accessToken?: string;
  refreshToken?: string;
  endpoint?: string;
  createdAt: string;
  lastUsed?: string;
  description?: string;
  active: boolean;
  encrypted: boolean;
}

export interface StaffMember {
  id: string;
  companyId: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  permissionRole: UserRole;
  department: 'Housekeeping' | 'Front Desk' | 'Management' | 'Maintenance' | 'Concierge' | 'Finance';
  status: StaffStatus;
  avatar: string;
  phone: string;
  accessKeys?: AccessKey[];
  restCredentials?: RESTCredential[];
}

export interface ChatMessage {
  id: string;
  sender: 'guest' | 'staff' | 'ai';
  text: string;
  timestamp: string;
  translatedText?: string;
}

export interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface Task {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  roomId?: string;
  assignedStaffId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
}

export interface Feedback {
  id: string;
  bookingId: string;
  guestId: string;
  roomId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface StaffEmail {
  id: string;
  recipientDept: 'Housekeeping' | 'Front Desk' | 'Management' | 'Finance' | 'Concierge';
  subject: string;
  body: string;
  type: 'booking_new' | 'check_in' | 'check_out' | 'follow_up';
  timestamp: string;
  isRead: boolean;
}

export interface InAppNotification {
  id: string;
  staffId: string;
  title: string;
  message: string;
  type: 'task' | 'booking' | 'system';
  timestamp: string;
  read: boolean;
}

export interface RoomCategory {
  id: string;
  companyId: string;
  name: string;
  basePrice: number;
  optimizedPrice?: number;
  demandFactor?: 'low' | 'medium' | 'high';
  capacity: number;
  amenities: string[];
  imageUrl?: string;
  gallery?: string[];
}

export interface Room {
  id: string;
  companyId: string;
  number: string;
  categoryId: string;
  status: RoomStatus;
  floor: number;
  maintenanceHistory: { date: string; description: string; type: 'routine' | 'repair' }[];
}

export interface Guest {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  documentId: string;
  nationality: string;
  ageGroup: '18-25' | '26-35' | '36-50' | '50+';
}

export type BookingSource = 'Direct' | 'Booking.com' | 'Expedia' | 'Airbnb' | 'Corporate';

export interface Booking {
  id: string;
  companyId: string;
  roomId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'queued' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  guestsCount: number;
  source: BookingSource;
  specialRequests?: string;
  internalNotes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}


export interface DashboardStats {
  occupancyRate: number;
  totalRevenue: number;
  activeBookings: number;
  pendingCheckins: number;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS = 'ACCESS',
  PASSWORD_RESET = 'PASSWORD_RESET'
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  companyId: string;
  action: AuditAction;
  resource: string; // e.g. 'rooms', 'bookings'
  resourceId?: string;
  details: string; // JSON string or plain text
  ipAddress?: string;
  userAgent?: string;
}

