# KingsHMS Database Testing Guide

## Overview

KingsHMS uses **Firebase/Firestore** as its database backend. The application connects directly to Firebase from the client-side through the `dbService`, which provides fallback support to localStorage when the API is unavailable.

## Database Architecture

### Primary Database: Firebase/Firestore

- **Project ID**: kingshms-hotel
- **Authentication Domain**: kingshms-hotel.firebaseapp.com
- **Storage**: Firebase Storage for images/files
- **Configuration**: See `services/firebase.ts`

### Database Service Layer

- **Location**: `services/dbService.ts`
- **Features**:
  - CRUD operations (Create, Read, Update, Delete)
  - Company-scoped data isolation
  - Security & sanitization (NoSQL injection protection)
  - Fallback to localStorage for demo mode
  - API integration at `http://localhost:3001/api` (when available)

## Running Database Tests

### Option 1: Browser Console Tests (Recommended)

1. **Start the development server** (if not already running):

   ```bash
   npm run dev
   ```

2. **Open the application** in your browser:

   ```
   http://localhost:3000
   ```

3. **Open Developer Console**:
   - Press `F12` or right-click → "Inspect"
   - Go to the "Console" tab

4. **Run the comprehensive database test**:

   ```javascript
   // Load and run the database test script
   const script = document.createElement('script');
   script.type = 'module';
   script.src = '/test-database.js';
   document.head.appendChild(script);
   ```

5. **View Results**: The console will show:
   - ✅ Pass indicators for successful tests
   - ❌ Fail indicators for failed tests
   - Detailed output for each test
   - Final summary with pass/fail count

### Option 2: Run Individual CRUD Tests

After loading the main app at `http://localhost:3000`, run in the browser console:

```javascript
// Load and run CRUD tests
const script = document.createElement('script');
script.type = 'module';
script.src = '/test-crud.js';
document.head.appendChild(script);
```

Or run individual tests:

```javascript
// Available after script loads:
window.crudTests.testRoomCRUD()      // Test room operations
window.crudTests.testStaffCRUD()     // Test staff operations
window.crudTests.testBookingCRUD()   // Test booking operations
window.crudTests.testMenuCRUD()      // Test menu operations
window.crudTests.runCRUDTests()      // Run all CRUD tests
```

### Option 3: Node.js API Tests (If API Server is Running)

If you have a separate API server running on port 3001:

```bash
node test-database-node.js
```

**Note**: The API server is optional. The current architecture works primarily with Firebase directly.

## Test Coverage

### 1. Firebase Configuration Test

- ✅ Verifies Firebase app initialization
- ✅ Checks Firebase services (Analytics, Storage)
- ✅ Validates project configuration

### 2. Database Service Test

- ✅ Confirms dbService is loaded
- ✅ Validates all CRUD methods exist
- ✅ Tests method signatures

### 3. API Connectivity Test (Optional)

- Tests if API server is running on port 3001
- Checks all endpoints (rooms, bookings, staff, etc.)
- Reports fallback behavior if API unavailable

### 4. Data Read Operations Test

- ✅ Tests `getAll()` for all table types
- ✅ Tests `getById()` for retrieving specific records
- ✅ Validates data structure and integrity
- Tables tested:
  - rooms
  - bookings
  - staff
  - guests
  - menu
  - categories

### 5. CRUD Operations Test

- ✅ **CREATE**: Test record creation
- ✅ **READ**: Test record retrieval by ID
- ✅ **UPDATE**: Test record modification
- ✅ **DELETE**: Test record deletion
- ✅ Verification of each operation's success

### 6. Security & Sanitization Test

- ✅ Tests NoSQL injection protection
- ✅ Validates input sanitization
- ✅ Checks malicious input rejection
- Security functions tested:
  - `sanitizeId()`
  - `sanitizeObject()`
  - `isNoSQLInjection()`

### 7. Performance Test

- ✅ Tests parallel data fetching
- ✅ Measures response times
- ✅ Evaluates query optimization
- Target: < 1000ms for parallel reads

## Database Tables/Collections

The application manages the following data tables:

1. **companies** - Multi-tenant company data
2. **rooms** - Hotel room inventory
3. **bookings** - Reservation records
4. **guests** - Guest information
5. **categories** - Room category definitions
6. **tasks** - Staff task management
7. **templates** - Task templates
8. **staff** - Employee records
9. **feedback** - Guest feedback
10. **emails** - Email communications
11. **notifications** - System notifications
12. **conversations** - Guest-staff messaging
13. **menu** - Restaurant menu items

## Expected Test Results

### When Firebase is Connected

```
📊 DATABASE TEST SUMMARY
========================
Total Tests:  7
Passed:       7 ✅
Failed:       0
Success Rate: 100.0%

🎉 All database tests passed! Your database is ready.
```

### When Using Fallback Mode (No API)

```
⚠️  API endpoints are not accessible (will use fallback data)
📊 DATABASE TEST SUMMARY
========================
Total Tests:  7
Passed:       6 ✅
Failed:       1 ⚠️
Success Rate: 85.7%
```

This is normal if running without a separate API server!

## Troubleshooting

### Issue: "Firebase app not initialized"

**Solution**: Check `services/firebase.ts` configuration and ensure Firebase project is set up correctly.

### Issue: "API not responding"

**Solution**: This is expected! The app works with Firebase directly. The API at localhost:3001 is optional.

### Issue: "localStorage not available"

**Solution**: Ensure you're running in a browser environment, not Node.js.

### Issue: "Security function errors"

**Solution**: Check that `services/security.ts` is properly exported and imported.

### Issue: "CRUD operations failing"

**Solution**:

1. Check Firebase console for any security rules blocking operations
2. Verify Firebase authentication if required
3. Check browser console for detailed error messages

## Manual Testing Checklist

Use this checklist to manually verify database functionality:

- [ ] Can view existing rooms
- [ ] Can create a new room
- [ ] Can update a room's status
- [ ] Can delete a room
- [ ] Can view all bookings
- [ ] Can create a new booking
- [ ] Can update booking status
- [ ] Can view staff members
- [ ] Can add new staff
- [ ] Can update staff information
- [ ] Can view menu items
- [ ] Can add/edit menu items
- [ ] Data persists after page reload
- [ ] No console errors during operations

## Firebase Console Access

To view your database directly:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **kingshms-hotel**
3. Navigate to Firestore Database
4. Browse collections and documents

## Performance Benchmarks

Target performance metrics:

- Single read operation: < 200ms
- Parallel reads (4 tables): < 1000ms
- Create operation: < 300ms
- Update operation: < 300ms
- Delete operation: < 200ms

## Security Best Practices

The database implementation includes:

- ✅ Input sanitization on all write operations
- ✅ NoSQL injection protection
- ✅ ID validation to prevent path traversal
- ✅ Company-scoped data access
- ✅ Type checking and validation

## Next Steps

After successful database testing:

1. **Authentication Testing**: Test login/logout functionality
2. **Integration Testing**: Test complete user workflows
3. **Load Testing**: Test with larger datasets
4. **Production Deployment**: Deploy to Firebase Hosting
5. **Monitoring**: Set up Firebase Analytics and Performance Monitoring

## Additional Resources

- **Firebase Documentation**: <https://firebase.google.com/docs>
- **Firestore Guides**: <https://firebase.google.com/docs/firestore>
- **Security Rules**: <https://firebase.google.com/docs/firestore/security/get-started>
- **Project AI Studio**: <https://ai.studio/apps/drive/1IWyKiya8sBOnr94-59SCWWAEU1cDXZec>

## Support

For issues or questions:

1. Check browser console for detailed error messages
2. Review Firebase console for service status
3. Check `firestore.rules` for permission issues
4. Review conversation history for previous troubleshooting

---

**Last Updated**: 2026-01-27  
**Database**: Firebase/Firestore  
**Version**: KingsHMS v0.0.0
