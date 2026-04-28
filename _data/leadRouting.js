const partners = [
  {
    id: "sacramento",
    name: "Sacramento Partner",
    email: "partner@example.com",
    cities: ["sacramento-ca"],
    counties: ["sacramento-county-ca"],
    space_types: ["office-space", "retail-space", "industrial-space"],
    status: "active"
  },
  {
    id: "los-angeles",
    name: "Los Angeles Partner",
    email: "partner@example.com",
    cities: ["los-angeles-ca"],
    counties: ["los-angeles-county-ca"],
    space_types: ["office-space", "retail-space", "industrial-space"],
    status: "active"
  },
  {
    id: "default-partner",
    name: "Default Partner",
    email: "default@example.com",
    cities: ["all"],
    counties: ["all"],
    space_types: ["all"],
    is_default: true,
    status: "inactive"
  }
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeList(values) {
  return Array.isArray(values) ? values.map(normalize).filter(Boolean) : [];
}

function partnerMatchesLocation(partner, market, county) {
  const cities = normalizeList(partner.cities);
  const counties = normalizeList(partner.counties);

  const cityMatches = Boolean(market) && (cities.includes(market) || cities.includes("all"));
  const countyMatches = Boolean(county) && (counties.includes(county) || counties.includes("all"));

  return cityMatches || countyMatches;
}

function partnerMatchesSpaceType(partner, spaceType) {
  const spaceTypes = normalizeList(partner.space_types);

  if (spaceTypes.includes("all")) return true;
  if (!spaceType) return false;

  return spaceTypes.includes(spaceType);
}

function unique(values) {
  return Array.from(new Set(values));
}

function getRoutingCandidates({ city_state_slug, county_state_slug, space_type_slug }) {
  const market = normalize(city_state_slug);
  const county = normalize(county_state_slug);
  const spaceType = normalize(space_type_slug);
  const activePartners = partners.filter((partner) => partner.status === "active");

  const matches = activePartners
    .filter((partner) => !partner.is_default)
    .filter((partner) => partnerMatchesLocation(partner, market, county))
    .filter((partner) => partnerMatchesSpaceType(partner, spaceType))
    .map((partner) => partner.id);

  if (matches.length) return unique(matches);

  const defaultMatches = activePartners
    .filter((partner) => partner.is_default)
    .filter((partner) => partnerMatchesSpaceType(partner, spaceType))
    .map((partner) => partner.id);

  return defaultMatches.length ? unique(defaultMatches) : ["rofo-default"];
}

module.exports = {
  partners,
  getRoutingCandidates
};
