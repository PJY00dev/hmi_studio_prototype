import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

// Capture console logs
page.on('console', msg => {
  if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  if (msg.text().includes('Map') || msg.text().includes('map') || msg.text().includes('naver')) {
    console.log('MAP LOG:', msg.text());
  }
});

console.log('Navigating to http://localhost:8765 ...');
await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 20000 });

// Wait for map and everything to load
await new Promise(r => setTimeout(r, 4000));

// 1. Save standard Home screenshot
await page.screenshot({ path: './screenshots/screenshot_nav_home.png', fullPage: false });
console.log('Home screenshot saved as screenshots/screenshot_nav_home.png');

// 2. Open Apps Grid
console.log('Opening Apps grid...');
await page.evaluate(() => {
  document.querySelector('#dockApps')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/screenshot_apps.png', fullPage: false });
console.log('Apps grid screenshot saved as screenshots/screenshot_apps.png');

// 3. Open YouTube Music
console.log('Opening YouTube Music app...');
await page.evaluate(() => {
  const ytMusicBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('YouTube Music'));
  ytMusicBtn?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/screenshot_yt_music_app.png', fullPage: false });
console.log('YouTube Music screen screenshot saved as screenshots/screenshot_yt_music_app.png');

// 4. Click the first song in YouTube Music ("Drive Mix") and click Play
console.log('Selecting song and clicking play...');
await page.evaluate(() => {
  // Select first item
  const firstSong = document.querySelector('.media-result');
  firstSong?.click();
});
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  // Click Play
  const playBtn = document.querySelector('.media-play-button');
  playBtn?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/screenshot_yt_music_playing.png', fullPage: false });
console.log('YouTube Music playing screenshot saved as screenshots/screenshot_yt_music_playing.png');

// 5. Navigate back to Home and verify Dashboard Media Widget sync
console.log('Navigating back to Home to check media sync...');
await page.evaluate(() => {
  document.querySelector('#dockHome')?.click();
});
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: './screenshots/screenshot_home_playing.png', fullPage: false });
console.log('Home screen (playing state) screenshot saved as screenshots/screenshot_home_playing.png');

// 6. Click the search trigger on Home
console.log('Testing nav search overlay...');
await page.evaluate(() => {
  document.querySelector('#navSearchTrigger')?.click();
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: './screenshots/screenshot_nav_search.png', fullPage: false });
console.log('Nav search screenshot saved as screenshots/screenshot_nav_search.png');

await browser.close();
