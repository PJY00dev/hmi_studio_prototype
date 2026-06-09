import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

console.log('Starting server.js...');
const server = spawn('node', ['server.js'], { stdio: 'inherit' });
server.on('error', (err) => {
  console.log('Server process error (might already be running):', err.message);
});

// Wait a moment for the server to start up
await new Promise(r => setTimeout(r, 2000));

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:8765 ...');
  await page.goto('http://localhost:8765', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Entering Edit Mode...');
  await page.evaluate(() => {
    const editBtn = document.getElementById('enterEdit');
    if (editBtn) {
      editBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  console.log('Selecting "내비게이션" (already placed app) and placing it in the second slot (Slot index 1)...');
  await page.evaluate(() => {
    const paletteApps = document.querySelectorAll('.palette-app');
    const navBtn = Array.from(paletteApps).find(btn => btn.textContent.includes('내비게이션'));
    if (navBtn) {
      navBtn.click(); // Select Navigation
      const slots = document.querySelectorAll('.edit-slot');
      if (slots.length > 1) {
        slots[1].click(); // Place into Slot index 1. This triggers cleanup of Slot index 0.
      }
    }
  });

  // Capture screenshot during the flashing animation
  console.log('Capturing flashing animation in progress...');
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: './screenshots/edit_flash_active.png', fullPage: false });
  console.log('Flashing screenshot saved to screenshots/edit_flash_active.png');

  // Capture screenshot after the animation has finished (should revert to normal edit card)
  console.log('Capturing post-animation state...');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/edit_flash_complete.png', fullPage: false });
  console.log('Post-flash screenshot saved to screenshots/edit_flash_complete.png');

  // Click Save (저장) button to return to home and verify the empty slot rendering
  console.log('Clicking "저장" (Save) button...');
  await page.evaluate(() => {
    const saveBtn = document.getElementById('saveEdit');
    if (saveBtn) {
      saveBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/edit_save_empty.png', fullPage: false });
  console.log('Save empty slot dashboard screenshot saved to screenshots/edit_save_empty.png');

} catch (error) {
  console.error('Test execution failed:', error);
} finally {
  console.log('Closing browser and stopping server...');
  await browser.close();
  server.kill();
  process.exit(0);
}
