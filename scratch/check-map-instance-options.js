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
    
    // mapInstance의 _mapOptions를 직접 가져와서 확인
    const result = await page.evaluate(() => {
      if (!window.mapInstance) {
        return "mapInstance is not defined on window";
      }
      
      const opt = window.mapInstance._mapOptions;
      // KVO 객체이므로 직접 키를 통해 값을 읽어야 할 수 있음
      const keys = Object.keys(opt);
      const values = {};
      for (const k of keys) {
        if (typeof opt[k] !== 'function') {
          values[k] = opt[k];
        }
      }
      
      // KVO get 메소드가 있는지 확인
      const glViaGet = typeof opt.get === 'function' ? opt.get('gl') : undefined;
      const customStyleIdViaGet = typeof opt.get === 'function' ? opt.get('customStyleId') : undefined;
      
      return {
        keys: keys,
        values: values,
        glProperty: opt.gl,
        glViaGet: glViaGet,
        customStyleIdProperty: opt.customStyleId,
        customStyleIdViaGet: customStyleIdViaGet,
        mapTypeId: window.mapInstance.getMapTypeId()
      };
    });
    
    console.log("Map Instance Options Check:", JSON.stringify(result, null, 2));
    
  } catch (err) {
    console.error("Error checking map options:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
})();
