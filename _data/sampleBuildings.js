const cities = require("./cities.js");

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const officeNames = [
  "Commerce Center",
  "Business Park",
  "Executive Plaza",
  "Gateway Tower",
  "Corporate Center",
];

const retailNames = [
  "Retail Plaza",
  "Shops at Market",
  "Marketplace Center",
  "Neighborhood Center",
  "Retail Commons",
];

const industrialNames = [
  "Industrial Park",
  "Logistics Center",
  "Flex Campus",
  "Warehouse Center",
  "Distribution Hub",
];

module.exports = cities.flatMap((city, index) => {
  const citySlug = city.slug;
  const cityBase = slugify(city.city);

  const officeName = officeNames[index % officeNames.length];
  const retailName = retailNames[index % retailNames.length];
  const industrialName = industrialNames[index % industrialNames.length];

  return [
    {
      city: city.city,
      state_abbr: city.state_abbr,
      city_slug: citySlug,
      building_slug: `${cityBase}-commerce-center`,
      name: `${city.city} ${officeName}`,
      address: `${100 + (index % 40) * 10} Main Street, ${city.city}, ${city.state_abbr}`,
      type: "Office",
      size: `${18 + (index % 10) * 3},000 SF`,
      year_built: 1995 + (index % 20),
      floors: 4 + (index % 10),
      teaser: `A well-located office property in ${city.city} suited for professional services, technology, and growing teams seeking central market access.`,
      hero_image: "/images/cities/city.jpg"
    },
    {
      city: city.city,
      state_abbr: city.state_abbr,
      city_slug: citySlug,
      building_slug: `${cityBase}-retail-plaza`,
      name: `${city.city} ${retailName}`,
      address: `${200 + (index % 35) * 10} Market Street, ${city.city}, ${city.state_abbr}`,
      type: "Retail",
      size: `${9 + (index % 8) * 2},500 SF`,
      year_built: 1988 + (index % 25),
      floors: 1 + (index % 3),
      teaser: `A visible neighborhood retail property in ${city.city} with flexible merchandising potential and convenient customer access.`,
      hero_image: "/images/cities/city.jpg"
    },
    {
      city: city.city,
      state_abbr: city.state_abbr,
      city_slug: citySlug,
      building_slug: `${cityBase}-industrial-park`,
      name: `${city.city} ${industrialName}`,
      address: `${300 + (index % 30) * 10} Industrial Way, ${city.city}, ${city.state_abbr}`,
      type: "Industrial",
      size: `${28 + (index % 12) * 4},000 SF`,
      year_built: 1985 + (index % 30),
      floors: 1,
      teaser: `A representative industrial and flex property in ${city.city} designed for warehouse, light manufacturing, or distribution-oriented users.`,
      hero_image: "/images/cities/city.jpg"
    },
  ];
});