const puppeteer = require('puppeteer-core');
const PAGE = 'file://' + __dirname + '/../index.html';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--use-angle=swiftshader','--window-size=1206,1000','--hide-scrollbars','--ignore-gpu-blocklist','--enable-webgl'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1206, height: 1000 });
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__fpsReady === true, { timeout: 90000, polling: 500 });
  await page.evaluate(() => { document.getElementById('play').style.display='none'; document.getElementById('crosshair').style.display='block'; });
  // stand at the north edge of the lawn, look into the fir ring and up — towering firs
  const shots = [
    [-122.70809, 45.49930, 0,   14, 'fps-firs-up.png'],   // ~65 m N, look N into forest, pitch up
    [-122.70809, 45.49930, 20,  6,  'fps-firs-edge.png'],  // same, near-level toward the ring
  ];
  for (const [lng,lat,h,p,name] of shots) {
    await page.evaluate((lng,lat,h,p) => window.__look(lng,lat,h,p), lng,lat,h,p);
    await new Promise(r=>setTimeout(r,1200));
    await page.screenshot({ path: __dirname + '/' + name });
    console.log('shot', name);
  }
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
