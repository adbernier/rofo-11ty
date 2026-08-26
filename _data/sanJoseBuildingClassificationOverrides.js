"use strict";

// Narrow, reviewed corrections for San Jose records whose source classification
// conflicts with the stable building/use evidence. These overrides describe
// property character; they are not availability or permitted-use claims.
const overrides = Object.freeze({
  "CA|san-jose|350-w-trimble-rd": Object.freeze({
    primary_space_type: "flex",
    type: "Flex",
    space_types: Object.freeze(["flex"]),
    raw_space_types: Object.freeze(["FLEX", "R&D", "MANUFACTURING"]),
    classification_review: Object.freeze({
      status: "reviewed",
      reason: "The source description and City project record identify manufacturing/R&D use; the legacy Office label is too narrow.",
      provenance: Object.freeze([
        "data-sources/company-exports/raw/lba-realty__national.csv",
        "City of San Jose 350 West Trimble Road Project (PDC22-009, PD22-028, ER22-210)",
      ]),
    }),
  }),
  "CA|san-jose|1650-las-plumas-ave": Object.freeze({
    primary_space_type: "flex",
    type: "Flex",
    space_types: Object.freeze(["flex"]),
    raw_space_types: Object.freeze(["FLEX", "R&D", "LIGHT MANUFACTURING", "DISTRIBUTION"]),
    classification_review: Object.freeze({
      status: "reviewed",
      reason: "The canonical source describes a business park with office, R&D, light-manufacturing, and distribution formats.",
      provenance: Object.freeze(["data-sources/company-exports/raw/ps-business-parks__national.csv"]),
    }),
  }),
  "CA|san-jose|1580-1630-old-oakland-road": Object.freeze({
    primary_space_type: "flex",
    type: "Flex",
    space_types: Object.freeze(["flex"]),
    raw_space_types: Object.freeze(["FLEX", "OFFICE/WAREHOUSE"]),
    classification_review: Object.freeze({
      status: "reviewed",
      reason: "The canonical source describes multi-tenant office with recurring warehouse configurations; Flex is more accurate than Office alone.",
      provenance: Object.freeze(["data-sources/company-exports/raw/ps-business-parks__national.csv"]),
    }),
  }),
  "CA|san-jose|1706-monterey-hwy": Object.freeze({
    primary_space_type: "commercial",
    type: "Commercial",
    space_types: Object.freeze(["commercial"]),
    raw_space_types: Object.freeze(["COMMERCIAL"]),
    classification_review: Object.freeze({
      status: "reviewed_exclusion",
      reason: "The source describes an existing motel on a combined Industrial/Commercial site; it is not representative Industrial building evidence.",
      provenance: Object.freeze(["data-sources/company-exports/raw/meacham-oppenheimer__san-jose.csv"]),
    }),
  }),
});

function keyFor(building) {
  return [
    String(building.state_abbr || building.state || "").toUpperCase(),
    String(building.city_slug || building.city || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    String(building.building_slug || building.slug || building.address || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
  ].join("|");
}

function apply(building) {
  const override = overrides[keyFor(building)];
  return override ? { ...building, ...override } : building;
}

module.exports = Object.freeze({ schemaVersion: "san-jose-building-classification-overrides:v1", overrides, apply, keyFor });
