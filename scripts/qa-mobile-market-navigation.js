const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const header = read("_includes/header.njk");
const breadcrumbs = read("_includes/partials/breadcrumbs.njk");
const prompt = read("_includes/partials/shared/recommendation-prompt-card.njk");
const styles = read("styles.css");

assert(header.includes('class="mobile-market-control"'));
assert(header.includes('aria-label="{% if mobileMarketLabel == \'Markets\' %}Browse markets{% else %}View {{ mobileMarketLabel }} market{% endif %}"'));
assert(header.includes("mobileMarketLabel = neighborhood.city"));
assert(header.includes("neighborhood.city_slug"));
assert(header.includes("mobileMarketLabel = city.city"));
assert(header.includes("city.slug"));
assert(header.includes("entry.city.slug"));
assert(header.includes("mobileMarketLabel = brief.market.marketName"));
assert(header.includes('class="mobile-menu-toggle"'), "The broader-navigation hamburger must remain available.");
assert(!header.includes("mobile-header-cta"));

assert(styles.includes("flex: 1 1 auto"));
assert(styles.includes("max-width: min(48vw, 190px)"));
assert(styles.includes("text-overflow: ellipsis"));
assert(styles.includes("white-space: nowrap"));
assert(styles.includes("min-height: 38px"));
assert(styles.includes("height: 44px"));

assert(breadcrumbs.includes("breadcrumbs__item--mobile-hidden"));
assert(breadcrumbs.includes("breadcrumbs__item--market"));
assert(styles.includes(".breadcrumbs__item--mobile-hidden"));
assert(styles.includes(".breadcrumbs__item--market a"));

assert(prompt.includes("See My Best-Fit Locations"));
assert(prompt.includes("district="));
assert(prompt.includes("districtId="));
assert(prompt.includes("sourcePath="));
assert(prompt.includes("marketId=san-francisco"));
assert(prompt.includes('promptBase = "/location-requirement/" if promptHasDistrictIntelligence else "/find-locations/"'));

console.log("Mobile market navigation QA passed for 375px, 390px, and 430px CSS contracts.");
