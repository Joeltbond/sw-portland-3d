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
  // stand at plaza center, look near-level slightly down (Joel's phone view)
  await page.evaluate(() => window.__look(-122.70809, 45.49871, 70, -8));
  await new Promise(r=>setTimeout(r,1200));
  await page.screenshot({ path: __dirname + '/repro-eyelevel.png' });
  // also a slightly-down look toward where compass sprawls
  await page.evaluate(() => window.__look(-122.70809, 45.49871, 200, -12));
  await new Promise(r=>setTimeout(r,800));
  await page.screenshot({ path: __dirname + '/repro-eyelevel2.png' });
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
