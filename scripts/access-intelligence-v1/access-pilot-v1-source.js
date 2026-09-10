const reviewedOn = "2026-09-10";

const sources = [
  ["bart-montgomery", "BART: Montgomery St. Station", "https://www.bart.gov/stations/mont", "Bay Area Rapid Transit"],
  ["bart-stations", "BART station directory", "https://www.bart.gov/stations", "Bay Area Rapid Transit"],
  ["sfmta-t-third", "SFMTA: T Third Street", "https://www.sfmta.com/routes/t-third-street", "San Francisco Municipal Transportation Agency"],
  ["sf-planning-railyards", "SF Railyards Planning Program", "https://sfplanning.org/project/sf-railyards-planning-program", "San Francisco Planning"],
  ["sacrt-power-inn", "SacRT: Power Inn station", "https://www.sacrt.com/station/power-inn/", "Sacramento Regional Transit District"],
  ["sacramento-power-inn", "City of Sacramento: Power Inn Area PBID", "https://www.cityofsacramento.gov/finance/infrastructure-finance/special-districts/annual-service-districts", "City of Sacramento"],
  ["ind-airport-directions", "Indianapolis International Airport driving directions", "https://www.ind.com/maps-directions/driving-directions", "Indianapolis Airport Authority"],
  ["phx-airport-directions", "Phoenix Sky Harbor maps and directions", "https://www.skyharbor.com/maps-directions/", "City of Phoenix Aviation Department"],
  ["seattle-freight", "Seattle Freight Access Project, Chapter 2", "https://www.seattle.gov/documents/departments/sdot/freightprogram/fapreportchapter2.pdf", "Seattle Department of Transportation and Port of Seattle"],
  ["sound-sodo", "Sound Transit Link station directory", "https://www.soundtransit.org/ride-with-us/stations/link-light-rail-stations", "Sound Transit"],
  ["seattle-industrial", "Seattle Industrial and Maritime Strategy", "https://www.seattle.gov/planning-and-community-development/current-projects/industrial-and-maritime-strategy", "City of Seattle"]
].map(([id, title, url, publisher]) => ({ id, title, url, publisher, sourceType: "AUTHORITATIVE_PUBLIC_SOURCE", reviewedOn }));

const fact = (id, disposition, category, label, relationship, measurementType, sourceIds, usefulness, priorState, propertyTypes, notes = null) => ({
  id, priorState, disposition, usefulnessClass: disposition === "SELECT_PUBLIC_USEFUL" ? "PUBLIC_USEFUL" : disposition,
  level: "OBJECTIVE_ACCESS_FACT", category, customerLabel: label, customerRelationship: relationship,
  measurementType, sourceIds, propertyTypes, reviewDate: reviewedOn, publicDistanceEligible: false,
  interpretationEligibility: false, personalizedConclusionEligible: false, notes
});

const pilots = [
  {
    marketId: "san-francisco", municipality: "San Francisco", state: "CA", geographyId: "financial-district", geographyLabel: "Financial District",
    referencePoint: { method: "DESCRIPTIVE_RELATIONSHIP_ONLY", coordinates: null, publicDistanceEligible: false, rationale: "Station presence is stronger than distance for a downtown district with multiple accepted edges." },
    readiness: "READY_WITH_NON_DISTANCE_FACTS_ONLY",
    facts: [
      fact("sf-fidi-bart", "SELECT_PUBLIC_USEFUL", "RAIL_TRANSIT", "BART", "Montgomery St. Station is in the Financial District; Embarcadero Station serves its eastern side.", "TRANSIT_SERVICE_PRESENT", ["bart-montgomery", "bart-stations"], "Shows regional rail presence without implying a uniform walk distance.", "OBJECTIVE_ACCESS_READY", ["office","retail"]),
      fact("sf-fidi-muni", "SELECT_PUBLIC_USEFUL", "RAIL_TRANSIT", "Muni Metro", "Muni Metro shares the Market Street stations at Montgomery and Embarcadero.", "TRANSIT_SERVICE_PRESENT", ["bart-montgomery"], "Distinguishes local rail from BART while keeping one concise row.", "NEW_REVIEWED_DERIVATION", ["office","retail"]),
      fact("sf-fidi-waterfront", "TRUE_BUT_LOW_VALUE", "LOCAL_ORIENTATION", "Embarcadero", "The district meets the Embarcadero waterfront.", "CORRIDOR_RELATIONSHIP", ["bart-stations"], "True orientation, but less useful than the two rail facts for the Office pilot.", "OBJECTIVE_ACCESS_READY", ["office","retail"])
    ]
  },
  {
    marketId: "san-francisco", municipality: "San Francisco", state: "CA", geographyId: "soma", geographyLabel: "SoMa",
    referencePoint: { method: "DESCRIPTIVE_RELATIONSHIP_ONLY", coordinates: null, publicDistanceEligible: false, rationale: "SoMa is broad; one point would misleadingly imply uniform access." },
    readiness: "READY_WITH_NON_DISTANCE_FACTS_ONLY",
    facts: [
      fact("sf-soma-rail", "SELECT_PUBLIC_USEFUL", "RAIL_TRANSIT", "Regional rail", "BART serves SoMa's Market Street edge, while Caltrain's San Francisco terminal sits at 4th and King.", "TRANSIT_SERVICE_PRESENT", ["bart-stations", "sf-planning-railyards"], "Explains that different parts of broad SoMa connect to different regional rail systems.", "OBJECTIVE_ACCESS_READY", ["office","flex"]),
      fact("sf-soma-muni", "SELECT_PUBLIC_USEFUL", "RAIL_TRANSIT", "Muni Metro", "Muni Metro serves the Market Street and Fourth Street sides of SoMa.", "TRANSIT_SERVICE_PRESENT", ["sfmta-t-third"], "Adds local rail orientation without a false point distance.", "OBJECTIVE_ACCESS_READY", ["office","flex"]),
      fact("sf-soma-i80", "KEEP_REVIEW", "ROAD", "I-80", "I-80 enters San Francisco on SoMa's eastern side.", "CORRIDOR_RELATIONSHIP", [], "Potentially useful, but the current source registry does not establish the governed SoMa edge precisely enough.", "SOURCE_AVAILABLE_NEEDS_REVIEW", ["office","industrial","flex"])
    ]
  },
  {
    marketId: "san-francisco", municipality: "San Francisco", state: "CA", geographyId: "mission-bay", geographyLabel: "Mission Bay",
    referencePoint: { method: "REVIEWED_CORRIDOR_REFERENCE", coordinates: null, publicDistanceEligible: false, rationale: "Third Street is an authoritative transit spine through Mission Bay; no point distance is needed." },
    readiness: "READY_WITH_NON_DISTANCE_FACTS_ONLY",
    facts: [
      fact("sf-mb-muni", "SELECT_PUBLIC_USEFUL", "RAIL_TRANSIT", "T Third", "T Third light rail runs through Mission Bay along Third Street.", "TRANSIT_SERVICE_PRESENT", ["sfmta-t-third"], "Directly explains the district's local rail spine.", "OBJECTIVE_ACCESS_READY", ["office"]),
      fact("sf-mb-caltrain", "PROMOTE_TO_OBJECTIVE_ACCESS_READY", "RAIL_TRANSIT", "Caltrain", "The 4th and King terminal sits at the north edge of Mission Bay.", "ADJACENT_TO_GEOGRAPHY", ["sf-planning-railyards"], "Adds a defensible regional rail relationship without a mileage claim.", "SOURCE_AVAILABLE_NEEDS_REVIEW", ["office"]),
      fact("sf-mb-freeway", "NEEDS_MORE_REVIEW", "ROAD", "I-280 / US-101", "Freeways connect near Mission Bay's western and southern approaches.", "CORRIDOR_RELATIONSHIP", [], "Too generalized for publication without a reviewed boundary-to-road relationship.", "NEW_CANDIDATE", ["office","flex"])
    ]
  },
  {
    marketId: "sacramento", municipality: "Sacramento", state: "CA", geographyId: "power-inn-industrial", geographyLabel: "Power Inn Industrial",
    referencePoint: { method: "REVIEWED_CORRIDOR_REFERENCE", coordinates: null, publicDistanceEligible: false, rationale: "City evidence defines the commercial and industrial corridor along Power Inn Road." },
    readiness: "READY_WITH_NON_DISTANCE_FACTS_ONLY",
    facts: [
      fact("sac-power-corridor", "SELECT_PUBLIC_USEFUL", "ROAD", "Power Inn Road", "The commercial and industrial area is organized along Power Inn Road.", "CORRIDOR_RELATIONSHIP", ["sacramento-power-inn"], "Names the roadway that defines the district rather than an arbitrary point.", "NEW_REVIEWED_DERIVATION", ["industrial","flex"]),
      fact("sac-power-rail", "SELECT_PUBLIC_USEFUL", "RAIL_TRANSIT", "SacRT Gold Line", "Power Inn station serves the corridor on SacRT's Gold Line.", "TRANSIT_SERVICE_PRESENT", ["sacrt-power-inn"], "Shows a durable rail relationship that is unusual and useful for an industrial district.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"]),
      fact("sac-power-us50", "KEEP_REVIEW", "ROAD", "US 50", "US 50 is a regional freeway relationship for the wider Power Inn area.", "CORRIDOR_RELATIONSHIP", [], "Likely useful, but the current reviewed sources do not bound the relationship precisely enough for customer copy.", "SOURCE_AVAILABLE_NEEDS_REVIEW", ["industrial","flex"])
    ]
  },
  {
    marketId: "indianapolis", municipality: "Indianapolis", state: "IN", geographyId: "indianapolis-airport-logistics", geographyLabel: "Indianapolis Airport Logistics",
    referencePoint: { method: "DESCRIPTIVE_RELATIONSHIP_ONLY", coordinates: null, publicDistanceEligible: false, rationale: "The governed geography is an airport-side operating area, not a reviewed polygon or point." },
    readiness: "READY_WITH_NON_DISTANCE_FACTS_ONLY",
    facts: [
      fact("indy-air-airport", "SELECT_PUBLIC_USEFUL", "AIRPORT", "Indianapolis International Airport", "The district adjoins the Indianapolis airport area.", "ADJACENT_TO_GEOGRAPHY", ["ind-airport-directions"], "The airport relationship is the defining orientation fact.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"]),
      fact("indy-air-i70", "SELECT_PUBLIC_USEFUL", "ROAD", "I-70", "I-70 serves the airport/logistics area at Exit 68.", "CORRIDOR_RELATIONSHIP", ["ind-airport-directions"], "Provides a reproducible road relationship without ranking logistics performance.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"]),
      fact("indy-air-i465", "TRUE_BUT_LOW_VALUE", "ROAD", "I-465", "I-465 connects with I-70 east of the airport exit.", "CORRIDOR_RELATIONSHIP", ["ind-airport-directions"], "Accurate context but repetitive beside the more direct I-70 fact.", "NEW_REVIEWED_DERIVATION", ["industrial","flex"])
    ]
  },
  {
    marketId: "phoenix", municipality: "Phoenix", state: "AZ", geographyId: "airport-south-central-industrial", geographyLabel: "Airport / South Central",
    referencePoint: { method: "DESCRIPTIVE_RELATIONSHIP_ONLY", coordinates: null, publicDistanceEligible: false, rationale: "The area spans multiple airport-side corridors and lacks a reviewed public measurement point." },
    readiness: "READY_WITH_NON_DISTANCE_FACTS_ONLY",
    facts: [
      fact("phx-air-airport", "SELECT_PUBLIC_USEFUL", "AIRPORT", "Phoenix Sky Harbor", "The district borders the City of Phoenix airport area.", "ADJACENT_TO_GEOGRAPHY", ["phx-airport-directions"], "States the defining airport relationship without importing Tempe or claiming performance.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"]),
      fact("phx-air-i10", "SELECT_PUBLIC_USEFUL", "ROAD", "I-10", "I-10 connects to Sky Harbor Boulevard on the district's airport side.", "CORRIDOR_RELATIONSHIP", ["phx-airport-directions"], "Provides the clearest official freeway relationship.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"]),
      fact("phx-air-transit", "NEEDS_MORE_REVIEW", "RAIL_TRANSIT", "Valley Metro Rail", "Rail connects with the PHX Sky Train at 44th Street.", "TRANSIT_SERVICE_PRESENT", ["phx-airport-directions"], "True for the airport, but not yet reviewed as service for the full Airport / South Central geography.", "NEW_CANDIDATE", ["industrial","flex"])
    ]
  },
  {
    marketId: "seattle", municipality: "Seattle", state: "WA", geographyId: "sodo-duwamish", geographyLabel: "SODO / Greater Duwamish",
    referencePoint: { method: "DESCRIPTIVE_RELATIONSHIP_ONLY", coordinates: null, publicDistanceEligible: false, rationale: "Greater Duwamish is a large industrial center; infrastructure-within-area facts are more honest than one reference point." },
    readiness: "READY_WITH_NON_DISTANCE_FACTS_ONLY",
    facts: [
      fact("sea-sodo-port", "SELECT_PUBLIC_USEFUL", "PORT_FREIGHT", "Port and freight infrastructure", "Port terminals, freight rail and industrial infrastructure occupy the Greater Duwamish area.", "WITHIN_GEOGRAPHY", ["seattle-freight", "seattle-industrial"], "Explains the area's defining freight and maritime role.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"]),
      fact("sea-sodo-road", "SELECT_PUBLIC_USEFUL", "ROAD", "I-5 and I-90", "Both interstates have access points within the Greater Duwamish industrial center.", "WITHIN_GEOGRAPHY", ["seattle-freight"], "Gives a precise, official road relationship without claiming distribution superiority.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"]),
      fact("sea-sodo-link", "SELECT_PUBLIC_USEFUL", "RAIL_TRANSIT", "Link light rail", "SODO Station serves the northern part of the district.", "TRANSIT_SERVICE_PRESENT", ["sound-sodo"], "Adds a distinct passenger-transit dimension and avoids implying service throughout the broad area.", "OBJECTIVE_ACCESS_READY", ["industrial","flex"])
    ]
  }
];

module.exports = { schemaVersion: "access-intelligence-pilot-review:v1", reviewedOn, sources, pilots };
