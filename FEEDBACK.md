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

- 2026-06-12 (Joel) — There's a weird seam where the two ends of the background
  backdrop meet (the painted skyline/horizon ring doesn't wrap seamlessly —
  visible discontinuity where start meets end). Make the panorama tile/blend
  cleanly so there's no join.
- 2026-06-12 (Joel) — There should be a large water tower in between the compass
  and the radio tower. Look for reference photos online; it should also be
  visible on the map texture. Add it at its true position/bearing.

## Handled

- 2026-06-12 — "Compass is running the ground. Also some things are in the wrong
  location — look at the maps and satellite images." → re-centered the world on
  the true OSM summit (was ~60 m SE), moved the broadcast tower from a wrong SSE
  guess to the real 142 m comm tower's NW site, recolored the plaza deck to cool
  granite + shrank/desaturated the compass rose so it stops smearing across the
  ground. Plus folded in a richer painted backdrop (Hood couloirs, atmospheric
  haze, cirrus). Commits 45fdf5a + d670268. _(handled in-thread by Joel's agent,
  2026-06-12 — before this inbox existed.)_
