const spaceTypePages = require("./spaceTypePages.js");

module.exports = Object.fromEntries(
  spaceTypePages.map((entry) => {
    const key = [
      String(entry.state_abbr || "").toUpperCase(),
      String(entry.city_slug || "").toLowerCase(),
      String(entry.page_slug || "").toLowerCase(),
    ].join("/");

    return [key, true];
  })
);
