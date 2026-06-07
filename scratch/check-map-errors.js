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
  
  // 모든 네트워크 요청 및 응답 로깅
  page.on('request', req => {
    const url = req.url();
    if (url.includes('style') || url.includes('naver') || url.includes('ntruss') || url.includes('openapi')) {
      // console.log(`[REQ] ${req.method()} ${url}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('style') || url.includes('naver') || url.includes('ntruss') || url.includes('openapi') || !response.ok()) {
      console.log(`[RESP] [${status}] ${url}`);
    }
  });

  try {
    console.log("Navigating to http://localhost:8765 ...");
    await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log("Waiting 8 seconds for map to load and style files to be requested...");
    await new Promise(r => setTimeout(r, 8000));
  } catch (err) {
    console.error("Navigation/Wait Error:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
})();
