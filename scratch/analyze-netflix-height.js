import puppeteer from 'puppeteer';

const imgName = 'media__1780911065717.jpg';
const imgPath = `file:///Users/pjy/.gemini/antigravity/brain/5aa9162f-95b9-49b2-b2b4-f90d5993f883/${imgName}`;

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(imgPath);

const data = await page.evaluate(() => {
  const img = document.querySelector('img');
  if (!img) return null;
  
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  // Let's examine a vertical column of pixels at X = 80 (middle of Card 1)
  const x = 80;
  const imgData = ctx.getImageData(x, 0, 1, canvas.height).data;
  
  const brightness = [];
  for (let y = 0; y < canvas.height; y++) {
    const r = imgData[y * 4];
    const g = imgData[y * 4 + 1];
    const b = imgData[y * 4 + 2];
    brightness.push(Math.round((r + g + b) / 3));
  }
  
  return {
    brightness: brightness
  };
});

await browser.close();

// Print out brightness run to identify where the rows start and end vertically
let isRow = false;
let startY = 0;
const intervals = [];

for (let y = 0; y < 767; y++) {
  const b = data.brightness[y];
  const threshold = 15;
  const pixelIsRow = b > threshold;
  
  if (pixelIsRow !== isRow) {
    if (y > 0) {
      intervals.push({
        type: isRow ? 'row' : 'space',
        start: startY,
        end: y - 1,
        length: y - startY
      });
    }
    startY = y;
    isRow = pixelIsRow;
  }
}

console.log("Vertical analysis at X=80:");
intervals.forEach((interval, i) => {
  if (interval.type === 'row' && interval.length > 50) {
    console.log(`  [${i}] Row: Y = ${interval.start} to ${interval.end} (height: ${interval.length})`);
  }
});
