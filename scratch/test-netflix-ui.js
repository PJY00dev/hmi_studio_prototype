import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Ensure screenshots directory exists
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

console.log('Launching Puppeteer browser...');
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('PAGE CONSOLE ERROR:', msg.text(), JSON.stringify(msg.location()));
  } else {
    console.log('PAGE LOG:', msg.text());
  }
});

page.on('pageerror', err => {
  console.log('PAGE ERROR STACK:', err.stack);
});

try {
  console.log('Navigating to http://localhost:8765 ...');
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));

  // 1. Open Apps Grid via direct JS click (bypasses potential overlapping layers)
  console.log('Opening Apps grid...');
  await page.evaluate(() => {
    document.querySelector('[data-dock-action="apps"]')?.click();
  });

  // Wait until .launcher-app appears in DOM (polling)
  console.log('Waiting for launcher app icons to appear in DOM...');
  const launcherAppeared = await page.evaluate(async () => {
    for (let i = 0; i < 40; i++) { // Wait up to 4 seconds
      const apps = document.querySelectorAll('.launcher-app');
      if (apps.length > 0) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  });

  if (!launcherAppeared) {
    // Take an error screenshot to help debug what is currently showing on screen
    await page.screenshot({ path: './screenshots/error_launcher_not_found.png' });
    throw new Error('Launcher apps did not render in DOM! Saved debug screenshot to screenshots/error_launcher_not_found.png');
  }
  console.log('Launching Netflix App...');
  const launched = await page.evaluate(() => {
    const apps = Array.from(document.querySelectorAll('.launcher-app'));
    console.log('Found launcher apps count:', apps.length);
    apps.forEach(app => console.log('App Title:', app.textContent.trim()));
    const netflixBtn = apps.find(btn => btn.textContent.toLowerCase().includes('netflix'));
    if (netflixBtn) {
      netflixBtn.click();
      return true;
    }
    return false;
  });

  if (!launched) {
    throw new Error('Netflix app button not found in launcher grid!');
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/netflix_1_home.png' });
  console.log('✓ Netflix Home screen screenshot saved: screenshots/netflix_1_home.png');

  // 3. Click "TV 프로그램" Tab
  console.log('Clicking "TV 프로그램" tab...');
  await page.evaluate(() => {
    const tvBtn = document.querySelector('[data-netflix-tab="tv-shows"]');
    tvBtn?.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/netflix_2_tv_shows.png' });
  console.log('✓ Netflix TV Shows tab screenshot saved: screenshots/netflix_2_tv_shows.png');

  // 4. Click "슬기로운 의사생활" card (ID: netflix-kdrama-0) to open Detail View
  console.log('Opening details for Hospital Playlist...');
  await page.evaluate(() => {
    const card = document.querySelector('[data-media-id="netflix-kdrama-0"]');
    card?.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/netflix_3_detail.png' });
  console.log('✓ Netflix Detail view screenshot saved: screenshots/netflix_3_detail.png');

  // 5. Toggle "My List" (내가 찜한 콘텐츠)
  console.log('Toggling "My List"...');
  await page.evaluate(() => {
    const myListBtn = document.querySelector('[data-netflix-mylist-toggle]');
    myListBtn?.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/netflix_4_detail_mylist_active.png' });
  console.log('✓ Netflix Detail view (My List active) screenshot saved: screenshots/netflix_4_detail_mylist_active.png');

  // 6. Click Play (재생) to start video player
  console.log('Clicking Play to launch player...');
  await page.evaluate(() => {
    const playBtn = document.querySelector('.netflix-btn-play');
    playBtn?.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/netflix_5_playing.png' });
  console.log('✓ Netflix Video Player screenshot saved: screenshots/netflix_5_playing.png');

  // 7. Go back from Player
  console.log('Closing video player...');
  await page.evaluate(() => {
    const closePlayerBtn = document.querySelector('[data-netflix-player-back]');
    closePlayerBtn?.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 8. Go back from Detail View to Catalog
  console.log('Closing Detail panel...');
  await page.evaluate(() => {
    const backBtn = document.querySelector('[data-netflix-back]');
    backBtn?.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 9. Navigate to "나의 넷플릭스" Tab
  console.log('Navigating to "나의 넷플릭스" tab...');
  await page.evaluate(() => {
    const myNetflixBtn = document.querySelector('[data-netflix-tab="my-netflix"]');
    myNetflixBtn?.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/netflix_6_my_netflix.png' });
  console.log('✓ Netflix My Netflix tab screenshot saved: screenshots/netflix_6_my_netflix.png');

} catch (err) {
  console.error('ERROR DURING AUTOMATION:', err);
} finally {
  console.log('Closing browser...');
  await browser.close();
}
