import puppeteer from 'puppeteer';
import fs from 'fs';

console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 }); // Matches tablet layout aspect ratio nicely

try {
  console.log('Navigating to http://localhost:8765 ...');
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // Open Apps Grid
  console.log('Opening Apps grid...');
  await page.evaluate(() => {
    document.querySelector('[data-dock-action="apps"]')?.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Launch Netflix App
  console.log('Launching Netflix App...');
  await page.evaluate(() => {
    const apps = Array.from(document.querySelectorAll('.launcher-app'));
    const netflixBtn = apps.find(btn => btn.textContent.toLowerCase().includes('netflix'));
    if (netflixBtn) netflixBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Take a home screen screenshot
  await page.screenshot({ path: './screenshots/netflix_home_before_modal.png' });
  console.log('Saved screenshots/netflix_home_before_modal.png');

  // Click on "참교육" thumbnail (ID: netflix-picked-0)
  console.log('Clicking "참교육" thumbnail...');
  await page.evaluate(() => {
    const card = document.querySelector('[data-media-id="netflix-picked-0"]');
    if (card) {
      card.click();
    } else {
      console.log('Could not find card with data-media-id="netflix-picked-0"');
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot of the detail modal
  await page.screenshot({ path: './screenshots/netflix_detail_modal_chamgyoyuk.png' });
  console.log('Saved screenshots/netflix_detail_modal_chamgyoyuk.png');

} catch (err) {
  console.error('ERROR:', err);
} finally {
  await browser.close();
}
