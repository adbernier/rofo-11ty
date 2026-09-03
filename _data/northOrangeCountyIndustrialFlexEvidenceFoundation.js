const PROPERTY_VERIFICATION = "Representative environments illustrate reviewed operating character, not availability or property capability. Loading, clear height, power, yard or outdoor storage, ventilation, parking rights, and permitted use require current property investigation.";

const ACCESS_LIMITATION = "Employee origins, customer and supplier geography, service territory, commute performance, relative freeway access, and airport value are not recommendation-grade evidence in this foundation.";

const source = (id, type, title, location, supports) => Object.freeze({ id, type, title, location, supports, reviewedOn: "2026-09-02" });
const representative = (id, label, kind, path, ownerGeographyId, role, sources) => Object.freeze({
  id,
  label,
  kind,
  path,
  ownerGeographyId,
  role,
  sources: Object.freeze(sources),
  confidence: "REVIEWED",
  reviewStatus: "APPROVED_FOR_EVIDENCE_FOUNDATION",
  availabilitySemantics: "REPRESENTATIVE_ONLY_NOT_AVAILABILITY",
  propertyVerification: PROPERTY_VERIFICATION,
});

const sources = Object.freeze({
  anaheimCanyonPlan: source(
    "anaheim-canyon-specific-plan",
    "OFFICIAL_PLANNING",
    "City of Anaheim — Anaheim Canyon Specific Plan",
    "https://www.anaheim.net/1073/Anaheim-Canyon",
    "Defined Anaheim Canyon boundary and its durable industrial/commercial planning identity."
  ),
  anaheimCanyonLandUse: source(
    "anaheim-canyon-land-use",
    "OFFICIAL_PLANNING",
    "City of Anaheim — Anaheim Canyon land-use documentation",
    "https://www.anaheim.net/DocumentCenter/View/66395/EAMPSS-FINAL-2023-Mar-01-with-Update-Addendum",
    "Industrial districts cover most of the planning area; commercial and mixed-use areas also exist and prevent treating every parcel as Industrial."
  ),
  anaheimBuildingRegistry: source(
    "rofo-anaheim-building-registry",
    "REPOSITORY_BUILDING_RECORD",
    "Rofo canonical Anaheim building registry",
    "data-sources/reference/company-buildings.json",
    "Canonical paths and Industrial classifications for the retained Anaheim representatives."
  ),
  coronadoOwnerRecord: source(
    "rexford-3071-coronado",
    "OWNER_PROPERTY_RECORD",
    "Rexford Industrial — 3071 Coronado Street",
    "https://www.rexfordindustrial.com/property/3071-coronado-street/",
    "Stable industrial and warehouse/distribution representative role; current availability and detailed capabilities are excluded."
  ),
  fullertonPlan: source(
    "fullerton-plan",
    "OFFICIAL_PLANNING",
    "City of Fullerton — The Fullerton Plan",
    "https://www.cityoffullerton.com/government/departments/community-and-economic-development/planning-zoning/general-plan/the-fullerton-plan-current-version",
    "Current municipal planning framework; used with parcel-level zoning rather than as a citywide Industrial claim."
  ),
  fullertonZoning: source(
    "fullerton-zoning-map-9",
    "OFFICIAL_ZONING",
    "City of Fullerton — Zoning Map 9",
    "https://www.cityoffullerton.com/home/showpublisheddocument/1542/637449029859970000",
    "Manufacturing Park and Manufacturing General concentrations around Orangethorpe, Raymond, and adjoining industrial streets."
  ),
  fullertonParcelEvidence: source(
    "fullerton-industrial-parcels",
    "OFFICIAL_ZONING",
    "City of Fullerton — official industrial parcel and zoning records",
    "https://www.cityoffullerton.com/home/showpublisheddocument/9946/638888809212970000",
    "Industrial and manufacturing zoning along Walnut, Truslow, Raymond, and portions of Orangethorpe."
  ),
  fullertonDevelopment: source(
    "fullerton-development-activity",
    "OFFICIAL_PLANNING",
    "City of Fullerton — Development Activity",
    "https://www.cityoffullerton.com/government/departments/community-and-economic-development/planning-zoning/development-activity",
    "Continued industrial-development evidence along Orangethorpe and near Raymond; not evidence of availability."
  ),
});

const common = Object.freeze({
  "anaheim-canyon": Object.freeze({
    geographyId: "anaheim-canyon",
    label: "Anaheim Canyon",
    municipality: "Anaheim",
    state: "CA",
    publicOwnerId: "oc-anaheim-canyon",
    path: "/commercial-real-estate/CA/anaheim/anaheim-canyon/",
    geographicThesis: "The City-defined Anaheim Canyon Specific Plan area, not Anaheim generally.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.anaheimCanyonPlan, sources.anaheimCanyonLandUse]),
    representatives: Object.freeze([
      representative("3071-e-coronado-st", "3071 E Coronado Street", "BUILDING", "/commercial-real-estate/building/CA/anaheim/3071-e-coronado-st/", "anaheim-canyon", "Conventional industrial and warehouse/distribution environment", [sources.anaheimBuildingRegistry, sources.coronadoOwnerRecord]),
      representative("5455-e-la-palma-ave", "5455 E La Palma Avenue — La Palma Distribution Center", "BUILDING", "/commercial-real-estate/building/CA/anaheim/5455-e-la-palma-ave/", "anaheim-canyon", "Industrial and manufacturing/distribution corridor environment", [sources.anaheimBuildingRegistry, sources.anaheimCanyonLandUse]),
    ]),
  }),
  "fullerton-industrial-service-area": Object.freeze({
    geographyId: "fullerton-industrial-service-area",
    label: "Fullerton Industrial / Service Area",
    municipality: "Fullerton",
    state: "CA",
    publicOwnerId: "oc-fullerton",
    path: "/commercial-real-estate/CA/fullerton/fullerton/",
    geographicThesis: "A bounded south/east Fullerton operating geography formed by the Orangethorpe industrial corridor and the Walnut–Truslow–Raymond manufacturing areas; it is not the entire City of Fullerton.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.fullertonPlan, sources.fullertonZoning, sources.fullertonParcelEvidence, sources.fullertonDevelopment]),
    representatives: Object.freeze([
      representative("fullerton-orangethorpe-industrial-corridor", "Orangethorpe Industrial Corridor", "COMMERCIAL_ENVIRONMENT", "/commercial-real-estate/CA/fullerton/fullerton/", "fullerton-industrial-service-area", "Industrial, commercial-manufacturing, and service-operating environment", [sources.fullertonZoning, sources.fullertonDevelopment]),
      representative("fullerton-walnut-raymond-manufacturing-area", "Walnut–Truslow–Raymond Manufacturing Area", "COMMERCIAL_ENVIRONMENT", "/commercial-real-estate/CA/fullerton/fullerton/", "fullerton-industrial-service-area", "Manufacturing-park, lighter industrial, and service-operating environment", [sources.fullertonZoning, sources.fullertonParcelEvidence]),
    ]),
  }),
});

const evidence = Object.freeze({
  industrial: Object.freeze({
    "anaheim-canyon": Object.freeze({
      traits: Object.freeze(["CONVENTIONAL_INDUSTRIAL", "WAREHOUSE_DISTRIBUTION", "LIGHT_MANUFACTURING", "CONTRACTOR_SERVICE", "OFFICE_WAREHOUSE"]),
      strengths: Object.freeze(["Defined industrial planning area with reviewed warehouse/distribution, light-manufacturing, and contractor/service context.", "Supports a broader conventional Industrial operating identity than the bounded Fullerton peer."]),
      tradeoffs: Object.freeze(["Commercial and mixed-use districts also exist within Anaheim Canyon; parcel-level fit cannot be inferred.", "Loading, truck circulation, power, yard, and other decisive capabilities require property investigation."]),
    }),
    "fullerton-industrial-service-area": Object.freeze({
      traits: Object.freeze(["LIGHTER_INDUSTRIAL", "CONTRACTOR_SERVICE", "SMALLER_FORMAT_WAREHOUSE", "OFFICE_WAREHOUSE"]),
      strengths: Object.freeze(["Officially mapped manufacturing and industrial areas support a bounded lighter-industrial and contractor/service operating identity.", "The corridor and manufacturing-area pattern supports smaller operating environments without treating Fullerton citywide as Industrial."]),
      tradeoffs: Object.freeze(["The evidence does not establish the same depth of conventional distribution or larger-format Industrial context as Anaheim Canyon.", "Individual building format and operating capability vary and require investigation."]),
    }),
  }),
  flex: Object.freeze({
    "anaheim-canyon": Object.freeze({
      traits: Object.freeze(["OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "LIGHT_PRODUCTION", "SHOWROOM_SERVICE_HYBRID"]),
      strengths: Object.freeze(["Reviewed Industrial context can support office/warehouse, service, and light-production Flex investigation."]),
      tradeoffs: Object.freeze(["Technical R&D identity and customer-facing suitability are not established area-wide."]),
    }),
    "fullerton-industrial-service-area": Object.freeze({
      traits: Object.freeze(["OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "LIGHTER_OPERATIONS", "SMALLER_FORMAT_FLEX"]),
      strengths: Object.freeze(["Bounded manufacturing and service corridors support investigation of smaller office/warehouse and lighter-operating Flex environments."]),
      tradeoffs: Object.freeze(["The evidence supports an operating format, not a specialized R&D or technical ecosystem."]),
    }),
  }),
  mixed: Object.freeze({
    "anaheim-canyon": Object.freeze({ traits: Object.freeze(["OFFICE_WAREHOUSE", "LIGHT_PRODUCTION", "CONTRACTOR_SERVICE"]), evidenceBoundary: "Industrial-led mixed uses only; customer-facing and office proportions remain property-specific." }),
    "fullerton-industrial-service-area": Object.freeze({ traits: Object.freeze(["OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "LIGHTER_OPERATIONS"]), evidenceBoundary: "Smaller-format operating mix only; precise office, storage, production, and customer components require investigation." }),
  }),
});

module.exports = Object.freeze({
  schemaVersion: "north-orange-county-industrial-flex-evidence-foundation:v1",
  scope: "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION",
  futureMarketId: "north-orange-county-industrial-flex",
  customerEntryPropertyType: "industrial_flex",
  evidenceCandidateIds: Object.freeze(["anaheim-canyon", "fullerton-industrial-service-area"]),
  candidates: common,
  evidence,
  representativeCount: 4,
  propertyVerification: PROPERTY_VERIFICATION,
  accessIntelligence: Object.freeze({ status: "INSUFFICIENT_FOR_RECOMMENDATION", limitation: ACCESS_LIMITATION }),
  futureEntryContext: Object.freeze({
    accepted: Object.freeze([
      { marketId: "anaheim", candidateGeographyId: null, treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "anaheim", candidateGeographyId: "anaheim-canyon", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "fullerton", candidateGeographyId: null, treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "fullerton", candidateGeographyId: "fullerton-industrial-service-area", treatment: "COMPARISON_CONTEXT_ONLY" },
    ]),
    rejectedMarketIds: Object.freeze(["orange-county", "irvine", "costa-mesa", "santa-ana", "lake-forest", "brea", "buena-park"]),
  }),
  legacyDisposition: Object.freeze({
    reviewedRecommendationEvidence: Object.freeze(["Official Anaheim Canyon planning boundary and industrial land-use identity.", "Canonical Industrial records for 3071 E Coronado Street and 5455 E La Palma Avenue.", "Official Fullerton manufacturing/industrial zoning in the bounded Orangethorpe and Walnut–Truslow–Raymond areas."]),
    calibrationHypothesis: Object.freeze(["Anaheim Canyon is the more conventional Industrial peer.", "Fullerton is the smaller-format contractor/service and office/warehouse peer."]),
    publicEditorialContext: Object.freeze(["Existing Orange County Compass prose and Fullerton generic representative cards may orient later review but are not evidence records."]),
    rejectedForLevel3: Object.freeze(["Legacy confidence values and compass_ready_editorial_developing status.", "Ordinal loading, truck-access, parking, power, clear-height, yard, and freeway ratings.", "2671 La Palma Avenue as Industrial evidence because the canonical repository record classifies it as Retail.", "Unresolved Fullerton building descriptions without canonical property paths.", "Generated comparison prose and keyword-priority scenario outcomes."]),
  }),
});
