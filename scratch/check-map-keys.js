import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to http://localhost:8765 ...");
    await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // naver.maps 내부의 key값들을 로깅
    const result = await page.evaluate(() => {
      if (!window.naver || !window.naver.maps) {
        return "naver.maps is not defined";
      }
      const keys = Object.keys(window.naver.maps);
      return {
        keys: keys,
        hasGl: 'gl' in window.naver.maps,
        glType: typeof window.naver.maps.gl,
        glKeys: window.naver.maps.gl ? Object.keys(window.naver.maps.gl) : null
      };
    });
    
    console.log("Evaluation Result:", JSON.stringify(result, null, 2));
    
  } catch (err) {
    console.error("Error during evaluation:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
})();
