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

## Engine note (2026-06-12 ~17:15) — ENGINE PIVOT to three.js (authorized)
MapLibre capped out: it drives the camera with `jumpTo` per frame and at the grazing
eye-level FP angle the satellite drape smears into vertical streaks (a broken "wall"
in the foreground — see the old `fp-fly-council.png`). Joel kept reading it as
"google-map-y." Per the ENGINE CALL we built the level natively in three.js as
**`fps.html`** (linked from index.html; promote to index once it clearly wins). Both
pages stay live for now. New work happens in fps.html unless it's a MapLibre-only fix.

three.js verify harness: `node test/shoot-fps.js` (waits `window.__fpsReady`, calls
`window.__look(lng,lat,heading,pitch)`, screenshots). Physics is rAF-throttled under
headless (dt capped at 0.05 → slow-motion), so verify movement via the fixed-timestep
hooks instead: `window.__pauseSim=true; window.__step(1/60)` in a loop, read
`window.__player` / `window.__groundY()`. Self-contained: three@0.160 via importmap CDN.

**PROMOTED in #16:** the three.js level is now `index.html` (the canonical live URL).
The old MapLibre build is retired to `maplibre-legacy.html` (its shoot-fp.js / shoot.js
harnesses now point there). shoot-fps.js loads `index.html`. New game work happens in
`index.html`; `maplibre-legacy.html` is dead and only kept for its NOTES learnings.

## Joel's new asks (2026-06-12 17:20) — both first-class until done
- **SOUND** — "Add sounds. Bugs, footsteps." → **LANDED in #7** (footsteps tied to
  stride cadence + insect/bird/wind ambient bed, all procedural Web Audio). Needs Joel's
  ears to confirm the mix; headless only proves the graph wires up.
- **REFERENCE PHOTOS** — "looking up pictures of council crest might help." Study real
  photos BEFORE the next visual pass: open grassy summit, circular brick/stone plaza +
  water fountain, radio/TV towers just off-summit, Douglas-fir ring, paved loop path,
  benches, Mt Hood / St Helens sightlines. Make the level the real place, not a generic
  hill. NOT YET DONE — do this before trees/landmarks; record refs used here.

## Iteration log
- **#17 (19:17–19:28)** SUMMIT-LAWN GRASS — the deepest remaining "real place" win (backlog #9):
  Council Crest's signature is its OPEN GRASSY crown (the forest #10 deliberately leaves r<75
  clear), but at eye level that clearing read as flat satellite green + #12 grain — the most-seen
  area (you SPAWN here) had no life. Now **5055 instanced grass tufts** carpet the open lawn.
  Each tuft = **3 crossed alpha-cut billboards** (`PlaneGeometry(0.52,0.46)` translated so the base
  sits at y=0, merged at 0/60/120°) textured from a 64² canvas of ~7 tapered HSL-green blades
  (`alphaTest 0.42`, DoubleSide). **Wind sway is in the vertex shader, zero per-frame CPU:**
  `onBeforeCompile` injects a `uTime` uniform and displaces `transformed.x/z` by
  `sin/cos(uTime·1.7 + phase)·position.y·{0.16,0.09}` — weighted by **local blade height** (base
  planted, tips roll) and **phased per-instance** via `instanceMatrix[3].xyz` (each tuft's world
  pos) so the whole field rolls as one breeze; the render loop ticks `grassWind.value =
  clock.elapsedTime`. Planted with a deterministic PRNG on a jittered 1.5 m grid over the crown,
  **r ∈ [PLAZA_R+1.2, 77]** (off the compass deck, on the open lawn), skipping the fountain
  footprint (<2.4 m); per-tuft scale 0.8–1.55, random yaw, ground-clamped via `groundAt`, and a
  per-instance HSL tint (summery green, lightness ~0.56) so it isn't one flat shade. Verified
  headless: `grass:5055`, no page/console errors, everything else intact (trees 11767,
  summit/fountain true, FOV kick base75→77.7, edge maxR 754.6). `fps-lawn.png` + `fps-summit-ne.png`
  show the crown now reads as a mottled green grassy carpet in the foreground vs the old flat wash;
  Hood hero / plaza / fountain / tower all unchanged. Gotcha 1: brighten BOTH the blade-texture
  lightness AND the per-instance tint — texture-color × instanceColor double-darkens, the first
  pass (tint L=0.42, texture L=28–46%) came out as dark shadow-patches, not summer lawn. Gotcha 2:
  CanvasTexture default `flipY` maps canvas-top→quad-top, so draw blade TIPS at canvas y≈0.
  Test hook `__grassCount`; shoot-fps.js shoots `fps-lawn.png` (spawn, low over the crown). **Sway
  motion is FELT live — a still frame can't show the breeze; Joel's eyes confirm the movement.**
  Possible polish: a ground normal map under it; thin/lengthen near the rim; seasonal tan dry-grass.
- **#16 (19:05–19:14)** PROMOTE TO index.html — the gated milestone (backlog #7). Every
  precondition was met: forest (#10), summit landmarks + fountain (#11/#13), illustrated
  backdrop (#9), near-ground detail (#12), boundary feel (#15), sound (#7), mobile (#8),
  sprint FOV (#14) — fps.html clearly beat the MapLibre page. The problem this fixes: the
  CANONICAL live URL (joel.computer/sw-portland-3d/) still served the MapLibre map, so Joel's
  phone review landed on the very "google-map-y" page he keeps rejecting and had to tap
  through to fps.html. Now `git mv index.html maplibre-legacy.html` + `git mv fps.html
  index.html` → the three.js Council Crest level IS the default experience; the map is
  retired (kept only as `maplibre-legacy.html` for its learnings). Updated the three harnesses
  to match: shoot-fps.js → `index.html`; shoot-fp.js + shoot.js (MapLibre-only) →
  `maplibre-legacy.html`. README rewritten from "interactive 3D map" to the walking-sim. No
  code changes to the level itself — pure promotion. Verified headless (shoot-fps.js against
  the moved index.html, exit 0): audio running @48k, 11767 trees, summit/fountain true, FOV
  kick + edge falloff intact, all 11 views render; `fps-hood.png` (Hood hero over the plaza
  terrace) and `fps-plaza.png` (compass-rose deck) confirm nothing regressed in the move.
  Gotcha: fps.html had NO back-link to index (the only index→fps link lived in the MapLibre
  page being replaced), so the swap is clean; the test PAGE paths were the only references
  that needed fixing. **New work from here lands in `index.html`, not fps.html.**
- **#15 (19:18–19:32)** BOUNDARY FEEL — the last untouched game-feel item (backlog #4). The
  level edge was a SILENT hard radial clamp at `BOUND 860` (snap-back + 0.3× velocity) — an
  invisible wall, the classic immersion tell. Now the park edge reads intentional across a 160 m
  margin (`EDGE_START 700`→`BOUND 860`): **(1) input-speed falloff** — `edge` (0→1 across the
  margin) is computed at the TOP of `step()` from the pre-move radius and your walk speed is
  scaled `*(1 - 0.9·edge)`, so your legs give out as you wade toward the rim — a decisive but soft
  stop (sprinting straight out you stall ~r=755, never reaching BOUND). **(2) gentle inward
  drift** — `EDGE_PUSH 7 · edge · dt` along the inward radial, easing you back around. **(3) mist
  closes in** — `scene.fog.near/far` pull from base (350/1850) toward ~150/670 as you near the
  edge. **(4) vignette + cue** — a full-screen `#vignette` (radial gradient, `mix-blend-mode:
  multiply`, opacity = depth) darkens the screen corners and a `#edgeCue` "↩ edge of the park —
  turn back" chip fades up. **Key trick — visual intensity is DECOUPLED from the physics stop:**
  because the speed falloff + push stall you around raw edge≈0.35, the fog/vignette/cue are driven
  off a remapped `edgeView = min(1, edge/0.38)` so they saturate to ~full (vignette ~0.9, fog.far
  ~790) right at the practical stop — the world reads as fully "closing in" without ever needing
  you near BOUND. The DOM overlays are written in the RENDER loop (not `step()`) so the test's
  tight fixed-timestep loops don't thrash the DOM. The radial clamp at BOUND stays as a backstop,
  now rarely hit. Verified headless: sprinting east from r=600 for 1200 steps, **maxR=754.6 (never
  crosses BOUND 860)**, edgeView 0.90, fog.far 792; `fps-edge.png` shows the vignette + turn-back
  cue + mist; `fps-hood.png` and all other views are unchanged (edge=0 fully resets fog/vignette).
  No page/console errors; trees 11767, summit/fountain true. Gotcha: compute `edge` from the
  pre-move position at the top of `step()` so the speed falloff applies the SAME frame (using the
  post-move radius lagged a frame and let momentum punch through); and keep fog driven by the
  remapped `edgeView`, not raw `edge`, or the mist barely moves before you've already stopped.
  Test hook `__edge()` → `{edge, r, fogFar}`; harness drives a sprint into the rim, shoots
  `fps-edge.png`. **The drift/turn-around feel is FELT while moving — Joel's hands confirm it.**
- **#14 (18:34–18:42)** SPRINT FOV KICK — the last movement-feel item from Joel's "FPS without
  shooting" bar ("sprint (maybe a subtle FOV kick)"). Camera FOV now widens from `BASE_FOV` 75°
  toward 83° (`FOV_KICK 8`) and eases back, **driven by ACTUAL ground speed, not the Shift key**:
  `over = max(0, hsp−WALK)/(WALK·SPRINT−WALK)`, `targetFov = BASE_FOV + FOV_KICK·min(1,over)`,
  then an exponential lerp `camera.fov += (target−fov)·min(1,FOV_LERP·dt)` (`FOV_LERP 5`) with
  `updateProjectionMatrix()` only when it actually moves (>1e-3). Because it rides real velocity,
  the kick ramps IN with momentum as you accelerate past walking pace and ramps OUT as you slow —
  no instant snap. It's gated on `player.onGround` so a sprint-jump doesn't punch the FOV out
  mid-air (silent airborne, like the footsteps). Verified headless via the fixed-timestep hook
  (new `window.__fov()`): from a standing summit start, base **75.00** → after 150 sprint-steps
  **kicks up** → after 150 coast-steps back to **75.01** (clean recovery). NOTE the harness drives
  a downhill heading (100°, off the summit), so the player keeps going briefly airborne and the
  measured kick only reached ~77.7° — that's the on-ground gate working, not a bug; on the flat
  summit lawn it reaches the full +8°. No page/console errors; trees 11767, summit/fountain true.
  **The kick is subtle by design — it's FELT while moving, not visible in a still frame; Joel's
  hands confirm the feel.** Gotcha: read FOV off `camera.fov` + always `updateProjectionMatrix()`
  after changing it, and gate on `onGround` or downhill/jumping sprints flicker the FOV. Test hook
  `__fov()`; harness drives a sprint via `__key/__step` and shoots `fps-sprint.png`.
- **#13 (19:02–19:14)** "JOY" FOUNTAIN — Council Crest's bronze centerpiece, now a real
  landmark at the spawn plaza (backlog #3 polish). **Refs used:** WebSearch → portland.gov +
  the59club blog + Wikipedia "Pioneer Woman (Littman)" + portlandbridges photos — confirmed
  Frederic Littman's 1956 welded-bronze drinking fountain: a standing woman, hair swept back,
  **lifting a child in her outstretched raised arms**, ~10 ft (3 m) on a **triangular granite
  base**. Built `buildFountain()`: a triangular granite pedestal (`CylinderGeometry(...,3)` =
  3-sided prism), a shallow basin bowl + a translucent water disc, a center plinth, and the
  bronze figure as ONE merged mesh — legs/arms/neck via the existing `strut(a,b,r)` helper,
  hips/head/child/hair as scaled spheres, a tapered-cylinder torso — `mergeGeometries` →
  `MeshLambertMaterial #6f5836` (warm bronze). Placed just off the plaza rim at bearing 38°
  (NE), 16 m out, so it's framed in the default spawn view; `group.rotation.y =
  atan2(-fx,-fz)` turns the figure's front (built facing +z) back toward the viewing deck.
  Verified headless (fps-fountain + a closer custom shot): the woman-lifting-child silhouette
  reads clearly against the Cascade haze, base/bowl legible, `__hasFountain` true, 11767 trees,
  summit true, no page/console errors. Gotcha: the figure is built facing +z, so the only
  orientation knob is `rotation.y`; everything else is local-space offsets in metres with feet
  at the group's `figure.position.y` (1.62, top of the plinth). Test hook `__hasFountain`;
  harness shoots `fps-fountain.png` (spawn → NE, pitch 7). Possible polish: actual jetting
  water particles, a darker patina with green oxidation streaks, finer figure modeling.
- **#12 (18:48–18:58)** NEAR-GROUND DETAIL — the flat-green eye-level tell (backlog #2;
  Joel's "flat green" note). The z17 satellite drape minifies to a smooth dark-green wash
  underfoot; now a **procedural luminance grain** modulates it, strong underfoot and faded
  out by ~180 m so the far hill keeps its true satellite look. `makeGroundDetail()` paints a
  **seamless tileable** 256² grayscale noise — periodic sine octaves (cycles/tile are
  integers so they wrap exactly across the edge → no seam) + faint vertical blade streaks.
  Injected into the terrain `MeshLambertMaterial` via `onBeforeCompile`: a `vWP` world-pos
  varying (from `modelMatrix*position` after `#include <begin_vertex>`) drives two
  world-space samples — fine (~1.8 m tile) blended with coarse (~9 m patchiness) — centered
  to ±0.5 and applied as `diffuseColor.rgb *= 1.0 + n*0.85*k` after `<map_fragment>`, where
  `k = 1 - smoothstep(12,180, dist(uCam,vWP))`. **Hue-neutral** (multiply by luminance only)
  so roads/the plaza deck aren't tinted; world-space UV so it doesn't swim with the camera.
  `uCam` uniform = `camera.position` (live Vector3 ref, auto-updates per frame, no rAF poke).
  Verified headless (fps-slope: the foreground lawn now reads as mottled grass/dirt vs the
  old flat wash; far trees/ground unchanged; Hood hero clean), 11767 trees, summit true, no
  page/console errors. Gotcha: keep the noise periodic (integer cycles/tile) or the
  RepeatWrapping tile shows a hard seam; only the terrain mesh gets the shader (plaza deck is
  a separate mesh, stays clean). Next foreground polish: a normal map / wind-stirred grass.
- **#11 (18:22–18:40)** SUMMIT LANDMARKS — the real Council Crest summit, the spawn anchor
  (backlog #3). **Refs used:** Portland.gov + placespages blog + oregonhikers + Wikipedia +
  RadioDiscussions/Yelp(Stonehenge Tower) — confirmed the circular paved viewing plaza with
  a big **compass rose** at the city's high point (1073 ft), a low seat wall, peak-ID plaques
  (Hood/Adams/St Helens/Rainier), the Littmann bronze fountain statue, and the broadcast
  towers on the next rise S (the big Healy Heights/Stonehenge lattice tower at 4700 SW Council
  Crest Dr + a modest city radio tower in the park itself). Built: (1) a **compass-rose plaza**
  you spawn on — a `CircleGeometry` deck textured from a 1024² canvas (paver rings + radial
  joints + a 16-point brass star on a bronze medallion + N/E/S/W + "COUNCIL CREST / ELEV
  1073 FT"), its **rays pointing to the actual Cascades at their TRUE bearings** (`bearingTo`),
  so the deck lines up with the painted peaks on the #9 backdrop ring; a low cylinder terrace
  body skirts the terrain falling away beneath, and a `groundAt` override makes the deck the
  walkable surface inside the rim (a real flat terrace, not a floating plane) + a seat-wall
  ring. (2) A **broadcast lattice tower** ~120 m SSE: `makeTowerGeo` merges a square tapered
  4-leg lattice (legs + belts + X-bracing per segment) via a `strut(a,b,r)` cylinder helper,
  topped with an antenna spire + a fog-exempt red beacon + two microwave drums; a tree-free
  pad clears its base. **Orientation is DERIVED + verified two ways:** CircleGeometry after
  `rotateX(-π/2)` maps local +x→east, +y→north, and with the default `flipY` that puts canvas
  N at the top → looking heading 172 (S) the **S** letter faces the camera ✓, looking heading
  100 (E) Mt Hood centers ✓. Verified headless (fps-plaza: the rose deck; fps-tower: the
  lattice tower + beacon over the treeline with Hood ESE on the horizon; Hood hero unchanged),
  `__hasSummit` true, 11767 trees, no page/console errors. Gotcha: stand the player ON the
  deck by maxing `groundAt` with `PLAZA_TOP` inside the rim, else you walk through it as the
  terrain falls. Test hook `__hasSummit`; harness shoots fps-plaza.png + fps-tower.png.
- **#10 (18:05–18:18)** FOREST — the biggest "real place" win (backlog #1). Council Crest
  is an open grassy summit lawn ringed by Douglas-fir + western red cedar (refs: Portland.gov
  + oregonhikers + audiala — confirmed the ringed-clearing form, 1073 ft); the satellite drape
  showed canopy from above but eye level read as flat green. Now ~11.8k instanced conifers
  give the hill real depth. **Where to plant is read from the imagery itself:** sample the
  stitched Esri canvas (`SAT.ctx.getImageData`) per candidate and keep green-dominant, mid-dark
  pixels (`g>r*1.04 && g>=b-4 && 42<bright<150`) — that masks trees onto the actual canopy and
  off the lawn/roads/roofs. Jittered 9 m grid, thinned ~40%, **summit clearing kept open
  (r<75 m)** so the level matches the real grassy crown, capped to the boundary (r<BOUND−8).
  **Each fir = 3 stacked cones** (narrow Douglas silhouette) via `mergeGeometries` + a short
  trunk cylinder, two **InstancedMesh**es (foliage + trunks) sharing one per-instance matrix;
  per-tree HSL tint jitter so the canopy isn't one flat green; deterministic PRNG → identical
  every load. Fog (350–1850 m) fades distant trees for free. Verified headless (slope shot:
  firs with real silhouettes/trunks looking back up the wooded hill; summit-down: the conifer
  ring around the open clearing; Hood hero still frames clean), 11768 trees, no page/console
  errors. Gotcha: InstancedMesh needs `instanceColor.needsUpdate` after `setColorAt`.
  Test hook `__treeCount`; harness prints the count.
- **#9 (17:46–17:56)** RICHER BACKGROUND — illustrated distant backdrop (Joel 17:28: "make
  the background richer… we'll need an illustration"). Painted a 360° panorama onto a canvas
  and wrapped it on a **BackSide cylinder** (R=3500, h=3000, fog-exempt) sitting beyond the
  terrain mesh but inside the sky dome. **Bearing alignment is DERIVED, not guessed:**
  three.js CylinderGeometry puts the u=0 column at world +z and wraps u→θ CCW, so the column
  seen looking toward compass bearing B is `u=(180−B)/360` → paint content for B at
  `x=((180−B)/360)·W`, no mesh rotation, no mirror (BackSide keeps the same UVs). Verified:
  looking heading 100 centers **Mt Hood** (the hero — tallest, asymmetric, deepest snow, a
  shaded right flank for form); heading 27 shows **St Helens** as a flat truncated dome.
  Peaks use REAL summit coords (`bearingTo(lat,lng)` from the summit) at h≈2.5× the real ~2°
  angle so the Cascades read. Also: faint downtown-tower cluster NE in the valley, and 4
  **layered ridgelines** (far blue-grey → near forested) with integer-harmonic sine profiles
  (seamless across the due-south wrap) whose bases fade to the warm horizon haze (#d8ccb7) so
  the illustration melts into the fogged terrain edge — mesh + backdrop read as one world.
  Vertical: canvas horizon row (v=0.55) lands at world y≈330 (eye level) via mesh.position.y=480.
  Default spawn view now shows St Helens+Adams on the horizon where before it was empty haze.
  Verified headless (fps-hood/fps-helens/fps-summit-ne), no page/console errors. Test now
  shoots `fps-hood.png` + `fps-helens.png`. **Snow/peak feel is Joel's call on the live page.**
- **#8 (17:34–17:42)** MOBILE CONTROLS — Joel reviews from his phone, so until touch
  works he can't playtest; top-of-stack. **Capability gate:** `CAN_LOCK =
  matchMedia('(hover: hover) and (pointer: fine)')`; `TOUCH = !CAN_LOCK` (no UA sniffing).
  Pointer-lock path runs only on fine-pointer devices; coarse-pointer devices get the touch
  HUD and a tap-to-enter that skips lock entirely. **Left-thumb analog stick:** dynamic
  origin — first touch in the left 45% drops the base under the thumb; knob offset → analog
  `(mx,my)`, magnitude scales walk speed (`speed = WALK * sprint * analog`), and pushing the
  knob past 1.32×radius flips sprint (shows a "▲ sprint" pip). **Look:** any touch on the
  right side becomes the look pointer; drag deltas drive a hand-rolled YXZ-euler rotate that
  mirrors PointerLockControls' maths (clamped pitch) — no lock needed. **Jump button** sets
  `wantJump`. First touch also calls `initAudio()` (the gesture that unblocks Web Audio).
  Multi-touch tracked by `identifier` so move + look + jump work simultaneously. Desktop is
  untouched: `touch.move` stays false → the keys path and `analog=1` are byte-identical to #7.
  Verified headless: desktop shots show NO HUD; a 390×844 touch shot (forced via test-only
  `?forcetouch=1`, since this puppeteer can't emulate hover/pointer media features) shows the
  stick + JUMP rendering correctly, `__touchMode===true`, no console/page errors. **Real-finger
  feel needs Joel's thumbs to confirm** (drag sensitivity 0.0042, sprint threshold). Test hooks:
  `__touchMode`, `__demoStick`; shoot-fps.js now also shoots `fps-mobile.png`.
- **#7 (17:20–17:34)** SOUND — procedural Web Audio, no asset files (page stays
  self-contained). **AudioContext** is built on the click-to-enter (the gesture that
  unblocks audio); ducks to 0.18 on Esc-unlock, restores on re-lock. **Footsteps:** a
  footfall on each half-cycle of the existing head-bob phase (`floor(bob/π)` crossings) —
  so cadence rides real speed (faster sprinting), it's silent airborne (bob only advances
  when grounded+moving), and a `stepBeat` resync prevents a double-step on resume. Each
  step = a short noise crunch (bandpass→lowpass, 6 ms attack / 170 ms decay); sprint shifts
  it brighter + 1.28× playbackRate. **Ambient bed:** one shared 2 s seeded-noise buffer
  feeds (a) an insect layer — 4.9 kHz bandpass Q7 with a 7.3 Hz tremolo (cricket/cicada
  chorus) and (b) a low wind bed — 430 Hz lowpass with a 0.06 Hz swell so the loop never
  reads as seamed. Plus **birdsong:** a few swept sine blips scheduled off `ctx.currentTime`
  every 2.5–9.5 s (30% skipped). Verified headless: graph builds `state:running` @48 kHz,
  no page/console errors, `__footstep`/`__chirp` fire clean, and a 3 s simulated walk via
  the fixed-timestep hook produced 8 footfalls (~2.7/s, natural). **Can't hear it headless
  — Joel's ears confirm the mix.** Test hooks added: `__initAudio/__audioState/__footstep/
  __chirp`; shoot-fps.js now reports the audio state line.
- **#6 (17:05–17:18)** ENGINE PIVOT — built `fps.html`, a native three.js Council
  Crest level (slice 1: terrain mesh + satellite drape + real FPS physics). **Terrain:**
  stitch the same AWS terrarium DEM tiles (z14) onto a canvas, bilinear-decode elevation
  (`r*256+g+b/256-32768`) and displace a 320×320 `PlaneGeometry` over a 1.9 km box centered
  on the summit; per-vertex UV mapped to a stitched **Esri World Imagery z17** canvas texture
  (`flipY=false` since canvas px are top-left origin; `anisotropy=maxAnisotropy` — this is
  what kills MapLibre's grazing-angle smear). **World:** gradient sky dome (ShaderMaterial,
  blue zenith→warm horizon) + linear fog to the same horizon haze; ambient+hemisphere fill
  bright (satellite already has baked sun/shadow — heavy directional crushed slopes to black,
  so directional is only 0.55 for form). **Physics:** PointerLockControls look; WASD with
  momentum (exp-approach accel, less in air); gravity 20 + jump 6.6 (~1m arc) + ground-clamp
  by sampling the in-memory DEM (`groundAt`); Shift sprint 1.85×; subtle head bob; soft
  radial boundary clamp. Verified (fixed-timestep): spawn eye exactly ground+1.7, walk
  4.3 m/s / sprint 8.2 m/s, jump peaks 1.03 m and lands onGround. Gotchas: (a) AWS DEM + Esri
  imagery BOTH send CORS `*`, so `crossOrigin='anonymous'` canvas readback works from
  `file://`; (b) headless never locks the pointer → the test must hide `#play` to reveal the
  world; (c) z17 over the box ≈ 70 imagery tiles — fine (~17 s build under swiftshader), don't
  push zoom much higher. Reads as a real continuous forested hill now, not a streaked map.
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

## Next ideas (three.js `index.html` is now the main track — priority order)
*Movement-feel checklist from Joel's "FPS without shooting" bar is now COMPLETE: accel/momentum
(#6), gravity+jump (#6), sprint (#6), sprint FOV kick (#14), head bob (#6), pointer-lock look (#6).
Remaining work is world richness + the boundary/pause polish below.*
0. **Reference-photo pass (DO FIRST, before any visual work)** — study real Council
   Crest photos (WebSearch/WebFetch), then make the summit match: grassy clearing, the
   circular brick plaza + fountain, the radio/TV towers, the Douglas-fir ring, paved loop
   path, benches, Mt Hood/St Helens sightlines. Record which refs were used so later
   iterations don't re-research. Trees (#1) and landmarks (#3) both depend on this.
   *Refs used so far (#9, sightlines):* Portland.gov Council Crest page + oregonhikers
   field guide + Wikipedia — confirmed the five-Cascade-peak view (Hood E, St Helens &
   Rainier NNE, Adams NE, Jefferson SE), the summit compass rose, downtown/Tualatin valley.
   *(#10, forest):* Portland.gov + oregonhikers + audiala — confirmed the open grassy summit
   lawn RINGED by Douglas-fir + western red cedar, 1073 ft (drove the tree mask + clearing).
   *(#11, on-summit landmarks):* Portland.gov + placespages + Wikipedia + RadioDiscussions/Yelp
   — confirmed the circular compass-rose plaza, seat wall, peak-ID plaques, Littmann bronze
   fountain, and the Healy Heights/Stonehenge broadcast tower S + a city radio tower in-park.
   *(#13, the fountain):* WebSearch → portland.gov + the59club + Wikipedia "Pioneer Woman
   (Littman)" + portlandbridges — Littman's 1956 bronze: woman, hair swept back, lifting a
   child in raised arms, ~3 m on a triangular granite base. Still open: sharper plaza paver/
   inlay texture; jetting fountain water.
0b. ~~**Richer illustrated backdrop**~~ — DONE in #9 (painted panorama cylinder: real-bearing
   Cascade peaks + layered ridgelines, Hood is the hero). Possible polish: clouds/alpenglow,
   parallax, sharper peak rock/snow texture, time-of-day tint matching the sun.
1. ~~**Trees / forest**~~ — DONE in #10 (~11.8k instanced Douglas-firs, planted on the
   imagery's green mask, summit clearing kept open). Possible polish: vary species (add
   broadleaf/cedar shapes), wind sway, billboard-LOD the far trees, soften the hard cone
   shading (they read near-black on shadowed sides), and thin the canopy a touch if it feels
   too uniform on the live page.
2. ~~**Sharpen the near foreground**~~ — DONE in #12 (procedural luminance grain modulating
   the satellite drape, strong underfoot, faded by ~180 m, hue-neutral & world-space tiled).
   Possible polish: a matching ground normal map for relief; wind-stirred grass billboards on
   the summit lawn; tint the grain very slightly green/tan to push the grass vs dirt read.
3. ~~**Summit landmarks**~~ — DONE in #11 (compass-rose viewing plaza + broadcast lattice
   tower S) and #13 (the "Joy" bronze fountain — woman lifting a child — at the spawn plaza).
   Possible polish: jetting water on the fountain + a green-oxidation patina, sharper plaza
   paver/brass inlay texture, a low railing at the rim, the bigger Healy Heights tower cluster
   on the backdrop, clear a few trees behind the tower.
4. ~~**Boundary feel**~~ — DONE in #15 (input-speed falloff + inward drift + thickening fog +
   vignette + "turn back" cue across a 160 m margin; visual intensity decoupled from the soft
   stop). Possible polish: a faint directional arrow pointing back to the summit; tie the cue
   text to the actual nearest in-park landmark; a subtle low audio cue at the rim.
5. ~~**Touch controls for fps.html**~~ — DONE in #8 (analog stick + look drag + jump,
   capability-gated). Still open: a fullscreen button, and Joel-confirmed feel/sensitivity.
6. **Pause/help overlay on Esc** (beyond the click-to-enter), minimap-free — a real
   game-feel touch; Esc currently just ducks audio + releases the cursor.
7. ~~**Promote fps.html → index.html**~~ — DONE in #16 (three.js level is now the canonical
   URL; MapLibre retired to maplibre-legacy.html). Possible follow-up: delete maplibre-legacy
   .html + its harnesses entirely once Joel's sure he wants no map fallback at all.
8. **Perf**: the DEM/imagery refetch on every load; consider caching or a lower first-paint
   then upgrade. Build is ~17 s under swiftshader, faster on real bandwidth.
9. **Foliage / world polish** (the deepest remaining "real place" wins): vary tree species
   (broadleaf/cedar shapes), soft TREE wind sway, soften the near-black shaded cone sides;
   jetting fountain water + patina. ~~Wind-stirred grass on the summit lawn~~ DONE in #17
   (5055 instanced sway-shader tufts on the open crown). Grass polish: a ground normal map
   under it, longer/thinner blades at the rim, seasonal dry-grass tan.
