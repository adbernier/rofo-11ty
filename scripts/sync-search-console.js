const { syncSearchConsole } = require("../lib/search-intelligence/search-console-sync");

async function main() {
  const live = process.argv.includes("--live");
  const result = await syncSearchConsole({ live });
  const output = result.output;
  const status = output.status || {};

  if (result.staleFallback) {
    console.warn(`Search Console sync failed; preserved stale snapshot: ${result.error.message}`);
  }

  console.log(`Search Intelligence written: ${output.records.length} markets, ${output.rawObservationSummary.rowCount} page/query rows.`);
  console.log(`Mode: ${status.mode}${status.stale ? " stale" : ""}`);
}

main().catch((error) => {
  console.error(`Search Console sync failed: ${error.message}`);
  process.exit(1);
});
