// Seeding stub for future tile content.
//
// Tile content is static JSON (src/data/tiles.json). Nothing is ever scraped
// while someone is playing. When the tile set needs refreshing, a source
// module in /scrapers gathers candidates offline, a person reviews them, and
// the approved ones are written into tiles.json by hand.
//
// Usage (once a source exists):  node utils/scrape.js <source>

const sources = {
  // reddit: require("../scrapers/reddit"),
  // x: require("../scrapers/x"),
};

async function main() {
  const name = process.argv[2];
  if (!name || !sources[name]) {
    console.log("No scraper sources are implemented yet.");
    console.log("Add one under /scrapers that exports: async function collect() -> [{ name, category, blurb, source_url }]");
    return;
  }
  const candidates = await sources[name].collect();
  console.log(JSON.stringify(candidates, null, 2));
}

main();
