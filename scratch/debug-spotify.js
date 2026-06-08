const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Navigate to local dev server
  await page.goto('http://localhost:8765');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Click the apps button in the dock
  await page.click('.dock [data-dock-action="apps"], [data-dock-action="apps"]');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Click the Spotify app in the apps grid
  await page.click('.launcher-app[data-app-id="spotify"]');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check specified styles (inline styles or from style sheets)
  const styles = await page.evaluate(() => {
    const el = document.querySelector('.spotify-now-panel');
    if (!el) return 'Element not found';
    
    // Check inline style
    const inline = el.style.gridTemplateRows;
    
    // Check matching rules
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (el.matches(rule.selectorText)) {
            rules.push({
              selector: rule.selectorText,
              gridTemplateRows: rule.style.gridTemplateRows,
              gridAutoRows: rule.style.gridAutoRows,
              gridTemplate: rule.style.gridTemplate,
              height: rule.style.height
            });
          }
        }
      } catch (e) {
        // cross-origin stylesheet or similar
      }
    }
    
    return {
      inline,
      rules
    };
  });
  
  console.log('--- SPECIFIED STYLES ---');
  console.log(JSON.stringify(styles, null, 2));
  console.log('------------------------');
  
  await browser.close();
})();
