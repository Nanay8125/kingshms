-- KingsHMS MySQL Database Schema
-- Complete schema with all tables, relationships, and indexes
CREATE DATABASE IF NOT EXISTS kingshms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kingshms;
-- =====================================================
-- COMPANIES TABLE (Multi-tenancy)
-- =====================================================
CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    logo TEXT,
    primary_color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    secondary_color VARCHAR(7) NOT NULL DEFAULT '#10b981',
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website TEXT,
    timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subdomain (subdomain),
    INDEX idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- ROOM CATEGORIES TABLE
-- =====================================================
CREATE TABLE room_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    optimized_price DECIMAL(10, 2),
    demand_factor ENUM('low', 'medium', 'high'),
    capacity INT NOT NULL,
    amenities JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- STAFF MEMBERS TABLE
-- =====================================================
CREATE TABLE staff_members (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(100) NOT NULL,
    permission_role ENUM(
        'admin',
        'management',
        'front_desk',
        'housekeeping',
        'maintenance'
    ) NOT NULL,
    department ENUM(
        'Housekeeping',
        'Front Desk',
        'Management',
        'Maintenance',
        'Concierge',
        'Finance'
    ) NOT NULL,
    status ENUM('available', 'busy', 'offline', 'on-break') NOT NULL DEFAULT 'available',
    avatar TEXT,
    phone VARCHAR(50),
    access_keys JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_company_email (company_id, email),
    INDEX idx_company (company_id),
    INDEX idx_email (email),
    INDEX idx_permission (permission_role)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- ROOMS TABLE
-- =====================================================
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id VARCHAR(36) NOT NULL,
    number VARCHAR(20) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    status ENUM(
        'available',
        'occupied',
        'cleaning',
        'maintenance'
    ) NOT NULL DEFAULT 'available',
    floor INT NOT NULL,
    maintenance_history JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES room_categories(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_company_number (company_id, number),
    INDEX idx_company (company_id),
    INDEX idx_status (status),
    INDEX idx_company_status (company_id, status),
    INDEX idx_category (category_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- GUESTS TABLE
-- =====================================================
CREATE TABLE guests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    location TEXT,
    document_id VARCHAR(100),
    nationality VARCHAR(100),
    age_group ENUM('18-25', '26-35', '36-50', '50+'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    room_id VARCHAR(36) NOT NULL,
    guest_id VARCHAR(36) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM(
        'confirmed',
        'checked-in',
        'checked-out',
        'cancelled'
    ) NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    source VARCHAR(50) NOT NULL,
    special_requests TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    INDEX idx_room (room_id),
    INDEX idx_guest (guest_id),
    INDEX idx_dates (check_in, check_out),
    INDEX idx_status (status),
    CONSTRAINT chk_dates CHECK (check_out > check_in)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- TASKS TABLE
-- =====================================================
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM(
        'cleaning',
        'maintenance',
        'service',
        'front-desk',
        'dining'
    ) NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL,
    status ENUM('pending', 'in-progress', 'completed') NOT NULL DEFAULT 'pending',
    room_id VARCHAR(36),
    assigned_staff_id VARCHAR(36),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE
    SET NULL,
        FOREIGN KEY (assigned_staff_id) REFERENCES staff_members(id) ON DELETE
    SET NULL,
        INDEX idx_company (company_id),
        INDEX idx_assigned (assigned_staff_id),
        INDEX idx_room (room_id),
        INDEX idx_status (status),
        INDEX idx_company_status (company_id, status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- TASK TEMPLATES TABLE
-- =====================================================
CREATE TABLE task_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM(
        'cleaning',
        'maintenance',
        'service',
        'front-desk',
        'dining'
    ) NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================
CREATE TABLE menu_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM(
        'Breakfast',
        'Main Course',
        'Drinks',
        'Desserts',
        'Snacks'
    ) NOT NULL,
    image TEXT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_available (available)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- FEEDBACK TABLE
-- =====================================================
CREATE TABLE feedback (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id VARCHAR(36) NOT NULL,
    guest_id VARCHAR(36) NOT NULL,
    room_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_guest (guest_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    guest_id VARCHAR(36) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    last_message TEXT,
    last_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unread_count INT NOT NULL DEFAULT 0,
    messages JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    INDEX idx_guest (guest_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- STAFF EMAILS TABLE
-- =====================================================
CREATE TABLE staff_emails (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recipient_dept VARCHAR(100) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    type ENUM(
        'booking_new',
        'check_in',
        'check_out',
        'follow_up'
    ) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    staff_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('task', 'booking', 'system') NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    INDEX idx_staff (staff_id),
    INDEX idx_read (`read`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;