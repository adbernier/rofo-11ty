// Compatibility projection for code that still imports the original public
// Industrial/Flex guide module. The certified discovery registry is the sole
// current source for SF space-type presentation.
const discovery = require("./sfPublicDiscovery");

module.exports = Object.freeze({
  industrial: discovery.guides.industrial,
  flex: discovery.guides.flex,
});
