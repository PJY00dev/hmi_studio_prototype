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
  
  // Let's examine a row of pixels at Y = 250 (which is in the middle of Row 1)
  const y = 250;
  const imgData = ctx.getImageData(0, y, canvas.width, 1).data;
  
  // Let's analyze the brightness of each pixel along X
  const brightness = [];
  for (let x = 0; x < canvas.width; x++) {
    const r = imgData[x * 4];
    const g = imgData[x * 4 + 1];
    const b = imgData[x * 4 + 2];
    // Simple average brightness
    brightness.push(Math.round((r + g + b) / 3));
  }
  
  return {
    width: canvas.width,
    height: canvas.height,
    brightness: brightness
  };
});

await browser.close();

if (!data) {
  console.log("Failed to load image");
  process.exit(1);
}

console.log(`Image size: ${data.width}x${data.height}`);

// Let's print out runs of dark vs bright pixels to identify cards and gaps
// The background is pure black (0) or very dark (less than 10).
// Cards have pictures and are brighter (e.g. > 15-20).
let isCard = false;
let startX = 0;
const intervals = [];

for (let x = 0; x < data.width; x++) {
  const b = data.brightness[x];
  const threshold = 12; // dark threshold
  const pixelIsCard = b > threshold;
  
  if (pixelIsCard !== isCard) {
    if (x > 0) {
      intervals.push({
        type: isCard ? 'card' : 'gap',
        start: startX,
        end: x - 1,
        length: x - startX
      });
    }
    startX = x;
    isCard = pixelIsCard;
  }
}
intervals.push({
  type: isCard ? 'card' : 'gap',
  start: startX,
  end: data.width - 1,
  length: data.width - startX
});

console.log("Horizontal slice analysis at Y=250:");
intervals.forEach((interval, i) => {
  console.log(`  [${i}] ${interval.type.toUpperCase()}: X = ${interval.start} to ${interval.end} (width: ${interval.length})`);
});
