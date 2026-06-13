# Council Crest — a walking sim

A first-person walk around Council Crest, the high point of southwest Portland —
"an FPS without the shooting." One game level: the open grassy summit, its
compass-rose viewing plaza and bronze fountain, the Douglas-fir slopes, the
broadcast tower, and an illustrated Cascade skyline (Mt Hood is the hero) painted
to the real compass bearings.

Built natively in **three.js** (no map renderer): a heightmap terrain mesh decoded
from AWS terrarium DEM tiles, draped with Esri World Imagery satellite texture, with
fog, a gradient sky, ~12k instanced conifers, soft capsule physics, and procedural
Web Audio (footsteps + a summer-hillside insect/bird/wind bed). Single self-contained
`index.html`, no API keys.

**Live:** https://joel.computer/sw-portland-3d/

- **Desktop:** click to enter (pointer lock). WASD to move, mouse to look, Shift to
  sprint (subtle FOV kick), Space to jump, Esc to release the cursor.
- **Mobile:** tap to enter. Left-thumb stick to move (push past the edge to sprint),
  drag the right half to look, JUMP button. First touch also starts the audio.

The summit is the world — wander the wooded slopes and the park edge gently turns
you back. The legacy MapLibre map build is preserved as `maplibre-legacy.html`.
