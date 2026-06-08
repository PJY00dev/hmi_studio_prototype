import puppeteer from 'puppeteer';

console.log("Inspecting Shorts DOM and Computed Styles...");

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' });

// Open YouTube app
await page.evaluate(() => {
  document.querySelector('#dockApps')?.click();
});
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => {
  const ytBtn = Array.from(document.querySelectorAll('.launcher-app')).find(btn => btn.textContent.includes('YouTube'));
  ytBtn?.click();
});
await new Promise(r => setTimeout(r, 1500));

// Go to Shorts tab
await page.evaluate(() => {
  document.querySelector('[data-youtube-tab="shorts"]')?.click();
});
await new Promise(r => setTimeout(r, 1500));

// Let's inspect the Shorts cards
const shortsInfo = await page.evaluate(() => {
  const card = document.querySelector('.youtube-shorts-card');
  if (!card) return 'No shorts card found';
  
  const thumb = card.querySelector('.youtube-shorts-thumb');
  const thumbSpan = card.querySelector('.youtube-related-thumb');
  const svg = card.querySelector('svg');
  const overlay = card.querySelector('.youtube-shorts-overlay');
  
  const getStyle = (el) => {
    if (!el) return null;
    const s = window.getComputedStyle(el);
    return {
      width: s.width,
      height: s.height,
      display: s.display,
      position: s.position,
      background: s.background,
      borderRadius: s.borderRadius,
      top: s.top,
      left: s.left,
      justifyContent: s.justifyContent,
      alignItems: s.alignItems
    };
  };

  return {
    cardHTML: card.outerHTML,
    thumbStyle: getStyle(thumb),
    thumbSpanStyle: getStyle(thumbSpan),
    svgStyle: getStyle(svg),
    overlayStyle: getStyle(overlay)
  };
});

console.log(JSON.stringify(shortsInfo, null, 2));
await browser.close();
