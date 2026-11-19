# I Love Boston mockups (Nov 19, 2026)

Mockups for a simpler, smarter page and a new dark mode, made after Jason said the current page felt
overwhelming. They're pictures to pick from, not the live page: the screenshots are in the demo under
Demo → Other looks → New mockups (direct link: `#/mockups`).

- `index.html` draws one 390×844 phone screen: `?s=a` simple map, `b` right now, `c` just ask, `p` place page;
  `&t=apple` (Apple Maps-style dark), `night` or `light`.
- `map.svg` (street level) and `map14.svg` (zoomed out) are downtown Boston drawn by `genmap.py` from
  OpenStreetMap data (OpenMapTiles vector tiles served by OpenFreeMap). Colors come from CSS variables,
  so one map works in every theme. Keep the "© OpenStreetMap" credit on any screen that shows it.

## Remake them
1. Tiles: get the current tiles URL from `https://tiles.openfreemap.org/planet` (TileJSON), then download
   zoom-14 tiles x 4956–4958, y 6059–6061 into `mvt/` as `x_y.pbf`. `pip install mapbox-vector-tile`.
2. Maps: `python3 genmap.py 1.0 map.svg 1.45 11` and `python3 genmap.py 0.5 map14.svg 1.0 9.5`
   (args: scale, output, road width, label size). Run it from the folder that has `mvt/`.
3. Screens: serve the repo root (`python3 -m http.server 8765`), then
   `node shot.js a:apple,b:apple,c:apple,p:apple,a:night,a:light 2 <outdir>`.
4. Sheets for chat: `comp.py` puts the screenshots side by side with captions.

Icons are adapted from Lucide (ISC license). Photos are the demo's Wikimedia Commons photos (see `#/credits`).
