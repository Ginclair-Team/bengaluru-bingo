# Scrapers

Empty on purpose. Tile content is static JSON in `src/data/tiles.json`, and nothing is scraped while someone plays.

A source module added here exports one function:

```js
// scrapers/<source>.js
module.exports.collect = async function collect() {
  return [{ name, category, blurb, source_url }];
};
```

Run it offline with `node utils/scrape.js <source>`, review the candidates by hand, and copy the approved ones into `tiles.json`.
