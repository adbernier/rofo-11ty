const cities = require("./cities.generated.json");

const seen = new Set();

module.exports = cities.filter((c) => {
  if (seen.has(c.state_abbr)) return false;
  seen.add(c.state_abbr);
  return true;
});