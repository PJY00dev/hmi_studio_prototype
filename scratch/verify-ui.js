import puppeteer from 'puppeteer';
import fs from 'fs';

console.log("Starting UI verification script...");

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

// Ensure screenshot directory exists
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

console.log("Navigating to http://localhost:8765 ...");
await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 20000 });
await new Promise(r => setTimeout(r, 4000)); // wait for maps to render

// 1. Open Spotify App
console.log("Opening Spotify App...");
await page.evaluate(() => {
  // open apps drawer first
  document.querySelector('#dockApps')?.click();
});
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => {
  // click Spotify app
  const spotifyBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('Spotify'));
  spotifyBtn?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/spotify_1_home.png' });
console.log("Spotify Home tab screenshot saved.");

// 2. Click Spotify Search Tab
console.log("Clicking Spotify Search Tab...");
await page.evaluate(() => {
  document.querySelector('[data-spotify-tab="search"]')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/spotify_2_search.png' });
console.log("Spotify Search tab screenshot saved.");

// 3. Click Spotify Library Tab
console.log("Clicking Spotify Library Tab...");
await page.evaluate(() => {
  document.querySelector('[data-spotify-tab="library"]')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/spotify_3_library.png' });
console.log("Spotify Library tab screenshot saved.");

// 4. Click Spotify Profile Tab
console.log("Clicking Spotify Profile Tab...");
await page.evaluate(() => {
  document.querySelector('[data-spotify-tab="profile"]')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/spotify_4_profile.png' });
console.log("Spotify Profile tab screenshot saved.");


// 5. Open YouTube App
console.log("Opening YouTube App...");
await page.evaluate(() => {
  // click Apps drawer dock button
  document.querySelector('#dockApps')?.click();
});
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => {
  // click YouTube app
  const ytBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('YouTube'));
  ytBtn?.click();
});
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: './screenshots/youtube_1_list_home.png' });
console.log("YouTube Feed/List Home screenshot saved.");

// 6. Click First Video Card to open Watch Page (Detail View)
console.log("Opening YouTube Watch Page (Detail View)...");
await page.evaluate(() => {
  document.querySelector('.youtube-grid-card')?.click();
});
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: './screenshots/youtube_2_watch_detail.png' });
console.log("YouTube Watch Detail Page screenshot saved.");

// 7. Click Back to List button
console.log("Clicking YouTube Back to List button...");
await page.evaluate(() => {
  document.querySelector('[data-youtube-back]')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/youtube_3_back_to_list.png' });
console.log("YouTube back-to-list screenshot saved.");

// 8. Click Shorts Tab
console.log("Clicking YouTube Shorts Tab...");
await page.evaluate(() => {
  document.querySelector('[data-youtube-tab="shorts"]')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/youtube_4_shorts.png' });
console.log("YouTube Shorts tab screenshot saved.");

// 9. Click Subscriptions Tab
console.log("Clicking YouTube Subscriptions Tab...");
await page.evaluate(() => {
  document.querySelector('[data-youtube-tab="subscriptions"]')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/youtube_5_subscriptions.png' });
console.log("YouTube Subscriptions tab screenshot saved.");

// 10. Click You Tab
console.log("Clicking YouTube You Tab...");
await page.evaluate(() => {
  document.querySelector('[data-youtube-tab="you"]')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/youtube_6_you.png' });
console.log("YouTube You tab screenshot saved.");

await browser.close();
console.log("UI verification script complete! All screenshots saved in ./screenshots.");
