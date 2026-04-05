const rawCities = require("./cities.raw.json");

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

  let heading = `Commercial real estate in ${city.city}`;
  let paragraph1 = `${city.city}, ${city.state_abbr } offers businesses a range of office, retail, and industrial real estate opportunities.`;
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

module.exports = rawCities.map((city) => {
  const candidates = rawCities
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

  let seoIntro = `Explore office, retail, and industrial real estate opportunities in ${city.city}, ${city.state_abbr}.`;
  let seoDescription = `Explore commercial real estate in ${city.city}, ${city.state_abbr}. Browse office, retail, and industrial properties and discover nearby opportunities with Rofo.`;

  if (city.tier === 1) {
    seoIntro = `${city.city} is one of the more active commercial real estate markets in ${city.state_abbr}, with opportunities across office, retail, and industrial property types.`;
    seoDescription = `Explore commercial real estate in ${city.city}, ${city.state_abbr}, one of the more active business markets in the state. Browse office, retail, and industrial properties and compare nearby markets with Rofo.`;
  } else if (city.tier === 2) {
    seoIntro = `Browse commercial real estate in ${city.city}, ${city.state_abbr}, including office, retail, and industrial space for a range of business needs.`;
    seoDescription = `Browse commercial real estate in ${city.city}, ${city.state_abbr}. Explore office, retail, and industrial space, review representative buildings, and compare nearby markets with Rofo.`;
  } else if (city.county) {
    seoIntro = `${city.city}, located in ${city.county}, offers businesses access to local office, retail, and industrial real estate opportunities.`;
    seoDescription = `Explore commercial real estate in ${city.city}, ${city.state_abbr}, located in ${city.county}. Browse representative office, retail, and industrial properties and discover nearby opportunities with Rofo.`;
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
    })),
    seo_intro: seoIntro,
    seo_description: seoDescription,
    market_context_heading: marketContext.heading,
    market_context_paragraph1: marketContext.paragraph1,
    market_context_paragraph2: marketContext.paragraph2,
  };
});