# KingsHMS Back-End Testing Guide

## Overview

This guide provides comprehensive testing procedures for all back-end services in the KingsHMS hotel management system. The application uses a **serverless architecture** with Firebase/Fire store and client-side services.

---

## 🏗️ Back-End Architecture

### Core Services (5 Services)

#### **1. Database Service** (`dbService.ts`)

- **Tables**: 13 data tables (rooms, bookings, guests, staff, tasks, menu, etc.)
- **Operations**: Full CRUD (Create, Read, Update, Delete)
- **Features**:
  - LocalStorage fallback for offline/demo mode
  - Company-scoped multi-tenancy
  - Input sanitization
  - NoSQL injection prevention

#### **2. Authentication Service** (`authService.ts`)

- **Features**:
  - Password hashing (crypto-based)
  - Email validation
  - Password strength validation
  - Role-based access control (RBAC)
  - CSRF token generation & validation
  - Session management
  - Data encryption/decryption

#### **3. Security Service** (`security.ts`)

- **Features**:
  - Input sanitization
  - SQL/NoSQL injection detection
  - XSS prevention
  - Email validation
  - ID validation

#### **4. Firebase Service** (`firebase.ts`)

- **Features**:
  - Firebase initialization
  - Firestore database connection
  - Firebase Storage
  - Analytics integration

#### **5. Gemini AI Service** (`geminiService.ts`)

- **Features**:
  - AI-powered guest assistance
  - Natural language understanding
  - Response generation

---

## 🧪 Testing Methods

### Method 1: Browser Console Testing (Recommended)

**Steps**:

1. **Open the main application**:

   ```
   http://localhost:3000
   ```

2. **Open Developer Console**: Press `F12`

3. **Load and run the test script**:

   ```javascript
   const script = document.createElement('script');
   script.type = 'module';
   script.src = '/test-backend.js';
   document.head.appendChild(script);
   ```

4. **View Results**:
   - Tests run automatically
   - Color-coded console output
   - Comprehensive summary at the end

**Expected Output**:

```
🔧 KingsHMS Back-End Testing Suite
════════════════════════════════════════════════════════════

📋 Test 1: Service Imports & Availability
────────────────────────────────────────────────────────────
✅ dbService - Available
✅ authService - Available
✅ security - Available
✅ geminiService - Available
✅ firebase - Available

📋 Test 2: Database Service (dbService)
────────────────────────────────────────────────────────────
🔍 Testing 6 table types:
✅ rooms           - getAll() works (10 items)
✅ bookings        - getAll() works (5 items)
✅ guests          - getAll() works (8 items)
✅ staff           - getAll() works (12 items)
✅ tasks           - getAll() works (15 items)
✅ menu            - getAll() works (20 items)

🔧 Testing CRUD operations (using "rooms"):
✅ CREATE - Room created successfully
✅ READ   - Room retrieved successfully
✅ UPDATE - Room updated successfully
✅ DELETE - Room deleted successfully

📋 Test 3: Authentication Service (authService)
────────────────────────────────────────────────────────────
📧 Testing email validation:
✅ "valid@example.com" - Valid (correct)
✅ "invalid-email" - Invalid (correct)
✅ "test@test" - Invalid (correct)

🔐 Testing password validation:
✅ Password "********" - Valid
✅ Password "***" - Invalid

🛡️  Testing CSRF protection:
✅ CSRF token generated
✅ CSRF token validation works

👥 Testing role-based access control:
✅ admin has access to viewer
✅ viewer NOT has access to admin
✅ manager has access to viewer

📊 BACK-END TEST SUMMARY
════════════════════════════════════════════════════════════
Total Tests:  45
Passed:       42 ✅
Failed:       0 ❌
Warnings:     3 ⚠️
Success Rate: 93.3%

✅ All tests passed with some warnings.
```

---

## 📋 Detailed Test Coverage

### Test 1: Service Imports (5 tests)

- [ ] dbService available
- [ ] authService available
- [ ] security available
- [ ] geminiService available
- [ ] firebase available

### Test 2: Database Service (10+ tests)

- [ ] getAll() for each table type (6 tables)
- [ ] CREATE operation works
- [ ] READ/getById operation works
- [ ] UPDATE operation works
- [ ] DELETE operation works
- [ ] LocalStorage fallback works
- [ ] Company-scoped queries work

### Test 3: Authentication Service (12+ tests)

- [ ] Email validation - valid email
- [ ] Email validation - invalid email
- [ ] Email validation - malformed email
- [ ] Password validation - strong password
- [ ] Password validation - weak password
- [ ] Password validation - empty password
- [ ] CSRF token generation
- [ ] CSRF token validation
- [ ] Role-based access - admin→viewer
- [ ] Role-based access - viewer→admin
- [ ] Role-based access - manager→viewer
- [ ] Session management

### Test 4: Security Service (8+ tests)

- [ ] Sanitize normal text
- [ ] Sanitize XSS attempt
- [ ] Sanitize email address
- [ ] Sanitize SQL injection
- [ ] Detect normal text (not injection)
- [ ] Detect SQL injection attempt
- [ ] Detect SELECT statement
- [ ] Allow valid email

### Test 5: Firebase Configuration (2 tests)

- [ ] Firebase SDK loaded
- [ ] Firebase config module loaded

### Test 6: Gemini AI Service (2 tests)

- [ ] Gemini service module loaded
- [ ] Gemini API key configured

### Test 7: Storage System (6+ tests)

- [ ] LocalStorage available
- [ ] LocalStorage read/write works
- [ ] Fallback data for rooms
- [ ] Fallback data for bookings
- [ ] Fallback data for staff
- [ ] Fallback data for tasks
- [ ] Fallback data for menu

**Total**: ~45 individual test cases

---

## 🎯 Manual Service Testing

### Testing Database Service

```javascript
// In browser console at http://localhost:3000

// Import the service
const { dbService } = await import('./services/dbService.ts');

// Test: Get all rooms
const rooms = await dbService.getAll('rooms');
console.log('Rooms:', rooms);

// Test: Create a new room
const newRoom = await dbService.create('rooms', {
  number: '555',
  type: 'Deluxe Suite',
  status: 'available',
  price: 250,
  floor: 5,
  amenities: ['WiFi', 'TV', 'Mini Bar'],
  description: 'Luxury suite with ocean view'
});
console.log('Created:', newRoom);

// Test: Get room by ID
const room = await dbService.getById('rooms', newRoom.id);
console.log('Retrieved:', room);

// Test: Update room
const updated = await dbService.update('rooms', newRoom.id, { price: 300 });
console.log('Updated:', updated);

// Test: Delete room
const deleted = await dbService.delete('rooms', newRoom.id);
console.log('Deleted:', deleted);
```

### Testing Authentication Service

```javascript
// Import the service
const { authService } = await import('./services/authService.ts');

// Test: Email validation
console.log(authService.validateEmail('test@example.com')); // true
console.log(authService.validateEmail('invalid')); // false

// Test: Password validation
const pwdResult = authService.validatePassword('Test123!@#');
console.log('Password valid:', pwdResult.isValid);
console.log('Errors:', pwdResult.errors);

// Test: CSRF token
const token = authService.getCSRFToken();
console.log('CSRF Token:', token);
console.log('Token valid:', authService.validateCSRFToken(token));

// Test: Role permissions
console.log(authService.hasPermission('admin', 'viewer')); // true
console.log(authService.hasPermission('viewer', 'admin')); // false
```

### Testing Security Service

```javascript
// Import the service
const security = await import('./services/security.ts');

// Test: Sanitize inputs
console.log(security.sanitizeString('Normal text'));
console.log(security.sanitizeString('<script>alert("xss")</script>'));

// Test: Injection detection
console.log(security.isNoSQLInjection('normal text')); // false
console.log(security.isNoSQLInjection("'; DROP TABLE--")); // true

// Test: Email validation
console.log(security.validateEmail('test@example.com')); // true
console.log(security.validateEmail('invalid')); // false
```

---

## 🔬 Advanced Testing Scenarios

### Test Multi-Tenancy (Company Scoping)

```javascript
const { dbService } = await import('./services/dbService.ts');

// Get data for specific company
const company1Rooms = await dbService.getAll('rooms', 'company-1');
const company2Rooms = await dbService.getAll('rooms', 'company-2');

console.log('Company 1 rooms:', company1Rooms.length);
console.log('Company 2 rooms:', company2Rooms.length);

// Create room for specific company
const room = await dbService.create('rooms', {
  number: '101',
  type: 'Standard',
  status: 'available',
  price: 100
}, 'company-1');

console.log('Created for company-1:', room);
```

### Test Offline/Fallback Mode

```javascript
// Simulate offline by blocking API
const { dbService } = await import('./services/dbService.ts');

// This will fallback to localStorage or demo data
const rooms = await dbService.getAll('rooms');
console.log('Fallback rooms:', rooms);

// LocalStorage data
const localRooms = localStorage.getItem('kingshms_rooms');
console.log('From localStorage:', JSON.parse(localRooms || '[]'));
```

### Test Security Features

```javascript
const { authService } = await import('./services/authService.ts');

// Test password hashing
const password = 'MySecretPassword123!';
const hashedconst hashed = await authService.hashPassword(password);
console.log('Hashed:', hashed);

// Test password verification
const isValid = await authService.verifyPassword(password, hashed);
console.log('Password matches:', isValid);

// Test session management
const testUser = {
  id: 'test-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin'
};

authService.setSession(testUser);
const session = authService.getSession();
console.log('Session:', session);

console.log('Is authenticated:', authService.isAuthenticated());
```

---

## ⚡ Performance Testing

### Database Query Performance

```javascript
const { dbService } = await import('./services/dbService.ts');

console.time('getAllRooms');
const rooms = await dbService.getAll('rooms');
console.timeEnd('getAllRooms');

console.time('getByIdRooms');
const room = await dbService.getById('rooms', rooms[0]?.id);
console.timeEnd('getByIdRooms');

console.time('createRoom');
const newRoom = await dbService.create('rooms', { /* data */ });
console.timeEnd('createRoom');
```

**Expected Times**:

- getAll: < 50ms (localStorage) or < 500ms (API)
- getById: < 20ms (localStorage) or < 300ms (API)
- create: < 50ms (localStorage) or < 600ms (API)

---

## 🐛 Troubleshooting

### Issue: "Cannot import service"

**Solution**:

- Make sure you're on the main app page (`http://localhost:3000`)
- Services use ES modules, ensure browser supports them
- Check console for specific import errors

### Issue: "API not responding"

**Solution**:

- This is expected! The app uses **fallback mode**
- Data comes from localStorage or demo data
- API at `http://localhost:3001 /api` is optional

### Issue: "LocalStorage quota exceeded"

**Solution**:

```javascript
// Clear localStorage
localStorage.clear();

// Or clear specific items
localStorage.removeItem('kingshms_rooms');
localStorage.removeItem('kingshms_bookings');
```

### Issue: "Firebase not configured"

**Solution**:

- Check `services/firebase.ts` has valid config
- Firebase is optional for demo mode
- LocalStorage fallback works without Firebase

---

## 📊 Test Results Interpretation

### Success Criteria

**✅ Excellent (90-100%)**

- All services load correctly
- All CRUD operations work
- Security features functioning
- No failures, minimal warnings

**⚠️ Good (70-89%)**

- Most services work
- Minor API connection issues (expected)
- Some warnings about optional features
- Core functionality intact

**❌ Needs Work (<70%)**

- Services failing to load
- CRUD operations broken
- Security features not working
- Multiple test failures

---

## 🔐 Security Testing Checklist

- [ ] SQL/NoSQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Email validation prevents invalid formats
- [ ] Password requirements enforced
- [ ] CSRF tokens generated and validated
- [ ] Role-based access control works
- [ ] Sessions expire after timeout
- [ ] Sensitive data encrypted
- [ ] Input sanitization on all fields
- [ ] ID validation prevents injection

---

## 📚 Additional Resources

### Documentation

- **Firebase Docs**: <https://firebase.google.com/docs>
- **Firestore Security**: <https://firebase.google.com/docs/firestore/security>
- **Web Crypto API**: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API>

### Tools

- **Chrome DevTools**: F12 → Console, Network
- **Firebase Console**: <https://console.firebase.google.com>
- **Postman**: For API endpoint testing (if API deployed)

---

## ✅ Testing Summary

The KingsHMS back-end consists of **5 core services** handling:

**Services**:

1. Database Service (13 tables, full CRUD)
2. Authentication Service (login, sessions, RBAC)
3. Security Service (sanitization, injection prevention)
4. Firebase Service (cloud database, storage)
5. Gemini AI Service (AI assistance)

**Test Categories**:

1. Service availability (5 tests)
2. Database operations (10+ tests)
3. Authentication (12+ tests)
4. Security (8+ tests)
5. Firebase config (2 tests)
6. AI service (2 tests)
7. Storage system (6+ tests)

**Total Tests**: ~45 individual checks

**Testing Time**: 5-10 minutes for automated tests

---

**Generated**: 2026-01-27  
**Version**: KingsHMS v0.0.0  
**Architecture**: Serverlèss (Firebase) + Client-Side Services  
**Status**: ✅ Ready for Testing
