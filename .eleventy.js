module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");

  eleventyConfig.addFilter("uniqueStates", (cities) => {
    const seen = new Set();
    return cities.filter((c) => {
      if (seen.has(c.state_abbr)) return false;
      seen.add(c.state_abbr);
      return true;
    });
  });

  eleventyConfig.addFilter("buildingPlaceholder", (building) => {
    const type = (building?.type || "").toLowerCase();

    let variants = [
      "/images/placeholders/building-a.svg",
      "/images/placeholders/building-b.svg",
      "/images/placeholders/building-c.svg",
    ];

    if (type.includes("industrial") || type.includes("flex")) {
      variants = [
        "/images/placeholders/building-c.svg",
        "/images/placeholders/building-b.svg",
      ];
    }

    const seedSource =
      building?.slug ||
      building?.address ||
      building?.name ||
      "building";

    let hash = 0;
    for (let i = 0; i < seedSource.length; i++) {
      hash = (hash + seedSource.charCodeAt(i)) % 100000;
    }

    return variants[hash % variants.length];
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};