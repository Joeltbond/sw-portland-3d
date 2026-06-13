const puppeteer = require('puppeteer-core');

const PAGE = process.env.PAGE || 'file://' + __dirname + '/../fps.html';
const OUT = process.env.OUT || __dirname + '/';
// [file, lng, lat, heading, pitch]
const VIEWS = [
  ['fps-summit-ne.png', -122.7076, 45.4983, 40, -6],    // summit, out over the city
  ['fps-summit-down.png', -122.7076, 45.4983, 150, -20], // summit, down the wooded slope
  ['fps-slope.png', -122.7050, 45.4955, 320, -2],        // partway down, looking back up
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--use-angle=swiftshader', '--window-size=1600,1000', '--hide-scrollbars',
           '--ignore-gpu-blocklist', '--enable-webgl'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

  await page.goto(PAGE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__fpsReady === true, { timeout: 90000, polling: 500 });
  // headless never locks the pointer, so reveal the world (hide the click-to-enter overlay)
  await page.evaluate(() => {
    document.getElementById('play').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
    document.getElementById('spot').style.display = 'block';
  });
  await new Promise(r => setTimeout(r, 1500));

  for (const [file, lng, lat, heading, pitch] of VIEWS) {
    await page.evaluate((lng, lat, heading, pitch) => window.__look(lng, lat, heading, pitch),
      lng, lat, heading, pitch);
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: OUT + file });
    console.log('shot', file);
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
