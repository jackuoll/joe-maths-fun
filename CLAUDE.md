# Number Quest - project notes

## Composing the map / placing sprites on artwork (IMPORTANT)

When building scenes by placing sprite images on a background (e.g. the world
map in `src/components/MapScreen.jsx`), **never trust eyeballed coordinates.**
Always verify the actual composited result before considering it done:

1. **Single source of truth for layout.** Sprite positions live in
   `src/game/mapLayout.json` (percentage coords). The React map and the preview
   tool both read this file, so what you preview is what ships.
2. **Render and inspect.** Use `tools/compose-map.ps1` to composite the map into
   one PNG (it draws every sprite at the exact same math the CSS uses), then
   open it with the Read tool and actually look at it.
3. **Every sprite must make sense:**
   - No POI, building, tree or mountain sitting in water or off the landmass.
     Prefer a full-land background (`bg.png` = Background_Green) so the whole
     frame is placeable land; water must be an intentional lake/river sprite.
   - No awkward overlaps/clashes between neighbouring sprites. The compositor
     prints overlap warnings for POI footprints - resolve them.
   - Sizes are believable: castles are large landmarks, houses/towers smaller,
     mountains form ridges (several overlapping), forests are clusters.
4. **Iterate against the reference** until the quality genuinely matches the
   target art style - keep adjusting coords/sizes and re-rendering. Do not stop
   at "it builds" or "it roughly looks ok".
5. Headless screenshots of the running app miss framer-motion entrance
   animations (POIs start at opacity 0). The compositor avoids this; use it for
   layout truth and only screenshot for final sign-off.

Source art: `E:\Users\jackw\package-imports\Assets\FantasyMapCreator_2`.
Curated web copies live in `public/map/`.
