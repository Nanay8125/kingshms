# 🧪 Front-End Component Testing - Step-by-Step Manual Guide

## ✅ Current Status

- ✅ Dev server is running at `http://localhost:3000`
- ✅ Test widget script is ready at `/test-widget.js`
- ✅ All 21 React components are loaded
- ✅ Ready for testing!

---

## 🚀 **Testing Steps (5 Minutes)**

### **Step 1: Open Your Browser**

Open your web browser (Chrome, Firefox, Edge, etc.)

### **Step 2: Navigate to the Application**

Go to the main application URL:

```
http://localhost:3000
```

**✅ What you should see:**

- Login form (if not logged in)
- OR Dashboard (if already logged in)
- Sidebar navigation
- KingsHMS branding

**⏳ Wait** for the page to fully load before proceeding!

---

### **Step 3: Open Developer Console**

**Windows/Linux**: Press `F12` or `Ctrl + Shift + I`  
**Mac**: Press `Cmd + Option + I`

**✅ What you should see:**

- Developer Tools panel appears (usually at bottom or right side)
- Multiple tabs: Elements, Console, Network, etc.

**Click on the "Console" tab**

---

### **Step 4: Load the Test Widget**

In the Console, **copy and paste** this entire code block:

```javascript
const script = document.createElement('script');
script.src = '/test-widget.js';
document.head.appendChild(script);
```

**Press Enter** to execute

**✅ What you should see:**

```
✅ Test widget loaded!
💡 Click the widget or use: window.runComponentTests()
```

**AND** a beautiful **purple gradient panel** appears in the **top-right corner** of your page!

---

### **Step 5: Run the Tests**

Two options:

#### **Option A: Click the Widget** (Easiest)

1. Look at the **purple test panel** in the top-right
2. Click the big button: **"🚀 RUN ALL TESTS"**
3. Watch the tests run in real-time!

#### **Option B: Console Command**

In the console, type:

```javascript
runComponentTests()
```

Then press Enter.

---

## 📊 **Expected Results**

### **In the Test Widget:**

You should see statistics like:

```
┌────────────────────────────────┐
│ 🧪 Component Tests          × │
├────────────────────────────────┤
│  TOTAL    PASSED    FAILED     │
│   12        12         0       │
├────────────────────────────────┤
│ Output:                        │
│ ✅ React root found            │
│ ✅ Found 45 buttons            │
│ ✅ Found 12 inputs             │
│ ✅ 4 stylesheets loaded        │
│ ✅ 89% images have alt text    │
│ ✅ Found 8 form labels         │
│ ✅ Good DOM size               │
│ 🎉 All tests passed!           │
└────────────────────────────────┘
```

### **Success Criteria: ✅**

- ✅ Total tests: 12+
- ✅ Passed: 10-12
- ✅ Failed: 0-1 (acceptable)
- ✅ Success rate: 85-100%

---

## 🎨 **Testing Each Component Category**

After running all tests, you can test individual categories:

### **Test DOM Structure**

Click the **"DOM"** button in the widget

**Expected:**

- ✅ React root found
- ✅ 40+ buttons found
- ✅ 10+ inputs found

### **Test Styles**

Click the **"Styles"** button

**Expected:**

- ✅ Multiple stylesheets loaded
- ✅ Inline styles present
- ✅ Responsive design detected

### **Test Accessibility**

Click the **"A11y"** button

**Expected:**

- ✅ 80%+ images with alt text
- ✅ Form labels present
- ✅ ARIA attributes found

### **Test Performance**

Click the **"Perf"** button

**Expected:**

- ✅ DOM size < 2000 elements
- ✅ Fast load time (< 3 seconds)
- ✅ Good page performance

---

## 🧭 **Testing Different Pages**

To thoroughly test all components, navigate through the app:

1. **Dashboard** - Click "Dashboard" in sidebar
   - Re-run tests: Click **🚀 RUN ALL TESTS**
   - Should find charts, cards, summary data

2. **Rooms** - Click "Rooms" in sidebar
   - Re-run tests
   - Should find room cards, grid layout

3. **Bookings** - Click "Bookings" in sidebar
   - Re-run tests
   - Should find booking forms, date pickers

4. **Tasks** - Click "Tasks" in sidebar
   - Re-run tests
   - Should find kanban board, task cards

5. **Staff** - Click "Staff" in sidebar
   - Re-run tests
   - Should find staff table, forms

6. **Analytics** - Click "Analytics" in sidebar
   - Re-run tests
   - Should find charts, visualizations

7. **Settings** - Click "Settings" in sidebar
   - Re-run tests
   - Should find configuration forms

---

## 💡 **Widget Features**

### **Drag the Widget**

- Click and hold the title "🧪 Component Tests"
- Drag to move it anywhere on the screen

### **Hide the Widget**

Click the **×** button in the top-right corner of the widget

### **Show the Widget Again**

In the console, type:

```javascript
showTestWidget()
```

### **Run Tests Anytime**

In the console, type:

```javascript
runComponentTests()
```

### **Hide Widget via Console**

```javascript
hideTestWidget()
```

---

## ✅ **Manual Component Checklist**

While testing, verify these work:

### **Navigation**

- [ ] Sidebar navigation visible
- [ ] All menu items clickable
- [ ] Active page highlighted
- [ ] Smooth page transitions

### **Forms**

- [ ] Login form accepts input
- [ ] Booking form displays correctly
- [ ] Date pickers work
- [ ] Dropdowns functional
- [ ] Form validation shows errors

### **Interactive Elements**

- [ ] Buttons respond to clicks
- [ ] Modals open and close
- [ ] Tooltips appear on hover
- [ ] Drag-and-drop works (tasks)

### **Data Display**

- [ ] Room cards display
- [ ] Tables render correctly
- [ ] Charts/graphs visible
- [ ] Empty states show properly

### **Responsive Design**

- [ ] Resize browser window
- [ ] Check mobile view (F12 → Toggle device toolbar)
- [ ] Navigation collapses properly
- [ ] Cards stack vertically on mobile

---

## 🐛 **Troubleshooting**

### **Widget doesn't appear**

**Solution:**

1. Make sure you're on `http://localhost:3000` (not /test-runner.html)
2. Check console for errors
3. Try reloading the page and running the script again

### **Tests show "Failed"**

**This is OK if:**

- You're on the login page (fewer elements)
- Only 1-2 tests failed
- Warnings about images or accessibility

**Fix by:**

- Log in to the app
- Navigate to a page with more content (Dashboard, Rooms)
- Re-run tests

### **"React root not found" error**

**Solution:**
You're on the wrong page!

- ❌ `http://localhost:3000/component-test-runner.html`
- ✅ `http://localhost:3000` (correct!)

---

## 📸 **Take Screenshots**

For documentation, take screenshots of:

1. The test widget showing results
2. Each page (Dashboard, Rooms, Bookings, etc.)
3. Any errors or issues you find

---

## 📊 **Test Report Summary**

After testing, document your findings:

```
KingsHMS Front-End Test Results
================================
Date: [Current Date]
Tester: [Your Name]

Pages Tested:
☐ Login
☐ Dashboard
☐ Rooms
☐ Bookings
☐ Tasks
☐ Staff
☐ Analytics
☐ Settings

Test Results:
Total Tests:    [   ]
Passed:         [   ]
Failed:         [   ]
Success Rate:   [   ]%

Issues Found:
1. [List any issues]
2. [List any issues]
3. [List any issues]

Overall Status:
☐ ✅ Ready for production
☐ ⚠️  Minor issues (acceptable)
☐ ❌ Major issues (needs fixing)
```

---

## 🎉 **You're All Set!**

**Quick Recap:**

1. Open `http://localhost:3000`
2. Press `F12` for console
3. Paste the test widget script
4. Click **🚀 RUN ALL TESTS**
5. Review results
6. Navigate through different pages
7. Re-test each page

**All Done!** Your front-end component testing is complete! 🚀
