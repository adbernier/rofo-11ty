const fs = require("fs");
const path = require("path");

const cityHeroImages = {
  "san-francisco-ca": {
    hero_image: "/assets/images/cities/san-francisco.jpg",
    hero_image_alt: "Street view of San Francisco with small businesses and offices"
  }
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PLACEHOLDER_THEME_COUNT = 6;

module.exports = () => {
  const filePath = path.join(process.cwd(), "_data", "cities.generated.json");
  const cities = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return cities.map((city) => {
    const heroOverride = cityHeroImages[city.city_state_slug] || {};
    const rawHeroImage = city.hero_image || "";
    const isGenericPlaceholder = rawHeroImage === "/images/cities/city.jpg";

    const placeholderTheme =
      city.placeholder_theme !== undefined && city.placeholder_theme !== null
        ? city.placeholder_theme
        : hashString(city.city_state_slug || `${city.city}-${city.state_abbr}`) % PLACEHOLDER_THEME_COUNT;

    return {
      ...city,
      hero_image:
        heroOverride.hero_image ||
        (isGenericPlaceholder ? "" : rawHeroImage),
      hero_image_alt:
        heroOverride.hero_image_alt ||
        city.hero_image_alt ||
        `${city.city}, ${city.state_abbr}`,
      placeholder_theme: placeholderTheme
    };
  });
};