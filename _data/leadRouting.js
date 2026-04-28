const partners = [
  {
    id: "sac-la-partner",
    name: "Partner Name",
    email: "partner@example.com",
    cities: [
      "sacramento-ca",
      "los-angeles-ca"
    ],
    space_types: ["office-space", "retail-space", "industrial-space"],
    status: "active"
  }
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getRoutingCandidates({ city_state_slug, space_type_slug }) {
  const market = normalize(city_state_slug);
  const spaceType = normalize(space_type_slug);

  const matches = partners
    .filter((partner) => partner.status === "active")
    .filter((partner) => {
      const cities = Array.isArray(partner.cities)
        ? partner.cities.map(normalize)
        : [];
      const spaceTypes = Array.isArray(partner.space_types)
        ? partner.space_types.map(normalize)
        : [];

      if (!cities.includes(market)) return false;
      if (spaceTypes.includes("all")) return true;
      if (!spaceType) return false;

      return spaceTypes.includes(spaceType);
    })
    .map((partner) => partner.id);

  return matches.length ? matches : ["rofo-default"];
}

module.exports = {
  partners,
  getRoutingCandidates
};
