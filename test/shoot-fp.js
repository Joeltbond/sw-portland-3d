const puppeteer = require('puppeteer-core');

const PAGE = process.env.PAGE || 'file://' + __dirname + '/../index.html';
const OUT = process.env.OUT || __dirname + '/';
// [file, lng, lat, heading, look, mode]
const VIEWS = [
  ['fp-walk-ohsu.png', -122.6995, 45.4992, 35, 2, 'walk'],
  ['fp-walk-village.png', -122.7126, 45.4530, 30, 0, 'walk'],
  ['fp-fly-council.png', -122.7076, 45.4983, 150, -8, 'fly'],
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--use-angle=swiftshader', '--window-size=1600,1000', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));

  await page.goto(PAGE, { waitUntil: 'load' });
  // Page boots straight into first person (street level), so the initial tile set
  // streams slowly under swiftshader — wait only for map load here; each view below
  // does its own areTilesLoaded wait.
  await page.waitForFunction(
    () => typeof map !== 'undefined' && map.isStyleLoaded(),
    { timeout: 60000, polling: 500 }
  );
  await new Promise(r => setTimeout(r, 1500));   // let autoboot settle

  for (const [file, lng, lat, heading, look, mode] of VIEWS) {
    await page.evaluate((lng, lat, heading, look, mode) => {
      if (window.__fp.on) window.__fpExit();
      window.__fpEnter(lng, lat, heading, look, mode);
    }, lng, lat, heading, look, mode);
    await new Promise(r => setTimeout(r, 2000));
    await page.waitForFunction(() => map.areTilesLoaded(), { timeout: 45000, polling: 500 }).catch(() => console.log("(tiles still streaming, shooting anyway)"));
    await new Promise(r => setTimeout(r, 2500));
    // report camera state so we can sanity-check ground clamping
    const state = await page.evaluate(() => ({
      alt: window.__fp.alt, ground: map.queryTerrainElevation([window.__fp.lng, window.__fp.lat])
    }));
    console.log(file, JSON.stringify(state));
    await page.screenshot({ path: OUT + file });

    // Re-pop the zone toast on this fully-rendered scene and grab it (the toast
    // fades after ~3.6s, so it's gone by the normal screenshot above).
    await page.evaluate(() => window.__forceZone && window.__forceZone());
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: OUT + file.replace('.png', '-toast.png') });
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
