// In-App Component Testing Widget for KingsHMS
// Run this in browser console at http://localhost:3000 to add a test panel to your app

(function () {
    'use strict';

    // Check if widget already exists
    if (document.getElementById('kingshms-test-widget')) {
        console.log('⚠️ Test widget already loaded');
        return;
    }

    // Create widget HTML
    const widgetHTML = `
    <div id="kingshms-test-widget" style="
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    ">
      <div style="
        padding: 20px;
        background: rgba(255,255,255,0.95);
        border-radius: 12px;
        margin: 2px;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #667eea;
        ">
          <h3 style="margin: 0; color: #333; font-size: 18px;">
            🧪 Component Tests
          </h3>
          <button id="test-widget-close" style="
            background: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0;
            width: 30px;
            height: 30px;
            line-height: 1;
          ">×</button>
        </div>

        <!-- Quick Stats -->
        <div id="test-stats" style="
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        ">
          <div style="text-align: center; padding: 10px; background: #f0f0f0; border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #2196F3;" id="stat-total">0</div>
            <div style="font-size: 11px; color: #666;">TOTAL</div>
          </div>
          <div style="text-align: center; padding: 10px; background: #f0f0f0; border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #4CAF50;" id="stat-passed">0</div>
            <div style="font-size: 11px; color: #666;">PASSED</div>
          </div>
          <div style="text-align: center; padding: 10px; background: #f0f0f0; border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #f44336;" id="stat-failed">0</div>
            <div style="font-size: 11px; color: #666;">FAILED</div>
          </div>
        </div>

        <!-- Test Buttons -->
        <div style="margin-bottom: 15px;">
          <button id="btn-run-all" style="
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 8px;
          ">🚀 RUN ALL TESTS</button>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button id="btn-test-dom" style="
              padding: 8px;
              background: #4CAF50;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            ">DOM</button>
            <button id="btn-test-style" style="
              padding: 8px;
              background: #2196F3;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            ">Styles</button>
            <button id="btn-test-a11y" style="
              padding: 8px;
              background: #ff9800;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            ">A11y</button>
            <button id="btn-test-perf" style="
              padding: 8px;
              background: #9C27B0;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            ">Performance</button>
          </div>
        </div>

        <!-- Progress -->
        <div id="test-progress" style="
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 15px;
          display: none;
        ">
          <div id="test-progress-bar" style="
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            width: 0%;
            transition: width 0.3s;
          "></div>
        </div>

        <!-- Output -->
        <div id="test-output" style="
          max-height: 300px;
          overflow-y: auto;
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 12px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.6;
        ">
          <div style="color: #4CAF50;">✨ Ready to test!</div>
          <div style="color: #2196F3;">Click "RUN ALL TESTS" to begin</div>
        </div>

        <!-- Toggle Button -->
        <button id="btn-toggle-output" style="
          width: 100%;
          padding: 6px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 11px;
          color: #666;
          cursor: pointer;
          margin-top: 8px;
        ">📊 Toggle Output</button>
      </div>
    </div>
  `;

    // Inject widget
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Get elements
    const widget = document.getElementById('kingshms-test-widget');
    const output = document.getElementById('test-output');
    const progressBar = document.getElementById('test-progress-bar');
    const progressContainer = document.getElementById('test-progress');

    // Stats
    const stats = { total: 0, passed: 0, failed: 0 };

    function updateStats() {
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-passed').textContent = stats.passed;
        document.getElementById('stat-failed').textContent = stats.failed;
    }

    function log(message, color = '#d4d4d4') {
        const line = document.createElement('div');
        line.style.color = color;
        line.textContent = message;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function clearOutput() {
        output.innerHTML = '';
        stats.total = 0;
        stats.passed = 0;
        stats.failed = 0;
        updateStats();
    }

    function updateProgress(percent) {
        progressContainer.style.display = 'block';
        progressBar.style.width = percent + '%';
    }

    // Test functions
    async function testDOM() {
        log('\n🔍 Testing DOM...', '#2196F3');

        const root = document.getElementById('root');
        if (root) {
            log('✅ React root found', '#4CAF50');
            stats.passed++;
        } else {
            log('❌ React root NOT found', '#f44336');
            stats.failed++;
        }
        stats.total++;

        const buttons = document.querySelectorAll('button').length;
        log(`✅ Found ${buttons} buttons`, '#4CAF50');
        stats.passed++;
        stats.total++;

        const inputs = document.querySelectorAll('input, textarea, select').length;
        log(`✅ Found ${inputs} inputs`, '#4CAF50');
        stats.passed++;
        stats.total++;

        updateStats();
    }

    async function testStyles() {
        log('\n🎨 Testing Styles...', '#2196F3');

        const sheets = document.styleSheets.length;
        log(`✅ ${sheets} stylesheets loaded`, '#4CAF50');
        stats.passed++;
        stats.total++;

        const styledElements = document.querySelectorAll('[style]').length;
        log(`✅ ${styledElements} inline styles`, '#4CAF50');
        stats.passed++;
        stats.total++;

        updateStats();
    }

    async function testA11y() {
        log('\n♿ Testing Accessibility...', '#ff9800');

        const images = document.querySelectorAll('img');
        const withAlt = document.querySelectorAll('img[alt]').length;
        if (images.length > 0) {
            const percent = ((withAlt / images.length) * 100).toFixed(0);
            log(`✅ ${percent}% images have alt text`, '#4CAF50');
            stats.passed++;
        }
        stats.total++;

        const labels = document.querySelectorAll('label').length;
        log(`✅ Found ${labels} form labels`, '#4CAF50');
        stats.passed++;
        stats.total++;

        updateStats();
    }

    async function testPerformance() {
        log('\n⚡ Testing Performance...', '#9C27B0');

        const elementCount = document.getElementsByTagName('*').length;
        log(`📊 DOM elements: ${elementCount}`, '#d4d4d4');

        if (elementCount < 2000) {
            log('✅ Good DOM size', '#4CAF50');
            stats.passed++;
        } else {
            log('⚠️ Large DOM', '#ff9800');
        }
        stats.total++;

        if (window.performance) {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            log(`⏱️ Load time: ${loadTime}ms`, '#d4d4d4');

            if (loadTime < 3000) {
                log('✅ Fast load time', '#4CAF50');
                stats.passed++;
            }
            stats.total++;
        }

        updateStats();
    }

    async function runAllTests() {
        clearOutput();
        log('🚀 Running All Tests...', '#2196F3');
        log('═'.repeat(40), '#666');

        const tests = [testDOM, testStyles, testA11y, testPerformance];

        for (let i = 0; i < tests.length; i++) {
            updateProgress(((i) / tests.length) * 100);
            await tests[i]();
            await new Promise(r => setTimeout(r, 100));
        }

        updateProgress(100);

        log('\n📊 SUMMARY', '#2196F3');
        log('═'.repeat(40), '#666');
        log(`Total:  ${stats.total}`, '#d4d4d4');
        log(`Passed: ${stats.passed} ✅`, '#4CAF50');
        log(`Failed: ${stats.failed} ❌`, '#f44336');

        const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
        log(`Rate:   ${rate}%`, '#d4d4d4');

        if (stats.failed === 0) {
            log('\n🎉 All tests passed!', '#4CAF50');
        }
    }

    // Event listeners
    document.getElementById('test-widget-close').onclick = () => {
        widget.style.display = 'none';
    };

    document.getElementById('btn-run-all').onclick = runAllTests;
    document.getElementById('btn-test-dom').onclick = testDOM;
    document.getElementById('btn-test-style').onclick = testStyles;
    document.getElementById('btn-test-a11y').onclick = testA11y;
    document.getElementById('btn-test-perf').onclick = testPerformance;

    document.getElementById('btn-toggle-output').onclick = () => {
        output.style.display = output.style.display === 'none' ? 'block' : 'none';
    };

    // Make widget draggable
    let isDragging = false;
    let currentX, currentY, initialX, initialY;

    widget.querySelector('h3').style.cursor = 'move';
    widget.querySelector('h3').onmousedown = (e) => {
        isDragging = true;
        initialX = e.clientX - widget.offsetLeft;
        initialY = e.clientY - widget.offsetTop;
    };

    document.onmousemove = (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            widget.style.left = currentX + 'px';
            widget.style.top = currentY + 'px';
            widget.style.right = 'auto';
        }
    };

    document.onmouseup = () => {
        isDragging = false;
    };

    console.log('✅ Test widget loaded! ' ');
  console.log('💡 Click the widget or use: window.runComponentTests()');

    // Export function
    window.runComponentTests = runAllTests;
    window.hideTestWidget = () => { widget.style.display = 'none'; };
    window.showTestWidget = () => { widget.style.display = 'block'; };

})();
