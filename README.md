# India State Atlas

An interactive map of India's 28 states and 8 union territories, made for UPSC preparation.

- **Explore**: tap a state or UT to see its capital, international borders, rivers, national parks and tiger reserves, dances and festivals, tribal communities, and key Prelims facts. Search by capital, river, park, dance or tribe.
- **Filters**: highlight states that border Pakistan, China, Nepal, Bhutan, Bangladesh, Myanmar or Afghanistan; coastal states; Fifth and Sixth Schedule states; union territories; states formed since 2000.
- **Practice**: ten-question rounds answered on the map (find the state, capitals, parks and reserves, borders). Labels are hidden while you play and missed answers are listed at the end.

## Build

```sh
node build.mjs
```

This writes `dist/index.html`, a single self-contained page you can open in a browser or host on GitHub Pages.

## Files

- `src/app.html`: layout, styles and app logic
- `src/regions.js`: facts for each state and UT (edit this to add or correct facts)
- `vendor/india-paths.json`: map outlines

## Map data

Outlines come from [@svg-maps/india](https://github.com/VictorCazanave/svg-maps) by Victor Cazanave (CC BY 4.0, see `vendor/LICENSE-svg-maps-india.md`). They predate 2019, so the app changes them: Ladakh is clipped out of the old Jammu and Kashmir outline along an approximate line, and Dadra and Nagar Haveli is merged with Daman and Diu. The outer boundary follows India's official depiction.
