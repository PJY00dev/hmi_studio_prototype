import puppeteer from 'puppeteer';

console.log("Inspecting Netflix DOM Layout...");

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' });

// Click Apps dock button
await page.evaluate(() => {
  document.querySelector('#dockApps')?.click();
});
await new Promise(r => setTimeout(r, 1000));

// Click Netflix app
await page.evaluate(() => {
  const netflixBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('Netflix'));
  netflixBtn?.click();
});
await new Promise(r => setTimeout(r, 1500));

const dimensions = await page.evaluate(() => {
  const panel = document.querySelector('.netflix-panel-content');
  const scrollable = document.querySelector('.netflix-scrollable-content');
  const shelf = document.querySelector('.netflix-shelf');
  const shelfRow = document.querySelector('.netflix-shelf-row');
  const card = document.querySelector('.netflix-card-regular');
  
  const getStyle = (el) => {
    if (!el) return null;
    const s = window.getComputedStyle(el);
    return {
      width: el.clientWidth + 'px',
      height: el.clientHeight + 'px',
      paddingLeft: s.paddingLeft,
      paddingRight: s.paddingRight,
      gap: s.gap,
      flexBasis: s.flexBasis,
      maxWidth: s.maxWidth
    };
  };

  return {
    panel: getStyle(panel),
    scrollable: getStyle(scrollable),
    shelf: getStyle(shelf),
    shelfRow: getStyle(shelfRow),
    card: getStyle(card)
  };
});

console.log("Netflix DOM dimensions on 1920x1080 viewport:");
console.log(JSON.stringify(dimensions, null, 2));

await browser.close();
