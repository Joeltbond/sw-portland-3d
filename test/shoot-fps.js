const puppeteer = require('puppeteer-core');

const PAGE = process.env.PAGE || 'file://' + __dirname + '/../fps.html';
const OUT = process.env.OUT || __dirname + '/';
// [file, lng, lat, heading, pitch]
const VIEWS = [
  ['fps-hood.png', -122.7076, 45.4983, 100, 5],          // summit → Mt Hood (E), the hero backdrop shot
  ['fps-helens.png', -122.7076, 45.4983, 27, 4],         // summit → Mt St Helens / Rainier (NNE)
  ['fps-summit-ne.png', -122.7076, 45.4983, 40, -6],     // summit, out over the city
  ['fps-summit-down.png', -122.7076, 45.4983, 150, -20], // summit, down the wooded slope
  ['fps-slope.png', -122.7050, 45.4955, 320, -2],        // partway down, looking back up
  ['fps-plaza.png', -122.7076, 45.4983, 90, -42],        // spawn, look down at the compass-rose deck
  ['fps-tower.png', -122.7076, 45.4983, 172, 6],         // summit → the broadcast tower (SSE)
  ['fps-fountain.png', -122.7076, 45.4983, 38, 7],       // spawn → the "Joy" bronze fountain (NE off the rim)
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

  // audio graph: build it and fire each synth — headless can't hear, but this proves
  // the Web Audio graph constructs and footstep/chirp run without throwing.
  const audio = await page.evaluate(() => {
    try {
      const s = window.__initAudio();
      window.__footstep(false); window.__footstep(true); window.__chirp();
      return s;
    } catch (e) { return { error: e.message }; }
  });
  console.log('audio:', JSON.stringify(audio));
  console.log('trees:', await page.evaluate(() => window.__treeCount && window.__treeCount()));
  console.log('summit:', await page.evaluate(() => window.__hasSummit && window.__hasSummit()));
  console.log('fountain:', await page.evaluate(() => window.__hasFountain && window.__hasFountain()));

  // ---- sprint FOV kick: drive forward+sprint via fixed-timestep, FOV should widen from base
  // (~75) toward ~83, then ease back to base when the sprint stops. Then shoot the kicked view.
  const fov = await page.evaluate(() => {
    window.__look(-122.7076, 45.4983, 100, 5);     // summit → Hood, on the ground
    window.__pauseSim = true;
    const base = window.__fov();
    window.__key('w', true); window.__key('shift', true);
    for (let i = 0; i < 150; i++) window.__step(1 / 60);   // accelerate to full sprint
    const sprint = window.__fov();
    window.__key('shift', false); window.__key('w', false);
    for (let i = 0; i < 150; i++) window.__step(1 / 60);   // coast to a stop
    const rest = window.__fov();
    // re-kick for the screenshot
    window.__key('w', true); window.__key('shift', true);
    for (let i = 0; i < 150; i++) window.__step(1 / 60);
    return { base: +base.toFixed(2), sprint: +sprint.toFixed(2), rest: +rest.toFixed(2), kicked: +window.__fov().toFixed(2) };
  });
  console.log('fov:', JSON.stringify(fov));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: OUT + 'fps-sprint.png' });
  console.log('shot fps-sprint.png');
  await page.evaluate(() => { window.__key('w', false); window.__key('shift', false); window.__pauseSim = false; });

  // ---- boundary feel: sprint straight at the park edge. Player must NOT cross BOUND (860);
  // edge→~1, fog.far thickens from 1850 toward ~700. Then shoot the vignette + "turn back" cue.
  const edge = await page.evaluate(() => {
    window.__look(-122.7076, 45.4983, 90, 0);          // face due east (+x, outward)
    window.__pauseSim = true;
    window.__player.x = 600; window.__player.z = 0;
    window.__player.vx = window.__player.vy = window.__player.vz = 0;
    window.__key('w', true); window.__key('shift', true);
    let maxR = 0;
    for (let i = 0; i < 1200; i++) { window.__step(1 / 60); maxR = Math.max(maxR, window.__edge().r); }
    const e = window.__edge();
    return { maxR: +maxR.toFixed(1), ...e };
  });
  console.log('edge:', JSON.stringify(edge));
  await new Promise(r => setTimeout(r, 500));            // let the render loop paint the vignette/cue
  await page.screenshot({ path: OUT + 'fps-edge.png' });
  console.log('shot fps-edge.png');
  await page.evaluate(() => {
    window.__key('w', false); window.__key('shift', false); window.__pauseSim = false;
    window.__look(-122.7076, 45.4983, 40, -6);
  });

  for (const [file, lng, lat, heading, pitch] of VIEWS) {
    await page.evaluate((lng, lat, heading, pitch) => window.__look(lng, lat, heading, pitch),
      lng, lat, heading, pitch);
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: OUT + file });
    console.log('shot', file);
  }

  // ---- mobile: phone viewport + touch. This puppeteer build can't emulate the
  // hover/pointer media features, so force the touch path via the test-only ?forcetouch
  // flag (the live gate is matchMedia('(hover:hover) and (pointer:fine)') — standard). ----
  await page.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await page.goto(PAGE + '?forcetouch=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__fpsReady === true, { timeout: 90000, polling: 500 });
  const touchMode = await page.evaluate(() => {
    document.getElementById('play').click();   // TOUCH path: enters game, reveals HUD, starts audio
    window.__look(-122.7076, 45.4983, 40, -6);
    if (window.__demoStick) window.__demoStick();
    return window.__touchMode;
  });
  await new Promise(r => setTimeout(r, 1400));
  await page.screenshot({ path: OUT + 'fps-mobile.png' });
  console.log('shot fps-mobile.png  touchMode=', touchMode);

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
