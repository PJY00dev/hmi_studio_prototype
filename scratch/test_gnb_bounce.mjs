import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:8765 ...');
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Open Apps Grid
  console.log('Opening Apps grid...');
  await page.click('button[data-dock-action="apps"]');
  await new Promise(r => setTimeout(r, 1000));

  // 2. Click YouTube in Apps Grid to launch it (making it the most recent GNB app)
  console.log('Launching YouTube app...');
  await page.evaluate(() => {
    const youtubeBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('YouTube'));
    youtubeBtn?.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Find the YouTube GNB button in recent dock list
  console.log('Finding YouTube button in GNB recent list...');
  const hasYouTubeInGnb = await page.evaluate(() => {
    const btn = document.querySelector('#gnbRecentApps button[data-app-id="youtube"]');
    return !!btn;
  });
  console.log('YouTube GNB recent button exists:', hasYouTubeInGnb);

  if (!hasYouTubeInGnb) {
    console.error('ERROR: YouTube button not found in GNB recent apps!');
    await browser.close();
    process.exit(1);
  }

  // 4. Click the YouTube GNB button and check for class 'gnb-icon-bounce' immediately
  console.log('Clicking YouTube button in GNB...');
  await page.evaluate(() => {
    const btn = document.querySelector('#gnbRecentApps button[data-app-id="youtube"]');
    btn?.click();
  });

  const hasClassImmediately = await page.evaluate(() => {
    const btn = document.querySelector('#gnbRecentApps button[data-app-id="youtube"]');
    return btn ? btn.classList.contains('gnb-icon-bounce') : false;
  });
  console.log('Has gnb-icon-bounce class immediately after click:', hasClassImmediately);

  // 5. Wait 1.2 seconds and check if class is removed
  console.log('Waiting 1.2s for animation to complete...');
  await new Promise(r => setTimeout(r, 1200));

  const hasClassAfterDelay = await page.evaluate(() => {
    const btn = document.querySelector('#gnbRecentApps button[data-app-id="youtube"]');
    return btn ? btn.classList.contains('gnb-icon-bounce') : false;
  });
  console.log('Has gnb-icon-bounce class after 1.2s:', hasClassAfterDelay);

  await browser.close();

  if (hasClassImmediately && !hasClassAfterDelay) {
    console.log('TEST PASSED: Bounce animation class was successfully applied and removed!');
  } else {
    console.error('TEST FAILED: Class application or removal did not match expected behavior.');
    process.exit(1);
  }
})();
