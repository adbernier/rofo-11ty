const fs = require("fs");
const path = require("path");
const { getRoutingCandidates } = require("./leadRouting.js");
const marketSnapshots = require("./marketSnapshots.js");

function findCityHeroImage(cityStateSlug) {
  const baseDir = path.join(process.cwd(), "assets", "images", "cities");
  const extensions = [".webp", ".jpg", ".jpeg", ".png"];

  for (const ext of extensions) {
    const filename = `${cityStateSlug}${ext}`;
    const filePath = path.join(baseDir, filename);

    if (fs.existsSync(filePath)) {
      return `/assets/images/cities/${filename}`;
    }
  }

  return "";
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countyStateSlug(county, state_abbr) {
  const countySlug = slugify(county);
  const stateSlug = String(state_abbr || "").trim().toLowerCase();

  return countySlug && stateSlug ? `${countySlug}-${stateSlug}` : "";
}

const PLACEHOLDER_THEME_COUNT = 6;

module.exports = () => {
  const filePath = path.join(process.cwd(), "_data", "cities.generated.json");
  const cities = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return cities.map((city) => {
    const cityStateSlug =
      city.city_state_slug || `${city.slug}-${city.state_abbr.toLowerCase()}`;
    const marketSnapshotKey = `${String(city.state_abbr || "").toUpperCase()}/${String(city.slug || "").toLowerCase()}`;
    const routingCounty = countyStateSlug(city.county || city.county_name, city.state_abbr);

    const autoHeroImage = findCityHeroImage(cityStateSlug);
    const rawHeroImage = city.hero_image || "";
    const isGenericPlaceholder = rawHeroImage === "/images/cities/city.jpg";

    const placeholderTheme =
      city.placeholder_theme !== undefined && city.placeholder_theme !== null
        ? city.placeholder_theme
        : hashString(cityStateSlug || `${city.city}-${city.state_abbr}`) % PLACEHOLDER_THEME_COUNT;

    return {
      ...city,
      city_state_slug: cityStateSlug,
      routing_market: cityStateSlug,
      routing_county: routingCounty,
      market_snapshot: marketSnapshots[marketSnapshotKey] || null,
      routing_candidates: getRoutingCandidates({
        city_state_slug: cityStateSlug,
        county_state_slug: routingCounty,
        space_type_slug: "",
      }),
      hero_image:
        autoHeroImage ||
        (isGenericPlaceholder ? "" : rawHeroImage),
      hero_image_alt:
        city.hero_image_alt ||
        `${city.city}, ${city.state_abbr}`,
      placeholder_theme: placeholderTheme
    };
  });
};
