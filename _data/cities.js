const rawCities = require("./cities.raw.json");

function toRadians(deg) {
  return deg * (Math.PI / 180);
}

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles

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

function isValidCoord(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

module.exports = rawCities.map((city) => {
  const sameStateCandidates = rawCities.filter((other) => {
    if (other.city === city.city && other.state_abbr === city.state_abbr) {
      return false;
    }

    return (
      other.state_abbr === city.state_abbr &&
      isValidCoord(city.lat) &&
      isValidCoord(city.lng) &&
      isValidCoord(other.lat) &&
      isValidCoord(other.lng)
    );
  });

  const nearest = sameStateCandidates
    .map((other) => ({
      slug: other.slug,
      distance: haversineMiles(city.lat, city.lng, other.lat, other.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4)
    .map((item) => item.slug);

  return {
    ...city,
    nearby_cities: nearest,
  };
});