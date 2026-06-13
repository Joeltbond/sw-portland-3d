const puppeteer = require('puppeteer-core');

const PAGE = process.env.PAGE || 'file://' + __dirname + '/../maplibre-legacy.html';
const OUT = process.env.OUT || __dirname + '/';
// orbit-camera views via URL hash: #zoom/lat/lng/bearing/pitch
const VIEWS = [
  ['orbit-overview.png', '#13.4/45.487/-122.7/205/62'],
  ['orbit-ohsu.png', '#14.5/45.4992/-122.6995/210/60'],
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--use-angle=swiftshader', '--window-size=1600,1000', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  for (const [file, hash] of VIEWS) {
    await page.goto(PAGE + hash, { waitUntil: 'load' });
    // wait for the map to be fully idle (all tiles + terrain loaded)
    await page.waitForFunction(
      () => typeof map !== 'undefined' && map.loaded() && map.areTilesLoaded(),
      { timeout: 60000, polling: 500 }
    );
    await new Promise(r => setTimeout(r, 4000)); // settle terrain/label fade-ins
    await page.screenshot({ path: OUT + file });
    console.log('wrote', file);
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
