"use strict";

const rows = [
  ["154540", "AR", "Little Rock", "400 W Capitol Ave", "Regions Building", ["office", "coworking"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["383180", "AZ", "Phoenix", "67 E Weldon Ave", "Weldon Park", ["office"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["1703632", "CA", "Los Angeles", "12100 Wilshire Blvd", "12100 Wilshire Boulevard, Suite 1090", ["office", "coworking"], "NEEDS_IDENTITY_REVIEW"],
  ["534247", "CA", "Los Angeles", "7462 N Figueroa St", "7462 N Figueroa St", ["office"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["129041", "CA", "Sacramento", "2255 Watt Ave", "2255 Watt Ave", ["office"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["163335", "CA", "Sacramento", "7248 S Land Park Dr", "South Land Park Office Center", ["office"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["1710380", "CA", "Sacramento", "8700 La Riviera Dr", "Glenbrook Shopping Center", ["retail"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["167767", "CO", "Englewood", "8310 S Valley Hwy", "The Point at Inverness", ["office", "coworking"], "DIRECT_PROPERTY_REDIRECT_APPROVED", "inverness"],
  ["171720", "FL", "Sarasota", "1900 Main St", "1900 Main St", ["office", "retail"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["145903", "ID", "Boise", "950 W Bannock St", "Banner Bank Building", ["office", "coworking"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["145945", "IL", "Chicago", "401 N Michigan Ave", "401 North Michigan", ["office", "coworking"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["918594", "IL", "Lisle", "2300 Cabot Dr", "2300 Cabot Drive", ["office"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["1027086", "NY", "Buffalo", "1100 Kenmore Ave", "1100 Kenmore Ave", ["retail"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["1685574", "NY", "Suffern", "400 Rella Blvd", "400 Rella, Suite 100 Sublet", ["office", "coworking"], "NEEDS_IDENTITY_REVIEW"],
  ["175144", "TN", "Knoxville", "10820 Kingston Pike", "10820 Kingston Pike", ["retail", "office"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
  ["175670", "TN", "Knoxville", "9051 Executive Park Dr", "9051 Executive Park Dr", ["office"], "DIRECT_PROPERTY_REDIRECT_APPROVED"],
];

function slug(value) { return String(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

module.exports = Object.freeze(rows.map(([legacyBuildingId, state, municipality, address, buildingName, propertyTypes, finalDisposition, geographyId = null]) => {
  const addressSlug = slug(address);
  const citySlug = slug(municipality);
  const legacyPath = `/commercial-real-estate/building/${state}/${municipality.replace(/ /g, "-")}/${address.replace(/ /g, "-")}-${legacyBuildingId}.html`;
  const canonicalPath = `/commercial-real-estate/building/${state}/${citySlug}/${addressSlug}/`;
  const suiteRisk = /\bsuite\b|\bsublet\b/i.test(buildingName);
  return Object.freeze({
    legacyBuildingId,
    legacyUrl: `https://www.rofo.com${legacyPath}`,
    legacyPath,
    normalizedAddress: address.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(),
    municipality,
    state,
    durablePropertyId: `property:${state.toLowerCase()}:${citySlug}:${addressSlug}`,
    currentRedirectDestination: `/commercial-real-estate/${state}/${citySlug}/`,
    proposedCanonicalDestination: canonicalPath,
    identityEvidence: suiteRisk
      ? "Exact base address and municipality match, but source name is suite/sublet-specific; building equivalence is not yet reviewed."
      : "Exact normalized street address, municipality, state, historical building ID, and current canonical building registry match.",
    municipalityEvidence: "Historical property record and current canonical building registry agree on municipality and state.",
    propertyTypeEvidence: Object.freeze(propertyTypes),
    geographyRelationship: geographyId ? Object.freeze({ geographyId, status: "REVIEWED_CURRENT_BUILDING_INTELLIGENCE" }) : null,
    hierarchyReview: suiteRisk ? "SUITE_BUILDING_AMBIGUITY" : "BUILDING_IDENTITY_CONFIRMED",
    canonicalRouteReview: Object.freeze({ expectedStatus: 200, selfCanonical: true, indexable: true, addressCenteredTitle: true, staleAvailabilityDetected: false }),
    finalDisposition,
    redirectStatus: finalDisposition === "DIRECT_PROPERTY_REDIRECT_APPROVED" ? 301 : null,
    reviewScope: "LEGACY_BUILDING_REDIRECT_CLEANUP_16",
  });
}));
