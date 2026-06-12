# Improvement-loop notes

Working notes for the every-10-min improvement loop (2026-06-12, ~14:10–16:10 PDT).
Each iteration: ONE substantive change, verify headless, push (push = deploy).

## How to verify
- Headless harness: `/tmp/map-shots/shoot-fp.js` (puppeteer-core + system Chrome,
  `--use-angle=swiftshader`). Loads local `file://` page, calls `__fpEnter(lng, lat,
  heading, look, mode)` test hook, checks `__fp.alt ≈ ground + 1.8`, screenshots.
- Orbit-view harness: `/tmp/map-shots/shoot.js` (same pattern, hash-positioned views).
- Node 22 required: `export PATH=~/.nvm/versions/node/v22.22.3/bin:$PATH`.
- Street-level tiles stream slowly under swiftshader; the 45s tile wait may time out —
  that's the test env, not the page.

## Direction (2026-06-12 14:43) — this is a GAME, not a map
Every iteration pushes toward "walking/flying around SW Portland in a game": boot
into first person, strip map chrome, game-feel movement (gravity/jump/momentum/head
bob/collision), atmosphere (fog/sun/sky/draw distance), game HUD (neighborhood-toast
on crossing into Hillsdale / Multnomah Village / Marquam Nature Park, compass, speed),
labels/POI fade at street level. The world should read as PLACE, not as map.

## Iteration log
- **#2 (15:26–15:35)** Boot straight into first person. Page now auto-enters FP on
  the Council Crest summit (Portland's high point) the moment the terrain DEM reports
  real elevation there (poll groundAt > 50 m, ~330 m summit); orbit/map is demoted to
  an Esc escape hatch. Stripped map chrome: removed NavigationControl (zoom/compass
  buttons) + ScaleControl; kept the default AttributionControl (OSM/terrain license).
  "Travel to" landmark links now fast-travel WITHIN first person (set fp.lng/lat/heading,
  recompute alt) instead of dumping you back to orbit. HUD reframed (Exit to map / Enter
  first person). Gotchas: (a) requestPointerLock THROWS without a user gesture — autoboot
  must wrap it in try/catch + swallow the promise rejection or fpEnter aborts mid-setup;
  (b) booting to street level means the harness's old `map.loaded()/areTilesLoaded()`
  initial-wait never settles under swiftshader — gate on `map.isStyleLoaded()` instead
  (per-view tile waits still apply). Verified: eye height holds (village alt 215.14 vs
  ground 213.34 = 1.8 exactly). Known noise: MapLibre spams `_mult`/icon-bucket symbol
  errors at the FP camera — harmless (geometry renders), will go away once labels fade
  at street level.
- **#1 (14:08–14:25)** First-person walk/fly mode. MapLibre upgraded 4.7.1 → 5.6.1
  (v4 hard-caps pitch at 85°; v5 allows >90 and has `calculateCameraOptionsFromTo`,
  `setCenterClampedToGround`, `setVerticalFieldOfView` — there is NO Mapbox-style
  free-camera API in MapLibre, don't try `getFreeCameraOptions`). Camera = eye pos +
  look-at point 300 m ahead. Walk clamps to `queryTerrainElevation + 1.8 m` (smoothed);
  fly is free (Space/C up/down, W climbs along look). WASD + pointer-lock mouse-look +
  Shift sprint + T walk/fly + Esc exit; touch: left half = move stick, right half = look.
  FOV 60° in FP, 36.87° (default) in orbit. Test hooks: `__fpEnter/__fpExit/__fp`.

## Next ideas (game-feel priority order)
1. **Neighborhood toast HUD** — detect when the player crosses into Hillsdale /
   Multnomah Village / Marquam Nature Park / Council Crest / OHSU etc. (point-in-polygon
   against a small hand-drawn bbox/centroid list, or OSM place labels) and pop a
   game-style "Entering Multnomah Village" toast. Cheapest big "this is a game" win.
2. **Game-feel movement** — gravity + jump (Space in walk), acceleration/momentum
   instead of instant velocity, subtle head bob while walking. Currently movement is
   instant-on/off and dead-flat — reads robotic.
3. **Labels fade at street level** — POI/road/place symbol text should fade out as the
   FP camera drops to eye level (opacity ramp on zoom/pitch) so the world reads as place,
   not map. Bonus: kills the `_mult` symbol-render spam.
4. **Atmosphere** — real sun position + sky gradient + distance fog tuned to SW Portland's
   forested hills; draw-distance haze so far ridges recede. Sky is currently a flat pale wash.
5. **Ground texture at eye level** — the liberty style is a featureless beige wash at
   street level (see barren village/fly shots). Drape Esri World Imagery raster under the
   buildings in FP, OR lean into a stylized game look (textured ground material, grid).
6. **Trees / forest** — SW Portland is forest-heavy (Marquam, Tryon Creek, Council Crest).
   OSM park/landcover polygons → extruded canopy blobs or billboarded trees.
7. **Compass + speed readout HUD** — heading ribbon at top, speed number in fly mode.
8. **FP collision with buildings** — queryRenderedFeatures ahead before moving so you
   can't walk through walls (physicality = game-feel).
9. Mobile: visible joystick widget, fullscreen button, deviceorientation look.
