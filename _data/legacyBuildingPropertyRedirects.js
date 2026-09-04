"use strict";

module.exports = require("./legacyBuildingRedirectReview.js")
  .filter((item) => item.finalDisposition === "DIRECT_PROPERTY_REDIRECT_APPROVED")
  .map((item) => Object.freeze({ from: item.legacyPath, to: item.proposedCanonicalDestination, status: item.redirectStatus }));
