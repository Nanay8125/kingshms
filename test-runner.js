import puppeteer from 'puppeteer';
import fs from 'fs';

async function runTests() {
  console.log('🚀 Starting KingsHMS Automated Testing Suite...\n');

  // Read test files
  const crudTestCode = fs.readFileSync('test-crud.js', 'utf8');
  const securityTestCode = fs.readFileSync('test-security.js', 'utf8');

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true, // Set to false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set up console logging
    page.on('console', msg => {
      if (msg.text().includes('🧪') || msg.text().includes('🔒') || msg.text().includes('✅') || msg.text().includes('❌')) {
        console.log(msg.text());
      }
    });

    // Navigate to the app
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Wait a bit for the app to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Injecting and running CRUD tests...');
    // Inject and run CRUD tests
    await page.evaluate(crudTestCode);

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Injecting and running Security tests...');
    // Inject and run Security tests
    await page.evaluate(securityTestCode);

    console.log('\n🎉 Automated Testing Complete!');
    console.log('Check the output above for test results.');

  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the tests
runTests().catch(console.error);
