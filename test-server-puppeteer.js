const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

// Start python server
const server = spawn('python3', ['-m', 'http.server', '8080']);

server.stdout.on('data', () => {
  (async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('response', response => {
      if (!response.ok()) console.log('PAGE HTTP ERROR:', response.status(), response.url());
    });

    await page.goto('http://localhost:8080/index.html');
    await new Promise(r => setTimeout(r, 1000));
    await browser.close();
    server.kill();
  })();
});
