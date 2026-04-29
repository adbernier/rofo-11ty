const getMarketGuides = require("./marketGuides");

module.exports = function () {
  return getMarketGuides().reduce((lookup, guide) => {
    const key = `${guide.state_abbr}/${String(guide.city_slug || "").toLowerCase()}/${guide.space_type}`;
    lookup[key] = guide;
    return lookup;
  }, {});
};
