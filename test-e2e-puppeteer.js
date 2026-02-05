import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting Puppeteer Smoke Test...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const title = await page.title();
    console.log(`✅ Page loaded. Title: ${title}`);
    
    if (title.toLowerCase().includes('kingshms') || title.toLowerCase().includes('hotel')) {
        console.log('✅ Basic branding check passed.');
    } else {
        console.warn('⚠️  Branding check might have failed or title is different.');
    }

    console.log('🎉 Smoke test passed!');
  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
