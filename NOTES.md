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

## Iteration log
- **#1 (14:08–14:25)** First-person walk/fly mode. MapLibre upgraded 4.7.1 → 5.6.1
  (v4 hard-caps pitch at 85°; v5 allows >90 and has `calculateCameraOptionsFromTo`,
  `setCenterClampedToGround`, `setVerticalFieldOfView` — there is NO Mapbox-style
  free-camera API in MapLibre, don't try `getFreeCameraOptions`). Camera = eye pos +
  look-at point 300 m ahead. Walk clamps to `queryTerrainElevation + 1.8 m` (smoothed);
  fly is free (Space/C up/down, W climbs along look). WASD + pointer-lock mouse-look +
  Shift sprint + T walk/fly + Esc exit; touch: left half = move stick, right half = look.
  FOV 60° in FP, 36.87° (default) in orbit. Test hooks: `__fpEnter/__fpExit/__fp`.

## Next ideas (priority order)
1. **Satellite ground texture** — at street level the liberty style is a featureless
   beige wash (see fp-walk-village shot). Drape Esri World Imagery raster
   (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
   free, attribution required) under the 3D buildings, maybe as a toggle or auto-on in FP.
   Biggest realism win available.
2. **Hillshade layer** from the same terrain DEM — ground relief shading in orbit view.
3. **Trees** — SW Portland is forest-heavy (Marquam Nature Park, Tryon Creek, Council
   Crest). OSM `landcover`/`park` polygons → darker green + maybe extruded canopy blobs.
4. Building realism: color variety keyed to height/area, slight roof color shift.
5. FP collision with buildings (queryRenderedFeatures ahead before moving).
6. Mobile polish: visible joystick widget, fullscreen button, maybe deviceorientation look.
7. Fog/sky tuning per time of day.
8. Perf: skip `jumpTo` on frames with no input.
