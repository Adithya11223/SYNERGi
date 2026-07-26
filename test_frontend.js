import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('RESPONSE ERROR:', response.status(), response.url());
    }
  });

  try {
    await page.goto('http://localhost:5173/founder/todo', { waitUntil: 'networkidle2' });
    console.log("Page loaded");
  } catch (err) {
    console.error("Navigation error:", err);
  }

  await browser.close();
})();
