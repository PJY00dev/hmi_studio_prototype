const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) console.log('PAGE HTTP ERROR:', response.status(), response.url());
  });

  await page.goto('file:///Users/pjy/Documents/Codex/hmi_prototype/index.html');
  await page.waitForTimeout(1000);
  await browser.close();
})();
