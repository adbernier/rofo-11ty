module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("assets"); // ← ADD THIS

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};