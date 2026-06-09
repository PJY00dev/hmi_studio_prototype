import puppeteer from 'puppeteer';

console.log("Inspecting Palette Icon DOM and Styles...");

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

await page.goto('http://localhost:8765', { waitUntil: 'networkidle0' });

// Enter Edit Mode
await page.evaluate(() => {
  const enterBtn = document.querySelector('#enterEdit');
  enterBtn?.click();
});
await new Promise(r => setTimeout(r, 1000));

const result = await page.evaluate(() => {
  // Find Gleo AI icon inside the palette-app button
  const gleoBtn = Array.from(document.querySelectorAll('.palette-app')).find(btn => btn.textContent.includes('Gleo AI'));
  if (!gleoBtn) return 'Gleo AI button not found';

  const cardIcon = gleoBtn.querySelector('.card-icon');
  const svg = cardIcon?.querySelector('svg');
  const path = svg?.querySelector('path');

  const getStyle = (el) => {
    if (!el) return null;
    const s = window.getComputedStyle(el);
    return {
      width: s.width,
      height: s.height,
      display: s.display,
      position: s.position,
      fill: s.fill,
      stroke: s.stroke,
      color: s.color,
      visibility: s.visibility,
      opacity: s.opacity
    };
  };

  return {
    gleoBtnHTML: gleoBtn.outerHTML,
    cardIconStyle: getStyle(cardIcon),
    svgStyle: getStyle(svg),
    pathStyle: getStyle(path),
    svgChildrenCount: svg ? svg.children.length : 0,
    svgChildrenTags: svg ? Array.from(svg.children).map(c => c.tagName) : []
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
