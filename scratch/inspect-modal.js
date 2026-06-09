import puppeteer from 'puppeteer';

console.log("Inspecting modal DOM layout...");
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

try {
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Open Apps Grid
  await page.evaluate(() => {
    document.querySelector('[data-dock-action="apps"]')?.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Launch Netflix App
  await page.evaluate(() => {
    const apps = Array.from(document.querySelectorAll('.launcher-app'));
    const netflixBtn = apps.find(btn => btn.textContent.toLowerCase().includes('netflix'));
    if (netflixBtn) netflixBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click on 참교육 thumbnail
  await page.evaluate(() => {
    const card = document.querySelector('[data-media-id="netflix-picked-0"]');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Extract layout information
  const info = await page.evaluate(() => {
    const shell = document.querySelector('.netflix-tablet-shell');
    const rail = document.querySelector('.netflix-tablet-rail');
    const container = document.querySelector('.netflix-main-container');
    const backdrop = document.querySelector('.netflix-modal-backdrop');
    const modal = document.querySelector('.netflix-detail-modal');

    const getMetrics = (el, name) => {
      if (!el) return { name, exists: false };
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        name,
        exists: true,
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        position: style.position,
        gridColumn: style.gridColumn,
        gridRow: style.gridRow,
        display: style.display,
        justifyContent: style.justifyContent,
        alignItems: style.alignItems
      };
    };

    return {
      shell: getMetrics(shell, 'shell'),
      rail: getMetrics(rail, 'rail'),
      container: getMetrics(container, 'container'),
      backdrop: getMetrics(backdrop, 'backdrop'),
      modal: getMetrics(modal, 'modal')
    };
  });

  console.log("DOM Layout Metrics:", JSON.stringify(info, null, 2));

} catch (err) {
  console.error("Error inspecting:", err);
} finally {
  await browser.close();
}
