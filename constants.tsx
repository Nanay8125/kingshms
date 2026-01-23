
import { Room, RoomStatus, Guest, Booking, RoomCategory, Task, TaskStatus, TaskPriority, TaskType, Feedback, StaffMember, StaffStatus, TaskTemplate, UserRole, MenuItem, Conversation, Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    dashboard: 'Dashboard',
    rooms: 'Rooms',
    bookings: 'Bookings',
    guests: 'Guests',
    messages: 'Messaging',
    staff: 'Staff Directory',
    tasks: 'Tasks',
    inbox: 'Staff Inbox',
    feedback: 'Feedback',
    revenue: 'Revenue',
    analytics: 'Analytics',
    settings: 'Settings',
    signOut: 'Sign Out',
    totalRevenue: 'Total Revenue',
    occupancyRate: 'Occupancy Rate',
    guestRating: 'Guest Rating',
    operationTasks: 'Operation Tasks',
    directBookingsBanner: 'Direct Bookings Advantage',
    previewPortal: 'Preview Guest Portal',
    vsLastMonth: 'vs last month',
    unfinishedTasks: 'Unfinished tasks',
    internalReviews: 'internal reviews',
    occupied: 'Occupied'
  },
  fr: {
    dashboard: 'Tableau de bord',
    rooms: 'Chambres',
    bookings: 'Réservations',
    guests: 'Clients',
    messages: 'Messagerie',
    staff: 'Annuaire du personnel',
    tasks: 'Tâches',
    inbox: 'Boîte de réception',
    feedback: 'Commentaires',
    revenue: 'Revenus',
    analytics: 'Analyses',
    settings: 'Paramètres',
    signOut: 'Déconnexion',
    totalRevenue: 'Revenu Total',
    occupancyRate: 'Taux d\'occupation',
    guestRating: 'Note des clients',
    operationTasks: 'Tâches opérationnelles',
    directBookingsBanner: 'Avantage des réservations directes',
    previewPortal: 'Aperçu du portail client',
    vsLastMonth: 'par rapport au mois dernier',
    unfinishedTasks: 'Tâches inachevées',
    internalReviews: 'avis internes',
    occupied: 'Occupé'
  }
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    guestId: 'g1',
    guestName: 'John Doe',
    roomNumber: '101',
    lastMessage: 'Can I get extra towels please?',
    lastTimestamp: new Date().toISOString(),
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'guest', text: 'Hello, our room is great!', timestamp: '2024-05-20T10:00:00Z' },
      { id: 'm2', sender: 'staff', text: 'Glad you like it! Let us know if you need anything.', timestamp: '2024-05-20T10:05:00Z' },
      { id: 'm3', sender: 'guest', text: 'Can I get extra towels please?', timestamp: new Date().toISOString() },
    ]
  },
  {
    id: 'c2',
    guestId: 'g2',
    guestName: 'Jane Smith',
    roomNumber: '301',
    lastMessage: 'Thank you for the wine!',
    lastTimestamp: '2024-05-21T14:30:00Z',
    unreadCount: 0,
    messages: [
      { id: 'm4', sender: 'staff', text: 'Welcome to LuxeStay, Jane!', timestamp: '2024-05-21T14:00:00Z' },
      { id: 'm5', sender: 'guest', text: 'Thank you for the wine!', timestamp: '2024-05-21T14:30:00Z' },
    ]
  }
];

export const INITIAL_MENU: MenuItem[] = [
  { id: 'm1', companyId: 'luxestay', name: 'Classic Eggs Benedict', description: 'Two poached eggs, Canadian bacon, hollandaise sauce on toasted English muffins.', price: 18, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm2', companyId: 'luxestay', name: 'Wagyu Beef Burger', description: '8oz Wagyu patty, aged cheddar, caramelized onions, truffle aioli on brioche.', price: 28, category: 'Main Course', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm3', companyId: 'luxestay', name: 'Wild Mushroom Risotto', description: 'Arborio rice, seasonal forest mushrooms, parmesan reggiano, truffle oil.', price: 24, category: 'Main Course', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm4', companyId: 'luxestay', name: 'Dark Chocolate Lava Cake', description: 'Warm center, vanilla bean gelato, raspberry coulis.', price: 14, category: 'Desserts', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm5', companyId: 'luxestay', name: 'Signature Old Fashioned', description: 'Premium bourbon, bitters, orange zest, hand-cut ice.', price: 16, category: 'Drinks', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm6', companyId: 'luxestay', name: 'Fresh Seasonal Fruit Platter', description: 'Slices of melon, berries, grapes, and exotic tropical fruits.', price: 15, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm7', companyId: 'luxestay', name: 'Artisanal Cheese Board', description: 'Selection of 3 local cheeses, honey, nuts, and crackers.', price: 22, category: 'Snacks', image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=400', available: true },
];

// Hashed passwords for demo accounts (password: "SecurePass123!")
const DEMO_PASSWORD_HASH = 'efe5e46562838eb6afd1cb753f27a7616bf474188899dc69e0e733aa4c3d3de0'; // SHA-256 hash with salt

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 's1',
    companyId: 'luxestay',
    name: 'Maria Garcia',
    email: 'maria@luxestay.com',
    password: DEMO_PASSWORD_HASH,
    role: 'Head Housekeeper',
    department: 'Housekeeping',
    permissionRole: UserRole.HOUSEKEEPING,
    status: StaffStatus.AVAILABLE,
    avatar: 'https://picsum.photos/seed/s1/100',
    phone: '555-0101',
    accessKeys: [
      { id: 'ak1', key: 'hk_abc123def456', createdAt: '2024-01-15T10:00:00Z', lastUsed: '2024-05-20T14:30:00Z', description: 'Housekeeping API Access', active: true },
      { id: 'ak2', key: 'hk_xyz789ghi012', createdAt: '2024-03-01T09:00:00Z', description: 'Backup Access Key', active: false }
    ]
  },
  {
    id: 's2',
    companyId: 'luxestay',
    name: 'Dave Miller',
    email: 'dave@luxestay.com',
    password: DEMO_PASSWORD_HASH,
    role: 'Senior Technician',
    department: 'Maintenance',
    permissionRole: UserRole.MAINTENANCE,
    status: StaffStatus.BUSY,
    avatar: 'https://picsum.photos/seed/s2/100',
    phone: '555-0102',
    accessKeys: [
      { id: 'ak3', key: 'mt_jkl345mno678', createdAt: '2024-02-10T11:00:00Z', lastUsed: '2024-05-19T16:45:00Z', description: 'Maintenance System Access', active: true }
    ]
  },
  {
    id: 's3',
    companyId: 'luxestay',
    name: 'Sarah Chen',
    email: 'sarah@luxestay.com',
    password: DEMO_PASSWORD_HASH,
    role: 'Receptionist',
    department: 'Front Desk',
    permissionRole: UserRole.FRONT_DESK,
    status: StaffStatus.AVAILABLE,
    avatar: 'https://picsum.photos/seed/s3/100',
    phone: '555-0103',
    accessKeys: [
      { id: 'ak4', key: 'fd_pqr901stu234', createdAt: '2024-01-20T08:30:00Z', lastUsed: '2024-05-21T12:15:00Z', description: 'Front Desk Terminal', active: true },
      { id: 'ak5', key: 'fd_vwx567yza890', createdAt: '2024-04-05T14:20:00Z', description: 'Mobile App Access', active: true }
    ]
  },
  {
    id: 's4',
    companyId: 'luxestay',
    name: 'James Wilson',
    email: 'james@luxestay.com',
    password: DEMO_PASSWORD_HASH,
    role: 'Concierge',
    department: 'Concierge',
    permissionRole: UserRole.FRONT_DESK,
    status: StaffStatus.OFFLINE,
    avatar: 'https://picsum.photos/seed/s4/100',
    phone: '555-0104',
    accessKeys: [
      { id: 'ak6', key: 'cg_bcd123efg456', createdAt: '2024-02-15T13:00:00Z', description: 'Concierge Portal', active: true }
    ]
  },
  {
    id: 's5',
    companyId: 'luxestay',
    name: 'Elena Rodriguez',
    email: 'manager@luxestay.com',
    password: DEMO_PASSWORD_HASH,
    role: 'General Manager',
    department: 'Management',
    permissionRole: UserRole.ADMIN,
    status: StaffStatus.AVAILABLE,
    avatar: 'https://picsum.photos/seed/s5/100',
    phone: '555-0105',
    accessKeys: [
      { id: 'ak7', key: 'admin_ghi789jkl012', createdAt: '2024-01-01T00:00:00Z', lastUsed: '2024-05-21T09:30:00Z', description: 'Full Admin Access', active: true },
      { id: 'ak8', key: 'admin_mno345pqr678', createdAt: '2024-03-15T10:00:00Z', description: 'Emergency Access', active: true },
      { id: 'ak9', key: 'admin_stu901vwx234', createdAt: '2024-02-28T15:45:00Z', description: 'Revoked Key', active: false }
    ]
  },
];

export const INITIAL_CATEGORIES: RoomCategory[] = [
  { id: 'cat1', companyId: 'luxestay', name: 'Standard Room', basePrice: 100, capacity: 2, amenities: ['Free Wi-Fi', 'TV', 'Work Desk', 'Mini Fridge', 'Air Conditioning'] },
  { id: 'cat2', companyId: 'luxestay', name: 'Superior Room', basePrice: 150, capacity: 2, amenities: ['Free Wi-Fi', 'Mini Bar', 'Smart TV', 'Balcony', 'Room Service', 'Air Conditioning'] },
  { id: 'cat3', companyId: 'luxestay', name: 'Deluxe Room', basePrice: 200, capacity: 2, amenities: ['Free Wi-Fi', 'Mini Bar', 'Ocean View', 'Smart TV', 'Balcony', 'Nespresso Machine', 'Bath Tub', 'Room Service'] },
];

export const INITIAL_ROOMS: Room[] = [
  { id: '1', companyId: 'luxestay', number: '101', categoryId: 'cat1', status: RoomStatus.AVAILABLE, floor: 1, maintenanceHistory: [] },
  { id: '2', companyId: 'luxestay', number: '102', categoryId: 'cat1', status: RoomStatus.OCCUPIED, floor: 1, maintenanceHistory: [] },
  { id: '3', companyId: 'luxestay', number: '103', categoryId: 'cat2', status: RoomStatus.CLEANING, floor: 1, maintenanceHistory: [] },
  { id: '4', companyId: 'luxestay', number: '201', categoryId: 'cat3', status: RoomStatus.AVAILABLE, floor: 2, maintenanceHistory: [] },
  { id: '5', companyId: 'luxestay', number: '202', categoryId: 'cat3', status: RoomStatus.MAINTENANCE, floor: 2, maintenanceHistory: [] },
  { id: '6', companyId: 'luxestay', number: '301', categoryId: 'cat3', status: RoomStatus.OCCUPIED, floor: 3, maintenanceHistory: [] },
  { id: '7', companyId: 'luxestay', number: '104', categoryId: 'cat2', status: RoomStatus.AVAILABLE, floor: 1, maintenanceHistory: [] },
  { id: '8', companyId: 'luxestay', number: '203', categoryId: 'cat3', status: RoomStatus.AVAILABLE, floor: 2, maintenanceHistory: [] },
  { id: '9', companyId: 'luxestay', number: '204', categoryId: 'cat2', status: RoomStatus.AVAILABLE, floor: 2, maintenanceHistory: [] },
  { id: '10', companyId: 'luxestay', number: '302', categoryId: 'cat3', status: RoomStatus.AVAILABLE, floor: 3, maintenanceHistory: [] },
];

export const INITIAL_GUESTS: Guest[] = [
  { id: 'g1', companyId: 'luxestay', name: 'John Doe', email: 'john@example.com', phone: '+123456789', location: 'New York, USA', documentId: 'PASS123', nationality: 'USA', ageGroup: '36-50' },
  { id: 'g2', companyId: 'luxestay', name: 'Jane Smith', email: 'jane@example.com', phone: '+987654321', location: 'London, UK', documentId: 'ID987', nationality: 'UK', ageGroup: '26-35' },
  { id: 'g3', companyId: 'luxestay', name: 'Hans Mueller', email: 'hans@example.com', phone: '+49123456', location: 'Berlin, Germany', documentId: 'DE444', nationality: 'Germany', ageGroup: '50+' },
  { id: 'g4', companyId: 'luxestay', name: 'Yuki Tanaka', email: 'yuki@example.com', phone: '+81999888', location: 'Tokyo, Japan', documentId: 'JP555', nationality: 'Japan', ageGroup: '26-35' },
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: '2', guestId: 'g1', checkIn: '2024-05-20', checkOut: '2024-05-25', totalPrice: 400, status: 'checked-in', guestsCount: 1, source: 'Direct' },
  { id: 'b2', roomId: '6', guestId: 'g2', checkIn: '2024-05-21', checkOut: '2024-05-28', totalPrice: 5950, status: 'checked-in', guestsCount: 2, source: 'Booking.com' },
  { id: 'b3', roomId: '1', guestId: 'g3', checkIn: '2024-05-10', checkOut: '2024-05-15', totalPrice: 400, status: 'checked-out', guestsCount: 1, source: 'Expedia' },
  { id: 'b4', roomId: '4', guestId: 'g4', checkIn: '2024-06-01', checkOut: '2024-06-05', totalPrice: 1000, status: 'confirmed', guestsCount: 2, source: 'Airbnb' },
  { id: 'b5', roomId: '7', guestId: 'g1', checkIn: '2024-05-25', checkOut: '2024-05-30', totalPrice: 600, status: 'confirmed', guestsCount: 2, source: 'Direct' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    companyId: 'luxestay',
    title: 'Deep cleaning Room 103',
    description: 'Full sanitized cleaning after check-out. Replace all linens and replenish mini-bar.',
    type: TaskType.CLEANING,
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    roomId: '3',
    assignedStaffId: 's1',
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    companyId: 'luxestay',
    title: 'Fix AC in Room 202',
    description: 'Guest reported noise from the air conditioning unit during night time.',
    type: TaskType.MAINTENANCE,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    roomId: '5',
    assignedStaffId: 's2',
    createdAt: new Date().toISOString()
  },
  {
    id: 't3',
    companyId: 'luxestay',
    title: 'Welcome Kit Delivery',
    description: 'Deliver premium VIP welcome fruit basket and champagne to Presidential Villa.',
    type: TaskType.SERVICE,
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    roomId: '6',
    assignedStaffId: 's3',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tpl1',
    name: 'Standard Departure Cleaning',
    title: 'Room Cleaning Checklist',
    description: 'Standard cleaning procedure: Strip linens, vacuum floors, sanitize bathroom, replenish amenities, and check for guest items.',
    type: TaskType.CLEANING,
    priority: TaskPriority.MEDIUM
  },
  {
    id: 'tpl2',
    name: 'VIP Welcome Package',
    title: 'New Guest Welcome Package',
    description: 'Arrange welcome card, fruit basket, and sparkling water in the room before arrival.',
    type: TaskType.SERVICE,
    priority: TaskPriority.HIGH
  },
  {
    id: 'tpl3',
    name: 'Routine AC Check',
    title: 'Maintenance: AC Routine Check',
    description: 'Inspect air filters, check refrigerant levels, and ensure thermostat calibration.',
    type: TaskType.MAINTENANCE,
    priority: TaskPriority.LOW
  }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    bookingId: 'b3',
    guestId: 'g3',
    roomId: '1',
    rating: 5,
    comment: 'Wonderful stay! The Single Standard room was surprisingly spacious and quiet.',
    createdAt: '2024-05-16T10:00:00Z'
  },
  {
    id: 'f2',
    bookingId: 'b3',
    guestId: 'g3',
    roomId: '1',
    rating: 4,
    comment: 'Great service, but the breakfast options could be more varied.',
    createdAt: '2024-05-16T11:00:00Z'
  }
];
