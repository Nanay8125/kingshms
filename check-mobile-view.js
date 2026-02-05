import puppeteer from 'puppeteer';
import { KnownDevices } from 'puppeteer';

(async () => {
  console.log('📱 Checking mobile view with Puppeteer...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Emulate iPhone 13
    const iPhone = KnownDevices['iPhone 13'];
    await page.emulate(iPhone);
    
    console.log('🌐 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Check for common mobile elements (like a hamburger menu)
    const isHamburgerPresent = await page.evaluate(() => {
      // Look for icons that usually represent a menu on mobile
      const menuIcons = document.querySelectorAll('svg, i, button');
      return Array.from(menuIcons).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('menu') || el.innerHTML.includes('menu');
      });
    });

    console.log(`🔍 Mobile Menu/Hamburger present: ${isHamburgerPresent ? '✅ Yes' : '⚠️  No (might use a different pattern)'}`);

    // Take a screenshot of the mobile view
    const screenshotPath = 'mobile-view-screenshot.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // Check layout - verify nothing is overflowing horizontally
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
        console.warn('⚠️  Potential horizontal overflow detected on mobile!');
    } else {
        console.log('✅ No horizontal overflow detected.');
    }

    console.log('🎉 Mobile view check completed!');
  } catch (error) {
    console.error('❌ Mobile view check failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
