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

## Direction (2026-06-12 15:47) — ONE GAME LEVEL: Council Crest. Not a map.
Supersedes all earlier direction. Joel: "I don't want a map. I want it to feel like
a game. Scope it to just Council Crest. Move away from the map paradigm completely."

- **THE WORLD IS COUNCIL CREST.** One level: the summit park + its wooded slopes
  (center ~ -122.7076, 45.4983, ~1–1.5 km radius). Spawn on the summit. Keep the
  player in-world with a soft, game-feeling boundary (thickening fog / gentle push-
  back / "turn back" cue). Depth over breadth — every iteration makes THIS hill feel
  more like a real place: terrain fidelity, forest, light, movement.
- **KILL THE MAP PARADIGM.** No orbit/map mode, no Esc-to-map hatch (Esc = pause/help),
  no fly-to-neighborhood links, no map labels/POI/road text anywhere (symbol layers
  hidden outright — also kills the `_mult` spam). Keep only the attribution line. HUD
  is game-HUD only; zone chip can become on-hill spots (Summit, radio towers, Marquam
  trailhead) rather than citywide neighborhoods.
- **Satellite imagery:** Esri World Imagery draped on the hill — landed in #5; reads
  far more like a real place than the cartographic ground. Keep it.

## Iteration log
- **#5 (16:57–17:02)** De-map the ground — the two biggest anti-map moves, landed
  together. (1) **Satellite drape:** Esri World Imagery raster (keyless,
  `server.arcgisonline.com/.../World_Imagery/MapServer/tile/{z}/{y}/{x}` — note Esri
  is `{z}/{y}/{x}`, NOT `{z}/{x}/{y}`) added as a raster source/layer inserted ABOVE
  all the cartographic fills/lines but BELOW the 3D buildings, so it covers the flat
  beige map ground + bright road casings while buildings still extrude on top. Draped
  over the existing terrain automatically. (2) **Hid every symbol layer** (loop the
  style layers, `setLayoutProperty(id,'visibility','none')` for `type==='symbol'`):
  kills all road/POI/place label text + icons AND silences the MapLibre `_mult`
  icon-bucket spam (test now exits 0 clean). Result in the renders: real green
  forested slopes, textured cityscape + river, ridges dissolving into haze — a decisive
  break from the google-map-y beige wash. Layer order: `addLayer(satellite, firstSymbol)`
  then `addLayer(buildings, firstSymbol)` → buildings land just above satellite (each
  insert goes immediately below firstSymbol, pushing the prior one down). Gotcha: at the
  grazing eye-level FP angle the near-foreground texture stretches/smears; partly the
  known swiftshader slow-tile-stream (near high-zoom tiles arrive after the shot) — should
  sharpen on the live URL with real bandwidth. Verified: eye heights exact (ohsu
  329.55/327.75, village 216.89/213.34 = +1.8), no page errors.
- **#4 (15:43–15:52)** Atmosphere + lighting — the biggest "map→game" jump in the
  renders. Retuned `setSky` from a flat pale wash to a real dome: rich blue zenith
  (`sky-color #2f6cb3`) falling through `sky-horizon-blend 0.75` to a warm golden
  haze band (`horizon-color #e6d2ac`), then `horizon-fog-blend`/`fog-color #ddd0bb`/
  `fog-ground-blend 0.2` so distant ridges dissolve into warm haze while the
  foreground stays clear. Added `setLight({anchor:'map', position:[1.5,235,50],
  color:#ffe9c6, intensity:0.6})` — a low warm SW sun fixed to the WORLD (not the
  viewport), so building faces now shade by their real orientation: lit gold fronts,
  shadowed sides → the boxes finally have form. Gotchas: MapLibre v5 sky is a gradient
  atmosphere with NO sun-disc API (don't look for `sky-atmosphere-sun`); the warm
  horizon + light is how you imply a sun. `anchor:'map'` is the key flip — default
  light is viewport-anchored so lit faces always chase the camera (reads flat/fake);
  map-anchored makes shading sun-like. Verified: council-fly + ohsu-walk both render
  the gradient + gold-lit buildings, eye heights unchanged, toast/chip intact.
- **#3 (15:36–15:43)** Neighborhood zone HUD — the "this is a game" win. Hand-placed
  11 SW Portland centroids (Council Crest, Marquam Hill/OHSU, Marquam Nature Park, Healy
  Heights, Hillside, Hillsdale, Bridlemile, Homestead, Burlingame, Multnomah Village,
  South Burlingame). `regionAt()` = nearest-centroid-wins with a ~2.2 km cutoff (falls
  back to "Southwest Portland"). Two HUD pieces: a persistent top-center **zone chip**
  ("◈ MULTNOMAH VILLAGE") and a big **arrival toast** ("Now entering Multnomah Village")
  that pops + fades over 3.6 s on every zone crossing. Wired into fpEnter (spawn announce),
  fast-travel clicks, and per-frame in fpFrame (pops when you walk across a border).
  Gotcha: the toast fades before the harness's post-tile screenshot, so added a
  `window.__forceZone()` hook + a `-toast.png` capture per view (re-pops the toast on the
  fully-rendered scene). Verified: village→"Multnomah Village", OHSU→"Marquam Hill" both
  render crisp; eye heights unchanged (village 215.14 / ground 213.34).
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

## Next ideas (Council Crest game level — priority order)
1. **Rip out the map paradigm wiring** — remove orbit/map mode + the Esc-to-map hatch
   (Esc → pause/help instead), delete the citywide "Travel to: …" neighborhood links
   from the HUD, and replace the citywide NEIGHBORHOODS centroids with ON-HILL spots
   (Summit, radio towers, Marquam trailhead) for the zone chip/toast. The HUD still
   shows SW-Portland-wide chrome — that contradicts the Council-Crest scope.
2. **Soft world boundary** — keep the player on the hill (~1–1.5 km from the summit):
   thickening fog + gentle push-back + a "turn back" cue as you near the edge. Makes it
   a level, not an open map.
3. **Trees / forest** — Council Crest + Marquam slopes are dense Douglas-fir. OSM
   park/landcover/`landuse=forest` polygons → instanced billboard trees or extruded
   canopy blobs. The satellite shows canopy from above; eye-level needs actual 3D trees
   to feel forested.
4. **Game-feel movement** — gravity + jump (Space in walk), acceleration/momentum
   instead of instant velocity, subtle head bob. Movement is currently instant-on/off
   and dead-flat — reads robotic.
5. **Tame the foreground satellite smear** — at eye level the near-ground texture
   stretches. Options: bump terrain tile detail, a subtle near-ground color/detail
   overlay, or a depth-of-field/vignette so the eye reads distance not blur.
6. **FP collision with buildings** — queryRenderedFeatures ahead before moving so you
   can't walk through walls (physicality = game-feel).
7. **Summit landmarks** — the actual Council Crest stone compass/overlook + the twin
   broadcast towers as recognizable geometry; a real "you are here" anchor.
8. Mobile: visible joystick widget, fullscreen button, deviceorientation look.
