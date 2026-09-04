import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const approved = require("../_data/legacyBuildingPropertyRedirects.js");
const review = require("../_data/legacyBuildingRedirectReview.js");
const worker = (await import("../workers/rofo-redirects.mjs")).default;

const originalFetch = globalThis.fetch;
const passthrough = [];
globalThis.fetch = async (request) => {
  passthrough.push(typeof request === "string" ? request : request.url);
  return new Response("origin", { status: 200 });
};

async function invoke(path, hostname = "www.rofo.com") {
  return worker.fetch(new Request(`https://${hostname}${path}`));
}

function redirectPath(response) {
  return new URL(response.headers.get("location")).pathname;
}

try {
  assert.equal(approved.length, 14, "approved direct-property cohort must remain exactly 14");
  assert.equal(new Set(approved.map(({ from }) => from)).size, 14, "approved source paths must be unique");
  assert.equal(new Set(approved.map(({ to }) => to)).size, 14, "approved destinations must be unique");

  const held = review.filter(({ finalDisposition }) => finalDisposition !== "DIRECT_PROPERTY_REDIRECT_APPROVED");
  assert.deepEqual(held.map(({ legacyBuildingId }) => legacyBuildingId).sort(), ["1685574", "1703632"]);
  assert.ok(held.every(({ legacyPath }) => !approved.some(({ from }) => from === legacyPath)));

  for (const redirect of approved) {
    const response = await invoke(`${redirect.from}?source=parity`);
    assert.equal(response.status, 301, redirect.from);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.hostname, "www.rofo.com", redirect.from);
    assert.equal(location.pathname, redirect.to, redirect.from);
    assert.equal(location.search, "?source=parity", redirect.from);
  }

  for (const item of held) {
    const response = await invoke(item.legacyPath);
    assert.equal(response.status, 301);
    assert.equal(redirectPath(response), item.currentRedirectDestination);
  }

  const fallback = await invoke("/commercial-real-estate/building/CA/Oakland/Example-123.html");
  assert.equal(fallback.status, 301);
  assert.equal(redirectPath(fallback), "/commercial-real-estate/CA/oakland/");

  const mobile = await invoke("/CA/Oakland", "m.rofo.com");
  assert.equal(mobile.status, 301);
  assert.equal(redirectPath(mobile), "/commercial-real-estate/CA/oakland/");

  const mobileBuilding = await invoke(approved[0].from, "m.rofo.com");
  assert.equal(mobileBuilding.status, 301);
  assert.equal(new URL(mobileBuilding.headers.get("location")).hostname, "www.rofo.com");
  assert.equal(redirectPath(mobileBuilding), approved[0].from);

  const legacyCity = await invoke("/NV/Fallon");
  assert.equal(redirectPath(legacyCity), "/commercial-real-estate/NV/fallon/");

  const mixedCaseCity = await invoke("/commercial-real-estate/NV/Fallon");
  assert.equal(redirectPath(mixedCaseCity), "/commercial-real-estate/NV/fallon/");

  const lowercaseState = await invoke("/commercial-real-estate/ny/new-york/");
  assert.equal(redirectPath(lowercaseState), "/commercial-real-estate/NY/new-york/");

  const listing = await invoke("/listings/OR/Portland/50-SW-2nd-Ave-52772.html");
  assert.equal(redirectPath(listing), "/commercial-real-estate/OR/portland/");

  const commercialListing = await invoke("/commercial-real-estate/listings/OR/Beaverton/example.html");
  assert.equal(redirectPath(commercialListing), "/commercial-real-estate/OR/beaverton/");

  assert.equal((await invoke("/commercial-real-estate/user/sean/1")).status, 410);
  assert.equal((await invoke("/commercial-real-estate/company/test/123")).status, 410);

  const assetsBefore = passthrough.length;
  assert.equal((await invoke("/assets/app.css")).status, 200);
  assert.equal(passthrough.length, assetsBefore + 1, "static asset must pass through");

  const unmatchedBefore = passthrough.length;
  assert.equal((await invoke("/about/")).status, 200);
  assert.equal(passthrough.length, unmatchedBefore + 1, "unmatched request must pass through");

  const source = readFileSync(new URL("../workers/rofo-redirects.mjs", import.meta.url), "utf8");
  assert.ok(source.indexOf("DIRECT_PROPERTY_REDIRECTS.get(path)") < source.indexOf("const buildingHtmlMatch"));
  assert.ok(!source.includes("1703632") && !source.includes("1685574"), "held IDs must not be embedded");

  const pagesTemplate = readFileSync(new URL("../pages/business-brief-redirects.njk", import.meta.url), "utf8");
  assert.ok(pagesTemplate.includes("legacyBuildingPropertyRedirects"), "Pages defense-in-depth must use shared registry");

  const config = JSON.parse(readFileSync(new URL("../workers/rofo-redirects.wrangler.jsonc", import.meta.url), "utf8"));
  assert.equal(config.name, "rofo-redirects");
  assert.equal(config.main, "./rofo-redirects.mjs");
  assert.ok(!Object.hasOwn(config, "routes"), "source reconciliation must not manage production routes");
  assert.ok(!existsSync(new URL("../workers/rofo-redirects.README.md", import.meta.url)), "Worker docs must not become an Eleventy page");

  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(!Object.values(packageJson.scripts).some((script) => /wrangler\s+deploy(?!\s+--dry-run)/.test(script)), "normal npm scripts must not auto-deploy the Worker");

  console.log("PASS rofo-redirects Worker source-control parity");
  console.log(`PASS ${approved.length} exact reviewed property redirects precede generic fallback`);
  console.log("PASS held identities, mobile/city/listing/410/static/passthrough behavior");
} finally {
  globalThis.fetch = originalFetch;
}
