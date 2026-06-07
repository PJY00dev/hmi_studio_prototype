import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[PAGE LOG] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err);
  });

  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('/api/')) {
      console.log(`[API RESP] [${status}] ${url}`);
      try {
        const text = await response.text();
        console.log(`[API BODY] ${text.slice(0, 300)}...`);
      } catch (e) {
        console.log(`[API BODY ERROR] Could not read response body: ${e.message}`);
      }
    }
  });

  try {
    console.log("Navigating to http://localhost:8765 ...");
    await page.goto('http://localhost:8765', { waitUntil: 'networkidle2', timeout: 15000 });

    console.log("Waiting for map and elements to load...");
    await new Promise(r => setTimeout(r, 2000));

    console.log("Clicking #navSearchTrigger...");
    await page.click('#navSearchTrigger');

    console.log("Typing '성수역' into navSearchInput...");
    await page.waitForSelector('#navSearchInput', { visible: true });
    await page.type('#navSearchInput', '성수역');
    
    // We can dispatch an enter key or submit
    await page.keyboard.press('Enter');

    console.log("Waiting for search results...");
    await page.waitForSelector('.nav-result-item', { timeout: 5000 });

    console.log("Clicking the first search result...");
    await page.evaluate(() => {
      const firstResult = document.querySelector('.nav-result-item');
      if (firstResult) {
        firstResult.click();
      } else {
        throw new Error("No search result button found");
      }
    });

    console.log("Waiting for detail card and clicking '목적지로'...");
    await page.waitForSelector('#navSetDestBtn', { visible: true, timeout: 5000 });
    await page.click('#navSetDestBtn');

    console.log("Waiting 5 seconds for route calculation...");
    await new Promise(r => setTimeout(r, 5000));

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
})();
