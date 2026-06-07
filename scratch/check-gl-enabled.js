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
    
    // glEnabled과 WebGLHelper 정보 확인
    const result = await page.evaluate(() => {
      if (!window.naver || !window.naver.maps) {
        return "naver.maps is not defined";
      }
      return {
        glEnabled: window.naver.maps.glEnabled,
        glEnabledType: typeof window.naver.maps.glEnabled,
        webglHelperType: typeof window.naver.maps.WebGLHelper,
        webglHelperKeys: window.naver.maps.WebGLHelper ? Object.keys(window.naver.maps.WebGLHelper) : null
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
