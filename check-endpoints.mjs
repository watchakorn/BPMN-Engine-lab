import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

await page.goto('http://localhost:5173/new', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/new-request.png' });
console.log('New Request screenshot done');

await page.goto('http://localhost:5173/manual', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/user-manual.png' });
console.log('User Manual screenshot done');

await browser.close();
