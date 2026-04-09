module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addFilter("uniqueStates", (cities) => {
    const seen = new Set();
    return cities.filter((c) => {
      if (seen.has(c.state_abbr)) return false;
      seen.add(c.state_abbr);
      return true;
    });
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};