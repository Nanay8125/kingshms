// Database seeding script for MySQL
// Run this to populate the database with initial data from constants.tsx

import mysql from 'mysql2/promise';
import {
    INITIAL_COMPANIES,
    INITIAL_STAFF,
    INITIAL_CATEGORIES,
    INITIAL_ROOMS,
    INITIAL_GUESTS,
    INITIAL_BOOKINGS,
    INITIAL_TASKS,
    INITIAL_TEMPLATES,
    INITIAL_MENU,
    INITIAL_FEEDBACK,
    INITIAL_CONVERSATIONS
} from '../constants';

async function seed() {
    let connection;

    try {
        console.log('🌱 Starting database seed...\n');

        // First, create the database if it doesn't exist
        console.log('🔧 Creating database if not exists...');
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: ''
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS kingshms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connection.end();
        console.log('✅ Database ready\n');

        // Now connect to the database
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'kingshms'
        });
        console.log('✅ Connected to MySQL\n');

        // Clear existing data (in reverse order of dependencies)
        console.log('🧹 Clearing existing data...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE feedback');
        await connection.execute('TRUNCATE TABLE conversations');
        await connection.execute('TRUNCATE TABLE tasks');
        await connection.execute('TRUNCATE TABLE bookings');
        await connection.execute('TRUNCATE TABLE staff_members');
        await connection.execute('TRUNCATE TABLE menu_items');
        await connection.execute('TRUNCATE TABLE guests');
        await connection.execute('TRUNCATE TABLE rooms');
        await connection.execute('TRUNCATE TABLE task_templates');
        await connection.execute('TRUNCATE TABLE room_categories');
        await connection.execute('TRUNCATE TABLE companies');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Cleared existing data\n');

        const formatDate = (dateStr: string) => dateStr ? dateStr.replace('T', ' ').replace('Z', '') : null;

        // ... inside seed() ...
        // Seed companies
        console.log('📦 Seeding companies...');
        for (const company of INITIAL_COMPANIES) {
            await connection.execute(
                `INSERT INTO companies (id, name, subdomain, logo, primary_color, secondary_color, address, phone, email, website, timezone, currency, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [company.id, company.name, company.subdomain, company.logo || null, company.primaryColor, company.secondaryColor,
                company.address, company.phone, company.email, company.website, company.timezone, company.currency, company.status, formatDate(company.createdAt)]
            );
        }
        // ...

        console.log(`✅ Seeded ${INITIAL_COMPANIES.length} companies\n`);

        // Seed room categories
        console.log('📦 Seeding room categories...');
        for (const category of INITIAL_CATEGORIES) {
            await connection.execute(
                `INSERT INTO room_categories (id, name, base_price, capacity, amenities)
         VALUES (?, ?, ?, ?, ?)`,
                [category.id, category.name, category.basePrice, category.capacity, JSON.stringify(category.amenities)]
            );
        }
        console.log(`✅ Seeded ${INITIAL_CATEGORIES.length} room categories\n`);

        // Seed staff members  
        console.log('📦 Seeding staff members...');
        for (const staff of INITIAL_STAFF) {
            await connection.execute(
                `INSERT INTO staff_members (id, company_id, name, email, password_hash, role, permission_role, department, status, avatar, phone, access_keys)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [staff.id, staff.companyId, staff.name, staff.email, staff.password || '', staff.role,
                staff.permissionRole, staff.department, staff.status, staff.avatar, staff.phone, JSON.stringify(staff.accessKeys || [])]
            );
        }
        console.log(`✅ Seeded ${INITIAL_STAFF.length} staff members\n`);

        // Seed rooms
        console.log('📦 Seeding rooms...');
        for (const room of INITIAL_ROOMS) {
            await connection.execute(
                `INSERT INTO rooms (id, company_id, number, category_id, status, floor, maintenance_history)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [room.id, room.companyId, room.number, room.categoryId, room.status, room.floor, JSON.stringify(room.maintenanceHistory || [])]
            );
        }
        console.log(`✅ Seeded ${INITIAL_ROOMS.length} rooms\n`);

        // Seed guests
        console.log('📦 Seeding guests...');
        for (const guest of INITIAL_GUESTS) {
            await connection.execute(
                `INSERT INTO guests (id, company_id, name, email, phone, location, document_id, nationality, age_group)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [guest.id, guest.companyId, guest.name, guest.email, guest.phone, guest.location, guest.documentId, guest.nationality, guest.ageGroup]
            );
        }
        console.log(`✅ Seeded ${INITIAL_GUESTS.length} guests\n`);

        // Seed bookings
        console.log('📦 Seeding bookings...');
        for (const booking of INITIAL_BOOKINGS) {
            await connection.execute(
                `INSERT INTO bookings (id, room_id, guest_id, check_in, check_out, total_price, status, guests_count, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [booking.id, booking.roomId, booking.guestId, booking.checkIn, booking.checkOut,
                booking.totalPrice, booking.status, booking.guestsCount, booking.source]
            );
        }
        console.log(`✅ Seeded ${INITIAL_BOOKINGS.length} bookings\n`);

        // Seed tasks
        console.log('📦 Seeding tasks...');
        for (const task of INITIAL_TASKS) {
            await connection.execute(
                `INSERT INTO tasks (id, company_id, title, description, type, priority, status, room_id, assigned_staff_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [task.id, task.companyId, task.title, task.description, task.type, task.priority,
                task.status, task.roomId, task.assignedStaffId, formatDate(task.createdAt)]
            );
        }
        console.log(`✅ Seeded ${INITIAL_TASKS.length} tasks\n`);

        // Seed task templates
        console.log('📦 Seeding task templates...');
        for (const template of INITIAL_TEMPLATES) {
            await connection.execute(
                `INSERT INTO task_templates (id, name, title, description, type, priority)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [template.id, template.name, template.title, template.description, template.type, template.priority]
            );
        }
        console.log(`✅ Seeded ${INITIAL_TEMPLATES.length} task templates\n`);

        // Seed menu items
        console.log('📦 Seeding menu items...');
        for (const item of INITIAL_MENU) {
            await connection.execute(
                `INSERT INTO menu_items (id, company_id, name, description, price, category, image, available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [item.id, item.companyId, item.name, item.description, item.price, item.category, item.image, item.available]
            );
        }
        console.log(`✅ Seeded ${INITIAL_MENU.length} menu items\n`);

        // Seed feedback
        console.log('📦 Seeding feedback...');
        for (const feedback of INITIAL_FEEDBACK) {
            await connection.execute(
                `INSERT INTO feedback (id, booking_id, guest_id, room_id, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [feedback.id, feedback.bookingId, feedback.guestId, feedback.roomId, feedback.rating, feedback.comment, formatDate(feedback.createdAt)]
            );
        }
        console.log(`✅ Seeded ${INITIAL_FEEDBACK.length} feedback entries\n`);

        // Seed conversations
        console.log('📦 Seeding conversations...');
        for (const conversation of INITIAL_CONVERSATIONS) {
            await connection.execute(
                `INSERT INTO conversations (id, guest_id, guest_name, room_number, last_message, last_timestamp, unread_count, messages)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [conversation.id, conversation.guestId, conversation.guestName, conversation.roomNumber,
                conversation.lastMessage, formatDate(conversation.lastTimestamp), conversation.unreadCount, JSON.stringify(conversation.messages)]
            );
        }
        console.log(`✅ Seeded ${INITIAL_CONVERSATIONS.length} conversations\n`);

        console.log('🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Companies: ${INITIAL_COMPANIES.length}`);
        console.log(`   Staff: ${INITIAL_STAFF.length}`);
        console.log(`   Categories: ${INITIAL_CATEGORIES.length}`);
        console.log(`   Rooms: ${INITIAL_ROOMS.length}`);
        console.log(`   Guests: ${INITIAL_GUESTS.length}`);
        console.log(`   Bookings: ${INITIAL_BOOKINGS.length}`);
        console.log(`   Tasks: ${INITIAL_TASKS.length}`);
        console.log(`   Templates: ${INITIAL_TEMPLATES.length}`);
        console.log(`   Menu Items: ${INITIAL_MENU.length}`);
        console.log(`   Feedback: ${INITIAL_FEEDBACK.length}`);
        console.log(`   Conversations: ${INITIAL_CONVERSATIONS.length}`);
        console.log('\n✅ You can now start the application!\n');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        const fs = await import('fs');
        fs.writeFileSync('seed-error.log', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run seed
seed();
