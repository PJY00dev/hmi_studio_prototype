import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

const images = [
  'media__1780907415860.jpg',
  'media__1780907415864.jpg',
  'media__1780907415868.jpg',
  'media__1780907415870.jpg',
  'media__1780907415874.jpg'
];

for (const imgName of images) {
  const imgPath = `file:///Users/pjy/.gemini/antigravity/brain/5aa9162f-95b9-49b2-b2b4-f90d5993f883/${imgName}`;
  await page.goto(imgPath);
  const dimensions = await page.evaluate(() => {
    const img = document.querySelector('img');
    return {
      width: img ? img.naturalWidth : 0,
      height: img ? img.naturalHeight : 0
    };
  });
  console.log(`${imgName}: ${dimensions.width} x ${dimensions.height}`);
}

await browser.close();
