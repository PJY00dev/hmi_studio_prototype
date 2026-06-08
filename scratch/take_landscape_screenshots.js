const puppeteer = require('puppeteer');
const { join } = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:8765 ...');
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Open Spotify App in Landscape
  console.log('Opening Apps grid for Spotify...');
  await page.click('[data-dock-action="apps"]');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Opening Spotify app...');
  await page.click('.launcher-app[data-app-id="spotify"]');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/screenshot_spotify_landscape_fixed.png' });
  console.log('Spotify landscape screenshot saved.');

  // 2. Open YouTube App in Landscape
  console.log('Opening Apps grid for YouTube...');
  await page.click('[data-dock-action="apps"]');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Opening YouTube app...');
  await page.click('.launcher-app[data-app-id="youtube"]');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/screenshot_youtube_landscape_fixed.png' });
  console.log('YouTube landscape screenshot saved.');

  // 3. Open Radio App in Landscape
  console.log('Opening Apps grid for Radio...');
  await page.click('[data-dock-action="apps"]');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Opening Radio app...');
  await page.click('.launcher-app[data-app-id="radio"]');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/screenshot_radio_landscape_fixed.png' });
  console.log('Radio landscape screenshot saved.');

  await browser.close();
})();
