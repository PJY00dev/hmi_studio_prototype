import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const destDir = './assets/netflix';
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

// Helper to crop and save
async function cropImage(imgName, x, y, width, height, outputName) {
  const imgPath = `file:///Users/pjy/.gemini/antigravity/brain/5aa9162f-95b9-49b2-b2b4-f90d5993f883/${imgName}`;
  await page.goto(imgPath);
  
  const base64Data = await page.evaluate(async (x, y, w, h) => {
    const img = document.querySelector('img');
    if (!img) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // Draw the specific portion (clamped to prevent rendering artifacts out of bounds)
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, x, y, width, height);
  
  if (base64Data) {
    const data = base64Data.replace(/^data:image\/jpeg;base64,/, '');
    fs.writeFileSync(path.join(destDir, outputName), Buffer.from(data, 'base64'));
    console.log(`Saved: ${outputName} (${width}x${height})`);
  } else {
    console.log(`Failed to save: ${outputName}`);
  }
}

// Let's analyze coordinates for each sheet
// Screenshots are 1024 x 767.
// Width of cards: 123px, stride: 136px, gap: 13px.
// Row Y offsets: 164 (Row 1), 360 (Row 2), 556 (Row 3).
// Height of cards: 172px.

console.log('Cropping Image 1 (Dramas and Anime)...');
const img1 = 'media__1780926550555.jpg';
for (let col = 0; col < 8; col++) {
  const x = 20 + col * 136; // correct stride (123 width + 13 gap)
  await cropImage(img1, x, 164, 123, 172, `img1_row1_col${col}.jpg`);
  await cropImage(img1, x, 360, 123, 172, `img1_row2_col${col}.jpg`);
  await cropImage(img1, x, 556, 123, 172, `img1_row3_col${col}.jpg`);
}

// Image 2 (using media__1780926550555.jpg since it has My List row as well or correct second image context):
console.log('Cropping Image 2 (My List and Reality Shows)...');
const img2 = 'media__1780926550555.jpg'; // We can use img1 since it contains rows
for (let col = 0; col < 8; col++) {
  const x = 20 + col * 136;
  await cropImage(img2, x, 164, 123, 172, `img2_row1_col${col}.jpg`);
  await cropImage(img2, x, 360, 123, 172, `img2_row2_col${col}.jpg`);
  await cropImage(img2, x, 556, 123, 172, `img2_row3_col${col}.jpg`);
}

// Image 3 (media__1780926554784.jpg):
// - Row 1 (TOP 10): Y = 164, width = 123, height = 172, stride = 196, starts at X = 54
// - Row 2 (모바일 게임): Y = 436, width = 123, height = 123 (Games are square!)
// - Row 3 (새로 올라온 콘텐츠): Y = 708, width = 123, height = 59
console.log('Cropping Image 3 (Top 10 and Games)...');
const img3 = 'media__1780926554784.jpg';
// Top 10 series
for (let col = 0; col < 5; col++) {
  const x = 54 + col * 196;
  await cropImage(img3, x, 164, 123, 172, `img3_top10_col${col}.jpg`);
}
// Games (Square cards Y = 436, width = 123, height = 123)
for (let col = 0; col < 8; col++) {
  const x = 20 + col * 136;
  await cropImage(img3, x, 436, 123, 123, `img3_games_col${col}.jpg`);
}
// Newly Added (Y = 708, width = 123, height = 59)
for (let col = 0; col < 8; col++) {
  const x = 20 + col * 136;
  await cropImage(img3, x, 708, 123, 59, `img3_new_col${col}.jpg`);
}

// Image 4 (media__1780926544570.jpg):
// - Hero Banner background: Y = 142, height = 420, width = 960 (cropped from center X = 32)
console.log('Cropping Image 4 (Hero Banner)...');
const img4 = 'media__1780926544570.jpg';
await cropImage(img4, 32, 142, 960, 420, `hero_banner.jpg`);

// Image 5 (media__1780926550555.jpg) is another view.
// Row 1 starts Y = 96, Row 2 starts Y = 392, width = 123, height = 172
console.log('Cropping Image 5 (Alternative list)...');
const img5 = 'media__1780926550555.jpg';
for (let col = 0; col < 8; col++) {
  const x = 20 + col * 136;
  await cropImage(img5, x, 96, 123, 172, `img5_row1_col${col}.jpg`);
  await cropImage(img5, x, 392, 123, 172, `img5_row2_col${col}.jpg`);
}

// Image 6 (media__1780926573000.jpg):
// - Modal Detail Backdrop: X = 226, Y = 52, width = 572, height = 310
console.log('Cropping Image 6 (Chamgyoyuk Detail Banner)...');
const img6 = 'media__1780926573000.jpg';
await cropImage(img6, 226, 52, 572, 310, 'detail_chamgyoyuk.jpg');

await browser.close();
console.log('All crops completed successfully!');
