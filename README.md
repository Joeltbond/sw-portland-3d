# SW Portland — 3D

An interactive 3D map of southwest Portland: real terrain (AWS/Mapzen elevation
tiles), OpenStreetMap vector tiles via OpenFreeMap, and 3D building extrusions,
rendered with MapLibre GL. Single self-contained `index.html`, no API keys.

**Live:** https://joeltbond.github.io/sw-portland-3d/

Drag to pan, right-drag (or two-finger drag) to tilt/rotate, scroll to zoom.
First person: hit **Walk around here** (or `F`) — WASD + mouse-look, `T` toggles
walk/fly (walk hugs the terrain, fly is free), Shift sprints, Esc exits. On touch,
left half of the screen is a move stick, right half looks.
Camera state lives in the URL hash, so any view is shareable.
