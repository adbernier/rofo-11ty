let generatedSnapshots = {};

try {
  generatedSnapshots = require("./marketSnapshots.generated.js");
} catch (error) {
  generatedSnapshots = {};
}

// Keep rare one-off corrections here. These win over generated CSV data.
const manualOverrides = {};

module.exports = {
  ...generatedSnapshots,
  ...manualOverrides,
};
