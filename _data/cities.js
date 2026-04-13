const rawCities = require("./raw/cities.raw.json");

// ---- DUPLICATE GUARD (skip + log) ----
const seenCityKeys = new Set();
const duplicateCities = [];

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase();
}

function buildCityPath(city) {
  return `/commercial-real-estate/${city.state_abbr}/${city.slug}/`;
}

const normalizedRawCities = rawCities.map((city) => {
  const normalizedSlug = normalizeSlug(city.slug || city.city_state_slug || city.city);
  const normalizedCityStateSlug = normalizeSlug(
    city.city_state_slug || `${normalizedSlug}-${city.state_abbr || ""}`
  );

  return {
    ...city,
    slug: normalizedSlug,
    city_state_slug: normalizedCityStateSlug,
    path: buildCityPath({
      ...city,
      slug: normalizedSlug,
    }),
  };
});

const dedupedCities = normalizedRawCities.filter((city) => {
  const key = city.city_state_slug;

  if (!key) {
    console.warn(
      `⚠️ Missing city_state_slug: ${city.city}, ${city.state_abbr}`
    );
    return false;
  }

  if (seenCityKeys.has(key)) {
    duplicateCities.push(key);
    return false;
  }

  seenCityKeys.add(key);
  return true;
});

if (duplicateCities.length) {
  console.warn(
    `⚠️ Skipped ${duplicateCities.length} duplicate cities:\n` +
      duplicateCities.slice(0, 10).join(", ") +
      (duplicateCities.length > 10 ? "..." : "")
  );
}
// --------------------------------------

function toRadians(deg) {
  return deg * (Math.PI / 180);
}

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function validCoord(v) {
  return typeof v === "number" && !Number.isNaN(v);
}

function formatNearbyList(candidates) {
  const labels = candidates.map((c) => c.city);

  if (!labels.length) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels[0]}, ${labels[1]}, and ${labels[2]}`;
}

function getMarketContext(city, nearbyNames) {
  const buildingCount = city.building_count
    ? city.building_count.toLocaleString()
    : null;

  const heading = `Commercial real estate in ${city.city}`;
  let paragraph1 = `${city.city}, ${city.state_abbr} offers businesses a range of office, retail, and industrial real estate opportunities.`;
  let paragraph2 = `Rofo helps businesses explore representative buildings, compare market options, and evaluate nearby cities when searching for space.`;

  if (city.tier === 1) {
    paragraph1 = `${city.city} is one of the more active commercial real estate markets in ${city.state_abbr}, with a broad mix of office, retail, and industrial property types serving established companies and growing businesses alike.`;
    paragraph2 = `For businesses evaluating space in a major market, ${city.city} can be a strong place to begin a search, especially when compared with nearby cities that may offer different pricing, inventory, or neighborhood dynamics.`;
  } else if (city.tier === 2) {
    paragraph1 = `${city.city} is a meaningful commercial real estate market in ${city.state_abbr}, offering businesses access to office, retail, and industrial space across a variety of property formats and locations.`;
    paragraph2 = `For many companies, ${city.city} can offer a practical balance between access, visibility, and flexibility, while still allowing comparisons with nearby markets in the same region.`;
  } else if (city.county) {
    paragraph1 = `${city.city}, located in ${city.county}, gives businesses a local entry point into the ${city.state_abbr} commercial real estate market, with options that may suit office users, retailers, and industrial tenants.`;
    paragraph2 = `Smaller and secondary markets can be especially useful for businesses seeking a more targeted location strategy, and ${city.city} may also benefit from proximity to nearby commercial hubs.`;
  }

  if (buildingCount) {
    paragraph1 += ` Rofo currently tracks approximately ${buildingCount} buildings in this market.`;
  }

  if (nearbyNames) {
    paragraph2 += ` Nearby markets include ${nearbyNames}.`;
  }

  return {
    heading,
    paragraph1,
    paragraph2,
  };
}

module.exports = dedupedCities.map((city) => {
  const candidates = normalizedRawCities
    .filter((other) => {
      if (other.city === city.city && other.state_abbr === city.state_abbr) {
        return false;
      }

      return (
        other.state_abbr === city.state_abbr &&
        validCoord(city.lat) &&
        validCoord(city.lng) &&
        validCoord(other.lat) &&
        validCoord(other.lng)
      );
    })
    .map((other) => ({
      ...other,
      distance_miles: haversineMiles(city.lat, city.lng, other.lat, other.lng),
    }))
    .sort((a, b) => a.distance_miles - b.distance_miles)
    .slice(0, 4);

  const nearbyNames = formatNearbyList(candidates);
  const buildingCount = city.building_count
    ? city.building_count.toLocaleString()
    : null;

  const stateName = city.state_abbr;

  let seoTitle = `Office, Retail and Industrial Space in ${city.city}, ${stateName}`;
  let seoIntro = `Explore office, retail, and industrial real estate opportunities in ${city.city}, ${stateName}.`;
  let seoDescription = `Browse office, retail, and industrial commercial real estate in ${city.city}, ${stateName}. Explore market context, buildings, nearby cities, and get help finding space.`;

  if (city.tier === 1) {
    seoTitle = `Commercial Real Estate in ${city.city}, ${stateName} | Office, Retail and Industrial`;
    seoIntro = `${city.city} is one of the more active commercial real estate markets in ${stateName}, with opportunities across office, retail, and industrial property types.`;
    seoDescription = `Explore commercial real estate in ${city.city}, ${stateName}, one of the most active business markets in the state. Browse office, retail, and industrial properties and compare nearby markets with Rofo.`;
  } else if (city.tier === 2) {
    seoTitle = `Office and Retail Space in ${city.city}, ${stateName} | Commercial Real Estate`;
    seoIntro = `Browse commercial real estate in ${city.city}, ${stateName}, including office, retail, and industrial space for a range of business needs.`;
    seoDescription = `Browse commercial real estate in ${city.city}, ${stateName}. Explore office, retail, and industrial space, review representative buildings, and compare nearby markets with Rofo.`;
  } else if (city.county) {
    seoTitle = `Commercial Real Estate in ${city.city}, ${stateName} | Local Market Overview`;
    seoIntro = `${city.city}, located in ${city.county}, offers businesses access to local office, retail, and industrial real estate opportunities.`;
    seoDescription = `Explore commercial real estate in ${city.city}, ${stateName}. Browse office, retail, and industrial properties and discover nearby opportunities with Rofo.`;
  }

  if (buildingCount) {
    seoIntro += ` Rofo currently tracks approximately ${buildingCount} buildings in this market.`;
  }

  if (nearbyNames) {
    seoIntro += ` Nearby markets include ${nearbyNames}.`;
  }

  const marketContext = getMarketContext(city, nearbyNames);

  return {
    ...city,
    nearby_cities: candidates.map((c) => c.slug),
    nearby_city_details: candidates.map((c) => ({
      slug: c.slug,
      city: c.city,
      state_abbr: c.state_abbr,
      distance_miles: Math.round(c.distance_miles),
      path: c.path,
    })),
    seo_title: seoTitle,
    seo_intro: seoIntro,
    seo_description: seoDescription,
    market_context_heading: marketContext.heading,
    market_context_paragraph1: marketContext.paragraph1,
    market_context_paragraph2: marketContext.paragraph2,
  };
});