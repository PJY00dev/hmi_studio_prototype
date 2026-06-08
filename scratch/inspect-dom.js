import puppeteer from 'puppeteer';

console.log("Inspecting DOM and Computed Styles...");

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

// Let's inspect the cards
const cardInfo = await page.evaluate(() => {
  const card = document.querySelector('.youtube-grid-card');
  if (!card) return 'No card found';
  
  const thumb = card.querySelector('.youtube-card-thumb');
  const thumbSpan = card.querySelector('.youtube-related-thumb');
  const img = card.querySelector('img');
  const avatar = card.querySelector('.youtube-card-avatar');
  
  const getStyle = (el) => {
    if (!el) return null;
    const s = window.getComputedStyle(el);
    return {
      width: s.width,
      height: s.height,
      display: s.display,
      position: s.position,
      background: s.background,
      borderRadius: s.borderRadius
    };
  };

  return {
    cardHTML: card.outerHTML,
    thumbStyle: getStyle(thumb),
    thumbSpanStyle: getStyle(thumbSpan),
    imgStyle: getStyle(img),
    avatarStyle: getStyle(avatar)
  };
});

console.log(JSON.stringify(cardInfo, null, 2));
await browser.close();
