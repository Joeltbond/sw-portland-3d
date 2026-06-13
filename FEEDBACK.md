# Feedback inbox — SW Portland 3D (Council Crest FPS)

Joel drops feedback here (via his agent, from Slack); the `swpdx3d-improve` loop
drains it. This is the hand-off point so Joel's feedback and the autonomous loop
never edit the live files at the same time.

**Contract for the improver:** at the START of each iteration, address EVERY item
under `## Pending` FIRST — before picking anything off the NOTES.md backlog. They
override backlog priority. When you've handled an item, move it to `## Handled`
with a one-line note + date, and commit that change so the next run doesn't redo
it. Newest pending items matter most. If `## Pending` is empty, proceed with the
normal backlog.

## Pending

- 2026-06-12 — "The Douglas firs need to be much bigger." The forest trees read
  too small/shrub-like; scale up the conifers (and the mixed canopy generally) so
  mature firs tower the way real Council Crest old-growth does. Bump trunk height
  + crown size meaningfully, not a token nudge.

## Handled

- 2026-06-12 — "Weird seam where the two ends of the background backdrop meet." →
  the painted panorama's ridgelines + glow already tiled (integer-harmonic sine
  profiles, full-width gradients), but the wispy cirrus CLOUD bands were placed
  with a single un-wrapped x and a 28 px blur halo, so a cloud straddling the
  canvas wrap got hard-cut at the south seam (the visible join). Fix: draw each
  cloud three times (−W / 0 / +W) so it — and its blur — appears on both ends.
  Panorama now tiles cleanly. (#22)
- 2026-06-12 — "Large water tower between the compass and the radio tower; it's
  on the map texture — add it at its true position/bearing." → added the real
  Council Crest water tank from OSM (way 32356677, man_made=storage_tank, ~11 m
  cylinder at 45.49896,-122.70824 ≈ 12 m W / 28 m N of the summit, bearing 338°
  NNW, ~31 m out — exactly between the plaza and the NW radio tower, sitting on
  its own satellite footprint). Modeled as a welded-steel reservoir: drum +
  plate-seam belts + low conical roof + eave railing + side ladder. (#22)

- 2026-06-12 — "Compass is running the ground. Also some things are in the wrong
  location — look at the maps and satellite images." → re-centered the world on
  the true OSM summit (was ~60 m SE), moved the broadcast tower from a wrong SSE
  guess to the real 142 m comm tower's NW site, recolored the plaza deck to cool
  granite + shrank/desaturated the compass rose so it stops smearing across the
  ground. Plus folded in a richer painted backdrop (Hood couloirs, atmospheric
  haze, cirrus). Commits 45fdf5a + d670268. _(handled in-thread by Joel's agent,
  2026-06-12 — before this inbox existed.)_
