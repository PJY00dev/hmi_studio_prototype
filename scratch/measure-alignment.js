import puppeteer from 'puppeteer';

console.log("Measuring alignment of Spotify and YouTube...");

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' });

// Open Spotify app
await page.evaluate(() => {
  document.querySelector('#dockApps')?.click();
});
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => {
  const spotifyBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('Spotify'));
  spotifyBtn?.click();
});
await new Promise(r => setTimeout(r, 1500));

const spotifyMetrics = await page.evaluate(() => {
  const logo = document.querySelector('.spotify-tablet-app .media-tablet-logo');
  const search = document.querySelector('.spotify-tablet-app .media-tablet-search');
  const rail = document.querySelector('.spotify-tablet-app .spotify-tablet-rail');
  const railBtn = document.querySelector('.spotify-tablet-app .spotify-tablet-rail button');
  const topbar = document.querySelector('.spotify-tablet-app .media-tablet-topbar');
  
  const getRect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right };
  };
  
  return {
    logo: getRect(logo),
    search: getRect(search),
    rail: getRect(rail),
    railBtn: getRect(railBtn),
    topbar: getRect(topbar)
  };
});

console.log("Spotify Metrics:", JSON.stringify(spotifyMetrics, null, 2));

// Open YouTube app
await page.evaluate(() => {
  document.querySelector('#dockApps')?.click();
});
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => {
  const ytBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('YouTube'));
  ytBtn?.click();
});
await new Promise(r => setTimeout(r, 1500));

const youtubeMetrics = await page.evaluate(() => {
  const logo = document.querySelector('.youtube-tablet-app .media-tablet-logo');
  const search = document.querySelector('.youtube-tablet-app .media-tablet-search');
  const rail = document.querySelector('.youtube-tablet-app .youtube-tablet-rail');
  const railBtn = document.querySelector('.youtube-tablet-app .youtube-tablet-rail button');
  const topbar = document.querySelector('.youtube-tablet-app .media-tablet-topbar');

  const getRect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right };
  };

  return {
    logo: getRect(logo),
    search: getRect(search),
    rail: getRect(rail),
    railBtn: getRect(railBtn),
    topbar: getRect(topbar)
  };
});

console.log("YouTube Metrics:", JSON.stringify(youtubeMetrics, null, 2));

await browser.close();
