# India State Atlas

An interactive map of India's 28 states and 8 union territories, made for UPSC preparation. It builds to a single self-contained HTML page.

## What's on the map

- **States and UTs**, coloured by Zonal Council, each with a fact card: capital, borders, coastline, Fifth/Sixth Schedule status, rivers, ranges, passes, UNESCO sites, tiger reserves and parks, Ramsar wetlands, crops, dances and tribes.
- **Layers** you can turn on and off:
  - capitals
  - 30 rivers
  - 18 mountain ranges and hills
  - 22 passes and ghats
  - a latitude and longitude grid with the Tropic of Cancer and the 82.5° E Standard Meridian
  - all 45 UNESCO World Heritage Sites
  - all 58 tiger reserves plus key national parks
  - 51 selected Ramsar wetlands (India has 103)
- **Base maps:** political, soils, climate (Köppen) and crops (leading producer states).
- **Highlight** states by border country, coastline, Schedule, Zonal Council, Tropic of Cancer or Standard Meridian.
- **Zoom and pan** with the scroll wheel, pinch or the buttons. Neighbouring countries, sea names, a scale bar and a compass give context.
- **Daily challenge:** the same ten mixed questions for everyone each day (India time), with a copyable result for sharing.
- **Search** understands old and alternative names (Cauvery, Orissa, Bombay, Tapti, Port Blair and more).
- **Practice:** eight ten-question rounds answered on the map: find the state, capitals, tiger reserves and parks, borders, rivers, passes, UNESCO sites, and ranges and lines.

## Build

```sh
node build.mjs
```

This writes `dist/index.html`. Open it in a browser or host it on GitHub Pages.

## Files

- `src/app.html`: layout, styles and app logic
- `src/regions.js`: facts for each state and UT
- `src/geo.js`: river and pass facts, and the map projection
- `src/layers.js`: capitals, ranges, lines, UNESCO sites, reserves, Ramsar sites, soil and climate zones, crops
- `vendor/`: map geometry (generated, see below)
- `tools/`: scripts that generate the geometry in `vendor/`

## Map data

| File | Source | Script |
| --- | --- | --- |
| `vendor/india-paths.json` | [@svg-maps/india](https://github.com/VictorCazanave/svg-maps) by Victor Cazanave (CC BY 4.0, see `vendor/LICENSE-svg-maps-india.md`) | — |
| `vendor/jk-ladakh-line.json` | J&K–Ladakh boundary from [india-maps-data](https://github.com/udit-001/india-maps-data) `geojson/india.geojson` | `tools/prepare-boundary.mjs` |
| `vendor/india-rivers.json` | [Natural Earth](https://www.naturalearthdata.com/) `ne_10m_rivers_lake_centerlines` (public domain) | `tools/prepare-rivers.mjs` |
| `vendor/neighbours.json` | Natural Earth `ne_10m_admin_0_countries_ind` (India's point of view, public domain) | `tools/prepare-neighbours.mjs` |

The state outlines predate 2019. The app splits Ladakh out of the old Jammu and Kashmir outline along the real UT boundary, and merges Dadra and Nagar Haveli with Daman and Diu. The outer boundary follows India's official depiction.

All geometry is fitted with one Mercator projection (in `src/geo.js`) that was checked against 55 city locations. Point markers, ranges and soil and climate zones are hand-placed and approximate.

Facts were checked in November 2026 against current sources: the 2025 coastline remeasurement, 45 UNESCO sites (Sarnath, 2026), 58 tiger reserves, 103 Ramsar sites, and Amaravati's statutory capital status (2026). Counts change, so recheck before exams.
